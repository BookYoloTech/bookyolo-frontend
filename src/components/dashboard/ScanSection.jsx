import React, { useState } from 'react';

const ScanSection = ({ onScan }) => {
  const [url, setUrl] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (url) {
      onScan(url);
      setUrl('');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h1 className="text-2xl font-bold text-primary-800 mb-2">Property Reality Check</h1>
      <p className="text-primary-600 mb-6">Paste a property URL from Airbnb, Vrbo, Booking, Expedia, Hotels or Agoda to get AI-powered insights and red flag detection</p>
      
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <input 
            type="text" 
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.airbnb.com/rooms/... or https://www.booking.com/... or https://www.agoda.com/..." 
            className="flex-grow px-4 py-3 border border-primary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <button 
            type="submit"
            className="px-6 py-3 bg-primary-700 text-white rounded-md font-medium hover:bg-primary-600 whitespace-nowrap"
          >
            Scan Listing
          </button>
        </div>
      </form>
    </div>
  );
};

export default ScanSection;