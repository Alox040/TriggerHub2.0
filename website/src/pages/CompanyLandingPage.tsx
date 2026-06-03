import { CompanyShell } from '../components/company/CompanyShell'
import { HeroSection } from '../components/company/HeroSection'
import { PrinciplesSection } from '../components/company/PrinciplesSection'
import { ProjectsSection } from '../components/company/ProjectsSection'
import { ServicesSection } from '../components/company/ServicesSection'
import { ProcessSection } from '../components/company/ProcessSection'
import { ContactCTASection } from '../components/company/ContactCTASection'

interface CompanyLandingPageProps {
  onNavigate: (path: string) => void
}

export const CompanyLandingPage = ({ onNavigate }: CompanyLandingPageProps) => (
  <CompanyShell onNavigate={onNavigate}>
    <main>
      <HeroSection onNavigate={onNavigate} />
      <PrinciplesSection />
      <ProjectsSection onNavigate={onNavigate} />
      <ServicesSection />
      <ProcessSection />
      <ContactCTASection />
    </main>
  </CompanyShell>
)
