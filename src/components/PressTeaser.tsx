import { Link } from 'react-router-dom';
import PressCard from './PressCard';
import { allPress, pressExamples } from '../data/press';

const shown = new Set(pressExamples.map((item) => item.outlet));
const alsoCovered = allPress
  .filter((item) => !shown.has(item.outlet) && item.kind !== 'Press release')
  .map((item) => item.outlet)
  .slice(0, 10);

export default function PressTeaser() {
  return (
    <section id="press" className="wrap pt-24 md:pt-36">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-x-8 gap-y-3 md:mb-12">
        <h2 className="h-section">In the press</h2>
        <Link to="/press" className="link text-[15px]">
          All coverage
        </Link>
      </div>

      <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {pressExamples.map((item) => (
          <PressCard key={item.outlet} item={item} />
        ))}
      </div>

      <p className="meta mt-10 max-w-3xl">
        Also interviewed by {alsoCovered.join(', ')} and others.{' '}
        <Link to="/press" className="link text-ink">
          See all
        </Link>
        .
      </p>
    </section>
  );
}
