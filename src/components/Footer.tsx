export default function Footer() {
  return (
    <footer className="py-12 px-8 font-mono">
      <div className="terminal-divider mb-8" />
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-xs text-[#00ff41]/30 tracking-wider">
          &copy; {new Date().getFullYear()} MuffinManLabs
        </p>
        <p className="text-[10px] text-[#00ff41]/20 tracking-wider">
          // built from scratch
        </p>
      </div>
    </footer>
  );
}
