import React, { useEffect, useMemo, useRef, useState } from 'react'
import Navbar from '../components/Navbar';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowDownNarrowWide, ChevronRight, Funnel, Loader2, Plus, RefreshCcw, Search } from 'lucide-react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { GRADE_BADGE_COLORS, GRADE_FILTERS } from '../constant/gradeConfig';
import MachineCard from '../components/MachineCard';
import { useEquipmentIndex } from '../hooks/useEquipment';
import { useInView } from 'react-intersection-observer';

const MachineIndexPage = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const [searchInput, setSearchInput] = useState('')
    const [searchQuery, setSearchQuery] = useState('')
    const [activeGrades, setActiveGrades] = useState([])
    const [sortOrder, setSortOrder] = useState('desc')
    const [filterOpen, setFilterOpen] = useState(false)

    const [open, setOpen] = useState(false)
    const navigate = useNavigate()
    const { siteId } = useParams()
    const siteName = siteId ?? 'All sites';

    const {
        data,
        isLoading,
        isError,
        error,
        refetch,
        fetchNextPage,
        isFetchingNextPage,
        hasNextPage
    } = useEquipmentIndex(siteId, searchQuery)

    const parentRef = useRef()

    const machines = useMemo(() => {
        if (!data?.pages) return [];
        return data.pages.flatMap((page) => {
            if (page && Array.isArray(page.data)) {
                return page.data;
            }
            return [];
        });
    }, [data]);

    const filtered = useMemo(() => {
        const rows = Array.isArray(machines) ? machines : [];
        if (rows.length === 0) return [];
        return [...rows].sort((a, b) => {
            const ai = GRADE_FILTERS.indexOf(a?.grade);
            const bi = GRADE_FILTERS.indexOf(b?.grade);
            return sortOrder === 'desc' ? ai - bi : bi - ai;
        });
    }, [machines, sortOrder, activeGrades]);

    // const allRows = useMemo(() => {
    //     return data?.pages.flatMap((page) => page?.data || []) ?? [];
    // }, [data]);

    const totalCount = hasNextPage ? filtered.length + 1 : filtered.length;

    const totalMachines = data?.pages?.[0]?.meta?.total || 0;
    const rowVirtualizer = useVirtualizer({
        count: totalCount,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 72,
        overscan: 8,
    });

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

    const toggleSortOrder = () => {
        setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
    };

    const handleRefresh = () => {
        setSearchInput('');
        setSearchQuery('');
        refetch();
    };

    return (
        <div className='bg-[#F9F9FC] min-h-screen'>
            {/* NAVBAR BAR */}
            <Navbar
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
                mobileMenuOpen={mobileMenuOpen}
                setMobileMenuOpen={setMobileMenuOpen}
            />

            {/* CONTENT */}
            <div className={`transition-all duration-300 pt-14 md:pt-0 ${sidebarOpen ? "md:ml-60" : "md:ml-20"
                }`}>
                {/* Header */}
                <div className="p-4 md:p-6 pb-0">
                    <div className="text-[#546A81] text-4xl font-bold leading-[66px]">Machine Index</div>
                    <div className="flex font-medium items-center gap-2 text-base text-[#546A81]">
                        <span className="hover:cursor-pointer" onClick={() => navigate('/')}>All sites</span>
                        <ChevronRight size={16} />
                        <span className='hover:cursor-pointer' onClick={() => navigate(`/dashboard/${siteId}`)}>{siteName}</span>
                        <ChevronRight size={16} />
                        <span>Machine Index</span>
                    </div>
                </div>

                {/* FILTER AND SEARCH BAR */}
                <div className="flex ml-4 items-center justify-between mt-1 flex-wrap gap-2 px-4">
                    <div className="flex flex-row gap-x-3 items-center">
                        {/* <button onClick={handleRefresh} className="text-[#546A81] hover:text-blue-600">
                            <RefreshCcw size={15} />
                        </button> */}
                        <div className="flex items-center bg-[#DDE1E6] rounded-full px-4 py-1.5 gap-2">
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                className="bg-transparent outline-none text-sm text-[#546A81] w-36 placeholder-gray-400"
                            />
                            <Search size={15} className="text-[#546A81]" />
                        </div>
                        {/* <button onClick={() => setSortOrder(p => p === 'desc' ? 'asc' : 'desc')} className="flex items-center gap-1 cursor-pointer text-[#546A81] hover:text-blue-600">
                            <ArrowDownNarrowWide size={15} className={sortOrder === 'asc' ? '' : 'rotate-180'} />
                            <span className="text-xs font-semibold uppercase">{sortOrder}</span>
                        </button> */}
                    </div>
                </div>

                {/* Row count */}
                <div className="px-4 mt-3 mb-8 ml-4 text-sm text-[#546A81]">
                    {isLoading
                        ? 'Loading...'
                        : <>
                            <span>Showing </span>
                            <span className="font-semibold">{filtered.length}</span> of
                            <span className='font-semibold'> {totalMachines} </span>
                            machines
                        </>
                    }
                </div>

                {/* List */}
                {isError && <div className="px-4 mt-4 text-sm text-red-500">{error?.message}</div>}

                {!isError && (
                    <div ref={parentRef} className="mt-3 flex-1 overflow-y-auto relative">
                        {isLoading ? (
                            Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} className="mx-4 mb-3 h-14 rounded-2xl bg-[#EEEEF2] animate-pulse" />
                            ))
                        ) : filtered.length === 0 ? (
                            <div className="px-4 text-sm text-[#546A81]">No machines match your filters.</div>
                        ) : (
                            <div style={{ height: rowVirtualizer.getTotalSize(), position: 'relative' }}>
                                {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                                    const isLoaderRow = virtualRow.index > filtered.length - 1;

                                    return (
                                        <div
                                            key={virtualRow.key}
                                            data-index={virtualRow.index}
                                            ref={rowVirtualizer.measureElement}
                                            style={{
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                width: '100%',
                                                transform: `translateY(${virtualRow.start}px)`,
                                            }}
                                        >
                                            <div className="pb-3">
                                                {isLoaderRow ? (
                                                    <div ref={loadMoreRef} className="flex justify-center items-center h-14 text-[#546A81]">
                                                        {hasNextPage ? <Loader2 className="animate-spin" size={24} /> : 'No more data'}
                                                    </div>
                                                ) : (
                                                    <MachineCard item={filtered[virtualRow.index]} />
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

export default MachineIndexPage