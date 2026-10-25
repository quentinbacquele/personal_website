import PublicationList from './PublicationList';

export default function Publications() {
  return (
    <section id="publications" className="wrap pt-24 md:pt-36">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-x-8 gap-y-3 md:mb-12">
        <h2 className="h-section">Publications</h2>
        <p className="text-[15px]">
          Also on{' '}
          <a
            href="https://scholar.google.com/citations?user=QT01HUEAAAAJ&hl=en"
            target="_blank"
            rel="noopener noreferrer"
            className="link"
          >
            Google Scholar
          </a>
          .
        </p>
      </div>
      <PublicationList />
    </section>
  );
}
