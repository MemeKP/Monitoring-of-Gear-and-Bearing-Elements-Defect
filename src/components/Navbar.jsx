import React from 'react'
import logo from '../assets/logo.png';

const Navbar = () => {
  return (
    <div className='fixed top-0 left-0 z-40 w-64 h-full transition-transform -translate-x-full sm:translate-x-0 bg-white/60 shadow-[inset_3px_3px_0.5px_-3px_rgba(255,255,255,1.00)] shadow-[inset_2px_2px_0.5px_-2px_rgba(255,255,255,0.15)]'>
      {/* LOGO */}
      <div className='flex flex-row items-center sm:p-4 mt-2 w-full'>
        <img src={logo} className='w-12 ml-4 sm:w-12 pr-2 sm:pr-3 flex-shrink-0' alt="logo" />
        <div className="flex flex-col min-w-0">
          <div className="text-slate-500 text-xl sm:text-l font-bold tracking-tight">
            EGAT<span className='font-normal'>for</span>ALL
          </div>
        </div>
      </div>

      {/* NAVIGATOR */}
      <div>
        Navbar
        <ul className='text-base font-normal'>
          <li>All sites</li>
        </ul>
      </div>
    </div>
  )
}

export default Navbar