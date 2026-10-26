import type { SiteContent } from '@/content/types';
import { renderMarkdown } from '@/lib/markdown';

export function About({ content }: { content: SiteContent }) {
  const a = content.about;
  return (
    <div className="p3d-about">
      <div className="p3d-about-head">
        {a.photoUrl ? (
          <img className="p3d-avatar" src={a.photoUrl} alt={`Foto de ${a.name}`} width={96} height={96} />
        ) : (
          <div className="p3d-avatar is-placeholder" role="img" aria-label="Avatar">
            {a.name.charAt(0)}
          </div>
        )}
        <div>
          <h2>{a.name}</h2>
          <p>{a.role}</p>
          <ul className="p3d-facts">
            <li>
              <b>Local:</b> <span>{a.location}</span>
            </li>
            <li>
              <b>Status:</b> <span>{a.availability}</span>
            </li>
          </ul>
        </div>
      </div>
      <fieldset>
        <legend>Bio</legend>
        {renderMarkdown(a.bio)}
      </fieldset>
    </div>
  );
}
