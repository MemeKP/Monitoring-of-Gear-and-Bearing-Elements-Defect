import { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ChevronRight, Funnel, X, Plus, Search, RefreshCcw, ArrowDownNarrowWide, Check } from 'lucide-react';
import { useEquipmentList } from '../hooks/useEquipment';
import SidePanel from '../components/SidePanel'
import Navbar from '../components/Navbar'
import { GRADE_BADGE_COLORS, GRADE_FILTERS, TABLE_COLS } from '../constant/gradeConfig';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useInView } from 'react-intersection-observer';
import dayjs from 'dayjs';

export default function EquipmentListPage() {
  const navigate = useNavigate();
  const { siteId } = useParams();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [filterOpen, setFilterOpen] = useState(false);

  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  ///const [activeGrades, setActiveGrades] = useState([]);
  //const [activeFilter, setActiveFilter] = useState(null);

  
  const [sortOrder, setSortOrder] = useState('desc');
  const [searchParams, setSearchParams] = useSearchParams()
  const currentGrade = searchParams.get('grade');
  const LIMIT = 20;
const activeFilter = useMemo(() => {
    if (!currentGrade) return null;
    return GRADE_FILTERS.find(item => item.value === currentGrade) || null;
  }, [currentGrade]);

  useEffect(() => {
    if (!filterOpen) return;
    const handler = (e) => {
      if (!e.target.closest('#grade-filter-dropdown')) {
        setFilterOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [filterOpen]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // const searchFilter = useMemo(() => ({
  //   site: siteId ?? undefined,
  //   grade: activeGrades.length ? activeGrades.join(',') : undefined,
  //   f_filter: activeGrades?.type === 'f_filter' ? activeGrades.f_filter : undefined,
  //   search: searchQuery || undefined,
  //   limit: LIMIT,
  //   order: sortOrder,
  // }), [siteId, activeGrades, searchQuery, sortOrder]);

  const searchFilter = useMemo(() => ({
    site: siteId ?? undefined,
    grade: activeFilter?.type === 'grade' ? activeFilter.value : undefined,
    f_filter: activeFilter?.type === 'f_filter' ? activeFilter.f_filter : undefined,
    search: searchQuery || undefined,
    limit: LIMIT,
    order: sortOrder,
  }), [siteId, activeFilter, searchQuery, sortOrder]);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
    refetch
  } = useEquipmentList(searchFilter);

  //console.log('EP DATA', data)

  const allRows = useMemo(() => {
    return data?.pages.flatMap((page) => page?.data || []) ?? [];
  }, [data]);

  const selectedItem = allRows?.find(item => item.id === selectedId) ?? null;

  const parentRef = useRef();
  const rowVirtualizer = useVirtualizer({
    count: hasNextPage ? allRows.length + 1 : allRows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 52,
    overscan: 10,
  });

  const { ref: loadMoreRef, inView } = useInView();
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // function selectFilter(item) {
  //   setActiveFilter(prev => prev?.value === item.value ? null : item);
  //   setFilterOpen(false);
  // }

  function selectFilter(item) {
    const newParams = new URLSearchParams(searchParams);
    if (currentGrade === item.value) {
      newParams.delete('grade');
    } else {
      newParams.set('grade', item.value);
    }
    setSearchParams(newParams);
    setFilterOpen(false);
  }

  function clearAllFilters() {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('grade');
    setSearchParams(newParams);
    setFilterOpen(false);
  }

  // const toggleGrade = (grade) => {
  //   setActiveGrades(prev =>
  //     prev.includes(grade) ? prev.filter(g => g !== grade) : [...prev, grade]
  //   );
  // };

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
  };

  const handleRefresh = () => {
    setSearchInput('');
    setSearchQuery('');
    refetch();
  };

  const siteName = siteId ?? 'All sites';

  return (
    <div className="bg-[#F9F9FC] min-h-screen">
      <Navbar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      <div className={`transition-all duration-300 pt-14 md:pt-0 ${sidebarOpen ? 'md:ml-64' : 'md:ml-20'}`}>

        {/* HEADER */}
        <div className="p-4 md:p-6 pb-0">
          <div className="text-[#546A81] text-4xl font-bold leading-[66px]">Equipment Health</div>
          <div className="flex font-medium items-center gap-2 text-base text-[#546A81]">
            <span className="hover:cursor-pointer" onClick={() => navigate('/')}>All sites</span>
            <ChevronRight size={16} />
            <span className='hover:cursor-pointer' onClick={() => navigate(`/dashboard/${siteId}`)}>{siteName}</span>
            <ChevronRight size={16} />
            <span>Equipment Health</span>
          </div>

          {/* FILTER BAR */}
          <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Funnel className="w-4 text-[#546A81]" />

              {/* Active grade chips — clicking removes the filter */}
              {/* {activeGrades.map(grade => {
                const colors = GRADE_BADGE_COLORS[grade] ?? {};
                return (
                  <button
                    key={grade}
                    onClick={() => toggleGrade(grade)}
                    className="flex items-center font-semibold text-sm py-1 px-3 gap-1.5 rounded-full"
                    style={{ background: colors.bg, color: colors.text }}
                  >
                    Grade {grade} <X size={11} />
                  </button>
                );
              })} */}
              {activeFilter && (
                <button
                  onClick={() => {
                    const newParams = new URLSearchParams(searchParams);
                    newParams.delete('grade');
                    setSearchParams(newParams);
                  }}
                  className="flex items-center font-semibold text-sm py-1 px-3 gap-1.5 rounded-full"
                  style={{
                    background: GRADE_BADGE_COLORS[activeFilter.value]?.bg ?? '#FEE2E2',
                    color: GRADE_BADGE_COLORS[activeFilter.value]?.text ?? '#DC2626',
                  }}
                >
                  {activeFilter.label} <X size={11} />
                </button>
              )}

              {/* Filter picker */}
              <div id="grade-filter-dropdown" className="relative">
                <button
                  onClick={() => setFilterOpen(prev => !prev)}
                  className="flex items-center gap-1 font-semibold text-sm text-[#546A81] hover:text-[#425D78]"
                >
                  <Plus size={14} /> Filter
                </button>

                {filterOpen && (
                  <div className="absolute left-0 top-8 flex flex-col bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-20 min-w-[130px]">
                    {GRADE_FILTERS.map(item => {
                      const isActive = activeFilter?.value === item.value;
                      const colors = GRADE_BADGE_COLORS[item.value] ?? {};
                      return (
                        <button
                          key={item.value}
                          onClick={() => selectFilter(item)}
                          className="px-4 py-2 text-sm text-left hover:bg-gray-50 flex items-center justify-between gap-4"
                          style={isActive ? { color: colors.text ?? '#DC2626', fontWeight: 700 } : { color: '#6b7280' }}
                        >
                          <span>{item.label}</span>
                          {isActive && <Check className='w-3 h-4 font-bold' />}
                        </button>
                      );
                    })}

                    {/* Clear all only shown when at least 1 active */}
                    {activeFilter > 0 && (
                      <>
                        <div className="h-px bg-gray-100 my-1" />
                        {/* <button
                          onClick={() => {
                            setActiveGrades([]);
                            // setPage(1);
                            setFilterOpen(false);
                          }}
                          className="px-4 py-2 text-xs text-left text-red-400 hover:bg-red-50 hover:text-red-500"
                        >
                          Clear all filters
                        </button> */}
                        <button onClick={clearAllFilters}>
                          Clear all filters
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

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

              <RefreshCcw
                size={15}
                className="cursor-pointer text-[#546A81] hover:rotate-180 transition-transform duration-500"
                onClick={handleRefresh}
              />

              <button onClick={toggleSortOrder} className="flex items-center gap-1 cursor-pointer text-[#546A81] hover:text-blue-600">
                <ArrowDownNarrowWide size={15} className={sortOrder === 'asc' ? 'transition-transform' : 'transition-transform rotate-180 '} />
                <span className="text-xs font-semibold uppercase">{sortOrder}</span>
              </button>
            </div>
          </div>

          {/* ROW COUNT */}
          <div className="mt-3 text-sm text-[#546A81]">
            {isLoading
              ? 'Loading...'
              : (() => {
                const loadedCount = data?.pages?.reduce(
                  (acc, page) => acc + (page?.data?.length || 0),
                  0
                ) || 0;
                const totalCount = data?.pages?.[0]?.meta?.total || 0;
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
                {TABLE_COLS.map(col => (
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
                  minWidth: 'max-content',
                }}
              >
                {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                  const isLoaderRow = virtualRow.index > allRows.length - 1;
                  const row = allRows[virtualRow.index];
                  if (isLoaderRow) {
                    return (
                      <div
                        key="loader"
                        ref={loadMoreRef}
                        style={{
                          position: 'absolute', top: 0, left: 0, width: '100%',
                          minWidth: '100%',
                          transform: `translateY(${virtualRow.start}px)`,
                        }}
                        className="p-4 text-center text-sm text-gray-400"
                      >
                        {hasNextPage ? 'Loading more...' : 'End of results'}
                      </div>
                    );
                  }

                  const isSelected = selectedId === row.id;
                  const gradeColors = GRADE_BADGE_COLORS[row.grade] ?? { bg: '#F0F0F0', text: '#666' };

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
                      <div className={`px-4 text-[13px] text-[#484964] ${TABLE_COLS[0].width} shrink-0`}>{row.id}</div>
                      <div className={`px-4 text-[13px] text-[#484964] ${TABLE_COLS[1].width} shrink-0 truncate`}>{row.equipment}</div>
                      <div className={`px-4 text-[13px] text-[#484964] ${TABLE_COLS[2].width} shrink-0`}>{row.site}</div>
                      <div className={`px-4 text-[13px] text-[#484964] ${TABLE_COLS[3].width} shrink-0`}>{row.state ?? '—'}</div>
                      <div className={`px-4 text-[13px] text-[#484964] ${TABLE_COLS[4].width} shrink-0`}>{row.meas_date}</div>
                      <div className={`px-4 text-[13px] text-[#484964] ${TABLE_COLS[5].width} shrink-0`}>{row.meas_time ?? '—'}</div>
                      <div className={`px-4 text-[13px] text-[#484964] ${TABLE_COLS[6].width} shrink-0 truncate`}>{row.meas_point}</div>
                      <div className={`px-4 text-[13px] text-[#484964] ${TABLE_COLS[7].width} shrink-0`}>{row.bpfo ?? '—'}</div>
                      <div className={`px-4 text-[13px] text-[#484964] ${TABLE_COLS[8].width} shrink-0`}>{row.f0 ?? '—'}</div>
                      <div className={`px-4 text-[13px] text-[#484964] ${TABLE_COLS[9].width} shrink-0`}>{row.ibeta ?? '—'}</div>
                      <div className={`px-4 ${TABLE_COLS[10].width} shrink-0`}>
                        <span
                          className="inline-flex items-center justify-center w-7 h-7 rounded-full font-bold text-[12px]"
                          style={{ background: gradeColors.bg, color: gradeColors.text }}
                        >
                          {row.grade}
                        </span>
                      </div>
                      <div className={`px-4 text-[13px] text-[#484964] ${TABLE_COLS[11].width} shrink-0 truncate`}>
                        {row.when_action
                          ? dayjs(row.when_action).format('DD/MM/YYYY HH:mm')
                          : '—'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* SIDE PANEL — slides in when row is selected */}
          {selectedItem && (
            <SidePanel
              equipment={selectedItem}
              onClose={() => setSelectedId(null)}
              onViewFull={() => navigate(`/graph/${selectedItem.id}`)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
