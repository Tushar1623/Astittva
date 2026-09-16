import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import MobileBottomBar from './components/MobileBottomBar';
import FloatingWhatsApp from './components/WhatsApp';
import SEO from './components/SEO';

// Code Splitting & Dynamic Imports for Fast Initial Page Load
const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const MasterPlanPage = lazy(() => import('./pages/MasterPlan'));
const LocationPage = lazy(() => import('./pages/Location'));
const Amenities = lazy(() => import('./pages/Amenities'));
const PaymentPlan = lazy(() => import('./pages/Payment'));
const Gallery = lazy(() => import('./pages/Gallery'));
const DocumentsPage = lazy(() => import('./pages/Documents'));
const FAQPage = lazy(() => import('./pages/FAQ'));
const Contact = lazy(() => import('./pages/Contact'));
const SiteVisit = lazy(() => import('./pages/SiteVisit'));
const Blog = lazy(() => import('./pages/Blog'));
const BlogPost = lazy(() => import('./pages/Blog').then((m) => ({ default: m.BlogPost })));
const PriceCalculator = lazy(() => import('./components/PriceCalculator'));

function PageLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-8 text-center text-[#C88E00]">
      <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#C88E00] border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
    </div>
  );
}

function CalculatorPage() {
  return (
    <>
      <SEO title="Price & EMI Calculator" description="Calculate residential plot price and EMI at Ridhi Bhoomi." path="/calculator" />
      <div className="section-padding pb-24 bg-[#FAF8F3]">
        <div className="container-main max-w-5xl space-y-8">
          <div className="text-center space-y-2">
            <span className="badge-gold">Interactive Tool</span>
            <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#0F1F17]">Price & EMI Calculator</h1>
            <p className="text-xs sm:text-sm text-[#6E736B]">Estimate plot pricing, down payment requirements and monthly EMI tenure</p>
          </div>
          <PriceCalculator />
        </div>
      </div>
    </>
  );
}

export default function App() {
  const basename =
    typeof window !== 'undefined' && window.location.pathname.startsWith('/ridhi-bhoomi')
      ? '/ridhi-bhoomi'
      : '/';

  return (
    <HelmetProvider>
      <BrowserRouter basename={basename}>
        <div className="flex min-h-screen flex-col pb-16 md:pb-0">
          <Navbar />
          <main className="flex-1">
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/master-plan" element={<MasterPlanPage />} />
                <Route path="/location" element={<LocationPage />} />
                <Route path="/amenities" element={<Amenities />} />
                <Route path="/payment-plan" element={<PaymentPlan />} />
                <Route path="/calculator" element={<CalculatorPage />} />
                <Route path="/gallery" element={<Gallery />} />
                <Route path="/documents" element={<DocumentsPage />} />
                <Route path="/faq" element={<FAQPage />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/site-visit" element={<SiteVisit />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:slug" element={<BlogPost />} />
              </Routes>
            </Suspense>
          </main>
          <Footer />
          <FloatingWhatsApp />
          <MobileBottomBar />
        </div>
      </BrowserRouter>
    </HelmetProvider>
  );
}

