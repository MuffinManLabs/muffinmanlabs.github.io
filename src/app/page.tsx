import Hero from "@/components/pcb/Hero";
import BoardsGallery from "@/components/pcb/BoardsGallery";
import OpenSource from "@/components/pcb/OpenSource";
import Capability from "@/components/pcb/Capability";
import { homeSchema, jsonLd } from "@/lib/schema";

export default function Home() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(homeSchema)} />
      <Hero />
      <BoardsGallery />
      {/* straight after the boards: you have just seen one, here is all of it */}
      <OpenSource />
      <Capability />
    </>
  );
}
