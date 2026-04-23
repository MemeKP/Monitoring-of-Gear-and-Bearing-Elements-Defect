import React from 'react'
import SiteSelector from '../components/SiteSelector'
import { useState } from 'react';
import { SITES } from '../mock/SITES';
import ThaiMap from '../components/ThaiMap';

const Landing = () => {
    const [hoveredSite, setHoveredSite] = useState(null);
    const [activePage, setActivePage] = useState("map");
    const [activeSite, setActiveSite] = useState(null);
    const handleView = (siteId) => {
        setActiveSite(SITES.find((s) => s.id === siteId));
        setActivePage("detail");
    };

    return (
        <>
            {/* NAVBAR */}
            <div className="text-slate-500 text-xl font-bold font-['Montserrat']">
                EGAT<span>for</span>ALL
            </div>
            {/* <div class="w-96 h-12 relative">
                <div class="w-96 h-5 left-[48px] top-[30.46px] absolute justify-center text-slate-500 text-sm font-medium font-['Montserrat'] leading-[66px]">Monitoring of Gear and Bearing Elements Defect</div>
                <div class="left-[47.81px] top-0 absolute justify-start"><span class="text-slate-500 text-xl font-bold font-['Montserrat']">EGAT</span><span class="text-slate-500 text-xl font-medium font-['Montserrat']">for</span><span class="text-slate-500 text-xl font-bold font-['Montserrat']">ALL</span></div>
                <img class="w-8 h-9 left-0 top-[5.46px] absolute" src="https://placehold.co/33x37" />
            </div> */}
            {/* MAP */}
            <ThaiMap
                hoveredProvince={hoveredSite}
                onHover={setHoveredSite}
                onClick={handleView}

            />

            {/* SITES LIST */}
            <h1>Landing</h1>
            {/* <div className='text-8xl font-semibold bg-gradient-to-r from-pink-500 to-cyan-500 bg-clip-text text-transparent'>Landing</div> */}
            {/* <SiteSelector /> */}
        </>

    )
}

export default Landing