import { Loader2 } from 'lucide-react';

const FrequencyChart = ({ trendData = [], isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="w-full h-[120px] flex items-center justify-center bg-white/50 rounded">
        <Loader2 className="w-6 h-6 animate-spin text-[#3B5BDB]" />
      </div>
    );
  }

  const data = trendData.length > 0 ? trendData : [0, 0, 0]; 

  const paddingX = 28;
  const drawWidth = 290 - paddingX - 10; 
  const drawHeight = 100; 

  const maxVal = Math.max(...data, 1);
  const minVal = Math.min(...data, 0);

  const getX = (index) => paddingX + (index / (data.length - 1)) * drawWidth;
  const getY = (val) => 10 + drawHeight - ((val - minVal) / (maxVal - minVal || 1)) * drawHeight;

  const pathD = data.map((val, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)},${getY(val)}`).join(' ');
  const fillPathD = `${pathD} L ${getX(data.length - 1)},110 L ${paddingX},110 Z`;

  return (
    <svg width="100%" height="120" viewBox="0 0 290 130" xmlns="http://www.w3.org/2000/svg">
      <text x="0" y="12" fill="#546A81" fontSize="10">{maxVal.toFixed(1)}</text>
      <text x="0" y="62" fill="#546A81" fontSize="10">{(maxVal / 2).toFixed(1)}</text>
      <text x="0" y="112" fill="#546A81" fontSize="10">0</text>

      <line x1="28" y1="10" x2="290" y2="10" stroke="#E5E7EB" strokeWidth="0.5" />
      <line x1="28" y1="60" x2="290" y2="60" stroke="#E5E7EB" strokeWidth="0.5" />
      <line x1="28" y1="110" x2="290" y2="110" stroke="#E5E7EB" strokeWidth="0.5" />

      {trendData.length > 0 && (
        <>
          <path d={fillPathD} fill="#C8D8F8" opacity="0.6" />
          <path d={pathD} fill="none" stroke="#3B5BDB" strokeWidth="1.5" opacity="0.8" />
        </>
      )}

      <text x="28" y="126" fill="#546A81" fontSize="9">0 Hz</text>
      <text x="145" y="140" fill="#546A81" fontSize="9" textAnchor="middle">Frequency Spectrum Preview</text>
      <text x="290" y="126" fill="#546A81" fontSize="9" textAnchor="end">Max Hz</text>
    </svg>
  );
};

export default FrequencyChart