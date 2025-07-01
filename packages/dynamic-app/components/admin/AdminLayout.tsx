import { ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from '../../styles/admin.module.css';
import {
  LayoutDashboard,
  User2,
  UserPlus2,
  Users,
  MailCheck,
  CreditCard,
  ToggleLeft,
  FileText,        
  ClipboardList,
  Settings,
  Archive,
  LogOut
} from 'lucide-react';

import Navbar from '@smartforms/shared/components/ui/Navbar';
import Footer from '@smartforms/shared/components/ui/Footer';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { pathname } = useRouter();

  const navItems = [
    { href: '/admin/dashboard',           label: 'Dashboard',          icon: LayoutDashboard },
    { href: '/admin/users',               label: 'Users',              icon: User2 },
    { href: '/admin/invites',             label: 'Invites',            icon: UserPlus2 },
    { href: '/admin/distribution-groups', label: 'Dist. Groups',       icon: Users },
    { href: '/admin/followup-settings',   label: 'Follow-Up Settings', icon: MailCheck },
    { href: '/admin/billing',             label: 'Billing',            icon: CreditCard },
    { href: '/admin/invoices',            label: 'Invoices',           icon: FileText },    
    { href: '/admin/feature-flags',       label: 'Feature Flags',      icon: ToggleLeft },
    { href: '/admin/audit-logs',          label: 'Audit Logs',         icon: ClipboardList },
    { href: '/admin/settings',            label: 'Settings',           icon: Settings },
  ];

  return (
    <div className={styles.adminContainer}>
      {/* SIDEBAR */}
      <nav className={styles.sidebar}>
        {/* <div className={styles.brand}>SmartForms Admin</div> */}
        <ul className={styles.navList}>
          {navItems.map(({ href, label, icon: Icon }) => (
            <li key={href} className={pathname.startsWith(href) ? styles.active : ''}>
              <Link href={href} className={styles.navLink}>
                  <Icon size={18} className={styles.navIcon} />
                  <span>{label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* MAIN AREA */}
      <div className={styles.main}>
        {/* <header className={styles.navbar}>
          <div className={styles.switchOrgPlaceholder}>
          </div>
          <div className={styles.userControls}>
            <button className={styles.signOutBtn}>
              <LogOut size={16} className={styles.navIcon} />
              Sign Out
            </button>
          </div>
        </header> */}

        <Navbar />

        <main className={styles.content}>{children}</main>

        {/* <footer className={styles.footer}>
          © {new Date().getFullYear()} SmartForms
        </footer> */}
        <Footer />
      </div>
    </div>
  );
}