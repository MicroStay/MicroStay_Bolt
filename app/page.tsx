'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, MapPin, Clock, Shield, Award } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const [searchType, setSearchType] = useState('nearby');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [date, setDate] = useState('');
  const [roomType, setRoomType] = useState('');
  const [smokingPreference, setSmokingPreference] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    params.set('searchType', searchType);
    if (city) params.set('city', city);
    if (state) params.set('state', state);
    if (date) params.set('date', date);
    if (roomType) params.set('roomType', roomType);
    if (smokingPreference) params.set('smoking', smokingPreference);
    router.push(`/search?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-white">
      <section
        className="relative py-32 px-4 bg-cover bg-center"
        style={{
          backgroundImage: "url('https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=1920')",
          backgroundAttachment: 'fixed',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-white/50 to-white/60"></div>

        <div className="max-w-7xl mx-auto relative">
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 text-gray-900 drop-shadow-sm">
              Book Motels by the Hour
            </h1>
            <p className="text-xl md:text-2xl text-gray-800 mb-8 font-medium">
              Flexible stays, unbeatable prices. Find your perfect spot nearby.
            </p>
          </div>

          <Card className="max-w-5xl mx-auto shadow-2xl border-white glossy-card">
            <CardContent className="p-6">
              <form onSubmit={handleSearch} className="space-y-6">
                <div className="flex gap-4 pb-4 border-b border-orange-100">
                  <Button
                    type="button"
                    variant={searchType === 'nearby' ? 'default' : 'outline'}
                    onClick={() => setSearchType('nearby')}
                    className={searchType === 'nearby' ? 'bg-orange-500 hover:bg-orange-600' : 'border-orange-300 text-orange-600 hover:bg-orange-50'}
                  >
                    <MapPin className="mr-2 h-4 w-4" />
                    Nearby
                  </Button>
                  <Button
                    type="button"
                    variant={searchType === 'city' ? 'default' : 'outline'}
                    onClick={() => setSearchType('city')}
                    className={searchType === 'city' ? 'bg-orange-500 hover:bg-orange-600' : 'border-orange-300 text-orange-600 hover:bg-orange-50'}
                  >
                    City/State
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {searchType === 'city' && (
                    <>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">State</label>
                        <Select value={state} onValueChange={setState}>
                          <SelectTrigger className="focus:border-orange-500 focus:ring-orange-500">
                            <SelectValue placeholder="Select state" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="CA">California</SelectItem>
                            <SelectItem value="TX">Texas</SelectItem>
                            <SelectItem value="FL">Florida</SelectItem>
                            <SelectItem value="NY">New York</SelectItem>
                            <SelectItem value="IL">Illinois</SelectItem>
                            <SelectItem value="PA">Pennsylvania</SelectItem>
                            <SelectItem value="OH">Ohio</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">City</label>
                        <Input
                          type="text"
                          placeholder="Enter city..."
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className="focus:border-orange-500 focus:ring-orange-500"
                        />
                      </div>
                    </>
                  )}

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Date</label>
                    <Input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="focus:border-orange-500 focus:ring-orange-500"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Room Type</label>
                    <Select value={roomType} onValueChange={setRoomType}>
                      <SelectTrigger className="focus:border-orange-500 focus:ring-orange-500">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="single">Single</SelectItem>
                        <SelectItem value="double">Double</SelectItem>
                        <SelectItem value="suite">Suite</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Smoking</label>
                    <Select value={smokingPreference} onValueChange={setSmokingPreference}>
                      <SelectTrigger className="focus:border-orange-500 focus:ring-orange-500">
                        <SelectValue placeholder="Any" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="non-smoking">Non-Smoking</SelectItem>
                        <SelectItem value="smoking">Smoking Allowed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button type="submit" size="lg" className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg">
                  <Search className="mr-2 h-5 w-5" />
                  {searchType === 'nearby' ? 'Search Nearby Motels' : 'Search Motels'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="py-20 px-4 bg-gradient-to-b from-white via-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
            Why Choose MicroStay?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center hover:shadow-2xl transition glossy-white border-gray-100 group">
              <CardContent className="p-8">
                <div className="bg-gradient-to-br from-orange-400 to-orange-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shine-effect">
                  <Clock className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">Flexible Hours</h3>
                <p className="text-gray-600">
                  Book by the hour, not the night. Perfect for layovers, rest breaks, or quick getaways.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-2xl transition glossy-white border-gray-100 group">
              <CardContent className="p-8">
                <div className="bg-gradient-to-br from-orange-400 to-orange-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shine-effect">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">Safe & Secure</h3>
                <p className="text-gray-600">
                  All properties verified. Secure booking process with instant confirmation.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-2xl transition glossy-white border-gray-100 group">
              <CardContent className="p-8">
                <div className="bg-gradient-to-br from-orange-400 to-orange-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shine-effect">
                  <Award className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">Best Prices</h3>
                <p className="text-gray-600">
                  No hidden fees. Pay only for the hours you need. Save up to 70% vs full-day rates.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section
        className="py-20 px-4 relative bg-cover bg-center"
        style={{
          backgroundImage: "url('https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg?auto=compress&cs=tinysrgb&w=1920')",
          backgroundAttachment: 'fixed',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-white/70 via-white/60 to-white/70"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">
            List Your Property
          </h2>
          <p className="text-xl text-gray-800 mb-8 font-medium">
            Join our network of trusted partners and start earning more from your rooms.
          </p>
          <Button
            size="lg"
            onClick={() => router.push('/partner')}
            className="text-lg px-8 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-xl shine-effect"
          >
            Become a Partner
          </Button>
        </div>
      </section>

      <footer className="bg-gradient-to-b from-gray-900 to-black text-gray-300 py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center justify-center mb-8">
            <div className="flex items-center space-x-2 mb-4">
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-2 rounded-lg shadow-lg">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  className="w-6 h-6 text-white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  <polyline points="9 22 9 12 15 12 15 22"></polyline>
                  <path d="M12 2v4"></path>
                  <circle cx="12" cy="8" r="1.5"></circle>
                </svg>
              </div>
              <span className="text-2xl font-bold text-white">MicroStay</span>
            </div>
            <p className="text-sm text-gray-400 mb-2">Flexible stays, anywhere you need.</p>
            <p className="text-xs text-gray-500">Hourly bookings made simple</p>
          </div>

          <div className="border-t border-gray-800 pt-6 text-center">
            <p className="text-xs text-gray-500">© 2024 MicroStay. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
