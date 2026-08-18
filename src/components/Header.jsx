import { useState, useEffect, useRef } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
  faHome, 
  faInfoCircle, 
  faCogs,
  faBuilding, 
  faBook, 
  faNewspaper,
  faPhone,
  faGavel,
  faFileContract,
  faBalanceScale,
  faGraduationCap,
  faUsers,
  faLink,
  faChevronDown
} from '@fortawesome/free-solid-svg-icons'

import textLogo from '../assets/commonPics/text and logo ppra.png'

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState(null)
  
  const [mobileAboutOpen, setMobileAboutOpen] = useState(false)
  const [mobileResourceOpen, setMobileResourceOpen] = useState(false)
  
  const headerRef = useRef(null)
  const headerInnerRef = useRef(null)
  const logoRef = useRef(null)
  const logoTextRef = useRef(null)
  const logoContainerRef = useRef(null)
  const rightNavRef = useRef(null)
  const megaMenuContainerRef = useRef(null)
  const hoverTimeoutRef = useRef(null)
  
  const dropdownRefs = {
    about: useRef(null),
    resources: useRef(null)
  }
  
  const location = useLocation()

  const resourceCentrePaths = [
    '/regulatory-framework', '/standards-and-guidelines', '/circulars',
    '/administrative-review-board', '/debarment', '/market-price-indices',
    '/reports', '/lists', '/corporate-documents', '/learning-hub'
    // '/archive' is removed – now part of Learning Hub
  ]

  const aboutPaths = [
    '/about', '/leadership', '/mandate', '/faq', '/careers'
  ]

  const aboutCategories = [
    {
      title: 'About PPRA',
      icon: faInfoCircle,
      links: [
        { path: '/about', label: 'Overview', desc: 'Mission, vision & history' },
        { path: '/mandate', label: 'Mandate & Functions', desc: 'Statutory functions & frameworks' },
      ]
    },
    {
      title: 'Leadership',
      icon: faUsers,
      links: [
        { path: '/leadership', label: 'Board of Directors', desc: 'Board members & governance' },
      ]
    },
    {
      title: 'Resources',
      icon: faBook,
      links: [
        { path: '/faq', label: 'FAQ', desc: 'Frequently asked questions' },
        { path: '/careers', label: 'Careers', desc: 'Join our team' },
      ]
    }
  ]

  // ---------- Resource Categories with Archive moved into Learning Hub ----------
  const resourceCategories = [
    {
      title: 'Regulatory Framework',
      icon: faGavel,
      links: [
        { path: '/regulatory-framework/ppad-act-2015', label: 'The Act (PPAD, 2015)', desc: 'Public Procurement and Asset Disposal Act, 2015' },
        { path: '/regulatory-framework/ppad-regulations-2020', label: 'PPAD Regulations 2020', desc: 'Public Procurement and Asset Disposal Regulations' },
        { path: '/regulatory-framework/capacity-building-levy-order-2023', label: 'The Public Procurement Capacity Building Levy Order, 2023', desc: 'Capacity building levy regulations' },
        { path: '/regulatory-framework/pfm-act-2012', label: 'PFM Act, 2012', desc: 'Public Financial Management Act' },
        { path: '/regulatory-framework/pfm-regulations-2015', label: 'PFM Regulations 2015', desc: 'Public Financial Management Regulations' },
      ]
    },
    {
      title: 'Standards & Guidelines',
      icon: faFileContract,
      links: [
        { path: '/standards-and-guidelines/tender-security-providers', label: 'Tender Security Providers', desc: 'Information about approved tender security providers' },
        { path: '/standards-and-guidelines/manuals', label: 'Manuals', desc: 'Procurement manuals and guides' },
        { path: '/standards-and-guidelines/code-of-ethics', label: 'Code of Ethics', desc: 'Ethics code for procurement professionals' },
        { path: '/standards-and-guidelines/agent-registration', label: 'Registration and Licensing of Procuring or Asset Disposal Agents', desc: 'Agent registration and licensing information' },
      ]
    },
    {
      title: 'Circulars',
      icon: faBook,
      links: [
        { path: '/circulars/currency-based', label: 'Based on Currency', desc: 'Circulars organized by currency type' },
      ]
    },
    {
      title: 'Administrative Review Board',
      icon: faBalanceScale,
      links: [
        { path: '/administrative-review-board/ReviewBoard', label: 'Understanding PPRAB', desc: 'Learn about the Administrative Review Board' },
        { path: '/administrative-review-board/cause-list', label: 'Cause List', desc: 'Administrative Review Board cause list' },
        
        { path: '/administrative-review-board/ARBDecisions', label: 'ARB Decisions', desc: 'Review decisions organized by year and case number' },
      ]
    },
    {
      title: 'Debarment',
      icon: faGavel,
      links: [
        { path: '/debarment/debarment-form', label: 'Request for Debarment Form', desc: 'Form to request debarment of firms' },
        { path: '/debarment/firms', label: 'Firms Debarred based on years and Case No', desc: 'List of debarred firms organized by year and case number' },
      ]
    },
    {
      title: 'Marked Price Indices',
      icon: faBuilding,
      links: [
        { path: '/market-price-indices/market-price-indices', label: 'Based on currency', desc: 'Market price indices organized by currency' },
      ]
    },
    {
      title: 'Reports',
      icon: faNewspaper,
      links: [
        { path: '/reports/annual-reports', label: 'Annual Reports', desc: 'Annual performance and activity reports' },
        { path: '/reports/preference-reservation', label: 'Preference and Reservation Scheme Reports', desc: 'Reports on preference and reservation schemes' },
        { path: '/reports/research', label: 'Research Reports', desc: 'Research publications and findings' },
        { path: '/reports/compliance-report', label: 'Compliance Reports', desc: 'Compliance monitoring reports' },
        { path: '/reports/audit', label: 'Audit Reports', desc: 'Audit reports and findings' },
        { path: '/reports/assessment', label: 'Assessment Reports', desc: 'Assessment and evaluation reports' },
        { path: '/reports/review', label: 'Review Reports', desc: 'Review and oversight reports' },
      ]
    },
    {
      title: 'Lists',
      icon: faUsers,
      links: [
        { path: '/lists/tender-security-providers', label: 'Tender Security Providers', desc: 'Approved tender security providers' },
        { path: '/lists/debarred-firms', label: 'Debarred Firms', desc: 'List of debarred firms' },
        { path: '/lists/registered-agents', label: 'Registered Procuring Agents', desc: 'List of registered procuring agents' },
        { path: '/lists/non-compliant-entities', label: 'Non-Compliant Procuring Entities', desc: 'Entities with compliance issues' },
        { path: '/lists/agpo', label: 'AGPO', desc: 'Access to Government Procurement Opportunities' },
      ]
    },
    {
      title: 'Corporate Documents',
      icon: faInfoCircle,
      links: [
        { path: '/corporate-documents/strategic-plan', label: 'Strategic Plan', desc: 'Corporate strategic planning documents' },
        { path: '/corporate-documents/service-charter', label: 'Service Charter', desc: 'Service delivery commitments' },
        { path: '/corporate-documents/quality-policy', label: 'Quality Policy', desc: 'Quality management policies' },
      ]
    },
    {
      title: 'Learning Hub & Archive',
      icon: faGraduationCap,
      links: [
        { path: '/learning-hub/e-resources', label: 'Subscribed E-Resources', desc: 'Online learning resources and subscriptions' },
        // Archived Resources moved here
        { path: '/archive/ppad-act-2005', label: 'The Act (PPAD, 2005)', desc: 'Archived PPAD Act from 2005' },
        { path: '/archive/ppad-regulations-2006', label: 'PPAD Regulations 2006', desc: 'Archived PPAD Regulations from 2006' },
        { path: '/archive/tender-documents', label: 'Archived Standard Tender Documents', desc: 'Historical tender document templates' },
        { path: '/archive/manuals', label: 'Manuals', desc: 'Archived procurement manuals' },
      ]
    }
  ]

  // ---------- useEffect hooks (unchanged) ----------
  useEffect(() => {
    let ticking = false
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 30)
          ticking = false
        })
        ticking = true
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isMobileMenuOpen])

  useEffect(() => {
    setIsMobileMenuOpen(false)
    setActiveDropdown(null)
    setMobileAboutOpen(false)
    setMobileResourceOpen(false)
  }, [location])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (headerRef.current && !headerRef.current.contains(event.target)) {
        setActiveDropdown(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleMouseEnter = (dropdown) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
      hoverTimeoutRef.current = null
    }
    setActiveDropdown(dropdown)
  }

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null)
    }, 300)
  }

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (!megaMenuContainerRef.current) return
    
    if (activeDropdown) {
      gsap.to(megaMenuContainerRef.current, {
        height: 'auto',
        opacity: 1,
        duration: 0.35,
        ease: 'power3.out',
        display: 'block'
      })
    } else {
      gsap.to(megaMenuContainerRef.current, {
        height: 0,
        opacity: 0,
        duration: 0.25,
        ease: 'power3.in',
        display: 'none'
      })
    }
  }, [activeDropdown])

  useGSAP(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } })
    tl.fromTo(headerRef.current, { yPercent: -100 }, { yPercent: 0, duration: 1 })
      .fromTo(logoRef.current, { x: -20, opacity: 0 }, { x: 0, opacity: 1, duration: 0.8 }, '-=0.5')
  }, { scope: headerRef })

  useGSAP(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (!logoContainerRef.current) return

    const tl = gsap.timeline({ defaults: { duration: 0.4, ease: 'power2.out' } })

    if (isScrolled) {
      tl.to(headerRef.current, { paddingTop: '0.25rem', paddingBottom: '0.25rem' }, 0)
      if (window.innerWidth >= 768) {
        tl.to(headerInnerRef.current, { paddingLeft: '1.5rem', paddingRight: '1.5rem', maxWidth: '1280px' }, 0)
      }
    } else {
      tl.to(headerRef.current, { paddingTop: '0.75rem', paddingBottom: '0.75rem' }, 0)
      if (window.innerWidth >= 768) {
        tl.to(headerInnerRef.current, { paddingLeft: '0rem', paddingRight: '0rem', maxWidth: '100%' }, 0)
      }
    }
  }, [isScrolled])

  const isResourceCentreActive = resourceCentrePaths.includes(location.pathname)
  const isAboutActive = aboutPaths.includes(location.pathname)

  // ---------- MegaMenu Component (desktop) – auto height, max 80vh ----------
  const MegaMenu = ({ categories }) => {
    let gridColsClass = 'md:grid-cols-3'
    if (categories.length === 1) gridColsClass = 'md:grid-cols-1'
    else if (categories.length === 2) gridColsClass = 'md:grid-cols-2'
    else if (categories.length === 3) gridColsClass = 'md:grid-cols-3'
    else if (categories.length === 4) gridColsClass = 'md:grid-cols-4'
    else if (categories.length === 5) gridColsClass = 'md:grid-cols-5'
    else gridColsClass = 'md:grid-cols-4 lg:grid-cols-5'

    return (
      <div 
        className="w-full bg-white border-t border-gray-100 shadow-xl max-h-[80vh] overflow-y-auto overscroll-contain"
        style={{ 
          pointerEvents: 'auto',
          WebkitOverflowScrolling: 'touch',
          touchAction: 'pan-y'
        }}
        onWheel={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
        onMouseEnter={() => {
          if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current)
            hoverTimeoutRef.current = null
          }
        }}
        onMouseLeave={() => {
          hoverTimeoutRef.current = setTimeout(() => {
            setActiveDropdown(null)
          }, 300)
        }}
      >
        <div className="w-full px-4 lg:px-6 py-6">
          <div className={`grid grid-cols-1 ${gridColsClass} gap-6`}>
            {categories.map((category, idx) => (
              <div key={idx} className="space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                  <div className="w-8 h-8 rounded-lg bg-primary-purple/10 flex items-center justify-center shrink-0">
                    <FontAwesomeIcon icon={category.icon} className="text-primary-purple text-sm" />
                  </div>
                  <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                    {category.title}
                  </h3>
                </div>
                <div className="space-y-0.5">
                  {category.links.map((link, linkIdx) => (
                    <Link
                      key={linkIdx}
                      to={link.path}
                      onClick={() => setActiveDropdown(null)}
                      className={`block px-2 py-1.5 rounded-lg transition-all duration-200 group ${
                        location.pathname === link.path
                          ? 'bg-primary-purple/10 text-primary-purple'
                          : 'hover:bg-gray-50 text-gray-700 hover:text-primary-purple'
                      }`}
                    >
                      <span className="block text-sm font-medium group-hover:text-primary-purple transition-colors leading-tight">
                        {link.label}
                      </span>
                      <span className="block text-xs text-gray-400 group-hover:text-gray-500 transition-colors mt-0.5 leading-tight">
                        {link.desc}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Quick Links:</span>
              {categories[0]?.links.slice(0, 3).map((link, idx) => (
                <Link 
                  key={idx}
                  to={link.path}
                  onClick={() => setActiveDropdown(null)}
                  className="text-xs text-gray-600 hover:text-primary-purple transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <FontAwesomeIcon icon={faLink} className="text-xs text-gray-400" />
              <span className="text-xs text-gray-400">Need help?</span>
              <Link to="/contact" className="text-xs font-medium text-primary-purple hover:underline">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ---------- Render ----------
  return (
    <header
      ref={headerRef}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled || activeDropdown
          ? 'bg-white shadow-md border-b border-gray-100'
          : 'bg-white/0 shadow-none'
      }`}
    >
      {/* Primary Navigation Row Container */}
      <div className="w-full px-4 sm:px-6 lg:px-8 bg-white">
        <div ref={headerInnerRef} className="mx-auto w-full flex items-center justify-between h-16 md:h-20 gap-4">
          
          <div ref={logoContainerRef} className="h-full flex items-center min-w-0 py-1">
            <Link to="/" ref={logoRef} className="flex items-center group min-w-0">
              <img 
                ref={logoTextRef}
                src={textLogo} 
                alt="PPRA Logo Text" 
                className="w-auto object-contain block"
                style={{ height: 'clamp(55px, 9vh, 77px)' }}
              />
            </Link>
          </div>

          <div ref={rightNavRef} className="hidden md:flex items-center justify-end gap-2 lg:gap-4 flex-1">
            <nav className="flex items-center gap-1 lg:gap-4">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `relative px-4 py-2 text-base lg:text-lg font-semibold transition-colors duration-300 group ${
                    isActive ? 'text-primary-purple' : 'text-primary-purple hover:text-primary-purple/80'
                  }`
                }
              >
                <span>Home</span>
                <span className={`absolute bottom-0 left-3 right-3 h-0.5 bg-primary-purple origin-left transform transition-transform duration-300 scale-x-0 group-hover:scale-x-100 ${
                  location.pathname === '/' ? 'scale-x-100' : ''
                }`}></span>
              </NavLink>
              
              <div 
                className="relative py-2" 
                ref={dropdownRefs.about}
                onMouseEnter={() => handleMouseEnter('about')}
                onMouseLeave={handleMouseLeave}
              >
                <button
                  onClick={() => setActiveDropdown(activeDropdown === 'about' ? null : 'about')}
                  className={`relative px-4 py-2 text-base lg:text-lg font-semibold transition-colors duration-300 group flex items-center gap-1.5 ${
                    isAboutActive ? 'text-primary-purple' : 'text-primary-purple hover:text-primary-purple/80'
                  }`}
                >
                  <span>About</span>
                  <FontAwesomeIcon 
                    icon={faChevronDown} 
                    className={`w-3 h-3 transition-transform duration-200 ${activeDropdown === 'about' ? 'rotate-180' : ''}`} 
                  />
                </button>
              </div>
              
              <NavLink
                to="/services"
                className={({ isActive }) =>
                  `relative px-4 py-2 text-base lg:text-lg font-semibold transition-colors duration-300 group ${
                    isActive ? 'text-primary-purple' : 'text-primary-purple hover:text-primary-purple/80'
                  }`
                }
              >
                <span>Services</span>
                <span className={`absolute bottom-0 left-3 right-3 h-0.5 bg-primary-purple origin-left transform transition-transform duration-300 scale-x-0 group-hover:scale-x-100 ${
                  location.pathname.startsWith('/services') ? 'scale-x-100' : ''
                }`}></span>
              </NavLink>

              <NavLink
                to="/capacity-building-levy"
                className={({ isActive }) =>
                  `relative px-4 py-2 text-base lg:text-lg font-semibold transition-colors duration-300 group ${
                    isActive ? 'text-primary-purple' : 'text-primary-purple hover:text-primary-purple/80'
                  }`
                }
              >
                <span>Capacity Building Levy</span>
                <span className={`absolute bottom-0 left-3 right-3 h-0.5 bg-primary-purple origin-left transform transition-transform duration-300 scale-x-0 group-hover:scale-x-100 ${
                  location.pathname.startsWith('/capacity-building-levy') ? 'scale-x-100' : ''
                }`}></span>
              </NavLink>

              <div 
                className="relative py-2" 
                ref={dropdownRefs.resources}
                onMouseEnter={() => handleMouseEnter('resources')}
                onMouseLeave={handleMouseLeave}
              >
                <button
                  onClick={() => setActiveDropdown(activeDropdown === 'resources' ? null : 'resources')}
                  className={`relative px-4 py-2 text-base lg:text-lg font-semibold transition-colors duration-300 group flex items-center gap-1.5 ${
                    isResourceCentreActive ? 'text-primary-purple' : 'text-primary-purple hover:text-primary-purple/80'
                  }`}
                >
                  <span>Resource Centre</span>
                  <FontAwesomeIcon 
                    icon={faChevronDown} 
                    className={`w-3 h-3 transition-transform duration-200 ${activeDropdown === 'resources' ? 'rotate-180' : ''}`} 
                  />
                </button>
              </div>

              <NavLink
                to="/news"
                className={({ isActive }) =>
                  `relative px-4 py-2 text-base lg:text-lg font-semibold transition-colors duration-300 group ${
                    isActive ? 'text-primary-purple' : 'text-primary-purple hover:text-primary-purple/80'
                  }`
                }
              >
                <span>News</span>
                <span className={`absolute bottom-0 left-3 right-3 h-0.5 bg-primary-purple origin-left transform transition-transform duration-300 scale-x-0 group-hover:scale-x-100 ${
                  location.pathname.startsWith('/news') ? 'scale-x-100' : ''
                }`}></span>
              </NavLink>
            </nav>

            <div className="flex items-center gap-2 pl-2 shrink-0 border-l border-gray-100">
              <a href="tel:+254700123456" className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-600 hover:text-primary-purple transition-colors">
                <FontAwesomeIcon icon={faPhone} className="w-4 h-4" />
                <span className="hidden lg:inline text-sm font-semibold">Call Now</span>
              </a>
            </div>
          </div>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-primary-purple hover:bg-gray-100/50 transition-colors"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Full‑Width Absolute Mega Menu Dropdown (desktop only) */}
      <div 
        ref={megaMenuContainerRef}
        className="absolute top-full left-0 w-full z-40"
        style={{ height: 0, opacity: 0, display: 'none', pointerEvents: 'none' }}
        onMouseEnter={() => {
          if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current)
            hoverTimeoutRef.current = null
          }
        }}
        onMouseLeave={() => {
          hoverTimeoutRef.current = setTimeout(() => {
            setActiveDropdown(null)
          }, 300)
        }}
      >
        {activeDropdown === 'about' && <MegaMenu categories={aboutCategories} />}
        {activeDropdown === 'resources' && <MegaMenu categories={resourceCategories} />}
      </div>

      {/* Mobile Hamburger Menu – scrollable */}
      {isMobileMenuOpen && (
        <div 
          className="md:hidden border-t border-gray-100 max-h-[calc(100vh-5rem)] overflow-y-auto bg-white px-4 py-3 shadow-inner"
          style={{
            WebkitOverflowScrolling: 'touch',
            touchAction: 'pan-y',
          }}
        >
          <div className="space-y-1">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `block px-4 py-3 rounded-xl text-base font-semibold transition-all ${
                  isActive ? 'bg-primary-purple/10 text-primary-purple' : 'text-gray-700 hover:bg-gray-50'
                }`
              }
            >
              <FontAwesomeIcon icon={faHome} className="mr-2 text-primary-purple" />
              Home
            </NavLink>
            
            <div>
              <button 
                onClick={() => setMobileAboutOpen(!mobileAboutOpen)}
                className="flex items-center justify-between w-full px-4 py-3 rounded-xl text-base font-semibold text-gray-700 hover:bg-gray-50 transition-all"
              >
                <span>
                  <FontAwesomeIcon icon={faInfoCircle} className="mr-2 text-primary-purple" />
                  About
                </span>
                <FontAwesomeIcon 
                  icon={faChevronDown} 
                  className={`text-gray-400 transition-transform duration-300 ${mobileAboutOpen ? 'rotate-180 text-primary-purple' : ''}`} 
                />
              </button>
              
              <div className={`grid transition-all duration-300 ease-in-out ${mobileAboutOpen ? 'grid-rows-[1fr] opacity-100 my-2' : 'grid-rows-[0fr] opacity-0 pointer-events-none'}`}>
                <div className="overflow-hidden">
                  <div className="space-y-4 pl-4 ml-2 border-l-2 border-gray-100">
                    {aboutCategories.map((category, idx) => (
                      <div key={idx} className="space-y-2">
                        <div className="flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-lg">
                          <FontAwesomeIcon icon={category.icon} className="text-primary-purple text-xs" />
                          <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">{category.title}</h4>
                        </div>
                        <div className="space-y-0.5">
                          {category.links.map((link, linkIdx) => (
                            <Link
                              key={linkIdx}
                              to={link.path}
                              className={`block px-3 py-2 rounded-lg transition-all ${
                                location.pathname === link.path
                                  ? 'bg-primary-purple/5 text-primary-purple'
                                  : 'text-gray-600 hover:bg-gray-50 hover:text-primary-purple'
                              }`}
                            >
                              <span className="block text-sm font-medium">{link.label}</span>
                              <span className="block text-xs text-gray-400">{link.desc}</span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            <NavLink
              to="/services"
              className={({ isActive }) =>
                `block px-4 py-3 rounded-xl text-base font-semibold transition-all ${
                  isActive ? 'bg-primary-purple/10 text-primary-purple' : 'text-gray-700 hover:bg-gray-50'
                }`
              }
            >
              <FontAwesomeIcon icon={faCogs} className="mr-2 text-primary-purple" />
              Services
            </NavLink>

            <NavLink
              to="/capacity-building-levy"
              className={({ isActive }) =>
                `block px-4 py-3 rounded-xl text-base font-semibold transition-all ${
                  isActive ? 'bg-primary-purple/10 text-primary-purple' : 'text-gray-700 hover:bg-gray-50'
                }`
              }
            >
              <FontAwesomeIcon icon={faBuilding} className="mr-2 text-primary-purple" />
              Capacity Building Levy
            </NavLink>

            <div>
              <button 
                onClick={() => setMobileResourceOpen(!mobileResourceOpen)}
                className="flex items-center justify-between w-full px-4 py-3 rounded-xl text-base font-semibold text-gray-700 hover:bg-gray-50 transition-all"
              >
                <span>
                  <FontAwesomeIcon icon={faBook} className="mr-2 text-primary-purple" />
                  Resource Centre
                </span>
                <FontAwesomeIcon 
                  icon={faChevronDown} 
                  className={`text-gray-400 transition-transform duration-300 ${mobileResourceOpen ? 'rotate-180 text-primary-purple' : ''}`} 
                />
              </button>
              
              <div className={`grid transition-all duration-300 ease-in-out ${mobileResourceOpen ? 'grid-rows-[1fr] opacity-100 my-2' : 'grid-rows-[0fr] opacity-0 pointer-events-none'}`}>
                <div className="overflow-hidden">
                  <div className="space-y-4 pl-4 ml-2 border-l-2 border-gray-100">
                    {resourceCategories.map((category, idx) => (
                      <div key={idx} className="space-y-2">
                        <div className="flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-lg">
                          <FontAwesomeIcon icon={category.icon} className="text-primary-purple text-xs" />
                          <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">{category.title}</h4>
                          <span className="ml-auto text-xs text-gray-400">{category.links.length}</span>
                        </div>
                        <div className="space-y-0.5">
                          {category.links.map((link, linkIdx) => (
                            <Link
                              key={linkIdx}
                              to={link.path}
                              className={`block px-3 py-2 rounded-lg transition-all ${
                                location.pathname === link.path
                                  ? 'bg-primary-purple/5 text-primary-purple'
                                  : 'text-gray-600 hover:bg-gray-50 hover:text-primary-purple'
                              }`}
                            >
                              <span className="block text-sm font-medium">{link.label}</span>
                              <span className="block text-xs text-gray-400">{link.desc}</span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            <NavLink
              to="/news"
              className={({ isActive }) =>
                `block px-4 py-3 rounded-xl text-base font-semibold transition-all ${
                  isActive ? 'bg-primary-purple/10 text-primary-purple' : 'text-gray-700 hover:bg-gray-50'
                }`
              }
            >
              <FontAwesomeIcon icon={faNewspaper} className="mr-2 text-primary-purple" />
              News
            </NavLink>
            
            <div className="border-t border-gray-100 mt-4 pt-3">
              <a href="tel:+254700123456" className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl text-base font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
                <FontAwesomeIcon icon={faPhone} className="text-gray-500" />
                Call Now
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}