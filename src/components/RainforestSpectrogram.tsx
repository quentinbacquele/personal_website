import { useCallback, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import SpectrogramKey from './SpectrogramKey';
import { fetchRainforestAudio } from '../lib/rainforestAudio';

const FREQUENCY_BINS = 256;
const HISTORY_LENGTH = 256;
const TIME_SPAN = 80;
const FREQ_SPAN = 80;
const ROW_BYTE_SIZE = FREQUENCY_BINS * 4;
// Room kept around the plot, in CSS pixels, so the axis labels never touch the box edge.
const FIT_MARGIN_PX = 22;
const AXIS_COLOR = 0x2a2d2a; // ink, for axes drawn on the paper page

// Analyser configuration to ensure consistency between simulated and live modes
const MIN_DECIBELS = -90;
const MAX_DECIBELS = -15;
const SMOOTHING_CONSTANT = 0.15;
const LOW_FREQUENCY_CUTOFF_HZ = 200;
const FREQUENCY_SMOOTH_KERNEL = [0.03, 0.08, 0.15, 0.18, 0.15, 0.08, 0.03];
const FREQUENCY_SMOOTH_MIX = 0.9;
const TEMPORAL_SMOOTHING = 0.7;


// One frame's spectrum by radix-2 FFT, with the same Hann window and result as a direct DFT
// but about 400 times cheaper, so it fits easily in every animation frame.
const FFT_SIZE = 2048;
const FFT_BITS = 11;
const HANN = Float32Array.from({ length: FFT_SIZE }, (_, n) => 0.5 * (1 - Math.cos((2 * Math.PI * n) / (FFT_SIZE - 1))));
const BIT_REVERSED = Uint16Array.from({ length: FFT_SIZE }, (_, i) => {
  let reversed = 0;
  for (let b = 0; b < FFT_BITS; b++) reversed = (reversed << 1) | ((i >> b) & 1);
  return reversed;
});
const TWIDDLE_COS = Float64Array.from({ length: FFT_SIZE / 2 }, (_, k) => Math.cos((2 * Math.PI * k) / FFT_SIZE));
const TWIDDLE_SIN = Float64Array.from({ length: FFT_SIZE / 2 }, (_, k) => Math.sin((2 * Math.PI * k) / FFT_SIZE));
const fftReal = new Float64Array(FFT_SIZE);
const fftImag = new Float64Array(FFT_SIZE);

function fftFrame(samples: Float32Array, start: number) {
  for (let i = 0; i < FFT_SIZE; i++) {
    fftReal[BIT_REVERSED[i]] = samples[start + i] * HANN[i];
    fftImag[BIT_REVERSED[i]] = 0;
  }
  for (let size = 2; size <= FFT_SIZE; size <<= 1) {
    const half = size >> 1;
    const step = FFT_SIZE / size;
    for (let i = 0; i < FFT_SIZE; i += size) {
      for (let j = 0; j < half; j++) {
        const wr = TWIDDLE_COS[j * step];
        const wi = -TWIDDLE_SIN[j * step];
        const a = i + j;
        const b = a + half;
        const tr = fftReal[b] * wr - fftImag[b] * wi;
        const ti = fftReal[b] * wi + fftImag[b] * wr;
        fftReal[b] = fftReal[a] - tr;
        fftImag[b] = fftImag[a] - ti;
        fftReal[a] += tr;
        fftImag[a] += ti;
      }
    }
  }
}

// One history row per animation frame; used to rebuild the rows the plot would already show.
const FRAME_SECONDS = 1 / 60;

const vertexShader = `
  precision mediump float;

  varying vec2 vUv;
  varying float vIntensity;

  uniform float u_amplitude;
  uniform sampler2D u_spectrogram;

  void main() {
    vUv = uv;

    float intensity = texture2D(u_spectrogram, vec2(vUv.x, vUv.y)).r;
    vIntensity = intensity;

    // Use a higher exponent (1.2) to flatten the noise floor height
    float height = pow(intensity, 1.2) * u_amplitude;
    // Lower offset to -12.0 to ensure noise floor sits at/below axis
    vec3 displacedPosition = vec3(position.x, height - 12.0, position.y);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(displacedPosition, 1.0);
  }
`;

const fragmentShader = `
  precision mediump float;

  varying vec2 vUv;
  varying float vIntensity;

  // Custom colormap: dark navy/blue floor → blue/cyan/lime mids → warm yellow/orange/red highs
  vec3 focusedGradient(float t) {
    // Piecewise power curve: suppress lows, aggressively boost mids/highs
    float base = clamp((t - 0.05) / 0.95, 0.0, 1.0);

    // Keep low amplitudes dark with subtle gradient, then run turbo colormap from medium to max
    float energy;
    if (base < 0.22) {
      // Suppress low amplitudes more: compress 0-0.22 → 0-0.08 with steeper curve
      energy = pow(base / 0.22, 2.0) * 0.08;
    } else {
      // EXTREMELY AGGRESSIVELY map medium-high to 0.08-1.0 range to reach full spectrum including red
      energy = 0.08 + pow((base - 0.22) / 0.78, 0.24) * 0.92;
    }

    // California mid-century modern: deep navy → teal → turquoise → sage → mustard → terracotta → rust
    // Original turbo (commented for reverting):
    // vec3(0.01, 0.02, 0.08), vec3(0.08, 0.20, 0.45), vec3(0.15, 0.40, 0.75),
    // vec3(0.10, 0.65, 0.88), vec3(0.20, 0.85, 0.55), vec3(0.50, 0.95, 0.30),
    // vec3(0.95, 0.90, 0.25), vec3(1.00, 0.60, 0.10), vec3(0.90, 0.20, 0.10)

    vec3 stop0 = vec3(0.06, 0.20, 0.22);  // quietest: deep blue-green, so silence stays visible on the paper page
    vec3 stop1 = vec3(0.10, 0.36, 0.42);  // quiet: dark teal
    vec3 stop2 = vec3(0.12, 0.48, 0.55);  // bright teal
    vec3 stop3 = vec3(0.18, 0.65, 0.72);  // vivid cyan (extended blue)
    vec3 stop4 = vec3(0.25, 0.70, 0.60);  // cyan-green (still blue-ish)
    vec3 stop5 = vec3(0.42, 0.75, 0.48);  // cool green
    vec3 stop6 = vec3(0.70, 0.82, 0.38);  // lime/yellow-green
    vec3 stop7 = vec3(0.98, 0.60, 0.18);  // bright orange
    vec3 stop8 = vec3(0.72, 0.18, 0.12);  // dark red/burgundy

    vec3 color;
    // Low frequencies: gradient from super dark blue down (0.0 - 0.10)
    if (energy < 0.10) {
      float m = smoothstep(0.0, 0.10, energy);
      color = mix(stop0, stop1, m);  // darkest → dark blue (continuous with turbo start)
    }
    // Turbo ramp: blue → cyan → green → yellow → orange → red (0.10+)
    else if (energy < 0.20) {
      float m = smoothstep(0.10, 0.20, energy);
      color = mix(stop1, stop2, m);  // continue from stop1
    } else if (energy < 0.32) {
      float m = smoothstep(0.20, 0.32, energy);
      color = mix(stop2, stop3, m);
    } else if (energy < 0.45) {
      float m = smoothstep(0.32, 0.45, energy);
      color = mix(stop3, stop4, m);
    } else if (energy < 0.55) {
      float m = smoothstep(0.45, 0.55, energy);
      color = mix(stop4, stop5, m);
    } else if (energy < 0.60) {
      float m = smoothstep(0.52, 0.60, energy);
      color = mix(stop5, stop6, m);
    } else if (energy < 0.68) {
      float m = smoothstep(0.60, 0.68, energy);
      color = mix(stop6, stop7, m);
    } else if (energy < 0.78) {
      float m = smoothstep(0.68, 0.78, energy);
      color = mix(stop7, stop8, m);
    }
    // Keep highest peaks at red (0.78 - 1.0)
    else {
      color = stop8;
    }

    // Subtle peak highlight
    float peakBoost = pow(max(energy - 0.88, 0.0), 2.0) * 0.10;
    color += vec3(peakBoost * 0.8, peakBoost * 0.3, peakBoost * 0.2);

    return clamp(color, 0.0, 1.0);
  }

  void main() {
    float normalized = clamp(vIntensity, 0.0, 1.0);
    vec3 color = focusedGradient(normalized);
    gl_FragColor = vec4(color, 1.0);
  }
`;

type RainforestSpectrogramProps = {
  // The plot box and the key (sound control and colour scale) are returned side by side,
  // so the page can place each one in its own grid cell.
  plotClassName?: string;
  keyClassName?: string;
};

export default function RainforestSpectrogram({
  plotClassName = '',
  keyClassName = '',
}: RainforestSpectrogramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const spectrogramTextureRef = useRef<THREE.DataTexture | null>(null);
  const audioReadyRef = useRef(false);
  
  // Store previous frame's data for smoothing in simulation mode
  const prevFrequencyDataRef = useRef<Float32Array | null>(null);
  const normalizedBinsRef = useRef<Float32Array>(new Float32Array(FREQUENCY_BINS));
  const smoothedRowRef = useRef<Float32Array>(new Float32Array(FREQUENCY_BINS));
  const hasSmoothedRowRef = useRef(false);
  const rendererStateRef = useRef<{
    renderer?: THREE.WebGLRenderer;
    camera?: THREE.OrthographicCamera;
    uniforms?: {
      u_amplitude: { value: number };
      u_spectrogram: { value: THREE.DataTexture };
    };
    axisPoints?: {
      time: { anchor: THREE.Vector3; direction: THREE.Vector3 };
      freq: { anchor: THREE.Vector3; direction: THREE.Vector3 };
      amp: { anchor: THREE.Vector3; direction: THREE.Vector3 };
    };
  }>({});

  const animationRef = useRef<number | undefined>(undefined);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  const timeLabelRef = useRef<HTMLSpanElement>(null);
  const freqLabelRef = useRef<HTMLSpanElement>(null);
  const ampLabelRef = useRef<HTMLSpanElement>(null);
  const isStartedRef = useRef(false);

  const [isMuted, setIsMuted] = useState(true);

  // The spectrum at a given moment of the loop, computed from the decoded audio rather than the
  // analyser, so the plot moves whether or not sound is playing.
  const computeFrequencyData = useCallback((buffer: AudioBuffer, targetArray: Uint8Array, time: number) => {
    const duration = buffer.duration;
    // Wrapped into [0, duration): rebuilding the history right after load asks for moments before zero.
    const offset = ((time % duration) + duration) % duration;
    const sampleRate = buffer.sampleRate;
    const startIndex = Math.floor(offset * sampleRate);
    const fftSize = FFT_SIZE;
    const channelData = buffer.getChannelData(0); // Use first channel
    
    // Initialize smoothed data storage if needed
    if (!prevFrequencyDataRef.current) {
      prevFrequencyDataRef.current = new Float32Array(targetArray.length);
    }
    const prevData = prevFrequencyDataRef.current;
    
    // Safety check
    if (startIndex + fftSize >= channelData.length) return;

    const binCount = Math.min(FREQUENCY_BINS, targetArray.length);
    const rangeScaleFactor = 255 / (MAX_DECIBELS - MIN_DECIBELS);
    const binResolutionHz = sampleRate / fftSize;
    const cutoffBin = Math.min(
      binCount,
      Math.ceil(LOW_FREQUENCY_CUTOFF_HZ / binResolutionHz)
    );

    if (cutoffBin > 0) {
      targetArray.fill(0, 0, cutoffBin);
      prevData.fill(0, 0, cutoffBin);
    }

    fftFrame(channelData, startIndex);

    for (let k = cutoffBin; k < binCount; k++) {
      const magnitude = Math.sqrt(fftReal[k] * fftReal[k] + fftImag[k] * fftImag[k]);
      
      // Normalize (Analysers typically scale by 1/N)
      // We add a small epsilon to avoid log(0)
      const normalized = magnitude / fftSize + 1e-10;
      
      // Convert to dB
      const db = 20 * Math.log10(normalized);
      
      // Map to 0-255 range
      let byteValue = (db - MIN_DECIBELS) * rangeScaleFactor;
      byteValue = Math.max(0, Math.min(255, byteValue));

      // Apply Smoothing
      // value = prev * smoothing + curr * (1 - smoothing)
      const smoothedValue = prevData[k] * SMOOTHING_CONSTANT + byteValue * (1 - SMOOTHING_CONSTANT);
      prevData[k] = smoothedValue;
      
      targetArray[k] = smoothedValue;
    }
  }, []);

  const updateSpectrogram = useCallback((time: number = performance.now() / 1000) => {
    const dataArray = dataArrayRef.current;
    const texture = spectrogramTextureRef.current;

    if (!dataArray || !texture) {
      return;
    }

    // Use the texture's data array directly to ensure updates are visible
    const spectrogramData = texture.image?.data as Uint8Array | null;
    if (!spectrogramData) return;
    const normalizedBins = normalizedBinsRef.current;
    const smoothedRow = smoothedRowRef.current;
    const hasPrevRow = hasSmoothedRowRef.current;
    // Always use software analysis (Visual Playback) to ensure perfect consistency
    // regardless of whether the audio context is running, suspended, or transitioning.
    // This prevents visual glitches ("cuts") when the user interacts.
    if (audioBufferRef.current) {
      computeFrequencyData(audioBufferRef.current, dataArray, time);
    }

    spectrogramData.copyWithin(
      ROW_BYTE_SIZE,
      0,
      spectrogramData.length - ROW_BYTE_SIZE
    );

    const usableBins = Math.min(FREQUENCY_BINS, dataArray.length);

    // Normalize data in a separate buffer for spatial smoothing
    for (let i = 0; i < FREQUENCY_BINS; i++) {
      const magnitude = i < usableBins ? dataArray[i] : 0;
      normalizedBins[i] = Math.pow(magnitude / 255, 0.7);
    }

    const kernel = FREQUENCY_SMOOTH_KERNEL;
    const kernelRadius = Math.floor(kernel.length / 2);

    // Apply kernel smoothing before writing to the texture
    for (let i = 0; i < FREQUENCY_BINS; i++) {
      let smoothed = 0;
      for (let k = 0; k < kernel.length; k++) {
        let index = i + (k - kernelRadius);
        if (index < 0) index = 0;
        if (index >= FREQUENCY_BINS) index = FREQUENCY_BINS - 1;
        smoothed += normalizedBins[index] * kernel[k];
      }

      const blendedFreq =
        normalizedBins[i] * (1 - FREQUENCY_SMOOTH_MIX) +
        smoothed * FREQUENCY_SMOOTH_MIX;

      const finalValue = hasPrevRow
        ? smoothedRow[i] * TEMPORAL_SMOOTHING +
          blendedFreq * (1 - TEMPORAL_SMOOTHING)
        : blendedFreq;

      smoothedRow[i] = finalValue;

      // Flip frequency axis: low frequencies at bottom, high at top
      const pixelIndex = (FREQUENCY_BINS - 1 - i) * 4;
      spectrogramData[pixelIndex] = finalValue * 255;
      spectrogramData[pixelIndex + 1] = Math.pow(finalValue, 0.9) * 255;
      spectrogramData[pixelIndex + 2] = 200 + finalValue * 55;
      spectrogramData[pixelIndex + 3] = 255;
    }

    hasSmoothedRowRef.current = true;

    texture.needsUpdate = true;
  }, [computeFrequencyData]);

  const updateAxisLabels = useCallback(() => {
    const camera = rendererStateRef.current.camera;
    const axisPoints = rendererStateRef.current.axisPoints;
    const container = containerRef.current;

    if (!camera || !axisPoints || !container) {
      return;
    }

    const projectPoint = (point: THREE.Vector3) => {
      const projected = point.clone().project(camera);
      return {
        x: (projected.x * 0.5 + 0.5) * container.clientWidth,
        y: (-projected.y * 0.5 + 0.5) * container.clientHeight,
      };
    };

    const placeLabel = (
      element: HTMLSpanElement | null,
      axis: { anchor: THREE.Vector3; direction: THREE.Vector3 },
      options?: {
        rotationOffset?: number;
        alignWithAxis?: boolean;
        reverseDirection?: boolean;
      }
    ) => {
      if (!element) return;
      const anchorCoords = projectPoint(axis.anchor);
      const rotationOffset = options?.rotationOffset ?? 0;
      const shouldAlign = (options?.alignWithAxis ?? true) && axis.direction.lengthSq() > 0;
      let rotation = rotationOffset;

      if (shouldAlign) {
        const alignDirection = axis.direction
          .clone()
          .multiplyScalar(options?.reverseDirection ? -1 : 1)
          .normalize();
        const directionStep = alignDirection.multiplyScalar(10);
        const directionCoords = projectPoint(axis.anchor.clone().add(directionStep));
        const dx = directionCoords.x - anchorCoords.x;
        const dy = directionCoords.y - anchorCoords.y;

        rotation = (Math.atan2(dy, dx) * 180) / Math.PI + rotationOffset;
        if (rotation > 90) rotation -= 180;
        if (rotation < -90) rotation += 180;
      }

      element.style.transform = `translate(${anchorCoords.x}px, ${anchorCoords.y}px) translate(-50%, -50%) rotate(${rotation}deg)`;
      element.style.opacity = '1';
    };

    placeLabel(freqLabelRef.current, axisPoints.freq);
    placeLabel(timeLabelRef.current, axisPoints.time, { reverseDirection: true });
    placeLabel(ampLabelRef.current, axisPoints.amp, { reverseDirection: true });
  }, []);

  const startAudioSource = useCallback(() => {
    const ctx = audioContextRef.current;
    const buffer = audioBufferRef.current;
    const analyser = analyserRef.current;

    if (!ctx || !buffer || !analyser || audioSourceRef.current) return;

    try {
      const bufferSource = ctx.createBufferSource();
      bufferSource.buffer = buffer;
      bufferSource.loop = true;
      bufferSource.connect(analyser);

      // Sync start time with the visual clock to avoid jumps
      const time = performance.now() / 1000;
      const duration = buffer.duration;
      const offset = time % duration;

      bufferSource.start(0, offset);
      audioSourceRef.current = bufferSource;
      audioReadyRef.current = true;
    } catch (error) {
      console.error('Failed to start audio source', error);
    }
  }, []);

  // Initialize Audio Context and stream the rainforest loop through Web Audio directly
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioContextClass();
    audioContextRef.current = ctx;

    const analyser = ctx.createAnalyser();
    analyser.fftSize = 2048;
    analyser.smoothingTimeConstant = SMOOTHING_CONSTANT;
    analyser.minDecibels = MIN_DECIBELS;
    analyser.maxDecibels = MAX_DECIBELS;
    analyserRef.current = analyser;

    const gainNode = ctx.createGain();
    gainNode.gain.value = 0; // Muted until the visitor presses the sound button
    gainNodeRef.current = gainNode;

    analyser.connect(gainNode);
    gainNode.connect(ctx.destination);

    // Initialize data arrays
    dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);

    let cancelled = false;

    const loadAudioBuffer = async () => {
      try {
        const bytes = await fetchRainforestAudio();
        if (cancelled) return;
        // Decode a copy: decoding takes ownership of its input, and the download is shared.
        const audioBuffer = await ctx.decodeAudioData(bytes.slice(0));
        if (cancelled) return;
        audioBufferRef.current = audioBuffer;

        if (audioContextRef.current?.state === 'running' && isStartedRef.current && !audioSourceRef.current) {
          startAudioSource();
        }
      } catch (error) {
        if (cancelled) return;
        console.error('Failed to load rainforest audio', error);
      }
    };

    loadAudioBuffer();

    const userGestureEvents: Array<keyof DocumentEventMap> = [
      'click',
      'touchstart',
      'keydown',
      'mousedown',
    ];

    const manageGestureListeners = (
      action: 'add' | 'remove',
      handler: (event: Event) => void
    ) => {
      userGestureEvents.forEach((eventName) => {
        if (action === 'add') {
          document.addEventListener(eventName, handler);
        } else {
          document.removeEventListener(eventName, handler);
        }
      });
    };

    const resumeContext: EventListener = () => {
      const ctxInstance = audioContextRef.current;
      if (!ctxInstance) {
        return;
      }

      isStartedRef.current = true;

      const resumePromise =
        ctxInstance.state === 'suspended'
          ? ctxInstance.resume()
          : Promise.resolve();

      resumePromise
        .then(() => {
          if (audioContextRef.current?.state === 'running') {
            startAudioSource();
            manageGestureListeners('remove', resumeContext);
          }
        })
        .catch((err) => {
          console.warn('Unable to automatically start audio context:', err);
        });
    };

    manageGestureListeners('add', resumeContext);

    return () => {
      cancelled = true;
      manageGestureListeners('remove', resumeContext);
      if (audioSourceRef.current) {
        try {
          audioSourceRef.current.stop();
        } catch (_) {}
        audioSourceRef.current.disconnect();
        audioSourceRef.current = null;
      }
      if (gainNodeRef.current) {
        gainNodeRef.current.disconnect();
        gainNodeRef.current = null;
      }
      if (analyserRef.current) {
        analyserRef.current.disconnect();
        analyserRef.current = null;
      }
      dataArrayRef.current = null;
      audioBufferRef.current = null;
      audioReadyRef.current = false;
      isStartedRef.current = false;
      if (ctx.state !== 'closed') {
        ctx.close().catch(() => {});
      }
      audioContextRef.current = null;
    };
  }, [startAudioSource]);

  // Toggle Mute
  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);

    if (gainNodeRef.current && audioContextRef.current) {
       const now = audioContextRef.current.currentTime;
       gainNodeRef.current.gain.setTargetAtTime(newMuted ? 0 : 1, now, 0.1);
    }

    if (!newMuted && audioContextRef.current?.state === 'suspended') {
      audioContextRef.current.resume()
        .then(() => {
          startAudioSource();
        })
        .catch(() => {});
    }
  };

  // Initialize Three.js Scene
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas || typeof window === 'undefined') {
      return;
    }
    
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      canvas,
    });
    // Cap pixel ratio: on retina/mobile devicePixelRatio can be 3, which quadruples
    // fragment-shader work for no visible benefit on this scene. Cap at 2.
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020409, 0.002);

    // The frustum is set by resize(), which fits it to the plot.
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 500);
    camera.position.set(115, 95, 115);
    camera.lookAt(40, 0, 40);
    camera.updateMatrixWorld();

    const ambient = new THREE.AmbientLight(0xffffff, 0.55);
    const keyLight = new THREE.DirectionalLight(0xffffff, 0.85);
    keyLight.position.set(40, 80, 20);
    const rimLight = new THREE.DirectionalLight(0xffffff, 0.35);
    rimLight.position.set(-60, 50, -40);
    scene.add(ambient, keyLight, rimLight);

    const planeGeometry = new THREE.PlaneGeometry(
      FREQ_SPAN,
      TIME_SPAN,
      FREQUENCY_BINS - 1,
      HISTORY_LENGTH - 1
    );
    planeGeometry.translate(FREQ_SPAN / 2, TIME_SPAN / 2, 0);

    const initialTexture = new THREE.DataTexture(
      new Uint8Array(FREQUENCY_BINS * HISTORY_LENGTH * 4),
      FREQUENCY_BINS,
      HISTORY_LENGTH,
      THREE.RGBAFormat
    );
    initialTexture.needsUpdate = true;
    spectrogramTextureRef.current = initialTexture;

    const uniforms = {
      u_amplitude: { value: 45.0 },
      u_spectrogram: { value: initialTexture },
    };

    const planeMaterial = new THREE.ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader,
      transparent: true,
      side: THREE.DoubleSide,
    });

    const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
    scene.add(planeMesh);

    const axisMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color(AXIS_COLOR),
    });

    const axisGeometries: THREE.BufferGeometry[] = [];

    const makeSolidAxis = (start: THREE.Vector3, direction: THREE.Vector3, length: number) => {
      const radius = 0.15;
      const geometry = new THREE.CylinderGeometry(radius, radius, length, 12);
      const mesh = new THREE.Mesh(geometry, axisMaterial);
      const normalizedDirection = direction.clone().normalize();
      const quaternion = new THREE.Quaternion().setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        normalizedDirection
      );
      mesh.setRotationFromQuaternion(quaternion);
      const center = start.clone().add(normalizedDirection.multiplyScalar(length / 2));
      mesh.position.copy(center);
      scene.add(mesh);
      axisGeometries.push(geometry);
    };

    // Axes sit on the noise floor along the surface's outer edges, like a 3D plot's box,
    // so the surface can never hide them: time and frequency run along the two front edges
    // and meet at the near corner; amplitude rises from the right-hand corner.
    const FLOOR = -12;
    const EDGE_GAP = 3;
    const nearCorner = new THREE.Vector3(FREQ_SPAN + EDGE_GAP, FLOOR, TIME_SPAN + EDGE_GAP);
    const rightCorner = new THREE.Vector3(FREQ_SPAN + EDGE_GAP, FLOOR, 0);

    const freqDirection = new THREE.Vector3(-1, 0, 0);
    const ampDirection = new THREE.Vector3(0, 1, 0);
    const timeDirection = new THREE.Vector3(0, 0, 1);
    const ampLength = 45;

    makeSolidAxis(nearCorner, freqDirection, FREQ_SPAN + EDGE_GAP);
    makeSolidAxis(rightCorner, timeDirection, TIME_SPAN + EDGE_GAP);
    makeSolidAxis(rightCorner, ampDirection, ampLength);

    // Labels sit just outside their axis, away from the surface.
    const freqLabelPos = nearCorner
      .clone()
      .add(freqDirection.clone().multiplyScalar((FREQ_SPAN + EDGE_GAP) / 2))
      .add(new THREE.Vector3(0, -3, 7));
    const timeLabelPos = rightCorner
      .clone()
      .add(timeDirection.clone().multiplyScalar((TIME_SPAN + EDGE_GAP) / 2))
      .add(new THREE.Vector3(7, -3, 0));
    const ampLabelPos = rightCorner
      .clone()
      .add(ampDirection.clone().multiplyScalar(ampLength / 2))
      .add(new THREE.Vector3(5, 0, -5));

    rendererStateRef.current = {
      renderer,
      camera,
      uniforms,
      axisPoints: {
        time: { anchor: timeLabelPos, direction: timeDirection.clone() },
        freq: { anchor: freqLabelPos, direction: freqDirection.clone() },
        amp: { anchor: ampLabelPos, direction: ampDirection.clone() },
      },
    };

    // The plot's extent as the camera sees it: the box from the noise floor to the tallest peaks
    // the recording reaches, the axes on its edges and the label anchors just outside them. Replaying
    // the whole loop offline, the surface's highest point on screen never rises above where a peak of
    // height 4 at the far corner would sit; anything taller (the theoretical maximum is 33) only
    // leaves a band of empty space on top.
    const peakTop = 4;
    const plotPoints = [freqLabelPos, timeLabelPos, ampLabelPos];
    for (const x of [0, FREQ_SPAN + EDGE_GAP]) {
      for (const y of [FLOOR, peakTop]) {
        for (const z of [0, TIME_SPAN + EDGE_GAP]) plotPoints.push(new THREE.Vector3(x, y, z));
      }
    }
    const plotBounds = new THREE.Box2();
    plotPoints.forEach((point) => {
      const viewPoint = point.clone().applyMatrix4(camera.matrixWorldInverse);
      plotBounds.expandByPoint(new THREE.Vector2(viewPoint.x, viewPoint.y));
    });

    // Fit the frustum so the plot fills its box whatever the box's shape. When the box is taller
    // than the plot needs, the plot sits on the box's floor, right above its key.
    const resize = () => {
      const { clientWidth, clientHeight } = container;
      if (!clientWidth || !clientHeight) return;
      renderer.setSize(clientWidth, clientHeight);
      const plotSize = plotBounds.getSize(new THREE.Vector2());
      const unitsPerPx = Math.max(
        plotSize.x / Math.max(clientWidth - 2 * FIT_MARGIN_PX, 1),
        plotSize.y / Math.max(clientHeight - 2 * FIT_MARGIN_PX, 1)
      );
      const frustumWidth = clientWidth * unitsPerPx;
      const frustumHeight = clientHeight * unitsPerPx;
      const center = plotBounds.getCenter(new THREE.Vector2());
      camera.left = center.x - frustumWidth / 2;
      camera.right = center.x + frustumWidth / 2;
      camera.bottom = plotBounds.min.y - FIT_MARGIN_PX * unitsPerPx;
      camera.top = camera.bottom + frustumHeight;
      camera.updateProjectionMatrix();
    };

    resize();
    updateAxisLabels();

    const resizeObserver = new ResizeObserver(() => {
      resize();
      updateAxisLabels();
    });
    resizeObserver.observe(container);
    resizeObserverRef.current = resizeObserver;

    const prefersReducedMotion =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let frozen = false; // reduced-motion: stop once the plane has filled
    let filled = false;

    // As soon as the audio is decoded, build the whole history at once (the last few seconds of the
    // loop), so the plot appears complete instead of growing in from one edge.
    const fillHistory = () => {
      const now = performance.now() / 1000;
      for (let row = HISTORY_LENGTH - 1; row >= 0; row--) updateSpectrogram(now - row * FRAME_SECONDS);
      filled = true;
    };

    const drawFrame = () => {
      renderer.render(scene, camera);
      updateAxisLabels();
    };

    const renderScene = () => {
      // Reduced motion: fill the history once, then hold a static frame.
      if (prefersReducedMotion) {
        if (audioBufferRef.current) {
          if (!filled) fillHistory();
          frozen = true;
          drawFrame();
          animationRef.current = undefined;
          return; // do not schedule further frames
        }
        drawFrame();
        animationRef.current = requestAnimationFrame(renderScene);
        return;
      }

      if (!filled && audioBufferRef.current && dataArrayRef.current) {
        fillHistory();
        drawFrame();
        animationRef.current = requestAnimationFrame(renderScene);
        return;
      }

      // Recompute every frame so the scrolling spectrogram stays locked to the
      // audio's playback rate (throttling here desynced and slowed the scroll).
      if (analyserRef.current && dataArrayRef.current) {
        updateSpectrogram();
      }
      drawFrame();
      animationRef.current = requestAnimationFrame(renderScene);
    };

    const startLoop = () => {
      if (frozen || animationRef.current !== undefined) return;
      animationRef.current = requestAnimationFrame(renderScene);
    };

    const stopLoop = () => {
      if (animationRef.current !== undefined) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = undefined;
      }
    };

    // Only animate while the hero is on screen and the tab is visible.
    let inView = true;
    const evaluateRunning = () => {
      if (inView && document.visibilityState !== 'hidden') startLoop();
      else stopLoop();
    };

    const visibilityHandler = () => evaluateRunning();
    document.addEventListener('visibilitychange', visibilityHandler);

    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        inView = entries[0]?.isIntersecting ?? true;
        evaluateRunning();
      },
      // Start a little before it scrolls into view, so it is never an empty slab on arrival.
      { threshold: 0, rootMargin: '300px 0px' }
    );
    intersectionObserver.observe(container);

    startLoop();

    return () => {
      if (animationRef.current !== undefined) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = undefined;
      }
      document.removeEventListener('visibilitychange', visibilityHandler);
      intersectionObserver.disconnect();

      resizeObserver.disconnect();

      planeGeometry.dispose();
      planeMaterial.dispose();
      axisMaterial.dispose();
      axisGeometries.forEach((geometry) => geometry.dispose());
      renderer.dispose();
      if (spectrogramTextureRef.current) {
        spectrogramTextureRef.current.dispose();
        spectrogramTextureRef.current = null;
      }
      rendererStateRef.current = {};
    };
  }, [updateAxisLabels, updateSpectrogram]);

  return (
    <>
      <div ref={containerRef} className={`relative min-h-0 w-full overflow-visible ${plotClassName}`}>
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full pointer-events-none"
        />
        <div className="pointer-events-none absolute inset-0">
          <span
            ref={timeLabelRef}
            className="absolute text-[13px] text-graphite opacity-0 select-none whitespace-nowrap"
          >
            Time
          </span>
          <span
            ref={freqLabelRef}
            className="absolute text-[13px] text-graphite opacity-0 select-none whitespace-nowrap"
          >
            Frequency
          </span>
          <span
            ref={ampLabelRef}
            className="absolute text-[13px] text-graphite opacity-0 select-none whitespace-nowrap"
          >
            Amplitude
          </span>
        </div>
      </div>

      <SpectrogramKey isMuted={isMuted} onToggle={toggleMute} className={keyClassName} />
    </>
  );
}
