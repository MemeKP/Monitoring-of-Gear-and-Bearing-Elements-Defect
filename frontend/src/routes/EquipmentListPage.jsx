import React, { useEffect, useRef, useState } from 'react'
import Navbar from '../components/Navbar'
import { ArrowDownNarrowWide, ArrowDownWideNarrow, ChevronRight, Funnel, Plus, RefreshCcw, Search, X, } from "lucide-react";
import SidePanel from '../components/SidePanel';

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
        {/* HEADER */}
        <div className='p-4 md:p-6 pb-0'>
          <div className='text-[#546A81] text-4xl font-bold leading-[66px]'>Equipment Health</div>
          <div className="flex font-medium items-center gap-2 text-base text-[#546A81]">
            <span>Home</span><ChevronRight size={16} />
            <span>Mea Moh Mine</span><ChevronRight size={16} />
            <span>Equipment Health</span>
          </div>

          {/* FILTER BAR */}
          <div className='flex items-center justify-between'>
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

            {/* SEARCH BAR */}
            <div className='flex flex-row gap-x-3 items-center'>
              <div className='bg-[#DDE1E6] rounded-full px-5 py-1.5'>
                <Search size={15} className=''/>
              </div>
              
              <RefreshCcw size={15}/>
              <ArrowDownNarrowWide size={15}/>
              {/* <ArrowDownWideNarrow /> */}
            </div>
          </div>


          <div className='mt-3 text-sm text-[#546A81]'>Showing 198 from 893 results</div>
        </div>

        {/* TTABLE + SIDE PANEL */}
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

          {/* SIDE PANEL */}
          {selectedEquipment && (
            <SidePanel equipment={selectedEquipment} onClose={() => setSelectedEquipment(null)} />
          )}
        </div>
      </div>
    </div>
  )
}

export default EquipmentListPage