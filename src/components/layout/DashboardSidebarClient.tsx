"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Briefcase,
  PlusCircle,
  Users,
  CheckSquare,
  MapPin,
  DollarSign,
  Bell,
  User,
  Shield,
  MessageSquare,
  Mail,
  Activity,
  AlertTriangle,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthSession } from "@/lib/auth";
import { toast } from "sonner";

interface DashboardSidebarClientProps {
  session: AuthSession;
  children: React.ReactNode;
}

export default function DashboardSidebarClient({
  session,
  children,
}: DashboardSidebarClientProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  // Fetch recent notifications
  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } catch (e) {
      console.warn("Failed to fetch notifications:", e);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Lightweight periodic polling for demo (e.g. every 30s)
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleSignOut = async () => {
    try {
      const res = await fetch("/api/auth/session", {
        method: "POST",
        body: JSON.stringify({ action: "signout" }),
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) {
        toast.success("Logged out successfully");
        router.refresh();
        router.push("/");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const res = await fetch("/api/notifications", { method: "PUT" });
      if (res.ok) {
        setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
        toast.success("All notifications marked as read");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Define sidebar items based on role
  const clientItems = [
    { name: "Dashboard", href: "/dashboard/client", icon: <LayoutDashboard className="h-5 w-5" /> },
    { name: "Projects", href: "/dashboard/client/projects", icon: <Briefcase className="h-5 w-5" /> },
    { name: "Create Project", href: "/dashboard/client/projects/create", icon: <PlusCircle className="h-5 w-5" /> },
    { name: "Contractors", href: "/dashboard/client/contractors", icon: <Users className="h-5 w-5" /> },
    { name: "Milestones", href: "/dashboard/client/milestones", icon: <CheckSquare className="h-5 w-5" /> },
    { name: "Payments", href: "/dashboard/client/payments", icon: <DollarSign className="h-5 w-5" /> },
    { name: "Notifications", href: "/dashboard/client/notifications", icon: <Bell className="h-5 w-5" /> },
    { name: "Profile", href: "/dashboard/client/profile", icon: <User className="h-5 w-5" /> },
  ];

  const contractorItems = [
    { name: "Dashboard", href: "/dashboard/contractor", icon: <LayoutDashboard className="h-5 w-5" /> },
    { name: "Assigned Projects", href: "/dashboard/contractor/projects", icon: <Briefcase className="h-5 w-5" /> },
    { name: "Milestones", href: "/dashboard/contractor/milestones", icon: <CheckSquare className="h-5 w-5" /> },
    { name: "GPS Check-Ins", href: "/dashboard/contractor/gps", icon: <MapPin className="h-5 w-5" /> },
    { name: "Payments", href: "/dashboard/contractor/payments", icon: <DollarSign className="h-5 w-5" /> },
    { name: "Notifications", href: "/dashboard/contractor/notifications", icon: <Bell className="h-5 w-5" /> },
    { name: "Profile", href: "/dashboard/contractor/profile", icon: <User className="h-5 w-5" /> },
  ];

  const adminItems = [
    { name: "Dashboard", href: "/dashboard/admin", icon: <LayoutDashboard className="h-5 w-5" /> },
    { name: "Users", href: "/dashboard/admin/users", icon: <Users className="h-5 w-5" /> },
    { name: "Contractors", href: "/dashboard/admin/contractors", icon: <Shield className="h-5 w-5" /> },
    { name: "Projects", href: "/dashboard/admin/projects", icon: <Briefcase className="h-5 w-5" /> },
    { name: "Milestones", href: "/dashboard/admin/milestones", icon: <CheckSquare className="h-5 w-5" /> },
    { name: "GPS Activity", href: "/dashboard/admin/gps", icon: <MapPin className="h-5 w-5" /> },
    { name: "Payments", href: "/dashboard/admin/payments", icon: <DollarSign className="h-5 w-5" /> },
    { name: "Disputes", href: "/dashboard/admin/disputes", icon: <AlertTriangle className="h-5 w-5" /> },
    { name: "Testimonials", href: "/dashboard/admin/testimonials", icon: <MessageSquare className="h-5 w-5" /> },
    { name: "Contact Requests", href: "/dashboard/admin/contacts", icon: <Mail className="h-5 w-5" /> },
    { name: "Audit Logs", href: "/dashboard/admin/audit", icon: <Activity className="h-5 w-5" /> },
  ];

  const menuItems = session.role === "CLIENT" ? clientItems : session.role === "CONTRACTOR" ? contractorItems : adminItems;

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Breadcrumbs generation
  const pathParts = pathname.split("/").filter(Boolean);
  const breadcrumbs = pathParts.map((part, index) => {
    const href = "/" + pathParts.slice(0, index + 1).join("/");
    return { name: part.replace(/-/g, " "), href };
  });

  return (
    <div className="w-full min-h-screen flex flex-col md:flex-row relative">
      
      {/* 1. Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-white shrink-0 sticky top-0 h-screen border-r border-slate-800">
        {/* Sidebar Header */}
        <div className="h-16 flex items-center px-6 border-b border-slate-800 space-x-2">
          <ShieldCheck className="h-6 w-6 text-sky-400" />
          <span className="font-extrabold text-lg text-white tracking-tight">CivicBuild</span>
          <span className="text-[9px] uppercase bg-sky-950 border border-sky-800 text-sky-300 font-semibold px-2 py-0.5 rounded-full">
            Console
          </span>
        </div>

        {/* Sidebar Nav Items */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link key={item.name} href={item.href}>
                <span
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition duration-150 cursor-pointer ${
                    isActive
                      ? "bg-sky-950 text-sky-400 border border-sky-900/30"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                  }`}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40">
          <div className="flex items-center justify-between">
            <div className="truncate pr-2">
              <p className="text-xs font-semibold text-slate-200 truncate">{session.fullName}</p>
              <p className="text-[9px] text-slate-500 truncate capitalize">{session.role.toLowerCase()}</p>
            </div>
            <Button
              onClick={handleSignOut}
              size="icon"
              variant="ghost"
              className="text-slate-400 hover:text-red-400 hover:bg-slate-800/80 shrink-0"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* 2. Mobile Nav Header */}
      <div className="md:hidden flex items-center justify-between h-16 px-4 bg-slate-900 text-white sticky top-0 z-40 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="h-6 w-6 text-sky-400" />
          <span className="font-extrabold text-lg text-white">CivicBuild</span>
        </div>
        <div className="flex items-center space-x-2">
          {/* Notification bell in Mobile */}
          <div className="relative">
            <Button
              onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
              size="icon"
              variant="ghost"
              className="text-slate-300 hover:text-white"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white rounded-full text-[9px] h-4 w-4 flex items-center justify-center font-bold">
                  {unreadCount}
                </span>
              )}
            </Button>
          </div>

          <Button
            onClick={() => setMobileOpen(!mobileOpen)}
            size="icon"
            variant="ghost"
            className="text-slate-300 hover:text-white"
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* 3. Mobile Sidebar Drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-30 bg-slate-950/80" onClick={() => setMobileOpen(false)}>
          <aside
            className="w-64 bg-slate-900 h-full flex flex-col text-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-16 flex items-center px-6 border-b border-slate-800 space-x-2">
              <ShieldCheck className="h-6 w-6 text-sky-400" />
              <span className="font-extrabold text-lg text-white">CivicBuild</span>
            </div>
            <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
              {menuItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link key={item.name} href={item.href} onClick={() => setMobileOpen(false)}>
                    <span
                      className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition duration-150 cursor-pointer ${
                        isActive
                          ? "bg-sky-950 text-sky-400 border border-sky-900/30"
                          : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                      }`}
                    >
                      {item.icon}
                      <span>{item.name}</span>
                    </span>
                  </Link>
                );
              })}
            </nav>
            <div className="p-4 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-200">{session.fullName}</p>
                  <p className="text-[9px] text-slate-500 capitalize">{session.role.toLowerCase()}</p>
                </div>
                <Button
                  onClick={() => { setMobileOpen(false); handleSignOut(); }}
                  size="icon"
                  variant="ghost"
                  className="text-slate-400 hover:text-red-400"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* 4. Main Section Container */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header navbar (Desktop) */}
        <header className="hidden md:flex h-16 bg-white border-b border-slate-200 items-center justify-between px-8 sticky top-0 z-30">
          {/* Breadcrumbs */}
          <div className="flex items-center space-x-1.5 text-xs text-slate-500 font-medium">
            <span className="capitalize">console</span>
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={idx}>
                <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
                <span className={`capitalize ${idx === breadcrumbs.length - 1 ? "text-slate-800 font-bold" : "hover:text-slate-800"}`}>
                  {crumb.name}
                </span>
              </React.Fragment>
            ))}
          </div>

          {/* Right menu tools */}
          <div className="flex items-center space-x-6">
            
            {/* Prototype Role Label */}
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Access Scope:</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                session.role === "CLIENT"
                  ? "bg-sky-50 text-sky-700 border-sky-200"
                  : session.role === "CONTRACTOR"
                  ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                  : "bg-emerald-50 text-emerald-700 border-emerald-200"
              }`}>
                {session.role}
              </span>
            </div>

            {/* Notification Bell Dropdown */}
            <div className="relative">
              <Button
                onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                size="icon"
                variant="ghost"
                className="text-slate-500 hover:text-slate-900 relative"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 bg-red-500 text-white rounded-full text-[8px] h-4 w-4 flex items-center justify-center font-bold">
                    {unreadCount}
                  </span>
                )}
              </Button>

              {/* Dropdown panel */}
              {notifDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
                    <h4 className="text-xs font-bold text-slate-800">Notifications</h4>
                    {unreadCount > 0 && (
                      <button onClick={handleMarkAllRead} className="text-[10px] font-semibold text-sky-600 hover:text-sky-500">
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {notifications.length === 0 ? (
                      <p className="text-[11px] text-slate-400 text-center py-6">No notifications</p>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n._id}
                          className={`p-2 rounded-lg text-left text-xs border transition duration-150 ${
                            n.isRead ? "bg-slate-50/50 border-slate-100" : "bg-sky-50/20 border-sky-100"
                          }`}
                        >
                          <p className="font-semibold text-slate-800 leading-tight">{n.title}</p>
                          <p className="text-slate-600 text-[10px] mt-0.5 leading-normal">{n.message}</p>
                          <p className="text-slate-400 text-[8px] mt-1 text-right">
                            {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="border-t border-slate-100 pt-2 mt-2 text-center">
                    <Link
                      href={session.role === "CLIENT" ? "/dashboard/client/notifications" : "/dashboard/contractor/notifications"}
                      onClick={() => setNotifDropdownOpen(false)}
                      className="text-[10px] font-bold text-slate-500 hover:text-slate-800"
                    >
                      View all notifications
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Avatar & Quick Actions */}
            <div className="flex items-center space-x-3 border-l border-slate-200 pl-6">
              <div className="h-8 w-8 rounded-full bg-slate-900 border border-slate-200 flex items-center justify-center text-slate-300 text-xs font-bold font-sans">
                {session.fullName.charAt(0)}
              </div>
              <div className="text-left leading-none">
                <p className="text-xs font-bold text-slate-800">{session.fullName}</p>
                <p className="text-[9px] text-slate-400 font-semibold">{session.email}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Breadcrumbs & Mobile Notification drop block */}
        {notifDropdownOpen && (
          <div className="md:hidden bg-white border-b border-slate-200 p-4 relative z-40 max-h-72 overflow-y-auto space-y-2">
            <div className="flex items-center justify-between border-b border-slate-150 pb-2 mb-2">
              <h4 className="text-xs font-bold text-slate-800">Notifications</h4>
              <button onClick={handleMarkAllRead} className="text-[10px] font-semibold text-sky-600">Mark all read</button>
            </div>
            {notifications.slice(0, 5).map((n) => (
              <div key={n._id} className={`p-2 rounded-lg text-xs ${n.isRead ? "bg-slate-50" : "bg-sky-50"}`}>
                <p className="font-semibold text-slate-800">{n.title}</p>
                <p className="text-slate-500 text-[10px] mt-0.5">{n.message}</p>
              </div>
            ))}
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
