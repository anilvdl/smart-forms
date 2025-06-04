"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link  from "next/link";
import { useRouter } from "next/navigation";
import { signOut, useSession, signIn } from "next-auth/react";

import { publicMenu, privateMenu } from "./navigation";
import { Icons } from "@smartforms/shared/icons";
import { navigationUtil } from "@smartforms/shared/utils/navigationUtil";
import SfAnimatedLogo from "@smartforms/shared/components/ui/Logo";

export default function NavBar() {
  const { data: session } = useSession();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const router = useRouter();
  const { navigate } = navigationUtil();
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const burgerRef = useRef<HTMLDivElement>(null);
  
  // Logo click goes to Dashboard (if logged in) or Home‑page
  function handleLogoClick() {
    const dest = session?.user ? "/dashboard" : "/";
    navigate(dest);
  }

  function handleSignOut() {
    localStorage.removeItem("googleUser");
    signOut({redirect: false}).then(() => {
      navigate("/signout");
    });
  }

  function handleLogin() {
      navigate("/login");
  }

  useEffect(() => {
    if (session?.user) {
      localStorage.setItem("googleUser", JSON.stringify(session.user));
    }

    function onClickOutside(e: MouseEvent) {
        if (
        mobileOpen &&
          menuRef.current &&
          burgerRef.current &&
          !menuRef.current.contains(e.target as Node) &&
          !burgerRef.current.contains(e.target as Node)
        ) {
          setMobileOpen(false);
        }
      }
      function onEsc(e: KeyboardEvent) {
        if (e.key === "Escape") setMobileOpen(false);
      }
      document.addEventListener("mousedown", onClickOutside);
      document.addEventListener("keydown", onEsc);
      return () => {
        document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onEsc);
    };
  }, [session, mobileOpen]);

  return (
    <nav className="nav-container">
      <div className="nav-content">
        {/* Logo */}
        <div
          className="logo"
          onClick={handleLogoClick}
          style={{ display: "flex", alignItems: "center", gap: 4, cursor: "pointer" }}
        >
          {/* <Image src={Icons["sf-animated"]} alt="Form Icon" width={190} height={90} /> */}
          <SfAnimatedLogo />
          {/* <Image src={Icons["sf_logo"]} alt="SmartForms Logo" width={120} height={50} /> */}
        </div>

        {/* Hamburger (visible only on small screens) */}
        <div ref={burgerRef} className="hamburger" onClick={() => setMobileOpen(o => !o)}>
          {/* simple bars */}
          <span/><span/><span/>
        </div>

        {/* Menu items */}
        <div ref={menuRef} className={`nav-menu${mobileOpen ? " open" : ""}`}>
          {(session?.user ? privateMenu : publicMenu).map((menu, idx) => (
            <div key={idx} className="menu-item">
              {menu.isDropdown && menu.subMenu ? (
                <div
                  className="dropdown"
                  onMouseEnter={() => setOpenDropdown(menu.label)}
                  onMouseLeave={() => setOpenDropdown(null)}
                >
                  <Link href="#" className="dropdown-toggle">
                    {menu.label} <span className={`dropdown-arrow ${openDropdown === menu.label ? "down" : "up"}`} />
                  </Link>
                  {openDropdown === menu.label && (
                    <div className="dropdown-content">
                      <h6 className="dropdown-header">{menu.subMenu[0].header}</h6>
                      <div className="dropdown-grid">
                        {menu.subMenu[0].columns.map((col, cIdx) => (
                          <div key={cIdx} className="dropdown-column">
                            {col.map((item) => (
                              <Link key={item.label} href="#" onClick={(e) => {e.preventDefault(); navigate(item.href)}} className="dropdown-item">
                                <Image
                                  src={Icons[item.icon]}
                                  alt={item.label}
                                  width={20}
                                  height={20}
                                />
                                <span>{item.label}</span>
                              </Link>
                            ))}
                          </div>
                        ))}
                      </div>
                      {menu.subMenu[0].promo && (
                        <div className="dropdown-promo">
                          <span className="promo-text">{menu.subMenu[0].promo.text}</span>
                          <Link
                            href={menu.subMenu[0].promo.link}
                            className="promo-btn"
                          >
                            {menu.subMenu[0].promo.buttonText}
                          </Link>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <Link href="#" onClick={(e) => {e.preventDefault(); navigate(menu.href ?? "/")}} className="menu-link">
                  {menu.label}
                </Link>
              )}
            </div>
          ))}

          {/* Auth buttons */}
          {session?.user ? (
            <div className="user-menu">
              {session.user.image && (
                <Image
                  src={session.user.image}
                  alt={session.user.name || "User"}
                  width={30}
                  height={30}
                  className="user-avatar"
                  title={session.user.name || "User"}
                />
              )}
              <span className="user-name" title={session.user.name || ""}>
                {session.user.name}
              </span>
              <button onClick={handleSignOut} className="logout-btn">
                Sign Out
              </button>
            </div>
          ) : (
            <>
              {/* Login */}
              <Link 
                href="#" 
                className="login-btn"
                onClick={(e) => {
                  e.preventDefault();   // stop Next.js from navigating immediately
                  handleLogin();
                }}
              >Login</Link>
              {/* Sign Up */}
              <button
                onClick={() => {
                  navigate(("/signup"));
                }}
                className="logout-btn"
              >
                New User?
              </button>
              <p></p>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}