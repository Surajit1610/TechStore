"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { IconCheck, IconX, IconLoader2, IconTruck, IconPackage, IconDownload } from "@tabler/icons-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type OrderItem = {
  $id: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
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
type addressData = {
    $id: string;
    customerId: string;
    location: string;
    city: string;
    pincode: string;
    state: string;
    phone: string;
};

type OnlineOrder = {
  $id: string;
  customerId: string;
  customer: Customer;
  addressData: addressData;
  address: string;
  itemId: string[];
  items: OrderItem[];
  totalAmount: number;
  shipping_charge: number;
  paymentId?: string;
  paymentStatus: "paid" | "unpaid";
  paymentType: "cod" | "upi" | "card" | "netbanking";
  status: "placed" | "processing" | "shipped" | "delivered" | "cancelled by customer" | "cancelled by seller" | "refunded";
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

export default function OnlineOrdersPage() {
  const [orders, setOrders] = useState<OnlineOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [shiprocketToken, setShiprocketToken] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [processingOrders, setProcessingOrders] = useState<Set<string>>(new Set());
  const [showShipmentModal, setShowShipmentModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OnlineOrder | null>(null);
  const [shipmentData, setShipmentData] = useState({
    order_id: "",
    order_date: "",
    pickup_location: "Home",
    channel_id: "",
    billing_customer_name: "",
    billing_last_name: "",
    billing_email: "",
    billing_phone: "",
    billing_address: "",
    billing_city: "",
    billing_state: "",
    billing_pincode: "",
    billing_country: "",
    shipping_is_billing: true,
    order_items: [] as any[],
    payment_method: "COD",
    sub_total: 0,
    length: 5,
    breadth: 5,
    height: 5,
    weight: 0.5,
  });

  // Fetch Shiprocket token on mount
  useEffect(() => {
    const fetchShiprocketToken = async () => {
      try {
        const res = await axios.post("/api/company/shiprocket-auth");
        setShiprocketToken(res.data.token);
        console.log("Shiprocket token obtained");
        // console.log(res.data.token);
      } catch (err) {
        console.error("Failed to get Shiprocket token:", err);
        toast.error("Failed to authenticate with Shiprocket");
      }
    };

    fetchShiprocketToken();
  }, []);

  // Fetch orders
  const fetchOrders = async (page: number = 1, status: string = "all") => {
    setLoading(true);
    try {
      const query = status === "all" ? "" : `&status=${status}`;
      const res = await axios.get(`/api/company/online-orders?page=${page}&limit=20${query}`);
      setOrders(res.data.orders);
      setTotalPages(res.data.totalPages);
      setCurrentPage(page);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
      toast.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(1, selectedStatus);
  }, [selectedStatus]);

  const handleCreateShipment = async (order: OnlineOrder) => {
    if (!shiprocketToken) {
      toast.error("Shiprocket token not available");
      return;
    }

    setSelectedOrder(order);

    // Pre-fill shipment data
    setShipmentData({
      order_id: order.$id,
      order_date: new Date(order.$createdAt).toISOString().split("T")[0],
      pickup_location: "Home",
      channel_id: "",
      billing_customer_name: order.customer.name || "",
      billing_last_name: "",
      billing_email: order.customer.email || "",
      billing_phone: order.addressData.phone || "",
      billing_address: order.addressData.location || "",
      billing_city: order.addressData.city || "",
      billing_state: order.addressData.state || "",
      billing_pincode: order.addressData.pincode || "",
      billing_country: "India",
      shipping_is_billing: true,
      order_items: order.items.map((item) => ({
        name: item.productName,
        sku: item.productId,
        units: item.quantity,
        selling_price: item.price,
      })),
      payment_method: order.paymentType === "cod" ? "COD" : "PREPAID",
      sub_total: order.totalAmount,
      length: 5,
      breadth: 5,
      height: 5,
      weight: 0.5,
    });

    setShowShipmentModal(true);
  };

  const handleSubmitShipment = async () => {
    if (!shiprocketToken || !selectedOrder) {
      toast.error("Missing required data");
      return;
    }

    // if (!shipmentData.channel_id) {
    //   toast.error("Please enter channel ID");
    //   return;
    // }

    const processing = new Set(processingOrders);
    processing.add(selectedOrder.$id);
    setProcessingOrders(processing);

    try {
      // Create order in Shiprocket
      const res = await axios.post("/api/company/shiprocket-create-order", {
        token: shiprocketToken,
        order: shipmentData,
      });

      if (res.data.success) {
        toast.success("Shipment created successfully!");

        // Update order status
        await axios.patch(`/api/company/online-orders`, {
          orderId: selectedOrder.$id,
          status: "processing",
          shiprocketOrderId: `${res.data.order_id}`,
        //   awb: res.data.awb_code,
        });

        // Refresh orders
        fetchOrders(currentPage, selectedStatus);
        setShowShipmentModal(false);
      }
    } catch (err) {
      console.error("Failed to create shipment:", err);
      toast.error("Failed to create shipment");
    } finally {
      const updated = new Set(processingOrders);
      updated.delete(selectedOrder.$id);
      setProcessingOrders(updated);
    }
  };

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    const processing = new Set(processingOrders);
    processing.add(orderId);
    setProcessingOrders(processing);

    try {
      await axios.patch(`/api/company/online-orders`, {
        orderId,
        status: newStatus,
      });
      toast.success("Order status updated");
      fetchOrders(currentPage, selectedStatus);
    } catch (err) {
      console.error("Failed to update status:", err);
      toast.error("Failed to update status");
    } finally {
      const updated = new Set(processingOrders);
      updated.delete(orderId);
      setProcessingOrders(updated);
    }
  };

  return (
    <div className="w-full flex flex-col md:gap-6 sm:gap-4 gap-2 md:p-6 sm:p-4 p-2 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center sm:gap-4 gap-2">
        <div>
          <h1 className="md:text-3xl sm:text-2xl text-xl font-bold text-gray-900 dark:text-white">Online Orders</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage and ship customer orders</p>
        </div>
        <div className="px-3 py-1 bg-green-100 text-green-800 rounded-lg text-sm font-semibold">
          {orders.length} orders
        </div>
      </div>

      {/* Status Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {["all", "placed", "processing", "shipped", "delivered", "cancelled by customer", "refunded", "cancelled by seller"].map(
          (status) => (
            <button
              key={status}
              onClick={() => {
                setSelectedStatus(status);
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition ${
                selectedStatus === status
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300"
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          )
        )}
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12">
            <IconLoader2 className="animate-spin mx-auto mb-2" size={32} />
            <p>Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-lg border">
            <p className="text-gray-600 dark:text-gray-400">No orders found</p>
          </div>
        ) : (
          orders.map((order) => (
            <div key={order.$id} className="bg-card rounded-lg border shadow-sm">
              {/* Order Header */}
              <div
                onClick={() => setExpandedOrder(expandedOrder === order.$id ? null : order.$id)}
                className="sm:p-4 p-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition rounded-t-lg"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center sm:gap-3 gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <p className="font-bold text-lg">{order.$id.substring(0, 12)}...</p>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[order.status]}`}>
                        {order.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Customer: {order.customer.name} • {order.customer.phone}
                    </p>
                    <p className="text-sm text-gray-500">
                      Order Date: {new Date(order.$createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="sm:text-right text-left">
                    <p className="font-bold text-xl text-green-600">₹{order.totalAmount.toFixed(2)}</p>
                    <p className="text-xs text-gray-500">{order.paymentStatus}</p>
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedOrder === order.$id && (
                <div className="border-t sm:p-4 p-2 rounded-b-2xl space-y-4 bg-gray-50 dark:bg-gray-900">
                  {/* Customer Details */}
                  <div>
                    <h3 className="font-semibold mb-2">Delivery Address</h3>
                    <div className="text-sm text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 p-3 rounded">
                      <p>{order.customer.name}</p>
                      <p>{order.addressData.phone}</p>
                      <p>
                        {order.addressData.location}
                      </p>
                      <p>
                        {order.addressData.city}, {order.addressData.state} {order.addressData.pincode}
                      </p>
                    </div>
                  </div>

                  {/* Items */}
                  <div>
                    <h3 className="font-semibold mb-2">Items ({order.items.length})</h3>
                    <div className="space-y-2">
                      {order.items.map((item) => (
                        <div
                          key={item.$id}
                          className="bg-white dark:bg-gray-800 p-3 rounded flex justify-between items-center"
                        >
                          <div>
                            <p className="font-medium">{item.productName}</p>
                            <p className="text-sm text-gray-500">
                              Qty: {item.quantity} × ₹{item.price}
                            </p>
                          </div>
                          <p className="font-semibold">₹{(item.quantity * item.price).toFixed(2)}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className="bg-white dark:bg-gray-800 p-3 rounded space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>₹{(order.totalAmount - order.shipping_charge).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping:</span>
                      <span>₹{order.shipping_charge.toFixed(2)}</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between font-bold">
                      <span>Total:</span>
                      <span>₹{order.totalAmount.toFixed(2)}</span>
                    </div>
                    {order.awb && (
                      <div className="pt-2 border-t">
                        <p className="text-sm">
                          AWB: <span className="font-mono font-semibold">{order.awb}</span>
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 flex-wrap">
                    {order.status === "placed" && (
                      <>
                        <button
                          onClick={() => handleCreateShipment(order)}
                          disabled={processingOrders.has(order.$id)}
                          className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-60"
                        >
                          {processingOrders.has(order.$id) ? (
                            <IconLoader2 size={16} className="animate-spin" />
                          ) : (
                            <IconTruck size={16} />
                          )}
                          Create Shipment
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(order.$id, "cancelled by seller")}
                          disabled={processingOrders.has(order.$id)}
                          className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-60"
                        >
                          Cancel
                        </button>
                      </>
                    )}

                    {order.status === "processing" && (
                      <button
                        onClick={() => handleUpdateStatus(order.$id, "shipped")}
                        disabled={processingOrders.has(order.$id)}
                        className="flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-60"
                      >
                        {processingOrders.has(order.$id) ? (
                          <IconLoader2 size={16} className="animate-spin" />
                        ) : (
                          <IconPackage size={16} />
                        )}
                        Mark as Shipped
                      </button>
                    )}

                    {order.status === "shipped" && (
                      <button
                        onClick={() => handleUpdateStatus(order.$id, "delivered")}
                        disabled={processingOrders.has(order.$id)}
                        className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-60"
                      >
                        {processingOrders.has(order.$id) ? (
                          <IconLoader2 size={16} className="animate-spin" />
                        ) : (
                          <IconCheck size={16} />
                        )}
                        Mark as Delivered
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center sm:gap-4 gap-3">
          <p className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => fetchOrders(currentPage - 1, selectedStatus)}
              disabled={currentPage <= 1}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => fetchOrders(currentPage + 1, selectedStatus)}
              disabled={currentPage >= totalPages}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Shipment Modal */}
      {showShipmentModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 sm:p-4 p-2">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto md:p-6 sm:p-4 p-2">
            <h2 className="text-2xl font-bold mb-4">Create Shiprocket Shipment</h2>

            <div className="space-y-4">
              <div>
                <Label className="text-sm font-semibold">Channel ID</Label>
                <Input
                  value={shipmentData.channel_id}
                  onChange={(e) => setShipmentData({ ...shipmentData, channel_id: e.target.value })}
                  placeholder="e.g., 123456"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm">Length (cm)</Label>
                  <Input
                    type="number"
                    value={shipmentData.length}
                    onChange={(e) => setShipmentData({ ...shipmentData, length: parseFloat(e.target.value) })}
                  />
                </div>
                <div>
                  <Label className="text-sm">Breadth (cm)</Label>
                  <Input
                    type="number"
                    value={shipmentData.breadth}
                    onChange={(e) => setShipmentData({ ...shipmentData, breadth: parseFloat(e.target.value) })}
                  />
                </div>
                <div>
                  <Label className="text-sm">Height (cm)</Label>
                  <Input
                    type="number"
                    value={shipmentData.height}
                    onChange={(e) => setShipmentData({ ...shipmentData, height: parseFloat(e.target.value) })}
                  />
                </div>
                <div>
                  <Label className="text-sm">Weight (kg)</Label>
                  <Input
                    type="number"
                    value={shipmentData.weight}
                    onChange={(e) => setShipmentData({ ...shipmentData, weight: parseFloat(e.target.value) })}
                  />
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-2">Order Items</h3>
                <div className="space-y-2 bg-gray-50 dark:bg-gray-800 p-3 rounded">
                  {shipmentData.order_items.map((item, idx) => (
                    <div key={idx} className="text-sm">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-gray-500">
                        {item.units} × ₹{item.selling_price.toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  onClick={handleSubmitShipment}
                  disabled={processingOrders.has(selectedOrder.$id)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-60"
                >
                  {processingOrders.has(selectedOrder.$id) ? (
                    <>
                      <IconLoader2 size={16} className="animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <IconDownload size={16} />
                      Create Shipment
                    </>
                  )}
                </button>
                <button
                  onClick={() => setShowShipmentModal(false)}
                  className="px-4 py-2 bg-gray-300 dark:bg-gray-700 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}