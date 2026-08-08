import React, { useState, useEffect } from "react";
import { AiFillHome } from "react-icons/ai";
import { CgProfile } from "react-icons/cg";
import { IoIosSettings } from "react-icons/io";
import { TbMapExclamation, TbFileFilled } from "react-icons/tb";
import { IoNewspaperOutline } from "react-icons/io5";
import { IoMdLogOut, IoMdClose } from "react-icons/io";
import { HiOutlineMenuAlt2 } from "react-icons/hi";
import { FiSearch } from "react-icons/fi";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { SiPostman } from "react-icons/si";
import { getProfileMe } from "../../api/userApi";

const NAV_ITEMS = [
  { label: "Home", path: "/home", icon: AiFillHome },
  { label: "Search", path: "/search", icon: FiSearch },
  { label: "Post", path: "/post", icon: SiPostman },
  { label: "Settings", path: "/setting", icon: IoIosSettings },
  // { label: "Map", path: "/map", icon: TbMapExclamation },
  // { label: "Reports", path: "/report", icon: TbFileFilled },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });
  const hoverTimer = React.useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    getProfileMe().then(res => {
      if (isMounted) {
        const userData = res?.user || res?.data?.user || res?.data || res;
        if (userData && userData.name) {
          setUser(userData);
          localStorage.setItem("user", JSON.stringify(userData));
        }
      }
    }).catch(err => {
      console.warn("Failed to load user in navbar", err);
    });
    return () => { isMounted = false; };
  }, []);

  const handleProfileEnter = () => {
    clearTimeout(hoverTimer.current);
    setShowLogout(true);
  };

  const handleProfileLeave = () => {
    hoverTimer.current = setTimeout(() => {
      setShowLogout(false);
    }, 500);
  };

  return (
    <>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 w-full h-16 bg-[#F0F5EE] dark:bg-neutral-900 flex items-center justify-between px-5 z-50">
        <h1 className="text-2xl font-bold text-[#1F8A70]">LocalVibe</h1>
        <div className="flex items-center gap-4">
          <button onClick={() => navigate("/search")}>
            <FiSearch size={24} className="text-[#51617D] dark:text-neutral-400" />
          </button>
          <button onClick={() => setOpen(true)}>
            <HiOutlineMenuAlt2 size={28} className="text-[#51617D] dark:text-neutral-400" />
          </button>
        </div>
      </header>

      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-screen w-72 bg-[#F0F5EE] dark:bg-neutral-900 border-r border-[#D9E4DD] dark:border-neutral-700
            shadow-lg z-50 flex flex-col
            transform transition-transform duration-300
            ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
          >
        {/* Logo */}
        <div className="flex items-center justify-between px-6 py-6 ">
          <h1 className="text-3xl font-bold text-[#1F8A70]">
            Local<span className="text-[#1f8a21]">Vibe</span>
          </h1>
          <button className="lg:hidden" onClick={() => setOpen(false)}>
            <IoMdClose size={28} className="text-[#51617D] dark:text-neutral-400" />
          </button>
        </div>

        {/* Menu */}
        <nav className="mt-5 px-4 flex-1 overflow-y-auto">
          {NAV_ITEMS.map((item, index) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={index}
                to={item.path}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-4 px-5 py-3 rounded-xl mb-2 transition-all duration-300
                  ${isActive
                    ? "bg-[#9FC5FF] dark:bg-neutral-800 text-[#1F3A5F] dark:text-white shadow font-semibold"
                    : "text-[#51617D] dark:text-neutral-400 hover:bg-[#CCDEFE] dark:hover:bg-neutral-800/50 hover:text-[#1F3A5F] dark:hover:text-white"
                  }`
                }
              >
                <Icon size={22} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="px-5 pb-6 pt-4">

          <div
            className="relative"
            onMouseEnter={handleProfileEnter}
            onMouseLeave={handleProfileLeave}
          >
            <NavLink
              to="/profile"
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-4 px-5 py-3 rounded-xl transition-all duration-300
                ${isActive
                  ? "bg-[#9FC5FF] dark:bg-neutral-800 text-[#1F3A5F] dark:text-white shadow font-semibold"
                  : showLogout
                    ? "bg-[#CCDEFE] dark:bg-neutral-800/50 text-[#1F3A5F] dark:text-white"
                    : "text-[#51617D] dark:text-neutral-400 hover:bg-[#CCDEFE] dark:hover:bg-neutral-800/50 hover:text-[#1F3A5F] dark:hover:text-white"
                }`
              }
            >
              {user?.avatar ? (
                <img src={user.avatar} alt="Profile" className="w-8 h-8 rounded-full object-cover" />
              ) : user?.name ? (
                <div className="w-8 h-8 rounded-full bg-[#006A40] text-white flex items-center justify-center text-sm font-bold uppercase">
                  {user.name.charAt(0)}
                </div>
              ) : (
                <CgProfile size={22} />
              )}
              <span>Profile</span>
            </NavLink>

            <div
              className={`absolute left-0 bottom-full mb-2 w-full transition-all duration-200
                ${showLogout
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-2 pointer-events-none"
                }`}
            >

              <div className="bg-gradient-to-br from-[#006A40] to-[#0F172A] rounded-[20px] p-3 text-white">
                <div className="flex items-center justify-center gap-5">
                  <Link to="/profile" className="flex items-center gap-3">

                    {user?.avatar ? (
                      <img src={user.avatar} alt="Avatar" className="w-14 h-14 rounded-full object-cover" />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-white dark:bg-neutral-800/15 flex items-center justify-center text-lg font-bold text-[#006A40]">
                        {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                      </div>
                    )}

                    <div>
                      <p className="text-sm font-semibold">{user?.name || ""}</p>
                      <p className="text-xs text-white/70">{user?.neighborhood || ""}</p>
                    </div>

                  </Link>

                  <NavLink
                    to="/logout"
                    className="w-11 h-11 flex items-center justify-center rounded-xl text-white hover:bg-red-600 hover:text-white transition-all duration-300"
                  >
                    <IoMdLogOut size={20} />
                  </NavLink>
                </div>
              </div>

            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Navbar;