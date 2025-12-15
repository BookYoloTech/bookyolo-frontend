import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminHeader from "../components/admin/AdminHeader";
import AdminSidebar from "../components/admin/AdminSidebar";
import { API_BASE } from "../config/api";

export default function AdminScans() {
  const navigate = useNavigate();
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedScan, setSelectedScan] = useState(null);

  useEffect(() => {
    const adminToken = localStorage.getItem("admin_token");
    if (!adminToken) {
      navigate("/admin/login");
      return;
    }
    
    fetchScans();
  }, [navigate, currentPage]);

  const fetchScans = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("admin_token");
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "50"
      });

      const response = await fetch(`${API_BASE}/admin/scans?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error("Failed to fetch scans");
      }

      const data = await response.json();
      setScans(data.scans);
      setTotalPages(data.pages);
    } catch (e) {
      setError(e.message);
      if (e.message.includes("401") || e.message.includes("403")) {
        localStorage.removeItem("admin_token");
        navigate("/admin/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteScan = async (scanId) => {
    if (!confirm(`Are you sure you want to delete scan ${scanId}?`)) {
      return;
    }

    try {
      const token = localStorage.getItem("admin_token");
      const response = await fetch(`${API_BASE}/admin/scans/${scanId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error("Failed to delete scan");
      }

      // Scan deleted successfully
      fetchScans();
    } catch (e) {
      // Error deleting scan
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    navigate("/admin/login");
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading && scans.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-button mx-auto"></div>
          <p className="mt-4 text-primary">Loading scans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <AdminHeader onLogout={handleLogout} />
      
      <div className="flex">
        <AdminSidebar 
          currentPage="scans" 
          onAddUser={() => navigate("/admin/users")}
        />
        
        <main className="flex-1 p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-primary mb-2">Scan Management</h1>
            <p className="text-primary opacity-70">
              Monitor and manage all scan operations.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {/* Scans Table */}
          <div className="bg-white rounded-xl border border-accent overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-accent">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">Scan ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">Listing URL</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">Result</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-accent">
                  {scans.map((scan) => (
                    <tr key={scan.id} className="hover:bg-accent transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-primary">#{scan.id}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-primary">{scan.user_name}</div>
                          <div className="text-sm text-primary opacity-70">{scan.user_email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-primary max-w-md truncate">
                          <a 
                            href={scan.listing_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="hover:underline"
                          >
                            {scan.listing_url}
                          </a>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          {scan.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-primary opacity-70">
                        {formatDate(scan.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => setSelectedScan(scan)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            View
                          </button>
                          <button 
                            onClick={() => handleDeleteScan(scan.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-accent px-6 py-3 flex items-center justify-between">
                <div className="text-sm text-primary opacity-70">
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-accent rounded text-sm disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border border-accent rounded text-sm disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Scan Details Modal */}
      {selectedScan && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-primary">Scan Details</h3>
              <button 
                onClick={() => setSelectedScan(null)}
                className="text-primary opacity-70 hover:opacity-100"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-primary mb-1">Scan ID</label>
                  <div className="text-sm text-primary opacity-70">#{selectedScan.id}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary mb-1">Date</label>
                  <div className="text-sm text-primary opacity-70">{formatDate(selectedScan.created_at)}</div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-primary mb-1">User</label>
                <div className="text-sm text-primary opacity-70">{selectedScan.user_name} ({selectedScan.user_email})</div>
              </div>

              <div>
                <label className="block text-sm font-medium text-primary mb-1">Listing URL</label>
                <div className="text-sm text-primary opacity-70 break-all">
                  <a href={selectedScan.listing_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    {selectedScan.listing_url}
                  </a>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-primary mb-1">Analysis Result</label>
                <div className="bg-accent rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      {selectedScan.label}
                    </span>
                  </div>
                  {selectedScan.output_json && (
                    <div className="text-xs text-primary opacity-70">
                      <pre className="whitespace-pre-wrap max-h-40 overflow-y-auto">
                        {JSON.stringify(JSON.parse(selectedScan.output_json), null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 pt-4 mt-6 border-t border-accent">
              <button 
                onClick={() => setSelectedScan(null)}
                className="flex-1 py-2.5 border border-accent text-primary rounded-lg font-medium hover:bg-accent"
              >
                Close
              </button>
              <button 
                onClick={() => {
                  handleDeleteScan(selectedScan.id);
                  setSelectedScan(null);
                }}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700"
              >
                Delete Scan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
