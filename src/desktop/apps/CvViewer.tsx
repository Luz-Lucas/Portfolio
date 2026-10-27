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
      {/* Esconde a barra e o painel do leitor de PDF (Chrome/Edge): fica só a página, na largura da janela. */}
      <iframe title="Currículo" src={`${content.cvUrl}#toolbar=0&navpanes=0&view=FitH`} />
    </div>
  );
}
