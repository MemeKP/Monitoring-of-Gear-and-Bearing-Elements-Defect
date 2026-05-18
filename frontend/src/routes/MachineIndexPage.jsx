import React, { useState } from 'react'
import Navbar from '../components/Navbar';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

const MachineIndexPage = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const navigate = useNavigate()
    const {siteId} = useParams()
    const siteName = siteId ?? 'All sites';
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

            </div>

        </div>
    )
}

export default MachineIndexPage