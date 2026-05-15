'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import {
  LayoutDashboard,
  FileText,
  Image,
  Users,
  Tag,
  BookOpen,
  AlertCircle,
  MessageSquare,
  Building2,
  Mail,
  LogOut,
  Shield,
  ScrollText,
  Inbox,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/articles', label: 'Articles', icon: FileText },
  { href: '/admin/submissions', label: 'Submissions', icon: Inbox },
  { href: '/admin/media', label: 'Media', icon: Image },
  { href: '/admin/authors', label: 'Authors', icon: Users },
  { href: '/admin/topics', label: 'Topics', icon: Tag },
  { href: '/admin/synthesis', label: 'Synthesis', icon: BookOpen },
  { href: '/admin/corrections', label: 'Corrections', icon: AlertCircle },
  { href: '/admin/moderation', label: 'Moderation', icon: MessageSquare },
  { href: '/admin/funders', label: 'Funders', icon: Building2 },
  { href: '/admin/subscribers', label: 'Subscribers', icon: Mail },
]

const ADMIN_ONLY_ITEMS = [
  { href: '/admin/users', label: 'Users', icon: Shield },
  { href: '/admin/audit', label: 'Audit log', icon: ScrollText },
]

export function AdminSidebar({ role }: { role?: string }) {
  const pathname = usePathname()
  const isAdmin = role === 'ADMIN'

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-logo">
        <Link href="/admin" className="admin-logo-link">
          <span className="admin-logo-text">TNE</span>
          <span className="admin-logo-sub">Editorial</span>
        </Link>
      </div>

      <nav className="admin-nav">
        {NAV_ITEMS.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn('admin-nav-item', active && 'admin-nav-item--active')}
            >
              <item.icon className="admin-nav-icon" size={16} />
              <span>{item.label}</span>
            </Link>
          )
        })}
        {isAdmin && (
          <>
            <div className="admin-nav-divider" />
            {ADMIN_ONLY_ITEMS.map((item) => {
              const active = pathname.startsWith(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn('admin-nav-item', active && 'admin-nav-item--active')}
                >
                  <item.icon className="admin-nav-icon" size={16} />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </>
        )}
      </nav>

      <div className="admin-sidebar-foot">
        <button
          className="admin-signout-btn"
          onClick={() => signOut({ callbackUrl: '/admin/login' })}
        >
          <LogOut size={14} />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  )
}
