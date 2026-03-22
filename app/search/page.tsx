'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Wifi, Coffee, Tv, Car, Phone } from 'lucide-react';

type MotelWithRooms = {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  description: string;
  amenities: string[];
  images: string[];
  phone: string;
  rooms: {
    id: string;
    room_type: string;
    price_per_slot: number;
  }[];
};

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [motels, setMotels] = useState<MotelWithRooms[]>([]);
  const [loading, setLoading] = useState(true);

  const city = searchParams.get('city') || '';
  const date = searchParams.get('date') || '';
  const roomType = searchParams.get('roomType') || '';

  useEffect(() => {
    fetchMotels();
  }, [city, date, roomType]);

  const fetchMotels = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('motels')
        .select(`
          *,
          rooms(*)
        `)
        .eq('active', true);

      if (city) {
        query = query.ilike('city', `%${city}%`);
      }

      const { data, error } = await query;

      if (error) throw error;

      let filteredData = data || [];

      if (roomType) {
        filteredData = filteredData.filter((motel: any) =>
          motel.rooms.some((room: any) => room.room_type === roomType && room.active)
        );
      }

      setMotels(filteredData as MotelWithRooms[]);
    } catch (error) {
      console.error('Error fetching motels:', error);
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
    return <IconComponent className="h-4 w-4" />;
  };

  const getMinPrice = (rooms: any[]) => {
    if (!rooms.length) return 0;
    return Math.min(...rooms.map((r) => r.price_per_slot));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">Loading motels...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-gray-900">
            {city ? `Motels in ${city}` : 'Available Motels'}
          </h1>
          <p className="text-gray-600">
            {motels.length} {motels.length === 1 ? 'property' : 'properties'} found
            {date && ` for ${new Date(date).toLocaleDateString()}`}
          </p>
        </div>

        {motels.length === 0 ? (
          <Card className="border-orange-200 bg-white">
            <CardContent className="p-12 text-center">
              <p className="text-xl text-gray-600 mb-4">No motels found matching your criteria</p>
              <Button onClick={() => router.push('/')} className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white">
                Back to Search
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {motels.map((motel) => (
              <Card
                key={motel.id}
                className="hover:shadow-xl transition cursor-pointer overflow-hidden border-orange-200 bg-white hover:border-orange-400"
                onClick={() => router.push(`/motel/${motel.id}?date=${date}`)}
              >
                <div
                  className="h-48 bg-cover bg-center relative"
                  style={{
                    backgroundImage: motel.images && motel.images.length > 0
                      ? `url(${motel.images[0]})`
                      : "linear-gradient(rgba(249, 115, 22, 0.8), rgba(251, 146, 60, 0.8)), url('https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg?auto=compress&cs=tinysrgb&w=800')",
                  }}
                >
                  {(!motel.images || motel.images.length === 0) && (
                    <div className="absolute inset-0 flex items-center justify-center text-white text-6xl font-bold">
                      {motel.name.charAt(0)}
                    </div>
                  )}
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-2 text-gray-900">{motel.name}</h3>
                  <div className="flex items-start text-gray-600 mb-3">
                    <MapPin className="h-4 w-4 mr-1 mt-1 flex-shrink-0 text-orange-500" />
                    <span className="text-sm">{motel.address}, {motel.city}</span>
                  </div>

                  {motel.amenities && motel.amenities.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {motel.amenities.slice(0, 4).map((amenity, idx) => (
                        <Badge key={idx} variant="secondary" className="flex items-center gap-1 bg-orange-100 text-orange-700">
                          {getAmenityIcon(amenity)}
                          <span className="text-xs capitalize">{amenity}</span>
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-orange-100">
                    <div>
                      <p className="text-sm text-gray-600">Starting from</p>
                      <p className="text-2xl font-bold text-orange-600">
                        ${getMinPrice(motel.rooms)}
                        <span className="text-sm font-normal text-gray-600">/slot</span>
                      </p>
                    </div>
                    <Button size="sm" className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white">View Details</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 py-12 px-4">Loading...</div>}>
      <SearchContent />
    </Suspense>
  );
}
