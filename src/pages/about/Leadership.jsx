import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMousePointer } from "@fortawesome/free-solid-svg-icons";

// ===== ADD THIS IMPORT =====
import TextToSpeech from '../../components/text-to-speech/TextToSpeech';

// Import board member images
import Mwangi_Wairia from '../../assets/board members/Mwangi-wa-Iria-284x300.jpg';
import Ali_Mohamed from '../../assets/board members/Ali-Mohamed-Haji-Habib-240x300.jpg';
import Linda_Susan from '../../assets/board members/Linda-Susan-Ingari-300x300.jpg';
import Allan_Kamau from '../../assets/board members/Allan-Kamau-233x300.jpg';
import Amos_Simiyu from '../../assets/board members/Amos-Simiyu-Makokha-300x300.jpg';
import Eric_Korir from '../../assets/board members/Eric-Korir-300x300.jpg';
import Lucy_Chepkemoi from '../../assets/board members/Lucy-Chepkemoi-300x300.jpg';
import Patrick_Kimemia from '../../assets/board members/Patrick-Kimemia-Ndirangu-300x300.jpg';

// Import hero image
import corporateSky from '../../assets/commonPics/ppra building.jpeg';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

const leadershipTeam = [
  {
    id: "Mwangi-Wa-Iria",
    name: "Hon. Mwangi Wa Iria",
    title: "Board Chair",
    description: "Hon. Mwangi Wa Iria is an accomplished leader with extensive experience in both public and private sectors, having worked for multinational private companies at senior management levels, a parastatal at chief executive level and at public service as a County Governor for two terms.A visionary leader, he is widely recognized for pioneering initiatives that have revitalized key economic sectors, including agriculture, cooperative development, and enterprise growth.Hon Wa Iria served two terms as the Governor of Murang'a County, where he spearheaded transformative policies that enhanced farmer earnings, modernized agribusiness, and strengthened cooperative movements. Under his leadership, Murang'a County emerged as a model for agricultural modernization, economic self-sufficiency, and grassroots empowerment.As the Chief Executive Officer, he was instrumental in the re-opening and revival of the previously collapsed Kenya Cooperative Creameries (KCC), a crucial milestone that strengthened the dairy industry in Kenya.He also served as the Commercial General Manager at The Aga Khan Fund for Economic Development (AKFED) where he led strategic investment initiatives, supporting industrial growth and economic development across key sectors.Among other key roles, he has also served as the Vice Chairman, Council of Governors and Chairman, Cooperative & Enterprise Development Committee where he championed governance and economic empowerment respectively.Hon. Wa Iria holds a Bachelor of Education, Economics & Geography Degree from Moi University and a Diploma and member of Chartered Institute of Purchasing and Supply Management- CIPS- UK.He is a firm believer in people-centered governance and sustainable economic policies that prioritize empowerment over dependency",
    email: "mwangi.wairia@ppra.go.ke",
    image: Mwangi_Wairia,
    expertise: ["Strategic Leadership", "Public Policy", "Governance", "Economic Development", "Cooperative Management"],
    education: "Bachelor of Education (Economics & Geography) - Moi University"
  },
  {
    id: "Ali-Mohamed",
    name: "Mr. Ali Mohamed",
    title: "Board Member",
    description: "Mr. Ali Mohamed is an accomplished leader renowned for driving operational excellence, fostering innovation and aligning talent with ideal roles. With a Bachelor of Business Administration from the University of Houston, he brings a solid educational foundation to a distinguished career. His skills in strategic planning and operations, business development, team leadership, financial management, and quality control have been instrumental in his professional journey.Ali currently serves as the CEO of Nairobi Calibration Services Limited. In his seven-year tenure, he has steered the company to remarkable heights. Under his leadership, the company achieved a 20% reduction in errors and customer complaints, implemented quality controls, and expanded the client base, resulting in a 30% revenue increase.In his previous role as Project Manager at ClearWater Industries, Ali managed intricate projects, notably including the successful solar hybrid installation for KPLC in Laiamis Marsabit County. This highlighted his proficiency in both stakeholder communication and effective project management.With 14 years as a Finance Manager at Nairobi Calibration Services Limited, Ali expertly managed budgets, forecasted financial trends, and led finance professionals, contributing significantly to the organization's success through financial automation and process enhancements.",
    email: "ali.mohamed@ppra.go.ke",
    image: Ali_Mohamed,
    expertise: ["Operational Excellence", "Strategic Planning", "Business Development", "Financial Management", "Project Management"],
    education: "Bachelor of Business Administration - University of Houston"
  },
  {
    id: "Linda-Susan-Ingari",
    name: "Linda Susan Ingari",
    title: "Board Member",
    description: "Linda is a supply chain management specialist with over 20 years of experience in the manufacturing, education, telecommunication, and banking sectors. She is also a Lecturer, Global Trainer, and Consultant in Supply Chain Management, with over 15 years of experience facilitating workshops, seminars, and lectures in the field.Linda played a key role in spearheading the development of the National Curriculum for the Procurement and Supply Profession in Kenya – Certified Procurement and Supply Professional of Kenya (CPSP-K) and the Associate in Procurement and Supply (APS) qualifications. She has also served as a Board Member of the pioneer Kenya Institute of Supplies Examination Board. Linda has participated as the Lead Judge in the Annual Kenya Institute of Supplies Management (KISM) SPURS SCM Excellence Awards.She holds a Master of Business Administration and a Bachelor of Education (Arts) – First Class Honors, both from Kenyatta University. Additionally, she possesses a Graduate Diploma in Procurement and Supply (CIPS, UK), an International Diploma in Supply Management (International Trade Centre), and a Postgraduate Diploma in Business Management, among other professional qualifications.Linda is currently pursuing a PhD in Business and Management, specializing in Operations, Logistics, and Supply Chain Management. She holds a KISM Supplies Practitioner License and is a registered member of KISM, the Chartered Institute of Procurement and Supply (CIPS), and the Chartered Institute of Logistics and Transport (CILT). Professionalism, integrity, and diligence are her key drivers.",
    email: "linda.ingari@ppra.go.ke",
    image: Linda_Susan,
    expertise: ["Supply Chain Management", "Curriculum Development", "Policy Research", "Training & Development", "Logistics Management"],
    education: "PhD in Business & Management (Operations, Logistics & SCM) - Ongoing | MBA - Kenyatta University"
  },
  {
    id: "Allan-Kamau",
    name: "Allan Kamau",
    title: "Board Member",
    description: "Allan Kamau is a first-class reader with excellent communication and interpersonal skills. He possesses a highly motivated and energetic character, known for his creativity and visionary approach to challenges.Allan holds a Bachelor of Laws (LL.B) from Makerere University and a Postgraduate Diploma in Legal Practice from the Kenya School of Law. Additionally, he has completed Strategic Leadership Development Program (SLDP) and Senior Management Course (SMC) at the Kenya School of Government, equipping him with leadership and managerial skills.He has taught various law subjects, including the law of contract, law of torts, and commercial law at Lord Diplock's Learning Centre. He has also offered training on Determination of the Value of Evidence through Scientific Quantitative Methods at Strathmore University.Allan is currently serving as the Deputy Chief State Counsel at the Office of the Attorney General and the Department of Justice.Driven by a passion for legal excellence, Allan is committed to becoming one of Kenya's top-tier law practitioners. His ambition is to build a career that is polished, articulate, principled, and dedicated to the rule of law and constitutionalism. Allan envisions leaving a legacy defined by an illustrious legal career and a lifelong campaign for human rights.",
    email: "allan.kamau@ppra.go.ke",
    image: Allan_Kamau,
    expertise: ["Corporate Law", "Legal Practice", "Strategic Leadership", "Constitutional Law", "Commercial Law"],
    education: "LL.B - Makerere University | Postgraduate Diploma in Legal Practice - Kenya School of Law"
  },
  {
    id: "Amos-Simiyu",
    name: "Amos Simiyu",
    title: "Board Member",
    description: "Amos Simiyu is an accomplished legal professional with a diverse and extensive background in law and legal consultancy. He is an Associate Arbitrator with the Charter Institute of Arbitrators Kenya and a Professional Mediator with the Mediation Training Institute. Currently, he serves as the Managing Partner at the Law Firm of Wattanga & Luyali Associates in Bungoma, specializing in Commercial, Human Rights, and Constitutional issues. His legal career has seen him hold various roles, including positions at Wetangula & Co. Advocates in Nairobi, Khan & Saisi Advocates, Kibichiy & Co. Advocates, and Jim Choge & Co. Advocates all based in Eldoret. Amos earned his Post Graduate Diploma in Law at the Kenya School of Law and holds a Bachelor of Laws Degree from the University of Nairobi. In addition to his legal expertise, Amos actively participates in various professional and community roles. In 2022, he was appointed as the Chairman of the Human Resource Task Force by the Governor of Bungoma County and serves as the Vice Chairperson of Cardinal Otunga Girls' High School's Board of Management. He holds leadership positions in multiple school associations, including Maranda High School and Lugulu Girls, and is actively engaged in church leadership and media organizations in Bungoma. Furthermore, Amos is a committed member of the Federation of Kenya Women Lawyers and serves on the Board of Trustees for the Canadian Missionary Fellowship Trust. Amos' extensive legal experience and commitment to community engagement makes him a valuable asset in both legal and community-oriented contexts.",
    email: "amos.simiyu@ppra.go.ke",
    image: Amos_Simiyu,
    expertise: ["Arbitration & Mediation", "Commercial Law", "Human Rights Law", "Constitutional Law", "Dispute Resolution"],
    education: "LL.B - University of Nairobi | Postgraduate Diploma in Law - Kenya School of Law"
  },
  {
    id: "Eric-Korir",
    name: "Eric Korir",
    title: "Board Member",
    description: "Eric Korir is a seasoned leader in Procurement and Supply Chain Management with over 25 years of experience in both public and private sectors. He currently serves as the Director of Public Procurement at the National Treasury, overseeing policy, research, and legal aspects of public-sector procurement for national and county governments.As a highly influential leader, he holds board positions in esteemed organizations like Kenya Re, EPZA, JKUAT, and as an Alternate Member to the Cabinet Secretary, National Treasury & Economic Planning amongst other notable boards. Additionally, Eric chairs the technical committee of the Electronic Government Procurement System, playing a crucial role in enhancing efficiency, transparency, accountability, and value for money in public procurement as part of the Public Finance Management reform initiative.He is a Member of the Chartered Institute of Purchasing and Supply, Kenya Institute of Supply Management and the Institute of Transport and Logistics.Eric has also played a pivotal role as the Secretary to multi-sector task forces responsible for developing various agendas such as the Public Procurement & Asset Disposal Regulations (2016-2020), the National Public Procurement Policy(2018-2021) and the National Supply Chain Management Professional Framework (2019).Most recently, Eric contributed as a Technical Member of the Presidential Taskforce on the establishment of a National Lottery, in reviewing best practices, legislative frameworks, and policies for the establishment and operationalization of a national lottery.Eric is an accomplished leader, recognized for his strategic insights, extensive experience, and notable contributions to policy development and operational efficiency in the public sector",
    email: "eric.korir@ppra.go.ke",
    image: Eric_Korir,
    expertise: ["Public Procurement Policy", "Supply Chain Management", "Institutional Design", "Policy Development", "Strategic Alignment"],
    education: "MSc in Procurement & Supply Chain Management"
  },
{
  id: "Lucy-Chepkemoi",
  name: "Ms. Lucy Chepkemoi",
  title: "Board Member",
  description: "Lucy Chepkemoi is an accomplished Early Childhood Development and Education (ECDE) specialist with over 20 years of experience in teaching, training, mentoring and educational assessment. Throughout her career, she has demonstrated a strong commitment to nurturing educators and learners while contributing to the advancement of quality early childhood education. Lucy served as a full-time trainer at Kericho District Centre for Early Childhood Education (DICECE) from 2018 to 2022, where she trained diploma and certificate trainees in Early Childhood Development and Education. In this role, she facilitated practical teaching, conducted assessments, and mentored aspiring ECDE professionals. Prior to joining Kericho DICECE, she served as a lecturer at Tea Land Achievers ECDE College from 2009 to 2017 and at Nyamira ECDE Teachers College from 2006 to 2008, where she trained ECDE certificate trainees and guided them in practical teaching and assessment. She began her career as an ECDE teacher at Cheptagum Primary School, where she served from January 2006 to December 2009, providing foundational learning and support to young children. In addition to her teaching and training experience, Lucy has served as a Kenya National Examinations Council (KNEC) Examiner at Mangu, contributing to the assessment and quality assurance of ECDE programmes. She has also served as a member of the Board of Management (BOM) at Cheptagum Comprehensive School. Lucy holds a Bachelor of Education (Arts) degree from Moi University, a Diploma in Early Childhood Education from Mwana Mwende ECDE College, and a Certificate in Early Childhood Development and Education from Kericho DICECE. Her academic and professional training has equipped her with the knowledge and skills required to train, mentor, and inspire educators while promoting excellence in early childhood education. Beyond the education sector, Lucy is actively involved in faith-based and community leadership. She serves as Pastor at AGC Rev. Daniel Rono Memorial Church, Secretary of AGC Sigowet District, and Chaplain at both Iraa Girls High School and Cheptagum Comprehensive School, where she provides spiritual guidance and mentorship. Her wealth of experience in education, leadership, mentorship and community service reflects her unwavering commitment to empowering learners, supporting educators and contributing to holistic societal development.",
  email: "lucy.chepkemoi@ppra.go.ke",
  image: Lucy_Chepkemoi,
  expertise: [
    "Early Childhood Education", 
    "Teacher Training & Mentorship", 
    "Educational Assessment & Quality Assurance", 
    "Curriculum Development & Delivery", 
    "Community Leadership & Spiritual Mentorship"
  ],
  education: "Bachelor of Education (Arts) - Moi University | Diploma in Early Childhood Education - Mwana Mwende ECDE College | Certificate in ECDE - Kericho DICECE"
},
  {
    id: "Patrick Kimemia",
    name: "Mr. Patrick Kimemia",
    title: "Board Member",
    description: "Patrick Kimemia is an accomplished and visionary Procurement Professional with extensive experience and a proven track record in supply chain management strategy, vendor management, projects management, contract negotiations, and organizational leadership. Mr. Kimemia holds a Master of Science (MSC), in Procurement and Logistics from Jomo Kenyatta University of Agriculture & Technology and a Bachelor of Arts (Economics) from University of Nairobi. He is a member of Chartered Institute of Purchasing and Supply, Kenya Institute of Supplies Management, International Federation of Purchasing and Supply Management and Scottish Qualification Authority. He served as a Head of Supply Chain Management at Kenya Generating Company PLC. Among many other achievements, Mr. Kimemia contributed as a member of taskforce in the drafting of the Public Procurement and Disposal Act (2005 and 2015) and the Public Procurement regulations (2000-2001 and 2016). He was the member of task force appointed by Ministry of Public Works to review the functions of Supplies Branch. He is notably a supply chain management consultant and trainer. Mr. Kimemia also serves as the Chairman of the Board to Makomboki Tea Factory.",
    email: "patrick.kimemia@ppra.go.ke",
    image: Patrick_Kimemia,
    expertise: ["Supply Chain Management", "Vendor Management", "Project Management", "Contract Negotiations", "Procurement Strategy"],
    education: "MSc in Procurement & Logistics - JKUAT | BA (Economics) - University of Nairobi"
  }
];

const Leadership = () => {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  
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

  useEffect(() => {
    const ctx = gsap.context(() => {
      const infoBlocks = gsap.utils.toArray('.leader-info-content');
      const imagePanels = gsap.utils.toArray('.leader-img-panel');

      infoBlocks.forEach((block, index) => {
        if (index > 0) {
          gsap.set(imagePanels[index], { opacity: 0, scale: 0.97 });
        }

        ScrollTrigger.create({
          trigger: block,
          start: "top 65%",
          end: "bottom 35%",
          onEnter: () => {
            gsap.to(imagePanels, { opacity: 0, scale: 0.97, duration: 0.35, overwrite: "auto" });
            gsap.to(imagePanels[index], { opacity: 1, scale: 1, duration: 0.45, overwrite: "auto" });
          },
          onEnterBack: () => {
            gsap.to(imagePanels, { opacity: 0, scale: 0.97, duration: 0.35, overwrite: "auto" });
            gsap.to(imagePanels[index], { opacity: 1, scale: 1, duration: 0.45, overwrite: "auto" });
          }
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="bg-white font-sans antialiased selection:bg-emerald-100 selection:text-emerald-900">
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

      {/* Dark Corporate Navy Hero Section - WITH SYMMETRICAL LINES */}
      <section className="relative py-20 md:py-32 bg-slate-950 px-4 md:px-6 overflow-hidden">
        {/* Vertical Lines */}
        <div className="absolute inset-0 pointer-events-none flex">
          <div className="w-1/5 border-r border-white/5"></div>
          <div className="w-1/5 border-r border-white/5"></div>
          <div className="w-1/5 border-r border-white/5"></div>
          <div className="w-1/5 border-r border-white/5"></div>
          <div className="w-1/5"></div>
        </div>
        
        {/* Background Skyscraper Image */}
        <div className="absolute inset-0 opacity-25 pointer-events-none">
          <img src={corporateSky} alt="Corporate Skyscraper" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-950/40 to-transparent" />
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto text-center">          
          <h1 className="text-3xl md:text-6xl lg:text-7xl font-black tracking-tight text-white">
            Our Board of Directors
          </h1>
          <p className="mt-3 md:mt-4 text-base md:text-xl lg:text-2xl max-w-2xl mx-auto text-slate-300 font-normal leading-relaxed">
            Meet the governing executive counsel driving institutional integrity, transparency, and strategic vision across Kenya's public procurement ecosystems.
          </p>
        </div>
      </section>

      {/* Split-Screen Interactive Runway - WITH SYMMETRICAL LINES */}
      <main className="relative max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        {/* Vertical Lines */}
        <div className="absolute inset-0 pointer-events-none flex">
          <div className="w-1/5 border-r border-gray-200"></div>
          <div className="w-1/5 border-r border-gray-200"></div>
          <div className="w-1/5 border-r border-gray-200"></div>
          <div className="w-1/5 border-r border-gray-200"></div>
          <div className="w-1/5"></div>
        </div>
        
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-start">
          
          {/* LEFT PANEL: Enriched Sticky Image Display Frame */}
          <div className="hidden lg:block lg:col-span-5 lg:sticky lg:top-[12vh] lg:h-[75vh] items-start justify-center z-20 pointer-events-none pt-4">
            <div className="w-full max-w-110 aspect-4/5 bg-transparent rounded-none relative overflow-hidden">
              {leadershipTeam.map((leader) => (
                <div 
                  key={`img-${leader.id}`} 
                  className="leader-img-panel absolute inset-0 w-full h-full transition-transform duration-500"
                >
                  <img 
                    src={leader.image} 
                    alt={leader.name} 
                    className="w-full h-full object-cover object-top rounded-none"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-slate-950/10 via-transparent" />
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT PANEL: Sequential Content Feed */}
          <div className="col-span-12 lg:col-span-7 space-y-12 md:space-y-16 lg:space-y-0 lg:pb-[20vh]">
            {leadershipTeam.map((leader) => (
              <div 
                key={leader.id} 
                className="leader-info-content lg:min-h-[90vh] flex flex-col justify-center py-8 md:py-16 lg:py-24 border-b border-slate-100 lg:border-none first:pt-0 last:border-none"
              >
                {/* Mobile Portrait Mirror */}
                <div className="lg:hidden w-full max-w-70 md:max-w-[320px] aspect-4/5 bg-slate-100 border border-slate-200 shadow-sm overflow-hidden mb-6 md:mb-8 mx-auto">
                  <img src={leader.image} alt={leader.name} className="w-full h-full object-cover object-top" />
                </div>

                {/* Text Blueprint Meta */}
                <div className="space-y-4 md:space-y-5 lg:pl-4">
                  <div>
                    <span className="text-[10px] md:text-xs font-extrabold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 md:px-4 py-1 md:py-1.5 rounded-md inline-block">
                      {leader.title}
                    </span>
                    <h2 className="text-2xl md:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight mt-2 md:mt-3">
                      {leader.name}
                    </h2>
                  </div>

                  <p className="text-slate-600 text-sm md:text-lg lg:text-xl leading-relaxed font-normal">
                    {leader.description}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 pt-4 md:pt-6 border-t border-slate-100 text-slate-600">
                    <div>
                      <h4 className="text-[10px] md:text-sm font-bold uppercase tracking-widest text-slate-400 mb-1 md:mb-2">Expertise</h4>
                      <div className="flex flex-wrap gap-1">
                        {leader.expertise.map((exp, idx) => (
                          <span key={idx} className="text-xs md:text-base text-slate-700 font-medium bg-slate-100 px-2 md:px-3 py-0.5 md:py-1 border border-slate-200/40">
                            {exp}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-[10px] md:text-sm font-bold uppercase tracking-widest text-slate-400 mb-1 md:mb-2">Education</h4>
                      <p className="text-xs md:text-base font-semibold text-slate-800 leading-tight">
                        {leader.education}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-[10px] md:text-sm font-bold uppercase tracking-widest text-slate-400 mb-1 md:mb-2">Inquiries</h4>
                      <a href={`mailto:${leader.email}`} className="text-xs md:text-base font-bold text-emerald-600 hover:text-emerald-800 transition underline underline-offset-2 break-all">
                        {leader.email}
                      </a>
                    </div>
                  </div>
                </div>

              </div>
            ))}
          </div>

        </div>


      </main>

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
  );
};

export default Leadership;