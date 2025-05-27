import React, { useState, useEffect, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';

const CustomerDashboardPage: React.FC = () => {
  const navigate = useNavigate();

  const [location, setLocation] = useState<string>('');
  const [budget, setBudget] = useState<string>('');
  const [vendorType, setVendorType] = useState<string>('');
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSearch = async () => {
    setLoading(true);
    // Query vendors joined with services to filter by location, vendorType, and budget
    let query = supabase
      .from('vendors')
      .select(`
        id,
        user_id,
        business_name,
        city,
        phone,
        email,
        description,
        logo_url,
        website,
        services:services (
          id,
          type,
          min_price,
          max_price,
          description,
          event_types_supported
        )
      `);

    if (location.trim() !== '') {
      query = query.ilike('city', `%${location.trim()}%`);
    }

    if (vendorType.trim() !== '') {
      // Filter vendors having services matching vendorType
      query = query.or(`services.type.ilike.%${vendorType.trim()}%`);
    }

    if (budget.trim() !== '') {
      const budgetNum = parseInt(budget, 10);
      if (!isNaN(budgetNum)) {
        // Filter vendors having services with max_price <= budgetNum
        query = query.lte('services.max_price', budgetNum);
      }
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching vendors:', error);
      setVendors([]);
    } else {
      setVendors(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    handleSearch();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Customer Dashboard</h1>

      {/* Search Bar */}
      <div className="flex flex-wrap gap-4 mb-6">
        <input
          type="text"
          placeholder="Location (e.g., Delhi)"
          value={location}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setLocation(e.target.value)}
          className="border rounded px-3 py-2 flex-grow min-w-[200px]"
        />
        <input
          type="number"
          placeholder="Budget (e.g., 50000)"
          value={budget}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setBudget(e.target.value)}
          className="border rounded px-3 py-2 w-32"
        />
        <input
          type="text"
          placeholder="Vendor Type (e.g., Photographer)"
          value={vendorType}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setVendorType(e.target.value)}
          className="border rounded px-3 py-2 flex-grow min-w-[200px]"
        />
        <button
          onClick={handleSearch}
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition"
        >
          Search
        </button>
      </div>

      {/* Vendor Results */}
      {loading ? (
        <p>Loading vendors...</p>
      ) : vendors.length === 0 ? (
        <p>No vendors found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vendors.map((vendor) => (
            <div key={vendor.id} className="border rounded p-4 shadow hover:shadow-lg transition">
              <h2 className="text-xl font-semibold mb-2">{vendor.business_name}</h2>
              <p className="mb-1">Location: {vendor.city}</p>
              <p className="mb-1">Price Range: {vendor.price_range}</p>
              <p className="mb-2">Services: {vendor.services.join(', ')}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => navigate(`/vendor/${vendor.id}`)}
                  className="bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700 transition"
                >
                  View Profile
                </button>
                <button
                  onClick={() => navigate(`/messages/new?to=${vendor.user_id}`)}
                  className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300 transition"
                >
                  Message
                </button>
                <button
                  onClick={() => navigate(`/vendor/${vendor.id}/availability`)}
                  className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300 transition"
                >
                  Check Availability
                </button>
                <button
                  onClick={() => navigate(`/bookings/new?vendor=${vendor.id}`)}
                  className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition"
                >
                  Book Now
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomerDashboardPage;
