import React, { useEffect, useMemo, useRef, useState } from 'react'
import Navbar from '../components/Navbar'
import { useNavigate, useParams } from 'react-router-dom';
import { MoveRight, RefreshCcw, Search } from 'lucide-react';
import { GRADE_BADGE_COLORS, GRADE_FILTERS, REPORT_TABLE_COLS } from '../constant/gradeConfig';
import dayjs from 'dayjs';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useInView } from 'react-intersection-observer';
import { useReports } from '../hooks/useReport';
import reportTable from '../assets/reportTable.png'
const ReportList = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate()
  const { siteId } = useParams()
  const siteName = siteId ?? 'All sites';
  const [searchInput, setSearchInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedId, setSelectedId] = useState(null);

  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage
  } = useReports(
    searchQuery ? { search: searchQuery } : {}
  )

  const parentRef = useRef()

  const allRows = useMemo(() => {
    return data?.pages?.flatMap((page) => page?.data || []) ?? []
  }, [data])

  const totalCount = hasNextPage ? allRows.length + 1 : allRows.length

  const rowVirtualizer = useVirtualizer({
    count: totalCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 72,
    overscan: 8,
  })

  const { ref: loadMoreRef, inView } = useInView();
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);
  return (
    <div className="bg-[#F9F9FC] min-h-screen">
      <Navbar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />
      <div
        className={`transition-all duration-300 pt-14 md:pt-0 ${sidebarOpen ? "md:ml-60" : "md:ml-20"
          }`}
      >
        {/* Header */}
        <div className="p-4 md:p-6">
          <div className='text-[#546A81] text-4xl font-bold leading-[66px]'>
            Dashboard
          </div>
          <div className="flex font-medium items-center gap-2 text-base text-[#546A81]">
            <span className='hover:cursor-pointer' onClick={() => navigate(`/`)}>All sites</span>
            <span>›</span>
            <span className="text-[#546A81]" onClick={() => navigate(`/dashboard/${siteId}`)}>{siteName}</span>
            <span>›</span>
            <span className="text-[#546A81]">Report List</span>
          </div>
        </div>

        {/* Content */}
        <div className="flex ml-4 items-center justify-between mt-1 flex-wrap gap-2 px-4">
          {/* SEARCH + CONTROLS */}
          <div className="flex flex-row gap-x-3 items-center">
            <div className="flex items-center bg-[#DDE1E6] rounded-full px-4 py-1.5 gap-2">
              <input
                type="text"
                placeholder="Search..."
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                className="bg-transparent outline-none text-sm text-[#546A81] w-36 placeholder-gray-400"
              />
              <Search size={15} className="text-[#546A81]" />
            </div>
          </div>
        </div>

        {/* ROW COUNT */}
        <div className="mt-3 ml-6 mb-6 text-sm text-[#546A81]">
          {isLoading
            ? 'Loading...'
            : (() => {
              const loadedCount = data?.pages?.reduce(
                (acc, page) => acc + (page?.data?.length || 0),
                0
              ) || 0;
              const totalCount = data?.pages?.[0]?.meta?.totalItems || 0;
              return (
                <>
                  Showing {' '}
                  <span className='font-semibold'>
                    {loadedCount.toLocaleString()}
                  </span> of  {' '}
                  <span className='font-semibold'>
                    {totalCount.toLocaleString()}
                  </span> results
                </>);
            })()
          }
        </div>

        {/* TABLE + SIDE PANEL */}
        <div className="flex overflow-hidden">
          {/* SCROLLABLE TABLE */}
          {/* TABLE AREA  */}
          <div className="flex-1 flex flex-col overflow-hidden px-4 md:px-6">
            {/* VIRTUALIZED ROWS */}
            <div
              ref={parentRef}
              className="flex-1 overflow-auto"
            >
              {/* TABLE HEADER (Sticky) */}
              <div className="flex w-full border-b border-[#EEEEF2] bg-[#F9F9FC] shrink-0 z-10">
                {REPORT_TABLE_COLS.map(col => (
                  <div
                    key={col.key}
                    className={`px-4 py-3 text-[12px] font-semibold text-[#484964] whitespace-nowrap ${col.width} shrink-0`}
                  >
                    {col.label}
                  </div>
                ))}
              </div>
              <div
                style={{
                  height: `${rowVirtualizer.getTotalSize()}px`,
                  width: '100%',
                  position: 'relative',
                }}
              >
                {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                  const isLoaderRow = virtualRow.index > allRows.length - 1;
                  const row = allRows[virtualRow.index];

                  if (isLoaderRow) {
                    return (
                      <div key="loader" ref={loadMoreRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', transform: `translateY(${virtualRow.start}px)` }}
                        className="p-4 text-center text-sm text-gray-400">
                        {hasNextPage ? 'Loading more...' : 'End of results'}
                      </div>
                    )
                  }
                  const isSelected = selectedId === row.id;    
                  return (
                    <div
                      key={row.id}
                      onClick={() => {
                        setSelectedId(isSelected ? null : row.id);
                      }}
                      className={`flex items-center border-b border-[#EEEEF2] cursor-pointer transition-colors ${isSelected ? 'bg-[#EEF3FB]' : 'hover:bg-[#F3F6FB]'
                        }`}
                      style={{
                        position: 'absolute', top: 0, left: 0, width: '100%',
                        height: `${virtualRow.size}px`,
                        transform: `translateY(${virtualRow.start}px)`,
                      }}
                    >
                      <div className={`px-4 text-[13px] text-[#484964] ${REPORT_TABLE_COLS[0].width} shrink-0`}>
                        {row.id}
                      </div>
                      <div className={`px-4 text-[13px] text-[#484964] ${REPORT_TABLE_COLS[1].width} shrink-0 truncate`}>
                        <div className="flex items-center gap-2">
                          <img
                            src={reportTable}
                            alt=""
                            className="w-5 h-5 shrink-0 bg-[#E6F3FF] border border-[#5DAFFF] rounded-sm"
                          />
                          <span className="truncate">{row.equipmentName ?? '—'}</span>
                        </div>
                      </div>
                      <div className={`px-4 text-[13px] text-[#484964] ${REPORT_TABLE_COLS[2].width} shrink-0 truncate`}>
                        {row.measurement?.equipment ?? '—'}
                      </div>
                      <div className={`px-4 text-[13px] text-[#484964] ${REPORT_TABLE_COLS[3].width} shrink-0`}>
                        {row.kks ?? '—'}
                      </div>
                      <div className={`px-4 text-[13px] text-[#484964] ${REPORT_TABLE_COLS[4].width} shrink-0`}>
                        {row.rpm ?? '—'}
                      </div>
                      <div className={`px-4 text-[13px] text-[#484964] ${REPORT_TABLE_COLS[5].width} shrink-0`}>
                        {row.createdAt
                          ? dayjs(row.createdAt).format('DD/MM/YYYY')
                          : '—'}
                      </div>

                      <div className={`px-4 ${REPORT_TABLE_COLS[6].width} shrink-0`}>
                        <button onClick={(e) => { e.stopPropagation(); navigate(`/dashboard/${siteId}/equipment/${row.envelopedFftId}/report-view`) }}
                          className="text-xs text-[#546A81] hover:text-[#5DAFFF] duration-300 font-medium">
                          <div className='flex flex-row items-center gap-2'>Open <MoveRight /></div>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div></div>
    </div>
  );
}

export default ReportList