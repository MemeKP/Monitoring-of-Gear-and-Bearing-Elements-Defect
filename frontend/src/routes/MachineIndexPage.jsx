import React, { useState } from 'react'
import Navbar from '../components/Navbar';

const MachineIndexPage = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    return (
        <>
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
                Machine Index
            </div>

        </>
    )
}

export default MachineIndexPage