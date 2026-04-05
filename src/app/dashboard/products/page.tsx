"use client"

import axios from 'axios';
import React, { useState, useEffect } from 'react'
import { IconCaretDownFilled, IconPlus, IconDotsVertical, IconEdit, IconX, IconCheck } from '@tabler/icons-react';
import { Input } from '@/components/ui/input';
import Image from 'next/image';  
import { Label } from '@/components/ui/label';
import { Uploder } from '@/components/Uploder';
import ClickAwayListener from 'react-click-away-listener';
import { toast } from 'react-toastify';
import { useSellerStore } from '@/store/Seller';


function products() {
  const [isProductsActive, setIsProductsActive] = useState(true);

  const [categories, setCategories] = useState({rows: [ {categoryName: "", $id: "", subcategory: [], categoryImage: ""} ]})
  const [subcategories, setSubcategories] = useState([])
  const [activeSubcategory, setActiveSubcategory] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState("")
  const [addingCategory, setAddingCategory] = useState(false)
  const [editingCategory, setEditingCategory] = useState<string | null>(null)
  const [categoryName, setCategoryName] = useState("")
  const [categoryImage, setCategoryImage] = useState("")
  const [selectedCategoryFile, setSelectedCategoryFile] = useState<File | null>(null)
  const [categorySearch, setCategorySearch] = useState("")
  const [categoryCurrentPage, setCategoryCurrentPage] = useState(1)
  const categoryPageSize = 5
  const [addingSubcategory, setAddingSubcategory] = useState(false)
  const [editingSubcategory, setEditingSubcategory] = useState<string | null>(null)
  const [subcategoryName, setSubcategoryName] = useState("")
  const [subcategoryImage, setSubcategoryImage] = useState("")
  const [selectedSubcategoryFile, setSelectedSubcategoryFile] = useState<File | null>(null)
  const [subcategorySearch, setSubcategorySearch] = useState("")
  const [subcategoryCurrentPage, setSubcategoryCurrentPage] = useState(1)
  const subcategoryPageSize = 5


  // Filter and paginate categories
  const filteredCategories = categories?.rows?.filter((cat: any) => 
    cat.categoryName.toLowerCase().includes(categorySearch.toLowerCase())
  ) || []
  const categoryTotalPages = Math.max(1, Math.ceil(filteredCategories.length / categoryPageSize))
  const paginatedCategories = filteredCategories.slice(
    (categoryCurrentPage - 1) * categoryPageSize,
    categoryCurrentPage * categoryPageSize
  )

  // Reset category page when search changes
  useEffect(() => {
    setCategoryCurrentPage(1)
  }, [categorySearch])

  const resetCategoryForm = () => {
    setCategoryName("")
    setCategoryImage("")
    setSelectedCategoryFile(null)
    setAddingCategory(false)
    setEditingCategory(null)
  }

  // Filter and paginate subcategories
  const filteredSubcategories = subcategories?.filter((sub: any) =>
    sub.subcategoryName.toLowerCase().includes(subcategorySearch.toLowerCase())
  ) || []
  const subcategoryTotalPages = Math.max(1, Math.ceil(filteredSubcategories.length / subcategoryPageSize))
  const paginatedSubcategories = filteredSubcategories.slice(
    (subcategoryCurrentPage - 1) * subcategoryPageSize,
    subcategoryCurrentPage * subcategoryPageSize
  )

  // Reset subcategory page when search changes
  useEffect(() => {
    setSubcategoryCurrentPage(1)
  }, [subcategorySearch])

  const resetSubcategoryForm = () => {
    setSubcategoryName("")
    setSubcategoryImage("")
    setSelectedSubcategoryFile(null)
    setAddingSubcategory(false)
    setEditingSubcategory(null)
  }

  type Product = {
    $id: string;
    productName: string;
    images: string[];
    category: string;
    subcategory: string;
    price: number;
    finalPrice: number;
    stock: number;
    description?: string;
  };

  const [products, setProducts] = useState<{ rows: Product[] }>({ rows: [] });
  const [addingProduct, setAddingProduct] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [productName, setProductName] = useState("")
  const [productImages, setProductImages] = useState([])
  const [description, setDescription] = useState("")
  const [categoryValue, setCategoryValue] = useState("Choose Category")
  const [subcategoryValue, setSubcategoryValue] = useState("Choose Subcategory")
  const [price, setPrice] = useState(0)
  const [finalPrice, setFinalPrice] = useState(0)
  const [stock, setStock] = useState(0)
  const {imgUrls, setResetUrls, setImgUrls, clearImgUrls, resetImgUrls} = useSellerStore()
  const [activeCategoryList, setActiveCategoryList] = useState(false)
  const [activeSubcategoryList, setactiveSubcategoryList] = useState(false)

  const [stockValue, setStockValue] = useState(0)
  const [selectedStokeckProductId, setSelectedStokeckProductId] = useState("")
  const [isUpdatingStock, setIsUpdatingStock] = useState(false)

  // Pagination and filter states
  const [currentPage, setCurrentPage] = useState(1)
  const [filterCategory, setFilterCategory] = useState("")
  const [filterSubcategory, setFilterSubcategory] = useState("")
  const [productSearch, setProductSearch] = useState("")
  const pageSize = 5

  // Get unique categories and subcategories from products
  const uniqueCategories = Array.from(new Set(products.rows.map((p: any) => p.category).filter(Boolean)))
  const uniqueSubcategories = Array.from(new Set(
    products.rows
      .filter((p: any) => !filterCategory || p.category === filterCategory)
      .map((p: any) => p.subcategory)
      .filter(Boolean)
  ))

  // Filter products based on category, subcategory, and search
  const filteredProducts = products.rows.filter((p: any) => {
    if (filterCategory && p.category !== filterCategory) return false
    if (filterSubcategory && p.subcategory !== filterSubcategory) return false
    if (productSearch && !p.productName.toLowerCase().includes(productSearch.toLowerCase())) return false
    return true
  })

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize))
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [filterCategory, filterSubcategory, productSearch])


  
// products

  useEffect(() => {
    setIsProductsActive(true);

    fetchProducts();

  }, [])

  const fetchProducts = async () => {
    const response = axios.get("/api/company/product")
      response.then(res=> {const products = res.data
        setProducts(products)
        console.log(products)
      })
      .catch(err=>{console.log(err)
        toast.error("Failed to get products")
      })
  }



  // Add Product
  const handleAddProduct = async () => {
    
    const formData = new FormData();
    formData.append("productId", editingProduct ? editingProduct.$id : "");
    formData.append("productName", productName);
    formData.append("price", price.toString());
    formData.append("finalPrice", finalPrice.toString());
    formData.append("description", description);
    formData.append("category", categoryValue);
    formData.append("subcategory", subcategoryValue);
    imgUrls.forEach((url: string) => {
      formData.append("images", url );
    });   
    
    if (editingProduct) {
      console.log(formData.get("productId"));
      
      const response = await axios.post(`/api/company/product/update-product`, formData);
      if (response.data.error) {
        console.log(response.data.error);
        toast.error("Failed to update product");
      } else {
        toast.success("Product updated successfully");
        resetProductForm();
        fetchProducts();
      }
    } else {
      const response = await axios.post("/api/company/product/add-product", formData);
      if (response.data.error) {
        console.log(response.data.error);
        toast.error("Failed to add product");
      } else {
        toast.success("Product added successfully");
        resetProductForm();
        fetchProducts();
      }
    }
  }

  const resetProductForm = () => {
    setAddingProduct(false)
    setEditingProduct(null)
    setProductName("")
    setPrice(0)
    setFinalPrice(0)
    setDescription("")
    setSubcategoryValue("Choose Subcategory")
    setCategoryValue("Choose Category")
    resetImgUrls()
  }

  const deleteProduct = async (productId: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return

    const Id = productId;
    const response = await axios.post("/api/company/product/delete-product", {Id});
    if (response.data.error) {
      console.log(response.data.error);
      toast.error("Failed to delete product");
    } else {
      toast.success("Product deleted successfully");
      fetchProducts();
    }
  }

  const getCtegories = async () => {
    setAddingProduct(true)

    const response = axios.get("/api/company/product/category")
      response.then(res=> {const categories = res.data
        setCategories(categories)
        console.log(categories)
      })
      .catch(err=>{console.log(err)
        // toast.error("Failed to get categories")
      })
  }

  const getSubcategories = async (subcategory: string[]) => {
    const response = axios.post("/api/company/product/category", {subcategory})
      response.then(res=> {const subcategories = res.data
        setSubcategories(subcategories)
        console.log(subcategories)
      })
      .catch(err=>{console.log(err)
        toast.error("Failed to get categories")
      })
  }

  const handleClickAwayCategory = () => {
		setActiveCategoryList(false);
	};

  const handleClickAwaySubcategory = () => {
    setactiveSubcategoryList(false);
  };

  const handleStock = (productId: string) => {
    setSelectedStokeckProductId(productId);
    setIsUpdatingStock(true);
  };

  const handleUpdateStock = async () => {
    const Id = selectedStokeckProductId;
    const response = await axios.post("/api/company/product/update-stock", {Id, stockValue});
    if (response.data.error) {
      console.log(response.data.error);
      toast.error("Failed to update stock");
    } else {
      toast.success("Stock updated successfully");
      setIsUpdatingStock(false);
      setSelectedStokeckProductId("");
      setStockValue(0);
      fetchProducts();
    }
  };




// category & subcategory
  const categorys = async () => {
    setIsProductsActive(false);

    const response = axios.get("/api/company/product/category")
      response.then(res=> {const categories = res.data
        setCategories(categories)
        // console.log(categories)
      })
      .catch(err=>{console.log(err)
        toast.error("Failed to get categories")
      })
  }

  const subcategorys = async (subcategory: string[], $id: string) => {
    setActiveSubcategory(true);
    setSelectedCategory($id)
    const response = axios.post("/api/company/product/category", {subcategory})
      response.then(res=> {const subcategories = res.data
        setSubcategories(subcategories)
        // console.log(subcategories)
      })
      .catch(err=>{console.log(err)
        // toast.error("Failed to get categories")
      })
  }

  const addCategory = async () => {

    if (!editingCategory && !selectedCategoryFile) {
      alert('Please select an image to upload.');
      return;
    }else if (!categoryName) {
      alert('Please enter a category name.');
      return;
    }

    let uploadedImageUrl = categoryImage;

    if (selectedCategoryFile) {
      const uploadData = new FormData();
      uploadData.append('file', selectedCategoryFile);
      try {
        const uploadRes = await axios.post("/api/company/product/uplode_file", uploadData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        uploadedImageUrl = uploadRes.data.res.url;
      } catch (error) {
        console.error('Failed to upload image', error);
        toast.error('Failed to upload image');
        return;
      }
    }

    const payload = {
      categoryId: editingCategory,
      categoryName,
      categoryImage: uploadedImageUrl
    };

    try {
      if (editingCategory) {
        const response = await axios.post('/api/company/product/category/update-category', payload);
        if (response.status === 200) {
          toast.success('Category updated successfully!');
        } else {
          toast.error('Error updating category.');
        }
      } else {
        const response = await axios.post('/api/company/product/category/addCategory', payload);
        if (response.status === 200) {
          toast.success('Category added successfully!');
        } else {
          toast.error('Error adding category.');
        }
      }
    } catch (error) {
      console.error('Network error:', error);
      toast.error('Network error');
    }
    resetCategoryForm()
    return categorys()
  };

  // delete Category
  const deleteCategory = async (id: string, subcategory: string[], catImage?: string) => {
    if (catImage) {
      try {
        const parts = catImage.split('/upload/');
        let public_id = null;
        if (parts.length > 1) {
          let path = parts[1];
          if (path.match(/^v\d+\//)) path = path.substring(path.indexOf('/') + 1);
          const lastDotIndex = path.lastIndexOf('.');
          if (lastDotIndex !== -1) path = path.substring(0, lastDotIndex);
          public_id = path;
        }

        if (public_id) {
          const formData = new FormData();
          formData.append("public_id", public_id);
          await axios.post("/api/company/product/delete-file", formData).catch(err => console.error("Cloudinary delete failed", err));
        }
      } catch (error) {
         console.error('Failed to delete image from cloudinary', error);
      }
    }

    const response = await axios.post("/api/company/product/category/delete-category", {id, subcategory});
    if (response.data.error) {
      console.log(response.data.error);
      toast.error("Failed to delete category");
      categorys();
    } else {
      toast.success("Category deleted successfully");
      setActiveSubcategory(false)
      categorys();
    }
  }

  // Add Subcategory
  const addSubcategory = async () => {

    if (!editingSubcategory && !selectedSubcategoryFile) {
      alert('Please select an image to upload.');
      return;
    }else if (!subcategoryName) {
      alert('Please enter a subcategory name.');
      return;
    }

    let uploadedImageUrl = subcategoryImage;

    if (selectedSubcategoryFile) {
      const uploadData = new FormData();
      uploadData.append('file', selectedSubcategoryFile);
      try {
        const uploadRes = await axios.post("/api/company/product/uplode_file", uploadData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        uploadedImageUrl = uploadRes.data.res.url;
      } catch (error) {
        console.error('Failed to upload image', error);
        toast.error('Failed to upload image');
        return;
      }
    }

    const payload = {
      subcategoryId: editingSubcategory,
      categoryId: selectedCategory,
      subcategoryName,
      subcategoryImage: uploadedImageUrl
    };

    try {
      if (editingSubcategory) {
        const response = await axios.post('/api/company/product/category/update-subcategory', payload);
        if (response.status === 200) {
          toast.success('Subcategory updated successfully!');
        } else {
          toast.error('Error updating subcategory.');
        }
      } else {
        const response = await axios.post('/api/company/product/category/addSubcategory', payload);
        if (response.status === 200) {
          toast.success('Subcategory added successfully!');
        } else {
          toast.error('Error adding subcategory.');
        }
      }
    } catch (error) {
      console.error('Network error:', error);
      toast.error('Network error');
    }
    setAddingSubcategory(false);
    setActiveSubcategory(false)
    resetSubcategoryForm()
    return categorys()
  } 

  // delete Subcategory
  const deleteSubcategory = async (id: string, subCatImage?: string) => {
    if (subCatImage) {
      try {
        const parts = subCatImage.split('/upload/');
        let public_id = null;
        if (parts.length > 1) {
          let path = parts[1];
          if (path.match(/^v\d+\//)) path = path.substring(path.indexOf('/') + 1);
          const lastDotIndex = path.lastIndexOf('.');
          if (lastDotIndex !== -1) path = path.substring(0, lastDotIndex);
          public_id = path;
        }

        if (public_id) {
          const formData = new FormData();
          formData.append("public_id", public_id);
          await axios.post("/api/company/product/delete-file", formData).catch(err => console.error("Cloudinary delete failed", err));
        }
      } catch (error) {
         console.error('Failed to delete image from cloudinary', error);
      }
    }

    try {
      const response = await axios.post(`/api/company/product/category/detete-subcategory`, { subcategoryId: id, categoryId: selectedCategory });
      console.log(response.data);
      toast.success("Subcategory deleted successfully");
      setActiveSubcategory(false)
      categorys()
    } catch (error) {
      console.error("Failed to delete subcategory", error);
      toast.error("Failed to delete subcategory");
    }
  }

  const productPage = async () => {
    setIsProductsActive(true);
  }

  return (
    <div className='flex flex-col justify-center items-center relative pb-5'>
      <div className='flex justify-center items-center border w-fit p-1 gap-2 rounded-lg bg-card'>
        <div onClick={()=> productPage()} className={` p-1 rounded-sm cursor-pointer ${isProductsActive && "dark:bg-green-800 bg-green-300"}`}>Products</div>
        <div onClick={()=> categorys()} className={` p-1 rounded-sm cursor-pointer ${!isProductsActive && "dark:bg-green-800 bg-green-300"}`}>Categories</div>
      </div>

      
      {isUpdatingStock && 
          <div className='absolute w-full h-full backdrop-blur bg-green-300/10 z-40  flex justify-center items-center border'>
            <div className='bg-card p-5 rounded-lg flex flex-col gap-4'>
              <h2 className='flex justify-center text-xl font-semibold'>Update Stock</h2>
              <Input onChange={(e)=> setStockValue(e.target.valueAsNumber)} type="number" placeholder='Enter new stock value' className='w-full sm:w-60 p-3 shadow-2xl'/>
              <div className='flex gap-3 justify-around'>
                <button onClick={() => setIsUpdatingStock(false)} className='bg-red-600 text-white px-4 py-2 rounded-md active:scale-97 cursor-pointer'>Cancel</button>
                <button onClick={() => handleUpdateStock()} className='bg-green-600 text-white px-4 py-2 rounded-md active:scale-97 cursor-pointer'>Update</button>
              </div>
            </div>
      </div>}


      <div className='flex flex-col w-full lg:px-20 md:px-10 sm:px-2 px-2'>
        {isProductsActive && 
        <div>
          <div className='flex justify-between items-center mt-4'>
            <p className='font-semibold text-xl'>{addingProduct || editingProduct ? (editingProduct ? "Edit Product" : "Add Product") : "Product List"}</p>
            {addingProduct || editingProduct ?
            <div onClick={()=> resetProductForm()} className='flex gap-2 py-1 px-2 rounded-sm cursor-pointer active:scale-97 dark:bg-red-800 bg-red-500 dark:hover:bg-red-900 hover:bg-red-600'>Cancel </div>
            :<div onClick={()=> getCtegories()} className='flex gap-2 p-1 rounded-sm cursor-pointer active:scale-97 dark:bg-green-800 bg-green-400 dark:hover:bg-green-900 hover:bg-green-500'>Add Product <IconPlus/> </div>
            }
          </div>
          {(addingProduct || editingProduct) &&
            <div  className=' flex justify-center items-center pb-10 border-b'>
      
              <form action="" className='flex flex-col gap-2'>
                
                <Label className='md:text-2xl sm:text-xl text-lg'>Product Image</Label>
                {editingProduct && imgUrls?.length > 0 &&
                <div className='grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7  gap-2 pb-2 w-full'> 
                  {imgUrls.map((url: string, index: number) => (
                    <div key={index} className='relative w-full h-full shrink-0'>  
                      <img src={url} alt={`Product ${index}`} className='w-full h-full object-cover' />
                      <div onClick={() => clearImgUrls(url)} className='absolute top-0 right-0 cursor-pointer bg-red-500/70 rounded-bl-md p-0.5 hover:bg-red-600'>
                        <IconX/>
                      </div>
                    </div>
                  ))}
                </div>
                }

                <Uploder/>
                <Label className='md:text-2xl sm:text-xl text-lg pt-2 '>Product Name</Label>
                <Input onChange={(e)=>{setProductName(e.target.value)}} value={productName} type="text" placeholder='Enter Product Name' className='w-full shadow-2xl p-5'/>
                <Label className='md:text-2xl sm:text-xl text-lg pt-2'>Product Description</Label>         
                <textarea onChange={(e)=>{setDescription(e.target.value)}} value={description} cols={30} rows={10} placeholder='Enter Product Description'
                className='w-full bg-card rounded-xl p-3 border shadow-xl hover:border-gray-500'>
                </textarea>


                <div className='flex sm:flex-row flex-col gap-4 pt-2'>
                
                  <div className='w-full flex flex-col relative'>
                    <Label className='md:text-2xl sm:text-xl text-lg pb-2'>Category</Label>
                    

                    <div
                    onClick={()=>{setActiveCategoryList(!activeCategoryList)}}
                    className="flex justify-between outline-none  md:py-2.5 py-2 px-3 rounded-lg border hover:border-gray-500 bg-card border-gray-500/40 w-full shadow-lg"
                    >
                      {categoryValue} <IconCaretDownFilled/>
                    </div>

                    {activeCategoryList && 
                    
                    <div
                    className="absolute z-10 mt-22 flex flex-col gap-1 bg-card p-2 w-full h-35 overflow-auto rounded-xl border"
                    >
                      {
                        categories.rows.map(({ categoryName, $id, subcategory })=>{
                        return(
                          <div key={$id} className='flex flex-col gap-2'>
                            <ClickAwayListener onClickAway={() => {handleClickAwayCategory()}}>
                            <div
                              onClick={() => { setCategoryValue(categoryName); setSubcategoryValue("Choose Subcategory"); setActiveCategoryList(false); getSubcategories(subcategory) }}
                              className='p-2 bg-zinc-200 dark:bg-zinc-800 rounded-lg hover:bg-zinc-300 dark:hover:bg-zinc-700 hover:cursor-pointer'>{categoryName}</div>
                          </ClickAwayListener>
                          </div>
                          )
                        })
                      }
                    </div>
                    }
                  </div>

                  <div className='w-full flex flex-col relative'>
                    <Label className='md:text-2xl sm:text-xl text-lg pb-2'>Subcategory</Label>
                    

                    <div
                    onClick={()=>{setactiveSubcategoryList(!activeSubcategoryList)}}
                    className="flex justify-between outline-none  md:py-2.5 py-2 px-3 rounded-lg border hover:border-gray-500 bg-card border-gray-500/40 w-full shadow-lg"
                    >
                      {subcategoryValue} <IconCaretDownFilled/>
                    </div>

                    {activeSubcategoryList && <div
                    className="absolute z-10 mt-22 flex flex-col gap-1 bg-card p-2 w-full h-35 overflow-auto rounded-xl border"
                    >
                      {
                        subcategories?.map(({ $id, subcategoryName, subcategoryImage})=>{
                        return(
                          
                          <div key={$id} className='flex flex-col gap-2'>
                            <ClickAwayListener onClickAway={() => handleClickAwaySubcategory()}>
                            <div
                              onClick={() => { setSubcategoryValue(subcategoryName); setactiveSubcategoryList(false) }}
                              className='p-2 bg-zinc-200 dark:bg-zinc-800 rounded-lg hover:bg-zinc-300 dark:hover:bg-zinc-700 hover:cursor-pointer'>{subcategoryName}</div>
                            </ClickAwayListener>
                          </div>
                           
                          )
                        })
                      }
                    </div>}
                  </div>
                </div> 

                <div className='flex sm:flex-row flex-col gap-4 pt-2 pb-2'>
                  <div className='w-full flex flex-col'>
                    <Label className='md:text-2xl sm:text-xl text-lg pb-2'>Price</Label>
                    <Input onChange={(e)=>{setPrice(e.target.valueAsNumber)}} type="Number" value={price} id='floatInput' step="1" placeholder='Enter Product Price' className='w-full p-5 shadow-2xl'/>
                  </div>

                  <div className='w-full flex flex-col'>
                    <Label className='md:text-2xl sm:text-xl text-lg pb-2'>Final Price</Label>
                    <Input onChange={(e)=>{setFinalPrice(e.target.valueAsNumber)}} type="Number" value={finalPrice} id='floatInput' step="1" placeholder='Enter Product Final Price' className='w-full p-5 shadow-2xl'/>
                  </div>    
                
                </div>
                <button
                  onClick={() => {handleAddProduct()}}
                  type="button"
                  className=" group/btn relative block h-10 w-full rounded-md bg-linear-to-br from-black to-neutral-600 font-medium text-white shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:bg-zinc-800 dark:from-zinc-900 dark:to-zinc-900 dark:shadow-[0px_1px_0px_0px_#27272a_inset,0px_-1px_0px_0px_#27272a_inset] active:scale-97 cursor-pointer"
                >
                  <div className='flex justify-center items-center'>
                     {editingProduct ? "Update Product" : "Add Product"} <IconPlus className='ml-2' />
                  </div>
                  <BottomGradient />
                </button>
                
              </form>
            
            </div>
          }

          

          {(addingProduct || editingProduct) && <p className='font-semibold text-xl mb-4'>{"Product List"}</p>}

          {!addingProduct && !editingProduct && (
            <>
              {/* Filters */}
              <div className='flex sm:flex-row flex-col gap-4 mb-4 '>
                <div className='flex-1 sm:min-w-48 w-full'>
                  <Label className='text-sm font-semibold mb-1 block'>Search Products</Label>
                  <Input
                    type='text'
                    placeholder='Search by product name...'
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className='w-full p-2 border rounded-lg'
                  />
                </div>
                <div className='flex gap-2 justify-start items-center'>
                  <div>
                    <Label className='text-sm font-semibold mb-1 block'>Category</Label>
                    <select
                      value={filterCategory}
                      onChange={e => { setFilterCategory(e.target.value); setFilterSubcategory('') }}
                      className='px-3 py-2 border rounded bg-white dark:bg-gray-800 dark:border-gray-700'
                    >
                      <option value=''>All</option>
                      {uniqueCategories.map((cat: string) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label className='text-sm font-semibold mb-1 block'>Subcategory</Label>
                    <select
                      value={filterSubcategory}
                      onChange={e => setFilterSubcategory(e.target.value)}
                      className='px-3 py-2 border rounded bg-white dark:bg-gray-800 dark:border-gray-700'
                      disabled={!filterCategory}
                    >
                      <option value=''>All</option>
                      {uniqueSubcategories.map((sub: string) => (
                        <option key={sub} value={sub}>{sub}</option>
                      ))}
                    </select>
                  </div>
                </div>  
              </div>

              {/* Table Header */}
              <div className='sm:flex hidden justify-between px-2 font-semibold'>
                <p className='flex justify-start items-center sm:w-40 md:w-50 lg:w-74'>Name</p>
                <p className='sm:w-35 lg:w-40 flex justify-center items-center'>Category</p>
                <p className='sm:w-35 lg:w-40 flex justify-center items-center'>Subcategory</p>
                <p className='sm:w-25 lg:w-30 flex justify-center items-center'>Price</p>
                <p className='sm:w-25 lg:w-30 flex justify-center items-center'>Stock</p>
                <p className='sm:w-15 lg:w-15 flex justify-center items-center'>Actions</p>
              </div>
            </>
          )}
          {paginatedProducts.map(({ $id, productName, images,category, subcategory, price, stock, description, finalPrice}) => {
            return (
              <div key={$id} className='flex justify-between items-center  p-2 rounded-lg border mt-4 w-full bg-card'>
                <div className='sm:flex hidden justify-start items-center gap-2'>
                  <div className='w-12 h-12 relative overflow-x-hidden rounded-sm'><Image src={images[0]} fill alt='Product Image' className='object-cover' sizes='100vh'/></div>
                  <div className='line-clamp-2 lg:w-60 md:w-36 sm:w-26'>{productName}</div>
                </div>
                <div className='sm:w-35 lg:w-40 sm:flex hidden justify-center items-center'>{category}</div>
                <div className='sm:w-35 lg:w-40 sm:flex hidden justify-center items-center'>{subcategory}</div>
                <div className='sm:w-25 lg:w-30 sm:flex hidden justify-center items-center'>{finalPrice}</div>
                <div className='sm:w-25 lg:w-30 sm:flex hidden justify-center items-center gap-2'>{stock} <IconEdit onClick={ () => handleStock($id)} className='cursor-pointer hover:text-green-600'/></div>
                <div className='sm:w-15 lg:w-15 sm:flex hidden flex-col justify-center items-center gap-0.5'>
                  <button onClick={() => {
                    setEditingProduct({$id, productName, images, category, subcategory, price, stock, description, finalPrice})
                    images.forEach((url: string) => {
                      setImgUrls(url)
                    });
                    setProductName(productName)
                    setPrice(price)
                    setFinalPrice(finalPrice)
                    setDescription(description || "")
                    setCategoryValue(category)
                    setSubcategoryValue(subcategory)
                    getCtegories()
                  }} className='flex justify-center items-center text-sm w-full px-0.5 py-0.5 bg-green-600 text-white rounded-sm cursor-pointer active:scale-97 hover:bg-green-700'>Edit</button>
                  <button onClick={() => deleteProduct($id)} className='flex justify-center items-center text-sm w-full px-0.5 py-0.5 bg-red-600 text-white rounded-sm cursor-pointer active:scale-97 hover:bg-red-700'>Delete</button>
                </div>

                {/* Mobile View */}
                <div className='sm:hidden flex flex-col gap-2 w-full'>
                  <div className='flex items-center gap-2'>
                    <div className='w-12 h-12'>
                      <div className='w-12 h-12 relative overflow-x-hidden rounded-sm'><Image src={images[0]} fill alt='Product Image' className='object-cover' sizes='100vh'/></div>
                    </div>
                    <div className='line-clamp-2 lg:w-60 md:w-36 sm:w-26'>{productName}</div>
                  </div>
                  <div className='flex justify-between items-center'>
                    <div className='flex gap-2 justify-between items-center w-1/2'>
                      <div className='flex justify-center items-center text-xs'>{category}</div>
                      <div className='flex justify-center items-center text-xs'>{subcategory}</div>
                    </div>
                    <div className='flex justify-center items-center text-green-600 font-bold'>₹{finalPrice}</div>
                  </div>
                  <div className='flex justify-between items-center'>
                    <div className='flex justify-center items-center gap-2'>Qty: {stock} <IconEdit onClick={ () => handleStock($id)} className='cursor-pointer hover:text-green-600'/></div>
                      <div className='flex  justify-between items-center gap-2'>
                        <button onClick={() => {
                          setEditingProduct({$id, productName, images, category, subcategory, price, stock, description, finalPrice})
                          images.forEach((url: string) => {
                            setImgUrls(url)
                          });
                          setProductName(productName)
                          setPrice(price)
                          setFinalPrice(finalPrice)
                          setDescription(description || "")
                          setCategoryValue(category)
                          setSubcategoryValue(subcategory)
                          getCtegories()
                        }} className='flex justify-center items-center text-sm w-20 px-2 py-1 bg-green-600 text-white rounded-sm cursor-pointer active:scale-97 hover:bg-green-700'>Edit</button> 
                        <button onClick={() => deleteProduct($id)} className='flex justify-center items-center text-sm w-20 px-2 py-1 bg-red-600 text-white rounded-sm cursor-pointer active:scale-97 hover:bg-red-700'>Delete</button>
                      </div>
                  </div>
                </div>

              </div>
            )
          })}

          {/* Pagination */}
          {!addingProduct && !editingProduct && filteredProducts.length > 0 && (
            <div className='mt-4 flex sm:flex-row flex-col gap-2 items-center justify-between'>
              <div className='text-sm text-gray-600 dark:text-gray-400'>
                Showing {filteredProducts.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, filteredProducts.length)} of {filteredProducts.length}
              </div>
              <div className='flex items-center gap-2'>
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className='px-3 py-2 rounded border border-gray-300 dark:border-gray-600 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition'
                >
                  ← Previous
                </button>
                <span className='text-sm font-medium'>
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  className='px-3 py-2 rounded border border-gray-300 dark:border-gray-600 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition'
                >
                  Next →
                </button>
              </div>
            </div>
          )}
          
        </div> }
        
                {!isProductsActive && 
        
                          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        
                            <div className='flex flex-col gap-2 sm:p-4 p-2 rounded-lg border mt-4 w-full'>
        
                                <div className='flex justify-between items-center w-full'>
        
                                  <h2 className='dark:text-green-700 text-green-800 font-bold text-lg'>Categories</h2>
        
                                  {!addingCategory && !editingCategory && (
        
                                    <button onClick={() => setAddingCategory(true)} className='flex justify-center items-center gap-2 px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 active:scale-95'>
        
                                      <IconPlus size={18} /> Add
        
                                    </button>
        
                                  )}
        
                                </div>
        
                
        
                                {/* Search Bar */}
        
                                <Input
        
                                  type='text'
        
                                  placeholder='Search categories...'
        
                                  value={categorySearch}
        
                                  onChange={(e) => setCategorySearch(e.target.value)}
        
                                  className='w-full p-2 border rounded-lg'
        
                                />
        
                
        
                                {/* Add/Edit Category Form */}
        
                                {(addingCategory || editingCategory) && (
        
                                  <div className='flex flex-col gap-2 p-3 rounded-lg dark:bg-emerald-950/30 bg-slate-200 border'>
        
                                    <h3 className='font-semibold'>{editingCategory ? "Edit Category" : "Add New Category"}</h3>
        
                                    <input 
        
                                      type='file' 
        
                                      placeholder='Category Image' 
        
                                      onChange={(e) => { if (e.target.files) setSelectedCategoryFile(e.target.files[0]) }}
        
                                      className='border bg-card rounded-lg p-2 w-full cursor-pointer' 
        
                                    />
        
                                    <input 
        
                                      type='text' 
        
                                      placeholder='Category Name' 
        
                                      value={categoryName}
        
                                      onChange={(e) => setCategoryName(e.target.value)}
        
                                      className='border bg-card rounded-lg p-2 w-full' 
        
                                    />
        
                                    <div className='flex gap-2'>
        
                                      <button 
        
                                        onClick={resetCategoryForm}
        
                                        className='flex-1 px-3 py-2 dark:bg-red-800 bg-red-500 dark:hover:bg-red-900 hover:bg-red-600 text-white rounded-lg cursor-pointer active:scale-95'
        
                                      >
        
                                        Cancel
        
                                      </button>
        
                                      <button 
        
                                        onClick={() => addCategory()}
        
                                        className='flex-1 flex justify-center items-center gap-2 dark:bg-green-800 bg-green-600 dark:hover:bg-green-900 hover:bg-green-700 text-white px-3 py-2 rounded-lg cursor-pointer active:scale-95'
        
                                      >
        
                                        {editingCategory ? "Update" : "Add"} <IconPlus size={18}/>
        
                                      </button>
        
                                    </div>
        
                                  </div>
        
                                )}
        
                
        
                                {/* Categories List */}
        
                                <div className='flex flex-col gap-2 max-h-96 overflow-y-auto'>
        
                                  {paginatedCategories.length === 0 ? (
        
                                    <p className='text-center text-gray-500 py-4'>No categories found</p>
        
                                  ) : (
        
                                    paginatedCategories.map(({ categoryName, $id, subcategory, categoryImage }: any) => {
        
                                      return (
        
                                        <div 
        
                                          key={$id} 
        
                                          className={`flex justify-between items-center border p-2 gap-2 rounded-lg cursor-pointer transition hover:shadow-md ${
        
                                            selectedCategory === $id ? "dark:border-green-600 border-green-600 dark:bg-green-900/20 bg-green-100" : ""
        
                                          }`}
        
                                        >
        
                                          <div className='flex gap-3 flex-1' onClick={() => subcategorys(subcategory, $id)}>
        
                                            <div className='w-10 h-10 rounded-md overflow-hidden relative shrink-0'>
                                              {categoryImage && (
                                                <Image 
                                                  src={categoryImage} 
                                                  alt='category' 
                                                  fill 
                                                  className='object-cover' 
                                                  sizes='100vh' 
                                                />
                                              )}
                                            </div>
        
                                            <div className='flex flex-col justify-center'>
        
                                              <div className='font-semibold text-sm'>{categoryName}</div>
        
                                              <div className='text-xs text-gray-500'>{subcategory.length} subcategories</div>
        
                                            </div>
        
                                          </div>
        
                                          <div className='flex gap-1 shrink-0'>
        
                                            <button
        
                                              onClick={() => {
        
                                                setCategoryName(categoryName)
                                                if (categoryImage) setCategoryImage(categoryImage);
                                                setEditingCategory($id)
        
                                                setAddingCategory(false)
        
                                              }}
        
                                              className='p-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-md active:scale-95'
        
                                              title='Edit'
        
                                            >
        
                                              <IconEdit size={16} />
        
                                            </button>
        
                                            <button
        
                                              onClick={() => {
        
                                                if (confirm(`Delete category "${categoryName}"?`)) {
        
                                                  deleteCategory($id, subcategory, categoryImage)
        
                                                  console.log('Delete category:', $id)
        
                                                }
        
                                              }}
        
                                              className='p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-md active:scale-95'
        
                                              title='Delete'
        
                                            >
        
                                              <IconX size={16} />
        
                                            </button>
        
                                          </div>
        
                                        </div>
        
                                      )
        
                                    })
        
                                  )}
        
                                </div>
        
                
        
                                {/* Pagination */}
        
                                {filteredCategories.length > categoryPageSize && (
        
                                  <div className='flex items-center justify-between pt-2 border-t'>
        
                                    <span className='text-xs text-gray-500'>Page {categoryCurrentPage} of {categoryTotalPages}</span>
        
                                    <div className='flex gap-1'>
        
                                      <button
        
                                        disabled={categoryCurrentPage === 1}
        
                                        onClick={() => setCategoryCurrentPage(p => Math.max(1, p - 1))}
        
                                        className='px-2 py-1 text-xs border rounded hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50'
        
                                      >
        
                                        ← Prev
        
                                      </button>
        
                                      <button
        
                                        disabled={categoryCurrentPage === categoryTotalPages}
        
                                        onClick={() => setCategoryCurrentPage(p => Math.min(categoryTotalPages, p + 1))}
        
                                        className='px-2 py-1 text-xs border rounded hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50'
        
                                      >
        
                                        Next →
        
                                      </button>
        
                                    </div>
        
                                  </div>
        
                                )}
        
                            </div>
        
                            {activeSubcategory && 
        
                            <div className='flex flex-col gap-2 sm:p-4 p-2 rounded-lg border mt-4 w-full'>
        
                              <div className='flex justify-between items-center w-full'>
        
                                <h2 className='dark:text-green-700 text-green-800 font-bold text-lg'>Subcategories</h2>
        
                                {!addingSubcategory && !editingSubcategory && (
        
                                  <button onClick={() => setAddingSubcategory(true)} className='flex justify-center items-center gap-2 px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 active:scale-95'>
        
                                    <IconPlus size={18} /> Add
        
                                  </button>
        
                                )}
        
                              </div>
        
                
        
                              {/* Search Bar */}
        
                              <Input
        
                                type='text'
        
                                placeholder='Search subcategories...'
        
                                value={subcategorySearch}
        
                                onChange={(e) => setSubcategorySearch(e.target.value)}
        
                                className='w-full p-2 border rounded-lg'
        
                              />
        
                
        
                              {/* Add/Edit Subcategory Form */}
        
                              {(addingSubcategory || editingSubcategory) && (
        
                                <div className='flex flex-col gap-2 p-3 rounded-lg dark:bg-emerald-950/30 bg-slate-200 border'>
        
                                  <h3 className='font-semibold'>{editingSubcategory ? "Edit Subcategory" : "Add New Subcategory"}</h3>
        
                                  <input 
        
                                    type='file' 
        
                                    placeholder='Subcategory Image' 
        
                                    onChange={(e) => { if (e.target.files) setSelectedSubcategoryFile(e.target.files[0]) }}
        
                                    className='border bg-card rounded-lg p-2 w-full cursor-pointer' 
        
                                  />
        
                                  <input 
        
                                    type='text' 
        
                                    placeholder='Subcategory Name' 
        
                                    value={subcategoryName}
        
                                    onChange={(e) => setSubcategoryName(e.target.value)}
        
                                    className='border bg-card rounded-lg p-2 w-full' 
        
                                  />
        
                                  <div className='flex gap-2'>
        
                                    <button 
        
                                      onClick={resetSubcategoryForm}
        
                                      className='flex-1 px-3 py-2 dark:bg-red-800 bg-red-500 dark:hover:bg-red-900 hover:bg-red-600 text-white rounded-lg cursor-pointer active:scale-95'
        
                                    >
        
                                      Cancel
        
                                    </button>
        
                                    <button 
        
                                      onClick={() => addSubcategory()}
        
                                      className='flex-1 flex justify-center items-center gap-2 dark:bg-green-800 bg-green-600 dark:hover:bg-green-900 hover:bg-green-700 text-white px-3 py-2 rounded-lg cursor-pointer active:scale-95'
        
                                    >
        
                                      {editingSubcategory ? "Update" : "Add"} <IconPlus size={18}/>
        
                                    </button>
        
                                  </div>
        
                                </div>
        
                              )}
        
                
        
                              {/* Subcategories List */}
        
                              <div className='flex flex-col gap-2 max-h-96 overflow-y-auto'>
        
                                {paginatedSubcategories.length === 0 ? (
        
                                  <p className='text-center text-gray-500 py-4'>No subcategories found</p>
        
                                ) : (
        
                                  paginatedSubcategories.map(({ $id, subcategoryName, subcategoryImage }: any) => {
        
                                    return (
        
                                      <div 
        
                                        key={$id} 
        
                                        className='flex justify-between items-center border p-2 gap-2 rounded-lg cursor-pointer transition hover:shadow-md'
        
                                      >
        
                                        <div className='flex gap-3 flex-1'>
        
                                          <div className='w-10 h-10 rounded-md overflow-hidden relative shrink-0'>
                                            {subcategoryImage && (
                                              <Image 
                                                src={subcategoryImage} 
                                                alt='subcategory' 
                                                fill 
                                                className='object-cover' 
                                                sizes='100vh' 
                                              />
                                            )}
                                          </div>
        
                                          <div className='flex flex-col justify-center'>
        
                                            <div className='font-semibold text-sm'>{subcategoryName}</div>
        
                                          </div>
        
                                        </div>
        
                                        <div className='flex gap-1 shrink-0'>
        
                                          <button
        
                                            onClick={() => {
        
                                              setSubcategoryName(subcategoryName)
                                              if (subcategoryImage) setSubcategoryImage(subcategoryImage);
                                              setEditingSubcategory($id)
        
                                              setAddingSubcategory(false)
        
                                            }}
        
                                            className='p-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-md active:scale-95'
        
                                            title='Edit'
        
                                          >
        
                                            <IconEdit size={16} />
        
                                          </button>
        
                                          <button
        
                                            onClick={() => {
        
                                              if (confirm(`Delete subcategory "${subcategoryName}"?`)) {
        
                                                deleteSubcategory($id, subcategoryImage);
        
                                                console.log('Delete subcategory:', $id)
        
                                              }
        
                                            }}
        
                                            className='p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-md active:scale-95'
        
                                            title='Delete'
        
                                          >
        
                                            <IconX size={16} />
        
                                          </button>
        
                                        </div>
        
                                      </div>
        
                                    )
        
                                  })
        
                                )}
        
                              </div>
        
                
        
                              {/* Pagination */}
        
                              {filteredSubcategories.length > subcategoryPageSize && (
        
                                <div className='flex items-center justify-between pt-2 border-t'>
        
                                  <span className='text-xs text-gray-500'>Page {subcategoryCurrentPage} of {subcategoryTotalPages}</span>
        
                                  <div className='flex gap-1'>
        
                                    <button
        
                                      disabled={subcategoryCurrentPage === 1}
        
                                      onClick={() => setSubcategoryCurrentPage(p => Math.max(1, p - 1))}
        
                                      className='px-2 py-1 text-xs border rounded hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50'
        
                                    >
        
                                      ← Prev
        
                                    </button>
        
                                    <button
        
                                      disabled={subcategoryCurrentPage === subcategoryTotalPages}
        
                                      onClick={() => setSubcategoryCurrentPage(p => Math.min(subcategoryTotalPages, p + 1))}
        
                                      className='px-2 py-1 text-xs border rounded hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50'
        
                                    >
        
                                      Next →
        
                                    </button>
        
                                  </div>
        
                                </div>
        
                              )}
        
                            </div>}
        
                        </div>
        
                      }
      </div>
    </div>
  )
}



const BottomGradient = () => {
  return (
    <>
      <span className="absolute inset-x-0 -bottom-px block h-px w-full bg-linear-to-r from-transparent via-cyan-500 to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100" />
      <span className="absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 bg-linear-to-r from-transparent via-indigo-500 to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100" />
    </>
  );
};



export default products