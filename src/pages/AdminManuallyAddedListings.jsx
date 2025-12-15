import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminHeader from "../components/admin/AdminHeader";
import AdminSidebar from "../components/admin/AdminSidebar";
import { API_BASE } from "../config/api";

export default function AdminManuallyAddedListings() {
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const adminToken = localStorage.getItem("admin_token");
    if (!adminToken) {
      navigate("/admin/login");
      return;
    }
    
    fetchListings();
  }, [navigate, currentPage, search]);

  const fetchListings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("admin_token");
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "50"
      });
      
      if (search) {
        params.append("search", search);
      }

      const response = await fetch(`${API_BASE}/admin/manually-added-listings?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error("Failed to fetch listings");
      }

      const data = await response.json();
      setListings(data.listings || []);
      setTotalPages(data.pages || 1);
      setTotal(data.total || 0);
      
      if (data.message) {
        setError(data.message);
      } else {
        setError("");
      }
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

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    navigate("/admin/login");
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchListings();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading && listings.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-button mx-auto"></div>
          <p className="mt-4 text-primary">Loading listings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <AdminHeader onLogout={handleLogout} />
      
      <div className="flex">
        <AdminSidebar 
          currentPage="manually-added-listings" 
          onAddUser={() => navigate("/admin/users")}
        />
        
        <main className="flex-1 p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-primary mb-2">Manually Added Listings</h1>
            <p className="text-primary opacity-70">
              Track all listings that were manually added to the database by admins.
            </p>
          </div>

          {error && (
            <div className={`mb-4 p-4 rounded-lg ${
              error.includes("Tracking table") 
                ? "bg-yellow-50 border border-yellow-200 text-yellow-800"
                : "bg-red-50 border border-red-200 text-red-600"
            }`}>
              <p>{error}</p>
              {error.includes("Tracking table") && (
                <p className="mt-2 text-sm">
                  To enable tracking, run the SQL migration file:
                  <code className="block mt-2 p-2 bg-yellow-100 rounded text-xs">
                    backend/backend/add_admin_tracking_migration.sql
                  </code>
                  <p className="mt-2 text-xs">This creates a separate tracking table without modifying listings_clean.</p>
                </p>
              )}
            </div>
          )}

          {/* Search */}
          <div className="bg-white rounded-xl border border-accent p-6 mb-6">
            <form onSubmit={handleSearchSubmit} className="flex gap-4 items-center">
              <div className="flex-1 max-w-md relative">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by title, URL, or location..."
                  className="w-full px-4 py-2 border border-accent rounded-lg focus:ring-2 focus:ring-button focus:border-button text-primary"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-primary opacity-70 hover:opacity-100"
                >
                  🔍
                </button>
              </div>
              {total > 0 && (
                <div className="text-sm text-primary opacity-70">
                  Total: {total} listings
                </div>
              )}
            </form>
          </div>

          {/* Listings Table */}
          <div className="bg-white rounded-xl border border-accent overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-accent">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">Listing</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">Rating</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">Reviews</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">Added By</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">Date Added</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-accent">
                  {listings.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-8 text-center text-primary opacity-70">
                        {error.includes("Tracking table") 
                          ? "Tracking not enabled. Please run the migration to enable tracking."
                          : "No manually added listings found."
                        }
                      </td>
                    </tr>
                  ) : (
                    listings.map((listing) => (
                      <tr key={listing.property_id} className="hover:bg-accent transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-primary">
                              {listing.listing_title || "Untitled Listing"}
                            </div>
                            <div className="text-sm text-primary opacity-70 truncate max-w-md">
                              <a 
                                href={listing.listing_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="hover:text-button"
                              >
                                {listing.listing_url}
                              </a>
                            </div>
                            <div className="text-xs text-primary opacity-50 mt-1">
                              Property ID: {listing.property_id}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-primary">
                          {listing.location || "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-primary">
                          {listing.rating > 0 ? (
                            <span className="font-medium">{listing.rating.toFixed(1)} ⭐</span>
                          ) : (
                            <span className="opacity-50">N/A</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-primary">
                          {listing.number_of_reviews || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-primary">
                          {listing.added_by_admin_email || "Unknown"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-primary opacity-70">
                          {formatDate(listing.created_at)}
                        </td>
                      </tr>
                    ))
                  )}
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
    </div>
  );
}

