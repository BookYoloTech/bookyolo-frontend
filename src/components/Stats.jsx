import React from 'react';

const Stats = () => {
  const stats = [
    {
      value: '12,400+',
      label: 'Users',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6 text-blue-600">
          <path d="M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" stroke="currentColor" strokeWidth="1.5" />
          <path d="M4 20a8 8 0 1 1 16 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      )
    },
    {
      value: '1.2M+',
      label: 'Scans Processed',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6 text-blue-600">
          <path d="M3 7h18M3 12h18M3 17h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      )
    },
    {
      value: '220+',
      label: 'Countries Covered',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6 text-blue-600">
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
          <path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18" stroke="currentColor" strokeWidth="1.2" />
        </svg>
      )
    },
    {
      value: '3s',
      label: 'Moments To Remember',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6 text-blue-600">
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
          <path d="M12 7v6l4 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      )
    }
  ];

  return (
    <section className="relative py-16 bg-[#f8fafb] overflow-hidden">
      {/* Background effects */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-0 top-0 h-full w-1/2 bg-[radial-gradient(600px_400px_at_-150px_150px,rgba(59,130,246,0.08),transparent)]" />
        <div className="absolute right-0 bottom-0 h-full w-1/2 bg-[radial-gradient(500px_300px_at_150px_-100px,rgba(147,51,234,0.06),transparent)]" />
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Heading */}
        <h2 className="mb-4 text-center text-3xl md:text-4xl font-bold text-gray-900">
          Growing Fast, <span className="text-blue-600">Trusted Worldwide</span>
        </h2>
        <p className="mx-auto mb-12 max-w-3xl text-center text-base md:text-lg text-gray-600">
          We are expanding beyond vacation rentals into hotels and hostels – so you can scan every kind of stay.
        </p>

        {/* Stats Grid */}
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center p-6 bg-white rounded-lg border border-gray-100 shadow-sm h-full"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 mb-4">
                {stat.icon}
              </div>
              <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">{stat.value}</div>
              <div className="text-sm font-medium text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;