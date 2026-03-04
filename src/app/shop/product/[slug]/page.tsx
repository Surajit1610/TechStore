"use client"

import {  use, useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import axios from "axios"
import { toast } from "react-toastify"
import Footer from "@/components/Footer"
import { IconMinus, IconPlus, IconShoppingCart, IconHeart, IconStar, IconHeartFilled } from "@tabler/icons-react"
import { useAuthStore } from "@/store/Auth"
import { useDataStore } from "@/store/Data"
import LoadingProduct from "./loading"
import { Skeleton } from '@/components/ui/skeleton'


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
      // Try to fetch a single product endpoint first
    //   try {
    //     const res = await axios.get(`/api/company/product/${slug}`)
    //     if (res?.data) {
    //       setProduct(res.data)
    //       setLoading(false)
    //       return
    //     }
    //   } catch (e) {
    //     // fallback to fetching all and finding by id
    //     console.error(e)
    //   }

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
        response.then(res=> {const products = res.data
          // console.log(products);
          setIsLiked(true)
          setUserData(user?.$id)
          toast.success("Product added to liked")
       })
        .catch(err=>{
          console.log(err)
          toast.error("Failed to add to liked")
        })
  }

  const removeFromLiked = async (userID: string, productID: string)=>{
        const response = axios.post("/api/company/product/remove-from-liked", {userID, productID})
        response.then(res=> {const products = res.data
        //   console.log(products);
          setIsLiked(false)
          setUserData(user?.$id)
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
      // Filter out the current product and limit to 8
      const filtered = allRelated.filter((p: any) => p.slug !== slug).slice(0, 8)
      setRelatedProducts(filtered)
    } catch (err) {
      console.error(err)
      // Silently fail for related products
    }
  }


  const changeQty = (delta: number) => {
    setQty((prev) => Math.max(1, prev + delta))
  }

  const addToCart = () => {
    if (!product) return
    try {

        const res = axios.post("/api/user/cart/add", {customerID: userData?.$id, productID: product.$id, productName: product.productName, slug: product.slug, price: product.finalPrice, qty: qty})
        res.then(response=> {
          console.log(response.data);
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

              <div className="flex items-center gap-3">
                <div className="flex items-center border rounded-md overflow-hidden px-0.5">
                  <button onClick={() => changeQty(-1)} className="px-3 py-2 rounded dark:hover:bg-gray-700 hover:bg-gray-100"><IconMinus size={16} /></button>
                  <div className="px-4 py-2 font-medium">{qty}</div>
                  <button onClick={() => changeQty(1)} className="px-3 py-2 rounded dark:hover:bg-gray-700 hover:bg-gray-100"><IconPlus size={16} /></button>
                </div>

                <button onClick={addToCart} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 active:scale-95 cursor-pointer">
                  <IconShoppingCart /> Add to cart
                </button>

              </div>
            </div>

            {/* Description / Reviews */}
            <div className="mt-4 bg-card p-4 rounded-md shadow-sm border">
              <button className="w-full text-left pb-2 border-b mb-3" onClick={() => setExpanded(!expanded)}>
                <strong className="">Product Details</strong>
              </button>

              {/* Render description as HTML. If it's plain text, convert newlines to <br/> to preserve paragraphs. */}
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
                  <p>No further details.</p>
                )}
              </div>
            </div>
            
          </div>
        </div>
        {/* You May Also Like */}
          {/* <Suspense fallback={<AlsoLikeSkeleton />}> */}
            {relatedProducts?.length > 0 && (
              <div className="mt-8 border-t pt-6">
                <h2 className="text-2xl font-bold mb-4">You may also like</h2>
                  
                    <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 md:gap-3'>
                      {relatedProducts.map(({ $id, slug, productName, images, price, finalPrice }) => (
                        <div
                          key={$id}
                          onClick={() => router.push(`/shop/product/${slug}`)}
                          className='relative flex flex-col justify-center gap-1 p-2 border rounded-md shadow-md bg-card hover:cursor-pointer hover:shadow-lg hover:scale-103 transition active:scale-97'
                        >
                          <div className='relative aspect-square rounded-md overflow-hidden bg-gray-100 dark:bg-gray-700'>
                            <img
                              src={images?.[0]}
                              alt={productName}
                              className='w-full h-full object-cover hover:scale-110 transition'
                            />
                          </div>
                          <div>
                            <p className='line-clamp-2 overflow-hidden h-10 text-sm font-semibold'>{productName}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-sm font-medium">₹{finalPrice}</span>
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
          {/* </Suspense>    */}
      </div>
      <Footer />
    </div>
  )

  }