import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-soft-cream flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
      <div className="max-w-2xl w-full text-center flex flex-col items-center">
        
        {/* Custom SVG Illustration - Page Not Found */}
        <div className="w-full max-w-60 sm:max-w-md md:max-w-lg aspect-square mb-4 sm:mb-6 md:mb-8 flex items-center justify-center">
          <svg 
            viewBox="0 0 400 400" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full"
          >
            {/* Background Circles */}
            <circle cx="200" cy="200" r="180" fill="#F5F0EB" opacity="0.5"/>
            <circle cx="200" cy="200" r="140" fill="#EDE8E0" opacity="0.3"/>
            
            {/* Decorative Rings */}
            <circle cx="200" cy="200" r="160" stroke="#201444" strokeWidth="2" strokeDasharray="8 8" opacity="0.1"/>
            <circle cx="200" cy="200" r="120" stroke="#00672F" strokeWidth="2" strokeDasharray="4 8" opacity="0.1"/>
            
            {/* 404 Text with PPRA Colors */}
            <text x="120" y="180" textAnchor="middle" fontSize="90" fontWeight="800" fill="#201444" fontFamily="Inter, system-ui, sans-serif" letterSpacing="-2">4</text>
            <text x="200" y="180" textAnchor="middle" fontSize="90" fontWeight="800" fill="#E91C23" fontFamily="Inter, system-ui, sans-serif" letterSpacing="-2">0</text>
            <text x="280" y="180" textAnchor="middle" fontSize="90" fontWeight="800" fill="#00672F" fontFamily="Inter, system-ui, sans-serif" letterSpacing="-2">4</text>
            
            {/* Magnifying Glass Icon */}
            <g transform="translate(280, 210)" opacity="0.9">
              <circle cx="18" cy="18" r="22" stroke="#201444" strokeWidth="5" fill="none"/>
              <line x1="34" y1="34" x2="55" y2="55" stroke="#E91C23" strokeWidth="5" strokeLinecap="round"/>
            </g>
            
            {/* Small Decorative Dots */}
            <circle cx="80" cy="80" r="3" fill="#201444" opacity="0.2"/>
            <circle cx="320" cy="80" r="3" fill="#00672F" opacity="0.2"/>
            <circle cx="80" cy="320" r="3" fill="#E91C23" opacity="0.2"/>
            <circle cx="320" cy="320" r="3" fill="#201444" opacity="0.2"/>
            
            {/* Small Floating Elements */}
            <g opacity="0.3">
              <circle cx="100" cy="150" r="2.5" fill="#00672F">
                <animate attributeName="cy" values="150;140;150" dur="3s" repeatCount="indefinite"/>
              </circle>
              <circle cx="300" cy="120" r="2.5" fill="#E91C23">
                <animate attributeName="cy" values="120;110;120" dur="2.5s" repeatCount="indefinite"/>
              </circle>
              <circle cx="250" cy="280" r="2.5" fill="#201444">
                <animate attributeName="cy" values="280;270;280" dur="3.5s" repeatCount="indefinite"/>
              </circle>
            </g>
          </svg>
        </div>

        {/* Text Content */}
        <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-primary-purple mb-2">
          Page Not Found
        </h2>
        <div className="w-16 sm:w-24 h-1 bg-primary-green mb-4" />
        <p className="text-gray-600 text-sm sm:text-lg mb-6 sm:mb-8 max-w-md px-4">
          The page you are looking for doesn't exist or has been moved.
        </p>

        {/* Back to Home Button */}
        <Link
          to="/"
          className="group inline-flex items-center justify-center gap-2 bg-primary-green text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-sm sm:text-base transition-all duration-300 hover:bg-primary-green-dark hover:scale-105 transform shadow-lg hover:shadow-xl w-full sm:w-auto min-w-40 sm:min-w-45"
        >
          <svg 
            className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 group-hover:-translate-x-1" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span>Back to Home</span>
        </Link>

      </div>
    </div>
  );
}