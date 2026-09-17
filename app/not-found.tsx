import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#F4F4F6] flex items-center justify-center p-6 text-brand-ink">
      <div className="max-w-md w-full bg-white rounded-3xl border-2 border-brand-ink/10 p-8 shadow-xl text-center space-y-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-orange/10 border border-brand-orange/20 text-brand-orange text-xs font-black uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>404 · PAGE NOT FOUND</span>
        </div>

        <h1 className="font-display text-4xl sm:text-5xl font-black uppercase tracking-tight text-brand-ink">
          LOST IN THE VALLEY?
        </h1>

        <p className="text-zinc-600 text-sm font-medium leading-relaxed">
          The page or track you are looking for does not exist or has been moved.
        </p>

        <div>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-brand-ink text-white font-bold text-xs uppercase tracking-wider hover:bg-brand-violet transition-colors shadow-md"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Festival HQ</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
