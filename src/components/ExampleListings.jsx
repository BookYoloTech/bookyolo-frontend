import React from 'react';

const ExampleListings = () => {
  return (
    <section className="relative py-20 md:py-28 overflow-hidden bg-[#f8fafb]">
      {/* Background effects */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-0 top-0 h-full w-1/2 bg-[radial-gradient(600px_400px_at_-150px_150px,rgba(59,130,246,0.08),transparent)]" />
        <div className="absolute right-0 bottom-0 h-full w-1/2 bg-[radial-gradient(500px_300px_at_150px_-100px,rgba(147,51,234,0.06),transparent)]" />
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="mx-auto max-w-6xl">
          {/* Header section */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-2 text-sm font-medium text-amber-700 mb-6 ring-1 ring-amber-100">
              <span className="inline-block h-2 w-2 rounded-full bg-amber-500"></span>
              Real Examples
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
              See It in <span className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">Action</span>
            </h2>
            <p className="text-lg md:text-xl text-gray-700 leading-relaxed max-w-4xl mx-auto">
              Compare how BookYolo analyzes different types of listings to help you make informed decisions
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Risky Listing */}
            <div className="group relative h-full">
              <div className="absolute inset-0 bg-gradient-to-r from-red-600/5 via-orange-600/5 to-yellow-600/5 rounded-3xl blur-3xl"></div>
              <div className="relative rounded-3xl bg-white/80 backdrop-blur-sm ring-1 ring-gray-200/50 shadow-xl p-8 hover:shadow-2xl transition-all duration-300 h-full flex flex-col">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 text-white shadow-lg">
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                      <path d="M12 9v4" strokeLinecap="round" />
                      <path d="M12 17h.01" strokeLinecap="round" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-yellow-700">A Bit Risky</div>
                    <div className="text-xs text-gray-500">74/100 checks passed</div>
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-3">Cozy 2BR Apartment in Midtown</h3>
                
                <div className="space-y-6 flex-1">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-yellow-50 to-orange-50 ring-1 ring-yellow-100">
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <span className="inline-block h-2 w-2 rounded-full bg-yellow-500"></span>
                      What to Expect
                    </h4>
                    <p className="text-gray-700 text-sm leading-relaxed">Great location and space, but recurring complaints about cleanliness and noise may impact your stay.</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <span className="inline-block h-2 w-2 rounded-full bg-red-500"></span>
                      Recent Changes
                    </h4>
                    <p className="text-red-600 text-sm font-medium">Declining — more negative mentions in the most recent reviews.</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <span className="inline-block h-2 w-2 rounded-full bg-orange-500"></span>
                      Key Watch-outs
                    </h4>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-orange-400 mt-2"></span>
                        <span><strong>Comfort:</strong> Multiple guests flagged uncomfortable beds and night noise</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-orange-400 mt-2"></span>
                        <span><strong>Cleanliness:</strong> Dusty surfaces; bathrooms not well maintained</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-orange-400 mt-2"></span>
                        <span><strong>Value:</strong> Cleaning fee feels high for overall quality</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-gray-50 to-blue-50 ring-1 ring-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-2">Traveler asks:</h4>
                    <p className="italic text-sm text-gray-700 mb-3">"Is the noise issue really that bad, or just a few picky guests?"</p>
                    <h4 className="font-semibold text-gray-900 mb-2">BookYolo answers:</h4>
                    <p className="text-sm text-gray-700">"The noise seems consistent, not isolated. Multiple recent guests mentioned traffic and nightlife affecting sleep. If quiet matters, consider alternatives or bring earplugs."</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Outstanding Listing */}
            <div className="group relative h-full">
              <div className="absolute inset-0 bg-gradient-to-r from-green-600/5 via-emerald-600/5 to-teal-600/5 rounded-3xl blur-3xl"></div>
              <div className="relative rounded-3xl bg-white/80 backdrop-blur-sm ring-1 ring-gray-200/50 shadow-xl p-8 hover:shadow-2xl transition-all duration-300 h-full flex flex-col">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-lg">
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-emerald-700">Outstanding Stay</div>
                    <div className="text-xs text-gray-500">95/100 checks passed</div>
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-3">Sunlit Loft Near the Beach</h3>
                
                <div className="space-y-6 flex-1">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 ring-1 ring-emerald-100">
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <span className="inline-block h-2 w-2 rounded-full bg-emerald-500"></span>
                      What to Expect
                    </h4>
                    <p className="text-gray-700 text-sm leading-relaxed">Immaculate, accurately described, and genuinely quiet at night. Guests praise cleanliness, comfort, and fast host responses.</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <span className="inline-block h-2 w-2 rounded-full bg-green-500"></span>
                      Recent Changes
                    </h4>
                    <p className="text-green-600 text-sm font-medium">Improving — recent reviews trend even more positive.</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <span className="inline-block h-2 w-2 rounded-full bg-teal-500"></span>
                      Key Highlights
                    </h4>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-teal-400 mt-2"></span>
                        <span><strong>Cleanliness:</strong> Spotless bathrooms and linens</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-teal-400 mt-2"></span>
                        <span><strong>Comfort:</strong> Quiet nights, supportive mattresses, blackout shades</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-teal-400 mt-2"></span>
                        <span><strong>Host:</strong> &lt;1-hour responses; proactive tips noted by guests</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-gray-50 to-blue-50 ring-1 ring-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-2">Traveler asks:</h4>
                    <p className="italic text-sm text-gray-700 mb-3">"Is the 'quiet' claim still true on weekends?"</p>
                    <h4 className="font-semibold text-gray-900 mb-2">BookYolo answers:</h4>
                    <p className="text-sm text-gray-700">"Recent weekend reviews confirm low late-night noise. Some daytime beach traffic noted, but nights remain consistently quiet."</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Bottom CTA */}
          <div className="mt-16 text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-3 text-sm font-medium text-blue-700 ring-1 ring-blue-100">
              <span className="inline-block h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
              Try BookYolo on your next booking
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ExampleListings;