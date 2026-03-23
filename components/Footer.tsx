'use client';

import Link from 'next/link';
import { Mail, Phone, Building, CircleHelp as HelpCircle } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">MicroStay</h3>
            <p className="text-sm text-gray-400">
              Flexible hourly motel bookings for travelers who need rest on their schedule.
            </p>
          </div>

          <div>
            <h4 className="text-white text-sm font-semibold mb-4">For Customers</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/search" className="hover:text-white transition-colors">
                  Find Motels
                </Link>
              </li>
              <li>
                <Link href="/check-booking" className="hover:text-white transition-colors">
                  Check Booking
                </Link>
              </li>
              <li>
                <a href="mailto:support@microstay.us" className="hover:text-white transition-colors flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  support@microstay.us
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white text-sm font-semibold mb-4">For Partners</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/partner" className="hover:text-white transition-colors">
                  Become a Partner
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-white transition-colors">
                  Vendor Login
                </Link>
              </li>
              <li>
                <a href="mailto:vendor@microstay.us" className="hover:text-white transition-colors flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  vendor@microstay.us
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white text-sm font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <HelpCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-white">Customer Support</p>
                  <a href="mailto:support@microstay.us" className="hover:text-white transition-colors">
                    support@microstay.us
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Building className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-white">Partner Support</p>
                  <a href="mailto:vendor@microstay.us" className="hover:text-white transition-colors">
                    vendor@microstay.us
                  </a>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-sm text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} MicroStay. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
