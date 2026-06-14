import Link from "next/link"

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground">
      <div className="text-center">
        <p className="font-mono text-8xl font-bold text-primary">404</p>
        <h1 className="mt-4 font-mono text-xl font-semibold tracking-wide">
          MODULE NOT FOUND
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The requested resource does not exist in this terminal.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-sm border border-primary/20 bg-primary/10 px-6 py-2.5 font-mono text-sm font-semibold text-primary transition-colors hover:bg-primary/20"
        >
          ← Return to Dashboard
        </Link>
      </div>
    </div>
  )
}
