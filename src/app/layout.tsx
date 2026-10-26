import type { Metadata } from 'next';
import '98.css';
import './globals.css';

export const metadata: Metadata = {
  title: 'Portfólio',
  description: 'Portfólio de desenvolvimento',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
