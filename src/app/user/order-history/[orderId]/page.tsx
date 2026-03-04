"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-toastify";
import { IconLoader2, IconTruck, IconArrowLeft, IconX } from "@tabler/icons-react";

type Item = {
  $id: string;
  productName: string;
  quantity: number;
  price: number;
  productId?: string;
};

type Customer = {
  $id: string;
  name: string;
  email: string;
  phone: string;
  state: string;
  district: string;
  block: string;
  village: string;
  pincode: string;
};

type Order = {
  $id: string;
  customerId: string;
  customer: Customer;
  address: string;
  items: Item[];
  totalAmount: number;
  shipping_charge: number;
  paymentId?: string;
  paymentStatus: "paid" | "unpaid";
  paymentType: string;
  status: string;
  shiprocketOrderId?: string;
  awb?: string;
  $createdAt: string;
};

const STATUS_COLORS: Record<string, string> = {
  placed: "bg-blue-100 text-blue-800",
  processing: "bg-yellow-100 text-yellow-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  "cancelled by customer": "bg-red-100 text-red-800",
  "cancelled by seller": "bg-red-100 text-red-800",
  refunded: "bg-orange-100 text-orange-800",
};

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.orderId as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [tracking, setTracking] = useState<any | null>(null);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const fetchOrder = async () => {
    if (!orderId) return;
    setLoading(true);
    try {
      const res = await axios.post("/api/user/online-orders/order", {orderId});
      setOrder(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load order details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const handleTrack = async () => {
    if (!order?.awb && !order?.shiprocketOrderId) {
      toast.error("No tracking info available");
      return;
    }

    setTrackingLoading(true);
    setTracking(null);
    try {
      const trackingId = (order.awb || order.shiprocketOrderId) as string;
      const res = await axios.get(`/api/company/shiprocket-track?orderId=${encodeURIComponent(trackingId)}`);
      if (res.data?.success) {
        setTracking(res.data.data);
      } else {
        toast.error("Failed to fetch tracking info");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch tracking info");
    } finally {
      setTrackingLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!order || order.status !== "placed") {
      toast.error("Only placed orders can be cancelled");
      return;
    }

    if (!confirm("Are you sure you want to cancel this order?")) return;

    setCancelling(true);
    try {
      await axios.patch(`/api/company/online-orders`, {
        orderId: order.$id,
        status: "cancelled by customer",
      });
      toast.success("Order cancelled");
      setOrder({ ...order, status: "cancelled by customer" });
    } catch (err) {
      console.error(err);
      toast.error("Failed to cancel order");
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-4 flex justify-center py-12">
        <IconLoader2 className="animate-spin" size={32} />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-green-600 hover:underline mb-4">
          <IconArrowLeft size={16} /> Back
        </button>
        <p className="text-center text-gray-600">Order not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto sm:p-4 p-2">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="text-green-600 hover:underline">
          <IconArrowLeft size={20} />
        </button>
        <h1 className="md:text-3xl sm:text-2xl text-xl font-bold">Order Details</h1>
      </div>

      {/* Order Info Card */}
      <div className="bg-card border rounded-lg md:p-6 sm:p-4 p-2 md:mb-6 sm:mb-4 mb-2">
        <div className="grid grid-cols-1 md:grid-cols-2 md:gap-6 sm:gap-4 gap-2">
          <div>
            <p className="text-sm text-gray-500">Order ID</p>
            <p className="font-mono font-semibold">{order.$id}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Status</p>
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${STATUS_COLORS[order.status]}`}>
              {order.status}
            </span>
          </div>
          <div>
            <p className="text-sm text-gray-500">Order Date</p>
            <p className="font-semibold">{new Date(order.$createdAt).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Payment Status</p>
            <p className="font-semibold capitalize">{order.paymentStatus}</p>
          </div>
        </div>
      </div>

      {/* Shipping Address */}
      <div className="bg-card border rounded-lg md:p-6 sm:p-4 p-2 md:mb-6 sm:mb-4 mb-2">
        <h2 className="sm:text-xl text-lg font-bold sm:mb-4 mb-2">Delivery Address</h2>
        <div className="text-sm text-gray-700 space-y-1">
          <p className="font-semibold">{order.customer?.name}</p>
          <p>{order.customer?.phone}</p>
          <p>
            {order.customer?.block}, {order.customer?.village}
          </p>
          <p>
            {order.customer?.district}, {order.customer?.state} {order.customer?.pincode}
          </p>
        </div>
      </div>

      {/* Order Items */}
      <div className="bg-card border rounded-lg md:p-6 sm:p-4 p-2 md:mb-6 sm:mb-4 mb-2">
        <h2 className="sm:text-xl text-lg font-bold sm:mb-4 mb-2">Order Items ({order.items.length})</h2>
        <div className="space-y-3">
          {order.items.map((item) => (
            <div key={item.$id} className="bg-gray-50 dark:bg-gray-800 p-4 rounded flex justify-between items-center">
              <div>
                <p className="font-semibold">{item.productName}</p>
                <p className="text-sm text-gray-500">
                  Qty: {item.quantity} × ₹{item.price}
                </p>
              </div>
              <p className="font-bold">₹{(item.quantity * item.price).toFixed(2)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Order Summary */}
      <div className="bg-card border rounded-lg md:p-6 sm:p-4 p-2 md:mb-6 sm:mb-4 mb-2">
        <h2 className="sm:text-xl text-lg font-bold mb-4">Order Summary</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>₹{(order.totalAmount - order.shipping_charge).toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping Charge:</span>
            <span>₹{order.shipping_charge.toFixed(2)}</span>
          </div>
          <div className="border-t pt-2 flex justify-between font-bold text-lg">
            <span>Total:</span>
            <span className="text-green-600">₹{order.totalAmount.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Tracking Section */}
      {(order.awb || order.shiprocketOrderId) && (
        <div className="bg-card border rounded-lg md:p-6 sm:p-4 p-2 md:mb-6 sm:mb-4 mb-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="sm:text-xl text-lg font-bold">Tracking Information</h2>
            <button
              onClick={handleTrack}
              disabled={trackingLoading}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-60"
            >
              {trackingLoading ? (
                <IconLoader2 size={16} className="animate-spin" />
              ) : (
                <IconTruck size={16} />
              )}
              {trackingLoading ? "Loading..." : "Track Now"}
            </button>
          </div>

          <div className="text-sm">
            {order.awb && (
              <div className="mb-2">
                <p className="text-gray-500">AWB Number</p>
                <p className="font-mono font-bold">{order.awb}</p>
              </div>
            )}
            {order.shiprocketOrderId && (
              <div>
                <p className="text-gray-500">Shiprocket Order ID</p>
                <p className="font-mono font-bold">{order.shiprocketOrderId}</p>
              </div>
            )}
          </div>

          {/* Tracking Details */}
          {tracking && (
            <div className="mt-4 bg-white dark:bg-gray-800 sm;p-4 p-2 rounded border">
              <h3 className="font-semibold mb-3">Tracking Details</h3>
              <div className="space-y-2 text-sm">
                {Array.isArray(tracking) ? (
                  tracking.map((event: any, idx: number) => (
                    <div key={idx} className="pb-2 border-b last:border-0">
                      <p className="font-semibold">{event.status || event.title}</p>
                      <p className="text-gray-500">{event.timestamp || event.date}</p>
                      {event.location && <p className="text-gray-600">{event.location}</p>}
                    </div>
                  ))
                ) : typeof tracking === "object" ? (
                  <pre className="whitespace-pre-wrap text-xs bg-gray-100 dark:bg-gray-900 p-2 rounded overflow-auto">
                    {JSON.stringify(tracking, null, 2)}
                  </pre>
                ) : (
                  <p>{JSON.stringify(tracking)}</p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Cancel Button */}
      {order.status === "placed" && (
        <div className="flex justify-end">
          <button
            onClick={handleCancel}
            disabled={cancelling}
            className="flex items-center gap-2 px-4 py-3 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-60"
          >
            {cancelling ? (
              <>
                <IconLoader2 size={16} className="animate-spin" /> Cancelling...
              </>
            ) : (
              <>
                <IconX size={16} /> Cancel Order
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}