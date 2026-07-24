import { getSiteContent } from "@/lib/content";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollReveal from "@/components/ScrollReveal";
import Hero from "@/components/Hero";
import Stats from "@/components/Stats";
import About from "@/components/About";
import Skills from "@/components/Skills";
import Projects from "@/components/Projects";
import Launched from "@/components/Launched";
import Experience from "@/components/Experience";
import Credentials from "@/components/Credentials";
import Contact from "@/components/Contact";

export const dynamic = "force-dynamic";

export default async function Home() {
  const content = await getSiteContent();

  return (
    <>
      <Header />
      <main>
        <Hero data={content.hero} />
        <Stats data={content.stats} />
        <About data={content.about} />
        <Skills data={content.skills} />
        <Projects data={content.projects} />
        <Launched data={content.launched} />
        <Experience data={content.experience} />
        <Credentials data={content.credentials} />
        <Contact data={content.contact} />
      </main>
      <Footer />
      <ScrollReveal />
    </>
  );
}
