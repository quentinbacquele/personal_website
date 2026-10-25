import { publications } from '../data/publications';

const SELF = 'Quentin Bacquelé';

function Authors({ authors }: { authors: string }) {
  const [before, after] = authors.split(SELF);
  if (after === undefined) return <>{authors}</>;
  return (
    <>
      {before}
      <span className="font-semibold text-ink">{SELF}</span>
      {after}
    </>
  );
}

// A real table on wide screens; on phones each row stacks into a short record.
export default function PublicationList() {
  return (
    <div className="rule md:border-t-0">
      <table className="w-full border-collapse text-left">
        <thead className="hidden md:table-header-group">
          <tr className="border-b-[3px] border-ink text-sm text-graphite">
            <th scope="col" className="w-28 pb-2.5 pr-6 font-medium">
              Year
            </th>
            <th scope="col" className="pb-2.5 pr-6 font-medium">
              Title and authors
            </th>
            <th scope="col" className="w-56 pb-2.5 font-medium">
              Venue
            </th>
          </tr>
        </thead>
        <tbody>
          {publications.map((paper) => (
            <tr key={paper.title} className="grid border-b border-trace py-5 md:table-row md:py-0">
              <td className="condensed text-2xl font-semibold tabular-nums leading-none md:py-6 md:pr-6 md:align-top md:text-[1.75rem]">
                {paper.year}
              </td>
              <td className="mt-2.5 md:mt-0 md:py-6 md:pr-6 md:align-top">
                {paper.link ? (
                  <a
                    href={paper.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="semi-condensed text-xl font-semibold leading-snug decoration-1 underline-offset-[0.2em] hover:underline md:text-[1.375rem]"
                  >
                    {paper.title}
                  </a>
                ) : (
                  <span className="semi-condensed text-xl font-semibold leading-snug md:text-[1.375rem]">{paper.title}</span>
                )}
                <p className="mt-1.5 text-[15px] leading-relaxed text-graphite">
                  <Authors authors={paper.authors} />
                </p>
              </td>
              <td className="mt-1 italic md:mt-0 md:py-6 md:align-top">{paper.journal}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
