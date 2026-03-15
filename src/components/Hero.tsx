import Image from "next/image";

export default function Hero() {
  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center"
    >
      <div className="relative z-10 text-center px-8 max-w-5xl mx-auto">
        {/* Profile pic + Logo side by side */}
        <div className="flex items-center justify-center gap-6 sm:gap-10 mb-12">
          {/* Profile picture */}
          <div className="relative w-36 h-36 sm:w-44 sm:h-44 profile-pic-glitch">
            <div className="absolute -inset-1 bg-gradient-to-b from-[#00ff41]/30 to-[#a855f7]/20 rounded-full blur-sm" />
            <Image
              src="/ProfileFaceShot.png"
              alt="Ray Malik"
              width={176}
              height={176}
              className="relative rounded-full object-cover w-36 h-36 sm:w-44 sm:h-44 border-2 border-[#00ff41]/20"
            />
          </div>

          {/* Vertical divider */}
          <div className="w-px h-28 sm:h-36 bg-gradient-to-b from-transparent via-[#00ff41]/30 to-transparent" />

          {/* Logo */}
          <div className="relative profile-pic-glitch">
            <div className="absolute -inset-2 bg-[#00ff41]/5 rounded-lg blur-md" />
            <Image
              src="/MuffinManLabsLogo.png"
              alt="MuffinManLabs Logo"
              width={120}
              height={120}
              className="relative w-28 h-28 sm:w-32 sm:h-32 opacity-90"
            />
          </div>
        </div>

        {/* Name */}
        <h1
          className="text-6xl sm:text-8xl font-bold tracking-tight mb-3 text-[#f0f0f0]"
          style={{ fontFamily: "var(--font-geist-sans), sans-serif" }}
        >
          Ray Malik
        </h1>

        {/* Alias */}
        <p className="text-2xl sm:text-3xl font-mono text-[#00ff41] mb-8 green-glow tracking-wider">
          MuffinManLabs
        </p>

        {/* Tagline */}
        <p className="text-base sm:text-lg font-mono text-[#a855f7]/80 tracking-wide max-w-2xl mx-auto leading-relaxed">
          Embedded systems engineer. Close to the hardware.
        </p>
      </div>
    </section>
  );
}
