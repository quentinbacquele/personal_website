// A one-glance view of the CV: multi-year roles as bars, short projects as dots, papers as diamonds.
// Each lane takes one colour from the landing spectrogram's palette, so the overview reads like the
// rest of the site's figures; every mark is also labelled, so colour is never the only cue. Within
// Education the PhD is the one deep bar. Bar labels stay ink, or white on that deep fill.
const START = 2018;
const END = 2028;

const FILLS = {
  study: '#7fc8d3', // light teal
  phd: '#0f4f5c', // deep teal
  teaching: '#d19a12', // mustard
  other: '#4a9ad6', // blue
} as const;
const MARKS = {
  papers: '#d4561c', // terracotta
  research: '#2e9d6e', // green
} as const;

type Span = { from: number; to: number; label: string; fill: keyof typeof FILLS };
type Point = { at: number; label: string; side?: 'left' };

const lanes: { name: string; mark?: keyof typeof MARKS; rows: (Span | Point)[][] }[] = [
  {
    name: 'Education',
    rows: [
      [
        { from: 2018, to: 2020, label: 'BCPST', fill: 'study' },
        { from: 2020, to: 2021, label: 'B.Sc.', fill: 'study' },
        { from: 2021, to: 2024, label: 'M.Sc. Ecology and data science', fill: 'study' },
        { from: 2024, to: 2027, label: 'PhD, EPHE–PSL', fill: 'phd' },
      ],
      [{ from: 2023, to: 2024, label: 'MoBi', fill: 'study' }],
    ],
  },
  {
    name: 'Papers',
    mark: 'papers',
    rows: [
      [
        { at: 2025.92, label: 'NeurIPS 2025', side: 'left' },
        { at: 2026.55, label: 'Science 2026' },
      ],
    ],
  },
  {
    name: 'Research',
    mark: 'research',
    rows: [
      [
        { at: 2022.5, label: 'Dolphins' },
        { at: 2024.5, label: 'UC Berkeley' },
      ],
      [
        { at: 2023.4, label: 'Planarians', side: 'left' },
        { at: 2023.6, label: 'Chimpanzees' },
      ],
    ],
  },
  {
    name: 'Teaching',
    rows: [[{ from: 2024, to: 2026.5, label: 'Jean Monnet University · ENS', fill: 'teaching' }]],
  },
  {
    name: 'Other',
    rows: [[{ from: 2022, to: 2024, label: 'FauNet', fill: 'other' }]],
  },
];

const pct = (year: number) => `${((year - START) / (END - START)) * 100}%`;
const years = Array.from({ length: END - START + 1 }, (_, i) => START + i);

function nowAsYear() {
  const d = new Date();
  return d.getFullYear() + d.getMonth() / 12 + d.getDate() / 365;
}

export default function CVTimeline() {
  const now = nowAsYear();

  return (
    <figure className="overflow-x-auto">
      <div className="min-w-[44rem]">
        <div className="grid grid-cols-[6.5rem_minmax(0,1fr)]">
          <div />
          <div className="relative h-6 text-xs tabular-nums text-graphite">
            {years.slice(0, -1).map((year) => (
              <span key={year} className="absolute top-0" style={{ left: pct(year) }}>
                {year}
              </span>
            ))}
          </div>
        </div>

        <div className="relative">
          {/* Year gridlines and the current date, drawn behind the lanes; the date is labelled under them. */}
          <div className="pointer-events-none absolute inset-y-0 left-[6.5rem] right-0">
            {years.map((year) => (
              <div key={year} className="absolute inset-y-0 border-l border-ink/[0.08]" style={{ left: pct(year) }} />
            ))}
            {now > START && now < END && (
              <div className="absolute inset-y-0 border-l border-dashed border-ink/60" style={{ left: pct(now) }}>
                <span className="absolute -bottom-0.5 left-1.5 text-xs font-semibold text-ink">Now</span>
              </div>
            )}
          </div>

          {lanes.map((lane) => (
            <div key={lane.name} className="grid grid-cols-[6.5rem_minmax(0,1fr)] border-t border-ink/10 py-2">
              <span className="pt-1 text-[13px] font-medium text-ink">{lane.name}</span>
              <div className="space-y-1.5">
                {lane.rows.map((row, r) => (
                  <div key={r} className="relative h-5">
                    {row.map((item) =>
                      'from' in item ? (
                        <div
                          key={item.label}
                          className={`absolute inset-y-0 flex items-center overflow-hidden whitespace-nowrap px-2 text-xs ${
                            item.fill === 'phd' ? 'font-semibold text-white' : 'font-medium text-ink'
                          }`}
                          style={{
                            left: pct(item.from),
                            width: `calc(${pct(item.to)} - ${pct(item.from)} - 2px)`,
                            background: FILLS[item.fill],
                          }}
                          title={item.label}
                        >
                          {item.label}
                        </div>
                      ) : (
                        // Labels sit on a white backing so the date line passes behind them.
                        <div
                          key={item.label}
                          className={`absolute inset-y-0 flex items-center gap-1.5 whitespace-nowrap text-xs ${
                            item.side === 'left' ? 'flex-row-reverse' : ''
                          } ${lane.mark === 'papers' ? 'font-semibold text-ink' : 'text-ink-soft'}`}
                          style={
                            item.side === 'left'
                              ? { right: `calc(100% - ${pct(item.at)} - 5px)` }
                              : { left: `calc(${pct(item.at)} - 5px)` }
                          }
                        >
                          <span
                            className={`shrink-0 ${lane.mark === 'papers' ? 'h-3 w-3 rotate-45' : 'h-2.5 w-2.5 rounded-full'}`}
                            style={{ background: lane.mark && MARKS[lane.mark] }}
                          />
                          <span className="bg-plate px-0.5">{item.label}</span>
                        </div>
                      )
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
          <div className="h-5 border-t border-ink/10" />
        </div>
      </div>
    </figure>
  );
}
