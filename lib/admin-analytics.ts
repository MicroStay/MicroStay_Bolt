import { supabase } from './supabase';

export interface DashboardStats {
  todayRevenue: number;
  monthlyRevenue: number;
  totalBookings: number;
  todayBookings: number;
  activeMotels: number;
  totalMotels: number;
  pendingApplications: number;
  checkedInToday: number;
  noShowsToday: number;
  platformFeesMonth: number;
}

export interface AreaAnalytics {
  city: string;
  state: string;
  totalMotels: number;
  activeMotels: number;
  totalBookings: number;
  revenue: number;
}

export interface MotelPerformance {
  id: string;
  name: string;
  city: string;
  state: string;
  vendor_name: string;
  total_bookings: number;
  revenue: number;
  check_in_rate: number;
  no_show_rate: number;
  avg_rating: number;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const today = new Date().toISOString().split('T')[0];
  const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    .toISOString()
    .split('T')[0];

  const [
    allBookings,
    todayBookingsData,
    monthlyBookingsData,
    motelsData,
    applicationsData,
  ] = await Promise.all([
    supabase.from('bookings').select('total_price, platform_fee, check_in_status'),
    supabase.from('bookings').select('total_price, platform_fee, check_in_status').gte('created_at', today),
    supabase.from('bookings').select('total_price, platform_fee').gte('created_at', firstDayOfMonth),
    supabase.from('motels').select('active'),
    supabase.from('vendor_applications').select('status').eq('status', 'pending'),
  ]);

  const totalBookings = allBookings.data?.length || 0;
  const todayBookings = todayBookingsData.data?.length || 0;
  const monthlyRevenue = monthlyBookingsData.data?.reduce((sum, b) => sum + (Number(b.total_price) || 0), 0) || 0;
  const todayRevenue = todayBookingsData.data?.reduce((sum, b) => sum + (Number(b.total_price) || 0), 0) || 0;
  const platformFeesMonth = monthlyBookingsData.data?.reduce((sum, b) => sum + (Number(b.platform_fee) || 0), 0) || 0;
  const activeMotels = motelsData.data?.filter((m) => m.active).length || 0;
  const totalMotels = motelsData.data?.length || 0;
  const pendingApplications = applicationsData.data?.length || 0;
  const checkedInToday = todayBookingsData.data?.filter((b) => b.check_in_status === 'checked_in').length || 0;
  const noShowsToday = todayBookingsData.data?.filter((b) => b.check_in_status === 'no_show').length || 0;

  return {
    todayRevenue,
    monthlyRevenue,
    totalBookings,
    todayBookings,
    activeMotels,
    totalMotels,
    pendingApplications,
    checkedInToday,
    noShowsToday,
    platformFeesMonth,
  };
}

export async function getAreaAnalytics(): Promise<AreaAnalytics[]> {
  const { data: motels } = await supabase
    .from('motels')
    .select('id, city, state, active');

  if (!motels) return [];

  const motelIds = motels.map((m) => m.id);
  const { data: bookings } = await supabase
    .from('bookings')
    .select('motel_id, total_price')
    .in('motel_id', motelIds);

  const areaMap = new Map<string, AreaAnalytics>();

  motels.forEach((motel) => {
    const key = `${motel.city}, ${motel.state}`;
    if (!areaMap.has(key)) {
      areaMap.set(key, {
        city: motel.city,
        state: motel.state,
        totalMotels: 0,
        activeMotels: 0,
        totalBookings: 0,
        revenue: 0,
      });
    }
    const area = areaMap.get(key)!;
    area.totalMotels++;
    if (motel.active) area.activeMotels++;
  });

  bookings?.forEach((booking) => {
    const motel = motels.find((m) => m.id === booking.motel_id);
    if (motel) {
      const key = `${motel.city}, ${motel.state}`;
      const area = areaMap.get(key)!;
      area.totalBookings++;
      area.revenue += Number(booking.total_price) || 0;
    }
  });

  return Array.from(areaMap.values()).sort((a, b) => b.revenue - a.revenue);
}

export async function getMotelPerformance(): Promise<MotelPerformance[]> {
  const { data: motels } = await supabase
    .from('motels')
    .select('id, name, city, state, vendor_id, profiles(name)');

  if (!motels) return [];

  const motelIds = motels.map((m) => m.id);
  const { data: bookings } = await supabase
    .from('bookings')
    .select('motel_id, total_price, check_in_status')
    .in('motel_id', motelIds);

  return motels.map((motel) => {
    const motelBookings = bookings?.filter((b) => b.motel_id === motel.id) || [];
    const totalBookings = motelBookings.length;
    const revenue = motelBookings.reduce((sum, b) => sum + (Number(b.total_price) || 0), 0);
    const checkedIn = motelBookings.filter((b) => b.check_in_status === 'checked_in').length;
    const noShows = motelBookings.filter((b) => b.check_in_status === 'no_show').length;

    return {
      id: motel.id,
      name: motel.name,
      city: motel.city,
      state: motel.state,
      vendor_name: (motel.profiles as any)?.name || 'Unknown',
      total_bookings: totalBookings,
      revenue,
      check_in_rate: totalBookings > 0 ? (checkedIn / totalBookings) * 100 : 0,
      no_show_rate: totalBookings > 0 ? (noShows / totalBookings) * 100 : 0,
      avg_rating: 0,
    };
  }).sort((a, b) => b.revenue - a.revenue);
}

export async function generateMonthlyInvoice(motelId: string, month: number, year: number) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);

  const { data: motel } = await supabase
    .from('motels')
    .select('vendor_id, name')
    .eq('id', motelId)
    .single();

  if (!motel) throw new Error('Motel not found');

  const { data: bookings } = await supabase
    .from('bookings')
    .select('total_price, platform_fee, vendor_payout')
    .eq('motel_id', motelId)
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString());

  const totalBookings = bookings?.length || 0;
  const grossRevenue = bookings?.reduce((sum, b) => sum + (Number(b.total_price) || 0), 0) || 0;
  const platformFees = bookings?.reduce((sum, b) => sum + (Number(b.platform_fee) || 0), 0) || 0;
  const vendorPayout = bookings?.reduce((sum, b) => sum + (Number(b.vendor_payout) || 0), 0) || 0;

  const invoiceNumber = `INV-${year}${String(month).padStart(2, '0')}-${motelId.slice(0, 8).toUpperCase()}`;
  const dueDate = new Date(year, month, 15);

  const { data, error } = await supabase
    .from('motel_invoices')
    .insert({
      invoice_number: invoiceNumber,
      motel_id: motelId,
      vendor_id: motel.vendor_id,
      billing_period_start: startDate.toISOString().split('T')[0],
      billing_period_end: endDate.toISOString().split('T')[0],
      total_bookings: totalBookings,
      gross_revenue: grossRevenue,
      platform_fees: platformFees,
      vendor_payout: vendorPayout,
      due_date: dueDate.toISOString().split('T')[0],
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}
