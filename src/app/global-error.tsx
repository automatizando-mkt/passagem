"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="pt-BR">
      <body style={{ fontFamily: "sans-serif", padding: "2rem", textAlign: "center" }}>
        <h2>Erro Global</h2>
        <p>{error.message}</p>
        {error.digest && <p>Digest: {error.digest}</p>}
        <button onClick={reset} style={{ marginTop: "1rem", padding: "0.5rem 1rem" }}>
          Tentar novamente
        </button>
      </body>
    </html>
  );
}
