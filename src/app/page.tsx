import PCBHero from "@/components/pcb/PCBHero";
import Services from "@/components/pcb/Services";
import BoardsGallery from "@/components/pcb/BoardsGallery";
import About from "@/components/pcb/About";
import Deliverable from "@/components/pcb/Deliverable";
import Skills from "@/components/pcb/Skills";
import LatestNotes from "@/components/blog/LatestNotes";
import Standard from "@/components/pcb/Standard";
import Contact from "@/components/pcb/Contact";
import CircuitRail from "@/components/pcb/CircuitRail";
import TraceDivider from "@/components/pcb/TraceDivider";

export default function Home() {
  return (
    <>
      <CircuitRail />
      <PCBHero />
      <TraceDivider />
      <Services />
      <TraceDivider />
      <BoardsGallery />
      <TraceDivider />
      {/* the person lands right after the proof, while interest is highest */}
      <About />
      <TraceDivider />
      <Deliverable />
      <TraceDivider />
      <Skills />
      <TraceDivider />
      <LatestNotes />
      <TraceDivider />
      {/* guarantee immediately before the ask */}
      <Standard />
      <TraceDivider />
      <Contact />
    </>
  );
}
