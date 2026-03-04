"use client";

import React, { useEffect } from "react";
import Navbar from "@/components/Navbar";
import CompanyNav from "@/components/CompanyNav";
import { useAuthStore } from "@/store/Auth";
import { useRouter } from "next/navigation";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!user || (user.labels && !user.labels.includes("owner"))) {
      router.push("/");
    }
  }, [user, router]);

  return (
    <div className="">
      <div className="">
        <Navbar />
        <CompanyNav />
        {children}
      </div>
    </div>
  );
}
