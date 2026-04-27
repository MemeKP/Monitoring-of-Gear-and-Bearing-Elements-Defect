import React, { useState } from 'react'
import Navbar from '../components/Navbar.jsx'
import { ChevronLeft, Menu, X } from "lucide-react";
import mmm from '../img/mmm.jpg'
import mmm2 from '../img/mmm2.jpg'
import mmm3 from '../img/view4.webp'
import clock from '../assets/clock.png'

const stats = {
  totalMachines: 1000,
  defectivePercent: 88.1,
  carefulPercent: 5.1,
  normalPercent: 6.8,
};

const gradeBreakdown = [
  { grade: "Grade F", percent: 88.1, color: "bg-[#5EA7FF]" },
  { grade: "Grade E", percent: 5.1, color: "bg-[#5EA7FF]" },
  { grade: "Grade C", percent: 2.3, color: "bg-[#5EA7FF]" },
  { grade: "Grade B", percent: 2.3, color: "bg-[#5EA7FF]" },
  { grade: "Grade A", percent: 2.3, color: "bg-[#5EA7FF]" },
];
const machinesRequiringAttention = [
  {
    id: 1,
    name: "[Test_BPKMH2] Crusher 2: Single Roll Crush",
    code: "MMP_1V - 2017-04-08",
    status: "F",
    daysAgo: "3302 days ago",
  },
  {
    id: 2,
    name: "[MH2] Crusher 2: Single Roll Crush",
    code: "MMP_1V - 2017-04-06",
    status: "F",
    daysAgo: "3302 days ago",
  },
  {
    id: 3,
    name: "Case_OAB, 12-3 G",
    code: "MMP_1V - 2022-11-14",
    status: "F",
    daysAgo: "72 days ago",
  },
  {
    id: 4,
    name: "Case_OAB, 12-3 G",
    code: "MMP_1V - 2022-11-14",
    status: "F",
    daysAgo: "72 days ago",
  },
  {
    id: 5,
    name: "Case_OAB, 12-3 G",
    code: "MMP_1V - 2022-11-14",
    status: "F",
    daysAgo: "72 days ago",
  },
];

const healthCheckItems = [
  { label: "Critical", count: 2, color: "bg-red-500" },
  { label: "Warning", count: 5, color: "bg-yellow-400" },
  { label: "Max delay", count: "+9yr", color: "bg-gray-300" },
];

const recentItems = [
  { name: "Rear Drive Unit_LH", days: "3302 days" },
  { name: "(MH2) Crusher 2: Single Roll Crush", days: "3302 days" },
  { name: "(MH2) L2.3: Rear Drive Unit_LH", days: "3302 days" },
  { name: "[Test_BPKMH3] L3.2: Rear Drive Unit_LH", days: "3302 days" },
  { name: "[Test_BPKMH4] L4.3: Rear Drive Unit_LH", days: "3302 days" },
  { name: "Case_OAB, 12-3 G", days: "72 days" },
  { name: "Case_OAB, 12-3 G", days: "72 days" },
];


const Dashboard = ({ siteName = "Mae Moh Mine", onBack }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  return (
    <>
      {/* NAVBAR BAR */}
      <Navbar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      {/* MAIN CONTENT */}
      <div
        className={`transition-all duration-300 pt-14 md:pt-0 ${sidebarOpen ? "md:ml-64" : "md:ml-20"
          }`}
      >
        {/* Header */}
        <div className="p-4 md:p-6">
          <div className='text-[#546A81] text-4xl font-bold leading-[66px]'>
            Dashboard
          </div>

          {/* Breadcrumb */}
          <div className="flex font-medium items-center gap-2 text-base text-[#546A81]">
            <span>All sites</span>
            <span>›</span>
            <span className="text-[#546A81]">{siteName}</span>
            <span>›</span>
            <span className="text-[#546A81]">Dashboard</span>
          </div>
        </div>

        {/* Content grid */}
        <div className="p-4 md:p-6 space-y-6">
          {/* Row 1: Stats + Stage Breakdown + Images */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Statistic Overview Card */}
            <div className="md:col-span-1 lg:col-span-1 bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition h-full">
              <h3 className="text-[#546A81] font-semibold text-xl mb-2">
                Statistic overview
              </h3>
              <p className="text-gray-400 text-2xs mb-6">% of fleet needing attention</p>

              <div className="flex flex-row items-center justify-between gap-4">
                {/* Donut chart mockup */}
                <div className="relative w-40 h-40 mx-auto mb-4 shrink-0">
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#990000"
                      strokeWidth="20"
                      strokeDasharray="220 360"
                      transform="rotate(-90 50 50)"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#fbbf24"
                      strokeWidth="20"
                      strokeDasharray="18 360"
                      strokeDashoffset="-220"
                      transform="rotate(-90 50 50)"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#C1D343"
                      strokeWidth="20"
                      strokeDasharray="238 360"
                      strokeDashoffset="-238"
                      transform="rotate(-90 50 50)"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="25"
                      fill="white"
                    />
                    <text
                      x="50"
                      y="52"
                      textAnchor="middle"
                      className="text-s font-bold fill-[#425D78]"
                    >
                      1,000
                    </text>
                    <text
                      x="50"
                      y="62"
                      textAnchor="middle"
                      className="text-[8px] font-bold fill-gray-500"
                    >
                      Machines
                    </text>
                  </svg>
                </div>

                {/* Legend */}
                <div className="space-y-4 text-xs">
                  {[
                    { label: "Defective", value: "88.1 %", color: "border-[#990000]", text: "text-[#990000]" },
                    { label: "Careful", value: "5.1 %", color: "border-[#FFCB05]", text: "text-[#FFCB05]" },
                    { label: "Normal", value: "6.8 %", color: "border-[#C1D343]", text: "text-[#C1D343]" },
                  ].map(item => (
                    <div
                      key={item.label}
                      className={`border-l-4 ${item.color} pl-3`}
                    >
                      <p className="text-gray-500 text-sm font-normal mb-0.5">
                        {item.label}
                      </p>
                      <p className={`${item.text} text-2xl font-bold leading-tight`}>
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div></div>
            </div>

            {/* Stage Breakdown Card */}
            <div className="md:col-span-1 lg:col-span-1 bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition">
              <h3 className="text-gray-600 font-semibold text-xl mb-2">
                Stage Breakdown
              </h3>
              <p className="text-gray-400 text-sm mb-6">Distribution across all stages</p>

              <div className="space-y-3">
                {gradeBreakdown.map(item => (
                  <div key={item.grade}>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs font-medium text-gray-700">
                        {item.grade}
                      </span>
                      <span className="text-xs font-semibold text-gray-700">
                        {item.percent.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`${item.color} h-2 rounded-full`}
                        style={{ width: `${item.percent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Images (2 on top, 1 full width on bottom) */}
            <div className="grid grid-cols-2 gap-3 h-full">
              {[mmm, mmm2, mmm3].map((img, i) => (
                <div
                  key={i}
                  className={`${i === 2 ? "md:col-span-2" : "md:col-span-1"
                    } rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition h-40`}
                >
                  <img
                    src={img}
                    alt="Site"
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Machines requiring attention 2:1 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-[#f4f7fa] rounded-2xl p-6">

              {/* Header & Filter Buttons */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-[#546A81] font-bold text-xl">
                    Machines requiring attention
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">Showing 881 machines</p>
                </div>

                {/* Toggle*/}
                <div className="flex items-center gap-3">
                  <button className="px-5 py-1.5 bg-[#ff7a7a] text-white font-medium rounded-full text-sm shadow-sm transition hover:bg-red-500">
                    Critical
                  </button>
                  <button className="px-5 py-1.5 bg-gray-100 text-gray-400 font-medium rounded-full text-sm flex items-center gap-2 border border-gray-200 transition hover:bg-gray-200">
                    <span className="text-yellow-400 text-lg leading-none">⚠️</span> Warning
                  </button>
                </div>
              </div>

              {/* Machine list */}
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                {machinesRequiringAttention.map((item, i) => (
                  <div
                    key={i}
                    className={`p-4 rounded-xl transition ${i === 0
                        ? "bg-[#ffcccc] shadow-sm" 
                        : "bg-white shadow-sm border border-gray-100" 
                      }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h4 className={`text-sm font-bold ${i === 0 ? "text-white" : "text-gray-700"}`}>
                          {item.name}
                        </h4>
                        <p className={`text-xs mt-1 ${i === 0 ? "text-white/80" : "text-gray-400"}`}>
                          {item.code}
                        </p>
                        <p className={`text-[10px] mt-2 ${i === 0 ? "text-white/70" : "text-gray-500 font-medium"}`}>
                          Point Value
                        </p>
                      </div>

                      {/* Badge */}
                      <div className="ml-2 flex-shrink-0">
                        <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold border-2 ${i === 0 ? "bg-white text-red-500 border-white" : "bg-[#ffe5e5] text-red-500 border-transparent"
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar & Value */}
                    <div className="flex items-center justify-between mb-2">
                      <div className={`flex-1 h-1 rounded-full mr-4 ${i === 0 ? "bg-red-500" : "bg-gray-100"}`}>
                        <div className="h-full bg-red-500 rounded-full w-[40%]"></div>
                      </div>
                      <span className="text-xs text-red-500 font-bold">
                        40.0
                      </span>
                    </div>

                    <p className={`text-[10px] ${i === 0 ? "text-red-500" : "text-red-400"}`}>
                      Last check <span className="ml-2">3302 days ago</span>
                    </p>
                  </div>
                ))}
              </div>
            </div>


            {/* Health Checkup Overdue */}
            <div className="lg:col-span-1 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">

              {/* Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-[#ffe5e5] p-2 rounded-xl border border-red-500 text-red-500 flex items-center justify-center">
                 <img src={clock} alt="clock icon" className='w-6' />
                </div>
                <div>
                  <h3 className="text-[#546A81] font-bold text-lg leading-tight">
                    Health Checkup Overdue
                  </h3>
                  <p className="text-[11px] text-gray-400 mt-0.5">Showing 8 machines overdue.</p>
                </div>
              </div>

              {/* 3 Summary Boxes */}
              <div className="grid grid-cols-3 gap-2 mb-6">
                <div className="bg-[#E6F3FF] rounded-xl py-3 flex flex-col items-center justify-center">
                  <span className="text-[#990000] font-bold text-2xl">2</span>
                  <span className="text-[10px] text-gray-400 mt-1 font-semibold">Critical</span>
                </div>
                <div className="bg-[#E6F3FF] rounded-xl py-3 flex flex-col items-center justify-center">
                  <span className="text-[#FFCB05] font-bold text-2xl">5</span>
                  <span className="text-[10px] font-semibold text-gray-400 mt-1">Warning</span>
                </div>
                <div className="bg-[#E6F3FF] rounded-xl py-3 flex flex-col items-center justify-center">
                  <span className="text-[#546A81] font-bold text-2xl">+9yr</span>
                  <span className="text-[10px] font-semibold text-gray-400 mt-1">Max delay</span>
                </div>
              </div>

              {/* List Items */}
              <div className="space-y-4">
                {/* iterate through array healthCheckItems */}
                {[1, 2, 3, 4].map((item, i) => (
                  <div key={i} className="flex items-start justify-between border-b border-gray-100 pb-3 last:border-0">
                    <div>
                      <h4 className="text-sm font-bold text-[#546A81]">Rear Drive Unit_LH</h4>
                      <p className="text-[10px] text-yellow-500 font-medium mt-1">MMP . 1V . <span className="font-bold">E</span></p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-[#546A81]">3302</span>
                      <span className="text-[10px] text-gray-400 ml-1">days</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>

  )
}

export default Dashboard