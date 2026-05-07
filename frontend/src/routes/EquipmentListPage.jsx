import { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronRight, Funnel, X, Plus, Search, RefreshCcw, ArrowDownNarrowWide } from 'lucide-react';
import { useEquipmentList } from '../hooks/useEquipment';
import SidePanel from '../components/SidePanel'
import Navbar from '../components/Navbar'
import { GRADE_BADGE_COLORS, GRADE_FILTERS, TABLE_COLS } from '../constant/gradeConfig';


export default function EquipmentListPage() {
  const navigate = useNavigate();
  const { siteId } = useParams();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [activeGrades, setActiveGrades] = useState([]);
  const [page, setPage] = useState(1);
  const [sortOrder, setSortOrder] = useState('desc');
  const LIMIT = 20;

  // Build filters object — changes trigger a new query key → refetch
  const filters = useMemo(() => ({
    site: siteId ?? undefined,
    grade: activeGrades.length ? activeGrades.join(',') : undefined,
    search: search || undefined,
    page,
    limit: LIMIT,
    order: sortOrder,
  }), [siteId, activeGrades, search, page, sortOrder]);

  const { data, isLoading, isError, error, refetch } = useEquipmentList(filters);

  console.log('DATA', data)

  const meta = data?.meta ?? {};
   const items = data?.data ?? [];
  const selectedItem = items?.find(item => item.id === selectedId) ?? null;
  console.log('META', meta)
   // const items = data?.data ?? [];
  // Grade chip toggle
  const toggleGrade = (grade) => {
    setActiveGrades(prev =>
      prev.includes(grade) ? prev.filter(g => g !== grade) : [...prev, grade]
    );
    setPage(1);
  };

  // Search: fire on Enter or button click
  const handleSearch = () => {
    setSearch(searchInput);
    setPage(1);
  };

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
    setPage(1);
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
            <span>{siteName}</span>
            <ChevronRight size={16} />
            <span>Equipment Health</span>
          </div>

          {/* FILTER BAR */}
          <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Funnel className="w-4 text-[#546A81]" />

              {/* Active grade chips */}
              {activeGrades.map(grade => {
                const colors = GRADE_BADGE_COLORS[grade] ?? {};
                return (
                  <button
                    key={grade}
                    onClick={() => toggleGrade(grade)}
                    className="flex items-center font-semibold text-sm py-1 px-3 gap-2 rounded-full cursor-pointer"
                    style={{ background: colors.bg, color: colors.text }}
                  >
                    {grade} Grade <X size={12} />
                  </button>
                );
              })}

              {/* Grade filter picker */}
              <div className="relative group">
                <button className="flex items-center gap-1 font-semibold text-sm text-[#546A81]">
                  <Plus size={14} /> Filter
                </button>
                {/* Dropdown */}
                <div className="absolute left-0 top-7 hidden group-focus-within:flex flex-col bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-20 min-w-[120px]">
                  {GRADE_FILTERS.map(grade => (
                    <button
                      key={grade}
                      onClick={() => toggleGrade(grade)}
                      className={`px-4 py-2 text-sm text-left hover:bg-gray-50 flex items-center justify-between ${activeGrades.includes(grade) ? 'font-bold text-[#546A81]' : 'text-gray-600'
                        }`}
                    >
                      Grade {grade}
                      {activeGrades.includes(grade) && <span className="text-xs">✓</span>}
                    </button>
                  ))}
                </div>
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
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  className="bg-transparent outline-none text-sm text-[#546A81] w-36 placeholder-gray-400"
                />
                <Search size={15} className="cursor-pointer text-[#546A81]" onClick={handleSearch} />
              </div>
              <RefreshCcw
                size={15}
                className="cursor-pointer text-[#546A81] hover:rotate-180 transition-transform duration-500"
                onClick={() => {
                  setPage(1);
                  refetch();
                }}
              />
              <button onClick={toggleSortOrder} className="flex items-center gap-1 cursor-pointer text-[#546A81] hover:text-blue-600">
              <ArrowDownNarrowWide size={15} className={sortOrder === 'asc' ? 'rotate-180 transition-transform' : 'transition-transform'} />
              <span className="text-xs font-semibold uppercase">{sortOrder}</span>
            </button>
            </div>
          </div>

          {/* ROW COUNT */}
          <div className="mt-3 text-sm text-[#546A81]">
            {isLoading
              ? 'Loading...'
              : `Showing ${items.length} from ${meta.total ?? 0} results`}
          </div>
        </div>

        {/* TABLE + SIDE PANEL */}
        <div className="flex overflow-hidden">
          {/* Scrollable table */}
          <div className="flex-1 overflow-x-auto min-w-0">
            {isError ? (
              <div className="p-6">
                <div className="rounded-xl p-4 bg-red-50 border border-red-200">
                  <p className="text-sm text-red-600 font-medium">
                    Failed to load equipment: {error.message}
                  </p>
                </div>
              </div>
            ) : (
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-[#EEEEF2] bg-[#F9F9FC]">
                    {TABLE_COLS.map(col => (
                      <th
                        key={col.key}
                        className="px-4 py-3 text-left text-[12px] font-semibold text-[#484964] whitespace-nowrap"
                      >
                        {col.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    // Skeleton rows
                    Array.from({ length: 8 }).map((_, i) => (
                      <tr key={i} className="border-b border-[#EEEEF2] animate-pulse">
                        {TABLE_COLS.map(col => (
                          <td key={col.key} className="px-4 py-3">
                            <div className="h-3 bg-gray-200 rounded w-3/4" />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : data.length === 0 ? (
                    <tr>
                      <td colSpan={TABLE_COLS.length} className="text-center py-12 text-gray-400 text-sm">
                        No equipment found
                      </td>
                    </tr>
                  ) : (
                    items.map(row => {
                      const isSelected = selectedId === row.id;
                      const gradeColors = GRADE_BADGE_COLORS[row.grade] ?? { bg: '#F0F0F0', text: '#666' };
                      return (
                        <tr
                          key={row.id}
                          onClick={() => setSelectedId(isSelected ? null : row.id)}
                          className={`border-b border-[#EEEEF2] cursor-pointer transition-colors ${isSelected ? 'bg-[#EEF3FB]' : 'hover:bg-[#F3F6FB]'
                            }`}
                        >
                          <td className="px-4 py-3 text-[13px] text-[#484964]">{row.id}</td>
                          <td className="px-4 py-3 text-[13px] text-[#484964] max-w-[200px] whitespace-normal leading-snug">
                            {row.equipment}
                          </td>
                          <td className="px-4 py-3 text-[13px] text-[#484964] whitespace-nowrap">{row.site}</td>
                          <td className="px-4 py-3 text-[13px] text-[#484964]">{row.state ?? '—'}</td>
                          <td className="px-4 py-3 text-[13px] text-[#484964] whitespace-nowrap">{row.meas_date}</td>
                          <td className="px-4 py-3 text-[13px] text-[#484964]">{row.meas_time ?? '—'}</td>
                          <td className="px-4 py-3 text-[13px] text-[#484964] whitespace-nowrap">{row.meas_point}</td>
                          <td className="px-4 py-3 text-[13px] text-[#484964]">{row.bpfo ?? '—'}</td>
                          <td className="px-4 py-3 text-[13px] text-[#484964]">{row.f0 ?? '—'}</td>
                          <td className="px-4 py-3 text-[13px] text-[#484964]">{row.ibeta ?? '—'}</td>
                          <td className="px-4 py-3 text-[13px]">
                            <span
                              className="inline-flex items-center justify-center w-7 h-7 rounded-full font-bold text-[13px]"
                              style={{ background: gradeColors.bg, color: gradeColors.text }}
                            >
                              {row.grade}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-[13px] text-[#484964] whitespace-nowrap">
                            {row.when_action ?? '—'}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            )}

            {/* PAGINATION */}
            {!isLoading && meta.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 py-4">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                  className="px-3 py-1 rounded-lg text-sm text-[#546A81] disabled:opacity-40 hover:bg-gray-100"
                >
                  ← Prev
                </button>
                <span className="text-sm text-[#546A81]">
                  Page {meta.page} of {meta.totalPages}
                </span>
                <button
                  disabled={page === meta.totalPages}
                  onClick={() => setPage(p => p + 1)}
                  className="px-3 py-1 rounded-lg text-sm text-[#546A81] disabled:opacity-40 hover:bg-gray-100"
                >
                  Next →
                </button>
              </div>
            )}
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