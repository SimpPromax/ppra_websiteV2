import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGavel,
  faSearch,
  faChalkboardTeacher,
  faClipboardCheck,
  faUserTie,
  faUserSlash,
  faMousePointer,
  faFileContract, 
  faSearchPlus, 
  faShieldAlt, 
  faBuilding, 
  faGraduationCap
} from "@fortawesome/free-solid-svg-icons";

// ===== ADD THIS IMPORT =====
import TextToSpeech from '../components/text-to-speech/TextToSpeech';

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger)

// Import assets
import logoImage from '../assets/commonPics/3d ppra transparent.png'
import kenyanFlag from '../assets/commonPics/circle logo for ppra.png'
import newspaperImage from '../assets/commonPics/ppra finaicial newspaper pic.jpg'
import introVideo from '../assets/videos/shortened intro video for  landingpage.mp4'
// Import decorative images
import dayDreamingImage from '../assets/commonPics/undraw_day-dreaming_2mlz.svg'
import fileAnalysisImage from '../assets/commonPics/undraw_file-analysis_nbtc.svg'
import vacationSelfieImage from '../assets/commonPics/undraw_vacation-selfie_q5bs.svg'
import videoPlaceholder from '../assets/commonPics/ppra video substitute.png'

// Import partner logos
import competitionAuthorityLogo from '../assets/commonPics/Competition authority of kenya logo.png'
import ecitizenLogo from '../assets/commonPics/E citizen logo.png'
import ethicsLogo from '../assets/commonPics/Ethics and anti corruption logo.png'
import germanCorporationLogo from '../assets/commonPics/German corporation logo.png'
import kisimLogo from '../assets/commonPics/Kisim logo.png'
import officeOfAgLogo from '../assets/commonPics/offiOf AG.png'
import openContractingLogo from '../assets/commonPics/Open contracting partnership logo.png'
import openOwnershipLogo from '../assets/commonPics/Open ownership logo.png'
import tretiarylogo from '../assets/commonPics/national tresury.png'



// Import OORA images
import pic1 from '../assets/official_oora_pics/pic1.jpeg';
import pic3 from '../assets/official_oora_pics/pic3.jpeg';
import pic4 from '../assets/official_oora_pics/pic4.jpeg';
import pic8 from '../assets/official_oora_pics/pic8.jpeg';
import pic12 from '../assets/official_oora_pics/pic12.jpg';
import pic13 from '../assets/official_oora_pics/pic13.jpg';

// Constants
const TYPING_WORDS = ['Honesty', 'Integrity', 'Accountability']
const TYPING_CONFIG = {
  typingSpeed: 100,
  deletingSpeed: 60,
  pauseDuration: 1500
}

const PARTNER_LOGOS = [
  { 
    src: competitionAuthorityLogo, 
    alt: 'Competition Authority of Kenya', 
    name: 'Competition Authority',
    website: 'https://www.cak.go.ke'
  },
  { 
    src: ecitizenLogo, 
    alt: 'E Citizen', 
    name: 'E Citizen',
    website: 'https://www.ecitizen.go.ke'
  },
  { 
    src: ethicsLogo, 
    alt: 'Ethics and Anti-Corruption Commission', 
    name: 'Ethics & Anti-Corruption',
    website: 'https://www.eacc.go.ke'
  },

  { 
    src: kisimLogo, 
    alt: 'Kisim', 
    name: 'Kisim',
    website: 'https://www.kisim.go.ke'
  },
  { 
    src: officeOfAgLogo, 
    alt: 'Office of the Attorney General', 
    name: 'Office of the AG',
    website: 'https://www.statelaw.go.ke'
  },
{
    name: "National Treasury",
    src: tretiarylogo,
    alt: "The National Treasury of Kenya",
    website: "https://www.treasury.go.ke/"
  }
]

// ============================================
// HELPER COMPONENTS
// ============================================

// Counter Number Component
function CounterNumber({ targetValue, duration = 2000, delay = 0, className = '' }) {
  const [count, setCount] = useState(0);
  const elementRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    let startTime = null;
    let startValue = 0;
    let endValue = targetValue;
    let rafId = null;

    const animateCounter = (timestamp) => {
      if (startTime === null) {
        startTime = timestamp;
      }

      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      
      const currentValue = Math.round(startValue + (endValue - startValue) * easeOutQuart);
      setCount(currentValue);

      if (progress < 1) {
        rafId = requestAnimationFrame(animateCounter);
      } else {
        setCount(endValue);
      }
    };

    const startAnimation = () => {
      startTime = null;
      setCount(0);
      
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
      
      setTimeout(() => {
        rafId = requestAnimationFrame(animateCounter);
      }, delay);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            startAnimation();
          }
        });
      },
      { threshold: 0.5 }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
    };
  }, [targetValue, duration, delay]);

  return (
    <span ref={elementRef} className={className}>
      {count}
    </span>
  );
}

// ============================================
// CUSTOM HOOKS
// ============================================

const useTypewriter = (words, { typingSpeed, deletingSpeed, pauseDuration }) => {
  const [displayText, setDisplayText] = useState('')
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [isTyping, setIsTyping] = useState(true)

  useEffect(() => {
    let timeout
    let isMounted = true

    const typeWriter = () => {
      if (!isMounted) return

      const currentWord = words[currentWordIndex]

      if (isTyping) {
        if (displayText.length < currentWord.length) {
          timeout = setTimeout(() => {
            if (isMounted) {
              setDisplayText(currentWord.slice(0, displayText.length + 1))
            }
          }, typingSpeed)
        } else {
          timeout = setTimeout(() => {
            if (isMounted) setIsTyping(false)
          }, pauseDuration)
        }
      } else {
        if (displayText.length > 0) {
          timeout = setTimeout(() => {
            if (isMounted) {
              setDisplayText(currentWord.slice(0, displayText.length - 1))
            }
          }, deletingSpeed)
        } else {
          setIsTyping(true)
          setCurrentWordIndex((prev) => (prev + 1) % words.length)
        }
      }
    }

    typeWriter()

    return () => {
      isMounted = false
      clearTimeout(timeout)
    }
  }, [displayText, isTyping, currentWordIndex, words, typingSpeed, deletingSpeed, pauseDuration])

  return { displayText, currentWordIndex }
}

const useFormHandler = (initialState = { name: '', email: '', message: '' }) => {
  const [formData, setFormData] = useState(initialState)
  const [formErrors, setFormErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState(null)

  const validateForm = useCallback(() => {
    const errors = {}
    if (!formData.name?.trim()) errors.name = 'Name is required'
    if (!formData.email?.trim()) {
      errors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address'
    }
    if (!formData.message?.trim()) errors.message = 'Message is required'
    return errors
  }, [formData])

  const handleChange = useCallback((e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }))
    }
  }, [formErrors])

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault()
    const errors = validateForm()
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    setIsSubmitting(true)
    setSubmitStatus(null)

    try {
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          if (Math.random() > 0.1) {
            resolve()
          } else {
            reject(new Error('Failed to send message'))
          }
        }, 1500)
      })
      
      setSubmitStatus({ type: 'success', message: 'Message sent successfully!' })
      setFormData(initialState)
      
      setTimeout(() => setSubmitStatus(null), 5000)
    } catch (error) {
      setSubmitStatus({ type: 'error', message: error.message || 'Failed to send message. Please try again.' })
      setTimeout(() => setSubmitStatus(null), 5000)
    } finally {
      setIsSubmitting(false)
    }
  }, [formData, validateForm, initialState])

  return {
    formData,
    formErrors,
    isSubmitting,
    submitStatus,
    handleChange,
    handleSubmit
  }
}

// ============================================
// ERROR BOUNDARY
// ============================================

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Home page error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-soft-cream">
          <div className="text-center p-8">
            <h1 className="text-2xl font-bold text-primary-purple mb-4">Something went wrong</h1>
            <p className="text-gray-600 mb-6">We're having trouble loading this page. Please try refreshing.</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-primary-green text-white px-6 py-3 rounded-xl hover:bg-primary-green-dark transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// ============================================
// SECTION COMPONENTS
// ============================================

// 1. HERO SECTION
function HeroSection({ displayText }) {
  const heroRef = useRef(null)
  const welcomeRef = useRef(null)
  const mainTitleRef = useRef(null)
  const descriptionRef = useRef(null)

  useGSAP(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline()
      
      if (welcomeRef.current) {
        tl.from(welcomeRef.current, {
          y: 30,
          opacity: 0,
          duration: 0.6,
          ease: 'power2.out',
          clearProps: 'all'
        });
      }
      
      if (mainTitleRef.current) {
        tl.from(mainTitleRef.current, {
          y: 40,
          opacity: 0,
          duration: 0.8,
          ease: 'power3.out',
          clearProps: 'all'
        }, '-=0.3');
      }
      
      if (descriptionRef.current) {
        tl.from(descriptionRef.current, {
          y: 30,
          opacity: 0,
          duration: 0.6,
          ease: 'power2.out',
          clearProps: 'all'
        }, '-=0.2');
      }
    }, heroRef)
    
    return () => ctx.revert()
  }, [])

  return (
    <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-visible">
      <div className="absolute inset-0">
        <div className="absolute inset-0">
          <img 
            src={kenyanFlag}
            alt="Kenyan Flag"
            className="absolute inset-0 w-full h-full object-cover"
            style={{ opacity: 0.9 }}
          />
          <div className="absolute inset-0 bg-primary-purple/90"></div>
        </div>
      </div>
      
      <div className="relative z-10 w-full">
        <div className="min-h-screen">
          <div className="flex flex-col justify-center min-h-screen px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-12 sm:py-16 md:py-20">
            <div className="w-full max-w-7xl mx-auto">
              <div ref={welcomeRef}>
  <p className="text-soft-cream/70 text-xs sm:text-sm md:text-base lg:text-2xl xl:text-5xl uppercase tracking-widest font-semibold mb-2 sm:mb-3">
    WELCOME TO PPRA
  </p>
  <div className="w-24 sm:w-28 md:w-36 lg:w-88 xl:w-90 h-0.5 lg:h-1 bg-primary-green"></div>
</div>
              
              <div ref={mainTitleRef} className="mt-4 sm:mt-6 md:mt-8">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-bold text-white leading-tight">
                  Ensuring{' '}
                  <span className="text-primary-red inline-block">
                    {displayText}
                    <span className="animate-pulse">|</span>
                  </span>
                  <br />
                  <span>in Public</span>
                  <br />
                  <span>Procurement</span>
                </h1>
              </div>
              
              <div ref={descriptionRef} className="mt-4 sm:mt-6 md:mt-8">
                <p className="text-sm sm:text-base md:text-lg text-soft-cream/80 leading-relaxed max-w-3xl">
                  The Public Procurement Regulatory Authority (PPRA) is a Kenyan government agency established under the Public Procurement and Asset Disposal Act, 2015. It is responsible for monitoring, assessing, and reviewing the public procurement and asset disposal system to ensure compliance with national values and constitutional provisions. 
                </p>
                
                <div className="mt-4 sm:mt-6 md:mt-8">
                  <Link
                    to="/about"
                    className="inline-flex items-center gap-2 bg-primary-green text-white px-5 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4 rounded-xl font-semibold text-sm sm:text-base md:text-lg hover:bg-primary-green-dark transition-all duration-300 transform hover:scale-105 shadow-lg"
                  >
                    Learn More
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 h-16 sm:h-24 md:h-32 bg-linear-to-t from-soft-cream to-transparent"></div>
    </section>
  );
}

// 2. PREMIUM INTRO SECTION (WITH CUSTOM SCROLLBAR)
function PremiumIntroSection() {
  const containerRef = useRef(null);
  const stickyRef = useRef(null);
  const videoWrapperRef = useRef(null);
  const videoOverlayRef = useRef(null);
  const contentRef = useRef(null);
  const marqueeRef = useRef(null);
  const videoRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const [videoLoaded, setVideoLoaded] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      const handleLoadedData = () => {
        setVideoLoaded(true);
      };
      
      if (video.readyState >= 3) {
        setVideoLoaded(true);
      }
      
      video.addEventListener('loadeddata', handleLoadedData);
      
      return () => {
        video.removeEventListener('loadeddata', handleLoadedData);
      };
    }
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.log('Video autoplay prevented:', error);
        });
      }
    }
  }, []);

  useGSAP(() => {
    ScrollTrigger.getAll().forEach(trigger => {
      if (trigger.vars.trigger === containerRef.current) {
        trigger.kill();
      }
    });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1.2,
        pin: stickyRef.current,
        pinType: 'fixed',
        anticipatePin: 1,
        invalidateOnRefresh: true,
      }
    });

    if (videoWrapperRef.current) {
      tl.to(videoWrapperRef.current, {
        scale: 1.4,
        borderRadius: '0rem',
        duration: 1.5,
        ease: 'power2.inOut',
        overwrite: 'auto'
      });
    }
    
    if (videoOverlayRef.current) {
      tl.to(videoOverlayRef.current, {
        opacity: 0.85,
        duration: 0.6,
        ease: 'power2.inOut'
      }, '-=0.5');
    }
    
    if (contentRef.current) {
      tl.to(contentRef.current, {
        opacity: 1,
        y: 0,
        duration: 1.2,
        ease: 'power3.out',
      }, '-=0.4');
    }

    const marqueeElement = marqueeRef.current;
    if (marqueeElement) {
      const totalWidth = marqueeElement.scrollWidth / 2;
      
      gsap.to(marqueeElement, {
        x: `-${totalWidth}px`,
        repeat: -1,
        duration: 55,
        ease: 'none',
        modifiers: {
          x: (x) => {
            const position = parseFloat(x);
            const resetPoint = -totalWidth;
            if (position <= resetPoint) {
              return "0px";
            }
            return x;
          }
        }
      });
    }

    return () => {
      ScrollTrigger.getAll().forEach(trigger => {
        if (trigger.vars.trigger === containerRef.current) {
          trigger.kill();
        }
      });
    };
  }, { scope: containerRef });

  return (
    <section 
      ref={containerRef} 
      className="relative min-h-[220vh] bg-soft-cream w-full overflow-hidden select-none"
      aria-label="PPRA Introduction Section"
    >
      {/* Structural grid lines */}
      <div className="absolute inset-0 flex justify-between pointer-events-none opacity-10 z-0 px-8">
        <div className="w-px h-full bg-primary-purple"></div>
        <div className="w-px h-full bg-primary-purple hidden md:block"></div>
        <div className="w-px h-full bg-primary-purple hidden md:block"></div>
        <div className="w-px h-full bg-primary-purple"></div>
      </div>

      <div 
        ref={stickyRef} 
        className="relative w-full h-screen flex items-center justify-center overflow-hidden"
      >
        {/* Cinematic Video Background Layer */}
        <div className="absolute inset-0 w-full h-full overflow-hidden z-0 pointer-events-none">
          <div 
            ref={videoWrapperRef} 
            className="absolute inset-0 m-auto w-full h-full scale-[0.4] rounded-3xl overflow-hidden shadow-2xl will-change-transform"
          >
            <img 
              src={videoPlaceholder}
              alt="PPRA Video Placeholder"
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
                videoLoaded ? 'opacity-0' : 'opacity-100'
              }`}
            />
            
            <video 
              ref={videoRef}
              autoPlay 
              muted 
              loop 
              playsInline 
              preload="metadata"
              className={`absolute inset-0 w-full h-full object-cover origin-center transition-opacity duration-700 ${
                videoLoaded ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <source src={introVideo} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            
            <div 
              ref={videoOverlayRef} 
              className="absolute inset-0 bg-linear-to-br from-primary-purple-dark via-primary-purple to-primary-purple-light opacity-20 backdrop-blur-[1px] transition-opacity duration-300"
            ></div>
          </div>
        </div>

        {/* Centered, high-readability content wrapper with scrollable container */}
        <div 
          ref={contentRef} 
          className="relative max-w-full mx-auto px-4 sm:px-6 lg:px-8 z-10 opacity-0 translate-y-12 w-full text-white pointer-events-auto pb-20 sm:pb-12 md:pb-8"
        >
          <div 
            ref={scrollContainerRef}
            className="home-tech_content w-full max-h-[80vh] overflow-y-auto custom-scrollbar"
          >
            {/* Heading */}
            <div className="text-center mb-8 sm:mb-12 pt-8 sm:pt-12 md:pt-16">
              <h2 className="heading-style-h2 text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight text-white">
                The Journey
              </h2>
            </div>
            
            {/* Full-width text content with small margins */}
            <div className="w-full px-0 md:px-4 lg:px-8">
              <div className="space-y-6 text-gray-200 text-base sm:text-lg md:text-xl lg:text-xl leading-relaxed">
                <p>
                  The public procurement and asset disposal system in Kenya has undergone a remarkable transformation from an unregulated administrative process to a robust legal and institutional framework aligned with international standards and best practices. Prior to the 2000s, procurement was governed by the Supplies Manual of 1978 and supplementary circulars issued by the Ministry of Finance, with the Director of Government Supply Services overseeing compliance and central tender boards responsible for adjudicating and awarding tenders. As the need for greater transparency, accountability and efficiency grew, the Government embarked on comprehensive procurement reforms to modernize the system.
                </p>
                <p>
                  The reform journey gained momentum in 2001 with the introduction of the Exchequer and Audit (Public Procurement) Regulations, which established the Public Procurement Department (PPD) and the Public Procurement Complaints, Review and Appeals Board (PPCRAB). In 2002, Kenya committed to strengthening public financial management and combating corruption by developing procurement legislation based on the UNCITRAL Model Law. These reforms culminated in the enactment of the Public Procurement and Disposal Act, 2005, which became operational in 2007 following the gazettement of the Public Procurement and Disposal Regulations, 2006. The Act established the Public Procurement Oversight Authority (PPOA) as the national regulatory body responsible for overseeing and developing the public procurement and asset disposal system.
                </p>
                <p>
                  A major milestone was achieved with the promulgation of the Constitution of Kenya, 2010, whose Article 227 entrenched the principles of fairness, equity, transparency, competitiveness and cost-effectiveness in public procurement. To operationalize these constitutional principles, the Public Procurement and Asset Disposal Act, 2015 came into effect in January 2016, establishing the Public Procurement Regulatory Authority (PPRA) as the successor to PPOA with an expanded regulatory mandate. Today, PPRA continues to spearhead reforms aimed at strengthening public procurement and asset disposal, enhancing accountability, promoting value for money and supporting sustainable national development through a transparent and efficient procurement system.
                </p>
              </div>
            </div>
            
            {/* Button */}
            <div className="mt-8 sm:mt-10 flex justify-center pb-4">
              <Link
                to="/about"
                className="button group inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-primary-green rounded-xl text-white font-semibold text-sm sm:text-base hover:bg-primary-green-dark transition-all duration-300 hover:gap-3 hover:scale-105 transform"
              >
                <div className="button-inner flex items-center gap-2">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>Learn About Us</span>
                </div>
              </Link>
            </div>

          </div>
        </div>

        {/* Sliding Marquee Bar */}
        <div className="absolute bottom-0 left-0 right-0 w-full bg-primary-purple-dark/90 backdrop-blur-md py-2 sm:py-3 md:py-4 border-t border-white/10 overflow-hidden pointer-events-none z-20">
          <div 
            ref={marqueeRef} 
            className="inline-block whitespace-nowrap text-[10px] xs:text-xs sm:text-sm md:text-base font-semibold tracking-widest uppercase text-soft-cream/70"
          >
            <span className="mx-3 sm:mx-4 md:mx-6">✦ complaints made on procuring entities ✦</span>
            <span className="mx-1 sm:mx-2 text-primary-red/60">•</span>
            <span className="mx-3 sm:mx-4 md:mx-6">✦ market prices of goods, services and works ✦</span>
            <span className="mx-1 sm:mx-2 text-primary-red/60">•</span>
            <span className="mx-3 sm:mx-4 md:mx-6">✦ benchmarked prices ✦</span>
            <span className="mx-1 sm:mx-2 text-primary-red/60">•</span>
            <span className="mx-3 sm:mx-4 md:mx-6">✦ price comparisons for goods, services and works ✦</span>
            <span className="mx-1 sm:mx-2 text-primary-red/60">•</span>
            <span className="mx-3 sm:mx-4 md:mx-6">✦ complaints made on procuring entities ✦</span>
            <span className="mx-1 sm:mx-2 text-primary-red/60">•</span>
            <span className="mx-3 sm:mx-4 md:mx-6">✦ market prices of goods, services and works ✦</span>
            <span className="mx-1 sm:mx-2 text-primary-red/60">•</span>
            <span className="mx-3 sm:mx-4 md:mx-6">✦ benchmarked prices ✦</span>
            <span className="mx-1 sm:mx-2 text-primary-red/60">•</span>
            <span className="mx-3 sm:mx-4 md:mx-6">✦ price comparisons for goods, services and works ✦</span>
          </div>
        </div>
      </div>
    </section>
  );
}

// 3. EXPERIENCE SECTION
function ExperienceSection() {
  const containerRef = useRef(null);
  const galleryWrapperRef = useRef(null);
  const quoteRef = useRef(null);
  const quoteHeaderRef = useRef(null);

  // Your original array of 6 images
  const galleryImages = [
    { src: pic1, alt: "PPRA Visual 1" },
    { src: pic3, alt: "PPRA Visual 2" },
    { src: pic4, alt: "PPRA Visual 3" },
    { src: pic8, alt: "PPRA Visual 4" },
    { src: pic12, alt: "PPRA Visual 5" },
    { src: pic13, alt: "PPRA Visual 6" }
  ];

  useGSAP(() => {
    const mm = gsap.matchMedia();

    // --- DESKTOP ANIMATION (With Dynamic Background Canvas Transition) ---
    mm.add("(min-width: 768px)", () => {
      const firstGroup = gsap.utils.toArray('.img-group-1');
      const secondGroup = gsap.utils.toArray('.img-group-2');

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: galleryWrapperRef.current,
          start: "top top",      
          end: "+=160%", 
          pin: true,             
          scrub: 1.2,             
          anticipatePin: 1
        }
      });

      // Smooth background transition to a rich, premium midnight tone
      tl.to(containerRef.current, {
        backgroundColor: "#110b1c", 
        duration: 1,
        ease: "none"
      }, 0);

      // Group 1: Slide up and fade out
      tl.to(firstGroup, {
        y: -150,               
        opacity: 0,            
        stagger: {
          amount: 0.4,
          from: "end" 
        },
        ease: "power2.inOut"
      }, 0)
      
      // Group 2: Slide up and fade in
      .fromTo(secondGroup, 
        { 
          y: 150, 
          opacity: 0 
        }, 
        {
          y: 0,
          opacity: 1,
          stagger: {
            amount: 0.4,
            from: "end" 
          },
          ease: "power2.out"
        },
        "-=0.5"
      );

      // Desktop Only: Smoothly adjust text/border elements to retain contrast against dark background
      const revealTl = gsap.timeline({
        scrollTrigger: {
          trigger: quoteRef.current,
          start: 'top 80%',
          toggleActions: 'play none none none',
        }
      });

      revealTl.to([quoteHeaderRef.current, '.reveal-line'], {
        color: '#fdfbf7', 
        duration: 0.4
      }, 0)
      .to('.reveal-body', {
        color: '#d4c9e8', 
        duration: 0.4
      }, 0)
      .to('.quote-border', {
        borderColor: 'rgba(212, 201, 232, 0.15)',
        duration: 0.4
      }, 0)
      .to('.pillar-item', {
        color: '#d4c9e8',
        borderColor: 'rgba(212, 201, 232, 0.15)',
        duration: 0.4
      }, 0)
      .fromTo('.reveal-line', 
        { yPercent: 100 }, 
        {
          yPercent: 0,
          duration: 1,
          ease: "power4.out",
          stagger: 0.15
        },
        0
      )
      .fromTo('.reveal-body', 
        { opacity: 0, y: 15 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power2.out"
        },
        "-=0.6"
      );
    });

    // --- MOBILE ANIMATION (Modern Slide Up & Scale) ---
    mm.add("(max-width: 767px)", () => {
      const mobileGrid = gsap.utils.toArray('.mobile-fade-item');
      if (mobileGrid.length > 0) {
        gsap.from(mobileGrid, {
          scrollTrigger: {
            trigger: '.mobile-gallery-trigger',
            start: 'top 80%',
            toggleActions: 'play none none none',
          },
          opacity: 0,
          scale: 0.95,
          y: 30,
          duration: 0.8,
          ease: "power3.out",
          stagger: 0.15
        });
      }
    });

  }, { scope: containerRef });

  return (
    <section 
      ref={containerRef}
      id="lexperience" 
      aria-label="Premium Experience Section" 
      className="w-full relative md:pt-24 pt-12 md:pb-32 pb-12 bg-[#fdfbf7] overflow-hidden transition-colors duration-500 ease-out"
    >
      {/* Dynamic Tactile Grain Overlay */}
      <div 
        className="pointer-events-none fixed inset-0 z-50 opacity-[0.035] mix-blend-overlay select-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
        }}
      />

      {/* --- INTRO SECTION (Balanced 2-Column Layout, Spacing Removed) --- */}
      <div className="max-w-7xl xl:px-14 px-4 mx-auto mb-0 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start border-b border-primary-purple/10 pb-0">
          {/* Left: Bold Identifier */}
          <div className="lg:col-span-5">
            <h2 className="text-start text-primary-purple font-bold text-4xl sm:text-5xl lg:text-[64px] uppercase leading-none tracking-tight">
              PPRA: <br />
              More than a <span className="text-primary-purple/50">Regulator</span>
            </h2>
          </div>
          {/* Right: Narrative details */}
          <div className="lg:col-span-7 lg:pt-3">
            <p className="text-start text-primary-purple-light font-normal text-lg sm:text-xl md:text-2xl tracking-normal leading-relaxed">
              The transition from the Public Procurement Oversight Authority (PPOA) to the Public Procurement Regulatory Authority (PPRA) was much more than a change of name. It represented a shift from a primarily oversight-focused institution to a modern regulator with broader legal powers under the Public Procurement and Asset Disposal Act, 2015.
            </p>
            <p className="text-start text-primary-purple/70 font-normal text-base md:text-lg tracking-normal leading-relaxed mt-4">
              This transition has marked a significant structural evolution in Kenya's public procurement landscape, laying down foundations for better compliance, transparency, and fiscal responsibility.
            </p>
          </div>
        </div>
      </div>

      {/* --- DESKTOP PINNED GALLERY --- */}
      <div 
        ref={galleryWrapperRef} 
        className="hidden md:flex items-center justify-center w-full min-h-screen overflow-hidden relative z-10"
      >
        <div className="w-full relative">
          <div className="grid grid-cols-3 gap-4 items-start w-full relative px-4 md:px-14">
            
            {/* GROUP 1: The Initial 3 Images */}
            {galleryImages.slice(0, 3).map((img, i) => (
              <div 
                key={`g1-${i}`} 
                className="img-group-1 w-full h-170 overflow-hidden rounded-none bg-black/5 group relative will-change-transform"
              >
                <img 
                  src={img.src} 
                  alt={img.alt} 
                  draggable="false" 
                  loading="lazy" 
                  className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105 select-none" 
                />
              </div>
            ))}

            {/* GROUP 2: The Incoming 3 Images */}
            <div className="absolute inset-0 grid grid-cols-3 gap-4 items-start pointer-events-none px-4 md:px-14">
              {galleryImages.slice(3, 6).map((img, i) => (
                <div 
                  key={`g2-${i}`} 
                  className="img-group-2 w-full h-170 overflow-hidden rounded-none bg-black/5 group relative opacity-0 pointer-events-auto will-change-transform"
                >
                  <img 
                    src={img.src} 
                    alt={img.alt} 
                    draggable="false" 
                    loading="lazy" 
                    className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105 select-none" 
                  />
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>

      {/* MOBILE GALLERY */}
      <div className="md:hidden mobile-gallery-trigger grid grid-cols-2 gap-4 px-4 my-8 relative z-10">
        {galleryImages.slice(0, 4).map((img, i) => (
          <div key={i} className="mobile-fade-item overflow-hidden rounded-lg shadow-md bg-black/5 will-change-transform">
            <img 
              src={img.src} 
              alt={img.alt} 
              draggable="false" 
              loading="lazy"
              className="w-full h-40 object-cover select-none" 
            />
          </div>
        ))}
      </div>

      {/* --- BOTTOM QUOTE SECTION --- */}
      <div className="max-w-7xl xl:px-14 px-4 mx-auto mt-0 relative z-10">
        <div className="quote-border grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start border-t border-primary-purple/10 pt-0 transition-colors duration-500 ease-out">
          
          {/* Left Column: Visual Pillars Anchor - HIDDEN on mobile and tablet */}
          <div className="hidden lg:flex lg:col-span-4 flex-col justify-between h-full py-1">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-purple/40 mb-8 pt-6">
              System Reforms
            </div>
            <div className="flex flex-col gap-3 font-mono text-xs uppercase tracking-wider">
              {[
                "01 / Digital Procurement",
                "02 / Transparency & Accountability",
                "03 / Evidence-Based Reforms",
                "04 / Institutional Capacity Building",
              ].map((text, idx) => (
                <div 
                  key={idx} 
                  className="pillar-item flex items-center justify-between border-b border-primary-purple/5 pb-2 text-primary-purple-light transition-colors duration-500 ease-out"
                >
                  <span>{text}</span>
                  <span className="text-[10px] opacity-40">➔</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Clean Deep Purple styling for Mobile with zero micro-interaction color-overrides */}
          <div ref={quoteRef} className="col-span-12 lg:col-span-8 pt-6">
            <h2 
              ref={quoteHeaderRef}
              className="text-start text-primary-purple font-bold text-3xl sm:text-4xl md:text-5xl lg:text-[64px] uppercase leading-none mb-6 tracking-tight md:transition-colors md:duration-500 md:ease-out"
            >
              <span className="block overflow-hidden pb-1">
                <span className="reveal-line block">The art of creating</span>
              </span>
              <span className="block overflow-hidden pb-1">
                <span className="reveal-line block">unforgettable impact</span>
              </span>
            </h2>
            
            <p className="reveal-body text-start text-primary-purple-light font-normal text-lg sm:text-xl md:text-2xl tracking-normal leading-relaxed md:transition-colors md:duration-500 md:ease-out">
              PPRA has emerged as a modern regulator driving digital transformation, strengthening compliance, promoting transparency and accountability, building institutional capacity, and advancing evidence-based procurement reforms.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}
// 4. NUMBERS SECTION
function NumbersSection() {
  const pinContainerRef = useRef(null);
  const sectionRef = useRef(null);

  const STATS_DATA = [
    {
      value: 14450,
      display: "14,450",
      suffix: "TENDER REVIEWS",
      description:
        "Tender notices and documents reviewed across PPIP and e-GP to assess compliance with public procurement law.",
      icon: faFileContract,
    },
    {
      value: 701,
      display: "701",
      suffix: "PROCUREMENT ASSESSMENTS",
      description:
        "Procurement assessments conducted, with 138 found to be non-compliant with public procurement law.",
      icon: faClipboardCheck,
    },
    {
      value: 48,
      display: "48",
      suffix: "CONTRACT AUDITS",
      description:
        "Contract performance and site-verification audits across 48 procuring entities, covering 435 contracts.",
      icon: faSearchPlus,
    },
    {
      value: 22,
      display: "22",
      suffix: "SPECIALIZED AUDITS",
      description:
        "Specialised procurement audits conducted during the financial year across multiple audit categories.",
      icon: faShieldAlt,
    },
    {
      value: 828,
      display: "828",
      suffix: "NEW PROCURING ENTITIES",
      description:
        "New procuring entities registered on the Public Procurement Information Portal during the reporting period.",
      icon: faBuilding,
    },
    {
      value: 10400,
      display: "10,400+",
      suffix: "STAKEHOLDERS TRAINED",
      description:
        "Participants reached through eight major stakeholder training programmes on PPRA digital platforms and reporting.",
      icon: faGraduationCap,
    },
  ];

  useGSAP(() => {
    ScrollTrigger.create({
      trigger: pinContainerRef.current,
      start: "top top",
      end: "+=1200",
      pin: true,
      anticipatePin: 1,

      onEnter: () => {
        gsap.utils.toArray(".count-value").forEach((el) => {
          const targetValue = Number(el.getAttribute("data-target"));
          const displayValue = el.getAttribute("data-display");

          const counter = { value: 0 };

          gsap.to(counter, {
            value: targetValue,
            duration: 1.8,
            ease: "power2.out",
            overwrite: "auto",

            onUpdate: () => {
              const currentValue = Math.floor(counter.value);

              const hasPlus = displayValue.endsWith("+");

              el.textContent =
                currentValue.toLocaleString("en-US") +
                (hasPlus ? "+" : "");
            },

            onComplete: () => {
              // Ensure the final value exactly matches the display value
              el.textContent = displayValue;
            },
          });
        });
      },
    });
  }, { scope: pinContainerRef });

  return (
    <div
      ref={pinContainerRef}
      className="w-full bg-primary-purple-dark"
    >
      <section
        ref={sectionRef}
        className="w-full min-h-screen flex flex-col justify-center py-16 md:py-24"
      >
        <div className="container mx-auto max-w-7xl px-2 sm:px-4 lg:px-6">

          {/* Header Section */}
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-soft-cream mb-4">
              The Statistics
            </h2>

            <div className="w-24 h-1 bg-primary-green mx-auto rounded-full mb-3" />

            <p className="text-xs md:text-sm font-bold uppercase tracking-widest text-primary-green-light/80">
              Data Cumulative: 2025 — 2026
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 md:gap-x-6 gap-y-0 md:gap-y-0">

            {STATS_DATA.map((item, index) => {
              const isTopRow = index < 3;

              return (
                <div
                  key={index}
                  className={`stat-card text-center group cursor-pointer transition-all duration-300 bg-transparent hover:bg-primary-purple border border-transparent hover:border-primary-green/30 hover:shadow-2xl hover:shadow-primary-green/5
                    rounded-none
                    ${
                      isTopRow
                        ? "pt-6 md:pt-8 pb-0 md:pb-0 mb-0 md:mb-0"
                        : "pt-0 md:pt-0 pb-6 md:pb-8 mt-0 md:mt-0"
                    }`}
                >

                  {/* Icon */}
                  <div className="flex justify-center mb-6">
                    <div className="w-20 h-20 rounded-full bg-primary-green/15 flex items-center justify-center group-hover:bg-primary-red/20 transition-all duration-300 ring-4 ring-transparent group-hover:ring-primary-red/10">
                      <FontAwesomeIcon
                        icon={item.icon}
                        className="text-3xl text-primary-green-light group-hover:text-primary-red transition-all duration-300"
                      />
                    </div>
                  </div>

                  {/* Label */}
                  <div className="mb-2">
                    <span className="text-xs md:text-sm font-bold uppercase tracking-wider text-soft-cream/60 group-hover:text-primary-green-light transition-all duration-300">
                      {item.suffix}
                    </span>
                  </div>

                  {/* Number */}
                  <div className="mb-4">
                    <span className="text-5xl md:text-6xl font-black text-soft-cream group-hover:text-primary-red transition-all duration-300 tracking-tight">
                      <span
                        className="count-value"
                        data-target={item.value}
                        data-display={item.display}
                      >
                        0
                      </span>
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-gray-300 text-sm md:text-base leading-relaxed max-w-md mx-auto group-hover:text-soft-cream transition-all duration-300">
                    {item.description}
                  </p>

                </div>
              );
            })}

          </div>
        </div>
      </section>
    </div>
  );
}

// 5. PARTNERS SECTION - WITH memoizedPartners INSIDE
function PartnersSection() {
  const partnersRef = useRef(null);
  
  const memoizedPartners = useMemo(() => PARTNER_LOGOS, []);

  useGSAP(() => {
    const tickerList = partnersRef.current.querySelector('.ticker-list');
    if (!tickerList) return;

    const tickerItems = tickerList.querySelectorAll('.ticker-item');
    if (tickerItems.length === 0) return;

    let totalWidth = 0;
    tickerItems.forEach(item => {
      totalWidth += item.offsetWidth;
    });
    
    const GAP_SIZE = 64; // matching gap-16 from your first code
    totalWidth += (tickerItems.length - 1) * GAP_SIZE;
    const halfWidth = totalWidth / 2;
    
    const tl = gsap.to(tickerList, {
      x: -halfWidth,
      duration: 30, // Original speed suited for larger elements
      ease: "none",
      repeat: -1,
      modifiers: {
        x: (x) => `${parseFloat(x) % halfWidth}px`
      }
    });

    const handleMouseEnter = () => tl.pause();
    const handleMouseLeave = () => tl.play();

    tickerList.addEventListener('mouseenter', handleMouseEnter);
    tickerList.addEventListener('mouseleave', handleMouseLeave);
    
    return () => {
      tickerList.removeEventListener('mouseenter', handleMouseEnter);
      tickerList.removeEventListener('mouseleave', handleMouseLeave);
      tl.kill();
    };
  }, { scope: partnersRef, dependencies: [memoizedPartners] });

  return (
    <section 
      ref={partnersRef} 
      className="py-12 sm:py-16 bg-soft-cream overflow-hidden border-y border-gray-100/40" 
      aria-label="Our partners section"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6 sm:mb-8">
          <div className="w-12 sm:w-16 h-0.5 bg-primary-purple mx-auto mb-3 sm:mb-4" aria-hidden="true"></div>
          <p className="text-xs sm:text-sm font-bold uppercase tracking-widest text-primary-purple/70">
            Trusted Partners
          </p>
          <p className="mt-2 text-sm sm:text-base text-gray-500 max-w-2xl mx-auto">
            Collaborating with leading organizations to enhance procurement standards.
          </p>
        </div>
      </div>

      {/* Ticker Container with progressive edge fade mask */}
      <div 
        className="col-span-full my-6 sm:my-8 md:my-10"
        style={{
          overflowX: 'clip',
          display: 'flex',
          position: 'relative',
          maskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)',
          WebkitMaskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)'
        }}
      >
        <ul className="ticker-list flex list-none p-0 m-0 gap-16 w-max group py-4">
          {/* Original Loop */}
          {memoizedPartners.map((logo, index) => (
            <li key={`original-${index}`} className="ticker-item shrink-0 flex items-center justify-center">
              <a 
                href={logo.website} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center p-2 sm:p-3 md:p-4 w-48 sm:w-64 md:w-96 h-32 sm:h-44 md:h-56 transition-all duration-300 ease-out hover:scale-110 grayscale-0 hover:grayscale group-hover:opacity-40 hover:opacity-100!"
                aria-label={`Visit ${logo.name} website (opens in new tab)`}
              >
                <img 
                  src={logo.src}
                  alt={`${logo.alt} logo`}
                  className="w-full h-full object-contain pointer-events-none"
                  title={`Click to visit ${logo.name}`}
                />
              </a>
            </li>
          ))}
          
          {/* Duplicate Loop */}
          {memoizedPartners.map((logo, index) => (
            <li key={`duplicate-${index}`} className="ticker-item shrink-0 flex items-center justify-center">
              <a 
                href={logo.website} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center p-2 sm:p-3 md:p-4 w-48 sm:w-64 md:w-96 h-32 sm:h-44 md:h-56 transition-all duration-300 ease-out hover:scale-110 grayscale-0 hover:grayscale group-hover:opacity-40 hover:opacity-100!"
                aria-label={`Visit ${logo.name} website (opens in new tab)`}
              >
                <img 
                  src={logo.src}
                  alt={`${logo.alt} logo`}
                  className="w-full h-full object-contain pointer-events-none"
                  title={`Click to visit ${logo.name}`}
                />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

// 6. CONTACT SECTION
function ContactSection() {
  const contactRef = useRef(null);
  const { formData, formErrors, isSubmitting, submitStatus, handleChange, handleSubmit } = useFormHandler();

  useGSAP(() => {
    if (!contactRef.current) return
    
    const ctx = gsap.context(() => {
      gsap.from(contactRef.current, {
        y: 50,
        opacity: 0,
        duration: 0.8,
        clearProps: 'all',
        scrollTrigger: {
          trigger: contactRef.current,
          start: 'top 80%',
          toggleActions: 'play none none reverse',
          invalidateOnRefresh: true
        }
      })
    }, contactRef)
    
    return () => ctx.revert()
  }, []);

  return (
    <section 
      ref={contactRef} 
      id="contact" 
      className="relative w-[calc(100%-2rem)] sm:w-[calc(100%-3rem)] lg:w-[calc(100%-4rem)] mx-auto py-8 sm:py-12 md:py-16 my-3 sm:my-4 bg-white overflow-hidden select-none" 
      aria-label="Contact information section"
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 md:gap-12">
          
          {/* Left Column: PPRA Offices Directory */}
          <div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary-purple mb-3 sm:mb-4">Our Office Contacts</h2>
            <div className="w-16 sm:w-20 md:w-24 h-1 bg-primary-green mb-4 sm:mb-5 md:mb-6" aria-hidden="true"></div>
            <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8 leading-relaxed">
              Reach out directly to our headquarters or visit any of our regional offices across Kenya for local procurement assistance.
            </p>
            
            <div className="space-y-4 sm:space-y-5 md:space-y-6 max-h-150 overflow-y-auto pr-2 custom-scrollbar">
              
              {/* Nairobi Headquarters */}
              <div className="p-3 sm:p-4 md:p-5 border border-gray-100 bg-gray-50/50 flex items-start gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 bg-primary-purple/10 flex items-center justify-center text-primary-purple text-base sm:text-lg md:text-xl shrink-0" aria-hidden="true">
                  📍
                </div>
                <div>
                  <h3 className="font-bold text-primary-purple text-sm sm:text-base mb-0.5 sm:mb-1">Nairobi Office (Headquarters)</h3>
                  <p className="text-gray-600 text-xs sm:text-sm leading-relaxed mb-1 sm:mb-2">6th Floor KISM Towers, Off Ngong Road, Nairobi, Kenya</p>
                  <div className="text-[10px] sm:text-xs text-gray-500 space-y-0.5">
                    <p><span className="font-medium text-gray-700">Telephone:</span> +254 020 3244000, 2213106/7</p>
                    <p><span className="font-medium text-gray-700">P.O Box:</span> 58535 - 00200</p>
                  </div>
                </div>
              </div>

              {/* Coast Regional Office */}
              <div className="p-3 sm:p-4 md:p-5 border border-gray-100 bg-gray-50/50 flex items-start gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 bg-primary-purple/10 flex items-center justify-center text-primary-purple text-base sm:text-lg md:text-xl shrink-0" aria-hidden="true">
                  🌊
                </div>
                <div>
                  <h3 className="font-bold text-primary-purple text-sm sm:text-base mb-0.5 sm:mb-1">Coast Regional Office – Mombasa</h3>
                  <p className="text-gray-600 text-xs sm:text-sm leading-relaxed mb-1 sm:mb-2">7th Floor Uhuru na Kazi Building, Mama Ngina Drive</p>
                  <div className="text-[10px] sm:text-xs text-gray-500 space-y-0.5">
                    <p><span className="font-medium text-gray-700">Telephone:</span> 041 2224040</p>
                    <p><span className="font-medium text-gray-700">Mobile:</span> 0700 195220, 0773 734843</p>
                    <p><span className="font-medium text-gray-700">P.O Box:</span> 2605 - 80100</p>
                    <p><span className="font-medium text-gray-700">Email:</span> <a href="mailto:mombasa@ppra.go.ke" className="text-primary-green hover:underline">mombasa@ppra.go.ke</a></p>
                  </div>
                </div>
              </div>

              {/* Western Kenya Regional Office */}
              <div className="p-3 sm:p-4 md:p-5 border border-gray-100 bg-gray-50/50 flex items-start gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 bg-primary-purple/10 flex items-center justify-center text-primary-purple text-base sm:text-lg md:text-xl shrink-0" aria-hidden="true">
                  🌾
                </div>
                <div>
                  <h3 className="font-bold text-primary-purple text-sm sm:text-base mb-0.5 sm:mb-1">Western Kenya Regional Office – Kisumu</h3>
                  <p className="text-gray-600 text-xs sm:text-sm leading-relaxed mb-1 sm:mb-2">Prosperity House, Wing C, 6th Floor, Owuor Otiende Avenue</p>
                  <div className="text-[10px] sm:text-xs text-gray-500 space-y-0.5">
                    <p><span className="font-medium text-gray-700">P.O Box:</span> 2916 - 40100 Kisumu, Kenya</p>
                    <p><span className="font-medium text-gray-700">Telephone:</span> 057 2024000</p>
                    <p><span className="font-medium text-gray-700">Email:</span> <a href="mailto:kisumu@ppra.go.ke" className="text-primary-green hover:underline">kisumu@ppra.go.ke</a></p>
                  </div>
                </div>
              </div>

              {/* North Rift Regional Office */}
              <div className="p-3 sm:p-4 md:p-5 border border-gray-100 bg-gray-50/50 flex items-start gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 bg-primary-purple/10 flex items-center justify-center text-primary-purple text-base sm:text-lg md:text-xl shrink-0" aria-hidden="true">
                  ⛰️
                </div>
                <div>
                  <h3 className="font-bold text-primary-purple text-sm sm:text-base mb-0.5 sm:mb-1">North Rift Regional Office – Eldoret</h3>
                  <p className="text-gray-600 text-xs sm:text-sm leading-relaxed mb-1 sm:mb-2">Ainabkoi Sub County Offices</p>
                  <div className="text-[10px] sm:text-xs text-gray-500 space-y-0.5">
                    <p><span className="font-medium text-gray-700">P.O Box:</span> 799 - 30100, Eldoret, Kenya</p>
                    <p><span className="font-medium text-gray-700">Email:</span> <a href="mailto:eldoret@ppra.go.ke" className="text-primary-green hover:underline">eldoret@ppra.go.ke</a></p>
                  </div>
                </div>
              </div>

              {/* South Rift Regional Office */}
              <div className="p-3 sm:p-4 md:p-5 border border-gray-100 bg-gray-50/50 flex items-start gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 bg-primary-purple/10 flex items-center justify-center text-primary-purple text-base sm:text-lg md:text-xl shrink-0" aria-hidden="true">
                  🦩
                </div>
                <div>
                  <h3 className="font-bold text-primary-purple text-sm sm:text-base mb-0.5 sm:mb-1">South Rift Regional Office – Nakuru</h3>
                  <p className="text-gray-600 text-xs sm:text-sm leading-relaxed mb-1 sm:mb-2">Nakuru Provincial Commissioner's Offices, Block B, 1st Floor, Room One</p>
                  <div className="text-[10px] sm:text-xs text-gray-500 space-y-0.5">
                    <p><span className="font-medium text-gray-700">Email:</span> <a href="mailto:nakuru@ppra.go.ke" className="text-primary-green hover:underline">nakuru@ppra.go.ke</a></p>
                  </div>
                </div>
              </div>

            </div>

            {/* Social Media Links */}
            <div className="mt-4 sm:mt-5 md:mt-6 pt-4 sm:pt-5 md:pt-6 border-t border-gray-100 flex flex-wrap items-center gap-2 sm:gap-3 md:gap-4">
              <span className="text-xs sm:text-sm font-semibold text-primary-purple">Follow us:</span>
              <a target="_blank" href="http://facebook.com/pprakenya" rel="nofollow noopener noreferrer" className="px-2 sm:px-3 py-1.5 sm:py-2 bg-gray-100 text-primary-purple hover:bg-primary-purple/10 transition-colors text-xs sm:text-sm">
                Facebook
              </a>
              <a target="_blank" href="https://x.com/PPRAKenya" rel="nofollow noopener noreferrer" className="px-2 sm:px-3 py-1.5 sm:py-2 bg-gray-100 text-primary-purple hover:bg-primary-purple/10 transition-colors text-xs sm:text-sm">
                X (Twitter)
              </a>
            </div>
          </div>
          
          {/* Right Column: Interactive Form */}
          <div className="bg-transparent p-4 sm:p-6 md:p-8 h-fit lg:sticky lg:top-8">
            <div className="text-center mb-4 sm:mb-5 md:mb-6">
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-primary-purple">
                Send us a message
              </h3>
              <p className="text-gray-600 text-sm md:text-base mt-1 md:mt-2">
                We'll get back to you as soon as possible
              </p>
            </div>
            
            {submitStatus && (
              <div 
                className={`mb-3 sm:mb-4 p-3 sm:p-4 ${
                  submitStatus.type === 'success' 
                    ? 'bg-primary-green/10 text-primary-green border border-primary-green/20' 
                    : 'bg-primary-red/10 text-primary-red border border-primary-red/20'
                }`}
                role="alert"
                aria-live="polite"
              >
                <span className="text-sm sm:text-base">{submitStatus.message}</span>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-3 sm:space-y-4 md:space-y-6" noValidate>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label htmlFor="name" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Your Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full px-3 sm:px-4 py-2 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent transition-colors ${
                      formErrors.name ? 'border-primary-red bg-primary-red/5' : 'border-gray-300'
                    }`}
                    placeholder="Your Name"
                    aria-invalid={!!formErrors.name}
                    aria-describedby={formErrors.name ? "name-error" : undefined}
                    disabled={isSubmitting}
                  />
                  {formErrors.name && (
                    <p id="name-error" className="mt-1 text-xs sm:text-sm text-primary-red" role="alert">
                      {formErrors.name}
                    </p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Your Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-3 sm:px-4 py-2 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent transition-colors ${
                      formErrors.email ? 'border-primary-red bg-primary-red/5' : 'border-gray-300'
                    }`}
                    placeholder="Your Email"
                    aria-invalid={!!formErrors.email}
                    aria-describedby={formErrors.email ? "email-error" : undefined}
                    disabled={isSubmitting}
                  />
                  {formErrors.email && (
                    <p id="email-error" className="mt-1 text-xs sm:text-sm text-primary-red" role="alert">
                      {formErrors.email}
                    </p>
                  )}
                </div>
              </div>
              
              <div>
                <label htmlFor="message" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows="4"
                  value={formData.message}
                  onChange={handleChange}
                  className={`w-full px-3 sm:px-4 py-2 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent transition-colors ${
                    formErrors.message ? 'border-primary-red bg-primary-red/5' : 'border-gray-300'
                  }`}
                  placeholder="Your question or message..."
                  aria-invalid={!!formErrors.message}
                  aria-describedby={formErrors.message ? "message-error" : undefined}
                  disabled={isSubmitting}
                />
                {formErrors.message && (
                  <p id="message-error" className="mt-1 text-xs sm:text-sm text-primary-red" role="alert">
                    {formErrors.message}
                  </p>
                )}
              </div>
              
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="agree"
                  className="form-checkbox mt-1"
                  required
                  disabled={isSubmitting}
                />
                <label htmlFor="agree" className="text-xs sm:text-sm text-gray-600">
                  I agree that my submitted data is being collected and stored <span className="text-red-500">*</span>
                </label>
              </div>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full md:w-auto px-6 sm:px-8 py-2.5 sm:py-3 bg-primary-purple text-white font-semibold rounded-lg hover:bg-primary-purple-dark transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg text-sm sm:text-base ${
                  isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                }`}
                aria-label={isSubmitting ? 'Sending message...' : 'Send message'}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </span>
                ) : (
                  'Send Message'
                )}
              </button>
            </form>
          </div>

        </div>
      </div>
    </section>
  );
}



// ============================================
// LOGO EFFECT COMPONENT (Optional decorative element)
// ============================================
function LogoEffect() {
  const offsetLogoRef = useRef(null);
  const logoContainerRef = useRef(null);

  // Interactive mouse move effect for the logo
  useGSAP(() => {
    const element = offsetLogoRef.current;
    const container = logoContainerRef.current;
    if (!element || !container || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let rafId = null;

    const handleMouseMove = (e) => {
      if (rafId) return;
      
      rafId = requestAnimationFrame(() => {
        const rect = element.getBoundingClientRect();
        const logoCenterX = rect.left + rect.width / 2;
        const logoCenterY = rect.top + rect.height / 2;
        const distanceX = e.clientX - logoCenterX;
        const distanceY = e.clientY - logoCenterY;
        
        gsap.to(element, {
          x: distanceX * 0.25,
          y: distanceY * 0.25,
          scale: 1.1,
          duration: 0.4,
          ease: 'power2.out',
          overwrite: 'auto'
        });
        
        rafId = null;
      });
    };

    const handleMouseLeave = () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      
      gsap.to(element, {
        x: 0,
        y: 0,
        scale: 1,
        duration: 0.6,
        ease: 'elastic.out(1, 0.6)',
        overwrite: 'auto'
      });
    };

    container.addEventListener('mousemove', handleMouseMove, { passive: true });
    container.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, { scope: logoContainerRef });

  // Scroll animations for the logo
  useGSAP(() => {
    if (!offsetLogoRef.current) return;
    
    const ctx = gsap.context(() => {
      gsap.to(offsetLogoRef.current, {
        y: 50,
        ease: "none",
        scrollTrigger: {
          trigger: logoContainerRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 1,
          invalidateOnRefresh: true
        }
      });
      
      if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        gsap.to(offsetLogoRef.current, {
          y: -15,
          duration: 2.5,
          repeat: -1,
          yoyo: true,
          ease: "power1.inOut",
          delay: 0.5
        });
      }
    });
    
    return () => ctx.revert();
  }, []);

  return (
    <div ref={logoContainerRef} className="hidden">
      <div ref={offsetLogoRef}></div>
    </div>
  );
}

// ============================================
// MAIN HOME COMPONENT
// ============================================

export default function Home() {
  const { displayText } = useTypewriter(TYPING_WORDS, TYPING_CONFIG);
  
  // ===== TTS STATE =====
  const [hoverModeActive, setHoverModeActive] = useState(false);
  const [showBanner, setShowBanner] = useState(true);
  const bannerDismissedRef = useRef(false);

  // ===== TTS CALLBACKS =====
  const handleTTSStart = useCallback(() => {
    setHoverModeActive(true);
    bannerDismissedRef.current = false;
    setShowBanner(true);
  }, []);

  const handleTTSEnd = useCallback(() => {
    setHoverModeActive(false);
    setShowBanner(false);
  }, []);

  // ===== BANNER DISMISS =====
  const handleDismissBanner = useCallback(() => {
    bannerDismissedRef.current = true;
    setShowBanner(false);
    setHoverModeActive(false);
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }, []);

  // ===== AUTO-DISMISS BANNER =====
  useEffect(() => {
    if (hoverModeActive && showBanner && !bannerDismissedRef.current) {
      const timer = setTimeout(() => {
        setShowBanner(false);
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [hoverModeActive, showBanner]);

  // ===== ESCAPE KEY DISMISS =====
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && hoverModeActive) {
        handleDismissBanner();
      }
    };
    
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [hoverModeActive, handleDismissBanner]);

  return (
    <ErrorBoundary>
      <>
        <Helmet>
          <title>PPRA Kenya | Public Procurement Regulatory Authority</title>
          <meta name="description" content="PPRA ensures transparency, integrity, and accountability in Kenya's public procurement system." />
          <meta name="keywords" content="PPRA, Kenya, public procurement, procurement regulation, transparency, accountability" />
          <meta property="og:title" content="PPRA Kenya - Public Procurement Regulatory Authority" />
          <meta property="og:description" content="Regulating public procurement in Kenya for fair, transparent, and efficient practices." />
          <meta property="og:type" content="website" />
          <meta property="og:image" content={logoImage} />
          <meta name="twitter:card" content="summary_large_image" />
          <link rel="canonical" href="https://ppra.go.ke" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
        </Helmet>

        {/* ===== GLOBAL STYLES FOR TTS ===== */}
        <style>{`
          .hover-mode-active * {
            cursor: pointer !important;
          }
          .hover-mode-active p:hover,
          .hover-mode-active h1:hover,
          .hover-mode-active h2:hover,
          .hover-mode-active h3:hover,
          .hover-mode-active h4:hover,
          .hover-mode-active h5:hover,
          .hover-mode-active h6:hover,
          .hover-mode-active li:hover,
          .hover-mode-active a:hover,
          .hover-mode-active button:hover,
          .hover-mode-active label:hover {
            cursor: pointer !important;
          }
        `}</style>

        {/* ===== HOVER MODE INSTRUCTION BANNER ===== */}
        {hoverModeActive && !bannerDismissedRef.current && (
          <div 
            className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50"
            style={{ 
              maxWidth: 'calc(100% - 2rem)',
              width: 'auto'
            }}
          >
            <div 
              className="px-5 py-3 rounded-2xl shadow-2xl"
              style={{ 
                backgroundColor: 'rgba(0, 103, 47, 0.95)',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}
            >
              <div className="flex items-center gap-4 text-sm">
                {/* Icon */}
                <div className="shrink-0">
                  <FontAwesomeIcon icon={faMousePointer} className="text-white text-sm" />
                </div>
                
                {/* Text content */}
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="font-semibold text-white text-sm">
                    Hover over any text to read it aloud
                  </span>
                  <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium"
                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)' }}
                  >
                    <span>ESC</span>
                    <span className="opacity-70">to stop</span>
                  </span>
                </div>
                
                {/* Close button */}
                <button
                  onClick={handleDismissBanner}
                  className="shrink-0 ml-1 w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
                  style={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}
                  aria-label="Dismiss"
                >
                  <svg 
                    width="12" 
                    height="12" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary-green text-white px-4 py-2 rounded-lg z-50">
          Skip to main content
        </a>

        <div id="main-content">
          {/* ===== FLOATING TEXT-TO-SPEECH BUTTON ===== */}
          <div className="fixed bottom-6 left-6 z-50">
            <TextToSpeech 
              className="shadow-2xl"
              showSpeedControl={true}
              showVoiceSelector={false}
              onStart={handleTTSStart}
              onEnd={handleTTSEnd}
              onError={(err) => console.error('TTS Error:', err)}
            />
          </div>

          {/* Logo Effect - decorative */}
          <LogoEffect />

          {/* Hero Section */}
          <HeroSection displayText={displayText} />

          {/* Premium Intro Section */}
          <PremiumIntroSection />

          {/* Experience Section */}
          <ExperienceSection />

          {/* Numbers Section */}
          <NumbersSection />

          {/* Partners Section - No props needed! */}
          <PartnersSection />

          {/* Contact Section */}
          <ContactSection />

          {/* CTA SECTION - Regional Offices */}
          <section className="relative bg-slate-950 px-4 md:px-6 lg:px-8 xl:px-12 py-12 md:py-20 text-white">
            <div className="max-w-7xl mx-auto relative z-10">
              
              {/* Offices Directory Grid */}
              <div>
                <h3 className="text-xs md:text-sm font-black uppercase tracking-widest text-slate-400 mb-10 text-center">
                  Our Regional Network
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 text-left">
                  
                  {/* Nairobi - Head Office */}
                  <div className="bg-slate-900/40 p-5 lg:p-4 xl:p-6 border border-slate-900 hover:border-slate-800 transition-colors flex flex-col justify-between h-full">
                    <div>
                      <h4 className="text-sm md:text-base font-black text-white mb-3 uppercase tracking-wide border-b border-slate-800 pb-2">
                        Nairobi (HQ)
                      </h4>
                      <p className="text-xs md:text-sm text-slate-300 leading-relaxed mb-4">
                        KISM Towers, 6th Floor, Ngong Road<br />
                        P.O Box 58535-00200<br />
                        Nairobi, Kenya
                      </p>
                    </div>
                    <div className="text-xs md:text-sm space-y-1.5 pt-2 border-t border-slate-900/60 mt-auto">
                      <p className="text-slate-400">T: <a href="tel:+2540203244000" className="text-white hover:text-sky-400 transition-colors font-medium">+254 020 3244000</a></p>
                      <p className="text-slate-400">E: <a href="mailto:info@ppra.go.ke" className="text-sky-400 hover:text-sky-300 hover:underline font-medium break-all">info@ppra.go.ke</a></p>
                    </div>
                  </div>

                  {/* Coast Regional Office */}
                  <div className="bg-slate-900/40 p-5 lg:p-4 xl:p-6 border border-slate-900 hover:border-slate-800 transition-colors flex flex-col justify-between h-full">
                    <div>
                      <h4 className="text-sm md:text-base font-black text-white mb-3 uppercase tracking-wide border-b border-slate-800 pb-2">
                        Mombasa
                      </h4>
                      <p className="text-xs md:text-sm text-slate-300 leading-relaxed mb-4">
                        Uhuru na Kazi Building, 7th Floor, Mama Ngina Drive<br />
                        P.O Box 2605-80100<br />
                        Mombasa, Kenya
                      </p>
                    </div>
                    <div className="text-xs md:text-sm space-y-1.5 pt-2 border-t border-slate-900/60 mt-auto">
                      <p className="text-slate-400">T: <a href="tel:0412224040" className="text-white hover:text-sky-400 transition-colors font-medium">041 2224040</a></p>
                      <p className="text-slate-400">M: <a href="tel:0700195220" className="text-white hover:text-sky-400 transition-colors font-medium">0700 195220</a></p>
                      <p className="text-slate-400">E: <a href="mailto:mombasa@ppra.go.ke" className="text-sky-400 hover:text-sky-300 hover:underline font-medium break-all">mombasa@ppra.go.ke</a></p>
                    </div>
                  </div>

                  {/* Western Kenya Regional Office */}
                  <div className="bg-slate-900/40 p-5 lg:p-4 xl:p-6 border border-slate-900 hover:border-slate-800 transition-colors flex flex-col justify-between h-full">
                    <div>
                      <h4 className="text-sm md:text-base font-black text-white mb-3 uppercase tracking-wide border-b border-slate-800 pb-2">
                        Kisumu
                      </h4>
                      <p className="text-xs md:text-sm text-slate-300 leading-relaxed mb-4">
                        Prosperity House, Wing C, 6th Floor, Owuor Otiende Avenue<br />
                        P.O Box 2916-40100<br />
                        Kisumu, Kenya
                      </p>
                    </div>
                    <div className="text-xs md:text-sm space-y-1.5 pt-2 border-t border-slate-900/60 mt-auto">
                      <p className="text-slate-400">T: <a href="tel:0572024000" className="text-white hover:text-sky-400 transition-colors font-medium">057 2024000</a></p>
                      <p className="text-slate-400">E: <a href="mailto:kisumu@ppra.go.ke" className="text-sky-400 hover:text-sky-300 hover:underline font-medium break-all">kisumu@ppra.go.ke</a></p>
                    </div>
                  </div>

                  {/* North Rift Regional Office */}
                  <div className="bg-slate-900/40 p-5 lg:p-4 xl:p-6 border border-slate-900 hover:border-slate-800 transition-colors flex flex-col justify-between h-full">
                    <div>
                      <h4 className="text-sm md:text-base font-black text-white mb-3 uppercase tracking-wide border-b border-slate-800 pb-2">
                        Eldoret
                      </h4>
                      <p className="text-xs md:text-sm text-slate-300 leading-relaxed mb-4">
                        Ainabkoi Sub County Offices<br />
                        P.O Box 799-30100<br />
                        Eldoret, Kenya
                      </p>
                    </div>
                    <div className="text-xs md:text-sm pt-2 border-t border-slate-900/60 mt-auto">
                      <p className="text-slate-400">E: <a href="mailto:eldoret@ppra.go.ke" className="text-sky-400 hover:text-sky-300 hover:underline font-medium break-all">eldoret@ppra.go.ke</a></p>
                    </div>
                  </div>

                  {/* South Rift Regional Office */}
                  <div className="bg-slate-900/40 p-5 lg:p-4 xl:p-6 border border-slate-900 hover:border-slate-800 transition-colors flex flex-col justify-between h-full">
                    <div>
                      <h4 className="text-sm md:text-base font-black text-white mb-3 uppercase tracking-wide border-b border-slate-800 pb-2">
                        Nakuru
                      </h4>
                      <p className="text-xs md:text-sm text-slate-300 leading-relaxed mb-4">
                        Provincial Commissioner's Offices, Block B, 1st Floor, Room 1<br />
                        P.O Box 15424-20100<br />
                        Nakuru, Kenya
                      </p>
                    </div>
                    <div className="text-xs md:text-sm pt-2 border-t border-slate-900/60 mt-auto">
                      <p className="text-slate-400">E: <a href="mailto:nakuru@ppra.go.ke" className="text-sky-400 hover:text-sky-300 hover:underline font-medium break-all">nakuru@ppra.go.ke</a></p>
                    </div>
                  </div>

                </div>
              </div>

            </div>
          </section>
        </div>
      </>
    </ErrorBoundary>
  );
}