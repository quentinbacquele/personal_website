import { useState, type ReactNode } from 'react';
import type { PressItem } from '../data/press';

const LANGUAGES = { fr: 'French', nl: 'Dutch', de: 'German', es: 'Spanish', it: 'Italian', ru: 'Russian' } as const;

function metaLine(item: PressItem) {
  return `${item.kind}, ${item.date}${item.language ? `, in ${LANGUAGES[item.language]}` : ''}`;
}

function Linked({ item, className, children }: { item: PressItem; className: string; children: ReactNode }) {
  if (!item.link) return <div className={className}>{children}</div>;
  return (
    <a href={item.link} target="_blank" rel="noopener noreferrer" lang={item.language} className={className}>
      {children}
    </a>
  );
}

type Size = 'feature' | 'default' | 'compact';

function Picture({ item, size }: { item: PressItem; size: Size }) {
  const [failed, setFailed] = useState(false);

  if (item.image && !failed) {
    return (
      <div className="aspect-[3/2] overflow-hidden bg-paper-deep">
        <img
          src={item.image}
          alt={item.imageAlt ?? ''}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
          className={`h-full w-full transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100 ${
            item.imageFit === 'contain' ? 'object-contain' : 'object-cover'
          }`}
        />
      </div>
    );
  }

  // No share image: the outlet's logo, or its name set in type, on a white mount.
  return (
    <div className="flex aspect-[3/2] items-center justify-center bg-plate p-8">
      {item.logo ? (
        <img
          src={item.logo}
          alt={`${item.outlet} logo`}
          loading="lazy"
          className={`max-w-[75%] object-contain ${size === 'feature' ? 'max-h-28 md:max-h-32' : 'max-h-14'}`}
        />
      ) : (
        <span
          className={`condensed text-center font-semibold leading-none ${
            size === 'feature' ? 'text-5xl md:text-6xl' : size === 'compact' ? 'text-2xl' : 'text-3xl'
          }`}
        >
          {item.outlet}
        </span>
      )}
    </div>
  );
}

const TITLE: Record<Size, string> = {
  feature: 'text-xl md:text-[1.625rem]',
  default: 'text-lg md:text-xl',
  compact: 'text-[1.0625rem] md:text-lg',
};

export default function PressCard({ item, size = 'default' }: { item: PressItem; size?: Size }) {
  return (
    <article>
      <Linked item={item} className="group block">
        <Picture item={item} size={size} />
        <p className="mt-3.5 text-sm font-semibold">{item.outlet}</p>
        <h3
          className={`semi-condensed mt-1 font-semibold leading-snug decoration-1 underline-offset-[0.2em] group-hover:underline ${TITLE[size]}`}
        >
          {item.title}
        </h3>
      </Linked>
      {item.note && <p className="meta mt-1.5">{item.note}</p>}
      <p className="meta mt-1.5">
        {metaLine(item)}
        {item.also && (
          <>
            {'. Also in '}
            {item.also.map((version, i) => (
              <span key={version.href}>
                {i > 0 && ' and '}
                <a href={version.href} target="_blank" rel="noopener noreferrer" className="link text-ink">
                  {version.label}
                </a>
              </span>
            ))}
          </>
        )}
      </p>
    </article>
  );
}
