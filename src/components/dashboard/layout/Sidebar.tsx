'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Building2,
  Store,
  Heart,
  PlusCircle,
  Briefcase,
  Star,
  Receipt,
  FileText,
  Settings,
  CreditCard,
} from 'lucide-react';
import Image from 'next/image';

const sidebarItems = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'My Listings',
    href: '/dashboard/my-listings',
    icon: Building2,
  },
  {
    name: 'Favourites',
    href: '/dashboard/favourites',
    icon: Heart,
  },
  {
    name: 'Services',
    href: '/dashboard/services',
    icon: Briefcase,
  },
  {
    name: 'Reviews',
    href: '/dashboard/reviews',
    icon: Star,
  },
  {
    name: 'Transactions/Billing',
    href: '/dashboard/transactions',
    icon: Receipt,
  },
  {
    name: 'Subscriptions',
    href: '/dashboard/subscriptions',
    icon: CreditCard,
  },
  {
    name: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
  },
];

export default function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 overflow-y-auto">
      {/* Logo */}
      <div className="py-4 border-b border-gray-200">
        <Link href="/" className="flex pl-12 items-center">
          <Image
            src="/logo/logo2.png"
            alt="Mawjood Logo"
            width={40}
            height={40}
            className="h-8 w-auto"
          />
          <span className="text-primary block text-base font-bold ml-2">
            Mawjood
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="p-4">
        <ul className="space-y-1">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}