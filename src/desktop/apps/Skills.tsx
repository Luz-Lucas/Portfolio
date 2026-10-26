import type { SiteContent, SkillGroup } from '@/content/types';

type Item = SkillGroup['items'][number];

function Meter({ item }: { item: Item & { level: number } }) {
  return (
    <span className="p3d-meter" role="img" aria-label={`${item.name}: nível ${item.level} de 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <i key={n} className={n <= item.level ? 'is-on' : undefined} />
      ))}
    </span>
  );
}

export function Skills({ content }: { content: SiteContent }) {
  return (
    <div className="p3d-skills">
      {content.skills.map((g) => {
        const rated = g.items.filter((s): s is Item & { level: 1 | 2 | 3 | 4 | 5 } => s.level !== undefined);
        const tags = g.items.filter((s) => s.level === undefined);
        return (
          <fieldset key={g.group}>
            <legend>
              <h3>{g.group}</h3>
            </legend>
            {g.description && <p className="p3d-skill-desc">{g.description}</p>}
            {rated.length > 0 && (
              <table>
                <tbody>
                  {rated.map((s) => (
                    <tr key={s.name}>
                      <th scope="row">{s.name}</th>
                      <td>
                        <Meter item={s} />
                      </td>
                      <td className="p3d-years">{s.years ? `${s.years} ${s.years === 1 ? 'ano' : 'anos'}` : ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {tags.length > 0 && (
              <ul className="p3d-tags">
                {tags.map((s) => (
                  <li key={s.name}>{s.name}</li>
                ))}
              </ul>
            )}
          </fieldset>
        );
      })}
    </div>
  );
}
