"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import axios from "axios"
import { toast } from "react-toastify"
import Footer from "@/components/Footer"
import { IconMinus, IconPlus, IconShoppingCart, IconHeartFilled } from "@tabler/icons-react"
import { useAuthStore } from "@/store/Auth"
import { useDataStore } from "@/store/Data"
import LoadingProduct from "./loading"
import { Skeleton } from '@/components/ui/skeleton'
// @ts-ignore
import { load } from "@cashfreepayments/cashfree-js"

const AlsoLikeSkeleton = () => (
  <div className='py-6 md:py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
    <Skeleton className='h-6 w-1/2 mb-2' />
    <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 md:gap-3'>
      {[...Array(6)].map((_, i) => (
        <div key={i} className='relative flex flex-col justify-center gap-1 p-2 border rounded-md bg-card'>
          <Skeleton className='aspect-square rounded-md' />
          <Skeleton className='h-4 mt-1 w-full' />
          <Skeleton className='h-4 mt-1 w-1/2' />
        </div>
      ))}
    </div>
  </div>
)

export default function ProductPage() {
  const router = useRouter()
  const params: any = useParams()
  const slug = params?.slug
  const {user} = useAuthStore()
  
  const {userData, setUserData} = useDataStore()

  const [product, setProduct] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [qty, setQty] = useState(1)
  const [expanded, setExpanded] = useState(false)
  const [relatedProducts, setRelatedProducts] = useState<any[]>([])
  const [isLiked, setIsLiked] = useState(false)

  // Direct Checkout State
  const [showDirectCheckout, setShowDirectCheckout] = useState(false)
  const [addresses, setAddresses] = useState<any[]>([])
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "online">("online")
  const [isProcessingOrder, setIsProcessingOrder] = useState(false)
  const [cashfree, setCashfree] = useState<any>(null)

  useEffect(() => {
    // @ts-ignore
    load({ mode: "sandbox" }).then((cf: any) => setCashfree(cf)).catch((err: any) => console.error("Cashfree SDK failed to load", err))
  }, [])

  useEffect(() => {
    if (showDirectCheckout && userData?.$id) {
      axios.get(`/api/user/address?customerId=${userData.$id}`)
        .then(res => {
            if (res.data) {
                setAddresses(res.data)
                if (res.data.length > 0) setSelectedAddress(res.data[0].$id)
            }
        })
        .catch(err => console.error("Failed to load addresses", err))
    }
  }, [showDirectCheckout, userData?.$id])

  useEffect(() => {
    if (!slug) return
    fetchProduct()
  }, [slug])

  useEffect(() => {
    if (userData && product) {
      const likedList = userData.likedProducts || []      
      setIsLiked(likedList.includes(product.$id))
    }
  }, [userData, product])

  useEffect(() => {
    if (product?.category) {
      fetchRelatedProducts(product.category)
    }
  }, [product?.category])

  const fetchProduct = async () => {
    setLoading(true)
    try {
      const resp = await axios.get("/api/company/product")
      const all = resp?.data?.rows || []
      const found = all.find((p: any) => p.slug === slug)
      setProduct(found || null)
    } catch (err) {
      console.error(err)
      toast.error("Failed to load product")
    } finally {
      setLoading(false)
    }
  }

  const addToLiked = async (userID: string, productID: string)=>{
        const response = axios.post("/api/company/product/add-to-liked", {userID, productID})
        response.then(res=> {
          setIsLiked(true)
          if(user) setUserData(user.$id)
          toast.success("Product added to liked")
       })
        .catch(err=>{
          console.log(err)
          toast.error("Failed to add to liked")
        })
  }

  const removeFromLiked = async (userID: string, productID: string)=>{
        const response = axios.post("/api/company/product/remove-from-liked", {userID, productID})
        response.then(res=> {
          setIsLiked(false)
          if(user) setUserData(user.$id)
          toast.success("Product removed from liked")
       })
        .catch(err=>{
          console.log(err)
          toast.error("Failed to remove from liked")
        })
  }

  const fetchRelatedProducts = async (categoryName: string) => {
    try {
      const resp = await axios.get("/api/company/product/get_by_category", {
        params: { categoryName },
      })
      const allRelated = resp?.data?.rows || []
      const filtered = allRelated.filter((p: any) => p.slug !== slug).slice(0, 8)
      setRelatedProducts(filtered)
    } catch (err) {
      console.error(err)
    }
  }

  const changeQty = (delta: number) => {
    setQty((prev) => Math.max(1, prev + delta))
  }

  const addToCart = () => {
    if (!product) return
    if (!userData?.$id) {
        toast.error("Please login to add to cart")
        router.push("/login")
        return
    }
    try {
        const res = axios.post("/api/user/cart/add", {customerID: userData?.$id, productID: product.$id, productName: product.productName, slug: product.slug, price: product.finalPrice, qty: qty})
        res.then(response=> {
          toast.success(`${qty} x ${product?.productName} added to cart`)
        })
        .catch(err=>{
          console.log(err)
          toast.error("Failed to add to cart")
          return
        })
    } catch (error) {
      console.error("Add to cart error:", error)
      toast.error("Failed to add to cart")
      return
    }
  }

  const handleOrderNow = () => {
    if (!userData || !userData.$id) {
        toast.error("Please login to place an order");
        router.push("/login");
        return;
    }
    setShowDirectCheckout(true);
  }

  const verifyDirectPayment = async (orderId: string, itemIdStr: string) => {
    try {
        const subtotal = product.finalPrice * qty;
        const res = await axios.post("/api/user/online-order/verify-cashfree", {
            orderId,
            customerId: userData?.$id,
            addressID: selectedAddress,
            itemId: [itemIdStr],
            totalAmount: subtotal,
            shipping_charge: 0.0,
            isDirect: true
        });

        if (res.data?.success) {
            toast.success("Order placed successfully");
            if (setUserData && userData?.$id) {
                await setUserData(userData.$id);
            }
            setShowDirectCheckout(false);
        } else {
            toast.error("Payment verification failed");
        }
    } catch (err) {
        console.error(err);
        toast.error("Failed to verify payment");
    } finally {
        setIsProcessingOrder(false);
    }
  }

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
        toast.error("Please select a shipping address");
        return;
    }

    setIsProcessingOrder(true);
    const subtotal = product.finalPrice * qty;

    try {
        // Create an item record for this direct purchase
        const itemRes = await axios.post("/api/item", {
            productId: product.$id,
            productName: product.productName,
            quantity: qty,
            price: product.finalPrice,
            slug: product.slug
        });
        
        if (itemRes.data?.error || !itemRes.data?.$id) {
            toast.error("Failed to prepare order");
            setIsProcessingOrder(false);
            return;
        }

        const newItemId = itemRes.data.$id;

        if (paymentMethod === "online") {
            if (!cashfree) {
                toast.error("Payment SDK not initialized");
                setIsProcessingOrder(false);
                return;
            }

            const customerDetails = {
                customerId: userData.$id,
                totalAmount: subtotal,
                name: userData.name,
                email: userData.email,
                phone: userData.phone || "9999999999",
                isDirect: true,
                itemId: [newItemId]
            };
            
            const sessionRes = await axios.post("/api/user/online-order/create-cashfree", customerDetails);
            if (sessionRes.data?.error) {
                toast.error("Could not initiate payment");
                setIsProcessingOrder(false);
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
                    setIsProcessingOrder(false);
                }
                if(result.redirect){
                    console.log("Redirection");
                }
                if(result.paymentDetails){
                    verifyDirectPayment(orderId, newItemId);
                }
            });

        } else {
            // COD Payment
            const res = await axios.post("/api/user/online-order", {
                customerId: userData.$id,
                addressID: selectedAddress,
                itemId: [newItemId],
                totalAmount: subtotal,
                shipping_charge: 0.0,
                paymentType: "cod",
                isDirect: true
            });

            if (res.data?.error) {
                toast.error("Failed to create order");
            } else {
                toast.success("Order placed successfully");
                if (setUserData && userData.$id) {
                    await setUserData(userData.$id);
                }
                setShowDirectCheckout(false);
            }
            setIsProcessingOrder(false);
        }
    } catch (err) {
        console.error(err);
        toast.error("Failed to process order");
        setIsProcessingOrder(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <LoadingProduct />
        <AlsoLikeSkeleton />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen">
        <div className="p-8 text-center">Product not found</div>
      </div>
    )
  }

  const images = product.images || [product.image || "/save-more.jpg"]

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 lg:py-8 sm:py-6 py-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Left: Gallery */}
          <div className="md:col-span-7 md:sticky top-20">
            <div className="bg-card rounded-lg p-3 md:p-6 shadow-sm border">
              <div className="relative w-full overflow-hidden rounded-md">
                <div className="w-full aspect-square bg-gray-100 rounded-md overflow-hidden">
                  <img
                    src={images[selectedImage]}
                    alt={product.productName}
                    className="w-full h-full object-cover transform transition-transform duration-300 hover:scale-105"
                  />
                </div>
              </div>

              {/* Thumbnails */}
              <div className="mt-3 flex gap-2 p-1 overflow-x-auto">
                {images.map((src: string, i: number) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`h-20 w-20 shrink-0 rounded-md overflow-hidden border-2 transition-all ${selectedImage === i ? 'ring-2 ring-green-400 border-green-400' : 'border-gray-300 hover:border-gray-400'} focus:outline-none`}
                  >
                    <img src={src} alt={`thumb-${i}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Details */}
          <div className="md:col-span-5">
            <div className="bg-card rounded-lg p-4 md:p-6 shadow-sm border">
              <h1 className="text-lg md:text-2xl font-bold mb-2">{product.productName}</h1>
              <div className="flex flex-col items-start gap-4 mb-3">
                <div className="flex items-center gap-2">
                    <p className="text-2xl md:text-3xl font-bold text-green-600">₹{product.finalPrice}</p>
                    <p className='text-lg md:text-xl line-through text-muted-foreground'>₹{product.price}</p>
                    <p className='text-green-400 text-lg md:text-xl'>{((product.price - product.finalPrice)/product.price * 100).toFixed(2)}% off</p>
                </div>
                <div>
                    <div>
                        {isLiked 
                            ?<div onClick={()=>{ removeFromLiked(user!.$id, product.$id)}} className='text-red-500 p-2 border  rounded-md cursor-pointer shadow-2xl'><IconHeartFilled/></div> 
                            :<div onClick={()=>{ addToLiked(user!.$id, product.$id)}} className='text-gray-300  p-2 border  rounded-md cursor-pointer shadow-2xl'><IconHeartFilled/></div>
                        }
                    </div>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                    <div className="flex items-center border rounded-md overflow-hidden px-0.5">
                    <button onClick={() => changeQty(-1)} className="px-3 py-2 rounded dark:hover:bg-gray-700 hover:bg-gray-100"><IconMinus size={16} /></button>
                    <div className="px-4 py-2 font-medium">{qty}</div>
                    <button onClick={() => changeQty(1)} className="px-3 py-2 rounded dark:hover:bg-gray-700 hover:bg-gray-100"><IconPlus size={16} /></button>
                    </div>

                    <button onClick={addToCart} className="flex-1 flex justify-center items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-foreground border rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 active:scale-95 cursor-pointer transition">
                    <IconShoppingCart size={20} /> Add to cart
                    </button>
                </div>
                
                <button onClick={handleOrderNow} className="w-full flex justify-center items-center gap-2 px-4 py-2.5 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 active:scale-95 cursor-pointer shadow-md transition">
                  Buy Now
                </button>
              </div>
            </div>

            {/* Direct Checkout Section */}
            {showDirectCheckout && (
              <div className="mt-4 bg-card p-4 rounded-md shadow-md border border-green-200 dark:border-green-900 animate-in fade-in slide-in-from-top-4">
                <div className="flex justify-between items-center mb-4 pb-2 border-b">
                    <h2 className="text-lg font-bold">Checkout Details</h2>
                    <button onClick={() => setShowDirectCheckout(false)} className="text-sm text-gray-500 hover:text-gray-800 dark:hover:text-gray-200">Cancel</button>
                </div>
                
                <div className="grid gap-3 mb-5">
                    <h3 className="font-medium text-sm text-muted-foreground">Shipping Address</h3>
                    {addresses.length > 0 ? (
                        <div className="space-y-2">
                            {addresses.map((address) => (
                                <div key={address.$id} className={`flex items-start gap-3 border p-3 rounded-md transition ${selectedAddress === address.$id ? 'border-green-500 bg-green-50 dark:bg-green-900/10' : ''}`}>
                                    <input
                                        type="radio"
                                        name="address"
                                        id={address.$id}
                                        value={address.$id}
                                        checked={selectedAddress === address.$id}
                                        onChange={(e) => setSelectedAddress(e.target.value)}
                                        className="mt-1"
                                    />
                                    <label htmlFor={address.$id} className="text-sm cursor-pointer w-full">
                                        <p className="font-medium">{address.location}</p>
                                        <p className="text-muted-foreground">{address.city}, {address.state} {address.pincode}</p>
                                        <p className="text-muted-foreground">{address.phone}</p>
                                    </label>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm">No addresses found. Please <a href="/user" className="text-green-600 hover:underline">add an address</a> in your profile.</p>
                    )}
                </div>
                
                <div className="grid gap-3 mb-5">
                    <h3 className="font-medium text-sm text-muted-foreground">Quantity</h3>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center border rounded-md overflow-hidden px-0.5">
                            <button onClick={() => changeQty(-1)} className="px-3 py-2 rounded dark:hover:bg-gray-700 hover:bg-gray-100"><IconMinus size={16} /></button>
                            <div className="px-4 py-2 font-medium">{qty}</div>
                            <button onClick={() => changeQty(1)} className="px-3 py-2 rounded dark:hover:bg-gray-700 hover:bg-gray-100"><IconPlus size={16} /></button>
                        </div>
                    </div>
                </div>

                <div className="grid gap-3 mb-6">
                    <h3 className="font-medium text-sm text-muted-foreground">Payment Method</h3>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <label className={`flex items-center gap-2 border p-3 rounded-md cursor-pointer flex-1 transition ${paymentMethod === 'online' ? 'border-green-500 bg-green-50 dark:bg-green-900/10' : ''}`}>
                            <input 
                                type="radio" 
                                name="paymentMethod" 
                                value="online" 
                                checked={paymentMethod === "online"} 
                                onChange={() => setPaymentMethod("online")} 
                            />
                            <span className="text-sm font-medium">Online (Cashfree)</span>
                        </label>
                        <label className={`flex items-center gap-2 border p-3 rounded-md cursor-pointer flex-1 transition ${paymentMethod === 'cod' ? 'border-green-500 bg-green-50 dark:bg-green-900/10' : ''}`}>
                            <input 
                                type="radio" 
                                name="paymentMethod" 
                                value="cod" 
                                checked={paymentMethod === "cod"} 
                                onChange={() => setPaymentMethod("cod")} 
                            />
                            <span className="text-sm font-medium">Cash on Delivery</span>
                        </label>
                    </div>
                </div>

                <div className="flex justify-between items-center border-t pt-4 mt-2">
                    <div>
                        <p className="text-xs text-muted-foreground">Total Amount</p>
                        <p className="text-xl font-bold text-green-600">₹{product.finalPrice * qty}</p>
                    </div>
                    <button
                        onClick={handlePlaceOrder}
                        disabled={isProcessingOrder || addresses.length === 0}
                        className="px-6 py-2 bg-green-600 text-white font-semibold rounded-md disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed active:scale-95 transition-all shadow-sm hover:bg-green-700"
                    >
                        {isProcessingOrder ? "Processing..." : paymentMethod === "online" ? "Pay Now" : "Place Order"}
                    </button>
                </div>
              </div>
            )}

            {/* Description */}
            <div className="mt-4 bg-card p-4 rounded-md shadow-sm border">
              <button className="w-full text-left pb-2 border-b mb-3" onClick={() => setExpanded(!expanded)}>
                <strong className="">Product Details</strong>
              </button>
              <div className="text-sm">
                {product.description ? (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: /<[^>]+>/.test(product.description)
                        ? product.description
                        : (product.description as string).replace(/\n/g, '<br/>')
                    }}
                  />
                ) : (
                  <p className="text-muted-foreground">No further details available.</p>
                )}
              </div>
            </div>
            
          </div>
        </div>

        {/* You May Also Like */}
        {relatedProducts?.length > 0 && (
          <div className="mt-8 border-t pt-6">
            <h2 className="text-2xl font-bold mb-4">You may also like</h2>
              <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 md:gap-3'>
                {relatedProducts.map(({ $id, slug, productName, images, price, finalPrice }) => (
                  <div
                    key={$id}
                    onClick={() => router.push(`/shop/product/${slug}`)}
                    className='relative flex flex-col justify-center gap-1 p-2 border rounded-md shadow-sm bg-card hover:cursor-pointer hover:shadow-md hover:scale-[1.02] transition active:scale-[0.98]'
                  >
                    <div className='relative aspect-square rounded-md overflow-hidden bg-gray-100 dark:bg-gray-800'>
                      <img
                        src={images?.[0]}
                        alt={productName}
                        className='w-full h-full object-cover hover:scale-110 transition duration-300'
                      />
                    </div>
                    <div className="mt-1">
                      <p className='line-clamp-2 overflow-hidden text-sm font-semibold h-10 leading-tight'>{productName}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-sm font-bold text-green-600">₹{finalPrice}</span>
                        {price > finalPrice && (
                          <span className="text-xs text-muted-foreground line-through">₹{price}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}
