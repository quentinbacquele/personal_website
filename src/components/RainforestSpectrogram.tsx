import { useCallback, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Volume2, VolumeX } from 'lucide-react';

const FREQUENCY_BINS = 64;
const HISTORY_LENGTH = 96;
const TIME_SPAN = 80;
const FREQ_SPAN = 80;
const ROW_BYTE_SIZE = FREQUENCY_BINS * 4;
const FRUSTUM_SIZE = 160;
const AXIS_COLOR = 0xf6eddd;

// Analyser configuration to ensure consistency between simulated and live modes
const MIN_DECIBELS = -90;
const MAX_DECIBELS = -15;
const SMOOTHING_CONSTANT = 0.85;

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

  // Official Google Turbo Colormap (polynomial approximation)
  vec3 turbo(float x) {
    const vec4 kRedVec4 = vec4(0.13572138, 4.61539260, -42.66032258, 132.13108234);
    const vec4 kGreenVec4 = vec4(0.09140261, 2.19418839, 4.84296658, -14.18503333);
    const vec4 kBlueVec4 = vec4(0.10667330, 12.64194608, -60.58204836, 110.36276771);
    const vec2 kRedVec2 = vec2(-152.94239396, 59.28637943);
    const vec2 kGreenVec2 = vec2(4.27729857, 2.82956604);
    const vec2 kBlueVec2 = vec2(-89.90310912, 27.34824973);

    x = clamp(x, 0.0, 1.0);
    vec4 v4 = vec4( 1.0, x, x * x, x * x * x);
    vec2 v2 = v4.zw * v4.z;

    return vec3(
      dot(v4, kRedVec4)   + dot(v2, kRedVec2),
      dot(v4, kGreenVec4) + dot(v2, kGreenVec2),
      dot(v4, kBlueVec4)  + dot(v2, kBlueVec2)
    );
  }

  void main() {
    // Apply balanced power curve: 1.35 retains blue floor but brings back some mid-range warmth
    float intensity = clamp(pow(vIntensity, 1.35), 0.0, 1.0);
    vec3 color = turbo(intensity);
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

  const rendererStateRef = useRef<{
    renderer?: THREE.WebGLRenderer;
    camera?: THREE.OrthographicCamera;
    uniforms?: {
      u_amplitude: { value: number };
      u_spectrogram: { value: THREE.DataTexture };
    };
    axisPoints?: {
      time: THREE.Vector3;
      freq: THREE.Vector3;
      amp: THREE.Vector3;
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
    const fftSize = 512; // Must match the analyser node setting
    
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
    
    for (let k = 0; k < binCount; k++) {
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
    for (let i = 0; i < FREQUENCY_BINS; i++) {
      const magnitude = i < usableBins ? dataArray[i] : 0;
      const normalized = Math.pow(magnitude / 255, 0.7);
      const pixelIndex = i * 4;
      spectrogramData[pixelIndex] = normalized * 255;
      spectrogramData[pixelIndex + 1] = Math.pow(normalized, 0.9) * 255;
      spectrogramData[pixelIndex + 2] = 200 + normalized * 55;
      spectrogramData[pixelIndex + 3] = 255;
    }

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
      coords: { x: number; y: number },
      rotation: number = 0
    ) => {
      if (!element) return;
      element.style.transform = `translate(${coords.x}px, ${coords.y}px) translate(-50%, -50%) rotate(${rotation}deg)`;
      element.style.opacity = '1';
    };

    placeLabel(freqLabelRef.current, projectPoint(axisPoints.freq), 26);
    placeLabel(timeLabelRef.current, projectPoint(axisPoints.time), -26);
    placeLabel(ampLabelRef.current, projectPoint(axisPoints.amp), 0);
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
    analyser.fftSize = 512;
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
    camera.lookAt(FREQ_SPAN / 2, 0, TIME_SPAN / 2);

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

    const axisMaterial = new THREE.LineBasicMaterial({
      color: new THREE.Color(AXIS_COLOR),
      transparent: true,
      opacity: 0.8,
      linewidth: 4,
    });

    const axisGeometries: THREE.BufferGeometry[] = [];
    const makeAxis = (from: THREE.Vector3, to: THREE.Vector3) => {
      const geometry = new THREE.BufferGeometry().setFromPoints([from, to]);
      axisGeometries.push(geometry);
      const axis = new THREE.Line(geometry, axisMaterial);
      scene.add(axis);
    };

    const origin = new THREE.Vector3(FREQ_SPAN + 4, -4, -4);
    const timeEnd = new THREE.Vector3(FREQ_SPAN + 4, -4, TIME_SPAN + 4);
    const freqEnd = new THREE.Vector3(-4, -4, -4);
    const ampEnd = new THREE.Vector3(FREQ_SPAN + 4, 34, -4);

    makeAxis(origin, timeEnd);
    makeAxis(origin, freqEnd);
    makeAxis(origin, ampEnd);

    const timeLabelPos = new THREE.Vector3(FREQ_SPAN + 16, -4, TIME_SPAN / 2);
    const freqLabelPos = new THREE.Vector3(FREQ_SPAN / 2, -4, -16);
    const ampLabelPos = new THREE.Vector3(FREQ_SPAN + 16, 15, -4);

    rendererStateRef.current = {
      renderer,
      camera,
      uniforms,
      axisPoints: {
        time: timeLabelPos,
        freq: freqLabelPos,
        amp: ampLabelPos,
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
    <div className="w-full max-w-3xl relative group">
      <button
        onClick={toggleMute}
        className="absolute top-4 right-4 z-10 p-2 text-sand/50 hover:text-sand transition-colors duration-300 mix-blend-difference"
        aria-label={isMuted ? "Unmute" : "Mute"}
      >
        {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
      </button>

      <div ref={containerRef} className="relative h-[600px] w-full overflow-visible">
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
