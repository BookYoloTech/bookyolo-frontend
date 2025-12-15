import React from 'react';

const Pricing = () => {
  return (
    <section id="pricing" className="relative py-20 md:py-28 overflow-hidden bg-white">
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
              Simple Pricing
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-primary mb-6 leading-tight">
              Free for Everyday Travelers, <span className="text-primary">Simple for All</span>
            </h2>
            <p className="text-lg md:text-xl text-primary leading-relaxed max-w-4xl mx-auto">
              Built for real travelers who just want peace of mind. Scans are free, unlimited for almost everyone.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Free Plan */}
            <div className="group relative h-full">
              <div className="absolute inset-0 bg-accent rounded-3xl blur-3xl opacity-30"></div>
              <div className="relative rounded-3xl bg-white ring-1 border-accent shadow-xl p-8 hover:shadow-2xl transition-all duration-300 h-full flex flex-col">
                <div className="text-center mb-8">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-button text-white shadow-lg mx-auto mb-4">
                    <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-primary mb-2">Always Free</h3>
                  <div className="text-sm text-primary opacity-70 mb-4">Fair Use</div>
                  <div className="text-5xl font-extrabold text-primary mb-2">
                    $0
                  </div>
                  <div className="text-sm text-primary opacity-70">Forever</div>
                </div>
                
                <div className="space-y-4 mb-8 flex-1">
                  <div className="flex items-start gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-button text-white text-xs font-bold mt-0.5">
                      ✓
                    </div>
                    <span className="text-primary">Plenty of scans + full AI interaction for everyday travelers</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-button text-white text-xs font-bold mt-0.5">
                      ✓
                    </div>
                    <span className="text-primary">Unlimited access to all core features</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-button text-white text-xs font-bold mt-0.5">
                      ✓
                    </div>
                    <span className="text-primary">Perfect for families, couples, and solo adventurers</span>
                  </div>
                </div>
                
                <button className="w-full py-4 bg-button text-button rounded-2xl font-semibold hover:opacity-90 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                  Get Started Free
                </button>
              </div>
            </div>
            
            {/* Premium Plan */}
            <div className="group relative h-full">
              <div className="absolute inset-0 bg-accent rounded-3xl blur-3xl opacity-30"></div>
              <div className="relative rounded-3xl bg-white ring-1 border-accent shadow-xl p-8 hover:shadow-2xl transition-all duration-300 h-full flex flex-col">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="inline-flex items-center gap-2 rounded-full bg-button px-4 py-2 text-xs font-bold text-white shadow-lg">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-white"></span>
                    Most Popular
                  </div>
                </div>
                
                <div className="text-center mb-8 mt-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-500 text-white shadow-lg mx-auto mb-4">
                    <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Premium Plan</h3>
                  <div className="text-sm text-gray-600 mb-4">For Power Users</div>
                  <div className="text-5xl font-extrabold text-gray-900 mb-2">
                    $20
                  </div>
                  <div className="text-sm text-gray-500">per year</div>
                </div>
                
                <div className="space-y-4 mb-8 flex-1">
                  <div className="flex items-start gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 text-white text-xs font-bold mt-0.5">
                      ✓
                    </div>
                    <span className="text-gray-700">Everything in Free, plus more scans</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 text-white text-xs font-bold mt-0.5">
                      ✓
                    </div>
                    <span className="text-gray-700">Higher limits for power users</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 text-white text-xs font-bold mt-0.5">
                      ✓
                    </div>
                    <span className="text-gray-700">Priority support and advanced features</span>
                  </div>
                </div>
                
                <button className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                  Upgrade to Premium
                </button>
              </div>
            </div>
          </div>
          
          {/* Bottom section */}
          <div className="mt-16 text-center">
            <div className="max-w-4xl mx-auto">
              <div className="p-6 rounded-3xl bg-gradient-to-br from-blue-50 to-indigo-50 ring-1 ring-blue-100 mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-2">
                  <span className="inline-block h-2 w-2 rounded-full bg-blue-500"></span>
                  Fair Use Promise
                </h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Built for real travelers — families, couples, and solo adventurers who just want peace of mind. 
                  Scans are free, unlimited for almost everyone. Only travel power-users scanning hundreds of listings may ever need Premium.
                </p>
                <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-yellow-50 to-amber-50 px-4 py-2 text-sm font-medium text-amber-700 ring-1 ring-amber-100">
                  <span className="text-lg">🌟</span>
                  99% of our users use BookYolo completely free
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;