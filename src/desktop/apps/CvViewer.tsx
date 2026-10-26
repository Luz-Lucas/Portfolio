import type { SiteContent } from '@/content/types';

export function CvViewer({ content }: { content: SiteContent }) {
  if (!content.cvUrl) return <p className="p3d-empty">Currículo em breve</p>;
  return (
    <div className="p3d-cv">
      <div className="p3d-cv-bar">
        <a className="p3d-button-link" href={content.cvUrl} download>
          Baixar
        </a>
        <a href={content.cvUrl} target="_blank" rel="noopener">
          Abrir em nova aba
        </a>
      </div>
      <iframe title="Currículo" src={content.cvUrl} />
    </div>
  );
}
