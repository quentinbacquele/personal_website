import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { publications } from '../data/publications';

const [science, hacnet] = publications;

const themes = [
  {
    title: 'Acoustic biogeography',
    text: 'How and why bird vocalizations vary across species, regions and environments.',
    href: '#biogeography',
  },
  {
    title: 'Dialects and speciation',
    text: 'How song dialects emerge between neighbouring populations and relate to the formation of new species.',
    href: '#dialects',
  },
  {
    title: 'AI-driven discovery of units',
    text: 'Models that find the units of animal vocalizations, such as notes and syllables, without labels.',
    href: '#units',
  },
  {
    title: 'Generative models of animal communication',
    text: 'Language-model and speech-to-speech approaches that learn from vocal sequences and generate new sounds.',
  },
];

function Plate({
  src,
  alt,
  width,
  height,
  caption,
  className = '',
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  caption: ReactNode;
  className?: string;
}) {
  return (
    <figure className={className}>
      <a href={src} target="_blank" rel="noopener noreferrer" className="plate">
        <img src={src} alt={alt} width={width} height={height} loading="lazy" decoding="async" className="h-auto w-full" />
      </a>
      <figcaption className="meta mt-3 max-w-[68ch]">{caption}</figcaption>
    </figure>
  );
}

function TextLink({ href, children }: { href: string; children: ReactNode }) {
  return href.startsWith('http') ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className="link">
      {children}
    </a>
  ) : (
    <Link to={href} className="link">
      {children}
    </Link>
  );
}

// Each project opens like a record: the title, closed by the heavy rule, then one citation line under it.
function Project({
  id,
  title,
  venue,
  people,
  links = [],
  children,
}: {
  id: string;
  title: string;
  venue: ReactNode;
  people: string;
  links?: { label: string; href: string }[];
  children: ReactNode;
}) {
  return (
    <article id={id} className="scroll-mt-20 pt-24 md:pt-32">
      <header className="mb-8 md:mb-10">
        <h3 className="h-record max-w-[26ch] lg:max-w-none">{title}</h3>
        <div className="rule meta mt-4 flex flex-col gap-x-10 gap-y-1 pt-3 md:mt-5 lg:flex-row lg:items-baseline lg:justify-between">
          <p className="lg:max-w-[75%]">
            <span className="mr-5 font-semibold text-ink">{venue}</span>
            {people}
          </p>
          {links.length > 0 && (
            <p className="flex shrink-0 flex-wrap gap-x-5 text-ink">
              {links.map((link) => (
                <TextLink key={link.href} href={link.href}>
                  {link.label}
                </TextLink>
              ))}
            </p>
          )}
        </div>
      </header>
      {children}
    </article>
  );
}

export default function Research() {
  return (
    <section id="research" className="wrap pt-24 md:pt-36">
      <h2 className="h-section">Research</h2>

      <div className="mt-6 grid items-start gap-10 md:mt-8 lg:grid-cols-12 lg:gap-8">
        <ol className="rule lg:col-span-5">
          {themes.map((theme) => {
            const body = (
              <>
                <span
                  className={`semi-condensed block text-xl font-semibold leading-tight md:text-[1.375rem] ${
                    theme.href ? 'underline decoration-1 underline-offset-[0.2em] group-hover:decoration-2' : ''
                  }`}
                >
                  {theme.title}
                </span>
                <span className="mt-1.5 block text-[15px] leading-relaxed text-graphite md:text-base">{theme.text}</span>
              </>
            );
            return (
              <li key={theme.title} className="border-b border-trace">
                {theme.href ? (
                  <a href={theme.href} className="group block py-5">
                    {body}
                  </a>
                ) : (
                  <div className="py-5">{body}</div>
                )}
              </li>
            );
          })}
        </ol>

        <Plate
          className="lg:col-span-6 lg:col-start-7"
          src="/images/bacquele_science_2026/fig2-web.jpg"
          alt="The eight song motifs mapped across the passerine family tree, with their links to social organisation, morphology and mating system"
          width={2000}
          height={1316}
          caption={
            <>
              The eight song motifs across the passerine family tree, from Bacquelé et al., <i>Science</i> 2026.
            </>
          }
        />
      </div>

      <Project
        id="biogeography"
        title="The global biogeography of passerine songs"
        venue={
          <>
            <i>Science</i>, 2026
          </>
        }
        people="With Jean-Yves Barnagaud, Cyrille Violle, Frédéric Theunissen and Nicolas Mathevon."
        links={[
          { label: 'Read the paper', href: science.link! },
          { label: 'Press coverage', href: '/press' },
        ]}
      >
        <div className="grid items-start gap-10 lg:grid-cols-12 lg:gap-8">
          <Plate
            className="lg:col-span-6"
            src="/images/bacquele_science_2026/fig4-map-web.jpg"
            alt="World map of song transmission efficiency, highest in the Amazon, the Congo Basin and Southeast Asia"
            width={1600}
            height={1041}
            caption="How efficiently the songs of each region transmit through the environment, from low (purple) to high (yellow)."
          />
          <div className="prose-body lg:sticky lg:top-24 lg:col-span-5 lg:col-start-8">
            <p>
              With machine learning, we analysed 116,792 recordings of 3,160 passerine species from the community
              database xeno-canto. Their songs can be described with eight recurring motifs:
              three kinds of whistles, three kinds of trills, harmonic stacks and chaotic notes. A species uses five of
              them on average.
            </p>
            <p>
              Where a species lives shapes which motifs it favours. In dense tropical forests, simple motifs such as
              flat whistles, which carry well through vegetation, dominate. In temperate regions, complex motifs such as
              ultrafast trills are more common.
            </p>
          </div>
        </div>
      </Project>

      <Project
        id="units"
        title="HAC-Net: learning natural units from acoustic change"
        venue={
          <>
            <i>NeurIPS</i>, 2025
          </>
        }
        people="With Jean-Yves Barnagaud, Frédéric Theunissen and Nicolas Mathevon."
        links={[{ label: 'Read the paper', href: hacnet.link! }]}
      >
        <div className="grid items-start gap-10 lg:grid-cols-12 lg:gap-8">
          <div className="prose-body lg:sticky lg:top-24 lg:col-span-5">
            <p>
              Analysing vocalizations usually starts by cutting recordings into units such as notes or syllables.
              HAC-Net learns to do this without labels. It places a boundary wherever the sound changes, and learns
              where to cut by rebuilding the signal from those boundaries alone.
            </p>
            <p>The units it finds can then be used to segment, compare and generate vocalizations.</p>
          </div>
          <Plate
            className="lg:col-span-6 lg:col-start-7"
            src="/images/bacquele_hacnet_neurips_2025/pipeline-web.jpg"
            alt="HAC-Net diagram: a White-crowned Sparrow song is encoded, cut where the sound changes, compressed and reconstructed"
            width={1600}
            height={1655}
            caption="HAC-Net detects acoustic changes, compresses the signal at those boundaries, and is trained to reconstruct it."
          />
        </div>
      </Project>

      <Project
        id="dialects"
        title="Song dialects of the Réunion Grey White-eye"
        venue="Fieldwork on La Réunion"
        people="With Bárbara Freitas, Pierre J. Février, Borja Milá, Nicolas Mathevon, Frédéric Theunissen and Christophe Thébaud."
      >
        {/* One height for the three photos, so none dominates the others. */}
        <div className="grid grid-cols-2 gap-2.5 lg:h-[clamp(300px,30vw,440px)] lg:grid-cols-[1.4fr_1fr_1fr] lg:grid-rows-[minmax(0,1fr)]">
          <img
            src="/images/field_reunion/white-eyes-web.jpg"
            alt="Two Réunion Grey White-eyes perched among red leaves"
            width={1200}
            height={1851}
            loading="lazy"
            decoding="async"
            className="col-span-2 aspect-[4/3] h-full min-h-0 w-full object-cover object-[50%_45%] lg:col-span-1 lg:aspect-auto"
          />
          <img
            src="/images/field_reunion/recorder-web.jpg"
            alt="Audio recorder on a tripod under a tree, with a second recorder hanging in the branches"
            width={1200}
            height={1600}
            loading="lazy"
            decoding="async"
            className="aspect-[3/4] h-full min-h-0 w-full object-cover lg:aspect-auto"
          />
          <img
            src="/images/field_reunion/laptop-web.jpg"
            alt="Quentin checking spectrograms on a laptop in the forest"
            width={1200}
            height={1600}
            loading="lazy"
            decoding="async"
            className="aspect-[3/4] h-full min-h-0 w-full object-cover object-[50%_40%] lg:aspect-auto"
          />
        </div>
        <div className="prose-body mt-8 grid max-w-none gap-x-16 gap-y-4 lg:grid-cols-2 [&>p+p]:mt-0">
          <p>
            The Réunion Grey White-eye (<i>Zosterops borbonicus</i>) lives only on La Réunion, where four forms of the
            species occur side by side. How do their song dialects emerge, and how do they relate to the formation of new
            species?
          </p>
          <p>
            I measure how their songs differ by following the pitch contour of each note, a method I developed with
            Frédéric Theunissen at UC Berkeley.
          </p>
        </div>
      </Project>
    </section>
  );
}
