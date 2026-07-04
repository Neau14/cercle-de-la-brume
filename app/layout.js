import './globals.css';

export const metadata = {
  title: 'Le Cercle de la Brume — Faction Démon',
  description: 'Site officiel et archives secrètes de l’alliance des Démons.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
