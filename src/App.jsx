// =============================================
// THIRD-PARTY IMPORTS
// =============================================
import { lazy, Suspense, useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ReactLenis } from 'lenis/react';

// =============================================
// CONTEXT PROVIDERS
// =============================================
import { AccessibilityProvider } from './contexts/AccessibilityContext';
import AccessibilityToolbar from './contexts/AccessibilityToolbar/AccessibilityToolbar';

// =============================================
// COMPONENTS
// =============================================
import Header from './components/Header';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';

// Lazy loaded component
const Chat = lazy(() => import('./components/Chat'));

// =============================================
// PAGES - MAIN
// =============================================
import Home from './pages/Home';

import Services from './pages/Services';

import NotFound from './pages/NotFound';

// =============================================
// PAGES - ABOUT
// =============================================
import Leadership from './pages/about/Leadership';
import Mandate from './pages/about/Mandate';
import FAQ from './pages/about/FAQ';
import Careers from './pages/about/Careers';
import About from './pages/about/About';
// =============================================
// PAGES - SERVICES
// =============================================
import AdvisoryServices from './pages/services/advisory-services';
import ResearchAndInnovation from './pages/services/reserch-and-innovation';
import StandardsDevelopment from './pages/services/StandardsDevelopment';
import Debarment from './pages/services/Debarment';
import ComplianceMonitoring from './pages/services/ComplianceMonitoring';
import Capacitybuilding from './pages/services/CapacityBuilding';

// =============================================
// PAGES - RESOURCE CENTRE
// =============================================
import CapacityBuildingLevy from './pages/CapacityBuildingLevy';
import RegulatoryFramework from './pages/ResourceCentre/other pages/RegulatoryFramework';


// =============================================
// PAGES - RESOURCE CENTRE / LISTS
// =============================================
import AGPO from './pages/ResourceCentre/lists/AGPO';
import DebarredFirms from './pages/ResourceCentre/lists/DebarredFirms';

// =============================================
// PAGES - RESOURCE CENTRE / REGULATORY FRAMEWORK
// =============================================
import PublicProcurementAct from './pages/ResourceCentre/regulatory-framework/PublicProcurementAct';

// =============================================
// PAGES - RESOURCE CENTRE / REPORTS
// =============================================
import ComplianceReports from './pages/ResourceCentre/reports/ComplianceReports';
import AnnualReports from './pages/ResourceCentre/reports/AnnualReports';

// =============================================
// PAGES - RESOURCE CENTRE / MARKET PRICE INDICES
// =============================================
import MarketPriceIndices from './pages/ResourceCentre/MarketPriceIndices/MarketPriceIndices';
// =============================================
// PAGES - RESOURCE CENTRE / CIRCULARS
// =============================================
import Circulars from './pages/ResourceCentre/Circulars/Circulars';

// =============================================
// PAGES - RESOURCE CENTRE / STANDARDS AND GUIDELINES
// =============================================
import StandardsAndGuidelines from './pages/ResourceCentre/StandardsAndGuidelines/StandardTenderDocuments';
import CodeOfEthics from './pages/ResourceCentre/StandardsAndGuidelines/CodeOfEthics';
import TenderSecurityProviders from './pages/ResourceCentre/StandardsAndGuidelines/TenderSecurityProviders';


// =============================================
// PAGES - RESOURCE CENTRE / DEBARMENT
// =============================================
import DebarmentForm from './pages/ResourceCentre/Debarment/DebarmentForm';
// =============================================


// =============================================
// PAGES - RESOURCE CENTRE / CORPORATE DOCUMENT
// =============================================
import CorporateDocuments from './pages/ResourceCentre/CorporateDocument/QualityPolicy';
import StrategicPlan from './pages/ResourceCentre/CorporateDocument/StrategicPlan';



// =============================================
// PAGES - NEWS
// =============================================
import News from './pages/news/index';
import NewsArticle from './pages/news/[slug]';

// =============================================
// PAGES - ADMINISTRATIVE REVIEW BOARD
// =============================================
import CauseList from './pages/ResourceCentre/Administrative Review Board/cauce-list/CauseList';
import CauseListArticle from './pages/ResourceCentre/Administrative Review Board/cauce-list/[slug]';
import ReviewBoard from './pages/ResourceCentre/Administrative Review Board/ReviewBoard';
import ARBDecisions from './pages/ResourceCentre/Administrative Review Board/ARBDecisions';


function App() {
  const [isMobile, setIsMobile] = useState(false);
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    window.history.scrollRestoration = 'manual';
    
    // Detect mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Only show chat after component mounts and on desktop
  useEffect(() => {
    if (!isMobile) {
      setShowChat(true);
    }
  }, [isMobile]);

  return (
    <AccessibilityProvider>
      <ReactLenis 
        root 
        options={{ 
          lerp: 0.1, 
          duration: 1.5, 
          autoRaf: true,
        }}
      >
        <div className="min-h-screen flex flex-col">
          {/* Skip to content link for keyboard users */}
          <a href="#main-content" className="skip-to-content">
            Skip to main content
          </a>
          
          <ScrollToTop />
          <Header />
          <main id="main-content" className="grow pt-20">
            <Routes>
              {/* ============================================= */}
              {/* MAIN PAGES */}
              {/* ============================================= */}
              <Route path="/" element={<Home />} />
              
              {/* ============================================= */}
              {/* ABOUT */}
              {/* ============================================= */}
              <Route path="/about" element={<About />} />
              <Route path="/leadership" element={<Leadership />} />
              <Route path="/mandate" element={<Mandate />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/careers" element={<Careers />} />
              <Route path="/review-board" element={<ReviewBoard />} />
              
              {/* ============================================= */}
              {/* SERVICES */}
              {/* ============================================= */}
              <Route path="/services" element={<Services />} />
              <Route path="/services/advisory-services" element={<AdvisoryServices />} />
              <Route path="/services/research-and-innovation" element={<ResearchAndInnovation />} />
              <Route path="/services/standards-development" element={<StandardsDevelopment />} />
              <Route path="/services/debarment" element={<Debarment />} />
              <Route path="/services/compliance-monitoring" element={<ComplianceMonitoring />} />
              <Route path="/services/capacity-building" element={<Capacitybuilding />} />
              


              
              {/* ============================================= */}
              {/* CAPACITY BUILDING LEVY */}
              {/* ============================================= */}
              <Route path="/capacity-building-levy" element={<CapacityBuildingLevy />} />
              
              {/* ============================================= */}
              {/* RESOURCE CENTRE */}
              {/* ============================================= */}
              {/* Regulatory Framework section */}
              <Route path="/regulatory-framework/ppad-act-2015" element={<PublicProcurementAct />} />
              
              {/* Lists section */}
              <Route path="/lists/agpo" element={<AGPO />} />
              <Route path="/lists/debarred-firms" element={<DebarredFirms />} />
              {/* Reports section */}
              <Route path="/reports/compliance-report" element={<ComplianceReports />} />
              <Route path="/reports/annual-reports" element={<AnnualReports />} />

              {/* market price indices section */}
              <Route path="/market-price-indices/market-price-indices" element={<MarketPriceIndices />} />

              {/* circulars section */}
              <Route path="/circulars/currency-based" element={<Circulars />} />

              {/* standards and guidelines section */}
              <Route path="/standards-and-guidelines/standard-tender-documents" element={<StandardsAndGuidelines />} />
              <Route path="/standards-and-guidelines/code-of-ethics" element={<CodeOfEthics />} />
              <Route path="/standards-and-guidelines/tender-security-providers" element={<TenderSecurityProviders />} />

              {/* debarment section */}
              <Route path="/debarment/debarment-form" element={<DebarmentForm />} />

              {/* corporate documents section */}
              <Route path="/corporate-documents/quality-policy" element={<CorporateDocuments />} />
              <Route path="/corporate-documents/strategic-plan" element={<StrategicPlan />} />

              {/* other pages */}
              
              <Route path="/regulatory-framework" element={<RegulatoryFramework />} />
              

              {/* administrative review board */}
              <Route path="/administrative-review-board/cause-list" element={<CauseList />} />
              <Route path="/administrative-review-board/cause-list/:slug" element={<CauseListArticle />} />
              <Route path="/administrative-review-board/ReviewBoard" element={<ReviewBoard />} />
              <Route path="/administrative-review-board/ARBDecisions" element={<ARBDecisions />} />
              
              {/* ============================================= */}
              {/* NEWS */}
              {/* ============================================= */}
              <Route path="/news" element={<News />} />
              <Route path="/news/:slug" element={<NewsArticle />} />
              
              {/* ============================================= */}
              {/* 404 Page */}
              {/* ============================================= */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
          <Suspense fallback={null}>
            {showChat && <Chat />}
          </Suspense>
          {/* Accessibility Toolbar - always visible */}
          <AccessibilityToolbar />
        </div>
      </ReactLenis>
    </AccessibilityProvider>
  );
}

export default App;