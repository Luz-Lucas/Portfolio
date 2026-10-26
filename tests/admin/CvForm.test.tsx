import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

const uploadCv = vi.fn();
vi.mock('@/app/admin/actions', () => ({ uploadCv }));
const { CvForm } = await import('@/app/admin/CvForm');

const pdf = (mb: number) => new File([new Uint8Array(Math.round(mb * 1024 * 1024))], 'cv.pdf', { type: 'application/pdf' });

function submit(file: File) {
  render(<CvForm currentUrl={null} />);
  const input = document.querySelector('input[type="file"]') as HTMLInputElement;
  fireEvent.change(input, { target: { files: [file] } });
  fireEvent.submit(input.closest('form')!);
}

describe('CvForm', () => {
  beforeEach(() => {
    uploadCv.mockClear();
  });

  it('rejects a too-large file in the browser without calling the server', async () => {
    submit(pdf(4.5));
    expect(await screen.findByText('Arquivo maior que 4 MB.')).toBeInTheDocument();
    expect(uploadCv).not.toHaveBeenCalled();
  });

  it('shows a message instead of crashing when the request fails', async () => {
    uploadCv.mockImplementation(async () => {
      throw new Error('413');
    });
    submit(pdf(0.001));
    await vi.waitFor(() => expect(screen.getByText('Não foi possível enviar. Tente de novo.')).toBeInTheDocument());
  });
});
