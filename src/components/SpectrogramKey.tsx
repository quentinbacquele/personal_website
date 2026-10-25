import { Volume2, VolumeX } from 'lucide-react';

// Same stops as the spectrogram's fragment shader, so the legend reads the surface correctly.
const COLORMAP_CSS =
  'linear-gradient(90deg, #0f3338 0%, #1a5c6b 12%, #1f7a8c 24%, #2ea6b8 36%, #40b399 48%, #6bbf7a 56%, #b3d161 64%, #fa992e 74%, #b82e1f 100%)';

type SpectrogramKeyProps = {
  isMuted: boolean;
  /** Left out while the plot is still loading: the button then shows but does nothing. */
  onToggle?: () => void;
  className?: string;
};

// The sound control and the colour scale read together as the plot's key. It lives apart from the
// plot so the page can show it, at its final size, before the 3D code has arrived.
export default function SpectrogramKey({ isMuted, onToggle, className = '' }: SpectrogramKeyProps) {
  return (
    <div className={`flex flex-wrap items-center gap-x-7 gap-y-3 ${className}`}>
      <button
        onClick={onToggle}
        disabled={!onToggle}
        aria-pressed={!isMuted}
        className="inline-flex items-center gap-2.5 rounded-full bg-ink px-5 py-2.5 text-[15px] font-semibold text-paper transition-colors hover:bg-ink-soft focus-visible:outline-ink disabled:cursor-default"
      >
        {isMuted ? <Volume2 size={16} aria-hidden="true" /> : <VolumeX size={16} aria-hidden="true" />}
        {isMuted ? 'Play sound' : 'Mute'}
      </button>
      <div className="w-32 text-xs text-graphite sm:w-36" aria-hidden="true">
        <div className="h-1.5" style={{ backgroundImage: COLORMAP_CSS }} />
        <div className="mt-1.5 flex justify-between">
          <span>Quiet</span>
          <span>Loud</span>
        </div>
      </div>
    </div>
  );
}
