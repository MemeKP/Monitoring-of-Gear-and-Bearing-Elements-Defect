import React, { useState } from 'react'
import Navbar from '../components/Navbar'
import { ChevronRight, Funnel, Plus, X } from "lucide-react";

const equipmentData = [
  { id: 29786, name: "Study Case_OAB. 12-3 G", site: "MMP", state: 5, date: "2022-11-4", time: "14:20:00", measPoint: "24-005_CR-H05", bpfo: 100, f0: 1135, ibeta: 1.4, grade: "F", whenActioned: "2024-02-01 10:53:54" },
  { id: 29786, name: "Study Case_OAB. 12-3 G", site: "MMP", state: 5, date: "2022-11-4", time: "14:20:00", measPoint: "24-005_CR-H05", bpfo: 100, f0: 1135, ibeta: 1.4, grade: "F", whenActioned: "2024-02-01 10:53:54" },
  { id: 29786, name: "Study Case_OAB. 12-3 G", site: "MMP", state: 5, date: "2022-11-4", time: "14:20:00", measPoint: "24-005_CR-H05", bpfo: 100, f0: 1135, ibeta: 1.4, grade: "F", whenActioned: "2024-02-01 10:53:54" },
  { id: 29786, name: "(Test_BPKMH2) Crusher 2: Single Roll Crush", site: "MMP", state: 5, date: "2017-4-4", time: "14:20:00", measPoint: "24-005_CR-H05", bpfo: 170, f0: 4951, ibeta: 2.6, grade: "F", whenActioned: "2024-02-01 10:53:54", pointLabel: "MMP Point 3V", stage: 2, daysAgo: "3302 days" },
  { id: 29786, name: "Study Case_OAB. 12-3 G", site: "MMP", state: 5, date: "2022-11-4", time: "14:20:00", measPoint: "24-005_CR-H05", bpfo: 100, f0: 1135, ibeta: 1.4, grade: "F", whenActioned: "2024-02-01 10:53:54" },
  { id: 29786, name: "Study Case_OAB. 12-3 G", site: "MMP", state: 5, date: "2022-11-4", time: "14:20:00", measPoint: "24-005_CR-H05", bpfo: 100, f0: 1135, ibeta: 1.4, grade: "F", whenActioned: "2024-02-01 10:53:54" },
  { id: 29786, name: "Study Case_OAB. 12-3 G", site: "MMP", state: 5, date: "2022-11-4", time: "14:20:00", measPoint: "24-005_CR-H05", bpfo: 100, f0: 1135, ibeta: 1.4, grade: "F", whenActioned: "2024-02-01 10:53:54" },
  { id: 29786, name: "Study Case_OAB. 12-3 G", site: "MMP", state: 5, date: "2022-11-4", time: "14:20:00", measPoint: "24-005_CR-H05", bpfo: 100, f0: 1135, ibeta: 1.4, grade: "F", whenActioned: "2024-02-01 10:53:54" },
]

// Mini frequency chart using SVG
const FrequencyChart = () => (
  <svg width="100%" height="120" viewBox="0 0 290 130" xmlns="http://www.w3.org/2000/svg">
    <text x="0" y="12" fill="#546A81" fontSize="10">306</text>
    <text x="0" y="62" fill="#546A81" fontSize="10">204</text>
    <text x="0" y="112" fill="#546A81" fontSize="10">102</text>
    <line x1="28" y1="10" x2="290" y2="10" stroke="#E5E7EB" strokeWidth="0.5" />
    <line x1="28" y1="60" x2="290" y2="60" stroke="#E5E7EB" strokeWidth="0.5" />
    <line x1="28" y1="110" x2="290" y2="110" stroke="#E5E7EB" strokeWidth="0.5" />
    <path d="M28,110 Q50,110 60,60 Q70,20 80,60 Q90,90 100,110 Q140,110 160,80 Q175,50 185,80 Q195,100 210,110 Q240,110 255,90 Q265,75 275,90 Q283,100 290,110 Z" fill="#C8D8F8" opacity="0.6" />
    <path d="M28,110 Q50,110 60,60 Q70,20 80,60 Q90,90 100,110" fill="none" stroke="#3B5BDB" strokeWidth="1.5" opacity="0.8" />
    <path d="M140,110 Q155,110 165,80 Q175,50 185,80 Q195,100 210,110" fill="none" stroke="#3B5BDB" strokeWidth="1.5" opacity="0.6" />
    <path d="M240,110 Q255,110 265,85 Q272,75 280,85 Q286,95 290,110" fill="none" stroke="#3B5BDB" strokeWidth="1.5" opacity="0.4" />
    <text x="28" y="126" fill="#546A81" fontSize="9">0</text>
    <text x="74" y="126" fill="#546A81" fontSize="9">180</text>
    <text x="126" y="126" fill="#546A81" fontSize="9">360</text>
    <text x="176" y="126" fill="#546A81" fontSize="9">540</text>
    <text x="226" y="126" fill="#546A81" fontSize="9">630</text>
    <text x="145" y="140" fill="#546A81" fontSize="9" textAnchor="middle">Frequency (Hz)</text>
  </svg>
)

const SidePanel = ({ equipment, onClose }) => {
  if (!equipment) return null
  return (
    <>
      {/* Mobile overlay */}
      <div
        className="fixed inset-0 bg-black/20 z-30 md:hidden"
        onClick={onClose}
      />
      <div className={`
  fixed top-0 right-0 h-full z-40 
  w-[340px] bg-white border-l border-gray-200
  flex flex-col overflow-y-auto
  transition-transform duration-300
  shadow-xl
`}>
        <div className="p-5 flex flex-col gap-5 flex-1">
          {/* Header */}
          <div className="flex justify-between items-start gap-3">
            <div>
              <h2 className="text-[17px] font-bold text-[#546A81] leading-snug">
                {equipment.name}
              </h2>
              <p className="text-[12px] text-[#546A81] mt-1">
                {equipment.pointLabel ?? 'MMP Point 1V'}
              </p>
            </div>
            <button onClick={onClose} className="text-[#546A81] hover:text-[#242533] mt-0.5 flex-shrink-0">
              <X size={18} />
            </button>
          </div>

          {/* Status */}
          <div>
            <p className="text-[13px] font-bold text-[#546A81] mb-2">Status</p>
            <div className="flex justify-between text-[13px] py-1">
              <span className="text-[#546A81]">Grade</span>
              <span className="font-medium">{equipment.grade}</span>
            </div>
            <div className="flex justify-between text-[13px] py-1">
              <span className="text-[#546A81]">Stage</span>
              <span className="font-medium">{equipment.stage ?? 1}</span>
            </div>
          </div>

          {/* Last Measurement */}
          <div>
            <p className="text-[13px] font-bold text-[#546A81] mb-2">Last measurement</p>
            <div className="flex justify-between text-[13px] py-1">
              <span className="text-[#546A81]">Date</span>
              <span className="font-medium">{equipment.date}</span>
            </div>
            <div className="flex justify-between text-[13px] py-1">
              <span className="text-[#546A81]">Days ago</span>
              <span className="font-medium">{equipment.daysAgo ?? '489 days'}</span>
            </div>
          </div>

          {/* Bearing Parameters */}
          <div>
            <p className="text-[13px] font-bold text-[#546A81] mb-2">Bearing Parameters</p>
            <div className="flex justify-between text-[13px] py-1">
              <span className="text-[#546A81]">f0</span>
              <span className="font-medium">{equipment.f0} Hz</span>
            </div>
            <div className="flex justify-between text-[13px] py-1">
              <span className="text-[#546A81]">iBeta</span>
              <span className="font-medium">{equipment.ibeta}</span>
            </div>
            <div className="flex justify-between text-[13px] py-1">
              <span className="text-[#546A81]">BPFO / BPFI</span>
              <span className="font-medium">{equipment.bpfo} / {equipment.bpfo + 10}</span>
            </div>
          </div>

          {/* Chart */}
          <div className="bg-[#F9F9FC] rounded-lg p-3">
            <p className="text-[13px] font-bold text-[#546A81] mb-2">Point Value Trend</p>
            <FrequencyChart />
          </div>

          {/* View Full Details */}
          <button className="mt-auto bg-[#708DA8] hover:bg-[#ffff] hover:text-[#708DA8] hover:border-solid hover:border-2 hover:border-[#708DA8] text-white font-semibold text-[14px] py-3 rounded-lg transition-colors">
            View full details
          </button>
        </div>
      </div>
    </>
  )
}

const EquipmentListPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [selectedEquipment, setSelectedEquipment] = useState(null)

  const handleRowClick = (item) => {
    setSelectedEquipment(prev => prev === item ? null : item)
  }

  const TABLE_COLS = [
    { key: 'id', label: 'Id' },
    { key: 'name', label: 'Name' },
    { key: 'site', label: 'Site' },
    { key: 'state', label: 'State' },
    { key: 'date', label: 'Date' },
    { key: 'time', label: 'Time' },
    { key: 'measPoint', label: 'Meas Point' },
    { key: 'bpfo', label: 'BPFO' },
    { key: 'f0', label: 'f0' },
    { key: 'ibeta', label: 'iBeta' },
    { key: 'grade', label: 'Grade' },
    { key: 'whenActioned', label: 'When Actioned' },
  ]

  return (
    <div className='bg-[#F9F9FC] min-w-screen min-h-screen'>
      <Navbar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      <div className={`transition-all duration-300 pt-14 md:pt-0 ${sidebarOpen ? "md:ml-64" : "md:ml-20"}`}>
        {/* Header */}
        <div className='p-4 md:p-6 pb-0'>
          <div className='text-[#546A81] text-4xl font-bold leading-[66px]'>Equipment Health</div>
          <div className="flex font-medium items-center gap-2 text-base text-[#546A81]">
            <span>Home</span><ChevronRight size={16} />
            <span>Mea Moh Mine</span><ChevronRight size={16} />
            <span>Equipment Health</span>
          </div>

          {/* Filter bar */}
          <div className='flex items-center mt-2 gap-2 flex-wrap'>
            <Funnel className='w-4 hover:cursor-pointer text-[#546A81]' />
            <div className='bg-[#E8F0FC] flex items-center text-[#242533] font-semibold text-sm py-1 px-3 gap-2 rounded-full cursor-pointer'>
              F Grade <X size={12} />
            </div>
            <div className='bg-[#FFF3C7] flex items-center text-[#B8860B] font-semibold text-sm py-1 px-3 gap-2 rounded-full cursor-pointer'>
              Overdue <X size={12} />
            </div>
            <button className='flex items-center gap-1 font-semibold text-sm text-[#546A81]'>
              <Plus size={14} /> Filter
            </button>
          </div>

          <div className='mt-3 text-sm text-[#546A81]'>Showing 198 from 893 results</div>
        </div>

        {/* Table + Side Panel */}
        <div className="flex overflow-hidden">
          {/* Scrollable table */}
          <div className="flex-1 overflow-x-auto min-w-0">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  {TABLE_COLS.map(col => (
                    <th key={col.key} className="px-4 py-3 text-left text-[13px] font-semibold text-[#546A81] whitespace-nowrap">
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {equipmentData.map((row, i) => (
                  <tr
                    key={i}
                    onClick={() => handleRowClick(row)}
                    className={`
                      border-b border-gray-100 cursor-pointer transition-colors
                      ${selectedEquipment === row ? 'bg-[#EEF3FB]' : 'hover:bg-[#F3F6FB]'}
                    `}
                  >
                    <td className="px-4 py-3 text-[13px]">{row.id}</td>
                    <td className="px-4 py-3 text-[13px] max-w-[200px] whitespace-normal leading-snug">{row.name}</td>
                    <td className="px-4 py-3 text-[13px] whitespace-nowrap">{row.site}</td>
                    <td className="px-4 py-3 text-[13px]">{row.state}</td>
                    <td className="px-4 py-3 text-[13px] whitespace-nowrap">{row.date}</td>
                    <td className="px-4 py-3 text-[13px]">{row.time}</td>
                    <td className="px-4 py-3 text-[13px] whitespace-nowrap">{row.measPoint}</td>
                    <td className="px-4 py-3 text-[13px]">{row.bpfo}</td>
                    <td className="px-4 py-3 text-[13px]">{row.f0}</td>
                    <td className="px-4 py-3 text-[13px]">{row.ibeta}</td>
                    <td className="px-4 py-3 text-[13px]">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#FDDCDC] text-[#C0392B] font-bold text-[13px]">
                        {row.grade}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[13px] whitespace-nowrap">{row.whenActioned}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Side panel */}
          <div className={`transition-all duration-300 flex-shrink-0 ${selectedEquipment ? 'w-[340px]' : 'w-0'} overflow-hidden`}>
            <SidePanel equipment={selectedEquipment} onClose={() => setSelectedEquipment(null)} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default EquipmentListPage