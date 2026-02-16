"use client";

import { Sidebar } from "@/components/admin/sidebar";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (!isPending) {
      if (!session) {
        router.replace("/login");
      } else if ((session?.user as any).role !== "admin") {
        router.replace("/");
      } else {
        setIsAuthorized(true);
      }
    }
  }, [session, isPending, router]);

  if (isPending || !isAuthorized) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-gray-500">Verifying access...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-72 md:fixed md:inset-y-0 z-[80] bg-gray-900">
        <Sidebar />
      </div>

      {/* Main Content */}
      <main className="md:pl-72 pb-10 bg-gray-50 dark:bg-gray-900 min-h-screen">
        {/* Mobile Header */}
        <div className="md:hidden sticky top-0 z-10 bg-gray-900 text-white p-4 flex items-center shadow-md">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 bg-gray-900 border-r-gray-800 text-white w-72">
              <Sidebar />
            </SheetContent>
          </Sheet>
          <span className="ml-4 font-bold text-lg">Admin Dashboard</span>
        </div>

        <div className="px-4 sm:px-6 lg:px-8 py-4">
          {children}
        </div>
      </main>
    </div>
  );
}
