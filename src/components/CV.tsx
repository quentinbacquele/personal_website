import { Download } from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import CVTimeline from './CVTimeline';
import ContactIcons from './ContactIcons';
import PressCard from './PressCard';
import PublicationList from './PublicationList';
import { pressExamples } from '../data/press';
import {
  education,
  funding,
  otherExperience,
  presentations,
  researchExperience,
  supervision,
  teaching,
  type CVEntry,
} from '../data/cv';

const sections = [
  { id: 'overview', title: 'Overview' },
  { id: 'education', title: 'Education' },
  { id: 'publications', title: 'Publications' },
  { id: 'research-experience', title: 'Research experience' },
  { id: 'presentations', title: 'Presentations' },
  { id: 'teaching', title: 'Teaching and supervision' },
  { id: 'funding', title: 'Funding' },
  { id: 'other', title: 'Other experience' },
  { id: 'media', title: 'Media' },
];

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 pt-16 first:pt-0 md:pt-20">
      <h2 className="condensed mb-5 text-[2.25rem] font-semibold leading-none md:text-[2.75rem]">{title}</h2>
      {children}
    </section>
  );
}

function Logos({ logos }: { logos: NonNullable<CVEntry['logos']> }) {
  return (
    <div className="flex flex-wrap gap-2.5">
      {logos.map((logo) => (
        <div key={logo.src} className="flex h-14 w-24 items-center justify-center bg-plate p-1.5">
          <img src={logo.src} alt={logo.alt} loading="lazy" className="max-h-full max-w-full object-contain" />
        </div>
      ))}
    </div>
  );
}

function Details({ details }: { details: string[] }) {
  return (
    <ul className="mt-3 list-disc space-y-1.5 pl-5 text-[15px] leading-relaxed marker:text-trace">
      {details.map((detail) => (
        <li key={detail}>{detail}</li>
      ))}
    </ul>
  );
}

function Entries({ entries }: { entries: CVEntry[] }) {
  return (
    <ol className="rule">
      {entries.map((entry) => (
        <li
          key={`${entry.period}-${entry.title}`}
          className="grid gap-x-8 gap-y-1 border-b border-trace py-6 md:grid-cols-[7.5rem_minmax(0,1fr)]"
        >
          <span className="condensed text-xl font-semibold tabular-nums leading-tight">{entry.period}</span>
          <div>
            {entry.logos && (
              <div className="mb-4">
                <Logos logos={entry.logos} />
              </div>
            )}
            <h3 className="semi-condensed text-lg font-semibold leading-snug">{entry.title}</h3>
            {(entry.org || entry.place) && (
              <p className="mt-1 text-[15px] leading-relaxed">
                {entry.org}
                {entry.org && entry.place ? ', ' : ''}
                {entry.place && <span className="text-graphite">{entry.place}</span>}
              </p>
            )}
            {entry.note && <p className="mt-0.5 text-[15px] leading-relaxed text-graphite">{entry.note}</p>}
            {entry.details && <Details details={entry.details} />}
          </div>
        </li>
      ))}
    </ol>
  );
}

function ExperienceCards({ entries }: { entries: CVEntry[] }) {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      {entries.map((entry) => (
        <article key={entry.title} className="bg-plate p-6">
          <div className="flex items-start justify-between gap-4">
            {entry.logos ? (
              <div className="flex h-14 w-28 items-center justify-start">
                <img
                  src={entry.logos[0].src}
                  alt={entry.logos[0].alt}
                  loading="lazy"
                  className="max-h-full max-w-full object-contain"
                />
              </div>
            ) : (
              <span />
            )}
            <span className="condensed text-xl font-semibold tabular-nums">{entry.period}</span>
          </div>
          <h3 className="semi-condensed mt-5 text-lg font-semibold leading-snug">{entry.title}</h3>
          <p className="mt-1 text-[15px] leading-relaxed">
            {entry.org}
            {entry.place && <span className="text-graphite">, {entry.place}</span>}
          </p>
          {entry.note && <p className="mt-0.5 text-[15px] leading-relaxed text-graphite">{entry.note}</p>}
          {entry.details && <Details details={entry.details} />}
        </article>
      ))}
    </div>
  );
}

export default function CV() {
  const [activeSection, setActiveSection] = useState(sections[0].id);

  useEffect(() => {
    document.title = 'CV · Quentin Bacquelé';
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (observed) => {
        const visible = observed.filter((entry) => entry.isIntersecting);
        if (visible.length > 0) {
          visible.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
          setActiveSection(visible[0].target.id);
        }
      },
      { rootMargin: '-80px 0px -65% 0px' }
    );
    sections.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-paper text-ink">
      <Navbar />

      <header className="wrap pt-8 md:pt-12">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-8">
          <div className="lg:col-span-8">
            <h1 className="condensed text-[clamp(2.75rem,4.4vw,4.25rem)] font-semibold leading-[0.92] tracking-[-0.01em]">
              Quentin Bacquelé
            </h1>
            <p className="mt-3 text-lg leading-snug md:text-[1.1875rem]">
              PhD student in bioacoustics and machine learning, EPHE–PSL
            </p>
          </div>
          <div className="lg:col-span-4 lg:justify-self-end">
            <a
              href="/pdfs/CV_Quentin_Bacquele.pdf"
              download
              className="inline-flex items-center gap-2.5 rounded-full bg-ink px-5 py-2.5 text-[15px] font-semibold text-paper transition-colors hover:bg-ink-soft focus-visible:outline-ink"
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              Download PDF
            </a>
          </div>
        </div>
        <ContactIcons className="rule mt-6 pt-4" />
      </header>

      <div className="wrap grid gap-x-14 pt-14 md:pt-20 lg:grid-cols-[12rem_minmax(0,1fr)]">
        <aside className="hidden lg:block">
          <nav className="sticky top-24" aria-label="CV sections">
            <ul className="space-y-0.5 border-l border-trace">
              {sections.map((section) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    className={`-ml-px block border-l-2 py-1.5 pl-4 text-[15px] transition-colors ${
                      activeSection === section.id
                        ? 'border-ink font-semibold text-ink'
                        : 'border-transparent text-graphite hover:text-ink'
                    }`}
                  >
                    {section.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        <main className="min-w-0">
          <Section id="overview" title="Overview">
            <div className="bg-plate p-5 md:p-7">
              <CVTimeline />
            </div>
          </Section>

          <Section id="education" title="Education">
            <Entries entries={education} />
          </Section>

          <Section id="publications" title="Publications">
            <PublicationList />
          </Section>

          <Section id="research-experience" title="Research experience">
            <ExperienceCards entries={researchExperience} />
          </Section>

          <Section id="presentations" title="Presentations">
            <Entries entries={presentations} />
          </Section>

          <Section id="teaching" title="Teaching and supervision">
            <Entries entries={teaching} />
            <h3 className="semi-condensed mb-3 mt-10 text-lg font-semibold">Supervision</h3>
            <Entries entries={supervision} />
          </Section>

          <Section id="funding" title="Funding">
            <Entries entries={funding} />
          </Section>

          <Section id="other" title="Other experience">
            <Entries entries={otherExperience} />
          </Section>

          <Section id="media" title="Media">
            <p className="prose-body mb-8 max-w-2xl">
              Interviewed by the BBC, NPR, Le Monde, France Culture, Deutschlandfunk and others.{' '}
              <Link to="/press" className="link">
                See all coverage
              </Link>
              .
            </p>
            <div className="grid gap-x-6 gap-y-10 sm:grid-cols-3">
              {pressExamples.map((item) => (
                <PressCard key={item.outlet} item={item} />
              ))}
            </div>
          </Section>
        </main>
      </div>

      <Footer />
    </div>
  );
}
