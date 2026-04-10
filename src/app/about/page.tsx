import React from "react";
import Link from "next/link";
import { ShieldCheck, Truck, Headphones, Zap } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-slate-100">
      <div className="relative overflow-hidden rounded-[2rem] border border-slate-200/70 bg-white/90 shadow-[0_50px_120px_-60px_rgba(15,23,42,0.35)] px-6 py-14 sm:px-10 sm:py-20 dark:border-slate-800 dark:bg-slate-900/90">
        <div className="absolute inset-x-0 top-0 h-64 bg-linear-to-r from-emerald-500/10 via-sky-200/10 to-indigo-500/10 blur-3xl" />
        <div className="relative z-10 mx-auto max-w-5xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-500 dark:text-emerald-400">About TechShop</p>
          <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-slate-950 dark:text-slate-50 sm:text-5xl">
            We bring the best tech to your door.
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-slate-600 dark:text-slate-300 sm:text-lg">
            TechShop is your trusted electronics marketplace for premium gadgets, accessories, and reliable customer support. We combine fast shipping, authentic products, and expert service so you can shop with confidence.
          </p>
        </div>
      </div>

      <section className="mx-auto mt-14 max-w-6xl space-y-12">
        <div className="grid gap-10 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm sm:p-10 md:grid-cols-[1.2fr_0.8fr] dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.32em] text-emerald-500 dark:text-emerald-400">Our mission</p>
            <h2 className="mt-4 text-3xl font-bold text-slate-950 dark:text-slate-50 sm:text-4xl">Helping every shopper find the right tech.</h2>
            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600 dark:text-slate-300">
              We believe technology should be accessible, reliable, and easy to buy. That means offering verified products, honest pricing, practical advice, and fast delivery that keeps your projects moving forward.
            </p>
          </div>
          <div className="rounded-[1.5rem] bg-emerald-50 p-8 text-slate-950 shadow-inner dark:bg-emerald-500/10 dark:text-slate-100">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white shadow-sm dark:bg-slate-800">
              <Zap className="h-10 w-10 text-emerald-600 dark:text-emerald-300" />
            </div>
            <p className="mt-6 text-base leading-7 text-slate-700 dark:text-slate-300">
              From gaming setups to home office essentials, we curate every product with quality and value in mind. Our team stays ahead of industry trends so you can shop confidently for the devices you need.
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <h3 className="mt-6 text-xl font-semibold text-slate-950 dark:text-slate-50">Verified authenticity</h3>
            <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-300">
              Every item is sourced from trusted vendors so you get original brands, full warranties, and peace of mind.
            </p>
          </div>

          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300">
              <Truck className="h-7 w-7" />
            </div>
            <h3 className="mt-6 text-xl font-semibold text-slate-950 dark:text-slate-50">Fast delivery</h3>
            <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-300">
              We ship quickly and securely so your orders arrive on time and in excellent condition.
            </p>
          </div>

          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300">
              <Headphones className="h-7 w-7" />
            </div>
            <h3 className="mt-6 text-xl font-semibold text-slate-950 dark:text-slate-50">Support whenever you need it</h3>
            <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-300">
              Our friendly support team is available to answer questions, recommend products, and help you after purchase.
            </p>
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-linear-to-r from-emerald-600 via-sky-500 to-indigo-600 px-8 py-12 text-center text-white shadow-xl dark:border-slate-800">
          <p className="text-sm font-semibold uppercase tracking-[0.32em] text-emerald-200">Shop with confidence</p>
          <h2 className="mt-4 text-3xl font-bold sm:text-4xl">Find your next device today.</h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-emerald-100 sm:text-lg">
            Browse our full collection of laptops, phones, accessories, and home electronics — all backed by fast shipping and expert service.
          </p>
          <Link href="/shop" className="mt-8 inline-flex items-center justify-center rounded-full bg-white px-8 py-4 text-base font-semibold text-slate-950 shadow-lg transition hover:bg-slate-100 dark:bg-slate-100/90 dark:text-slate-950 dark:hover:bg-slate-200">
            Start shopping
          </Link>
        </div>
      </section>
    </div>
  );
}
