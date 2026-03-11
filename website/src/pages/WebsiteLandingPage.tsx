import { Navbar } from '../components/Navbar'
import { Hero } from '../components/Hero'
import { ProjectStatusSection } from '../components/ProjectStatusSection'
import { Footer } from '../components/Footer'

export const WebsiteLandingPage = () => (
  <div className="min-h-screen bg-[#0b0b0c]">
    <Navbar />
    <Hero />
    <ProjectStatusSection />
    <Footer />
  </div>
)
