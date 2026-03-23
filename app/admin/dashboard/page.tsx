'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supbase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Building, DollarSign, Users, TrendingUp, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface VendorApplication {
  id: string;
  business_name: string;
  contact_person: string;
  email: string;
  phone: string;
  status: string;
  created_at: string;
  motel_count: number;
}

interface Vendor {
  id: string;
  business_name: string;
  email: string;
  status: string;
  total_motels: number;
  active_motels: number;
  total_bookings: number;
  monthly_revenue: number;
  commission_owed: number;
}

interface BillingData {
  total_monthly_revenue: number;
  total_commission: number;
  active_vendors: number;
  pending_applications: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<VendorApplication[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [billingData, setBillingData] = useState<BillingData>({
    total_monthly_revenue: 0,
    total_commission: 0,
    active_vendors: 0,
    pending_applications: 0
  });

  useEffect(() => {
    checkAuth();
    loadDashboardData();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }

    // Check if user is admin
    const { data: profile } = await supbase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      toast.error('Unauthorized access');
      router.push('/');
    }
  };

  const loadDashboardData = async () => {
    try {
      // Load vendor applications
      const { data: appsData, error: appsError } = await supbase
        .from('vendor_applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (appsError) throw appsError;
      setApplications(appsData || []);

      // Load vendor billing summary
      const { data: vendorsData, error: vendorsError } = await supbase
        .from('vendor_billing_summary')
        .select('*')
        .order('monthly_revenue', { ascending: false });

      if (vendorsError) throw vendorsError;
      setVendors(vendorsData || []);

      // Calculate billing totals
      const totalRevenue = vendorsData?.reduce((sum, v) => sum + (v.monthly_revenue || 0), 0) || 0;
      const totalCommission = vendorsData?.reduce((sum, v) => sum + (v.commission_owed || 0), 0) || 0;
      const activeVendorCount = vendorsData?.filter(v => v.status === 'active').length || 0;
      const pendingAppCount = appsData?.filter(a => a.status === 'pending').length || 0;

      setBillingData({
        total_monthly_revenue: totalRevenue,
        total_commission: totalCommission,
        active_vendors: activeVendorCount,
        pending_applications: pendingAppCount
      });

    } catch (error: any) {
      toast.error('Failed to load dashboard data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleApplicationAction = async (applicationId: string, action: 'approve' | 'reject') => {
    try {
      const newStatus = action === 'approve' ? 'approved' : 'rejected';
      
      const { error } = await supbase
        .from('vendor_applications')
        .update({ status: newStatus })
        .eq('id', applicationId);

      if (error) throw error;

      toast.success(`Application ${action}d successfully`);
      loadDashboardData();
    } catch (error: any) {
      toast.error(`Failed to ${action} application`);
      console.error(error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Manage vendors and monitor platform revenue</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(billingData.total_monthly_revenue)}</div>
            <p className="text-xs text-gray-600 mt-1">Total platform revenue</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Commission Owed</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(billingData.total_commission)}</div>
            <p className="text-xs text-gray-600 mt-1">15% platform fee</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Vendors</CardTitle>
            <Building2 className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{billingData.active_vendors}</div>
            <p className="text-xs text-gray-600 mt-1">Currently onboarded</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Applications</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{billingData.pending_applications}</div>
            <p className="text-xs text-gray-600 mt-1">Awaiting review</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Applications and Vendors */}
      <Tabs defaultValue="applications" className="space-y-6">
        <TabsList>
          <TabsTrigger value="applications">
            Vendor Applications
            {billingData.pending_applications > 0 && (
              <Badge variant="destructive" className="ml-2">{billingData.pending_applications}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="vendors">Active Vendors</TabsTrigger>
          <TabsTrigger value="billing">Billing Overview</TabsTrigger>
        </TabsList>

        {/* Applications Tab */}
        <TabsContent value="applications">
          <Card>
            <CardHeader>
              <CardTitle>Vendor Applications</CardTitle>
              <CardDescription>Review and approve new vendor applications</CardDescription>
            </CardHeader>
            <CardContent>
              {applications.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No applications found</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Business Name</TableHead>
                      <TableHead>Contact Person</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Motels</TableHead>
                      <TableHead>Applied</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {applications.map((app) => (
                      <TableRow key={app.id}>
                        <TableCell className="font-medium">{app.business_name}</TableCell>
                        <TableCell>{app.contact_person}</TableCell>
                        <TableCell>{app.email}</TableCell>
                        <TableCell>{app.phone}</TableCell>
                        <TableCell>{app.motel_count}</TableCell>
                        <TableCell>{formatDate(app.created_at)}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              app.status === 'approved' ? 'default' :
                              app.status === 'rejected' ? 'destructive' :
                              'secondary'
                            }
                          >
                            {app.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                            {app.status === 'approved' && <CheckCircle className="h-3 w-3 mr-1" />}
                            {app.status === 'rejected' && <XCircle className="h-3 w-3 mr-1" />}
                            {app.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {app.status === 'pending' && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleApplicationAction(app.id, 'approve')}
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleApplicationAction(app.id, 'reject')}
                              >
                                Reject
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Vendors Tab */}
        <TabsContent value="vendors">
          <Card>
            <CardHeader>
              <CardTitle>Active Vendors</CardTitle>
              <CardDescription>Monitor vendor performance and revenue</CardDescription>
            </CardHeader>
            <CardContent>
              {vendors.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No active vendors</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Business Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Total Motels</TableHead>
                      <TableHead>Active Motels</TableHead>
                      <TableHead>Bookings</TableHead>
                      <TableHead>Monthly Revenue</TableHead>
                      <TableHead>Commission (15%)</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vendors.map((vendor) => (
                      <TableRow key={vendor.id}>
                        <TableCell className="font-medium">{vendor.business_name}</TableCell>
                        <TableCell>{vendor.email}</TableCell>
                        <TableCell>{vendor.total_motels}</TableCell>
                        <TableCell>{vendor.active_motels}</TableCell>
                        <TableCell>{vendor.total_bookings}</TableCell>
                        <TableCell className="font-semibold text-green-600">
                          {formatCurrency(vendor.monthly_revenue)}
                        </TableCell>
                        <TableCell className="font-semibold text-blue-600">
                          {formatCurrency(vendor.commission_owed)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={vendor.status === 'active' ? 'default' : 'secondary'}>
                            {vendor.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing Overview Tab */}
        <TabsContent value="billing">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Summary</CardTitle>
                <CardDescription>Monthly billing breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-600">Total Platform Revenue</p>
                      <p className="text-2xl font-bold text-green-600">
                        {formatCurrency(billingData.total_monthly_revenue)}
                      </p>
                    </div>
                    <DollarSign className="h-8 w-8 text-green-600" />
                  </div>

                  <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-600">MicroStay Commission (15%)</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {formatCurrency(billingData.total_commission)}
                      </p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-blue-600" />
                  </div>

                  <div className="flex justify-between items-center p-4 bg-purple-50 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-600">Vendor Revenue (85%)</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {formatCurrency(billingData.total_monthly_revenue - billingData.total_commission)}
                      </p>
                    </div>
                    <Building2 className="h-8 w-8 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Performing Vendors</CardTitle>
                <CardDescription>Ranked by monthly revenue</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {vendors.slice(0, 5).map((vendor, index) => (
                    <div key={vendor.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{vendor.business_name}</p>
                          <p className="text-sm text-gray-600">{vendor.total_bookings} bookings</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">{formatCurrency(vendor.monthly_revenue)}</p>
                        <p className="text-sm text-gray-600">Commission: {formatCurrency(vendor.commission_owed)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
