import React from 'react'
import { SITES } from '../mock/SITES';

const SiteSelector = () => {
  const stats = {
    fGrade: { value: 23, total: 1000 },
    eGrade: { value: 977, total: 1000 }
  };

  const getProgressWidth = (value, total) => {
    return `${(value / total) * 100}%`;
  };

  return (
    <>
      <div>
        <div className="relative w-full h-[107px] rounded-[15px] border border-transparent box-border shadow-[10px_10px_20px_#fff,inset_0px_-2px_4px_rgba(0,0,0,0.2),inset_0px_2px_4px_rgba(255,255,255,0.4)] backdrop-blur-[10px] bg-gradient-to-r from-[#5EA7FF] to-[#DFEBF7]">
          
          <span className='text-white font-bold text-[18px] p-2'>
            Mae Moh Mine
          </span>

          <svg style={{ display: 'none' }}>
            <filter id="glass-distortion">
              <feTurbulence type="turbulence" baseFrequency="0.008" numOctaves="2" result="noise" />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="77" />
            </filter>
          </svg>

          <button className="glass-button">
            <div className="glass-filter"></div>
            <div className="glass-overlay"></div>
            <div className="glass-specular"></div>
            <div className="glass-content">
              <span className='text-sm text-[#546A81]'>view</span>
            </div>
          </button>
          
        </div>
        
        <div className="w-full h-1.5 rounded-full bg-white/50 overflow-hidden shadow-inner mt-2"></div>
      </div>
    </>
  );
}

export default SiteSelector;