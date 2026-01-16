import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE } from "../config/api";

// Helper functions to detect platform from URL
const isAirbnbUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  return /https?:\/\/(www\.)?(airbnb|abnb)\.(com|fr|co\.uk|ca|com\.au|de|es|it|nl|pl|pt|ru|se|jp|kr|cn|in|br|mx|ar|cl|co|pe|za|ae|sa|tr|au|nz|ie|be|ch|at|dk|fi|no|gr|cz|hu|ro|bg|hr|sk|si|lt|lv|ee|is|lu|mt|cy)\//i.test(url);
};

const isBookingUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  return /https?:\/\/(www\.)?([a-z]{2}\.)?booking\.(com|fr|co\.uk|ca|com\.au|de|es|it|nl|pl|pt|ru|se|jp|kr|cn|in|br|mx|ar|cl|co|pe|za|ae|sa|tr|au|nz|ie|be|ch|at|dk|fi|no|gr|cz|hu|ro|bg|hr|sk|si|lt|lv|ee|is|lu|mt|cy)/i.test(url);
};

const isAgodaUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  return /https?:\/\/(www\.)?([a-z]{2}\.)?agoda\.(com|fr|co\.uk|ca|com\.au|de|es|it|nl|pl|pt|ru|se|jp|kr|cn|in|br|mx|ar|cl|co|pe|za|ae|sa|tr|au|nz|ie|be|ch|at|dk|fi|no|gr|cz|hu|ro|bg|hr|sk|si|lt|lv|ee|is|lu|mt|cy)/i.test(url);
};

const isExpediaUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  return /https?:\/\/(www\.)?([a-z]{2}\.)?expedia\.(com|fr|co\.uk|ca|com\.au|de|es|it|nl|pl|pt|ru|se|jp|kr|cn|in|br|mx|ar|cl|co|pe|za|ae|sa|tr|au|nz|ie|be|ch|at|dk|fi|no|gr|cz|hu|ro|bg|hr|sk|si|lt|lv|ee|is|lu|mt|cy)/i.test(url) || /https?:\/\/expe\.app\.link/i.test(url);
};

const detectPlatformFromUrl = (url) => {
  if (!url) return 'airbnb'; // default
  
  if (isAirbnbUrl(url)) return 'airbnb';
  if (isBookingUrl(url)) return 'booking.com';
  if (isAgodaUrl(url)) return 'agoda';
  if (isExpediaUrl(url)) return 'expedia';
  
  return 'airbnb'; // default fallback
};

export default function AdminMissingListings() {
  const navigate = useNavigate();
  const [missingListings, setMissingListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);
  const [formData, setFormData] = useState({
    listing_url: '',
    property_id: '',
    platform: 'airbnb',
    listing_title: '',
    listing_description: '',
    listing_highlights: [],
    amenities: [],
    house_rules: '',
    location: '',
    lat: 0,
    long: 0,
    rating: 0,
    number_of_reviews: 0,
    most_recent_reviews: [],
    older_reviews: [],
    accuracy_rating: 0,
    value_rating: 0,
    cleanliness_rating: 0,
    communication_rating: 0,
    checkin_rating: 0,
    location_rating: 0,
    cleaning_fee: 0,
    is_superhost: false,
    is_guest_favorite: false,
    host_rating: 0,
    host_response_time: '',
    host_response_rate: 0,
    listing_type: '',
    number_of_guests: 0,
    number_of_bedrooms: 0,
    number_of_bathrooms: 0,
    sleeping_arrangement: [],
    reviews: []
  });
  const [addingListing, setAddingListing] = useState(false);

  useEffect(() => {
    loadMissingListings();
  }, []);

  const loadMissingListings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${API_BASE}/admin/missing-listings`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load missing listings');
      }

      const data = await response.json();
      setMissingListings(data.missing_listings || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (listingId, newStatus) => {
    try {
      setUpdatingStatus(listingId);
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${API_BASE}/admin/missing-listings/${listingId}/status`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      // Reload the listings
      await loadMissingListings();
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdatingStatus(null);
    }
  };

  const openAddForm = (listing) => {
    setSelectedListing(listing);
    
    // Auto-detect platform from URL
    const detectedPlatform = detectPlatformFromUrl(listing.listing_url);
    
    // Extract property ID from URL based on platform
    let propertyId = '';
    if (detectedPlatform === 'airbnb') {
      // Airbnb: https://www.airbnb.com/rooms/123456789
      propertyId = listing.listing_url.split('/rooms/').pop()?.split('?')[0] || '';
    } else if (detectedPlatform === 'booking.com') {
      // Booking.com: Extract from URL path or use last segment
      const urlParts = listing.listing_url.split('/').filter(p => p);
      propertyId = urlParts[urlParts.length - 1]?.replace(/\.html$/, '') || '';
    } else if (detectedPlatform === 'agoda') {
      // Agoda: Extract first path segment
      const urlParts = listing.listing_url.split('/').filter(p => p && !p.includes('.'));
      propertyId = urlParts[urlParts.length - 1] || '';
    } else if (detectedPlatform === 'expedia') {
      // Expedia: Extract property ID from URL
      const urlParts = listing.listing_url.split('/').filter(p => p);
      propertyId = urlParts[urlParts.length - 1] || '';
    }
    
    // If property ID extraction failed, use fallback method
    if (!propertyId) {
      propertyId = listing.listing_url.split('/').pop()?.split('?')[0] || '';
    }
    
    // Reset form data completely to ensure clean state
    setFormData({
      listing_url: listing.listing_url,
      property_id: propertyId,
      platform: detectedPlatform, // Auto-detect platform
      listing_title: '',
      listing_description: '',
      listing_highlights: [],
      amenities: [],
      house_rules: '',
      location: '',
      lat: 0,
      long: 0,
      rating: 0,
      number_of_reviews: 0,
      most_recent_reviews: [],
      older_reviews: [],
      accuracy_rating: 0,
      value_rating: 0,
      cleanliness_rating: 0,
      communication_rating: 0,
      checkin_rating: 0,
      location_rating: 0,
      cleaning_fee: 0,
      is_superhost: false,
      is_guest_favorite: false,
      host_rating: 0,
      host_response_time: '',
      host_response_rate: 0,
      listing_type: '',
      number_of_guests: 0,
      number_of_bedrooms: 0,
      number_of_bathrooms: 0,
      sleeping_arrangement: [],
      reviews: []
    });
    setError(''); // Clear any previous errors
    setShowAddForm(true);
  };

  const handleFormChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addArrayItem = (field, value) => {
    if (value.trim()) {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], value.trim()]
      }));
    }
  };

  const removeArrayItem = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const addListing = async () => {
    try {
      setAddingListing(true);
      
      // Validate required fields
      const requiredFields = ['listing_url', 'property_id', 'listing_title', 'location'];
      const missingFields = requiredFields.filter(field => !formData[field] || formData[field].toString().trim() === '');
      
      if (missingFields.length > 0) {
        setError(`Please fill in the following required fields: ${missingFields.join(', ')}`);
        setAddingListing(false);
        return;
      }
      
      // Clean up form data to ensure arrays are properly formatted
      const cleanedFormData = {
        ...formData,
        listing_highlights: Array.isArray(formData.listing_highlights) ? formData.listing_highlights : [],
        amenities: Array.isArray(formData.amenities) ? formData.amenities : [],
        most_recent_reviews: Array.isArray(formData.most_recent_reviews) ? formData.most_recent_reviews : [],
        older_reviews: Array.isArray(formData.older_reviews) ? formData.older_reviews : [],
        sleeping_arrangement: Array.isArray(formData.sleeping_arrangement) ? formData.sleeping_arrangement : [],
        reviews: Array.isArray(formData.reviews) ? formData.reviews : [],
        // Ensure numeric fields are properly formatted
        lat: parseFloat(formData.lat) || 0,
        long: parseFloat(formData.long) || 0,
        rating: parseFloat(formData.rating) || 0,
        number_of_reviews: parseInt(formData.number_of_reviews) || 0,
        accuracy_rating: parseFloat(formData.accuracy_rating) || 0,
        value_rating: parseFloat(formData.value_rating) || 0,
        cleanliness_rating: parseFloat(formData.cleanliness_rating) || 0,
        communication_rating: parseFloat(formData.communication_rating) || 0,
        checkin_rating: parseFloat(formData.checkin_rating) || 0,
        location_rating: parseFloat(formData.location_rating) || 0,
        cleaning_fee: parseFloat(formData.cleaning_fee) || 0,
        host_rating: parseFloat(formData.host_rating) || 0,
        host_response_rate: parseFloat(formData.host_response_rate) || 0,
        number_of_guests: parseInt(formData.number_of_guests) || 0,
        number_of_bedrooms: parseInt(formData.number_of_bedrooms) || 0,
        number_of_bathrooms: parseInt(formData.number_of_bathrooms) || 0,
      };
      
      console.log('🔍 DEBUG: Original form data:', formData);
      console.log('🔍 DEBUG: Cleaned form data being sent:', cleanedFormData);
      console.log('🔍 DEBUG: Array fields check:', {
        listing_highlights: { type: typeof cleanedFormData.listing_highlights, value: cleanedFormData.listing_highlights, isArray: Array.isArray(cleanedFormData.listing_highlights) },
        amenities: { type: typeof cleanedFormData.amenities, value: cleanedFormData.amenities, isArray: Array.isArray(cleanedFormData.amenities) },
        most_recent_reviews: { type: typeof cleanedFormData.most_recent_reviews, value: cleanedFormData.most_recent_reviews, isArray: Array.isArray(cleanedFormData.most_recent_reviews) }
      });
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${API_BASE}/admin/add-listing`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(cleanedFormData)
      });

      if (!response.ok) {
        let errorMessage = 'Failed to add listing';
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorMessage;
        } catch (e) {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        console.error('❌ DEBUG: Add listing error:', errorMessage);
        throw new Error(errorMessage);
      }

      // Close form and reload listings
      setShowAddForm(false);
      setSelectedListing(null);
      await loadMissingListings();
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setAddingListing(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading missing listings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Missing Listings</h1>
              <p className="mt-1 text-sm text-gray-500">
                Track and manage listings that users requested but are not in our database
              </p>
            </div>
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {missingListings.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📋</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Missing Listings</h3>
            <p className="text-gray-500">All requested listings are currently in the database.</p>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {missingListings.map((listing) => (
                <li key={listing.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {listing.listing_url}
                          </p>
                          <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                            <span>Requested by: {listing.requested_by_email || 'Unknown'}</span>
                            <span>IP: {listing.ip_address}</span>
                            <span>Created: {formatDate(listing.created_at)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(listing.status)}`}>
                        {listing.status.replace('_', ' ')}
                      </span>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openAddForm(listing)}
                          className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                        >
                          Add Listing
                        </button>
                        <button
                          onClick={() => updateStatus(listing.id, 'rejected')}
                          disabled={updatingStatus === listing.id}
                          className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 disabled:opacity-50"
                        >
                          {updatingStatus === listing.id ? 'Updating...' : 'Reject'}
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Summary Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-2xl font-bold text-yellow-600">
              {missingListings.filter(l => l.status === 'pending').length}
            </div>
            <div className="text-sm text-gray-500">Pending</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-2xl font-bold text-red-600">
              {missingListings.filter(l => l.status === 'rejected').length}
            </div>
            <div className="text-sm text-gray-500">Rejected</div>
          </div>
        </div>
      </div>

      {/* Add Listing Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Add Listing to Database</h2>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              {/* Required Fields Notice */}
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="text-sm font-semibold text-blue-900 mb-2">Required Fields</h3>
                <p className="text-sm text-blue-700">
                  <strong>Minimum required:</strong> Listing URL, Property ID, Listing Title, Location, and at least one rating (Overall Rating or Number of Reviews).
                </p>
                <p className="text-sm text-blue-600 mt-1">
                  All other fields are optional and can be filled in later. Empty arrays and zero values are automatically handled.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Listing URL <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.listing_url}
                      onChange={(e) => handleFormChange('listing_url', e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-50"
                      readOnly
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Property ID <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.property_id}
                      onChange={(e) => handleFormChange('property_id', e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      placeholder="Enter property ID"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Platform <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.platform}
                      onChange={(e) => handleFormChange('platform', e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    >
                      <option value="airbnb">Airbnb</option>
                      <option value="booking.com">Booking.com</option>
                      <option value="agoda">Agoda</option>
                      <option value="expedia">Expedia</option>
                    </select>
                    <p className="mt-1 text-xs text-gray-500">
                      Platform auto-detected from URL. You can change it if needed.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Listing Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.listing_title}
                      onChange={(e) => handleFormChange('listing_title', e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      placeholder="Enter listing title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Location <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => handleFormChange('location', e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      placeholder="Enter location (e.g., New York, NY)"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Latitude</label>
                      <input
                        type="number"
                        step="any"
                        value={formData.lat}
                        onChange={(e) => handleFormChange('lat', parseFloat(e.target.value))}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Longitude</label>
                      <input
                        type="number"
                        step="any"
                        value={formData.long}
                        onChange={(e) => handleFormChange('long', parseFloat(e.target.value))}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      />
                    </div>
                  </div>
                </div>

                {/* Ratings & Reviews */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Ratings & Reviews</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Overall Rating</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="5"
                        value={formData.rating}
                        onChange={(e) => handleFormChange('rating', parseFloat(e.target.value))}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Number of Reviews</label>
                      <input
                        type="number"
                        value={formData.number_of_reviews}
                        onChange={(e) => handleFormChange('number_of_reviews', parseInt(e.target.value))}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Cleanliness Rating</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="5"
                        value={formData.cleanliness_rating}
                        onChange={(e) => handleFormChange('cleanliness_rating', parseFloat(e.target.value))}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Communication Rating</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="5"
                        value={formData.communication_rating}
                        onChange={(e) => handleFormChange('communication_rating', parseFloat(e.target.value))}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Check-in Rating</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="5"
                        value={formData.checkin_rating}
                        onChange={(e) => handleFormChange('checkin_rating', parseFloat(e.target.value))}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Location Rating</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="5"
                        value={formData.location_rating}
                        onChange={(e) => handleFormChange('location_rating', parseFloat(e.target.value))}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      />
                    </div>
                  </div>

                  {/* Most Recent Reviews Section */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Most Recent Reviews (Last 5 reviews - most recent first)
                    </label>
                    <div className="space-y-2">
                      {formData.most_recent_reviews && formData.most_recent_reviews.length > 0 ? (
                        formData.most_recent_reviews.map((review, index) => (
                          <div key={index} className="flex items-start gap-2 p-2 bg-blue-50 rounded border border-blue-200">
                            <div className="flex-1">
                              <textarea
                                rows="2"
                                value={typeof review === 'string' ? review : JSON.stringify(review)}
                                onChange={(e) => {
                                  const newReviews = [...formData.most_recent_reviews];
                                  try {
                                    newReviews[index] = JSON.parse(e.target.value);
                                  } catch {
                                    newReviews[index] = e.target.value;
                                  }
                                  handleFormChange('most_recent_reviews', newReviews);
                                }}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                                placeholder="Enter review text or JSON object"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => removeArrayItem('most_recent_reviews', index)}
                              className="text-red-600 hover:text-red-800 px-2"
                            >
                              ✕
                            </button>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500">No most recent reviews added. Click "Add Review" below to add one.</p>
                      )}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Enter most recent review text or JSON"
                          className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              const value = e.target.value.trim();
                              if (value) {
                                try {
                                  const parsed = JSON.parse(value);
                                  setFormData(prev => ({
                                    ...prev,
                                    most_recent_reviews: [...(prev.most_recent_reviews || []), parsed]
                                  }));
                                } catch {
                                  setFormData(prev => ({
                                    ...prev,
                                    most_recent_reviews: [...(prev.most_recent_reviews || []), value]
                                  }));
                                }
                                e.target.value = '';
                              }
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            const input = e.target.previousElementSibling;
                            const value = input.value.trim();
                            if (value) {
                              try {
                                const parsed = JSON.parse(value);
                                setFormData(prev => ({
                                  ...prev,
                                  most_recent_reviews: [...(prev.most_recent_reviews || []), parsed]
                                }));
                              } catch {
                                setFormData(prev => ({
                                  ...prev,
                                  most_recent_reviews: [...(prev.most_recent_reviews || []), value]
                                }));
                              }
                              input.value = '';
                            }
                          }}
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                        >
                          Add Review
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Older Reviews Section */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Older Reviews (Up to 15 older reviews - less recent)
                    </label>
                    <div className="space-y-2">
                      {formData.older_reviews && formData.older_reviews.length > 0 ? (
                        formData.older_reviews.map((review, index) => (
                          <div key={index} className="flex items-start gap-2 p-2 bg-gray-50 rounded border">
                            <div className="flex-1">
                              <textarea
                                rows="2"
                                value={typeof review === 'string' ? review : JSON.stringify(review)}
                                onChange={(e) => {
                                  const newReviews = [...formData.older_reviews];
                                  try {
                                    newReviews[index] = JSON.parse(e.target.value);
                                  } catch {
                                    newReviews[index] = e.target.value;
                                  }
                                  handleFormChange('older_reviews', newReviews);
                                }}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                                placeholder="Enter review text or JSON object"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => removeArrayItem('older_reviews', index)}
                              className="text-red-600 hover:text-red-800 px-2"
                            >
                              ✕
                            </button>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500">No older reviews added. Click "Add Review" below to add one.</p>
                      )}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Enter older review text or JSON"
                          className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              const value = e.target.value.trim();
                              if (value) {
                                try {
                                  const parsed = JSON.parse(value);
                                  setFormData(prev => ({
                                    ...prev,
                                    older_reviews: [...(prev.older_reviews || []), parsed]
                                  }));
                                } catch {
                                  setFormData(prev => ({
                                    ...prev,
                                    older_reviews: [...(prev.older_reviews || []), value]
                                  }));
                                }
                                e.target.value = '';
                              }
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            const input = e.target.previousElementSibling;
                            const value = input.value.trim();
                            if (value) {
                              try {
                                const parsed = JSON.parse(value);
                                setFormData(prev => ({
                                  ...prev,
                                  older_reviews: [...(prev.older_reviews || []), parsed]
                                }));
                              } catch {
                                setFormData(prev => ({
                                  ...prev,
                                  older_reviews: [...(prev.older_reviews || []), value]
                                }));
                              }
                              input.value = '';
                            }
                          }}
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                        >
                          Add Review
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Legacy Reviews Section (for backward compatibility) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Legacy Reviews (Optional - use most recent/older reviews above for better organization)
                    </label>
                    <div className="space-y-2">
                      {formData.reviews && formData.reviews.length > 0 ? (
                        formData.reviews.map((review, index) => (
                          <div key={index} className="flex items-start gap-2 p-2 bg-gray-50 rounded border">
                            <div className="flex-1">
                              <textarea
                                rows="2"
                                value={typeof review === 'string' ? review : JSON.stringify(review)}
                                onChange={(e) => {
                                  const newReviews = [...formData.reviews];
                                  try {
                                    newReviews[index] = JSON.parse(e.target.value);
                                  } catch {
                                    newReviews[index] = e.target.value;
                                  }
                                  handleFormChange('reviews', newReviews);
                                }}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                                placeholder="Enter review text or JSON object"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => removeArrayItem('reviews', index)}
                              className="text-red-600 hover:text-red-800 px-2"
                            >
                              ✕
                            </button>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500">No legacy reviews added. Click "Add Review" to add one.</p>
                      )}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Enter review text or JSON (e.g., {'text': 'Great place!', 'rating': 5})"
                          className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              const value = e.target.value.trim();
                              if (value) {
                                try {
                                  const parsed = JSON.parse(value);
                                  setFormData(prev => ({
                                    ...prev,
                                    reviews: [...(prev.reviews || []), parsed]
                                  }));
                                } catch {
                                  setFormData(prev => ({
                                    ...prev,
                                    reviews: [...(prev.reviews || []), value]
                                  }));
                                }
                                e.target.value = '';
                              }
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            const input = e.target.previousElementSibling;
                            const value = input.value.trim();
                            if (value) {
                              try {
                                const parsed = JSON.parse(value);
                                setFormData(prev => ({
                                  ...prev,
                                  reviews: [...(prev.reviews || []), parsed]
                                }));
                              } catch {
                                setFormData(prev => ({
                                  ...prev,
                                  reviews: [...(prev.reviews || []), value]
                                }));
                              }
                              input.value = '';
                            }
                          }}
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                        >
                          Add Review
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Property Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Property Details</h3>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Guests</label>
                      <input
                        type="number"
                        value={formData.number_of_guests}
                        onChange={(e) => handleFormChange('number_of_guests', parseInt(e.target.value))}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Bedrooms</label>
                      <input
                        type="number"
                        value={formData.number_of_bedrooms}
                        onChange={(e) => handleFormChange('number_of_bedrooms', parseInt(e.target.value))}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Bathrooms</label>
                      <input
                        type="number"
                        value={formData.number_of_bathrooms}
                        onChange={(e) => handleFormChange('number_of_bathrooms', parseInt(e.target.value))}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Listing Type</label>
                    <select
                      value={formData.listing_type}
                      onChange={(e) => handleFormChange('listing_type', e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    >
                      <option value="">Select type</option>
                      <option value="Entire place">Entire place</option>
                      <option value="Private room">Private room</option>
                      <option value="Shared room">Shared room</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Cleaning Fee</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.cleaning_fee}
                      onChange={(e) => handleFormChange('cleaning_fee', parseFloat(e.target.value))}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>

                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.is_superhost}
                        onChange={(e) => handleFormChange('is_superhost', e.target.checked)}
                        className="mr-2"
                      />
                      Superhost
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.is_guest_favorite}
                        onChange={(e) => handleFormChange('is_guest_favorite', e.target.checked)}
                        className="mr-2"
                      />
                      Guest Favorite
                    </label>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Description</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Listing Description</label>
                    <textarea
                      rows="4"
                      value={formData.listing_description}
                      onChange={(e) => handleFormChange('listing_description', e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">House Rules</label>
                    <textarea
                      rows="3"
                      value={formData.house_rules}
                      onChange={(e) => handleFormChange('house_rules', e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 mt-6 pt-6 border-t">
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={addListing}
                  disabled={addingListing}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  {addingListing ? 'Adding...' : 'Add Listing'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
