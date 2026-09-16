import { useSearchParams } from 'react-router-dom';
import SEO from '../components/SEO';
import LeadForm from '../components/LeadForm';
import MapSection from '../components/MapSection';
import { WhatsAppButton } from '../components/WhatsApp';
import { project } from '../data/project';
import { Phone, Mail, MapPin } from 'lucide-react';

export default function Contact() {
  const [params] = useSearchParams();
  const plot = params.get('plot');
  const type = params.get('type');

  return (
    <>
      <SEO title="Contact Us" description={`Contact ${project.name} for plot enquiries, site visits and pricing.`} path="/contact" />
      <div className="section-padding pb-24">
        <div className="container-main space-y-12">
          <h1 className="font-display text-4xl font-bold text-center">Contact Us</h1>
          <div className="grid gap-10 lg:grid-cols-2">
            <div className="space-y-6">
              <div className="card">
                <h2 className="font-display text-xl font-bold mb-4">Get in Touch</h2>
                <div className="space-y-4 text-sm">
                  <a href={`tel:+91${project.phone}`} className="flex items-center gap-3 hover:text-brand-green">
                    <Phone size={18} /> +91 {project.phone}
                  </a>
                  <a href={`mailto:${project.email}`} className="flex items-center gap-3 hover:text-brand-green">
                    <Mail size={18} /> {project.email}
                  </a>
                  <p className="flex items-start gap-3">
                    <MapPin size={18} className="shrink-0 mt-0.5" /> {project.officeAddress}
                  </p>
                </div>
                <WhatsAppButton className="btn-primary mt-6 w-full" plotNumber={plot} propertyType={type} />
              </div>
            </div>
            <LeadForm plotNumber={plot} propertyType={type === 'commercial' ? 'Commercial' : 'Residential'} />
          </div>

          {/* Interactive Map Section */}
          <div className="pt-8 border-t border-stone-200">
            <MapSection />
          </div>
        </div>
      </div>
    </>
  );
}
