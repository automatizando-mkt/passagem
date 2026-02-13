"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
      <h2 className="text-2xl font-bold">Algo deu errado</h2>
      <p className="text-muted-foreground">{error.message}</p>
      {error.digest && (
        <p className="text-sm text-muted-foreground">Digest: {error.digest}</p>
      )}
      <button
        onClick={reset}
        className="rounded bg-primary px-4 py-2 text-primary-foreground"
      >
        Tentar novamente
      </button>
    </div>
  );
}
