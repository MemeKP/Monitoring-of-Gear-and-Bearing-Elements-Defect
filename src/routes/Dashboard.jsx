import React, { useState } from 'react'
import Navbar from '../components/Navbar.jsx'
import { ChevronLeft, Menu, X } from "lucide-react";
import mmm from '../img/mmm.jpg'
import mmm2 from '../img/mmm2.jpg'
import mmm3 from '../img/view4.webp'

const stats = {
  totalMachines: 1000,
  defectivePercent: 88.1,
  carefulPercent: 5.1,
  normalPercent: 6.8,
};

const gradeBreakdown = [
  { grade: "Grade F", percent: 88.1, color: "bg-red-600" },
  { grade: "Grade E", percent: 5.1, color: "bg-blue-400" },
  { grade: "Grade C", percent: 2.3, color: "bg-cyan-300" },
  { grade: "Grade B", percent: 2.3, color: "bg-blue-300" },
  { grade: "Grade A", percent: 2.3, color: "bg-indigo-300" },
];
const machinesRequiringAttention = [
  {
    id: 1,
    name: "[Test_BPKMH2] Crusher 2: Single Roll Crush",
    code: "MMP_1V - 2017-04-08",
    status: "Critical",
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

      {/* HERO SECTION */}
      {/* <div className='text-slate-500 text-4xl font-bold leading-[66px]'>
        Dashboard
      </div>

      <div className="flex items-center gap-2 text-sm text-gray-600">
        <button className='hover:pointer'>All sites</button>
        <span>›</span>
        <button className="font-medium text-gray-700 hover:pointer">Mea Moh Mine</button>
        <span>›</span>
        <button className="font-medium text-gray-700 hover:pointer">Dashboard</button>
      </div> */}
      {/* ── MAIN CONTENT ── */}
      <div
        className={`transition-all duration-300 pt-14 md:pt-0 ${sidebarOpen ? "md:ml-64" : "md:ml-20"
          }`}
      >
        {/* Header */}
        <div className="bg-white/60 backdrop-blur border-b border-gray-200 p-4 md:p-6">
          <div className='text-[#546A81] text-4xl font-bold leading-[66px]'>
            Dashboard
          </div>

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-[#546A81]">
            <span>All sites</span>
            <span>›</span>
            <span className="font-medium text-[#546A81]">{siteName}</span>
            <span>›</span>
            <span className="font-medium text-[#546A81]">Dashboard</span>
          </div>
        </div>

        {/* Content grid */}
        <div className="p-4 md:p-6 space-y-6">
          {/* Row 1: Stats + Stage Breakdown + Images */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Statistic Overview Card */}
            <div className="md:col-span-1 lg:col-span-1 bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition">
              <h3 className="text-gray-600 font-semibold text-sm mb-4">
                Statistic overview
              </h3>
              <p className="text-gray-400 text-xs mb-6">% of fleet needing attention</p>

              {/* Donut chart mockup */}
              <div className="relative w-32 h-32 mx-auto mb-4">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#7f1d1d"
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
                  <circle cx="50" cy="50" r="25" fill="white" />
                  <text
                    x="50"
                    y="52"
                    textAnchor="middle"
                    className="text-xs font-bold fill-gray-700"
                  >
                    1,000
                  </text>
                  <text
                    x="50"
                    y="58"
                    textAnchor="middle"
                    className="text-xs fill-gray-500"
                  >
                    Machines
                  </text>
                </svg>
              </div>

              {/* Legend */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Defective</span>
                  <span className="font-bold text-red-700">88.1%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Careful</span>
                  <span className="font-bold text-yellow-500">5.1%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Normal</span>
                  <span className="font-bold text-green-600">6.8%</span>
                </div>
              </div>
            </div>

            {/* Stage Breakdown Card */}
            <div className="md:col-span-1 lg:col-span-1 bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition">
              <h3 className="text-gray-600 font-semibold text-sm mb-4">
                Stage Breakdown
              </h3>
              <p className="text-gray-400 text-xs mb-6">Distribution across all stages</p>

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
            <div className="md:col-span-2 lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
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

          {/* Row 2: Machines requiring attention (full width) */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 font-semibold text-base">
                Machines requiring attention
              </h3>
              <div className="flex items-center gap-2">
                <span className="inline-block w-3 h-3 rounded-full bg-red-500"></span>
                <span className="text-xs font-medium text-gray-600">Critical</span>
                <span className="inline-block w-3 h-3 rounded-full bg-yellow-400 ml-3"></span>
                <span className="text-xs font-medium text-gray-600">Warning</span>
              </div>
            </div>
            <p className="text-xs text-gray-400 mb-4">Showing 881 machines</p>

            {/* Machine list */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {machinesRequiringAttention.map((item, i) => (
                <div
                  key={i}
                  className={`p-4 rounded-xl transition hover:shadow-md ${i === 0
                    ? "bg-red-100 border-2 border-red-500"
                    : "bg-gray-50 border border-gray-200"
                    }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-gray-700">
                        {item.name}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">{item.code}</p>
                    </div>
                    <div className="ml-2 flex-shrink-0">
                      <span
                        className={`inline-block px-3 py-1 rounded-lg text-white text-xs font-bold ${item.status === "F"
                          ? "bg-red-500"
                          : "bg-red-600"
                          }`}
                      >
                        {item.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex-1 h-1 bg-red-400 rounded-full mr-2"></div>
                    <span className="text-xs text-red-600 font-medium whitespace-nowrap">
                      40.0
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Last check: {item.daysAgo}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Row 3: Health Check + Recent items (2 col on md+) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Health Checkup Overdue */}
            <div className="md:col-span-1 bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-gray-600 font-semibold text-sm mb-1">
                Health Checkup Overdue
              </h3>
              <p className="text-gray-400 text-xs mb-6">Showing 8 machines overdue</p>

              <div className="space-y-3 mb-6">
                {healthCheckItems.map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className={`${item.color} w-10 h-10 rounded-lg flex items-center justify-center`}>
                      <span className="text-white text-lg font-bold">{item.count}</span>
                    </div>
                    <span className="text-sm text-gray-600 font-medium">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent items list */}
            <div className="md:col-span-2 bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-gray-600 font-semibold text-sm mb-4">
                Recent Health Checks
              </h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {recentItems.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition"
                  >
                    <span className="text-sm text-gray-700 font-medium">{item.name}</span>
                    <span className="text-sm text-gray-500 whitespace-nowrap ml-2">
                      {item.days}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* STAT OVERVIEW */}

      {/* STAGE BREAKDOWN */}

      {/* MACHINES LIST */}

      {/* ATTENTION LIST */}

    </>

  )
}

export default Dashboard