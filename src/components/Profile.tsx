import { lazy, Suspense } from 'react';
import SpectrogramKey from './SpectrogramKey';
import { publications } from '../data/publications';

// The 3D plot and its three.js code load as a separate file, so the text and the portrait
// can show without waiting for them.
const RainforestSpectrogram = lazy(() => import('./RainforestSpectrogram'));

const [latest] = publications;

type IconProps = { className?: string };

// Solid glyphs (Heroicons, MIT): they sit beside the name without a ring around them.
const EnvelopeIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M1.5 8.67v8.58a3 3 0 0 0 3 3h15a3 3 0 0 0 3-3V8.67l-8.928 5.493a3 3 0 0 1-3.144 0L1.5 8.67Z" />
    <path d="M22.5 6.908V6.75a3 3 0 0 0-3-3h-15a3 3 0 0 0-3 3v.158l9.714 5.978a1.5 1.5 0 0 0 1.572 0L22.5 6.908Z" />
  </svg>
);

const PinIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="m11.54 22.351.07.04.028.016a.76.76 0 0 0 .723 0l.028-.015.071-.041a16.975 16.975 0 0 0 1.144-.742 19.58 19.58 0 0 0 2.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 0 0-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 0 0 2.682 2.282 16.975 16.975 0 0 0 1.145.742ZM12 13.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
    />
  </svg>
);

const external = { target: '_blank', rel: 'noopener noreferrer' } as const;

// Shared by the plot and its loading placeholder, so nothing moves when the plot arrives.
const PLOT_BOX = 'h-[260px] sm:h-[400px] lg:h-auto lg:flex-1';
const KEY_BOX = 'mt-3 sm:justify-center';

// The landing fills the first screen (capped on very tall screens) and closes on a hairline rule.
// Two columns: on the left the portrait, captioned by the name and a short introduction just under it;
// on the right the sound, as large as its column allows, with its key under it. The photo and the plot
// share a top edge, the paragraph and the key a bottom edge; the photo takes whatever height is left.
// Below lg everything stacks in reading order: photo, name, paragraph, plot, key.
export default function Profile() {
  return (
    <section
      aria-label="Introduction"
      className="wrap flex flex-col pt-5 md:pt-7 lg:h-[min(calc(100svh-4rem),64rem)] lg:min-h-[38rem] lg:pb-6"
    >
      <div className="grid flex-1 grid-cols-1 lg:min-h-0 lg:grid-cols-12 lg:gap-x-10">
        <div className="flex flex-col lg:col-span-5 lg:min-h-0">
          {/* Tall screens give the photo a near-square box: the portrait crop keeps face and microphone together. */}
          {/* index.html preloads the same AVIF file this picks, so keep the two in step. */}
          <picture className="block lg:min-h-[12rem] lg:flex-1">
            <source
              media="(min-width: 1024px) and (min-height: 1000px)"
              srcSet="/images/profile/portrait-web.avif"
              type="image/avif"
            />
            <source media="(min-width: 1024px) and (min-height: 1000px)" srcSet="/images/profile/portrait-web.jpg" />
            <source srcSet="/images/profile/portrait-wide-web.avif" type="image/avif" />
            <img
              src="/images/profile/portrait-wide-web.jpg"
              alt="Quentin Bacquelé recording birdsong with headphones and a parabolic microphone"
              width={1200}
              height={750}
              decoding="async"
              fetchPriority="high"
              className="aspect-[8/5] w-full object-cover lg:aspect-auto lg:h-full lg:object-[30%_45%] [@media(min-width:1024px)_and_(min-height:1000px)]:object-[50%_85%]"
            />
          </picture>
          <div className="mt-5 lg:mt-6">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
              <h1 className="condensed text-[2.375rem] font-semibold leading-none tracking-[-0.005em]">
                Quentin Bacquelé
              </h1>
              <div className="flex items-center gap-4">
                <span className="inline-flex items-center gap-1.5 text-[15px] text-graphite">
                  <PinIcon className="h-[18px] w-[18px] text-ink" />
                  Lyon
                </span>
                <a
                  href="mailto:qbacquele@gmail.com"
                  aria-label="Email Quentin Bacquelé"
                  title="qbacquele@gmail.com"
                  className="inline-flex p-0.5 transition-opacity hover:opacity-60 focus-visible:outline-ink"
                >
                  <EnvelopeIcon className="h-[22px] w-[22px]" />
                </a>
              </div>
            </div>
            <p className="mt-1.5 text-[17px] leading-snug text-graphite">
              PhD student in bioacoustics and machine learning
            </p>

            <p className="mt-5 max-w-[62ch] text-[1.0625rem] leading-[1.6] lg:text-[1.125rem]">
              I study bird vocalizations at a global scale, and build{' '}
              <span className="whitespace-nowrap">machine-learning</span> methods to model how animals communicate. I’m
              doing my PhD at{' '}
              <a href="https://www.ephe.psl.eu/" {...external} className="link">
                EPHE–PSL
              </a>{' '}
              with Nicolas Mathevon and <span className="whitespace-nowrap">Jean-Yves</span> Barnagaud, between the{' '}
              <a href="https://www.eneslab.com/" {...external} className="link">
                ENES Bioacoustics Research Lab
              </a>{' '}
              in <span className="whitespace-nowrap">Saint-Étienne</span> and{' '}
              <a href="https://www.cefe.cnrs.fr/" {...external} className="link">
                CEFE
              </a>{' '}
              in Montpellier. My latest paper,{' '}
              <a href={latest.link} {...external} className="link">
                {latest.title}
              </a>
              , is out in <i>{latest.journal}</i>. I’m finishing in 2027 and looking for a postdoc.
            </p>
          </div>
        </div>

        <div className="flex flex-col lg:col-span-7 lg:min-h-0">
          <Suspense
            fallback={
              <>
                <div className={`min-h-0 w-full ${PLOT_BOX}`} />
                <SpectrogramKey isMuted className={KEY_BOX} />
              </>
            }
          >
            <RainforestSpectrogram plotClassName={PLOT_BOX} keyClassName={KEY_BOX} />
          </Suspense>
        </div>
      </div>

      <div className="mt-10 border-t border-ink/20 lg:mt-6" />
    </section>
  );
}
