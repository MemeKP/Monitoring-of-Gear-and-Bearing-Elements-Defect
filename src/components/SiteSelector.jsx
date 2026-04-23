import React from 'react'

const SiteSelector = () => {
  // ข้อมูลจำลองสำหรับแถบความคืบหน้า (Progress Bars)
  const stats = {
    fGrade: { value: 23, total: 1000 },
    eGrade: { value: 977, total: 1000 }
  };

  // ฟังก์ชันคำนวณความกว้างของหลอด
  const getProgressWidth = (value, total) => {
    return `${(value / total) * 100}%`;
  };

  return (
    // Wrapper หลัก (ผมใส่สีพื้นหลังเพื่อให้เห็นเอฟเฟกต์ Glassmorphism ชัดเจนขึ้น)
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-4">
      
      {/* Container ของ Card */}
      <div className="relative w-full max-w-[420px]">
        
        {/* เลเยอร์เงา/แผ่นทึบด้านหลัง (เพื่อให้เกิดมิติการซ้อนทับตามรูปต้นฉบับ) */}
        <div className="absolute inset-0 bg-[#e2eafc] rounded-3xl translate-y-3 translate-x-3 opacity-90 shadow-sm"></div>
        
        {/* เลเยอร์หลัก: Glassmorphism Card */}
        <div className="relative p-7 border border-white/60 shadow-xl rounded-3xl bg-gradient-to-br from-[#8db3fa]/60 via-[#a7c5fb]/40 to-[#e4ccff]/50 backdrop-blur-xl">
          
          {/* Header Section */}
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-[22px] font-bold text-white tracking-wide drop-shadow-md">
              Mae Moh Power Plant
            </h2>
            
            {/* ปุ่ม View */}
            <button className="px-5 py-1.5 text-sm font-medium text-slate-600 transition-all border border-white/80 rounded-full shadow-sm bg-gradient-to-b from-white/80 to-white/40 hover:bg-white/70 active:scale-95">
              view
            </button>
          </div>

          {/* F Grade Section */}
          <div className="mb-5">
            <div className="flex justify-between mb-1.5 text-sm font-bold tracking-wide">
              <span className="text-[#ff3b30] drop-shadow-sm">F Grade</span>
              <span className="text-[#ff3b30] drop-shadow-sm">{stats.fGrade.value}</span>
            </div>
            {/* หลอดพื้นหลัง (Track) */}
            <div className="w-full h-1.5 rounded-full bg-white/50 overflow-hidden shadow-inner">
              {/* หลอดสีแสดงค่า (Fill) */}
              <div 
                className="h-full rounded-full bg-[#ff3b30] shadow-[0_0_8px_rgba(255,59,48,0.6)]" 
                style={{ width: getProgressWidth(stats.fGrade.value, stats.fGrade.total) }}
              ></div>
            </div>
          </div>

          {/* E Grade Section */}
          <div className="mb-2">
            <div className="flex justify-between mb-1.5 text-sm font-bold tracking-wide">
              <span className="text-[#ffcc00] drop-shadow-sm">E Grade</span>
              <span className="text-[#ffcc00] drop-shadow-sm">{stats.eGrade.value}</span>
            </div>
            {/* หลอดพื้นหลัง (Track) */}
            <div className="w-full h-1.5 rounded-full bg-white/50 overflow-hidden shadow-inner">
              {/* หลอดสีแสดงค่า (Fill) */}
              <div 
                className="h-full rounded-full bg-[#ffcc00] shadow-[0_0_8px_rgba(255,204,0,0.6)]" 
                style={{ width: getProgressWidth(stats.eGrade.value, stats.eGrade.total) }}
              ></div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default SiteSelector