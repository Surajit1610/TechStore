"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useDataStore } from "@/store/Data";
import { IconLoader2, IconMapPin, IconTruck } from "@tabler/icons-react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

type Item = {
  $id: string;
  productName: string;
  quantity: number;
  price: number;
};

type Order = {
  $id: string;
  items: Item[];
  totalAmount: number;
  shipping_charge: number;
  status: string;
  paymentStatus: string;
  shiprocketOrderId?: string;
  awb?: string;
  $createdAt: string;
};

export default function CustomerOnlineOrderHistory() {
  const router = useRouter();
  const { userData } = useDataStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [tracking, setTracking] = useState<any | null>(null);
  const [trackingLoading, setTrackingLoading] = useState(false);

  const fetchOrders = async () => {
    if (!userData || !userData.$id) return;
    setLoading(true);
    try {
      const res = await axios.get(`/api/user/online-orders?customerId=${userData.$id}`);
      setOrders(res.data.rows || []);
      console.log(res.data.rows);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load your online orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [userData?.$id]);

  const handleCancel = async (orderId: string) => {
    if (!confirm("Are you sure you want to cancel this order?")) return;
    try {
      await axios.patch(`/api/company/online-orders`, { orderId, status: "cancelled by customer" });
      toast.success("Order cancelled");
      fetchOrders();
    } catch (err) {
      console.error(err);
      toast.error("Failed to cancel order");
    }
  };

  const handleTrack = async (awb: string | undefined) => {
    if (!awb) return;
    setTrackingLoading(true);
    setTracking(null);
    try {
      const res = await axios.get(`/api/company/shiprocket-track?awb=${encodeURIComponent(awb)}`);
      if (res.data?.success) setTracking(res.data.data);
      else toast.error("Failed to fetch tracking info");
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch tracking info");
    } finally {
      setTrackingLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto sm:p-4 p-2">
      <h1 className="md:text-2xl sm:text-xl text-lg font-bold sm:mb-4 mb-2">Your Online Orders</h1>

      {loading ? (
        <div className="text-center py-8">
          <IconLoader2 className="animate-spin mx-auto" />
        </div>
      ) : orders.length === 0 ? (
        <p className="text-gray-600">No online orders found.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <div key={o.$id} onClick={()=> router.push(`/user/order-history/${o.$id}`)} className="sm:p-4 p-2 border rounded bg-card">
              <div className="flex justify-between items-start sm:gap-4 gap-2">
                <div>
                  <p className="font-semibold">Order: {o.$id}</p>
                  <p className="text-sm text-gray-500">Placed: {new Date(o.$createdAt).toLocaleString()}</p>
                  <p className="sm:mt-2 mt-1 text-sm">Items: {o.items.length}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">₹{o.totalAmount.toFixed(2)}</p>
                  <p className="text-sm text-gray-500">{o.paymentStatus}</p>
                </div>
              </div>
{/* 
                {o.status === "placed" && (
                  <button onClick={() => handleCancel(o.$id)} className="sm:mt-2 mt-1 px-3 py-2 bg-red-600 text-white rounded active:scale-95 cursor-pointer">Cancel</button>
                )} */}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}