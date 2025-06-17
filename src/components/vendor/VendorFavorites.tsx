import React, { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase';

const VendorFavorites: React.FC = () => {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchFavorites = async () => {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      const user = session ? session.user : null;
      if (!user) {
        setFavorites([]);
        setLoading(false);
        return;
      }
      // Fetch vendor profile for current user
      const { data: vendorProfiles, error: vendorError } = await supabase
        .from('vendor_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (vendorError || !vendorProfiles) {
        setFavorites([]);
        setLoading(false);
        return;
      }

      // Assuming there is a favorites table with vendor_id and customer_id
      const { data, error } = await supabase
        .from('favorites')
        .select('customer_id, customers(name, email)')
        .eq('vendor_id', vendorProfiles.id);

      if (error) {
        setFavorites([]);
      } else {
        setFavorites(data || []);
      }
      setLoading(false);
    };

    fetchFavorites();
  }, []);

  if (loading) {
    return <p>Loading favorites...</p>;
  }

  if (favorites.length === 0) {
    return <p>No customers have favorited you yet.</p>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Favorites</h2>
      <ul className="space-y-2">
        {favorites.map((fav) => (
          <li key={fav.customer_id} className="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
            <p className="font-semibold">{fav.customers?.name || 'Customer'}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{fav.customers?.email}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default VendorFavorites;
