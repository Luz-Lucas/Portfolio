import { Hero } from "./_components/Hero";
import { About } from "./_components/About";
import { Projects } from "./_components/Projects";
import { Skills } from "./_components/Skills";
import { Experience } from "./_components/Experience";
import { Faq } from "./_components/Faq";
import { Contact } from "./_components/Contact";
import { Footer } from "./_components/Footer";
import { Navbar } from "./_components/Navbar";
import { fetchGitHubProjects } from "@/lib/github";

export default async function Home() {
  const projects = await fetchGitHubProjects();

  return (
    <main id="conteudo">
      <Navbar />
      <Hero />
      <About />
      <Projects projects={projects} />
      <Skills />
      <Experience />
      <Faq />
      <Contact />
      <Footer />
    </main>
  );
}
