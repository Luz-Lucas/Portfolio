import type { SiteContent } from '@/content/types';

export function Skills({ content }: { content: SiteContent }) {
  return (
    <div className="p3d-skills">
      {content.skills.map((g) => (
        <fieldset key={g.group}>
          <legend>
            <h3>{g.group}</h3>
          </legend>
          <table>
            <tbody>
              {g.items.map((s) => (
                <tr key={s.name}>
                  <th scope="row">{s.name}</th>
                  <td>
                    <span className="p3d-meter" role="img" aria-label={`${s.name}: nível ${s.level} de 5`}>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <i key={n} className={n <= s.level ? 'is-on' : undefined} />
                      ))}
                    </span>
                  </td>
                  <td className="p3d-years">{s.years ? `${s.years} ${s.years === 1 ? 'ano' : 'anos'}` : ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </fieldset>
      ))}
    </div>
  );
}
