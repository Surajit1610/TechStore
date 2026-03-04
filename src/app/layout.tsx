import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ToastContainer } from "react-toastify";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TechStore",
  description: "TechStore is an online platform that offers a wide range of electronic products, including smartphones, laptops, tablets, and accessories. With a user-friendly interface and secure payment options, TechStore provides a seamless shopping experience for tech enthusiasts. Customers can browse through the latest gadgets, read reviews, and make informed purchasing decisions. TechStore also offers fast shipping and excellent customer support to ensure satisfaction with every order.  Whether you're looking for the latest smartphone or a high-performance laptop, TechStore has you covered with competitive prices and a diverse selection of products.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}

        <ToastContainer autoClose={2000} theme="colored"/>
      </body>
    </html>
  );
}