"use client"

import React from 'react'
import { useRouter } from 'next/navigation'

function Footer() {
    const router = useRouter()
  return (
    <div>
        <section className='bg-card border-t mt-8 md:mt-10 py-8 px-4 md:px-8 lg:px-20'>
            <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-6'>
              <div>
                <h4 className='font-bold text-sm mb-3'>About TechShop</h4>
                <p className='text-xs md:text-sm text-gray-600 dark:text-gray-400'>Your trusted electronics marketplace for authentic gadgets, fast shipping, and expert support.</p>
              </div>
              <div>
                <h4 className='font-bold text-sm mb-3'>Quick Links</h4>
                <ul className='space-y-1 text-xs md:text-sm text-gray-600 dark:text-gray-400'>
                  <li><button onClick={() => router.push('/shop')} className='hover:text-green-600'>Shop</button></li>
                  <li><button onClick={() => router.push('/about')} className='hover:text-green-600'>About Us</button></li>
                  <li><button onClick={() => router.push('/contact')} className='hover:text-green-600'>Contact Us</button></li>
                  <li><button onClick={() => router.push('/login')} className='hover:text-green-600'>Login</button></li>
                </ul>
              </div>
              <div>
                <h4 className='font-bold text-sm mb-3'>Support</h4>
                <ul className='space-y-1 text-xs md:text-sm text-gray-600 dark:text-gray-400'>
                  <li><a href="#" className='hover:text-green-600'>FAQ</a></li>
                  <li><a href="#" className='hover:text-green-600'>Returns</a></li>
                  <li><a href="#" className='hover:text-green-600'>Shipping</a></li>
                </ul>
              </div>
              <div>
                <h4 className='font-bold text-sm mb-3'>Contact</h4>
                <p className='text-xs md:text-sm text-gray-600 dark:text-gray-400'>Email: support@techshop.com</p>
              </div>
            </div>
            <div className='border-t pt-4 text-center text-xs text-gray-500 dark:text-gray-500'>
              <p>&copy; 2026 TechShop. All rights reserved.</p>
            </div>
        </section>
    </div>
  )
}

export default Footer
