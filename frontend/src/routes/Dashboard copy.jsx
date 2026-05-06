import { useState } from "react";
import { ChevronLeft, Menu, X } from "lucide-react";
import logo from '../assets/logo.png'
import dashboard from '../assets/dashboard.png'
import equipment from '../assets/equipment.png'
import allsites from '../assets/allsites.png'
import logout from '../assets/logout.png'
import dashboardActive from '../assets/dashboard-active.png'
import equipmentActive from '../assets/equipment-active.png'
import allsitesActive from '../assets/allsites-active.png'
import leftArrow from '../assets/left-arrow.png'


/**
 * DashboardPage — Detail view for a specific site
 * Features:
 *   - Collapsible left sidebar (click icon to expand/collapse)
 *   - Responsive: sidebar hides on mobile, hamburger menu appears
 *   - Grid layout with stat cards, charts, and images
 *   - Breadcrumb navigation
 */
export function DashboardPage({ siteName = "Mae Moh Mine", onBack }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Mock data
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#E9F3FF] to-[#B5D1F3]">
      {/* ── Sidebar (desktop) ── */}
      <div
        className={`fixed left-0 top-0 h-full transition-transform -translate-x-full sm:translate-x-0 bg-white/60 shadow-[inset_3px_3px_0.5px_-3px_rgba(255,255,255,1.00)] shadow-[inset_2px_2px_0.5px_-2px_rgba(255,255,255,0.15)] transition-all duration-300 z-40 ${sidebarOpen ? "w-64" : "w-20"
          } hidden md:block`}
      >
        {/* Logo area */}
        <div className="flex items-center justify-between p-4 ">
          {sidebarOpen && (
            <div className="flex items-center gap-2">

              <img src={logo} className='w-12 ml-4 sm:w-12 pr-2 sm:pr-3 flex-shrink-0 flex items-center justify-center' alt="logo" />
              <div className="text-slate-500 text-xl sm:text-l font-bold tracking-tight">
                EGAT<span className='font-normal'>for</span>ALL
              </div>
            </div>
          )}

        </div>

        {/* Menu items */}
        <nav className="mt-6 space-y-2 px-2">
          {[
            { icon: allsites, iconActive: allsitesActive, label: "All sites", active: false },
            { icon: dashboard, iconActive: dashboardActive, label: "Dashboard", active: true },
            { icon: equipment, iconActive: equipmentActive, label: "Equipment Folder", active: false },
          ].map((item, i) => (
            <button
              key={i}
              className={`group relative overflow-hidden w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-300
  ${item.active
                  ? "bg-[#708DA8] text-white"
                  : "text-[#546A81] hover:text-[#546A81]"
                }`}
            >
              {/* animated white bg */}
              {!item.active && (
                <span
                  className="absolute inset-0 bg-white scale-x-0 origin-left 
      group-hover:scale-x-100 transition-transform duration-500 ease-out z-0 "
                />
              )}

              {/* content */}
              <img
                src={item.active ? item.iconActive : item.icon}
                alt={item.label}
                className="relative z-10 w-5 h-5 flex-shrink-0 object-contain transition-all duration-300 group-hover:scale-110"
              />

              {sidebarOpen && (
                <span className="relative z-10 text-sm font-medium">
                  {item.label}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-2 mt-auto mb-4">
          <button
            onClick={() => {
              console.log("Logout clicked!");
            }}
            className="group relative overflow-hidden w-full flex items-center gap-3 px-3 py-2 rounded-xl
    text-red-500 transition-all duration-300"
          >
            {/* animated bg from left to right */}
            <span
              className="absolute inset-0 bg-red-50 scale-x-0 origin-left
      group-hover:scale-x-100 transition-transform duration-500 "
            />

            {/* icon */}
            <img
              src={logout}
              alt="Logout"
              className="relative z-10 w-5 h-5 flex-shrink-0 object-contain transition-all duration-300 group-hover:scale-110"
            />

            {/* text */}
            {sidebarOpen && (
              <span className="relative z-10 text-sm font-medium transition-all duration-300 group-hover:translate-x-1">
                Logout
              </span>
            )}
          </button>
        </div>

        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute bottom-0 right-0 p-1 rounded transition"
        >
          <img
            src={leftArrow}
            className={`w-5 transition-transform ${sidebarOpen ? "" : "rotate-180"}`}
          />
        </button>
      </div>

      {/* ── Mobile menu (hamburger) ── */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white shadow z-50">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <img src={logo} className='w-8 ml-4 sm:w-12 pr-2 sm:pr-3 flex-shrink-0 flex items-center justify-center' alt="logo" />
            <div className="text-slate-500 text-base sm:text-sm font-bold tracking-tight">
              EGAT<span className='font-normal'>for</span>ALL
            </div>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1 hover:bg-gray-100 rounded"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <nav className="px-4 py-3 border-t border-gray-100 space-y-2">
            {[
              { icon: allsites, iconActive: allsitesActive, label: "All sites", active: false },
              { icon: dashboard, iconActive: dashboardActive, label: "Dashboard", active: true },
              { icon: equipment, iconActive: equipmentActive, label: "Equipment Folder", active: false },
            ].map((item, i) => (
              <button
                key={i}
                className={`group relative overflow-hidden w-full flex items-center gap-3 px-2 py-1 rounded-l transition-all duration-300
  ${item.active
                    ? "bg-[#708DA8] text-white"
                    : "text-[#546A81] hover:text-[#546A81]"
                  }`}
              >
                {/* animated white bg */}
                {!item.active && (
                  <span
                    className="absolute inset-0 bg-white scale-x-0 origin-left 
      group-hover:scale-x-100 transition-transform duration-500 ease-out z-0 "
                  />
                )}

                {/* content */}
                <img
                  src={item.active ? item.iconActive : item.icon}
                  alt={item.label}
                  className="relative z-10 w-5 h-5 flex-shrink-0 object-contain transition-all duration-300 group-hover:scale-110"
                />

                {sidebarOpen && (
                  <span className="relative z-10 text-sm font-medium">
                    {item.label}
                  </span>
                )}
              </button>
            ))}
          </nav>
        )}
      </div>

      {/* ── MAIN CONTENT ── */}
      <div
        className={`transition-all duration-300 pt-14 md:pt-0 ${sidebarOpen ? "md:ml-64" : "md:ml-20"
          }`}
      >
        {/* Header */}
        <div className="bg-white/60 backdrop-blur border-b border-gray-200 p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium text-sm"
            >
              <ChevronLeft size={18} />
              Back
            </button>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-700">{siteName}</h1>
            <div className="w-8" /> {/* spacer for alignment */}
          </div>

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>All sites</span>
            <span>›</span>
            <span className="font-medium text-gray-700">{siteName}</span>
            <span>›</span>
            <span className="font-medium text-gray-700">Dashboard</span>
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

            {/* Images (2 items stacked on mobile, 2 cols on desktop) */}
            <div className="md:col-span-2 lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=300&h=300&fit=crop",
                "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=300&h=300&fit=crop",
              ].map((url, i) => (
                <div
                  key={i}
                  className="bg-gradient-to-br from-yellow-100 to-orange-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition aspect-square"
                >
                  <img
                    src={url}
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
                      {item.point_value}
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

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(84,106,129,0.3); border-radius: 3px; }
      `}</style>
    </div>
  );
}
