import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/global2.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <head>
        <title>Gerenciamento de agendamentos</title>
      </head>
      <body>{children}</body>
    </html>
  );
}
