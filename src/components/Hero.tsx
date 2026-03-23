import Image from "next/image";

export default function Hero() {
  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center"
    >
      <div className="relative z-10 text-center px-8 max-w-5xl mx-auto">
        {/* Logo */}
        <div className="flex items-center justify-center mb-12">
          <div className="relative w-36 h-36 sm:w-44 sm:h-44 profile-pic-glitch">
            <div className="absolute -inset-1 bg-gradient-to-b from-[#00ff41]/30 to-[#a855f7]/20 rounded-full blur-sm" />
            <Image
              src="/MuffinManLabsLogo.png"
              alt="MuffinManLabs Logo"
              width={176}
              height={176}
              className="relative rounded-full object-cover w-36 h-36 sm:w-44 sm:h-44 border-2 border-[#00ff41]/20"
            />
          </div>
        </div>

        {/* Name */}
        <h1 className="text-5xl sm:text-7xl font-mono text-[#00ff41] mb-8 green-glow tracking-wider">
          MuffinManLabs
        </h1>

        {/* Tagline */}
        <p className="text-base sm:text-lg font-mono text-[#a855f7]/80 tracking-wide max-w-2xl mx-auto leading-relaxed">
          Embedded systems engineer. Close to the hardware.
        </p>
      </div>
    </section>
  );
}
