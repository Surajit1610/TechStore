'use client'

import React , { useState, useEffect } from 'react'
import axios from 'axios'
import { Button } from '@/components/ui/button'
import { IconTrash, IconPlus, IconEdit, IconX } from '@tabler/icons-react'



type Product = {
  $id: string
  productName: string
  price: number
  stock: number
  category: string
  subcategory: string
}

type Leader = {
  $id: string;
  avatar: string;
  name: string;
  email: string;
  phone: string;
  state: string;
  district: string;
  block: string;
  village: string;
  pincode: string;
  uniqueLeaderId: string;
  wallet: number;
};

type Customer = {
  $id: string;
  avatar: string;
  name: string;
  email: string;
  phone: string;
  state: string;
  district: string;
  block: string;
  village: string;
  pincode: string;
  uniqueCustomerId: string;
  wallet: number;
  leaderId: string;
};

function Company() {
  const [addingSlider, setAddingSlider] = useState(false)
  const [sliderFile, setSliderFile] = useState<File | null>(null)
  const [sliders, setSliders] = useState({ rows: [] })
  
  // State for Featured Products
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [featuredProducts, setFeaturedProducts] = useState<{ $id: string; title: string; productIds: string[] }[]>([]);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [currentTitle, setCurrentTitle] = useState('');
  const [currentProductIds, setCurrentProductIds] = useState<string[]>([]);
  const [selectedProductId, setSelectedProductId] = useState('');

  // State for new featured product
  const [newTitle, setNewTitle] = useState('');
  const [newProductIds, setNewProductIds] = useState<string[]>([]);





  useEffect(() => {
    getSliders()
    getFeaturedProducts()
    getAllProducts()
  }, [])









  const getSliders = async ()=>{
    try {
      const response = await axios.get("/api/company/slider")
      console.log(response.data.sliders)
      setSliders(response.data.sliders)
    } catch (error) {
      console.error("Failed to fetch sliders", error) 
    }
  }  

  const addSlider = async ()=>{
    if(!sliderFile) return
    const formData = new FormData()
    formData.append('image', sliderFile)
    try {
      const response = await axios.post("/api/company/slider", formData)
      console.log(response.data)
      getSliders()
    } catch (error) {
      console.error("Failed to upload slider image", error)
    }
  }

  const removeSlider = async (id: string)=>{
    try {
      const response = await axios.post(`/api/company/slider/delete-slider/`, { id })
      console.log(response.data)
      getSliders()
    } catch (error) {
      console.error("Failed to delete slider", error)
    }
  }

  // Featured Product Functions
  const getFeaturedProducts = async () => {
    try {
      const response = await axios.get("/api/company/featured-product");
      setFeaturedProducts(response.data.products);
    } catch (error) {
      console.error("Failed to fetch featured products", error);
    }
  };

  const getAllProducts = async () => {
    try {
      // Assuming an endpoint to get all products. Please adjust if it's different.
      const response = await axios.get("/api/company/product");
      // Ensure that we always set an array, even if response.data.products is undefined.
      setAllProducts(response.data.rows || []);
      console.log("All products fetched:", response.data.rows);
    } catch (error) {
      console.error("Failed to fetch all products", error); 
    }
  };

  const handleUpdateFeaturedProduct = async () => {
    const payload = { title: currentTitle, productIds: currentProductIds };
    try {
      if (isEditing) {
        await axios.put(`/api/company/featured-product`, { id: isEditing, ...payload });
      }
      getFeaturedProducts();
      resetFeaturedProductForm();
    } catch (error) {
      console.error("Failed to save featured product", error);
    }
  };

  const handleAddFeaturedProduct = async () => {
    const payload = { title: newTitle, productIds: newProductIds };
    try {
      await axios.post("/api/company/featured-product", payload);
      getFeaturedProducts();
      setNewTitle('');
      setNewProductIds([]);
    } catch (error) {
      console.error("Failed to save featured product", error);
    }
  };

  const handleDeleteFeaturedProduct = async (id: string) => {
    try {
      await axios.delete(`/api/company/featured-product`, { data: { id } });
      getFeaturedProducts();
    } catch (error) {
      console.error("Failed to delete featured product", error);
    }
  };

  const startEditing = (product: { $id: string; title: string; productIds: string[] }) => {
    setIsEditing(product.$id);
    setCurrentTitle(product.title);
    setCurrentProductIds(product.productIds || []);
  };

  const resetFeaturedProductForm = () => {
    setIsEditing(null);
    setCurrentTitle('');
    setCurrentProductIds([]);
    setSelectedProductId('');
  };

  const addProductId = () => {
    if (selectedProductId && !currentProductIds.includes(selectedProductId)) {
      setCurrentProductIds([...currentProductIds, selectedProductId]);
      setSelectedProductId('');
    }
  };

  const removeProductId = (idToRemove: string) => {
    setCurrentProductIds(currentProductIds.filter(id => id !== idToRemove));
  };

  const addNewProductId = () => {
    if (selectedProductId && !newProductIds.includes(selectedProductId)) {
      setNewProductIds([...newProductIds, selectedProductId]);
      setSelectedProductId('');
    }
  };

  const removeNewProductId = (idToRemove: string) => {
    setNewProductIds(newProductIds.filter(id => id !== idToRemove));
  };




  return (
    <div className='flex  flex-col justify-center items-center px-2 sm:px-10 md:px-20 lg:px-30'>
      <div className='flex flex-col w-full pb-5'>
        <p className='flex justify-start items-start text-xl font-semibold'>Slider controler</p>
        {sliders.rows.length>0?
          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-2'>
            {sliders.rows.map(({$id, sliderImage} : { $id: string, sliderImage: string })=>{
              return (
              <div key={$id} className='aspect-video relative'>
                <img src={sliderImage} alt="Slider Image" className='w-full h-full object-cover mb-2 rounded-md' /> 
                <Button
                  variant="destructive"
                  type="button"
                  size="icon"
                  className="absolute top-2 right-2 hover:bg-red-500 cursor-pointer"
                  onClick={() => removeSlider($id)}
                >
                  <IconTrash className="w-4 h-4" />
                </Button>
              </div>
              )
            })}
          </div>
          :
          <p>No sliders yet</p>
        }
        {addingSlider?
          <div className='flex flex-col mt-2'>
            <input onChange={(e)=>{  if (e.target.files) {setSliderFile(e.target.files[0])}}}  type="file" placeholder='Category Image' className='border bg-card rounded-lg p-2 w-full cursor-pointer' />
            <div className='flex gap-2 mt-2 justify-around'>
              <button onClick={()=>{setAddingSlider(false); setSliderFile(null)}} className='w-50 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 active:scale-95 hover:cursor-pointer'>Cancel</button>
              <button onClick={()=>{addSlider(); setAddingSlider(false); setSliderFile(null)}} disabled={!sliderFile} className='w-50 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed hover:cursor-pointer'>Add Slider</button>
            </div>
          </div>
          :
          <button className='bg-card shadow-lg border rounded-lg p-2 mt-2 hover:cursor-pointer' onClick={() => setAddingSlider(true)}>Add Slider</button>
        }
      </div>

      {/* Featured Product Controller */}
      <div className='flex flex-col w-full pb-5 mt-10'>
        <p className='flex justify-start items-start text-xl font-semibold'>Featured Product Controller</p>
        
        {/* Form for Adding */}
        <div className='flex flex-col mt-2 p-4 border rounded-lg bg-card'>
          <h3 className='text-lg font-medium mb-2'>Add New Featured Product</h3>
          <input
            type="text"
            placeholder='Title'
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className='border bg-background rounded-lg p-2 w-full mb-2'
          />
          <div className='flex gap-2 mb-2'>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className='border bg-background rounded-lg p-2 w-full'
            >
              <option value="">Select a Product</option>
              {allProducts.map((p) => (
                <option key={p.$id} value={p.$id}>{p.productName}</option>
              ))}
            </select>
            <Button onClick={addNewProductId} size="icon"><IconPlus /></Button>
          </div>
          <div className='flex flex-wrap gap-2 mb-4'>
            {newProductIds.map(id => (
              <div key={id} className='flex items-center gap-2 bg-secondary text-secondary-foreground rounded-full px-3 py-1 text-sm'>
                {allProducts.find(p => p.$id === id)?.productName || id}
                <IconTrash className='w-4 h-4 cursor-pointer' onClick={() => removeNewProductId(id)} />
              </div>
            ))}
          </div>
          <div className='flex gap-2 justify-end'>
            <Button onClick={handleAddFeaturedProduct} disabled={!newTitle || newProductIds.length === 0}>
              Add
            </Button>
          </div>
        </div>

        {/* Display List of Featured Products */}
        <div className='flex flex-col gap-4 mt-4'>
          {featuredProducts.map((product) => (
            isEditing === product.$id ? (
              // Editing UI
              <div key={product.$id} className='flex flex-col mt-2 p-4 border-2 border-primary rounded-lg bg-card'>
                <h3 className='text-lg font-medium mb-2'>Edit Featured Product</h3>
                <input type="text" placeholder='Title' value={currentTitle} onChange={(e) => setCurrentTitle(e.target.value)} className='border bg-background rounded-lg p-2 w-full mb-2' />
                <div className='flex gap-2 mb-2'>
                  <select value={selectedProductId} onChange={(e) => setSelectedProductId(e.target.value)} className='border bg-background rounded-lg p-2 w-full'>
                    <option value="">Select a Product</option>
                    {allProducts.map(p => (<option key={p.$id} value={p.$id}>{p.productName}</option>))}
                  </select>
                  <Button onClick={addProductId} size="icon"><IconPlus /></Button>
                </div>
                <div className='flex flex-wrap gap-2 mb-4'>
                  {currentProductIds.map(id => (
                    <div key={id} className='flex items-center gap-2 bg-secondary text-secondary-foreground rounded-full px-3 py-1 text-sm'>
                      {allProducts.find(p => p.$id === id)?.productName || id}
                      <IconTrash className='w-4 h-4 cursor-pointer' onClick={() => removeProductId(id)} />
                    </div>
                  ))}
                </div>
                <div className='flex gap-2 justify-end'>
                  <Button variant="outline" onClick={resetFeaturedProductForm}>Cancel</Button>
                  <Button onClick={handleUpdateFeaturedProduct} disabled={!currentTitle || currentProductIds.length === 0}>Update</Button>
                </div>
              </div>
            ) : (
              // Display UI
              <div key={product.$id} className='p-4 border rounded-lg bg-card flex justify-between items-start'>
                <div>
                  <p className='font-bold text-lg'>{product.title}</p>
                  <p className='text-sm text-muted-foreground'>Products: {product.productIds.map(id => allProducts.find(p => p.$id === id)?.productName || id).join(', ')}</p>
                </div>
                <div className='flex gap-2'>
                  <Button size="icon" variant="outline" onClick={() => startEditing(product)}><IconEdit className="w-4 h-4" /></Button>
                  <Button size="icon" variant="destructive" onClick={() => handleDeleteFeaturedProduct(product.$id)}><IconTrash /></Button>
                </div>
              </div>
            )
          ))}
        </div>
      </div>


      
    </div>
  )
}

export default Company