import { Hero } from "./_components/Hero";
import { About } from "./_components/About";
import { Projects } from "./_components/Projects";
import { Skills } from "./_components/Skills";
import { Experience } from "./_components/Experience";
import { Faq } from "./_components/Faq";
import { Contact } from "./_components/Contact";
import { Footer } from "./_components/Footer";
import { Navbar } from "./_components/Navbar";

export default function Home() {
  return (
    <main className="text-white">
      <Navbar />
      <Hero />
      <About />
      <Projects />
      <Skills />
      <Experience />
      <Faq />
      <Contact />
      <Footer />
    </main>
  );
}
