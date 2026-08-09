import { ArrowDown } from "lucide-react"

export function Hero() {
  return (
    <header className="relative mx-auto flex min-h-[92vh] w-full max-w-5xl flex-col items-center justify-center px-4 text-center">
      <span className="mb-6 rounded-full border border-border bg-background/40 px-4 py-1.5 font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground backdrop-blur-sm animate-in fade-in slide-in-from-bottom-2">
        community lobby configs
      </span>

      <h1 className="text-balance font-mono text-6xl font-medium tracking-tight text-foreground sm:text-8xl animate-in fade-in slide-in-from-bottom-3">
        straftat<span className="text-primary">cfg</span>
      </h1>

      <p className="mt-5 max-w-md text-pretty text-lg text-muted-foreground animate-in fade-in slide-in-from-bottom-4">
        funny cfgs for lobbys.
      </p>

      <a
        href="#hub"
        className="mt-12 flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground animate-in fade-in"
      >
        browse the hub <ArrowDown className="size-3.5" />
      </a>
    </header>
  )
}
