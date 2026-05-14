import React, { useCallback } from 'react'
import { useState } from 'react';
import ThaiMap from '../components/ThaiMap';
import logo from '../assets/logo.png';
import { LiquidGlassButton, SiteCard, TransparentCard } from '../components/SiteSelector';
import Dashboard from './Dashboard';
import { useSites } from '../hooks/useSites';
import RegionMap from '../components/RegionMap';
import SiteModal from '../components/SiteModal';

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
    const [activeSite, setActiveSite] = useState(null);
    const [selectedSite, setSelectedSite] = useState(null);

    const onSiteClick = useCallback((siteId) => {
        const site = sites.find(s => s.id === siteId);
        setSelectedSite(site);
    }, [sites]);

    return (
        <>
            {/* FULL SCREEN MAP LAYOUT */}
            <div className="relative w-full h-screen overflow-hidden">
                {/* MAP */}
                {loading ? (
                    <div className="w-full h-full bg-slate-800 animate-pulse flex items-center justify-center">
                        <span className="text-slate-400 font-medium">Loading Map...</span>
                    </div>
                ) : error ? (
                    <div className="w-full h-full flex items-center justify-center">
                        <div className="text-red-400">Error loading map data</div>
                    </div>
                ) : (
                    <RegionMap
                        sites={sites}
                        hoveredSite={hoveredSite}
                        onHover={setHoveredSite}
                        onSiteClick={onSiteClick}
                    />
                )}

                {selectedSite && (
                    <SiteModal
                        site={selectedSite}
                        onClose={() => setSelectedSite(null)}
                    />
                )}

                {/* HEADER */}
                <div className="absolute top-4 left-4 z-10 flex flex-row items-center
                            bg-white/10 backdrop-blur-md 
                            border border-white/20 
                            rounded-2xl px-4 py-2.5 shadow-lg">
                    <img src={logo} className="w-9 pr-2 flex-shrink-0" alt="logo" />
                    <div className="flex flex-col min-w-0">
                        <div className="text-white text-base font-bold tracking-tight drop-shadow">
                            EGAT<span className="font-normal">for</span>ALL
                        </div>
                        <div className="text-white/70 text-xs leading-tight">
                            Monitoring of Gear and Bearing Elements Defect
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Landing;