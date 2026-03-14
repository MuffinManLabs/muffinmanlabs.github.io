import Hero from "@/components/Hero";
import About from "@/components/About";
import Projects from "@/components/Projects";
import Blog from "@/components/Blog";
import Contact from "@/components/Contact";

function SectionDivider() {
  return (
    <div className="max-w-4xl mx-auto px-8">
      <div className="terminal-divider" />
    </div>
  );
}

export default function Home() {
  return (
    <>
      <Hero />
      <SectionDivider />
      <About />
      <SectionDivider />
      <Projects />
      <SectionDivider />
      <Blog />
      <SectionDivider />
      <Contact />
    </>
  );
}
