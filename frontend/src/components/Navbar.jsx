import React from "react";
import { Menu, SidebarOpen, X } from "lucide-react";
import logo from "../assets/logo.png";
import allsites from "../assets/allsites.png";
import allsitesActive from "../assets/allsites-active.png";
import dashboard from "../assets/dashboard.png";
import dashboardActive from "../assets/dashboard-active.png";
import equipment from "../assets/equipment.png";
import equipmentActive from "../assets/equipment-active.png";
import logout from "../assets/logout.png";
import leftArrow from "../assets/left-arrow.png";
import folder from "../assets/folder.png";
import folderActive from "../assets/folderActive.png"
import { useNavigate, useLocation, useParams } from "react-router-dom";

export default function Navbar({
  sidebarOpen,
  setSidebarOpen,
  mobileMenuOpen,
  setMobileMenuOpen,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { siteId } = useParams();
  const currentSite = siteId || 'all';

  // Helper: is this path currently active? 
  const isActive = (path) => location.pathname === path;

  // Auth 
  const handleLogout = async () => {
    try {
      // TODO: replace with your actual logout API call
      // await api.post("/auth/logout");
      // await signOut();

      localStorage.removeItem("token");
      sessionStorage.clear();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const menuItems = [
    {
      icon: allsites,
      iconActive: allsitesActive,
      label: "All sites",
      path: "/",
    },
    {
      icon: dashboard,
      iconActive: dashboardActive,
      label: "Dashboard",
      path: `/dashboard/${currentSite}`,
    },
    {
      icon: equipment,
      iconActive: equipmentActive,
      label: "Equipment Folder",
      path: `/dashboard/${currentSite}/equipment`,
    },
    {
      icon: folder,
      iconActive: folderActive,
      label: "Machine Index",
      path: `/dashboard/${currentSite}/machine-index`,
    },
  ];

  const NavButton = ({ item, onClick }) => {
    const active = isActive(item.path);
    return (
      <button
        onClick={onClick}
        className={`group relative overflow-hidden w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-300
          ${active ? "bg-[#708DA8] text-white" : "text-[#546A81]"}`}
      >
        {/* Hover sweep background */}
        {!active && (
          <span className="absolute inset-0 bg-[#708DA8]/10 scale-x-0 origin-left
            group-hover:scale-x-100 transition-transform duration-500 z-0" />
        )}

        {/* Icon */}
        <img
          src={active ? item.iconActive : item.icon}
          alt={item.label}
          className="relative z-10 w-5 h-5 object-contain transition-all duration-300 group-hover:scale-110"
        />

        {/* Label (hidden when sidebar collapsed on desktop) */}
        {(sidebarOpen || onClick === undefined) && (
          <span className={`relative z-10 text-sm ${active ? "font-medium" : "font-normal"}`}>
            {item.label}
          </span>
        )}
      </button>
    );
  };

  return (
    <>
      {/* DESKTOP SIDEBAR */}
      <aside
        className={`fixed left-0 top-0 h-full z-40 hidden md:block bg-white/60
          transition-all duration-300 shadow-lg
          ${sidebarOpen ? "w-60" : "w-15"}`}
      >
        {/* Logo */}
        <div className="flex items-center p-4 h-20">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <img src={logo} alt="logo" className="w-8" />
              <span className="text-slate-600 font-bold text-lg">
                EGAT<span className="font-normal">for</span>ALL
              </span>
            </div>
          )}
        </div>

        {/* Menu */}
        <nav className="px-2 mt-10 space-y-10">
          {menuItems.map((item, i) => (
            <NavButton
              key={i}
              item={item}
              onClick={() => navigate(item.path)}
            />
          ))}
        </nav>

        {/* Logout */}
        <div className="absolute px-2 w-full mt-5">
          <button
            // onClick={handleLogout}
            className="group relative overflow-hidden w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-300 text-red-500"
          >
            <span className="absolute inset-0 bg-red-50 scale-x-0 origin-left
              group-hover:scale-x-100 transition-transform duration-500 z-0" />
            <img
              src={logout}
              alt="logout"
              className="relative z-10 w-5 h-5 group-hover:scale-110 transition-all"
            />
            {sidebarOpen && (
              <span className="relative z-10 text-sm font-normal">Logout</span>
            )}
          </button>
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute bottom-2 right-2 p-1"
        >
          <img
            src={leftArrow}
            alt="toggle"
            className={`w-5 transition-transform ${sidebarOpen ? "" : "rotate-180"}`}
          />
        </button>
      </aside>

      {/* MOBILE TOP NAVBAR */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white shadow">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <img src={logo} alt="logo" className="w-8" />
            <span className="font-bold text-slate-600">
              EGAT<span className="font-normal">for</span>ALL
            </span>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="relative w-6 h-6 flex items-center justify-center text-[#546A81]"
          >
            <Menu
              size={24}
              className={`absolute transition-all duration-300 ease-in-out ${mobileMenuOpen ? "opacity-0 rotate-90 scale-50" : "opacity-100 rotate-0 scale-100"
                }`}
            />
            <X
              size={24}
              className={`absolute transition-all duration-300 ease-in-out ${mobileMenuOpen ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-50"
                }`}
            />
          </button>
        </div>

        {/* Mobile dropdown */}
        {mobileMenuOpen && (
          <nav className="px-4 pb-4 space-y-4 border-t">
            {menuItems.map((item, i) => {
              const active = isActive(item.path);
              return (
                <button
                  key={i}
                  onClick={() => {
                    navigate(item.path);
                    setMobileMenuOpen(false);
                  }}
                  className={`group relative overflow-hidden w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all mt-4 duration-300
                    ${active ? "bg-[#708DA8] text-white" : "text-[#546A81] bg-white"}`}
                >
                  {!active && (
                    <span className="absolute inset-0 bg-[#708DA8]/10 scale-x-0 origin-left
                      group-hover:scale-x-100 transition-transform duration-500 z-0" />
                  )}
                  <img
                    src={active ? item.iconActive : item.icon}
                    alt={item.label}
                    className="relative z-10 w-5 h-5 transition-all duration-300 group-hover:scale-110"
                  />
                  <span className={`relative z-10 text-sm transition-colors duration-300 
                    ${active ? "font-medium" : "font-normal group-hover:text-[#3B4D5F]"}`}>
                    {item.label}
                  </span>
                </button>
              );
            })}

            {/* Logout in mobile menu */}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleLogout();
              }}
              className="group relative overflow-hidden w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-300 text-red-500 bg-white"
            >
              <span className="absolute inset-0 bg-red-50 scale-x-0 origin-left
                group-hover:scale-x-100 transition-transform duration-500 z-0" />
              <img
                src={logout}
                alt="logout"
                className="relative z-10 w-5 h-5 group-hover:scale-110 transition-all"
              />
              <span className="relative z-10 text-sm font-normal">Logout</span>
            </button>
          </nav>
        )}
      </header>
    </>
  );
}
