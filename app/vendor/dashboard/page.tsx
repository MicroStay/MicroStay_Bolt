'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { Building, DollarSign, Calendar, Users, TrendingUp, FileText, Settings, LogOut, Bell } from 'lucide-react';

interface VendorProfile {
  id: string;
  business_name: string;
  contact_name: string;
  email: string;
  phone: string;
  status: string;
  monthly_revenue: number;
  commission_owed: number;
  total_bookings: number;
}

interface Booking {
  id: string;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  check_in: string;
  check_out: string;
  total_price: number;
  status: string;
  room_number: string;
  special_requests?: string;
}

export default function VendorDashboard() {
  const router = useRouter();
  const [vendor, setVendor] = useState<VendorProfile | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login');
        return;
      }

      await loadVendorData(user.id);
    } catch (error) {
      console.error('Auth check failed:', error);
      router.push('/login');
    }
  }

  async function loadVendorData(userId: string) {
    try {
      const { data: vendorData, error: vendorError } = await supabase
        .from('vendor_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (vendorError) throw vendorError;

      setVendor(vendorData);

      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select('*')
        .eq('vendor_id', vendorData.id)
        .order('check_in', { ascending: false });

      if (bookingsError) throw bookingsError;

      setBookings(bookingsData || []);
    } catch (error) {
      console.error('Error loading vendor data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/');
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>Vendor profile not found</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/')} className="w-full">
              Return Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const upcomingBookings = bookings.filter(b => new Date(b.check_in) > new Date() && b.status === 'confirmed');
  const activeBookings = bookings.filter(b => {
    const now = new Date();
    return new Date(b.check_in) <= now && new Date(b.check_out) >= now && b.status === 'confirmed';
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Building className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">{vendor.business_name}</h1>
                <p className="text-sm text-gray-500">Vendor Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
              <Button variant="ghost" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Monthly Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${vendor.monthly_revenue?.toLocaleString() || 0}</div>
              <p className="text-xs text-gray-500 mt-1">Current month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Commission Owed</CardTitle>
              <FileText className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${vendor.commission_owed?.toLocaleString() || 0}</div>
              <p className="text-xs text-gray-500 mt-1">Due this month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Bookings</CardTitle>
              <Calendar className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{vendor.total_bookings || 0}</div>
              <p className="text-xs text-gray-500 mt-1">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Active Guests</CardTitle>
              <Users className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeBookings.length}</div>
              <p className="text-xs text-gray-500 mt-1">Currently checked in</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Check-ins</CardTitle>
                <CardDescription>Next 7 days</CardDescription>
              </CardHeader>
              <CardContent>
                {upcomingBookings.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No upcoming bookings</p>
                ) : (
                  <div className="space-y-4">
                    {upcomingBookings.slice(0, 5).map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-medium">{booking.guest_name}</p>
                          <p className="text-sm text-gray-500">Room {booking.room_number}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{new Date(booking.check_in).toLocaleDateString()}</p>
                          <Badge variant="secondary">{booking.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bookings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>All Bookings</CardTitle>
                <CardDescription>Manage your reservations</CardDescription>
              </CardHeader>
              <CardContent>
                {bookings.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No bookings yet</p>
                ) : (
                  <div className="space-y-4">
                    {bookings.map((booking) => (
                      <div key={booking.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-medium text-lg">{booking.guest_name}</p>
                            <p className="text-sm text-gray-500">{booking.guest_email}</p>
                            <p className="text-sm text-gray-500">{booking.guest_phone}</p>
                          </div>
                          <Badge>{booking.status}</Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                          <div>
                            <p className="text-gray-500">Check-in</p>
                            <p className="font-medium">{new Date(booking.check_in).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Check-out</p>
                            <p className="font-medium">{new Date(booking.check_out).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Room</p>
                            <p className="font-medium">{booking.room_number}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Total</p>
                            <p className="font-medium">${booking.total_price}</p>
                          </div>
                        </div>
                        {booking.special_requests && (
                          <div className="mt-4 p-3 bg-gray-50 rounded">
                            <p className="text-sm text-gray-500">Special Requests</p>
                            <p className="text-sm">{booking.special_requests}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="billing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Billing Overview</CardTitle>
                <CardDescription>Commission and payment details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-600 font-medium mb-1">Monthly Revenue</p>
                    <p className="text-3xl font-bold text-green-700">${vendor.monthly_revenue?.toLocaleString() || 0}</p>
                  </div>
                  <div className="p-4 bg-orange-50 rounded-lg">
                    <p className="text-sm text-orange-600 font-medium mb-1">Commission (15%)</p>
                    <p className="text-3xl font-bold text-orange-700">${vendor.commission_owed?.toLocaleString() || 0}</p>
                  </div>
                </div>
                <div className="border-t pt-6">
                  <h3 className="font-medium mb-4">Payment Schedule</h3>
                  <p className="text-sm text-gray-600">
                    Commission fees are calculated at 15% of your monthly revenue and are due at the end of each month.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Business Profile</CardTitle>
                <CardDescription>Your business information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Business Name</p>
                  <p className="font-medium">{vendor.business_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Contact Name</p>
                  <p className="font-medium">{vendor.contact_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{vendor.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{vendor.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <Badge variant={vendor.status === 'active' ? 'default' : 'secondary'}>
                    {vendor.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
