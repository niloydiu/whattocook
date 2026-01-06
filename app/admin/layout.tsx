"use client";

import { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, ChefHat, Apple, Youtube, Users, LogOut, Loader2, ClipboardList } from "lucide-react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token && pathname !== "/admin/login") {
      router.push("/admin/login");
    } else {
      setIsAuthorized(true);
    }
    setLoading(false);
  }, [pathname, router]);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    router.push("/admin/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  if (!isAuthorized && pathname !== "/admin/login") {
    return null;
  }

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const navItems = [
    { href: "/admin", label: "Dashboard", icon: Home },
    { href: "/admin/recipes", label: "Recipes", icon: ChefHat },
    { href: "/admin/ingredients", label: "Ingredients", icon: Apple },
    { href: "/admin/recipe-requests", label: "Requests", icon: ClipboardList },
    { href: "/admin/recipe-reports", label: "Reports", icon: ClipboardList },
    { href: "/admin/import", label: "Import", icon: Youtube },
    { href: "/admin/users", label: "Users", icon: Users },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-8">
              <Link href="/admin" className="flex items-center gap-2">
                <ChefHat className="text-blue-600" size={24} />
                <span className="text-xl font-black text-gray-900">Admin Panel</span>
              </Link>

              <div className="hidden md:flex items-center gap-1">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-colors ${
                        isActive
                          ? "bg-blue-100"
                          : "text-gray-600"
                      }`}
                    >
                      <item.icon size={16} />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="text-sm text-gray-600"
              >
                View Site
              </Link>
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-100"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
