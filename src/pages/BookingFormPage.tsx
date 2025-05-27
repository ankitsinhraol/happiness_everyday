import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../services/supabase.ts';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext.tsx'; // Assuming AuthContext provides user info

// Define a type for your service data for type safety
interface Service {
  id: string;
  type: string; // e.g., "Photography", "Catering"
  // Add other service properties you might want to display/use
}

interface VendorData {
  business_name: string;
  services: Service[];
}

const BookingFormPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth(); // Get the current authenticated user

  const [vendorId, setVendorId] = useState<string | null>(null);
  const [vendorName, setVendorName] = useState<string>('');
  const [guests, setGuests] = useState<string>('');
  const [locationInput, setLocationInput] = useState<string>('');
  const [totalAmount, setTotalAmount] = useState<string>('');
  const [eventStartDate, setEventStartDate] = useState<string>('');
  const [eventStartTime, setEventStartTime] = useState<string>('');
  const [eventEndDate, setEventEndDate] = useState<string>('');
  const [eventEndTime, setEventEndTime] = useState<string>('');
  const [eventType, setEventType] = useState<string>('');     // Maps to 'event_type' column
  const [message, setMessage] = useState<string>('');         // Maps to 'message' column
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null); // Maps to 'service_id' column
  const [vendorServices, setVendorServices] = useState<Service[]>([]); // To populate service dropdown

  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    // Extract vendorId from URL query parameters
    const params = new URLSearchParams(location.search);
    const idFromUrl = params.get('vendor');
    if (idFromUrl) {
      setVendorId(idFromUrl);
      // Fetch vendor details and their services to display on the form
      fetchVendorDetailsAndServices(idFromUrl);
    } else {
      toast.error("No vendor specified for booking.");
      navigate('/customer-dashboard'); // Redirect if no vendor ID is found
    }
  }, [location.search, navigate]);

  const fetchVendorDetailsAndServices = async (id: string) => {
    setLoading(true);
    // Fetch vendor business name and their services
    const { data, error } = await supabase
      .from('vendors')
      .select('business_name, services(id, type)')
      .eq('id', id)
      .single() as { data: VendorData | null, error: any };

    if (error) {
      console.error('Error fetching vendor details and services:', error);
      toast.error('Failed to load vendor details.');
      navigate('/customer-dashboard');
    } else if (data) {
      setVendorName(data.business_name);
      setVendorServices(data.services || []); // Populate services for dropdown
    }
    setLoading(false);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    if (!user || !user.id) {
      toast.error('You must be logged in to make a booking.');
      setLoading(false);
      return;
    }

    if (!vendorId) {
      toast.error('Vendor not specified for booking.');
      setLoading(false);
      return;
    }

    // Combine date and time inputs into full ISO date-time strings
    const startDateTime = new Date(`${eventStartDate}T${eventStartTime}`);
    const endDateTime = new Date(`${eventEndDate}T${eventEndTime}`);

    if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
      toast.error('Invalid date or time format.');
      setLoading(false);
      return;
    }

    if (endDateTime <= startDateTime) {
      toast.error('Event end time must be after start time.');
      setLoading(false);
      return;
    }

    // Extract event_date (YYYY-MM-DD) from event_start_datetime
    const eventDate = startDateTime.toISOString().split('T')[0];

    // Construct the new booking object matching your Supabase table schema
    const newBooking = {
      vendor_id: vendorId,
      user_id: user.id, // Use 'user_id' as per your Supabase schema for the customer
      service_id: selectedServiceId, // Will be null if nothing is selected from dropdown
      status: 'pending', // Default status for new bookings
      guests: parseInt(guests, 10),
      location: locationInput,
      total_amount: parseFloat(totalAmount),
      event_date: eventDate,
      event_type: eventType,
      message: message,
      event_start_datetime: startDateTime.toISOString(), // Supabase expects ISO string
      event_end_datetime: endDateTime.toISOString(),   // Supabase expects ISO string
    };

    const { error } = await supabase
      .from('bookings')
      .insert([newBooking]);

    if (error) {
      console.error('Error creating booking:', error);
      toast.error('Failed to create booking: ' + error.message);
    } else {
      toast.success('Booking created successfully!');
      navigate('/customer-dashboard'); // Redirect after successful booking
    }
    setLoading(false);
  };

  if (loading && !vendorName) {
    return <div className="container mx-auto p-4">Loading vendor details...</div>;
  }

  if (!vendorId || !vendorName) {
    return <div className="container mx-auto p-4">Error: Vendor not found or specified.</div>;
  }

  return (
    <div className="container mx-auto p-4 max-w-md">
      <h1 className="text-2xl font-bold mb-4">Book {vendorName}</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="service" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            What type of service are you booking for?
          </label>
          <select
            id="service"
            value={selectedServiceId || ''} // Use empty string for no selection in dropdown
            onChange={(e: ChangeEvent<HTMLSelectElement>) => setSelectedServiceId(e.target.value || null)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            // IMPORTANT: If 'service_id' in your 'bookings' DB table is NOT NULL, uncomment the line below:
            // required={true}
          >
            <option value="">{vendorServices.length > 0 ? "Select primary service type" : "No service types listed"}</option>
            {vendorServices.map((service) => (
              <option key={service.id} value={service.id}>
                {service.type}
              </option>
            ))}
          </select>
          {vendorServices.length === 0 && <p className="text-sm text-gray-500 mt-1">This vendor has no service types listed yet.</p>}
        </div>

        <div>
          <label htmlFor="eventType" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            Event Type:
          </label>
          <input
            type="text"
            id="eventType"
            value={eventType}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setEventType(e.target.value)}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="e.g., Wedding, Birthday, Corporate Event"
          />
        </div>

        <div>
          <label htmlFor="guests" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            Number of Guests:
          </label>
          <input
            type="number"
            id="guests"
            value={guests}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setGuests(e.target.value)}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>

        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            Event Location:
          </label>
          <input
            type="text"
            id="location"
            value={locationInput}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setLocationInput(e.target.value)}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>

        <div>
          <label htmlFor="totalAmount" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            Estimated Total Amount (e.g., agreed price):
          </label>
          <input
            type="number"
            id="totalAmount"
            value={totalAmount}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setTotalAmount(e.target.value)}
            step="0.01"
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>

        <div>
          <label htmlFor="eventStartDate" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            Event Start Date:
          </label>
          <input
            type="date"
            id="eventStartDate"
            value={eventStartDate}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setEventStartDate(e.target.value)}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>

        <div>
          <label htmlFor="eventStartTime" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            Event Start Time:
          </label>
          <input
            type="time"
            id="eventStartTime"
            value={eventStartTime}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setEventStartTime(e.target.value)}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>

        <div>
          <label htmlFor="eventEndDate" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            Event End Date:
          </label>
          <input
            type="date"
            id="eventEndDate"
            value={eventEndDate}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setEventEndDate(e.target.value)}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>

        <div>
          <label htmlFor="eventEndTime" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            Event End Time:
          </label>
          <input
            type="time"
            id="eventEndTime"
            value={eventEndTime}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setEventEndTime(e.target.value)}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            Additional Message / Special Requests:
          </label>
          <textarea
            id="message"
            value={message}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setMessage(e.target.value)}
            rows={3}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="Any specific requests or details for the vendor?"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Submitting...' : 'Confirm Booking'}
        </button>
      </form>
    </div>
  );
};

export default BookingFormPage;