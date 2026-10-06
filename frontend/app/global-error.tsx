'use client';

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center bg-background px-4 font-sans">
        <div role="alert" className="max-w-sm space-y-3 text-center">
          <h1 className="text-lg font-medium">Something went wrong</h1>
          <p className="text-sm text-muted-foreground">
            RapidAid hit an unexpected problem. Please try again.
          </p>
          <button
            type="button"
            onClick={reset}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
