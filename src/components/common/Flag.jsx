import { useState } from 'react';

const CountrySelector = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState({
    code: '+1',
    flag: 'us',
    name: 'United States'
  });

  const countries = [
    { code: '+1', flag: 'us', name: 'United States' },
    // { code: '+1', flag: 'ca', name: 'Canada' },
    // { code: '+44', flag: 'gb', name: 'United Kingdom' },
    // { code: '+92', flag: 'pk', name: 'Pakistan' },
    // { code: '+91', flag: 'in', name: 'India' },
    // { code: '+86', flag: 'cn', name: 'China' },
    // { code: '+81', flag: 'jp', name: 'Japan' },
    // { code: '+82', flag: 'kr', name: 'South Korea' },
    // { code: '+49', flag: 'de', name: 'Germany' },
    // { code: '+33', flag: 'fr', name: 'France' },
    // { code: '+39', flag: 'it', name: 'Italy' },
    // { code: '+34', flag: 'es', name: 'Spain' },
    // { code: '+61', flag: 'au', name: 'Australia' },
    // { code: '+64', flag: 'nz', name: 'New Zealand' },
    // { code: '+55', flag: 'br', name: 'Brazil' },
    // { code: '+52', flag: 'mx', name: 'Mexico' },
    // { code: '+54', flag: 'ar', name: 'Argentina' },
    // { code: '+27', flag: 'za', name: 'South Africa' },
    // { code: '+20', flag: 'eg', name: 'Egypt' },
    // { code: '+234', flag: 'ng', name: 'Nigeria' },
    // { code: '+254', flag: 'ke', name: 'Kenya' },
    // { code: '+966', flag: 'sa', name: 'Saudi Arabia' },
    // { code: '+971', flag: 'ae', name: 'UAE' },
    // { code: '+90', flag: 'tr', name: 'Turkey' },
    // { code: '+7', flag: 'ru', name: 'Russia' },
    // { code: '+62', flag: 'id', name: 'Indonesia' },
    // { code: '+60', flag: 'my', name: 'Malaysia' },
    // { code: '+65', flag: 'sg', name: 'Singapore' },
    // { code: '+66', flag: 'th', name: 'Thailand' },
    // { code: '+84', flag: 'vn', name: 'Vietnam' },
    // { code: '+63', flag: 'ph', name: 'Philippines' },
    // { code: '+880', flag: 'bd', name: 'Bangladesh' },
    // { code: '+977', flag: 'np', name: 'Nepal' },
    // { code: '+94', flag: 'lk', name: 'Sri Lanka' },
    // { code: '+98', flag: 'ir', name: 'Iran' },
    // { code: '+964', flag: 'iq', name: 'Iraq' },
    // { code: '+972', flag: 'il', name: 'Israel' },
    // { code: '+31', flag: 'nl', name: 'Netherlands' },
    // { code: '+32', flag: 'be', name: 'Belgium' },
    // { code: '+41', flag: 'ch', name: 'Switzerland' },
    // { code: '+43', flag: 'at', name: 'Austria' },
    // { code: '+45', flag: 'dk', name: 'Denmark' },
    // { code: '+46', flag: 'se', name: 'Sweden' },
    // { code: '+47', flag: 'no', name: 'Norway' },
    // { code: '+48', flag: 'pl', name: 'Poland' },
    // { code: '+351', flag: 'pt', name: 'Portugal' },
    // { code: '+30', flag: 'gr', name: 'Greece' },
  ];

  const handleSelect = (country) => {
    setSelectedCountry(country);
    setIsOpen(false);
  };

  return (
    <div className="flex items-center justify-center ">
      <div className="relative">
        {/* Selected country button */}
        <button type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-[12px] hover:border-gray-400 transition-colors"
        >
          <img 
            src={`https://flagcdn.com/w40/${selectedCountry.flag}.png`}
            alt={selectedCountry.name}
            className="w-6 h-4 object-cover rounded"
          />
          <span className="font-medium text-gray-700">{selectedCountry.code}</span>
          <svg 
            className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Dropdown menu */}
        {isOpen && (
          <div className="absolute top-full mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-xl max-h-96 overflow-y-auto z-50">
            {countries.map((country, index) => (
              <button
                key={index}
                onClick={() => handleSelect(country)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
              >
                <img 
                  src={`https://flagcdn.com/w40/${country.flag}.png`}
                  alt={country.name}
                  className="w-6 h-4 object-cover rounded"
                />
                <span className="font-medium text-gray-700 flex-1">{country.name}</span>
                <span className="text-gray-500">{country.code}</span>
              </button>
            ))}
          </div>
        )}

        {/* Overlay to close dropdown when clicking outside */}
        {isOpen && (
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
        )}
      </div>
    </div>
  );
};

export default CountrySelector;