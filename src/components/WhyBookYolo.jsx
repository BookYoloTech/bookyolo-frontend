import React from 'react';

const WhyBookYolo = () => {
  const features = [
    {
      title: "Deep Inspection Analysis",
      description: "100 checks, every scan",
      gradient: "from-emerald-500 to-teal-500",
      icon: (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" />
        </svg>
      )
    },
    {
      title: "Clear Labels",
      description: "Outstanding Stay → A Bit Risky",
      gradient: "from-blue-500 to-indigo-500",
      icon: (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      )
    },
    {
      title: "Expectation Fit",
      description: "Do promises match reality?",
      gradient: "from-purple-500 to-pink-500",
      icon: (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
    {
      title: "Recent Changes",
      description: "Improving, declining, or stable",
      gradient: "from-orange-500 to-red-500",
      icon: (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      )
    },
    {
      title: "Compare Listings",
      description: "Side-by-side view",
      gradient: "from-cyan-500 to-blue-500",
      icon: (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M8 3v3a2 2 0 01-2 2H3m18 0h-3a2 2 0 01-2-2V3m0 18v-3a2 2 0 012-2h3M3 16h3a2 2 0 012 2v3" />
        </svg>
      )
    },
    {
      title: "Ask Our AI Anything",
      description: "Instant, personalized answers",
      gradient: "from-violet-500 to-purple-500",
      icon: (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      )
    },
    {
      title: "Fair Use",
      description: "Generous free plan designed for everyday travelers",
      gradient: "from-amber-500 to-orange-500",
      icon: (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      )
    }
  ];

  return (
    <section id="why-bookyolo" className="relative py-20 md:py-28 overflow-hidden bg-gradient-to-b from-[#f8fafb] via-white to-[#f8fafb]">
      {/* Enhanced background effects */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-0 top-0 h-full w-1/2 bg-[radial-gradient(600px_400px_at_-150px_150px,rgba(59,130,246,0.08),transparent)]" />
        <div className="absolute right-0 bottom-0 h-full w-1/2 bg-[radial-gradient(500px_300px_at_150px_-100px,rgba(147,51,234,0.06),transparent)]" />
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="mx-auto max-w-5xl">
          {/* Enhanced header section */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-50 to-purple-50 px-4 py-2 text-sm font-medium text-blue-700 mb-6 ring-1 ring-blue-100">
              <span className="inline-block h-2 w-2 rounded-full bg-blue-500"></span>
              Why Choose BookYolo
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
              Why BookYolo <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Exists</span>
            </h2>
            <p className="text-lg md:text-xl text-gray-700 leading-relaxed max-w-4xl mx-auto">
              We've all been there — the photos looked perfect, the reviews were glowing, the description reassuring... yet on arrival, the reality didn't fully match the promise.
            </p>
          </div>

          {/* Enhanced story section */}
          <div className="mb-16 p-8 rounded-3xl bg-gradient-to-br from-white via-blue-50/30 to-white ring-1 ring-blue-100/50 shadow-sm">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <div className="h-8 w-1 rounded-full bg-gradient-to-b from-blue-500 to-purple-500"></div>
              That's Why We Built BookYolo
            </h3>
            <p className="text-lg text-gray-700 leading-relaxed">
              BookYolo closes that gap. It's your AI travel buddy that reads between the lines, uncovers subtle details, and surfaces what guests don't always say out loud. With BookYolo, you see the whole story before you book. Airbnb and other platforms have unlocked unforgettable stays worldwide — BookYolo simply adds an extra layer of clarity and confidence to help you choose the right one, every time.
            </p>
          </div>

          {/* Enhanced features card */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-pink-600/5 rounded-3xl blur-3xl"></div>
            <div className="relative rounded-3xl bg-white/80 backdrop-blur-sm ring-1 ring-gray-200/50 shadow-xl p-8 md:p-12">
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-50 to-teal-50 px-4 py-2 text-sm font-medium text-emerald-700 mb-4 ring-1 ring-emerald-100">
                  <span className="inline-block h-2 w-2 rounded-full bg-emerald-500"></span>
                  Free Registration Benefits
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                  What You Get with Free Registration
                </h3>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Unlock powerful AI-driven insights to make smarter booking decisions
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {features.map((feature, index) => (
                  <div key={index} className="group relative p-6 rounded-2xl bg-gradient-to-br from-white to-gray-50/50 ring-1 ring-gray-200/50 hover:ring-2 hover:ring-blue-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg h-full">
                    <div className="flex items-start gap-4 h-full">
                      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        {feature.icon}
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-gray-900 mb-2 text-lg">{feature.title}</div>
                        <div className="text-gray-600 leading-relaxed">{feature.description}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyBookYolo;