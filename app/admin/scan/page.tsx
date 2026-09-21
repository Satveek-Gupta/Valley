"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminScanRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/vol/scan");
  }, [router]);

  return (
    <div className="min-h-screen bg-brand-ink text-white flex items-center justify-center p-6">
      <div className="text-center space-y-3">
        <div className="w-8 h-8 border-2 border-brand-lime border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-mono uppercase tracking-widest text-zinc-400">
          Redirecting to Volunteer Gate Scan Station...
        </p>
      </div>
    </div>
  );
}
