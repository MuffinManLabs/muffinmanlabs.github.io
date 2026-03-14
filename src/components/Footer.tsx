export default function Footer() {
  return (
    <footer className="border-t border-zinc-900 py-8 px-6">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-zinc-600">
          &copy; {new Date().getFullYear()} Muffin Man Labs. All rights reserved.
        </p>
        <p className="text-sm text-zinc-700">
          Built with Next.js &amp; Tailwind CSS
        </p>
      </div>
    </footer>
  );
}
