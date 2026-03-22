'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CircleCheck as CheckCircle, MapPin, Clock, Phone, Calendar } from 'lucide-react';

function ConfirmationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('bookingId');

  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (bookingId) {
      fetchBooking();
    }
  }, [bookingId]);

  const fetchBooking = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('bookings')
        .select(`
          *,
          motels(name, address, city, phone),
          rooms(room_type, price_per_slot),
          time_slots(date, start_time, end_time)
        `)
        .eq('booking_id', bookingId)
        .maybeSingle();

      setBooking(data);
    } catch (error) {
      console.error('Error fetching booking:', error);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-3xl mx-auto text-center">Loading confirmation...</div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xl mb-4">Booking not found</p>
          <Button onClick={() => router.push('/')}>Go Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <Card className="mb-6 border-green-200 bg-green-50">
          <CardContent className="p-8 text-center">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-green-900 mb-2">Booking Confirmed!</h1>
            <p className="text-green-700 text-lg">
              Your booking has been successfully confirmed
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader className="bg-gray-50">
            <CardTitle className="text-center">Booking Reference</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <p className="text-center text-4xl font-bold text-blue-600 tracking-wider">
              {booking.booking_id}
            </p>
            <p className="text-center text-sm text-gray-600 mt-2">
              Save this reference number to check your booking status
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
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
                <p className="font-semibold">Contact Phone</p>
                <p className="text-gray-600">{booking.motels?.phone}</p>
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Total Paid</span>
                <span className="text-2xl font-bold text-blue-600">
                  ${booking.rooms?.price_per_slot}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-3">Important Information</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Please arrive at the check-in time specified above</li>
              <li>• Bring a valid ID for verification</li>
              <li>• Your booking reference: <strong>{booking.booking_id}</strong></li>
              <li>• Contact the motel if you need to make changes</li>
            </ul>
          </CardContent>
        </Card>

        <div className="mt-8 flex gap-4">
          <Button
            className="flex-1"
            onClick={() => router.push('/')}
          >
            Back to Home
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => router.push('/check-booking')}
          >
            Check Booking Status
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function BookingConfirmationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 py-12 px-4">Loading...</div>}>
      <ConfirmationContent />
    </Suspense>
  );
}
