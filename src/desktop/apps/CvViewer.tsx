'use client';

import { useEffect, useRef, useState } from 'react';
import type { SiteContent } from '@/content/types';

/**
 * Desenha as páginas do PDF em canvas com o pdf.js (carregado só quando o currículo abre):
 * sem a barra, as bordas pretas e as ferramentas do leitor de PDF do navegador.
 */
function PdfPages({ url }: { url: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let cancelled = false;
    (async () => {
      try {
        const pdfjs = await import('pdfjs-dist');
        pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();
        const doc = await pdfjs.getDocument({ url }).promise;
        // nitidez: densidade da tela × escala do palco do monitor (o overlay é ampliado via CSS)
        const cssWidth = el.clientWidth || 600;
        const zoom = (el.getBoundingClientRect().width / cssWidth || 1) * (window.devicePixelRatio || 1);
        for (let n = 1; n <= doc.numPages && !cancelled; n++) {
          const page = await doc.getPage(n);
          const scale = cssWidth / page.getViewport({ scale: 1 }).width;
          const viewport = page.getViewport({ scale: scale * zoom });
          const canvas = document.createElement('canvas');
          canvas.width = Math.floor(viewport.width);
          canvas.height = Math.floor(viewport.height);
          canvas.style.width = '100%';
          canvas.setAttribute('aria-label', `Página ${n}`);
          await page.render({ canvas, canvasContext: canvas.getContext('2d')!, viewport }).promise;
          if (!cancelled) el.appendChild(canvas);
        }
      } catch (err) {
        console.error('[curriculo] não foi possível desenhar o PDF:', err);
        if (!cancelled) setFailed(true);
      }
    })();
    return () => {
      cancelled = true;
      el.replaceChildren();
    };
  }, [url]);

  return (
    <>
      <div ref={ref} className="p3d-cv-pages" role="document" aria-label="Currículo" />
      {failed && (
        <p className="p3d-empty">
          <a href={url} target="_blank" rel="noopener">
            Abrir o currículo
          </a>
        </p>
      )}
    </>
  );
}

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
      <PdfPages url={content.cvUrl} />
    </div>
  );
}
