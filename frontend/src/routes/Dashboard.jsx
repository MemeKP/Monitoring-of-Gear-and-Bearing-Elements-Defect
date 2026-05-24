import React, { useEffect, useState } from 'react'
import Navbar from '../components/Navbar.jsx'
import { ChevronDown, ChevronLeft, Menu, TriangleAlert, X } from "lucide-react";
import mmm from '../assets/img/mmm.jpg'
import mmm2 from '../assets/img/mmm2.jpg'
import mmm3 from '../assets/img/view4.webp'
import clock from '../assets/clock.png'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useDashboardAttention, useDashboardOverdue, useDashboardStats } from '../hooks/useDashboardStats.js';
import { StatisticOverview } from '../components/StatisticOverview.jsx';
import { GRADE_COLORS } from '../constant/gradeConfig.js';
import { AttentionRow } from '../components/AttentionRow.jsx';
import { SITE_IMAGES } from '../constant/siteConfig';
import { useInView } from 'react-intersection-observer';

const Dashboard = () => {
  const FALLBACK_IMAGES = [mmm, mmm2, mmm3];
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { siteId } = useParams();
  const site = siteId ?? 'all';

  // STATES
  // const [attentionFilter, setAttentionFilter] = useState('critical');
  const [overdueFilter, setOverdueFilter] = useState('all');
  const [activeMobileTab, setActiveMobileTab] = useState('attention');
  const siteName = siteId ?? 'All sites';
  const [searchParams, setSearchParams] = useSearchParams()
  const attentionFilter = searchParams.get('filter') || 'critical'

  // infinite scroll
  const { ref, inView } = useInView({ threshold: 0 });

  // STATS
  const stats = useDashboardStats(site);
  const stageBreakdown = stats.data?.stage_breakdown ?? [];

  // OVERDUE 
  const overdue = useDashboardOverdue(site, overdueFilter);
  const overdueData = overdue.data;
  // const overdueItems = overdueData?.items ?? [];
  // const maxDelayLabel = overdueData?.max_delay_label ?? '--';
  // const criticalCount = overdueData?.critical_count ?? 0;
  // const warningCount = overdueData?.warning_count ?? 0;
  const overdueStats = overdue.data?.pages?.[0]?.stats;
  const maxDelayLabel = overdueStats?.max_delay_label ?? '--';
  const criticalCount = overdueStats?.critical_count ?? 0;
  const warningCount = overdueStats?.warning_count ?? 0;
  const overdueCount = overdueStats?.overdue_count ?? 0;
  const overdueItems = overdue.data?.pages?.flatMap(page => Array.isArray(page) ? page : (page.data ?? [])) ?? [];

  // ATTENTION 
  const attention = useDashboardAttention({ site, filter: attentionFilter });
  const attentionItems = attention.data?.pages?.flatMap((page) => page.data || []) ?? [];
  const attentionStats = attention.data?.pages?.[0]?.stats || {
    allStats: 0,
    criticalStats: 0,
    warningStats: 0,
    fMotorStats: 0
  };

  const attentionTotalAll = attentionStats.allStats;
  const criticalAttentionCount = attentionStats.criticalStats;
  const warningAttentionCount = attentionStats.warningStats;
  const fMotorCount = attentionStats.fMotorStats;
  const filteredCount = attention.data?.pages?.[0]?.meta?.total ?? 0;

  // console.log('ATTENTION_PAGES', attention.data?.pages);
  // console.log('ATTENTION_STATS', attentionStats);

  // console.log("OVERDUE COUNT", overdueData)
  // console.log('OVERDUE DATA', overdueData)
  // console.log('OVERDUE ITEMS', overdueItems)
  // console.log('PAGE 0', overdue.data?.pages?.[0]);

  // console.log('ATTENTION', attention?.data)
  // console.log("ATTENTION DATA", attention.data);
  // console.log("FIRST PAGE", attention.data?.pages?.[0]);

  // console.log("FILTER:", attentionFilter);
  // console.log('5555', filteredCount.toLocaleString())

  // INFINITE SCROLL HELPER
  useEffect(() => {
    if (inView && attention.hasNextPage && !attention.isFetchingNextPage) {
      attention.fetchNextPage();
    }
  }, [
    inView,
    attention.hasNextPage,
    attention.isFetchingNextPage,
  ]);

  const { ref: overdueRef, inView: overdueInView } = useInView({ threshold: 0 });

  useEffect(() => {
    if (overdueInView && overdue.hasNextPage && !overdue.isFetchingNextPage) {
      overdue.fetchNextPage();
    }
  }, [overdueInView, overdue.hasNextPage, overdue.isFetchingNextPage]);

  const handleSetFilter = (newFilter) => {
    const newParams = new URLSearchParams(searchParams)
    if (newFilter === 'all') {
      newParams.delete('filter')
    } else {
      newParams.set('filter', newFilter)
    }
    setSearchParams(newParams)
  }

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
            <span className="text-[#546A81]">Dashboard</span>
          </div>
        </div>

        {/* Content grid */}
        <div className="p-4 md:p-6 space-y-6">
          {/* Row 1: Stats + Stage Breakdown + Images */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Statistic Overview Card */}
            <StatisticOverview
              data={stats.data}
              isLoading={stats.isLoading}
              isError={stats.isError}
              error={stats.error} />

            {/* Stage Breakdown Card */}
            <div className="md:col-span-1 lg:col-span-1 bg-white rounded-2xl p-6 shadow-[10px_10px_20px_0px_rgba(191,202,228,1.00)] hover:shadow-[-10px_-10px_20px_0px_rgba(255,255,255,0.55)] transition">
              <h3 className="text-gray-600 font-semibold text-xl mb-2">
                Stage Breakdown
              </h3>
              <p className="text-gray-400 text-sm mb-6">Distribution across all stages</p>

              {stats.isLoading ? (
                <StageSkeleton />
              ) : stats.isError ? (
                <ErrorBox message={stats.error.message} />
              ) : (
                <div className="space-y-3">
                  {stageBreakdown.map(item => {
                    const colors = GRADE_COLORS[item.grade] ?? { bar: 'bg-gray-400', text: 'text-gray-400' };
                    return (
                      <div key={item.grade}>
                        <div className="flex justify-between mb-1">
                          <span className="text-xs font-medium text-gray-700">Grade {item.grade}</span>
                          <span className="text-xs font-semibold text-gray-700">
                            {item.percentage.toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`${colors.bar} h-2 rounded-full transition-all duration-500`}
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            {/* Images 2 on top, 1 full width on bottom */}
            <div className="grid grid-cols-2 gap-3 h-full">
              {(SITE_IMAGES[siteId] ?? FALLBACK_IMAGES).map((img, i) => (
                <div
                  key={i}
                  className={`${i === 2 ? 'col-span-2' : 'col-span-1'} rounded-2xl overflow-hidden shadow-[10px_10px_20px_0px_rgba(191,202,228,1.00)] hover:shadow-[-10px_-10px_20px_0px_rgba(255,255,255,0.55)] transition h-40`}
                >
                  <img
                    src={img}
                    alt={`${siteId ?? 'Site'} image ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Machines requiring attention */}
          {/* TAB (mobile) */}
          <div className="flex lg:hidden bg-gray-100 p-1.5 rounded-xl mb-6">
            <button
              onClick={() => setActiveMobileTab('attention')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-lg transition-all duration-200 ${activeMobileTab === 'attention'
                ? 'bg-white text-[#546A81] shadow-sm'
                : 'text-gray-400 hover:text-[#546A81]'
                }`}
            >
              Attention
              <span className={`text-xs px-2 py-0.5 rounded-full transition-colors ${activeMobileTab === 'attention' ? 'bg-[#ffe5e5] text-red-500' : 'bg-gray-200 text-gray-500'
                }`}>
                {filteredCount || 0}
              </span>
            </button>
            <button
              onClick={() => setActiveMobileTab('overdue')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-lg transition-all duration-200 ${activeMobileTab === 'overdue'
                ? 'bg-white text-red-500 shadow-sm'
                : 'text-gray-400 hover:text-red-400'
                }`}
            >
              Overdue
              <span className={`text-xs px-2 py-0.5 rounded-full transition-colors ${activeMobileTab === 'overdue' ? 'bg-red-100 text-red-600' : 'bg-gray-200 text-gray-500'
                }`}>
                {/* {overdueItems?.overdue_count ?? 0} */}
                {overdue.isLoading
                  ? '...'
                  : `${overdueCount}`}
              </span>
            </button>
          </div>

          {/* Grid: Attention (2 cols) + Overdue (1 col) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Attention Column (spans 2) */}
            <div className={`${activeMobileTab === 'attention' ? 'block' : 'hidden'} lg:block lg:col-span-2 bg-[#f4f7fa] rounded-2xl p-6`}>
              {/* Header & Filter */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-6 gap-4 sm:gap-0">
                <div>
                  <h3 className="text-[#546A81] font-bold text-xl">
                    Machines requiring attention
                  </h3>
                  {/* <p className="text-xs text-gray-400 mt-1">
                    {attention.isLoading
                      ? 'Loading...'
                      : `Showing ${filteredCount.toLocaleString()} machines`}
                  </p> */}
                </div>

                {/* Desktop: Toggle Buttons */}
                <div className="hidden sm:flex items-center gap-3">
                  <button
                    onClick={() => handleSetFilter(attentionFilter === 'Critical' ? 'all' : 'Critical')}
                    className={`px-5 py-1.5 font-medium rounded-full text-sm shadow-sm transition ${attentionFilter === 'Critical'
                      ? 'bg-[#ff7a7a] text-white'
                      : 'bg-gray-100 text-gray-400 border border-gray-200 hover:bg-gray-200'
                      }`}
                  >
                    F
                  </button>
                  <button
                    onClick={() => handleSetFilter(attentionFilter === 'f_motor' ? 'all' : 'f_motor')}
                    className={`px-5 py-1.5 font-medium rounded-full text-sm shadow-sm transition ${attentionFilter === 'f_motor'
                      ? 'bg-[#ff7a7a] text-white'
                      : 'bg-gray-100 text-gray-400 border border-gray-200 hover:bg-gray-200'
                      }`}
                  >
                    F Motor
                  </button>
                  <button
                    onClick={() => handleSetFilter(attentionFilter === 'Warning' ? 'all' : 'Warning')}
                    className={`px-5 py-1.5 font-medium rounded-full text-sm flex items-center gap-2 transition ${attentionFilter === 'Warning'
                      ? 'bg-yellow-400 text-white'
                      : 'bg-gray-100 text-gray-400 border border-gray-200 hover:bg-gray-200'
                      }`}
                  >
                    E
                  </button>
                </div>

                {/* Mobile: Dropdown */}
                <div className="block sm:hidden w-full relative">
                  <select
                    value={attentionFilter}
                    onChange={(e) => handleSetFilter(e.target.value)}
                    className="w-full pl-4 pr-10 py-3 bg-white border border-gray-200 rounded-xl text-sm text-[#546A81] font-semibold hover:border-gray-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500/40 appearance-none transition-all duration-200 cursor-pointer"
                  >
                    <option value="all">All</option>
                    <option value="Critical">Critical (F)</option>
                    <option value="f_motor">F Motor</option>
                    <option value="Warning">Warning (E)</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400">
                    <ChevronDown className='w-5' color="#b5b5b5" />
                  </div>
                </div>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-2 mb-6">
                <div className="bg-[#E6F3FF] rounded-xl py-3 flex flex-col items-center">
                  <span className="text-[#990000] font-bold text-2xl">{criticalAttentionCount}</span>
                  <span className="text-[10px] text-gray-400 mt-1 font-semibold">Critical (F)</span>
                </div>
                <div className="bg-[#E6F3FF] rounded-xl py-3 flex flex-col items-center">
                  <span className="text-[#546A81] font-bold text-2xl">{fMotorCount}</span>
                  <span className="text-[10px] text-gray-400 mt-1 font-semibold">F Motor</span>
                </div>
                <div className="bg-[#E6F3FF] rounded-xl py-3 flex flex-col items-center">
                  <span className="text-[#FFCB05] font-bold text-2xl">{warningAttentionCount}</span>
                  <span className="text-[10px] text-gray-400 mt-1 font-semibold">Warning (E)</span>
                </div>
              </div>

              {/* List */}
              <div className="space-y-4 overflow-y-auto pr-2 h-full">
                {attention.isLoading ? (
                  [1, 2, 3, 4].map(i => <AttentionRowSkeleton key={i} />)
                ) : attention.isError ? (
                  <ErrorBox message={attention.error?.message || "Something went wrong"} />
                ) : attentionItems.length === 0 ? (
                  <p className="text-center text-gray-400 py-8">No machines requiring attention</p>
                ) : (
                  <>
                    {attentionItems.map(item => (
                      <AttentionRow
                        key={item.id}
                        item={item}
                        onClick={() => navigate(`/dashboard/${siteId}/equipment/${item.id}`)}
                      />
                    ))}
                    <div ref={ref} className="py-4 text-center flex justify-center items-center">
                      {attention.isFetchingNextPage ? (
                        <span className="text-sm text-gray-400 animate-pulse">Loading more machines...</span>
                      ) : attention.hasNextPage ? (
                        <span className="text-sm text-transparent">Scroll for more</span>
                      ) : (
                        <span className="text-sm text-gray-400">All machines loaded.</span>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Overdue Column (spans 1) */}
            <div className={`${activeMobileTab === 'overdue' ? 'block' : 'hidden'} lg:block lg:col-span-1 bg-white rounded-2xl p-6 shadow-sm border border-gray-100`}>
              {/* Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-[#ffe5e5] p-2 rounded-xl border border-red-500 text-red-500 flex items-center justify-center">
                  <img src={clock} alt="clock icon" className='w-6' />
                </div>
                <div>
                  <h3 className="text-[#546A81] font-bold text-lg leading-tight">
                    Health Checkup Overdue
                  </h3>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    {overdue.isLoading
                      ? 'Loading...'
                      : `Showing ${overdueCount} machines overdue.`}
                  </p>
                </div>
              </div>

              {overdue.isLoading ? (
                <OverdueSkeleton />
              ) : overdue.isError ? (
                <ErrorBox message={overdue.error.message} />
              ) : (
                <>
                  {/* Summary boxes */}
                  <div className="grid grid-cols-3 gap-2 mb-6">
                    <div className="bg-[#E6F3FF] rounded-xl py-3 flex flex-col items-center">
                      <span className="text-[#990000] font-bold text-2xl">{criticalCount}</span>
                      <span className="text-[10px] text-gray-400 mt-1 font-semibold">Critical (F)</span>
                    </div>
                    <div className="bg-[#E6F3FF] rounded-xl py-3 flex flex-col items-center">
                      <span className="text-[#FFCB05] font-bold text-2xl">{warningCount}</span>
                      <span className="text-[10px] text-gray-400 mt-1 font-semibold">Warning (E)</span>
                    </div>
                    <div className="bg-[#E6F3FF] rounded-xl py-3 flex flex-col items-center">
                      <span className="text-[#546A81] font-bold text-2xl">{maxDelayLabel}</span>
                      <span className="text-[10px] text-gray-400 mt-1 font-semibold">Max delay</span>
                    </div>
                  </div>

                  {/* Dropdown */}
                  <div className="w-full relative mb-6 sm:mb-4">
                    <select
                      value={overdueFilter}
                      onChange={(e) => setOverdueFilter(e.target.value)}
                      className="w-full pl-4 pr-10 py-3 bg-white border border-gray-200 rounded-xl text-sm text-[#546A81] font-semibold hover:border-gray-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500/40 appearance-none transition-all duration-200 cursor-pointer"
                    >
                      <option value="all">All</option>
                      <option value="f">F</option>
                      <option value="f_motor">F(Motor)</option>
                      <option value="e">E</option>
                      <option value="d">D</option>
                      <option value="c">C</option>
                      <option value="b">B</option>
                      <option value="a">A</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400">
                      <ChevronDown className="w-5" color="#b5b5b5" />
                    </div>
                  </div>

                  {/* Overdue list */}
                  {/* <p className="text-[11px] text-gray-400 mt-0.5">
                    {overdue.isLoading
                      ? 'Loading...'
                      : `Showing ${overdueCount} machines overdue.`}
                  </p> */}

                  {/* Overdue list */}
                  <div className="space-y-4">
                    {overdueItems.map((item, i) => {
                      const gradeTextColor = GRADE_COLORS[item.grade]?.text || 'text-gray-500';
                      return (
                        <div key={item.id ?? i} className="flex items-start justify-between border-b border-gray-100 pb-3 last:border-0">
                          <div>
                            <h4 className="text-sm font-bold text-[#546A81]">{item.equipment}</h4>
                            <p className="text-[10px] text-[#A2ADB6] font-medium mt-1">
                              {item.site} · {item.meas_point} ·{' '}
                              <span className={`font-bold ${gradeTextColor}`}>{item.grade}</span>
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-bold text-[#546A81]">{item.days_since_check}</span>
                            <span className="text-[10px] text-gray-400 ml-1">days</span>
                          </div>
                        </div>
                      );
                    })}

                    {/* Infinite scroll trigger */}
                    <div ref={overdueRef} className="h-1" />
                    {overdue.isFetchingNextPage && (
                      <p className="text-center text-xs text-gray-400 py-2">Loading more...</p>
                    )}
                    {!overdue.hasNextPage && overdueItems.length > 0 && (
                      <p className="text-center text-xs text-gray-400 py-2">All machines loaded</p>
                    )}
                    {overdueItems.length === 0 && (
                      <p className="text-center text-xs text-gray-400 py-2">No machines found</p>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>

  )
}

export default Dashboard

// SKELETON LOADER 
function StatsSkeleton() {
  return (
    <div className="flex gap-4 animate-pulse">
      <div className="w-40 h-40 rounded-full bg-gray-200 shrink-0" />
      <div className="flex-1 space-y-4 pt-4">
        {[1, 2, 3].map(i => <div key={i} className="h-8 bg-gray-200 rounded" />)}
      </div>
    </div>
  );
}

function StageSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      {[1, 2, 3, 4, 5, 6].map(i => (
        <div key={i}>
          <div className="h-3 bg-gray-200 rounded mb-2 w-1/3" />
          <div className="h-2 bg-gray-200 rounded-full w-full" />
        </div>
      ))}
    </div>
  );
}

function AttentionRowSkeleton() {
  return (
    <div className="animate-pulse bg-white rounded-xl p-4 h-[101px]">
      <div className="h-3 bg-gray-200 rounded w-2/3 mb-2" />
      <div className="h-2 bg-gray-200 rounded w-1/3 mb-4" />
      <div className="h-1 bg-gray-200 rounded-full w-full" />
    </div>
  );
}

function OverdueSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="grid grid-cols-3 gap-2 mb-6">
        {[1, 2, 3].map(i => <div key={i} className="h-16 bg-gray-200 rounded-xl" />)}
      </div>
      {[1, 2, 3, 4].map(i => <div key={i} className="h-10 bg-gray-200 rounded" />)}
    </div>
  );
}

function ErrorBox({ message }) {
  return (
    <div className="rounded-xl p-4 bg-red-50 border border-red-200">
      <p className="text-xs text-red-500 font-medium">Failed to load: {message}</p>
    </div>
  );
}
