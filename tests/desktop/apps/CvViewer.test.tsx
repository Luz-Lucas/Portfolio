import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { CvViewer } from '@/desktop/apps/CvViewer';
import { SEED_CONTENT } from '@/content/seed';

const getDocument = vi.fn();
vi.mock('pdfjs-dist', () => ({
  GlobalWorkerOptions: {},
  getDocument: (src: unknown) => getDocument(src),
}));

const fakePage = { getViewport: ({ scale }: { scale: number }) => ({ width: 600 * scale, height: 800 * scale }), render: () => ({ promise: Promise.resolve() }) };

describe('CvViewer', () => {
  it('draws every page itself (no browser PDF viewer, no toolbar) in a scrollable area', async () => {
    getDocument.mockReturnValue({ promise: Promise.resolve({ numPages: 2, getPage: async () => fakePage }) });
    render(<CvViewer content={{ ...SEED_CONTENT, cvUrl: '/cv.pdf' }} />);
    expect(document.querySelector('iframe')).toBeNull();
    const doc = screen.getByRole('document', { name: 'Currículo' });
    await waitFor(() => expect(doc.querySelectorAll('canvas')).toHaveLength(2));
    expect(getDocument).toHaveBeenCalledWith({ url: '/cv.pdf' });
    expect(screen.getByRole('link', { name: 'Baixar' })).toHaveAttribute('download');
  });

  it('falls back to a link when the PDF cannot be drawn', async () => {
    getDocument.mockReturnValue({ promise: Promise.reject(new Error('rede')) });
    render(<CvViewer content={{ ...SEED_CONTENT, cvUrl: '/cv.pdf' }} />);
    expect(await screen.findByRole('link', { name: 'Abrir o currículo' })).toHaveAttribute('href', '/cv.pdf');
  });
});
