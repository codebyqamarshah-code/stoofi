import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white text-zinc-900 p-6">
      <h1 className="text-6xl font-black mb-4">404</h1>
      <p className="text-lg text-zinc-600 mb-6">Page Not Found</p>
      <Link href="/" className="px-6 py-2.5 rounded-xl bg-zinc-900 text-white font-bold text-sm hover:bg-zinc-800 transition-colors">
        Go to Home
      </Link>
    </div>
  );
}
