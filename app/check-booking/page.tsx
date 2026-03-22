'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MapPin, Clock, Phone, Calendar, Search } from 'lucide-react';

export default function CheckBookingPage() {
  const [bookingId, setBookingId] = useState('');
  const [lastName, setLastName] = useState('');
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setBooking(null);

    try {
      const { data, error: searchError } = await supabase
        .from('bookings')
        .select(`
          *,
          motels(name, address, city, phone),
          rooms(room_type, price_per_slot),
          time_slots(date, start_time, end_time)
        `)
        .eq('booking_id', bookingId.toUpperCase())
        .ilike('last_name', lastName)
        .maybeSingle();

      if (searchError) throw searchError;

      if (!data) {
        setError('Booking not found. Please check your booking ID and last name.');
      } else {
        setBooking(data);
      }
    } catch (err: any) {
      setError(err.message || 'Error searching for booking');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Check Booking Status</h1>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Enter Booking Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="bookingId">Booking ID</Label>
                <Input
                  id="bookingId"
                  type="text"
                  placeholder="MS-XXXXXXXX"
                  value={bookingId}
                  onChange={(e) => setBookingId(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Enter your last name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                <Search className="mr-2 h-4 w-4" />
                {loading ? 'Searching...' : 'Search Booking'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {booking && (
          <div className="space-y-6">
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-700">Booking Status</p>
                    <p className="text-2xl font-bold text-green-900 capitalize">
                      {booking.status}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-green-700">Booking ID</p>
                    <p className="text-xl font-bold text-green-900">
                      {booking.booking_id}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Booking Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 mr-3 mt-1 text-gray-600" />
                  <div>
                    <p className="font-semibold">{booking.motels?.name}</p>
                    <p className="text-gray-600">
                      {booking.motels?.address}, {booking.motels?.city}
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Calendar className="h-5 w-5 mr-3 mt-1 text-gray-600" />
                  <div>
                    <p className="font-semibold">Check-in Date</p>
                    <p className="text-gray-600">
                      {new Date(booking.time_slots?.date || booking.booking_date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Clock className="h-5 w-5 mr-3 mt-1 text-gray-600" />
                  <div>
                    <p className="font-semibold">Time Slot</p>
                    <p className="text-gray-600">
                      {formatTime(booking.time_slots?.start_time)} - {formatTime(booking.time_slots?.end_time)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Phone className="h-5 w-5 mr-3 mt-1 text-gray-600" />
                  <div>
                    <p className="font-semibold">Motel Contact</p>
                    <p className="text-gray-600">{booking.motels?.phone}</p>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Room Type</span>
                    <span className="text-lg capitalize">{booking.rooms?.room_type}</span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-lg font-semibold">Total Amount</span>
                    <span className="text-2xl font-bold text-blue-600">
                      ${booking.rooms?.price_per_slot}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-3">Need Help?</h3>
                <p className="text-sm text-gray-600 mb-4">
                  For any changes or cancellations, please contact the motel directly at{' '}
                  <a href={`tel:${booking.motels?.phone}`} className="text-blue-600 hover:underline">
                    {booking.motels?.phone}
                  </a>
                </p>
                <Button asChild variant="outline" className="w-full">
                  <a href={`tel:${booking.motels?.phone}`}>
                    <Phone className="mr-2 h-4 w-4" />
                    Call Motel
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
