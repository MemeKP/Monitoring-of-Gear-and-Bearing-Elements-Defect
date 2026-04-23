import React from 'react'
import { useState } from 'react';
import { SITES } from '../mock/SITES';
import ThaiMap from '../components/ThaiMap';
import logo from '../assets/logo.png';
import { useNavigate } from 'react-router-dom';
import { LiquidGlassButton, SiteCard, TransparentCard } from '../components/SiteSelector';
import Dashboard from './Dashboard';

const Landing = () => {
    const [hoveredSite, setHoveredSite] = useState(null);
    const [activePage, setActivePage] = useState("map");
    const navigate = useNavigate();
    const [activeSite, setActiveSite] = useState(null);
    const handleView = siteId => {
        setActiveSite(SITES.find(s => s.id === siteId));
        setActivePage("detail");
    };

    // if (activePage === "detail" && activeSite) {
    //     return <Dashboard/>;
    // }

    return (
        <>
            {/* HEADER */}
            <div className='flex flex-row items-center sm:p-4 mt-2 w-full'>
                <img src={logo} className='w-12 ml-4 sm:w-12 pr-2 sm:pr-3 flex-shrink-0' alt="logo" />
                <div className="flex flex-col min-w-0">
                    <div className="text-slate-500 text-lg sm:text-xl font-bold tracking-tight">
                        EGAT<span className='font-normal'>for</span>ALL
                    </div>
                    <div className="text-slate-400 text-xs sm:text-sm -mt-0.5 sm:-mt-1 leading-tight sm:leading-normal line-clamp-1 sm:line-clamp-none" title="Monitoring of Gear and Bearing Elements Defect">
                        Monitoring of Gear and Bearing Elements Defect
                    </div>
                </div>
            </div>

            {/* LEFT & RIGHT SIDE PANEL */}
            <div className='col-span-2'>
                {/* สร้าง Grid Container: 
                    - จอมือถือ (เริ่มต้น) ให้มีแค่ 1 คอลัมน์ 
                    - จอใหญ่ (lg + md + sm) ให้แบ่งเป็น 2 คอลัมน์ โดยคอลัมน์แรก (แมพ) ให้กว้างกว่าคอลัมน์สอง (รายชื่อ) (เช่น lg:grid-cols-[2fr_1fr] คือ แมพกินพื้นที่ 2 ส่วน, รายชื่อกินพื้นที่ 1 ส่วน) 
                */}
                <div className="grid grid-cols-1 sm:grid-cols-[2fr_1fr] gap-6">
                    <div className="hidden sm:flex flex-col justify-center items-center p-4">
                        <ThaiMap
                            hoveredProvince={hoveredSite}
                            onHover={setHoveredSite}
                            onClick={handleView}
                        />
                    </div>

                    <div className="flex flex-col h-full  p-4">
                        <h1 className="text-[18px] font-semibold text-slate-700 mb-4 pb-2">
                            All Sites
                        </h1>
                        <div className="flex-1 overflow-y-auto">
                            {SITES.map(site => (<div className='mb-4'>
                                <SiteCard
                                    key={site.id}
                                    site={site.name}
                                    grades={site.grades}
                                    isHovered={hoveredSite === site.id}
                                    onHover={setHoveredSite}
                                    //onHover={active => setHoveredSite(active ? site.id : null)}
                                    // onView={() => navigate(`/${site.id}`)} // still wait for API
                                    onView={() => navigate(`/dashboard`)}
                                />
                            </div>))}

                            <div className=''>
                                <TransparentCard
                                    name="Mae Moh Mine"
                                    grades={[
                                        { label: "F Grade", color: "#FF3B3B", count: 23, pct: 6 },
                                        { label: "E Grade", color: "#FFEE00", count: 977, pct: 93 },
                                    ]}
                                    isHovered={hoveredSite === "maemoh-plant"}
                                    onHover={active => setHoveredSite(active ? "maemoh-plant" : null)}
                                    onView={() => navigate("/dashboard")} />

                            </div>
                            {/* <p className="text-sm text-slate-400">Loading sites...</p> */}

                        </div>
                    </div>
                </div>
            </div>

        </>

    )
}

export default Landing