import React from 'react';

const Features = () => {
  const features = [
    {
      title: "Review Authenticity",
      description: "Fake-sounding praise, streaks, buried complaints",
      icon: (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" />
        </svg>
      ),
      gradient: "from-emerald-500 to-teal-500"
    },
    {
      title: "Cleanliness",
      description: "Recurring mentions of dirt, odors, hygiene gaps",
      icon: (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M3 7h18M3 12h18M3 17h18" strokeLinecap="round" />
        </svg>
      ),
      gradient: "from-blue-500 to-indigo-500"
    },
    {
      title: "Maintenance",
      description: "Broken fixtures, missing essentials, hidden wear",
      icon: (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
        </svg>
      ),
      gradient: "from-purple-500 to-pink-500"
    },
    {
      title: "Comfort & Sleep",
      description: "Noise, bed quality, temperature control",
      icon: (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      ),
      gradient: "from-red-500 to-pink-500"
    },
    {
      title: "Check-in & Access",
      description: "Lockbox failures, confusing instructions, delays",
      icon: (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <circle cx="12" cy="16" r="1" />
          <path d="M7 11V7a5 5 0 0110 0v4" />
        </svg>
      ),
      gradient: "from-orange-500 to-red-500"
    },
    {
      title: "Host Reliability",
      description: "Response speed, strict policies, cancellation risk",
      icon: (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" />
          <path d="M4 20a8 8 0 1 1 16 0" strokeLinecap="round" />
        </svg>
      ),
      gradient: "from-cyan-500 to-blue-500"
    },
    {
      title: "Accuracy",
      description: "Photos/amenities that don't match reality",
      icon: (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="M21 15l-5-5L5 21" />
        </svg>
      ),
      gradient: "from-violet-500 to-purple-500"
    },
    {
      title: "Safety",
      description: "Neighborhood or building risks",
      icon: (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      ),
      gradient: "from-green-500 to-emerald-500"
    },
    {
      title: "Value",
      description: "Hidden fees or overpriced listings",
      icon: (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      ),
      gradient: "from-amber-500 to-orange-500"
    },
    {
      title: "Trends",
      description: "Whether quality is improving, declining, or inconsistent",
      icon: (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M3 3v18h18" />
          <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3" />
        </svg>
      ),
      gradient: "from-indigo-500 to-purple-500"
    }
  ];

  return (
    <section id="features" className="relative py-20 md:py-28 overflow-hidden bg-white">
      {/* Background effects */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-0 top-0 h-full w-1/2 opacity-20" style={{background: 'radial-gradient(600px 400px at -150px 150px, #e9e8ea, transparent)'}} />
        <div className="absolute right-0 bottom-0 h-full w-1/2 opacity-20" style={{background: 'radial-gradient(500px 300px at 150px -100px, #e9e8ea, transparent)'}} />
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="mx-auto max-w-6xl">
          {/* Header section */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-medium text-primary mb-6 ring-1 border-accent">
              <span className="inline-block h-2 w-2 rounded-full bg-button"></span>
              AI-Powered Analysis
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-primary mb-6 leading-tight">
              What We <span className="text-primary">Analyze</span>
            </h2>
            <p className="text-lg md:text-xl text-primary leading-relaxed max-w-4xl mx-auto">
              Our AI inspects the details that matter most to ensure you make informed booking decisions
            </p>
          </div>

          {/* Features grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="group relative p-6 rounded-2xl bg-white ring-1 border-accent hover:ring-2 hover:border-button transition-all duration-300 hover:-translate-y-1 hover:shadow-lg h-full">
                <div className="flex items-start gap-4 h-full">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-button text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-primary mb-2 text-lg">{feature.title}</div>
                    <div className="text-primary leading-relaxed text-sm">{feature.description}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="mt-16 text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-medium text-primary ring-1 border-accent">
              <span className="inline-block h-2 w-2 rounded-full bg-button animate-pulse"></span>
              All analyses powered by advanced AI algorithms
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;