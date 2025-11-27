'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Building2,
  FolderTree,
  MapPin,
  FileText,
  Star,
  Receipt,
  Settings,
  Shield,
  Folder,
  CreditCard,
  Megaphone,
  BadgePercent,
  X,
} from 'lucide-react';
import Image from 'next/image';

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const sidebarItems = [
  {
    name: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    name: 'Users',
    href: '/admin/users',
    icon: Users,
  },
  {
    name: 'Businesses',
    href: '/admin/businesses',
    icon: Building2,
  },
  {
    name: 'Reviews',
    href: '/admin/reviews',
    icon: Star,
  },
  {
    name: 'Categories',
    href: '/admin/categories',
    icon: Folder,
  },
  {
    name: 'Locations',
    href: '/admin/cities',
    icon: MapPin,
  },
  {
    name: 'Blogs',
    href: '/admin/blogs',
    icon: FileText,
  },
  {
    name: 'Transactions',
    href: '/admin/transactions',
    icon: CreditCard,
  },
  {
    name: 'Subscription Plans',
    href: '/admin/subscription-plans',
    icon: BadgePercent,
  },
  {
    name: 'Advertisements',
    href: '/admin/advertisements',
    icon:  Megaphone,
  },
];

export default function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className={`fixed left-0 top-0 h-screen w-64 bg-primary border-r border-gray-700 overflow-y-auto flex flex-col z-50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
      isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
    }`}>
      {/* Logo */}
      <div className="py-4 border-b border-primary/20 flex items-center justify-between px-4 lg:px-0">
        <Link href="/" className="flex pl-8 lg:pl-12 items-center" onClick={onClose}>
          <div className="bg-white rounded-lg p-1.5">
            <Image
              src="/logo/logo2.png"
              alt="Mawjood Logo"
              width={40}
              height={40}
              className="h-6 w-auto"
            />
          </div>
          <span className="text-white text-lg block font-bold ml-2">
            Mawjood
          </span>
        </Link>
        <button
          onClick={onClose}
          className="lg:hidden p-2 hover:bg-white/10 rounded-lg"
        >
          <X className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Admin Badge */}
      <div className="px-4 py-3">
        <div className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 flex items-center gap-2">
          <Shield className="w-4 h-4 text-white" />
          <span className="text-white text-sm font-semibold">Admin Panel</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4 flex-1 overflow-y-auto">
        <ul className="space-y-1">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-white text-primary shadow-md'
                      : 'text-white/80 hover:bg-white/10 hover:text-white'
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

      {/* Footer */}
      <div className="sticky bottom-0 left-0 right-0 p-4 border-t border-white/10 bg-primary mt-auto">
        <Link
          href="/"
          className="flex items-center justify-center space-x-2 text-white/60 hover:text-white transition-colors text-sm"
        >
          <span>← Back to Website</span>
        </Link>
      </div>
    </aside>
  );
}

