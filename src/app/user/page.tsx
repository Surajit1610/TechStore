"use client"

import React, { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/Auth'
import { IconUser, IconWallet, IconLogout, IconMapPin, IconPhone, IconMail, IconEdit, IconShoppingBag, IconHeart, IconShare, IconAddressBook, IconCircleCheck, IconCircleX, IconPlus, IconTrash } from '@tabler/icons-react'
import { toast } from 'react-toastify'
import { useDataStore } from '@/store/Data'
import Image from 'next/image';
import { account } from '@/models/client/config'


export default function ProfilePage() {
  const router = useRouter()
  const { user, logout, session } = useAuthStore()
  const { userData } = useDataStore()

  const [editingAddress, setEditingAddress] = useState(false)
  const [addresses, setAddresses] = useState<any[]>([])
  const [selectedAddress, setSelectedAddress] = useState<any>(null)
  const [addressForm, setAddressForm] = useState({
    location: '',
    city: '',
    state: '',
    pincode: '',
    phone: ''
  })

  useEffect(() => {
    if (user && userData) {
      fetchAddresses();
    }
  }, [user, userData])

  const fetchAddresses = async () => {
    try {
      const response = await fetch(`/api/user/address?customerId=${userData.$id}`);
      const data = await response.json();
      if (data) {
        setAddresses(data);
      }
    } catch (error) {
      console.error(error);
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
          <p className="text-lg font-semibold mb-4">Please log in to view your profile</p>
          <button onClick={() => router.push('/login')} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">Login</button>
        </main>
      </div>
    )
  }

  const handleLogout = async () => {
    await logout()
    toast.success('Logged out successfully')
    router.push('/')
  }

  const hendelVerifyEmail = async () => {
    try {
      const promise = account.createVerification({
        url: `${process.env.NEXT_PUBLIC_DOMAIN_NAME}/verifyEmail`
      });
      console.log(`${process.env.NEXT_PUBLIC_DOMAIN_NAME}/verifyEmail`)
      console.log(promise)
      toast.promise(promise, {
        pending: 'Sending verification email...',
        success: 'Verification email sent successfully',
        error: 'Failed to send verification email'
      });
    } catch (error) {
      console.error(error)
    }
  }

  const handleAddressSave = async () => {
    if (selectedAddress) {
      // Update address
      try {
        const response = await fetch('/api/user/address', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            documentId: selectedAddress.$id,
            ...addressForm
          })
        });
        const data = await response.json();
        if (response.ok) {
          fetchAddresses();
          setEditingAddress(false);
          setSelectedAddress(null)
          toast.success('Address updated successfully');
        } else {
          toast.error(data.error || 'Failed to update address');
        }
      } catch (error) {
        toast.error('An error occurred while updating the address');
      }
    } else {
      // Add new address
      try {
        const response = await fetch('/api/user/address', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            customerId: userData.$id,
            ...addressForm
          })
        });
        const data = await response.json();
        if (response.ok) {
          fetchAddresses();
          setEditingAddress(false);
          toast.success('Address added successfully');
        } else {
          toast.error(data.error || 'Failed to add address');
        }
      } catch (error) {
        toast.error('An error occurred while adding the address');
      }
    }
  }

  const handleEditAddress = (address: any) => {
    setSelectedAddress(address);
    setAddressForm({
      location: address.location,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      phone: address.phone
    });
    setEditingAddress(true);
  }

  const handleAddNewAddress = () => {
    setSelectedAddress(null);
    setAddressForm({
      location: '',
      city: '',
      state: '',
      pincode: '',
      phone: ''
    });
    setEditingAddress(true);
  }

  const handleDeleteAddress = async (addressId: string) => {
    if (window.confirm("Are you sure you want to delete this address?")) {
      try {
        const response = await fetch('/api/user/address', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            documentId: addressId
          })
        });
        const data = await response.json();
        if (response.ok) {
          fetchAddresses();
          toast.success('Address deleted successfully');
        } else {
          toast.error(data.error || 'Failed to delete address');
        }
      } catch (error) {
        toast.error('An error occurred while deleting the address');
      }
    }
  }

  return (
    <div className="min-h-screen">
      <main className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-2 sm:py-4 lg:py-8 ">
        {/* Header */}
        <div className="flex items-center justify-between md:mb-8 sm:mb-6 mb-4">
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3"><IconUser /> My Profile</h1>
          <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 border rounded-md text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 cursor-pointer active:scale-97"><IconLogout size={18} /> Logout</button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-6 md:gap-4 gap-2">
          {/* Left: User Info Card */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-lg md:p-6 sm:p-4 p-2 shadow-sm border">
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-24 h-24 bg-linear-to-br overflow-hidden relative rounded-full  mb-4">
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
                <h2 className="text-lg font-bold">{user?.name || 'User'}</h2>
                <p className="text-sm text-gray-500">{user?.email}</p>
              </div>

             

              {/* Quick Links */}
                <div className="space-y-2">
                  <button onClick={() => router.push('/user/cart')} className="w-full flex items-center gap-3 p-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition"><IconShoppingBag size={18} /><span>My Cart</span></button>
                  <button onClick={() => router.push('/user/liked')} className="w-full flex items-center gap-3 p-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition"><IconHeart size={18} /><span>Liked Items</span></button>
                </div>
            </div>
          </div>

          {/* Right: Details Section */}
          <div className="lg:col-span-2 lg:space-y-6 md:space-y-4 space-y-2">
            {/* Contact Info */}
            <div className="bg-card rounded-lg md:p-6 sm:p-4 p-2 shadow-sm border">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><IconAddressBook /> Contact Information</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500 flex items-center gap-2"><IconMail className='size-5' /> Email</p>
                  <div className='flex items-center gap-2'>
                    <p className="font-semibold">{user?.email}</p>
                    {user.emailVerification
                      ? <p className="text-sm text-green-600"><IconCircleCheck className='size-5' /> </p>
                      : <p onClick={hendelVerifyEmail} className="flex text-sm text-white bg-green-700 active:bg-green-800 rounded-md py-1 px-2 cursor-pointer active:scale-95">Verify</p>
                    }
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500 flex items-center gap-2"><IconPhone className='size-5' /> Phone</p>
                  <p className="font-semibold flex items-center gap-2 ">{userData?.phone || 'Not Provided'}</p>
                </div>
              </div>
            </div>

            {/* Delivery Address */}
              <div className="bg-card rounded-lg md:p-6 sm:p-4 p-2 shadow-sm border">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold flex items-center gap-2"><IconMapPin /> Delivery Address</h3>
                  <button onClick={handleAddNewAddress} className="flex items-center gap-1 text-green-600 hover:underline"><IconPlus size={16} /> Add Address</button>
                </div>

                {editingAddress ? (
                  <div className="space-y-3">
                    <input type="text" value={addressForm.location} onChange={(e) => setAddressForm({ ...addressForm, location: e.target.value })} placeholder="Location" className="w-full px-3 py-2 border rounded-md" />
                    <div className="grid grid-cols-2 gap-3">
                      <input type="text" value={addressForm.city} onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })} placeholder="City" className="px-3 py-2 border rounded-md" />
                      <input type="text" value={addressForm.state} onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })} placeholder="State" className="px-3 py-2 border rounded-md " />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <input type="text" value={addressForm.pincode} onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })} placeholder="Pincode" className="px-3 py-2 border rounded-md " />
                      <input type="tel" value={addressForm.phone} onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })} placeholder="Phone" className="px-3 py-2 border rounded-md" />
                    </div>
                    <div className="flex gap-2">
                      <button onClick={handleAddressSave} className="flex-1 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">Save</button>
                      <button onClick={() => {setEditingAddress(false) ; setSelectedAddress(null)}} className="flex-1 px-3 py-2 border rounded-md hover:bg-gray-100">Cancel</button>
                    </div>
                  </div>
                ) : (
                  addresses.length > 0 ? (
                    <div className="space-y-4">
                      {addresses.map((address) => (
                        <div key={address.$id} className="border-b pb-4">
                          <div className="flex items-center justify-between">
                            <div className="space-y-2 text-sm">
                              <p>{address.location}</p>
                              <p>{address.city}, {address.state} {address.pincode}</p>
                              <p className="flex items-center gap-2"><IconPhone size={14} /> {address.phone}</p>
                            </div>
                            <div className='flex sm:flex-row flex-col gap-2'>
                                <button onClick={() => handleEditAddress(address)} className="flex items-center gap-2 text-green-600 hover:underline"><IconEdit size={16} /> Edit</button>
                                <button onClick={() => handleDeleteAddress(address.$id)} className="flex items-center gap-2 text-red-600 hover:underline"><IconTrash size={16} /> Delete</button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p>No address found. Please add a new address.</p>
                  )
                )}
              </div>

            {/* Orders History */}
              <div className="bg-card rounded-lg md:p-6 sm:p-4 p-2 shadow-sm border">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><IconShoppingBag /> Recent Orders</h3>
                <div className="flex sm:flex-row flex-col gap-4 justify-around  text-center py-8">
                  <button onClick={() => router.push("/customer/ofline-order-history")} className='p-3 rounded-md bg-green-700 font-semibold text-white cursor-pointer active:bg-green-800 active:scale-97'>Check Offline Order History</button>
                  <button onClick={() => router.push("/user/order-history")} className='p-3 rounded-md bg-green-700 font-semibold text-white cursor-pointer active:bg-green-800 active:scale-97'>Check Online Order History</button>
                </div>
              </div>


          </div>
        </div>
      </main>
    </div>
  )
}