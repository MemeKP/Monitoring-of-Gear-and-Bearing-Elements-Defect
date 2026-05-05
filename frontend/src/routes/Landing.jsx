import React from 'react'
import { useState } from 'react';
import { SITES } from '../mock/SITES';
import ThaiMap from '../components/ThaiMap';
import logo from '../assets/logo.png';
import { useNavigate } from 'react-router-dom';
import { LiquidGlassButton, SiteCard, TransparentCard } from '../components/SiteSelector';
import Dashboard from './Dashboard';
import { useSites } from '../hooks/useSites';

const SiteCardSkeleton = () => (
    <div className="relative w-full group mt-2 ml-2 animate-pulse">
        <div className="absolute -top-[8px] -left-[8px] w-full h-[107px] rounded-[15px] bg-slate-200/50 dark:bg-slate-700/50 z-0" />
        <div className="relative z-10 w-full h-[107px] rounded-[15px] bg-slate-300/40 dark:bg-slate-600/40 border border-white/20 p-[16px_20px] flex flex-col justify-center">
            {/* Title Placeholder */}
            <div className="flex justify-between items-center mb-4">
                <div className="h-5 w-32 bg-slate-400/40 rounded"></div>
                <div className="h-6 w-12 bg-slate-400/40 rounded-full"></div>
            </div>
            {/* Bar Placeholders */}
            <div className="flex flex-col gap-2 mt-1">
                <div className="h-3 w-3/4 bg-slate-400/40 rounded"></div>
                <div className="h-3 w-1/2 bg-slate-400/40 rounded"></div>
            </div>
        </div>
    </div>
);

const Landing = () => {
    const [hoveredSite, setHoveredSite] = useState(null);
    const [activePage, setActivePage] = useState("map");
    const { sites, loading, error } = useSites();
    const navigate = useNavigate();
    const [activeSite, setActiveSite] = useState(null);
    const handleView = siteId => {
        setActiveSite(SITES.find(s => s.id === siteId));
        setActivePage("detail");
    };

    return (
        <>
            {/* HEADER */}
            <div className='flex flex-row items-center sm:p-4 mt-2 w-full'>
                <img src={logo} className='w-12 ml-4 sm:w-12 pr-2 sm:pr-3 flex-shrink-0' alt="logo" />
                <div className="flex flex-col min-w-0">
                    <div className="text-slate-500 text-lg sm:text-xl font-bold tracking-tight">
                        EGAT<span className='font-normal'>for</span>ALL
                    </div>
                    <div className="text-slate-400 text-xs sm:text-sm -mt-0.5 sm:-mt-1 leading-tight sm:leading-normal line-clamp-1 sm:line-clamp-none">
                        Monitoring of Gear and Bearing Elements Defect
                    </div>
                </div>
            </div>

            {/* LEFT & RIGHT SIDE PANEL */}
            <div className='col-span-2'>
                <div className="grid grid-cols-1 sm:grid-cols-[2fr_1fr] gap-6">

                    {/* left: MAP */}
                    <div className="hidden sm:flex flex-col justify-center items-center p-4">
                        {loading ? (
                            // skeleton loading
                            <div className="w-full max-w-md h-[400px] bg-slate-200/50 rounded-xl animate-pulse flex items-center justify-center">
                                <span className="text-slate-400 font-medium">Loading Map...</span>
                            </div>
                        ) : error ? (
                            <div className="text-red-400">Error loading map data</div>
                        ) : (
                            <ThaiMap
                                sites={sites}
                                hoveredSite={hoveredSite}
                                onHover={setHoveredSite}
                            // onSiteClick={(id) => navigate(`/dashboard?site=${id}`)}      
                            />
                        )}
                    </div>

                    {/* right: SITE LISTCARD */}
                    <div className="flex flex-col h-full p-4">
                        <h1 className="text-[18px] font-semibold text-slate-700 mb-4 pb-2">
                            All Sites
                        </h1>
                        <div className="flex-1 overflow-y-auto pr-2">

                            {loading ? (
                                // hardcode count site -> can change to count from database
                                <>
                                    <div className="mb-4"><SiteCardSkeleton /></div>
                                    <div className="mb-4"><SiteCardSkeleton /></div>
                                    <div className="mb-4"><SiteCardSkeleton /></div>
                                </>
                            ) : error ? (
                                <div className="text-red-400 p-4 bg-red-50 rounded-lg">Failed to load sites.</div>
                            ) : (
                                <>
                                    {sites.map(site => (
                                        <div className='mb-4' key={site.id}>
                                            <SiteCard
                                                site={site}
                                                grades={site.grades}
                                                isHovered={hoveredSite === site.id}
                                                onHover={setHoveredSite}
                                                onView={() => navigate(`/dashboard/${site.id}`)}
                                            />
                                        </div>
                                    ))}

                                    {/* {sites.map(site => (
                                        <div className='mb-4' key={site.id}>
                                            <TransparentCard
                                                site={site}
                                                grades={site.grades}
                                                isHovered={hoveredSite === site.id}
                                                onHover={setHoveredSite}
                                                onView={() => navigate("/dashboard")}
                                            />
                                        </div>
                                    ))} */}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Landing;