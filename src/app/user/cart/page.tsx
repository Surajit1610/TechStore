"use client"

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useDataStore } from "@/store/Data";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "react-toastify";
import { IconMinus, IconPlus, IconMapPin } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
// @ts-ignore
import { load } from "@cashfreepayments/cashfree-js";

type CartItem = {
	$id: string;
	productId: string;
	productName: string;
	quantity: number;
	price: number;
};

export default function CartPage() {
	const { userData, setUserData } = useDataStore();
	const [items, setItems] = useState<CartItem[]>([]);
	const [productMap, setProductMap] = useState<Record<string, any>>({});
	const [loading, setLoading] = useState(false);
	const [isOrdering, setIsOrdering] = useState(false);
	const [addresses, setAddresses] = useState<any[]>([]);
	const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
	const [paymentMethod, setPaymentMethod] = useState<"cod" | "online">("online");
	const [cashfree, setCashfree] = useState<any>(null);
	const router = useRouter();

	useEffect(() => {
		// @ts-ignore
		load({ mode: "sandbox" }).then((cf: any) => setCashfree(cf)).catch((err: any) => console.error("Cashfree SDK failed to load", err));
	}, []);

	useEffect(() => {
		const fetchItemsAndAddresses = async () => {
			if (!userData?.$id) return;
			setLoading(true);
			try {
				// fetch cart items
				if (userData.cartId && userData.cartId.length > 0) {
					const promises = userData.cartId.map((id: string) => axios.get(`/api/item?id=${id}`));
					const responses = await Promise.all(promises);
					const fetched: CartItem[] = responses.map((r) => r.data);
					setItems(fetched);

					// fetch product details for images / links
					const uniqueProductIds = Array.from(new Set(fetched.map((f) => f.productId)));
					const prodPromises = uniqueProductIds.map((pid) => axios.post('/api/company/product/get-product', { id: pid }));
					const prodResponses = await Promise.allSettled(prodPromises);
					const map: Record<string, any> = {};
					prodResponses.forEach((res, idx) => {
						if (res.status === 'fulfilled') {
							map[uniqueProductIds[idx]] = res.value.data;
						}
					});
					setProductMap(map);
				} else {
					setItems([]);
				}

				// fetch addresses
				const addressResponse = await fetch(`/api/user/address?customerId=${userData.$id}`);
				const addressData = await addressResponse.json();
				if (addressData) {
					setAddresses(addressData);
					if (addressData.length > 0) {
						setSelectedAddress(addressData[0].$id);
					}
				}

			} catch (err) {
				console.error(err);
				toast.error("Failed to load cart items or addresses");
			} finally {
				setLoading(false);
			}
		};

		fetchItemsAndAddresses();
	}, [userData]);


	const subtotal = items.reduce((s, it) => s + (Number(it.price) || 0) * (Number(it.quantity) || 0), 0);

	const verifyPayment = async (orderId: string) => {
		try {
			const itemIds = userData.cartId || items.map((i) => i.$id);
			const res = await axios.post("/api/user/online-order/verify-cashfree", {
				orderId,
				customerId: userData.$id,
				addressID: selectedAddress,
				itemId: itemIds,
				totalAmount: subtotal,
				shipping_charge: 0.0
			});

			if (res.data?.success) {
				toast.success("Order placed successfully");
				if (setUserData && userData.$id) {
					await setUserData(userData.$id);
				}
				setItems([]);
			} else {
				toast.error("Payment verification failed");
			}
		} catch (err) {
			console.error(err);
			toast.error("Failed to verify payment");
		} finally {
			setIsOrdering(false);
		}
	}

	const handleCreateOrder = async () => {
		if (!userData || !userData.$id) {
			toast.error("No customer data available");
			return;
		}
		if (items.length === 0) {
			toast.error("Cart is empty");
			return;
		}
		if (!selectedAddress) {
			toast.error("Please select a shipping address");
			return;
		}

		setIsOrdering(true);

		if (paymentMethod === "online") {
			try {
				if (!cashfree) {
					toast.error("Payment SDK not initialized");
					setIsOrdering(false);
					return;
				}

				const customerDetails = {
					customerId: userData.$id,
					totalAmount: subtotal,
					name: userData.name,
					email: userData.email,
					phone: userData.phone || "9999999999"
				};
				
				const sessionRes = await axios.post("/api/user/online-order/create-cashfree", customerDetails);
				if (sessionRes.data?.error) {
					toast.error("Could not initiate payment");
					setIsOrdering(false);
					return;
				}

				const paymentSessionId = sessionRes.data.payment_session_id;
				const orderId = sessionRes.data.order_id;

				let checkoutOptions = {
					paymentSessionId: paymentSessionId,
					redirectTarget: "_modal",
				};

				cashfree.checkout(checkoutOptions).then((result: any) => {
					if(result.error){
						toast.error(result.error.message || "Payment Failed");
						setIsOrdering(false);
					}
					if(result.redirect){
						console.log("Redirection");
					}
					if(result.paymentDetails){
						verifyPayment(orderId);
					}
				});
			} catch (error) {
				console.error(error);
				toast.error("Error initiating payment");
				setIsOrdering(false);
			}
		} else {
			try {
				const itemIds = userData.cartId || items.map((i) => i.$id);
				const res = await axios.post("/api/user/online-order", {
					customerId: userData.$id,
					addressID: selectedAddress,
					itemId: itemIds,
					totalAmount: subtotal,
					shipping_charge: 0.0,
					paymentType: "cod",
				});

				if (res.data?.error) {
					toast.error("Failed to create order");
				} else {
					toast.success("Order placed successfully");
					// refresh customer data (will clear cart)
					if (setUserData && userData.$id) {
						await setUserData(userData.$id);
					}
					setItems([]);
				}
			} catch (err) {
				console.error(err);
				toast.error("Failed to create order");
			} finally {
				setIsOrdering(false);
			}
		}
	};

	const handleUpdateQuantity = async (itemId: string, newQty: number) => {
		if (newQty < 1) {
			// remove item
			await handleRemove(itemId);
			return;
		}
		try {
			const res = await axios.patch('/api/item', { id: itemId, quantity: newQty });
			if (res.data?.error) {
				toast.error('Failed to update quantity');
				return;
			}
			setItems((prev) => prev.map((it) => (it.$id === itemId ? { ...it, quantity: newQty } : it)));
		} catch (err) {
			console.error(err);
			toast.error('Failed to update quantity');
		}
	};

	const handleRemove = async (itemId: string) => {
		if (!userData || !userData.$id) {
			toast.error('No user');
			return;
		}
		try {
			const res = await axios.post('/api/user/cart/remove', { customerID: userData.$id, itemID: itemId });
			if (res.data?.success) {
				setItems((prev) => prev.filter((it) => it.$id !== itemId));
				if (setUserData) await setUserData(userData.$id);
				toast.success('Item removed');
			} else {
				toast.error('Failed to remove item');
			}
		} catch (err) {
			console.error(err);
			toast.error('Failed to remove item');
		}
	};

	return (
		<div className="max-w-4xl mx-auto sm:p-4 p-2">
			<h1 className="sm:text-2xl text-xl font-bold mb-4">Your Cart</h1>

			{loading ? (
				<p>Loading...</p>
			) : items.length === 0 ? (
				<p className="text-gray-600">Your cart is empty.</p>
			) : (
				<div className="space-y-4">
					{items.map((it) => {
						const product = productMap[it.productId];
						let imgSrc = '';
						if (product && product.images) {
							try {
								if (typeof product.images === 'string') {
									if (product.images.trim().startsWith('[')) {
										imgSrc = JSON.parse(product.images)[0];
									} else {
										imgSrc = product.images.split(',')[0];
									}
								} else if (Array.isArray(product.images)) {
									imgSrc = product.images[0];
								}
							} catch (e) {
								imgSrc = '';
							}
						}
						return (
							<div key={it.$id} className="sm:p-4 p-2 border rounded bg-card flex sm:gap-4 gap-2 items-center sm:flex-row flex-col">
								<div className="flex gap-4 justify-between w-full sm:w-500 md:w-800">
									{imgSrc ? (
										<a href={`/shop/product/${it.productId}`} className="w-20 h-20 block shrink-0">
											<img src={imgSrc} alt={it.productName} className="w-20 h-20 object-cover rounded" />
										</a>
									) : (
										<div className="w-20 h-20 bg-gray-100 rounded flex items-center justify-center text-sm text-gray-500">No Image</div>
									)}
									<div className="flex-1">
										<a href={`/shop/product/${it.productId}`} className="font-semibold block sm:text-lg text-sm hover:underline line-clamp-2 w-full">{it.productName}</a>
										<div className="mt-2 flex items-center gap-2">
											<button onClick={() => handleUpdateQuantity(it.$id, it.quantity - 1)} className="px-2 py-2 bg-gray-200 dark:bg-gray-800 rounded"><IconMinus size={16} /></button>
											<input type="number" min={1} value={it.quantity} onChange={(e) => handleUpdateQuantity(it.$id, parseInt(e.target.value) || 1)} className="w-16 text-center p-1 border rounded" />
											<button onClick={() => handleUpdateQuantity(it.$id, it.quantity + 1)} className="px-2 py-2 bg-gray-200 dark:bg-gray-800 rounded"><IconPlus size={16} /></button>
										</div>
									</div>
								</div>	
								<div className="text-right flex sm:flex-col items-center sm:items-end gap-4 sm:gap-0 justify-between w-full">
									<div className="text-start">
										<p className="font-semibold">₹{(it.price * it.quantity).toFixed(2)}</p>
										<p className="text-sm text-gray-500">Unit: ₹{it.price}</p>
									</div>	
									<button onClick={() => handleRemove(it.$id)} className="mt-2 text-white bg-red-500 px-2 py-1 rounded cursor-pointer active:bg-red-600 active:scale-95">Remove</button>
								</div>
							</div>
						);
					})}

					<div className="sm:p-4 p-2 border rounded bg-card">
						<div className="flex justify-between items-center">
							<span className="font-semibold">Subtotal</span>
							<span className="font-semibold">₹{subtotal.toFixed(2)}</span>
						</div>
					</div>

					<div className="sm:p-4 p-2 border rounded bg-card">
						<h2 className="font-semibold mb-2">Checkout details</h2>
						<div className="grid gap-3 mb-6">
							<h3 className="font-medium text-sm">Shipping Address</h3>
							{addresses.length > 0 ? (
								<div className="space-y-2">
									{addresses.map((address) => (
										<div key={address.$id} className="flex items-center gap-2 border p-2 rounded-md">
											<input
												type="radio"
												name="address"
												id={address.$id}
												value={address.$id}
												checked={selectedAddress === address.$id}
												onChange={(e) => setSelectedAddress(e.target.value)}
											/>
											<label htmlFor={address.$id} className="text-sm cursor-pointer w-full">
												<p>{address.location}</p>
												<p>{address.city}, {address.state} {address.pincode}</p>
												<p>{address.phone}</p>
											</label>
										</div>
									))}
								</div>
							) : (
								<p>No addresses found. Please <a href="/user" className="text-green-600 hover:underline">add an address</a>.</p>
							)}
						</div>
						
						<div className="grid gap-3 mb-6">
							<h3 className="font-medium text-sm">Payment Method</h3>
							<div className="flex gap-4">
								<label className="flex items-center gap-2 border p-3 rounded-md cursor-pointer flex-1">
									<input 
										type="radio" 
										name="paymentMethod" 
										value="online" 
										checked={paymentMethod === "online"} 
										onChange={() => setPaymentMethod("online")} 
									/>
									<span>Online Payment (Cashfree)</span>
								</label>
								<label className="flex items-center gap-2 border p-3 rounded-md cursor-pointer flex-1">
									<input 
										type="radio" 
										name="paymentMethod" 
										value="cod" 
										checked={paymentMethod === "cod"} 
										onChange={() => setPaymentMethod("cod")} 
									/>
									<span>Cash on Delivery (COD)</span>
								</label>
							</div>
						</div>

						<div className="flex justify-end">
							<button
								onClick={handleCreateOrder}
								disabled={isOrdering || addresses.length === 0}
								className="px-4 py-2 bg-green-600 text-white font-semibold rounded disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed active:scale-95"
							>
								{isOrdering ? "Processing..." : paymentMethod === "online" ? "Pay Now" : "Place Order"}
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}