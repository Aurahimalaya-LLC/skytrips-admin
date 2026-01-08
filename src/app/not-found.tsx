import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex h-screen flex-col items-center justify-center bg-slate-50 text-center font-display p-6">
      <div className="rounded-full bg-blue-100 p-6 mb-6">
        <span className="material-symbols-outlined text-6xl text-primary">search_off</span>
      </div>
      <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Page Not Found</h2>
      <p className="text-slate-500 max-w-md mb-8">
        We couldn't find the page you were looking for. It might have been removed, renamed, or doesn't exist.
      </p>
      <Link
        href="/dashboard"
        className="inline-flex items-center px-6 py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 hover:bg-blue-600 transition-all hover:-translate-y-0.5"
      >
        <span className="material-symbols-outlined text-[20px] mr-2">home</span>
        Return to Dashboard
      </Link>
    </div>
  );
}
