import React, { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import { supabase } from '../../services/supabase';

const VendorReviews: React.FC = () => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      // Get current user from Supabase auth session
      const { data: { session } } = await supabase.auth.getSession();
      const user = session ? session.user : null;
      if (!user) {
        setReviews([]);
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
        setReviews([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('vendor_reviews')
        .select('id, rating, review_text, created_at, user_id')
        .eq('vendor_id', vendorProfiles.id)
        .order('created_at', { ascending: false });

      if (error) {
        setReviews([]);
      } else {
        setReviews(data || []);
      }
      setLoading(false);
    };

    fetchReviews();
  }, []);

  if (loading) {
    return <p>Loading reviews...</p>;
  }

  if (reviews.length === 0) {
    return <p>No reviews found.</p>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">My Reviews</h2>
      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
            <div className="flex items-center mb-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={20}
                  className={i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
                />
              ))}
            </div>
            <p className="text-gray-700 dark:text-gray-300 mb-2">{review.review_text}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {new Date(review.created_at).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VendorReviews;
