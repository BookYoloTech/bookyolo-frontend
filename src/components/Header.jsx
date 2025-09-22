import React, { useState, useEffect } from "react";
import PaymentButton from "./stripe/PaymentButton";

const Header = ({ onLogin, onSignup, onLogout, authed = false, me = null }) => {
  const [activeSection, setActiveSection] = useState("hero");
  const [isUserScrolling, setIsUserScrolling] = useState(false);

  const scrollToSection = (sectionId) => {
    const el = document.getElementById(sectionId);
    if (!el) return;
    setActiveSection(sectionId);
    setIsUserScrolling(true);
    el.scrollIntoView({ behavior: "smooth" });
    setTimeout(() => setIsUserScrolling(false), 1000);
  };

  useEffect(() => {
    const handleScroll = () => {
      if (isUserScrolling) return;
      const sections = ["hero","how-it-works","why-bookyolo","features","pricing","faq"];
      const y = window.scrollY + 150;
      let current = "hero";
      for (const id of sections) {
        const sec = document.getElementById(id);
        if (!sec) continue;
        const top = sec.offsetTop;
        const h = sec.offsetHeight;
        if (y >= top && y < top + h) current = id;
      }
      setActiveSection(current);
    };
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => { handleScroll(); ticking = false; });
        ticking = true;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isUserScrolling]);

  const navItem = (id, label) => (
    <button onClick={() => scrollToSection(id)}
      className={`font-medium transition-all duration-300 ${
        activeSection === id ? "text-primary border-b-2 border-button pb-1"
                             : "text-primary opacity-70 hover:opacity-100"
      }`}
    >
      {label}
    </button>
  );

  return (
    <header className="bg-white shadow-sm border-b border-accent sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <button 
            onClick={() => window.location.href = '/'}
            className="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-opacity"
          >
            <div className="flex items-center gap-1">
              <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-button" />
              <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-button" />
              <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-button" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-lg sm:text-xl font-bold text-primary">Book</span>
              <span className="text-lg sm:text-xl font-bold text-primary">Yolo</span>
            </div>
          </button>

          {/* Mobile Menu Button */}
          <button className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Nav - Desktop */}
          <nav className="hidden md:flex items-center space-x-6 lg:space-x-8">
            {navItem("hero", "Home")}
            {navItem("how-it-works", "How It Works")}
            {navItem("why-bookyolo", "Why Choose Us")}
            {navItem("features", "Features")}
            {navItem("pricing", "Pricing")}
            {navItem("faq", "FAQ")}
          </nav>

          {/* Actions */}
          <div className="hidden md:flex items-center space-x-3 lg:space-x-4">
            {authed ? (
              <>
                {typeof me?.remaining === "number" && (
                  <span className="hidden sm:inline text-xs text-primary">
                    Remaining: <b>{me.remaining}</b>{me.limits?.total_limit ? ` / ${me.limits.total_limit}` : ""}
                  </span>
                )}
                <button
                  onClick={() => window.location.href = '/plan-status'}
                  className="hidden sm:inline px-3 py-1.5 text-xs text-primary border border-accent rounded hover:bg-accent"
                >
                  Plan Status
                </button>
                <button
                  onClick={() => window.location.href = '/scan'}
                  className="px-4 py-2.5 bg-button text-button font-medium rounded-lg hover:opacity-90 shadow-sm"
                >
                  Scan
                </button>
                {/* Payment Button - only show if not premium */}
                {me?.plan !== "premium" && (
                  <div className="hidden lg:block">
                    <PaymentButton user={me} className="!w-auto" />
                  </div>
                )}
                <button
                  onClick={() => {
                    onLogout();
                  }}
                  className="px-6 py-2.5 bg-button text-button font-medium rounded-lg hover:opacity-90 shadow-sm"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={onLogin}
                  className="px-5 py-2.5 text-primary font-medium rounded-lg border border-accent hover:bg-accent"
                >
                  Login
                </button>
                <button
                  onClick={onSignup}
                  className="px-6 py-2.5 bg-button text-button font-medium rounded-lg hover:opacity-90 shadow-sm"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
