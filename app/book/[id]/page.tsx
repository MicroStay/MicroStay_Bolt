'use client';

import { useEffect, useState, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MapPin, Clock, DollarSign } from 'lucide-react';

function BookingContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const [motelDetails, setMotelDetails] = useState<any>(null);
  const [timeSlot, setTimeSlot] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');

  const roomId = searchParams.get('roomId');
  const motelId = searchParams.get('motelId');
  const date = searchParams.get('date');
  const price = searchParams.get('price');

  useEffect(() => {
    fetchBookingDetails();
  }, [params.id]);

  const fetchBookingDetails = async () => {
    setLoading(true);
    try {
      const { data: slotData } = await supabase
        .from('time_slots')
        .select('*, rooms(*, motels(*))')
        .eq('id', params.id)
        .maybeSingle();

      if (slotData) {
        setTimeSlot(slotData);
        setMotelDetails(slotData.rooms?.motels);
      }
    } catch (error) {
      console.error('Error fetching booking details:', error);
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

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setBooking(true);
    setError('');

    try {
      const { data: slot } = await supabase
        .from('time_slots')
        .select('available')
        .eq('id', params.id)
        .maybeSingle();

      if (!slot?.available) {
        setError('This time slot is no longer available');
        setBooking(false);
        return;
      }

      const { data: bookingIdData } = await supabase
        .rpc('generate_booking_id')
        .maybeSingle();

      const bookingId = bookingIdData || `MS-${Date.now().toString().slice(-8)}`;

      const totalPrice = Number(timeSlot?.rooms?.hourly_rate || price || 0);
      const platformFee = totalPrice * 0.15;
      const vendorPayout = totalPrice - platformFee;

      const { data: newBooking, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          booking_id: bookingId,
          user_id: user?.id || null,
          motel_id: motelId,
          room_id: roomId,
          time_slot_id: params.id,
          booking_date: date,
          last_name: lastName,
          phone: phone,
          status: 'confirmed',
          total_price: totalPrice,
          platform_fee: platformFee,
          vendor_payout: vendorPayout,
          payment_status: 'paid',
          check_in_status: 'pending',
        })
        .select()
        .single();

      if (bookingError) throw bookingError;

      await supabase
        .from('time_slots')
        .update({ available: false })
        .eq('id', params.id);

      router.push(`/booking-confirmation?bookingId=${bookingId}`);
    } catch (error: any) {
      console.error('Error creating booking:', error);
      setError(error.message || 'Failed to create booking');
      setBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-3xl mx-auto text-center">Loading booking details...</div>
      </div>
    );
  }

  if (!timeSlot || !motelDetails) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xl mb-4">Booking not found</p>
          <Button onClick={() => router.push('/search')}>Back to Search</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Complete Your Booking</h1>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Booking Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start">
                <MapPin className="h-5 w-5 mr-3 mt-1 text-gray-600" />
                <div>
                  <p className="font-semibold">{motelDetails.name}</p>
                  <p className="text-gray-600">{motelDetails.address}, {motelDetails.city}</p>
                </div>
              </div>

              <div className="flex items-center">
                <Clock className="h-5 w-5 mr-3 text-gray-600" />
                <div>
                  <p className="font-semibold">
                    {new Date(date || '').toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                  <p className="text-gray-600">
                    {formatTime(timeSlot.start_time)} - {formatTime(timeSlot.end_time)}
                  </p>
                </div>
              </div>

              <div className="flex items-center">
                <DollarSign className="h-5 w-5 mr-3 text-gray-600" />
                <div>
                  <p className="font-semibold text-2xl text-blue-600">${price}</p>
                  <p className="text-gray-600">Total Amount</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleBooking} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Enter your last name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>

                <div className="pt-4 space-y-3">
                  <Button type="submit" className="w-full" size="lg" disabled={booking}>
                    {booking ? 'Processing...' : 'Confirm Booking'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => router.back()}
                    disabled={booking}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function BookPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 py-12 px-4">Loading...</div>}>
      <BookingContent />
    </Suspense>
  );
}
