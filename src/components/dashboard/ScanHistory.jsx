import React from 'react';

const ScanHistory = ({ scans, loading }) => {
  // Add safety check for scans
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-primary-800 mb-4">Scan History</h2>
        <p className="text-primary-600">Loading scans...</p>
      </div>
    );
  }

  if (!scans || !Array.isArray(scans) || scans.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-primary-800 mb-4">Scan History</h2>
        <p className="text-primary-600">No scans available</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-primary-800 mb-4">Scan History</h2>
      <div className="space-y-3">
        {scans.map((scan) => (
          <div key={scan.id} className="flex items-center justify-between p-3 border border-primary-100 rounded-lg hover:bg-primary-50">
            <div className="flex items-center">
              <div className="bg-primary-100 p-2 rounded-md mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-primary-800">{scan.title || 'Untitled Scan'}</h3>
                <p className="text-sm text-primary-600">{scan.date || 'No date'}</p>
              </div>
            </div>
            <span className={`px-2 py-1 rounded-full text-xs ${
              scan.rating && scan.rating.includes('Outstanding') 
                ? 'bg-green-100 text-green-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {scan.rating || 'N/A'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScanHistory;