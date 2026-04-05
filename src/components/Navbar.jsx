"use client"

import React, { use } from 'react'
import { useState, useEffect } from "react";
import  { IconBrandShopee, IconUser, IconLogout, IconShoppingCart, IconSearch, IconHome, IconShoppingBag,
   IconBuildingStore, IconSunFilled, IconMoon, IconHeart, IconWallet, IconBellFilled, IconMenu2, 
   IconX} from "@tabler/icons-react";
import Image from 'next/image';  
import { useRouter } from 'next/navigation'; 
import { useAuthStore } from "@/store/Auth";
import { useDataStore } from "@/store/Data";
import ClickAwayListener from 'react-click-away-listener';
import Link from "next/link";
import { Icon } from 'lucide-react';
import { usePathname } from 'next/navigation';




function Navbar() {
  const router = useRouter()
  const pathname = usePathname();
  
  // const [theme, setTheme] = useState("dark");
  const {logout, user, theme, darkTheme, lightTheme} = useAuthStore()
  const{userData, setUserData} = useDataStore()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);


  useEffect(() => {
    if(user) {
      setUserData(user.$id)
    }
  }, [user])


  React.useEffect(()=>{
    document.querySelector('html').classList.remove('dark', "light")
    document.querySelector('html').classList.add(theme)
  },[theme])

  const handleLogout = async ()=>{
    await logout()
    setIsDropdownOpen(false)
  }


  
  return (
    <div
     className='bg-card/60 backdrop-blur-xl flex justify-between items-center gap-2 px-2 sm:px-4 py-2 border-b sticky top-0 z-50'
    >
      {/* Sidebar Overlay */}
      <div 
        className={`fixed inset-0 bg-black/50 backdrop-blur-md z-40 transition-all duration-300 ease-in-out ${isSidebarOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
        onClick={() => setIsSidebarOpen(false)}
      />

      {/* Sidebar */}
      <ClickAwayListener onClickAway={() => isSidebarOpen && setIsSidebarOpen(false)}>
        <div className={`fixed top-0 left-0 h-screen w-64 bg-card shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className='flex flex-col h-full'>
            <div className='flex items-center justify-between p-4 border-b border-border/50'>            
              <div className='flex items-center gap-2'>
                <p className='text-2xl font-bold text-green-600 tracking-tight'>TechShop</p>
              </div>  
              <button 
                onClick={() => setIsSidebarOpen(false)} 
                className='p-2 rounded-full hover:bg-muted transition-colors active:scale-95'
              >
                <IconX size={20} />
              </button>
            </div>
            
            <div className='flex flex-col gap-2 p-4 font-medium'>
              <Link href="/" onClick={() => setIsSidebarOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${pathname === "/" ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-500" : "hover:bg-muted hover:translate-x-1"}`}>
                <IconHome size={20} />
                Home
              </Link>
              <Link href="/shop" onClick={() => setIsSidebarOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${pathname === "/shop" ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-500" : "hover:bg-muted hover:translate-x-1"}`}>
                <IconBuildingStore size={20} />
                Shop
              </Link>
              <Link href="/about" onClick={() => setIsSidebarOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${pathname === "/about" ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-500" : "hover:bg-muted hover:translate-x-1"}`}>
                <IconUser size={20} />
                About
              </Link>
            </div>
          </div>
        </div>
      </ClickAwayListener>
      <div className='flex items-center gap-2 sm:gap-4'>
        <div
         onClick={() => router.push("/")}
         className="hidden sm:flex relative cursor-pointer text-2xl font-bold text-green-600 items-center gap-1">
          TechShop
        </div>
        <div 
          onClick={() => setIsSidebarOpen(true)}
          className='flex sm:hidden hover:bg-green-200 dark:hover:bg-green-950 active:scale-95 active:bg-green-300 active:dark:bg-green-950 p-1 rounded transition cursor-pointer'>
          <IconMenu2 />
        </div>
        {user && (user.labels.includes("owner") ) &&
        <button onClick={()=> router.push("/dashboard")} className=' border-2 border-green-700 rounded-full px-2 py-1 cursor-pointer active:scale-95'>
          <div className='font-semibold'>Dashboard</div>
        </button>
        }
      </div>
      
      <div className="hidden sm:flex items-center gap-4 lg:gap-8 font-semibold">
        <Link href="/" className={`hover:text-green-500 transition ${pathname === "/" ? "text-green-600" : ""}`}>
          Home
        </Link>
        <Link href="/shop" className={`hover:text-green-500 transition ${pathname === "/shop" ? "text-green-600" : ""}`}>
          Shop
        </Link>
        <Link href="/about" className={`hover:text-green-500 transition ${pathname === "/about" ? "text-green-600" : ""}`}>
          About
        </Link>
      </div>

      <div className='flex gap-3 items-center'>
       
        {user&&
          <div onClick={()=> router.push("/user/notification")} className='cursor-pointer hover:scale-110 active:scale-95 relative'>
            <IconBellFilled/>
            {user?.hasUnreadNotification &&
              <div className='bg-red-500 h-2.5 w-2.5 rounded-full absolute top-0.5 right-0'></div>
            }
          </div>
        }  
        {theme === "dark" ? (
          <IconSunFilled className="hidden sm:flex cursor-pointer hover:scale-110 active:scale-95" onClick={lightTheme} />
        ) : (
          <IconMoon className="hidden sm:flex cursor-pointer hover:scale-110 active:scale-95" onClick={darkTheme} />
        )}
        {!user && 
          <div>
            {theme === "dark" ? (
              <IconSunFilled className="flex sm:hidden cursor-pointer hover:scale-110 active:scale-95" onClick={lightTheme} />
            ) : (
              <IconMoon className="flex sm:hidden cursor-pointer hover:scale-110 active:scale-95" onClick={darkTheme} />
            )}
          </div>
        }

        
        {user ? (
          <div>
            <div 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-9 h-9 rounded-full overflow-hidden relative cursor-pointer border-2 active:scale-95">
              {userData?.avatar ? (
                <Image
                  src={userData.avatar}
                  alt="avatar"
                  fill
                  className="object-cover"
                />
              ) : (
                <Image
                  src="/user.png"
                  alt="avatar"
                  fill
                  className="object-cover"
                />
              )}
            </div>  
            {isDropdownOpen && (
              <ClickAwayListener onClickAway={() => setIsDropdownOpen(false)}>
                <div className='absolute right-0 mt-2 w-30 bg-white dark:bg-black border
                 border-gray-700 rounded-md shadow-lg p-1 z-30'>
                  
                  <Link
                    href="/user"
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center gap-2 w-full text-left border-b
                    px-4 py-2 hover:bg-green-100 dark:hover:bg-gray-800 cursor-pointer"
                  >
                    <IconUser/>
                    Profile
                  </Link>


                  <Link
                    href="/user/cart"
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center gap-2 w-full text-left border-b
                    px-4 py-2 hover:bg-green-100 dark:hover:bg-gray-800"
                  >
                    <IconShoppingCart/>
                    Cart
                  </Link>
                  
                  <Link
                    href="/user/liked"
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center gap-2 w-full text-left border-b
                    px-4 py-2 hover:bg-green-100 dark:hover:bg-gray-800"
                  >
                    <IconHeart/>
                    Liked
                  </Link>

                  {theme==="dark" ? <button
                    onClick={lightTheme}
                    className="flex sm:hidden items-center gap-2 w-full text-left border-b
                      px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      <IconSunFilled/>
                      Light
                    </button>
                    : <button
                        onClick={darkTheme}
                        className="flex sm:hidden items-center gap-2 w-full text-left border-b
                        px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                      >
                        <IconMoon/>
                        Dark
                  </button>}

                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full text-left cursor-pointer
                    px-4 py-2 hover:bg-green-100 dark:hover:bg-gray-800"
                  >
                    <IconLogout/>
                    Logout
                  </button>
                </div>
              </ClickAwayListener>          
            )}
          </div>
        ) : (
          <button
            onClick={() => router.push("/login")}
            className='px-2.5 py-1 text-white font-semibold bg-green-700 rounded-full border hover:bg-green-800 active:scale-95 cursor-pointer'>
            Login
          </button>
        )}
      </div>
    </div>
  )
}

export default Navbar