import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../services/supabase.ts';
import { User, Database } from '../types/supabase.ts';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

type AuthProviderProps = {
  children: ReactNode;
};

type UserRole = 'customer' | 'vendor' | 'admin';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isVendor: boolean;
  vendorProfile: Database['public']['Tables']['vendors']['Row'] | null;
  login: (email: string, password: string) => Promise<{ error: any | null }>;
  register: (email: string, password: string, name: string, role: UserRole) => Promise<{ error: any | null }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [vendorProfile, setVendorProfile] = useState<Database['public']['Tables']['vendors']['Row'] | null>(null);
  const navigate = useNavigate();

  // Check if the user is a vendor
  const isVendor = user?.role === 'vendor';

  // Initialize the auth state and fetch user profile
  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);

      // Check if user is logged in
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        try {
          // Get user data from our users table using the session.user.id
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (userError) {
            console.error('Error fetching user data on initAuth:', userError);
            await supabase.auth.signOut();
            setUser(null);
          } else {
            setUser(userData);
            
            // If user is a vendor, fetch their vendor profile
            if (userData.role === 'vendor') {
              const { data: vendorData, error: vendorError } = await supabase
                .from('vendors')
                .select('*')
                .eq('user_id', userData.id)
                .single();
                
              if (!vendorError && vendorData) {
                setVendorProfile(vendorData);
              }
            }
          }
        } catch (error) {
          console.error('Error in initAuth fetching user data:', error);
          await supabase.auth.signOut();
          setUser(null);
        }
      }

      // Set up auth state listener
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (event === 'SIGNED_IN' && session) {
            // When signed in, fetch the user's profile from your 'users' table
            const { data: userData, error: userError } = await supabase
              .from('users')
              .select('*')
              .eq('id', session.user.id)
              .single();

            if (userError) {
              console.error('Error fetching user data on SIGNED_IN:', userError);
              await supabase.auth.signOut();
              setUser(null);
            } else {
              setUser(userData);
              // Redirect based on role
              if (userData.role === 'vendor') {
                navigate('/vendor-dashboard');
              } else if (userData.role === 'customer') {
                navigate('/customer-dashboard');
              } else {
                navigate('/dashboard');
              }
            }
          } else if (event === 'SIGNED_OUT') {
            setUser(null);
            navigate('/login');
          }
        }
      );

      setIsLoading(false);

      // Cleanup subscription
      return () => {
        subscription.unsubscribe();
      };
    };

    initAuth();
  }, [navigate]);

  const register = async (email: string, password: string, name: string, role: UserRole) => {
    try {
      // First, create the auth user
      // Pass name and role in the 'data' option for the Supabase trigger to pick up
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
            role: role
          }
        }
      });

      if (authError) {
        toast.error(authError.message);
        return { error: authError };
      }

      if (!authData.user) {
        toast.error('Registration failed');
        return { error: new Error('Registration failed') };
      }

      // 🚨 REMOVED DIRECT INSERT TO PUBLIC.USERS HERE 🚨
      // The PostgreSQL trigger (handle_new_user) will now handle this automatically.

      toast.success('Registration successful! Please check your email to verify your account.');
      navigate('/login');
      return { error: null };
    } catch (error) {
      console.error('Unexpected error during registration:', error);
      toast.error('An unexpected error occurred');
      return { error };
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error(error.message);
        return { error };
      }

      if (data.user) {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (userError) {
          console.error('Error fetching user data:', userError);
          toast.error('Error retrieving user profile');
          await supabase.auth.signOut();
          return { error: userError };
        }

        setUser(userData);
        toast.success('Logged in successfully!');

        // Redirect based on role
        if (userData.role === 'vendor') {
          navigate('/vendor-dashboard');
        } else if (userData.role === 'customer') {
          navigate('/customer-dashboard');
        } else {
          navigate('/dashboard');
        }
      }

      return { error: null };
    } catch (error) {
      console.error('An error occurred during login:', error);
      toast.error('An error occurred during login');
      return { error };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    toast.success('Logged out successfully!');
    navigate('/');
  };

  const value = {
    user,
    isLoading,
    isVendor,
    vendorProfile,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};