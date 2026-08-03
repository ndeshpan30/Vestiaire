import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'VESTIAIRE — Closet Editorial & AI Outfit Stylist',
  description: 'Curated luxury wardrobe architecture, high-contrast typography, and automated AI outfit pairing.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-white text-[#121212] antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
