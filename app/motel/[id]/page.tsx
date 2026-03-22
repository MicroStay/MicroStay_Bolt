'use client';

import { useEffect, useState, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Phone, Clock, ChevronRight, Wifi, Coffee, Tv, Car } from 'lucide-react';

type Motel = {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  description: string;
  amenities: string[];
  images: string[];
  phone: string;
  vendor_id: string;
  profiles: {
    name: string;
    phone: string;
  };
};

type Room = {
  id: string;
  room_type: string;
  price_per_slot: number;
  time_slots: TimeSlot[];
};

type TimeSlot = {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  available: boolean;
};

function MotelDetailContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [motel, setMotel] = useState<Motel | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(
    searchParams.get('date') || new Date().toISOString().split('T')[0]
  );

  useEffect(() => {
    fetchMotelDetails();
  }, [params.id, selectedDate]);

  const fetchMotelDetails = async () => {
    setLoading(true);
    try {
      const { data: motelData, error: motelError } = await supabase
        .from('motels')
        .select(`
          *,
          profiles!motels_vendor_id_fkey(name, phone)
        `)
        .eq('id', params.id)
        .maybeSingle();

      if (motelError) throw motelError;
      setMotel(motelData as any);

      const { data: roomsData, error: roomsError } = await supabase
        .from('rooms')
        .select(`
          *,
          time_slots(*)
        `)
        .eq('motel_id', params.id)
        .eq('active', true);

      if (roomsError) throw roomsError;

      const roomsWithFilteredSlots = (roomsData || []).map((room: any) => ({
        ...room,
        time_slots: (room.time_slots || []).filter(
          (slot: TimeSlot) => slot.date === selectedDate
        ),
      }));

      setRooms(roomsWithFilteredSlots as Room[]);
    } catch (error) {
      console.error('Error fetching motel:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAmenityIcon = (amenity: string) => {
    const icons: { [key: string]: any } = {
      wifi: Wifi,
      parking: Car,
      breakfast: Coffee,
      tv: Tv,
    };
    const IconComponent = icons[amenity.toLowerCase()] || Coffee;
    return <IconComponent className="h-5 w-5" />;
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const handleBookSlot = (roomId: string, slotId: string, price: number) => {
    router.push(`/book/${slotId}?roomId=${roomId}&motelId=${params.id}&date=${selectedDate}&price=${price}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-7xl mx-auto text-center">Loading motel details...</div>
      </div>
    );
  }

  if (!motel) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-xl mb-4">Motel not found</p>
          <Button onClick={() => router.push('/search')}>Back to Search</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="mb-6"
        >
          Back to Results
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <div className="h-96 bg-gradient-to-br from-blue-400 to-blue-600">
                {motel.images && motel.images.length > 0 ? (
                  <img
                    src={motel.images[0]}
                    alt={motel.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-white text-9xl font-bold">
                    {motel.name.charAt(0)}
                  </div>
                )}
              </div>
              <CardContent className="p-6">
                <h1 className="text-3xl font-bold mb-4">{motel.name}</h1>
                <div className="flex items-start text-gray-600 mb-4">
                  <MapPin className="h-5 w-5 mr-2 mt-1" />
                  <span>
                    {motel.address}, {motel.city}, {motel.state}
                  </span>
                </div>
                <div className="flex items-center text-gray-600 mb-6">
                  <Phone className="h-5 w-5 mr-2" />
                  <span>{motel.phone}</span>
                </div>

                {motel.description && (
                  <div className="mb-6">
                    <h3 className="font-semibold mb-2">About</h3>
                    <p className="text-gray-600">{motel.description}</p>
                  </div>
                )}

                {motel.amenities && motel.amenities.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3">Amenities</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {motel.amenities.map((amenity, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          {getAmenityIcon(amenity)}
                          <span className="capitalize">{amenity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Available Time Slots</CardTitle>
                <div className="pt-2">
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="border rounded px-3 py-2"
                  />
                </div>
              </CardHeader>
              <CardContent>
                {rooms.length === 0 ? (
                  <p className="text-center text-gray-600 py-8">
                    No rooms available for this property
                  </p>
                ) : (
                  <div className="space-y-6">
                    {rooms.map((room) => (
                      <div key={room.id} className="border-b pb-6 last:border-b-0">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="font-semibold text-lg capitalize">
                              {room.room_type} Room
                            </h4>
                            <p className="text-blue-600 font-bold text-xl">
                              ${room.price_per_slot}
                              <span className="text-sm text-gray-600 font-normal">/slot</span>
                            </p>
                          </div>
                        </div>

                        {room.time_slots.length === 0 ? (
                          <p className="text-gray-600 text-sm">
                            No time slots available for {new Date(selectedDate).toLocaleDateString()}
                          </p>
                        ) : (
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {room.time_slots.map((slot) => (
                              <Button
                                key={slot.id}
                                variant={slot.available ? 'outline' : 'secondary'}
                                disabled={!slot.available}
                                onClick={() =>
                                  slot.available &&
                                  handleBookSlot(room.id, slot.id, room.price_per_slot)
                                }
                                className="flex items-center justify-between"
                              >
                                <Clock className="h-4 w-4 mr-2" />
                                <span className="text-sm">
                                  {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                                </span>
                                <ChevronRight className="h-4 w-4 ml-2" />
                              </Button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Vendor Name</p>
                  <p className="font-medium">{motel.profiles?.name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Phone Number</p>
                  <p className="font-medium">{motel.profiles?.phone || motel.phone}</p>
                </div>
                <Button className="w-full" asChild>
                  <a href={`tel:${motel.phone}`}>
                    <Phone className="mr-2 h-4 w-4" />
                    Call Now
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MotelDetailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 py-12 px-4">Loading...</div>}>
      <MotelDetailContent />
    </Suspense>
  );
}
