import React from "react";
import { Menu, X } from "lucide-react";

import logo from "../assets/logo.png";
import allsites from "../assets/allsites.png";
import allsitesActive from "../assets/allsites-active.png";
import dashboard from "../assets/dashboard.png";
import dashboardActive from "../assets/dashboard-active.png";
import equipment from "../assets/equipment.png";
import equipmentActive from "../assets/equipment-active.png";
import logout from "../assets/logout.png";
import leftArrow from "../assets/left-arrow.png";

export default function Navbar({
  sidebarOpen,
  setSidebarOpen,
  mobileMenuOpen,
  setMobileMenuOpen,
}) {
  const menuItems = [
    {
      icon: allsites,
      iconActive: allsitesActive,
      label: "All sites",
      active: false,
    },
    {
      icon: dashboard,
      iconActive: dashboardActive,
      label: "Dashboard",
      active: true,
    },
    {
      icon: equipment,
      iconActive: equipmentActive,
      label: "Equipment Folder",
      active: false,
    },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full z-40 hidden md:block bg-white/60
        transition-all duration-300 shadow-lg
        ${sidebarOpen ? "w-64" : "w-20"}`}
      >
        {/* Logo */}
        <div className="flex items-center p-4 h-20">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <img src={logo} alt="logo" className="w-10" />
              <span className="text-slate-600 font-bold text-lg">
                EGAT<span className="font-normal">for</span>ALL
              </span>
            </div>
          )}
        </div>

        {/* Menu */}
        <nav className="px-2 space-y-2">
          {menuItems.map((item, i) => (
            <button
              key={i}
              className={`group relative overflow-hidden w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-300
              ${
                item.active
                  ? "bg-[#708DA8] text-white"
                  : "text-[#546A81]"
              }`}
            >
              {!item.active && (
                <span
                  className="absolute inset-0 bg-white scale-x-0 origin-left
                  group-hover:scale-x-100 transition-transform duration-500 z-0"
                />
              )}

              <img
                src={item.active ? item.iconActive : item.icon}
                alt={item.label}
                className="relative z-10 w-5 h-5 object-contain transition-all duration-300 group-hover:scale-110"
              />

              {sidebarOpen && (
                <span className="relative z-10 text-sm font-medium">
                  {item.label}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="absolute  px-2">
          <button
            className="group relative overflow-hidden w-full flex items-center gap-3 px-3 py-2 rounded-xl text-red-500"
          >
            <span
              className="absolute inset-0 bg-red-50 scale-x-0 origin-left
              group-hover:scale-x-100 transition-transform duration-500"
            />

            <img
              src={logout}
              alt="logout"
              className="relative z-10 w-5 h-5 group-hover:scale-110 transition-all"
            />

            {sidebarOpen && (
              <span className="relative z-10 text-sm font-medium">
                Logout
              </span>
            )}
          </button>
        </div>

        {/* Toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute bottom-2 right-2 p-1"
        >
          <img
            src={leftArrow}
            alt="toggle"
            className={`w-5 transition-transform ${
              sidebarOpen ? "" : "rotate-180"
            }`}
          />
        </button>
      </aside>

      {/* Mobile Top Navbar */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white shadow">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <img src={logo} alt="logo" className="w-8" />
            <span className="font-bold text-slate-600">
              EGAT<span className="font-normal">for</span>ALL
            </span>
          </div>

          <button
            onClick={() =>
              setMobileMenuOpen(!mobileMenuOpen)
            }
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <nav className="px-4 pb-4 space-y-2 border-t">
            {menuItems.map((item, i) => (
              <button
                key={i}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl
                ${
                  item.active
                    ? "bg-[#708DA8] text-white"
                    : "text-[#546A81] bg-white"
                }`}
              >
                <img
                  src={
                    item.active
                      ? item.iconActive
                      : item.icon
                  }
                  alt={item.label}
                  className="w-5 h-5"
                />
                <span className="text-sm font-medium">
                  {item.label}
                </span>
              </button>
            ))}
          </nav>
        )}
      </header>
    </>
  );
}