import { Navbar } from '../components/Navbar'
import { Hero } from '../components/Hero'
import { ProjectStatusSection } from '../components/ProjectStatusSection'
import { Footer } from '../components/Footer'

export const WebsiteLandingPage = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <Hero />
    <ProjectStatusSection />
    <Footer />
  </div>
)
