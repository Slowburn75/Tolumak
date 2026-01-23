"use client";

import { Sidebar } from "@/components/admin/sidebar";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (!isPending) {
      if (!session) {
        router.replace("/login");
      } else if (session.user.role !== "admin") {
        router.replace("/"); // Not admin, go home
      } else {
        setIsAuthorized(true);
      }
    }
  }, [session, isPending, router]);

  if (isPending || !isAuthorized) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-gray-500">Verifying access...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full relative">
      <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-[80] bg-gray-900">
        <Sidebar />
      </div>
      <main className="md:pl-72 py-4 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="mb-4 md:hidden">
          {/* Mobile Sidebar Trigger could go here */}
          <div className="p-4 bg-gray-800 text-white rounded-md">Mobile Menu (Tap to expand)</div>
        </div>
        {children}
      </main>
    </div>
  );
}
