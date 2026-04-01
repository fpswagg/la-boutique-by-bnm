import Link from "next/link";

export default function NotFound() {
  return (
    <div className="pt-24 min-h-screen flex items-center justify-center px-6">
      <div className="text-center">
        <p className="font-display text-[clamp(6rem,20vw,16rem)] leading-none text-[var(--fg)]/10 select-none">
          404
        </p>
        <h1 className="font-display text-3xl md:text-5xl tracking-wider -mt-4 mb-6">
          PAGE NOT FOUND
        </h1>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--fg)] text-[var(--bg)] text-sm font-medium tracking-widest uppercase hover:opacity-80 transition-all"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
