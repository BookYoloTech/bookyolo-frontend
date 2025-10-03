import React, { useState, useEffect } from "react";
import PaymentButton from "./stripe/PaymentButton";
import logo from "../assets/main-logo.jpg";

const Header = ({ onLogin, onSignup, onLogout, authed = false, me = null }) => {
  const [activeSection, setActiveSection] = useState("hero");
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
          {/* Left: Logo */}
          <button 
            onClick={() => window.location.href = '/'}
            className="flex items-center hover:opacity-80 transition-opacity"
          >
            <img 
              src={logo} 
              alt="BookYolo" 
              className="h-8 sm:h-10 w-auto"
            />
          </button>

          {/* Center: Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6 lg:space-x-8">
            {navItem("hero", "Home")}
            {navItem("how-it-works", "How It Works")}
            {navItem("why-bookyolo", "Why Choose Us")}
            {navItem("features", "Features")}
            {navItem("pricing", "Pricing")}
            {navItem("faq", "FAQ")}
          </nav>

          {/* Right: Actions */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Mobile Menu Button */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center space-x-2 sm:space-x-3">
            {authed ? (
              <>
                {typeof me?.remaining === "number" && (
                  <span className="hidden sm:inline text-xs text-primary">
                    Remaining: <b>{me.remaining}</b>{me.limits?.total_limit ? ` / ${me.limits.total_limit}` : ""}
                  </span>
                )}
                <button
                  onClick={() => window.location.href = '/plan-status'}
                  className="hidden sm:inline px-3 py-1.5 text-xs text-primary border border-accent rounded hover:bg-accent cursor-pointer"
                  style={{ cursor: 'pointer' }}
                >
                  Plan Status
                </button>
                <button
                  onClick={() => window.location.href = '/scan'}
                  className="px-4 py-2.5 bg-button text-button font-medium rounded-lg hover:opacity-90 shadow-sm cursor-pointer"
                  style={{ cursor: 'pointer' }}
                >
                  Scan
                </button>
                {/* Payment Button - only show if not premium */}
                {me?.plan !== "premium" && (
                  <div className="hidden lg:block">
                    <PaymentButton user={me} className="!w-auto !text-xs !px-3 !py-1.5" />
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
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed top-0 right-0 h-full w-80 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out">
            <div className="p-6">
              {/* Close Button */}
              <div className="flex justify-end mb-6">
                <button 
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Mobile Navigation */}
              <nav className="space-y-4 mb-8">
                <button 
                  onClick={() => { scrollToSection("hero"); setMobileMenuOpen(false); }}
                  className={`block w-full text-left py-3 px-4 rounded-lg font-medium transition-colors ${
                    activeSection === "hero" ? "bg-button text-white" : "text-primary hover:bg-accent"
                  }`}
                >
                  Home
                </button>
                <button 
                  onClick={() => { scrollToSection("how-it-works"); setMobileMenuOpen(false); }}
                  className={`block w-full text-left py-3 px-4 rounded-lg font-medium transition-colors ${
                    activeSection === "how-it-works" ? "bg-button text-white" : "text-primary hover:bg-accent"
                  }`}
                >
                  How It Works
                </button>
                <button 
                  onClick={() => { scrollToSection("why-bookyolo"); setMobileMenuOpen(false); }}
                  className={`block w-full text-left py-3 px-4 rounded-lg font-medium transition-colors ${
                    activeSection === "why-bookyolo" ? "bg-button text-white" : "text-primary hover:bg-accent"
                  }`}
                >
                  Why Choose Us
                </button>
                <button 
                  onClick={() => { scrollToSection("features"); setMobileMenuOpen(false); }}
                  className={`block w-full text-left py-3 px-4 rounded-lg font-medium transition-colors ${
                    activeSection === "features" ? "bg-button text-white" : "text-primary hover:bg-accent"
                  }`}
                >
                  Features
                </button>
                <button 
                  onClick={() => { scrollToSection("pricing"); setMobileMenuOpen(false); }}
                  className={`block w-full text-left py-3 px-4 rounded-lg font-medium transition-colors ${
                    activeSection === "pricing" ? "bg-button text-white" : "text-primary hover:bg-accent"
                  }`}
                >
                  Pricing
                </button>
                <button 
                  onClick={() => { scrollToSection("faq"); setMobileMenuOpen(false); }}
                  className={`block w-full text-left py-3 px-4 rounded-lg font-medium transition-colors ${
                    activeSection === "faq" ? "bg-button text-white" : "text-primary hover:bg-accent"
                  }`}
                >
                  FAQ
                </button>
              </nav>

              {/* Mobile Actions */}
              <div className="space-y-3">
                {authed ? (
                  <>
                    {typeof me?.remaining === "number" && (
                      <div className="text-sm text-primary p-3 bg-accent rounded-lg">
                        Remaining: <b>{me.remaining}</b>{me.limits?.total_limit ? ` / ${me.limits.total_limit}` : ""}
                      </div>
                    )}
                    <button
                      onClick={() => { window.location.href = '/plan-status'; setMobileMenuOpen(false); }}
                      className="w-full px-4 py-3 text-primary border border-accent rounded-lg hover:bg-accent transition-colors"
                    >
                      Plan Status
                    </button>
                    <button
                      onClick={() => { onLogout(); setMobileMenuOpen(false); }}
                      className="w-full px-4 py-3 bg-button text-white rounded-lg hover:opacity-90 transition-opacity"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => { onLogin(); setMobileMenuOpen(false); }}
                      className="w-full px-4 py-3 text-primary border border-accent rounded-lg hover:bg-accent transition-colors"
                    >
                      Login
                    </button>
                    <button
                      onClick={() => { onSignup(); setMobileMenuOpen(false); }}
                      className="w-full px-4 py-3 bg-button text-white rounded-lg hover:opacity-90 transition-opacity"
                    >
                      Sign Up
                    </button>
                  </>
                )}
              </div>
            </div>
        </div>
      )}

      {/* Click outside to close */}
      {mobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 z-40" 
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </header>
  );
};

export default Header;
