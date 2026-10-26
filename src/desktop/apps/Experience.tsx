import type { ExperienceItem, SiteContent } from '@/content/types';

const byStartDesc = (a: ExperienceItem, b: ExperienceItem) => b.start.localeCompare(a.start);

export function Experience({ content }: { content: SiteContent }) {
  const items = [
    ...content.experience.filter((e) => e.kind === 'job').sort(byStartDesc),
    ...content.experience.filter((e) => e.kind === 'education').sort(byStartDesc),
  ];
  return (
    <ul className="p3d-timeline">
      {items.map((e) => (
        <li key={`${e.kind}-${e.title}-${e.start}`} className={`is-${e.kind}`}>
          <h3>{e.title}</h3>
          <p className="p3d-org">
            {e.org} · {e.start} – {e.end ?? 'Atual'}
          </p>
          <p>{e.description}</p>
        </li>
      ))}
    </ul>
  );
}
