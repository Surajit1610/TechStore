import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const AboutLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Navbar />
      <main className="relative mx-auto w-full max-w-full px-4 py-10 sm:px-6 lg:px-8">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default AboutLayout;
