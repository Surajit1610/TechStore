"use client"

import React, { useEffect, useState, Suspense } from 'react'
import { IconHeart, IconTrash, IconShoppingCart } from '@tabler/icons-react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import axios from 'axios'
import { useAuthStore } from '@/store/Auth'
import { useDataStore } from "@/store/Data"
import Loading from './loading' // Use the skeleton component
import { s } from 'motion/react-client'

type LikedItem = {
  $id: string
  slug: string
  productName: string
  images?: string[]
  price: number
  finalPrice: number
}

const LikedProducts = () => {
  const router = useRouter()
  const { user } = useAuthStore()
  const { userData, setUserData } = useDataStore()
  const [items, setItems] = useState<LikedItem[]>([])
  const [loading, setLoading] = useState(true)


  useEffect(() => {
    loadLiked()
  }, [user, userData])

  const loadLiked = async () => {
    setLoading(true)
    try {
      if (user && userData && Array.isArray(userData.likedProducts) && userData.likedProducts.length > 0) {
        const resp = await axios.get('/api/company/product')
        const all = resp?.data?.rows || []
        const liked = all.filter((p: any) => userData.likedProducts.includes(p.$id))
        setItems(liked)
      } else {
        const raw = localStorage.getItem('liked')
        setItems(raw ? JSON.parse(raw) : [])
      }
    } catch (e) {
      console.error('Failed to load liked', e)
      toast.error('Failed to load liked items')
    } finally {
      setLoading(false)
    }
  }

  const removeItem = async (id: string) => {
    try {
      if (user) {
        await axios.post('/api/company/product/remove-from-liked', { userID: user.$id, productID: id })
        if(userData){
          setUserData(user?.$id)
        }
        setItems((prev) => prev.filter((p) => p.$id !== id))
        toast.success('Removed from liked')
      } else {
        const raw = localStorage.getItem('liked')
        const updated = (raw ? JSON.parse(raw) : []).filter((p: any) => p.$id !== id)
        localStorage.setItem('liked', JSON.stringify(updated))
        setItems(updated)
        toast.info('Removed from liked')
      }
    } catch (err) {
      console.error(err)
      toast.error('Failed to remove')
    }
  }

  const addToCart = (item: LikedItem) => {
    if (!userData) {
      toast.error('Please login to add items to cart')
      return
    }

    try {
      const res = axios.post("/api/user/cart/add", {customerID: user!.$id, productID: item.$id, productName: item.productName, slug: item.slug, price: item.finalPrice, qty: 1})
      res.then(response=> {
        console.log(response.data);
        toast.success(`${item?.productName} added to cart`)
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
    return <Loading />;
  }

  if (items.length === 0) {
    return (
      <div className="bg-card rounded-lg p-12 text-center">
        <p className="text-lg font-semibold mb-2">No items in your liked list</p>
        <p className="text-sm text-muted-foreground mb-4">Tap the heart on any product to save it for later.</p>
        <div>
          <button onClick={() => router.push('/shop')} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">Browse Products</button>
        </div>
      </div>
    );
  }

  return (
    <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 sm:gap-4 gap-2'>
      {items.map((item) => (
        <div
          key={item.$id}
          className='relative flex flex-col justify-center gap-1 sm:p-3 p-1.5 border rounded-md shadow-md bg-card hover:cursor-pointer hover:shadow-lg transition'
        >
          <div onClick={() => router.push(`/shop/product/${item.slug}`)} className='relative aspect-square rounded-md overflow-hidden bg-gray-100'>
            <img src={item.images?.[0]} alt={item.productName} className='w-full h-full object-cover hover:scale-110 transition' />
          </div>
          <div className='flex-1'>
            <p className='line-clamp-2 overflow-hidden h-10 text-sm font-semibold'>{item.productName}</p>
            <div className='flex items-center gap-2'>
              <p className='font-semibold text-sm md:text-base'>₹{item.finalPrice}</p>
              {item.price > item.finalPrice && (
                <p className='text-xs text-muted-foreground line-through'>₹{item.price}</p>
              )}
            </div>
          </div>
          <div className='flex gap-2 mt-2'>
            <button onClick={() => addToCart(item)} className='flex-1 px-1 sm:px-3 py-2 bg-green-600 text-white rounded-md flex items-center justify-center gap-2 cursor-pointer active:scale-95 hover:bg-green-700 transition'>
              <IconShoppingCart className='hidden sm:flex'/> <p className='text-sm sm:text-base'>Add to Cart</p>
            </button>
            <button onClick={() => removeItem(item.$id)} className='px-3 py-2 border rounded-md text-red-500 dark:text-red-400 cursor-pointer active:scale-90'><IconTrash /></button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function LikedPage() {
  return (
    <div className="min-h-screen">
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 lg:py-8 md:py-6 py-3">
        <div className="flex items-center justify-between sm:mb-6 mb-4">
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3"><IconHeart /> Liked Items</h1>
        </div>
        <Suspense fallback={<Loading />}>
          <LikedProducts />
        </Suspense>
      </main>
    </div>
  )
}