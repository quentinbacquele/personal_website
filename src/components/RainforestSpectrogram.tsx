import { useCallback, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Volume2, VolumeX } from 'lucide-react';

const FREQUENCY_BINS = 256;
const HISTORY_LENGTH = 256;
const TIME_SPAN = 80;
const FREQ_SPAN = 80;
const ROW_BYTE_SIZE = FREQUENCY_BINS * 4;
const FRUSTUM_SIZE = 200;
const AXIS_COLOR = 0xf6eddd;

// Analyser configuration to ensure consistency between simulated and live modes
const MIN_DECIBELS = -90;
const MAX_DECIBELS = -15;
const SMOOTHING_CONSTANT = 0.15;
const LOW_FREQUENCY_CUTOFF_HZ = 200;
const FREQUENCY_SMOOTH_KERNEL = [0.03, 0.08, 0.15, 0.18, 0.15, 0.08, 0.03];
const FREQUENCY_SMOOTH_MIX = 0.9;
const TEMPORAL_SMOOTHING = 0.7;


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

    vec3 stop0 = vec3(0.02, 0.05, 0.15);  // deep warm navy - lowest low freq
    vec3 stop1 = vec3(0.08, 0.22, 0.32);  // dark teal
    vec3 stop2 = vec3(0.12, 0.48, 0.55);  // bright teal (more blue)
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

export default function RainforestSpectrogram() {
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

  const animationRef = useRef<number>();
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  const timeLabelRef = useRef<HTMLSpanElement>(null);
  const freqLabelRef = useRef<HTMLSpanElement>(null);
  const ampLabelRef = useRef<HTMLSpanElement>(null);
  const isStartedRef = useRef(false);

  const [isMuted, setIsMuted] = useState(true);

  // Helper to compute DFT for visualization when AudioContext is suspended
  const computeFrequencyData = useCallback((buffer: AudioBuffer, targetArray: Uint8Array) => {
    const time = performance.now() / 1000;
    const duration = buffer.duration;
    const offset = time % duration;
    const sampleRate = buffer.sampleRate;
    const startIndex = Math.floor(offset * sampleRate);
    const fftSize = 2048;
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

    for (let k = cutoffBin; k < binCount; k++) {
      let real = 0;
      let imag = 0;
      
      // DFT
      for (let n = 0; n < fftSize; n++) {
        const sample = channelData[startIndex + n];
        // Hann window
        const window = 0.5 * (1 - Math.cos((2 * Math.PI * n) / (fftSize - 1)));
        const windowedSample = sample * window;
        
        const angle = (2 * Math.PI * k * n) / fftSize;
        real += windowedSample * Math.cos(angle);
        imag -= windowedSample * Math.sin(angle);
      }
      
      // Calculate Magnitude
      const magnitude = Math.sqrt(real * real + imag * imag);
      
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

  const updateSpectrogram = useCallback(() => {
    const dataArray = dataArrayRef.current;
    const texture = spectrogramTextureRef.current;

    if (!dataArray || !texture) {
      return;
    }

    // Use the texture's data array directly to ensure updates are visible
    const spectrogramData = texture.image.data;
    const normalizedBins = normalizedBinsRef.current;
    const smoothedRow = smoothedRowRef.current;
    const hasPrevRow = hasSmoothedRowRef.current;
    // Always use software analysis (Visual Playback) to ensure perfect consistency
    // regardless of whether the audio context is running, suspended, or transitioning.
    // This prevents visual glitches ("cuts") when the user interacts.
    if (audioBufferRef.current) {
      computeFrequencyData(audioBufferRef.current, dataArray);
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
    gainNode.gain.value = 0; // Start muted in the Web Audio graph
    gainNodeRef.current = gainNode;

    analyser.connect(gainNode);
    gainNode.connect(ctx.destination);

    // Initialize data arrays
    dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);

    const controller = new AbortController();
    let cancelled = false;

    const loadAudioBuffer = async () => {
      try {
        const response = await fetch('/audio/rainforest.mp3', {
          signal: controller.signal,
        });
        const buffer = await response.arrayBuffer();
        if (cancelled) return;
        const audioBuffer = await ctx.decodeAudioData(buffer);
        if (cancelled) return;
        audioBufferRef.current = audioBuffer;

        if (audioContextRef.current?.state === 'running' && isStartedRef.current && !audioSourceRef.current) {
          startAudioSource();
        }
      } catch (error) {
        if ((error as DOMException).name === 'AbortError') {
          return;
        }
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
      controller.abort();
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
    renderer.setPixelRatio(window.devicePixelRatio || 1);
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020409, 0.002);

    const aspect = container.clientWidth / container.clientHeight || 1;
    const camera = new THREE.OrthographicCamera(
      (-FRUSTUM_SIZE * aspect) / 2,
      (FRUSTUM_SIZE * aspect) / 2,
      FRUSTUM_SIZE / 2,
      -FRUSTUM_SIZE / 2,
      0.1,
      500
    );
    camera.position.set(115, 95, 115);
    camera.lookAt(40, 0, 40);

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

    const axisOrigin = new THREE.Vector3(FREQ_SPAN + 10, 8, 0);
    const axisLen = 60;
    const axisPadding = 6;

    const freqDirection = new THREE.Vector3(-1, 0, 0);
    const ampDirection = new THREE.Vector3(0, 1, 0);
    const timeDirection = new THREE.Vector3(0, 0, 1);

    makeSolidAxis(axisOrigin, freqDirection, axisLen);
    makeSolidAxis(axisOrigin, ampDirection, axisLen);
    makeSolidAxis(axisOrigin, timeDirection, axisLen);

    const freqLabelPos = axisOrigin
      .clone()
      .add(freqDirection.clone().multiplyScalar(axisLen / 2))
      .add(new THREE.Vector3(0, 6, 0));
    const ampLabelPos = axisOrigin
      .clone()
      .add(ampDirection.clone().multiplyScalar(axisLen / 2))
      .add(new THREE.Vector3(6, 0, 0));
    const timeLabelPos = axisOrigin
      .clone()
      .add(timeDirection.clone().multiplyScalar(axisLen / 2))
      .add(new THREE.Vector3(0, -6, 0));

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

    const resize = () => {
      const { clientWidth, clientHeight } = container;
      const aspectRatio = clientWidth / clientHeight || 1;
      renderer.setSize(clientWidth, clientHeight);
      camera.left = (-FRUSTUM_SIZE * aspectRatio) / 2;
      camera.right = (FRUSTUM_SIZE * aspectRatio) / 2;
      camera.top = FRUSTUM_SIZE / 2;
      camera.bottom = -FRUSTUM_SIZE / 2;
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

    const renderScene = () => {
      animationRef.current = requestAnimationFrame(renderScene);
      if (analyserRef.current && dataArrayRef.current) {
        // If suspended, updateSpectrogram handles simulation
        // If running, we fetch data here or in updateSpectrogram
        // Let's centralize it in updateSpectrogram
        updateSpectrogram();
      }
      if (rendererStateRef.current.renderer && rendererStateRef.current.camera) {
        renderer.render(scene, camera);
        rendererStateRef.current.renderer = renderer;
        rendererStateRef.current.camera = camera;
      } else {
        renderer.render(scene, camera);
      }
      updateAxisLabels();
    };

    renderScene();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }

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
    <div className="w-full max-w-3xl mx-auto">
      <div ref={containerRef} className="relative h-[680px] w-full overflow-visible">
        <button
          onClick={toggleMute}
          className="absolute top-32 left-1/2 -translate-x-1/2 z-10 p-2 text-sand/50 hover:text-sand transition-colors duration-300 mix-blend-difference"
          aria-label={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>

        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full pointer-events-none"
        />
        <div className="pointer-events-none absolute inset-0">
          <span
            ref={timeLabelRef}
            className="absolute font-mono text-[10px] uppercase tracking-[0.5em] text-sand/80 opacity-0 select-none"
          >
            Time
          </span>
          <span
            ref={freqLabelRef}
            className="absolute font-mono text-[10px] uppercase tracking-[0.5em] text-sand/80 opacity-0 select-none"
          >
            Frequency
          </span>
          <span
            ref={ampLabelRef}
            className="absolute font-mono text-[10px] uppercase tracking-[0.5em] text-sand/80 opacity-0 select-none"
          >
            Amplitude
          </span>
        </div>
      </div>
    </div>
  );
}
