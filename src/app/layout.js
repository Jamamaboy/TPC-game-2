import './globals.css';

export const metadata = {
  title: 'Star Personality Quiz',
  description: 'Discover which star personality matches yours',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
