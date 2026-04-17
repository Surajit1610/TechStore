// @ts-nocheck
'use client'

import React , { useState, useEffect } from 'react'
import axios from "@/lib/axios";
import { Button } from '@/components/ui/button'
import { IconTrash, IconPlus, IconEdit, IconX } from '@tabler/icons-react'



type Product = {
  $id: string
  productName: string
  price: number
  stock: number
  category: string
  subcategory: string
  images?: string[]
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
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('');
  const [productSubcategoryFilter, setProductSubcategoryFilter] = useState('');

  const uniqueCategories = Array.from(new Set(allProducts.map(p => p.category).filter(Boolean)));
  const availableSubcategories = Array.from(
    new Set(
      allProducts
        .filter(p => productCategoryFilter ? p.category === productCategoryFilter : true)
        .map(p => p.subcategory)
        .filter(Boolean)
    )
  );





  useEffect(() => {
    getSliders()
    getFeaturedProducts()
    getAllProducts()
  }, [])









  const getSliders = async ()=>{
    try {
      const response = await axios.get<any>("/api/company/slider")
      console.log(response.data.sliders)
      setSliders(response.data.sliders)
    } catch (error) {
      console.error("Failed to fetch sliders", error) 
    }
  }  

  const addSlider = async ()=>{
    if(!sliderFile) return
    const formData = new FormData()
    formData.append('file', sliderFile)
    try {
      // Upload to Cloudinary
      const uploadRes = await axios.post<any>("/api/company/product/uplode_file", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          }
      });
      const cloudinaryUrl = uploadRes.data.res.url;

      // Save to database
      const response = await axios.post<any>("/api/company/slider", { sliderImage: cloudinaryUrl })
      console.log(response.data)
      getSliders()
    } catch (error) {
      console.error("Failed to upload slider image", error)
    }
  }

  const removeSlider = async (id: string, sliderImage: string)=>{
    try {
      // Extract public_id from Cloudinary URL
      const parts = sliderImage.split('/upload/');
      let public_id = null;
      if (parts.length > 1) {
        let path = parts[1];
        if (path.match(/^v\d+\//)) {
          path = path.substring(path.indexOf('/') + 1);
        }
        const lastDotIndex = path.lastIndexOf('.');
        if (lastDotIndex !== -1) {
          path = path.substring(0, lastDotIndex);
        }
        public_id = path;
      }

      if (public_id) {
        const formData = new FormData();
        formData.append("public_id", public_id);
        await axios.post<any>("/api/company/product/delete-file", formData).catch(err => console.error("Cloudinary delete failed", err));
      }

      const response = await axios.post<any>(`/api/company/slider/delete-slider/`, { id })
      console.log(response.data)
      getSliders()
    } catch (error) {
      console.error("Failed to delete slider", error)
    }
  }

  // Featured Product Functions
  const getFeaturedProducts = async () => {
    try {
      const response = await axios.get<any>("/api/company/featured-product");
      setFeaturedProducts(response.data.products);
    } catch (error) {
      console.error("Failed to fetch featured products", error);
    }
  };

  const getAllProducts = async () => {
    try {
      // Assuming an endpoint to get all products. Please adjust if it's different.
      const response = await axios.get<any>("/api/company/product");
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
        await axios.put<any>(`/api/company/featured-product`, { id: isEditing, ...payload });
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
      await axios.post<any>("/api/company/featured-product", payload);
      getFeaturedProducts();
      setNewTitle('');
      setNewProductIds([]);
    } catch (error) {
      console.error("Failed to save featured product", error);
    }
  };

  const handleDeleteFeaturedProduct = async (id: string) => {
    try {
      await axios.delete<any>(`/api/company/featured-product`, { data: { id } });
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
      {/* Slider Controller */}
      <div className='flex flex-col w-full pb-5'>
        <div className='flex flex-col p-4 sm:p-6 border rounded-xl shadow-sm bg-card'>
          <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6'>
            <div>
              <h2 className='text-xl font-bold text-primary'>Slider Controller</h2>
              <p className='text-sm text-muted-foreground mt-1'>Manage the homepage hero image sliders.</p>
            </div>
            {!addingSlider && (
              <Button onClick={() => setAddingSlider(true)} className='mt-4 sm:mt-0 flex items-center gap-2'>
                <IconPlus className="w-4 h-4" /> Add New Slider
              </Button>
            )}
          </div>

          {addingSlider && (
            <div className='mb-6 p-4 border rounded-lg bg-secondary/10'>
              <h3 className='text-md font-medium mb-3'>Upload New Slider Image</h3>
              <div className='flex flex-col sm:flex-row gap-4 items-start sm:items-center'>
                <input 
                  onChange={(e)=>{ if (e.target.files) {setSliderFile(e.target.files[0])} }}  
                  type="file" 
                  accept="image/*"
                  className='block w-full text-sm text-muted-foreground
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-primary file:text-primary-foreground
                    hover:file:bg-primary/90 cursor-pointer' 
                />
                <div className='flex gap-3 w-full sm:w-auto mt-2 sm:mt-0'>
                  <Button variant="outline" onClick={()=>{setAddingSlider(false); setSliderFile(null)}} className='flex-1 sm:flex-none'>Cancel</Button>
                  <Button onClick={()=>{addSlider(); setAddingSlider(false); setSliderFile(null)}} disabled={!sliderFile} className='flex-1 sm:flex-none'>
                    Upload
                  </Button>
                </div>
              </div>
              {sliderFile && (
                <p className='text-sm text-muted-foreground mt-2'>Selected file: {sliderFile.name}</p>
              )}
            </div>
          )}

          {sliders?.rows?.length > 0 ? (
            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6'>
              {sliders.rows.map(({$id, sliderImage} : { $id: string, sliderImage: string })=>{
                return (
                <div key={$id} className='group aspect-video relative rounded-xl overflow-hidden shadow-sm border border-border hover:shadow-md transition-all'>
                  <img src={sliderImage} alt="Slider" className='w-full h-full object-cover transition-transform group-hover:scale-105 duration-300' /> 
                  <div className='absolute inset-0 bg-transparent sm:bg-black/50 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex items-start justify-end sm:items-center sm:justify-center p-2 sm:p-0 pointer-events-none sm:pointer-events-auto'>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="flex items-center gap-2 cursor-pointer pointer-events-auto shadow-md"
                      onClick={() => removeSlider($id, sliderImage)}
                    >
                      <IconTrash className="w-4 h-4" /> <span className="hidden sm:inline">Delete</span>
                    </Button>
                  </div>
                </div>
                )
              })}
            </div>
          ) : (
            <div className='flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl bg-secondary/5'>
              <div className='w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4'>
                <IconPlus className='w-8 h-8 text-muted-foreground' />
              </div>
              <p className='text-lg font-medium text-foreground'>No sliders found</p>
              <p className='text-sm text-muted-foreground text-center mt-1 max-w-sm'>
                You haven't uploaded any slider images yet. Click "Add New Slider" to get started.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Featured Product Controller */}
      <div className='flex flex-col w-full pb-5 mt-10'>
        <p className='flex justify-start items-start text-xl font-semibold'>Featured Product Controller</p>
        
        {/* Form for Adding */}
        <div className='flex flex-col mt-2 p-4 border rounded-xl shadow-sm bg-card'>
          <h3 className='text-lg font-medium mb-4 text-primary'>Add New Featured Section</h3>
          
          <div className='flex flex-col gap-4'>
            <div>
              <label className='block text-sm font-medium mb-1'>Section Title</label>
              <input
                type="text"
                placeholder='e.g. Bestsellers, New Arrivals'
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className='border bg-background rounded-lg p-2 w-full'
              />
            </div>
            
            <div className='border rounded-lg p-3 bg-secondary/20'>
              <label className='block text-sm font-medium mb-2'>Selected Products ({newProductIds.length})</label>
              {newProductIds.length === 0 ? (
                <p className='text-sm text-muted-foreground italic'>No products selected yet.</p>
              ) : (
                <div className='flex flex-wrap gap-2'>
                  {newProductIds.map(id => {
                    const p = allProducts.find(prod => prod.$id === id);
                    return (
                      <div key={id} className='flex items-center gap-2 bg-background border border-border shadow-sm rounded-md p-1 pr-2'>
                        {p?.images?.[0] ? <img src={p.images[0]} alt={p.productName} className='w-8 h-8 object-cover rounded' /> : <div className='w-8 h-8 bg-muted rounded'></div>}
                        <span className='text-sm font-medium line-clamp-1 max-w-37.5'>{p?.productName || id}</span>
                        <IconX className='w-4 h-4 cursor-pointer text-muted-foreground hover:text-destructive transition-colors' onClick={() => removeNewProductId(id)} />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div>
              <label className='block text-sm font-medium mb-1'>Search & Filter Products</label>
              <div className='flex flex-col sm:flex-row gap-2 mb-2'>
                <input 
                  type="text" 
                  placeholder='Type product name to search...' 
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className='border bg-background rounded-lg p-2 flex-1 focus:outline-none focus:ring-1 focus:ring-primary'
                />
                <select 
                  value={productCategoryFilter}
                  onChange={(e) => {
                    setProductCategoryFilter(e.target.value);
                    setProductSubcategoryFilter('');
                  }}
                  className='border bg-background rounded-lg p-2 w-full sm:w-1/4 focus:outline-none focus:ring-1 focus:ring-primary'
                >
                  <option value="">All Categories</option>
                  {uniqueCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
                <select 
                  value={productSubcategoryFilter}
                  onChange={(e) => setProductSubcategoryFilter(e.target.value)}
                  className='border bg-background rounded-lg p-2 w-full sm:w-1/4 focus:outline-none focus:ring-1 focus:ring-primary'
                >
                  <option value="">All Subcategories</option>
                  {availableSubcategories.map(subcat => <option key={subcat} value={subcat}>{subcat}</option>)}
                </select>
              </div>
              <div className='max-h-60 overflow-y-auto border rounded-lg bg-background p-2 flex flex-col gap-2'>
                {allProducts
                  .filter(p => !newProductIds.includes(p.$id) && 
                               (!productSearch || p.productName.toLowerCase().includes(productSearch.toLowerCase())) &&
                               (!productCategoryFilter || p.category === productCategoryFilter) &&
                               (!productSubcategoryFilter || p.subcategory === productSubcategoryFilter)
                  )
                  .map(p => (
                    <div key={p.$id} className='flex justify-between items-center border p-2 rounded-lg hover:bg-secondary/30 transition-colors'>
                      <div className='flex items-center gap-3'>
                         {p.images?.[0] ? <img src={p.images[0]} alt={p.productName} className='w-10 h-10 object-cover rounded-md shadow-sm' /> : <div className='w-10 h-10 bg-muted rounded-md shadow-sm'></div>}
                         <div className='flex flex-col'>
                           <span className='font-medium text-sm line-clamp-1'>{p.productName}</span>
                           <span className='text-xs text-muted-foreground'>{p.category}{p.subcategory ? ` > ${p.subcategory}` : ''}</span>
                         </div>
                      </div>
                      <Button size="sm" variant="secondary" onClick={() => setNewProductIds([...newProductIds, p.$id])}>
                        <IconPlus className="w-4 h-4 mr-1" /> Add
                      </Button>
                    </div>
                  ))
                }
                {allProducts.filter(p => !newProductIds.includes(p.$id) && 
                               (!productSearch || p.productName.toLowerCase().includes(productSearch.toLowerCase())) &&
                               (!productCategoryFilter || p.category === productCategoryFilter) &&
                               (!productSubcategoryFilter || p.subcategory === productSubcategoryFilter)
                  ).length === 0 && (
                  <p className='text-center text-sm text-muted-foreground py-4'>No products found matching filters.</p>
                )}
              </div>
            </div>

            <div className='flex justify-end mt-2'>
              <Button onClick={handleAddFeaturedProduct} disabled={!newTitle || newProductIds.length === 0} className='w-full sm:w-auto'>
                Save Featured Section
              </Button>
            </div>
          </div>
        </div>

        {/* Display List of Featured Products */}
        <div className='flex flex-col gap-4 mt-4'>
          {featuredProducts.map((product) => (
            isEditing === product.$id ? (
              // Editing UI
              <div key={product.$id} className='flex flex-col mt-4 p-4 border-2 border-primary rounded-xl shadow-sm bg-card'>
                <h3 className='text-lg font-medium mb-4 text-primary'>Edit Featured Section</h3>
                
                <div className='flex flex-col gap-4'>
                  <div>
                    <label className='block text-sm font-medium mb-1'>Section Title</label>
                    <input 
                      type="text" 
                      placeholder='Title' 
                      value={currentTitle} 
                      onChange={(e) => setCurrentTitle(e.target.value)} 
                      className='border bg-background rounded-lg p-2 w-full' 
                    />
                  </div>

                  <div className='border rounded-lg p-3 bg-secondary/20'>
                    <label className='block text-sm font-medium mb-2'>Selected Products ({currentProductIds.length})</label>
                    {currentProductIds.length === 0 ? (
                      <p className='text-sm text-muted-foreground italic'>No products selected.</p>
                    ) : (
                      <div className='flex flex-wrap gap-2'>
                        {currentProductIds.map(id => {
                          const p = allProducts.find(prod => prod.$id === id);
                          return (
                            <div key={id} className='flex items-center gap-2 bg-background border border-border shadow-sm rounded-md p-1 pr-2'>
                              {p?.images?.[0] ? <img src={p.images[0]} alt={p.productName} className='w-8 h-8 object-cover rounded' /> : <div className='w-8 h-8 bg-muted rounded'></div>}
                              <span className='text-sm font-medium line-clamp-1 max-w-37.5'>{p?.productName || id}</span>
                              <IconX className='w-4 h-4 cursor-pointer text-muted-foreground hover:text-destructive transition-colors' onClick={() => removeProductId(id)} />
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className='block text-sm font-medium mb-1'>Search & Filter Products</label>
                    <div className='flex flex-col sm:flex-row gap-2 mb-2'>
                      <input 
                        type="text" 
                        placeholder='Type product name to search...' 
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        className='border bg-background rounded-lg p-2 flex-1 focus:outline-none focus:ring-1 focus:ring-primary'
                      />
                      <select 
                        value={productCategoryFilter}
                        onChange={(e) => {
                          setProductCategoryFilter(e.target.value);
                          setProductSubcategoryFilter('');
                        }}
                        className='border bg-background rounded-lg p-2 w-full sm:w-1/4 focus:outline-none focus:ring-1 focus:ring-primary'
                      >
                        <option value="">All Categories</option>
                        {uniqueCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                      <select 
                        value={productSubcategoryFilter}
                        onChange={(e) => setProductSubcategoryFilter(e.target.value)}
                        className='border bg-background rounded-lg p-2 w-full sm:w-1/4 focus:outline-none focus:ring-1 focus:ring-primary'
                      >
                        <option value="">All Subcategories</option>
                        {availableSubcategories.map(subcat => <option key={subcat} value={subcat}>{subcat}</option>)}
                      </select>
                    </div>
                    <div className='max-h-60 overflow-y-auto border rounded-lg bg-background p-2 flex flex-col gap-2'>
                      {allProducts
                        .filter(p => !currentProductIds.includes(p.$id) && 
                                     (!productSearch || p.productName.toLowerCase().includes(productSearch.toLowerCase())) &&
                                     (!productCategoryFilter || p.category === productCategoryFilter) &&
                                     (!productSubcategoryFilter || p.subcategory === productSubcategoryFilter)
                        )
                        .map(p => (
                          <div key={p.$id} className='flex justify-between items-center border p-2 rounded-lg hover:bg-secondary/30 transition-colors'>
                            <div className='flex items-center gap-3'>
                               {p.images?.[0] ? <img src={p.images[0]} alt={p.productName} className='w-10 h-10 object-cover rounded-md shadow-sm' /> : <div className='w-10 h-10 bg-muted rounded-md shadow-sm'></div>}
                               <div className='flex flex-col'>
                                 <span className='font-medium text-sm line-clamp-1'>{p.productName}</span>
                                 <span className='text-xs text-muted-foreground'>{p.category}{p.subcategory ? ` > ${p.subcategory}` : ''}</span>
                               </div>
                            </div>
                            <Button size="sm" variant="secondary" onClick={() => setCurrentProductIds([...currentProductIds, p.$id])}>
                              <IconPlus className="w-4 h-4 mr-1" /> Add
                            </Button>
                          </div>
                        ))
                      }
                      {allProducts.filter(p => !currentProductIds.includes(p.$id) && 
                                     (!productSearch || p.productName.toLowerCase().includes(productSearch.toLowerCase())) &&
                                     (!productCategoryFilter || p.category === productCategoryFilter) &&
                                     (!productSubcategoryFilter || p.subcategory === productSubcategoryFilter)
                        ).length === 0 && (
                        <p className='text-center text-sm text-muted-foreground py-4'>No products found matching filters.</p>
                      )}
                    </div>
                  </div>

                  <div className='flex gap-2 justify-end mt-2'>
                    <Button variant="outline" onClick={resetFeaturedProductForm} className='w-full sm:w-auto'>Cancel</Button>
                    <Button onClick={handleUpdateFeaturedProduct} disabled={!currentTitle || currentProductIds.length === 0} className='w-full sm:w-auto'>Update Section</Button>
                  </div>
                </div>
              </div>
            ) : (
              // Display UI
              <div key={product.$id} className='p-5 border rounded-xl shadow-sm bg-card flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:shadow-md transition-shadow'>
                <div className='flex-1'>
                  <p className='font-bold text-xl text-primary mb-3'>{product.title}</p>
                  <div className='flex flex-wrap gap-3'>
                    {product.productIds.length > 0 ? product.productIds.map(id => {
                      const p = allProducts.find(prod => prod.$id === id);
                      return (
                        <div key={id} className='flex items-center gap-2 bg-secondary/30 border border-border rounded-lg p-2 pr-3' title={p?.productName || id}>
                          {p?.images?.[0] ? <img src={p.images[0]} alt={p.productName} className='w-10 h-10 object-cover rounded-md shadow-sm' /> : <div className='w-10 h-10 bg-muted rounded-md shadow-sm'></div>}
                          <span className='text-sm font-medium line-clamp-1 max-w-30'>{p?.productName || id}</span>
                        </div>
                      )
                    }) : (
                      <p className='text-sm text-muted-foreground italic'>No products in this section.</p>
                    )}
                  </div>
                </div>
                <div className='flex gap-2 mt-2 sm:mt-0'>
                  <Button size="icon" variant="outline" className='hover:bg-primary/10' onClick={() => startEditing(product)}><IconEdit className="w-5 h-5 text-primary" /></Button>
                  <Button size="icon" variant="destructive" className='hover:bg-red-600' onClick={() => handleDeleteFeaturedProduct(product.$id)}><IconTrash className="w-5 h-5" /></Button>
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
