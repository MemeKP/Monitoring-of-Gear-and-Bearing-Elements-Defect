import React, { useEffect, useMemo, useRef, useState } from 'react'
import Navbar from '../components/Navbar';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowDownNarrowWide, ChevronRight, Funnel, Plus, RefreshCcw, Search } from 'lucide-react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { GRADE_BADGE_COLORS, GRADE_FILTERS } from '../constant/gradeConfig';
import MachineCard from '../components/MachineCard';

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

    const parentRef = useRef()

    // const allRows = useMemo(() => {
    //     return data?.pages.flatMap((page) => page?.data || []) ?? [];
    // }, [data]);

    // const rowVirtualizer = useVirtualizer({
    //     count: hasNextPage ? allRows.length + 1 : allRows.length,
    //     getScrollElement: () => parentRef.current,
    //     estimateSize: () => 52,
    //     overscan: 10,
    // });

    // const { ref: loadMoreRef, inView } = useInView();
    // useEffect(() => {
    //     if (inView && hasNextPage && !isFetchingNextPage) {
    //         fetchNextPage();
    //     }
    // }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

    const toggleGrade = (grade) => {
        setActiveGrades(prev =>
            prev.includes(grade) ? prev.filter(g => g !== grade) : [...prev, grade]
        );
    };

    const toggleSortOrder = () => {
        setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
    };

    const handleRefresh = () => {
        setSearchInput('');
        setSearchQuery('');
        // refetch();
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
                    <div className="text-[#546A81] text-4xl font-bold leading-[66px]">Machine Index kid maii aok;-;</div>
                    <div className="flex font-medium items-center gap-2 text-base text-[#546A81]">
                        <span className="hover:cursor-pointer" onClick={() => navigate('/')}>All sites</span>
                        <ChevronRight size={16} />
                        <span className='hover:cursor-pointer' onClick={() => navigate(`/dashboard/${siteId}`)}>{siteName}</span>
                        <ChevronRight size={16} />
                        <span>Machine Index</span>
                    </div>
                </div>

                {/* FILTER AND SEARCH BAR */}
                <div className="flex items-center justify-between mt-3 flex-wrap gap-2 pr-4">
                    <div className="flex items-center gap-2 flex-wrap">
                        {/* filter */}
                    </div>
                    {/* search*/}
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
                        <button onClick={toggleSortOrder} className="flex items-center gap-1 cursor-pointer text-[#546A81] hover:text-blue-600">
                            <ArrowDownNarrowWide size={15} className={sortOrder === 'asc' ? 'transition-transform' : 'transition-transform rotate-180 '} />
                            <span className="text-xs font-semibold uppercase">{sortOrder}</span>
                        </button>
                    </div>
                </div>
                {/* ROW COUNT */}
                {/* <div className="mt-3 text-sm text-[#546A81]">
                        {isLoading
                            ? 'Loading...'
                            : (() => {
                                const loadedCount = data?.pages?.reduce(
                                    (acc, page) => acc + (page?.data?.length || 0),
                                    0
                                ) || 0;
                                const totalCount = data?.pages?.[0]?.meta?.total || 0;
                                return `Showing ${loadedCount.toLocaleString()} of ${totalCount.toLocaleString()} results`;
                            })()
                        }
                    </div> */}
                <div className="p-4 mt-3 text-sm text-[#546A81]">
                    showing <span className='font-semibold'>127</span> of 127 machines
                </div>

                {/* CONTENT */}
                <MachineCard/>
            </div>



        </div>
    )
}

export default MachineIndexPage