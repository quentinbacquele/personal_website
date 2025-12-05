import { useEffect, useMemo, useRef, useState } from 'react';

const SURFACE_COUNT = 3;
const TIME_SLICES = 28;
const FREQ_BINS = 20;
const WINDOW_SIZE = 2048;
const MIN_FREQ = 60;
const MAX_FREQ = 9000;
const WINDOW_DURATION_SECONDS = 5;
const FRAME_INTERVAL_MS = 180;
const BLEND_DURATION_MS = 600;
const AXIS_COLOR = 'rgba(214, 234, 225, 0.45)';
const AXIS_TEXT_COLOR = 'rgba(214, 234, 225, 0.75)';

type SurfaceMatrix = number[][];
type IsoPoint = { x: number; y: number };
type ContourPath = {
  path: string;
  intensity: number;
};

type ProjectedSurface = {
  rimPath: string;
  frontEdgePath: string;
  timeContours: ContourPath[];
  freqContours: ContourPath[];
};
type AudioPayload = {
  samples: Float32Array;
  sampleRate: number;
};

function applyHannWindow(length: number, index: number) {
  if (length <= 1) return 1;
  return 0.5 * (1 - Math.cos((2 * Math.PI * index) / (length - 1)));
}

function computeSpectrumSegment(
  segment: Float32Array,
  sampleRate: number
): number[] {
  const magnitudes = new Array(FREQ_BINS).fill(0);
  const nyquist = sampleRate / 2;
  const maxTargetFreq = Math.min(MAX_FREQ, nyquist);
  const freqSpan = Math.max(1, maxTargetFreq - MIN_FREQ);

  for (let bin = 0; bin < FREQ_BINS; bin++) {
    const freq = MIN_FREQ + (freqSpan * bin) / (FREQ_BINS - 1 || 1);
    const angle = (2 * Math.PI * freq) / sampleRate;
    const cosDelta = Math.cos(angle);
    const sinDelta = Math.sin(angle);

    let cosValue = 1;
    let sinValue = 0;
    let real = 0;
    let imag = 0;

    for (let i = 0; i < segment.length; i++) {
      const windowedSample = segment[i] * applyHannWindow(segment.length, i);
      real += windowedSample * cosValue;
      imag -= windowedSample * sinValue;

      const nextCos = cosValue * cosDelta - sinValue * sinDelta;
      const nextSin = sinValue * cosDelta + cosValue * sinDelta;
      cosValue = nextCos;
      sinValue = nextSin;
    }

    magnitudes[bin] = Math.sqrt(real * real + imag * imag);
  }

  return magnitudes;
}

async function loadRainforestAudio(): Promise<AudioPayload | null> {
  if (typeof window === 'undefined') return null;

  const AudioCtx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext })
      .webkitAudioContext;

  if (!AudioCtx) return null;

  const audioContext = new AudioCtx();

  try {
    const response = await fetch('/audio/rainforest.mp3');
    if (!response.ok) {
      throw new Error('Unable to fetch rainforest.mp3');
    }

    const buffer = await response.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(buffer);
    const channelData = audioBuffer.getChannelData(0);
    const samples = new Float32Array(channelData.length);
    samples.set(channelData);

    return {
      samples,
      sampleRate: audioBuffer.sampleRate,
    };
  } finally {
    audioContext.close();
  }
}

function extractSurfacesForWindow(
  payload: AudioPayload,
  startSample: number,
  windowSamples: number
): SurfaceMatrix[] {
  const { samples, sampleRate } = payload;
  const end = Math.min(samples.length, startSample + windowSamples);
  if (end <= startSample) return [];

  const windowed = samples.subarray(startSample, end);
  const segmentLength = Math.max(1, Math.floor(windowed.length / SURFACE_COUNT));
  const surfaces: SurfaceMatrix[] = [];
  let globalMax = 0;

  for (let surfaceIndex = 0; surfaceIndex < SURFACE_COUNT; surfaceIndex++) {
    const surface: SurfaceMatrix = [];
    const offset = surfaceIndex * segmentLength;
    const sliceEnd = Math.min(offset + segmentLength, windowed.length);
    const layer = windowed.subarray(offset, sliceEnd);
    if (!layer.length) continue;

    const sliceLength = Math.max(1, Math.floor(layer.length / TIME_SLICES));

    for (let slice = 0; slice < TIME_SLICES; slice++) {
      const start = slice * sliceLength;
      if (start >= layer.length) {
        surface.push(new Array(FREQ_BINS).fill(0));
        continue;
      }

      const available = Math.max(
        64,
        Math.min(WINDOW_SIZE, layer.length - start)
      );
      const segment = new Float32Array(available);
      segment.set(layer.subarray(start, start + available));

      const magnitudes = computeSpectrumSegment(segment, sampleRate);
      surface.push(magnitudes);

      magnitudes.forEach((value) => {
        if (value > globalMax) globalMax = value;
      });
    }

    surfaces.push(surface);
  }

  const normalizer = globalMax || 1;

  return surfaces.map((surface) =>
    surface.map((row) =>
      row.map((value) => Math.pow(value / normalizer, 0.85))
    )
  );
}

function projectIsoPoint(
  timeNorm: number,
  freqNorm: number,
  amplitude: number,
  layer: number
): IsoPoint {
  const layerOffset = layer * 36;
  const x = 250 + (timeNorm - freqNorm) * 220 + layerOffset * 0.7;
  const y =
    230 +
    (timeNorm + freqNorm) * 70 -
    Math.pow(Math.max(0, amplitude), 0.88) * 220 -
    layerOffset * 0.35;
  return { x, y };
}

function buildIsoPoint(
  timeIndex: number,
  freqIndex: number,
  amplitude: number,
  layer: number
): IsoPoint {
  const timeNorm = timeIndex / (TIME_SLICES - 1 || 1);
  const freqNorm = freqIndex / (FREQ_BINS - 1 || 1);
  return projectIsoPoint(timeNorm, freqNorm, amplitude, layer);
}

function pointsToSmoothPath(points: IsoPoint[], close = false) {
  if (points.length < 2) return '';

  const commands = [`M${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`];

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    commands.push(
      `C${cp1x.toFixed(2)} ${cp1y.toFixed(
        2
      )}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(
        2
      )}`
    );
  }

  if (close) {
    commands.push('Z');
  }

  return commands.join(' ');
}

function buildSurfaceRim(surface: SurfaceMatrix, layer: number): IsoPoint[] {
  if (!surface.length || !surface[0]?.length) return [];

  const rim: IsoPoint[] = [];
  const lastTime = surface.length - 1;
  const lastFreq = surface[0].length - 1;

  for (let freq = 0; freq <= lastFreq; freq++) {
    rim.push(buildIsoPoint(0, freq, surface[0][freq], layer));
  }

  for (let time = 1; time <= lastTime; time++) {
    rim.push(buildIsoPoint(time, lastFreq, surface[time][lastFreq], layer));
  }

  for (let freq = lastFreq - 1; freq >= 0; freq--) {
    rim.push(buildIsoPoint(lastTime, freq, surface[lastTime][freq], layer));
  }

  for (let time = lastTime - 1; time > 0; time--) {
    rim.push(buildIsoPoint(time, 0, surface[time][0], layer));
  }

  return rim;
}

function contourColor(
  intensity: number,
  layer: number,
  type: 'time' | 'freq'
) {
  const clamped = Math.min(1, Math.max(0, intensity));
  const hueStart = type === 'time' ? 150 : 195;
  const hueEnd = type === 'time' ? 95 : 150;
  const hue = hueStart + (hueEnd - hueStart) * clamped - layer * 2;
  const lightness = 32 + clamped * 35 - layer * 3;
  const saturation = 55 + clamped * 35;
  const alpha = 0.35 + clamped * 0.45 - layer * 0.04;
  return `hsla(${hue}, ${saturation}%, ${lightness}%, ${Math.min(
    0.95,
    Math.max(0.35, alpha)
  )})`;
}

function blendSurfaces(
  from: SurfaceMatrix[],
  to: SurfaceMatrix[],
  t: number
): SurfaceMatrix[] {
  if (!from.length) return to;
  const clamped = Math.min(1, Math.max(0, t));

  return to.map((surface, surfaceIndex) => {
    const fromSurface = from[surfaceIndex];
    return surface.map((row, rowIndex) => {
      const fromRow = fromSurface?.[rowIndex];
      return row.map((value, colIndex) => {
        const start = fromRow?.[colIndex] ?? 0;
        return start + (value - start) * clamped;
      });
    });
  });
}

export default function RainforestSpectrogram() {
  const [payload, setPayload] = useState<AudioPayload | null>(null);
  const [surfaces, setSurfaces] = useState<SurfaceMatrix[]>([]);
  const [displaySurfaces, setDisplaySurfaces] = useState<SurfaceMatrix[]>([]);
  const displayRef = useRef<SurfaceMatrix[]>([]);
  const transitionRef = useRef<{
    from: SurfaceMatrix[];
    to: SurfaceMatrix[];
    start: number;
  } | null>(null);
  const rafRef = useRef<number>();

  useEffect(() => {
    let cancelled = false;

    loadRainforestAudio()
      .then((data) => {
        if (!cancelled && data) {
          setPayload(data);
        }
      })
      .catch((error) => {
        console.error('Failed to load rainforest audio', error);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!payload) return;
    let offsetSamples = 0;
    let timeoutId: number;
    const scheduleBlend = (next: SurfaceMatrix[]) => {
      const now = performance.now();
      const baseline = displayRef.current.length ? displayRef.current : next;
      transitionRef.current = { from: baseline, to: next, start: now };

      if (!rafRef.current) {
        const step = () => {
          const transition = transitionRef.current;
          if (!transition) {
            rafRef.current = undefined;
            return;
          }

          const progress = Math.min(
            (performance.now() - transition.start) / BLEND_DURATION_MS,
            1
          );
          const blended =
            progress >= 1
              ? transition.to
              : blendSurfaces(transition.from, transition.to, progress);
          setDisplaySurfaces(blended);

          if (progress >= 1) {
            displayRef.current = transition.to;
            transitionRef.current = null;
            rafRef.current = undefined;
          } else {
            rafRef.current = requestAnimationFrame(step);
          }
        };

        rafRef.current = requestAnimationFrame(step);
      }
    };

    const windowSamples = Math.min(
      payload.samples.length,
      Math.floor(payload.sampleRate * WINDOW_DURATION_SECONDS)
    );
    if (!windowSamples) return;

    const stepSamples = Math.max(
      1024,
      Math.floor((payload.sampleRate * FRAME_INTERVAL_MS) / 1000)
    );

    const update = () => {
      const nextSurfaces = extractSurfacesForWindow(
        payload,
        offsetSamples,
        windowSamples
      );

      if (nextSurfaces.length) {
        setSurfaces(nextSurfaces);
        scheduleBlend(nextSurfaces);
      }

      offsetSamples += stepSamples;
      if (offsetSamples + windowSamples >= payload.samples.length) {
        offsetSamples = 0;
      }

      timeoutId = window.setTimeout(update, FRAME_INTERVAL_MS);
    };

    update();

    return () => {
      window.clearTimeout(timeoutId);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = undefined;
      }
    };
  }, [payload]);

  useEffect(() => {
    displayRef.current = displaySurfaces;
  }, [displaySurfaces]);

  useEffect(() => {
    if (!displaySurfaces.length && surfaces.length) {
      setDisplaySurfaces(surfaces);
      displayRef.current = surfaces;
    }
  }, [surfaces, displaySurfaces.length]);

  const projected = useMemo(() => {
    return displaySurfaces.map((surface, layer): ProjectedSurface => {
      if (!surface.length || !surface[0]?.length) {
        return { rimPath: '', frontEdgePath: '', timeContours: [], freqContours: [] };
      }

      const rimPoints = buildSurfaceRim(surface, layer);
      const rimPath = pointsToSmoothPath(rimPoints, true);

      const frontEdgePoints = surface.map((row, timeIndex) =>
        buildIsoPoint(timeIndex, 0, row[0] ?? 0, layer)
      );
      const frontEdgePath = pointsToSmoothPath(frontEdgePoints);

      const freqCount = surface[0]?.length ?? 0;
      const timeLength = surface.length;

      const contourFreqs =
        freqCount > 1
          ? [0.25, 0.5, 0.75]
              .map((ratio) =>
                Math.min(freqCount - 1, Math.max(0, Math.round(ratio * (freqCount - 1))))
              )
              .filter((value, index, arr) => arr.indexOf(value) === index)
          : [];

      const contourTimes =
        timeLength > 1
          ? [0.3, 0.55, 0.8]
              .map((ratio) =>
                Math.min(timeLength - 1, Math.max(0, Math.round(ratio * (timeLength - 1))))
              )
              .filter((value, index, arr) => arr.indexOf(value) === index)
          : [];

      const timeContours: ContourPath[] = contourFreqs
        .map((freqIndex) => {
          let peak = 0;
          const points = surface.map((row, timeIndex) => {
            const amp = row[freqIndex] ?? 0;
            if (amp > peak) peak = amp;
            return buildIsoPoint(timeIndex, freqIndex, amp, layer);
          });
          const path = pointsToSmoothPath(points);
          if (!path) return null;
          return {
            path,
            intensity: peak,
          };
        })
        .filter((entry): entry is ContourPath => Boolean(entry));

      const freqContours: ContourPath[] = contourTimes
        .map((timeIndex) => {
          const row = surface[timeIndex];
          if (!row) return null;
          let peak = 0;
          const points = row.map((value, freqIndex) => {
            const amp = value ?? 0;
            if (amp > peak) peak = amp;
            return buildIsoPoint(timeIndex, freqIndex, amp, layer);
          });
          const path = pointsToSmoothPath(points);
          if (!path) return null;
          return {
            path,
            intensity: peak,
          };
        })
        .filter((entry): entry is ContourPath => Boolean(entry));

      return { rimPath, frontEdgePath, timeContours, freqContours };
    });
  }, [displaySurfaces]);

  const axisOrigin = projectIsoPoint(0, 1, 0, 0);
  const timeAxisEnd = projectIsoPoint(1, 1, 0, 0);
  const freqAxisEnd = projectIsoPoint(0, 0, 0, 0);
  const amplitudeAxisEnd = projectIsoPoint(0, 1, 0.9, 0);

  const timeTicks = [0.25, 0.5, 0.75].map((t) => ({
    start: projectIsoPoint(t, 1, 0, 0),
    end: projectIsoPoint(t, 1, 0.05, 0),
  }));

  const freqTicks = [0.25, 0.5, 0.75].map((f) => ({
    start: projectIsoPoint(0, 1 - f, 0, 0),
    end: projectIsoPoint(0, 1 - f, 0.05, 0),
  }));

  const amplitudeTicks = [0.3, 0.6, 0.85].map((a) => ({
    start: projectIsoPoint(0, 1, a, 0),
    end: projectIsoPoint(0.03, 0.97, a, 0),
  }));

  const axisAngles = {
    time:
      (Math.atan2(timeAxisEnd.y - axisOrigin.y, timeAxisEnd.x - axisOrigin.x) *
        180) /
      Math.PI,
    freq:
      (Math.atan2(freqAxisEnd.y - axisOrigin.y, freqAxisEnd.x - axisOrigin.x) *
        180) /
      Math.PI,
    amp:
      (Math.atan2(
        amplitudeAxisEnd.y - axisOrigin.y,
        amplitudeAxisEnd.x - axisOrigin.x
      ) *
        180) /
      Math.PI,
  };

  const axisDirection = (start: IsoPoint, end: IsoPoint) => {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const len = Math.hypot(dx, dy) || 1;
    return { x: dx / len, y: dy / len };
  };

  const perp = (dir: { x: number; y: number }) => ({ x: -dir.y, y: dir.x });

  const timeDir = axisDirection(axisOrigin, timeAxisEnd);
  const timeNormal = perp(timeDir);
  const ampDir = axisDirection(axisOrigin, amplitudeAxisEnd);

  const timeLabelPos = {
    x: timeAxisEnd.x + timeDir.x * 16 + timeNormal.x * 6,
    y: timeAxisEnd.y + timeDir.y * 16 + timeNormal.y * 6,
  };

  const freqMid = {
    x: (axisOrigin.x + freqAxisEnd.x) / 2,
    y: (axisOrigin.y + freqAxisEnd.y) / 2,
  };

  const freqLabelPos = {
    x: freqMid.x + ampDir.x * 72,
    y: freqMid.y + ampDir.y * 72,
  };

  const amplitudeLabelPos = {
    x: amplitudeAxisEnd.x,
    y: amplitudeAxisEnd.y - 16,
  };

  return (
    <div className="max-w-lg w-full overflow-visible pb-10">
      <svg
        viewBox="0 0 520 400"
        className="w-full h-[400px] overflow-visible"
        role="img"
        aria-labelledby="rainforestSpectrogramTitle"
        preserveAspectRatio="xMidYMid meet"
      >
        <title id="rainforestSpectrogramTitle">
          Live five-second rainforest spectrogram mesh
        </title>

        <defs>
          <filter id="rainShadow" x="-30%" y="-40%" width="160%" height="220%">
            <feDropShadow
              dx="0"
              dy="26"
              stdDeviation="26"
              floodColor="rgba(0,0,0,0.35)"
            />
          </filter>

          {projected.map((_, layer) => {
            const highlightOpacity = Math.max(0.35, 0.55 - layer * 0.08);
            const midOpacity = Math.max(0.18, 0.3 - layer * 0.05);
            const baseOpacity = 0.08 + layer * 0.02;

            return (
              <g key={layer}>
                <linearGradient
                  id={`rainSurface-${layer}`}
                  x1="0"
                  y1="140"
                  x2="0"
                  y2="440"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop
                    offset="0%"
                    stopColor={`rgba(255,255,255,${highlightOpacity})`}
                  />
                  <stop
                    offset="60%"
                    stopColor={`rgba(173,255,199,${midOpacity})`}
                  />
                  <stop
                    offset="100%"
                    stopColor={`rgba(4,8,12,${baseOpacity})`}
                  />
                </linearGradient>
                <clipPath id={`rainClip-${layer}`}>
                  <path d={projected[layer]?.rimPath ?? ''} />
                </clipPath>
              </g>
            );
          })}
        </defs>

        <g stroke={AXIS_COLOR} strokeWidth={0.85} fill="none" className="pointer-events-none">
          <path
            d={`M${axisOrigin.x} ${axisOrigin.y} L${timeAxisEnd.x} ${timeAxisEnd.y}`}
          />
          <path
            d={`M${axisOrigin.x} ${axisOrigin.y} L${freqAxisEnd.x} ${freqAxisEnd.y}`}
          />
          <path
            d={`M${axisOrigin.x} ${axisOrigin.y} L${amplitudeAxisEnd.x} ${amplitudeAxisEnd.y}`}
          />

          <g strokeWidth={0.65}>
            {timeTicks.map((tick, index) => (
              <path
                key={`tt-${index}`}
                d={`M${tick.start.x} ${tick.start.y} L${tick.end.x} ${tick.end.y}`}
              />
            ))}
            {freqTicks.map((tick, index) => (
              <path
                key={`ft-${index}`}
                d={`M${tick.start.x} ${tick.start.y} L${tick.end.x} ${tick.end.y}`}
              />
            ))}
            {amplitudeTicks.map((tick, index) => (
              <path
                key={`at-${index}`}
                d={`M${tick.start.x} ${tick.start.y} L${tick.end.x} ${tick.end.y}`}
              />
            ))}
          </g>
        </g>

        <g
          fontFamily="'Space Mono', monospace"
          fontSize={9.5}
          fill={AXIS_TEXT_COLOR}
          className="uppercase tracking-[0.5em] pointer-events-none select-none"
        >
          <text
            x={timeAxisEnd.x - 12}
            y={timeAxisEnd.y + 10}
            textAnchor="middle"
            transform={`rotate(${axisAngles.time} ${timeAxisEnd.x - 12} ${
              timeAxisEnd.y + 10
            })`}
          >
            Time
          </text>
          <text
            x={freqLabelPos.x}
            y={freqLabelPos.y}
            textAnchor="middle"
            transform={`rotate(${axisAngles.freq} ${freqLabelPos.x} ${
              freqLabelPos.y
            })`}
          >
            Frequency
          </text>
          <text
            x={amplitudeLabelPos.x}
            y={amplitudeLabelPos.y}
            textAnchor="start"
          >
            Amplitude
          </text>
        </g>

        {projected.map((surface, layer) => {
          if (!surface.rimPath) return null;

          const gradientId = `rainSurface-${layer}`;
          const outlineOpacity = Math.max(0.15, 0.25 - layer * 0.06);
          const clipId = `rainClip-${layer}`;

          return (
            <g key={layer}>
              <path
                d={surface.rimPath}
                fill={`url(#${gradientId})`}
                stroke={`rgba(255,255,255,${outlineOpacity})`}
                strokeWidth={0.65}
                filter="url(#rainShadow)"
                opacity={0.95 - layer * 0.12}
              />

              {surface.frontEdgePath ? (
                <path
                  d={surface.frontEdgePath}
                  stroke="rgba(0,0,0,0.4)"
                  strokeWidth={0.9}
                  fill="none"
                  opacity={0.25}
                />
              ) : null}

              <g clipPath={`url(#${clipId})`} style={{ mixBlendMode: 'screen' }}>
                {surface.timeContours.map((contour, index) => (
                  <path
                    key={`tc-${layer}-${index}`}
                    d={contour.path}
                    stroke={contourColor(contour.intensity, layer, 'time')}
                    strokeWidth={0.5 + contour.intensity * 0.35}
                    strokeOpacity={Math.min(
                      0.95,
                      Math.max(0.4, contour.intensity * 0.9 - layer * 0.04)
                    )}
                    fill="none"
                  />
                ))}

                {surface.freqContours.map((contour, index) => (
                  <path
                    key={`fc-${layer}-${index}`}
                    d={contour.path}
                    stroke={contourColor(contour.intensity, layer, 'freq')}
                    strokeWidth={0.45 + contour.intensity * 0.3}
                    strokeOpacity={Math.min(
                      0.9,
                      Math.max(0.35, contour.intensity * 0.85 - layer * 0.05)
                    )}
                    fill="none"
                  />
                ))}
              </g>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
