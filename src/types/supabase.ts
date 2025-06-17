export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          name: string; 
          email: string;
          role: 'customer' | 'vendor' | 'admin';
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          role?: 'customer' | 'vendor' | 'admin';
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          role?: 'customer' | 'vendor' | 'admin';
          created_at?: string;
        };
      };
      vendors: {
        Row: {
          id: string;
          user_id: string; 
          business_name: string;
          city: string;
          phone: string;
          email: string;
          description: string;
          logo_url?: string;
          website?: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          business_name: string;
          city: string;
          phone: string;
          email: string;
          description: string;
          logo_url?: string;
          website?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          business_name?: string;
          city?: string;
          phone?: string;
          email?: string;
          description?: string;
          logo_url?: string;
          website?: string;
          created_at?: string;
        };
      };
      services: {
        Row: {
          id: string;
          vendor_id: string;
          type: string;
          min_price: number;
          max_price: number;
          description: string;
          event_types_supported: string[];
          created_at: string;
        };
        Insert: {
          id?: string;
          vendor_id: string;
          type: string;
          min_price: number;
          max_price: number;
          description: string;
          event_types_supported?: string[];
          created_at?: string;
        };
        Update: {
          id?: string;
          vendor_id?: string;
          type?: string;
          min_price?: number;
          max_price?: number;
          description?: string;
          event_types_supported?: string[];
          created_at?: string;
        };
      };
      bookings: {
        Row: {
          id: string;
          user_id: string;
          vendor_id: string;
          service_id: string;
          event_date: string;
          event_type: string;
          message: string;
          status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          vendor_id: string;
          service_id: string;
          event_date: string;
          event_type: string;
          message: string;
          status?: 'pending' | 'confirmed' | 'completed' | 'cancelled';
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          vendor_id?: string;
          service_id?: string;
          event_date?: string;
          event_type?: string;
          message?: string;
          status?: 'pending' | 'confirmed' | 'completed' | 'cancelled';
          created_at?: string;
        };
      };
      availability: {
        Row: {
          id: string;
          vendor_id: string;
          date: string;
          status: 'available' | 'unavailable';
          created_at: string;
        };
        Insert: {
          id?: string;
          vendor_id: string;
          date: string;
          status: 'available' | 'unavailable';
          created_at?: string;
        };
        Update: {
          id?: string;
          vendor_id?: string;
          date?: string;
          status?: 'available' | 'unavailable';
          created_at?: string;
        };
      };
      reviews: {
        Row: {
          id: string;
          user_id: string;
          vendor_id: string;
          booking_id: string;
          rating: number;
          review_text: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          vendor_id: string;
          booking_id: string;
          rating: number;
          review_text: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          vendor_id?: string;
          booking_id?: string;
          rating?: number;
          review_text?: string;
          created_at?: string;
        };
      };
      vendor_images: {
        Row: {
          id: string;
          vendor_id: string;
          image_url: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          vendor_id: string;
          image_url: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          vendor_id?: string;
          image_url?: string;
          created_at?: string;
        };
      };
      ai_query_log: {
        Row: {
          id: string;
          user_id?: string;
          query_text: string;
          ai_parsed_data: Record<string, any>;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          query_text: string;
          ai_parsed_data: Record<string, any>;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          query_text?: string;
          ai_parsed_data?: Record<string, any>;
          created_at?: string;
        };
      };
    };
  };
}

export type User = Database['public']['Tables']['users']['Row'];
export type Vendor = Database['public']['Tables']['vendors']['Row'];
export type Service = Database['public']['Tables']['services']['Row'];
export type Booking = Database['public']['Tables']['bookings']['Row'];
export type Availability = Database['public']['Tables']['availability']['Row'];
export type Review = Database['public']['Tables']['reviews']['Row'];
export type VendorImage = Database['public']['Tables']['vendor_images']['Row'];
export type AIQueryLog = Database['public']['Tables']['ai_query_log']['Row'];

export interface SearchFilters {
  location?: string;
  eventType?: string;
  vendorType?: string;
  budget?: {
    min?: number;
    max?: number;
  };
  date?: string;
  query?: string;
}

export interface AISearchResult {
  filters: SearchFilters;
  originalQuery: string;
}