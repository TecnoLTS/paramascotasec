import "./globals.css";

export const metadata = {
  title: "Ejemplo",
  description: "Sitio Next.js de ejemplo servido por el gateway",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
