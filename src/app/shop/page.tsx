"use client"

import { IconChevronDown, IconChevronUp, IconMenu2, IconX } from '@tabler/icons-react'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState, use, Suspense } from 'react'
import { toast } from 'react-toastify'
import { Skeleton } from '@/components/ui/skeleton'
import ClickAwayListener from 'react-click-away-listener'

// SKELETON for Products
const ProductsSkeleton = () => (
    <div className='grid grid-cols-2 gap-2 lg:gap-3 xl:gap-4 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5'>
        {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className='flex flex-col gap-2 p-2'>
                <Skeleton className="aspect-square rounded-md" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-1/2" />
            </div>
        ))}
    </div>
);

// SKELETON for Categories
const CategoriesSkeleton = () => (
    <div className='pb-2 space-y-4'>
        {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className='flex items-center gap-2'>
                <Skeleton className="h-10 w-10 rounded-md shrink-0" />
                <div className='flex-1 space-y-2'>
                    <Skeleton className="h-4 w-full" />
                </div>
            </div>
        ))}
    </div> 
);


// Product List Component
function ProductList({ productsPromise, productSearch, router }: { productsPromise: Promise<any>, productSearch: string, router: any }) {
    const productsData = use(productsPromise);
    const products = productsData.data;

    const filteredProducts = products.rows?.filter((p: any) =>
      p.productName.toLowerCase().includes(productSearch.toLowerCase())
    ) || [];

    if (filteredProducts.length === 0) {
      return <p className='text-center text-gray-500 py-8'>No products found</p>;
    }

    return (
        <div className='grid grid-cols-2 gap-2 lg:gap-3 xl:gap-4 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5'>
        {
          filteredProducts?.map(({$id, slug, productName, images, price, finalPrice}: any)=>{
            return(
              <div key={$id}
               onClick={()=> router.push(`/shop/product/${slug}`)}
               className='relative flex flex-col justify-center gap-1 p-2 border-2 rounded-md shadow-lg bg-card hover:cursor-pointer hover:shadow-lg hover:scale-103 transition active:scale-97'>
                <div className="relative aspect-square rounded-md overflow-hidden ">
                    <img src={images[0]} alt={productName} className="object-cover w-full h-full hover:scale-110 transition" />
                </div>
                <div>
                  <p className='line-clamp-2 overflow-hidden h-12'>{productName}</p>
                  <div className='flex gap-2 items-center'>
                    <p className='font-semibold'>₹{finalPrice}</p>
                    {price > finalPrice && (
                      <span className="text-xs text-muted-foreground line-through">₹{price}</span>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        }
      </div>
    );
}

// Category List Component
function CategoryList({
    categoriesPromise,
    categorySearch,
    activeCatOrSubcatId,
    activeCategoryId,
    activeCategoryList,
    setActiveCategoryList,
    subcategoriesData,
    getSubcategories,
    getProductsBySubcategory
}: {
    categoriesPromise: Promise<any>,
    categorySearch: string,
    activeCatOrSubcatId: string,
    activeCategoryId: string,
    activeCategoryList: boolean,
    setActiveCategoryList: React.Dispatch<React.SetStateAction<boolean>>,
    subcategoriesData: any[],
    getSubcategories: (id: string, subcategory: string[], categoryName: string) => void,
    getProductsBySubcategory: (subcategoryName: string, id: string) => void
}) {
    const categoriesData = use(categoriesPromise);
    const categories = categoriesData.data;
    
    const [categoryCurrentPage, setCategoryCurrentPage] = useState(1);
    const categoryPageSize = 8;

    useEffect(() => {
        setCategoryCurrentPage(1);
    }, [categorySearch]);

    const filteredCategories = categories.rows?.filter((cat: any) =>
        cat.categoryName.toLowerCase().includes(categorySearch.toLowerCase())
    ) || [];

    const categoryTotalPages = Math.max(1, Math.ceil(filteredCategories.length / categoryPageSize));

    const paginatedCategories = filteredCategories.slice(
        (categoryCurrentPage - 1) * categoryPageSize,
        categoryCurrentPage * categoryPageSize
    );

    return (
        <>
            <div className='pb-2'>
              {filteredCategories.length === 0 ? (
                <p className='text-center text-gray-500 text-sm py-4'>No categories found</p>
              ) : (
                paginatedCategories.map(({ categoryName, $id, subcategory, categoryImage }: any) => {
                  return(
                    <div key={$id} className='flex flex-col mb-2'>
                      <div className='flex flex-row justify-between items-center'>
                        <div
                          onClick={() => getSubcategories($id, subcategory, categoryName)}
                          className={`flex p-2 pr-3 gap-2 items-center rounded-lg hover:cursor-pointer transition hover:bg-gray-200 dark:hover:bg-gray-600 flex-1 ${activeCatOrSubcatId === $id && "bg-gray-200 dark:bg-gray-600"}`}>
                          <div className='h-10 w-10 overflow-hidden rounded-md shrink-0'><img src={categoryImage} alt={categoryName} className="object-cover w-full h-full"/></div>
                          <div className='font-semibold text-sm truncate'>{categoryName}</div>
                        </div>
                        <div
                          className='p-1 hover:cursor-pointer hover:text-gray-600 dark:hover:text-gray-300 shrink-0'
                          onClick={() => setActiveCategoryList(prev => !prev)}>{activeCategoryList && activeCategoryId === $id ? <IconChevronUp size={20}/> : <IconChevronDown size={20}/>}
                        </div>
                      </div>
                      {activeCategoryList && activeCategoryId === $id && subcategoriesData?.length > 0 && (
                        <div className='ml-2 mt-2 space-y-1'>
                          {subcategoriesData.map(({subcategoryName, $id, subcategoryImage}: any) => (
                            <div
                              onClick={() => getProductsBySubcategory(subcategoryName, $id)}
                              key={$id}
                              className={`flex gap-2 p-2 rounded-lg hover:cursor-pointer transition hover:bg-gray-200 dark:hover:bg-gray-600 ${activeCatOrSubcatId === $id && "bg-gray-200 dark:bg-gray-600"}`}>
                              <div className='h-8 w-8 overflow-hidden rounded-md shrink-0'><img src={subcategoryImage} alt={subcategoryName} className="object-cover w-full h-full"/></div>
                              <div className='text-sm truncate'>{subcategoryName}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })
              )}
            </div>
            {filteredCategories.length > categoryPageSize && (
              <div className='flex items-center justify-between pt-3 border-t mt-3'>
                <button
                  disabled={categoryCurrentPage === 1}
                  onClick={() => setCategoryCurrentPage(p => Math.max(1, p - 1))}
                  className='px-2 py-1 text-xs border rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50'
                >
                  ← Prev
                </button>
                <span className='text-xs text-gray-500'>Page {categoryCurrentPage} of {categoryTotalPages}</span>
                <button
                  disabled={categoryCurrentPage === categoryTotalPages}
                  onClick={() => setCategoryCurrentPage(p => Math.min(categoryTotalPages, p + 1))}
                  className='px-2 py-1 text-xs border rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50'
                >
                  Next →
                </button>
              </div>
            )}
        </>
    )
}

// Main Shop Component
function Shop() {

  const [categoriesPromise, setCategoriesPromise] = useState<Promise<any> | null>(null);
  const [productsPromise, setProductsPromise] = useState<Promise<any> | null>(null);
  
  const [subcategoriesData, setSubcategoriesData] = useState<any[]>([]);
  const [activeCategoryList, setActiveCategoryList] = useState(false);
  const [activeCategoryId, setActiveCategoryId] = useState("");
  const [activeCatOrSubcatId, setActiveCatOrSubcatId] = useState("");
  
  const [categorySearch, setCategorySearch] = useState("");
  const [productSearch, setProductSearch] = useState("");

  const [isCategoryBarOpen, setIsCategoryBarOpen] = useState(false)

  const router = useRouter();
 
  useEffect(()=>{
      setCategoriesPromise(axios.get("/api/company/product/category"));
      setProductsPromise(axios.get("/api/company/product"));
  },[])

  const getSubcategories = (id: string, subcategory: string[], categoryName: string)=>{
    axios.post("/api/company/product/category", {subcategory})
      .then(res=> {
        setSubcategoriesData(res.data);
        setActiveCategoryList(true);
        setActiveCategoryId(id);
        setActiveCatOrSubcatId(id);
      })
      .catch(err=>{
        console.log(err);
        toast.error("Failed to get subcategories");
      });
    setProductsPromise(axios.get("/api/company/product/get_by_category", {params: {categoryName}}));
  }

  const getProductsBySubcategory = (subcategoryName: string, id: string)=>{
    const formData = new FormData();
    formData.append("subcategoryName", subcategoryName);

    setProductsPromise(axios.post("/api/company/product/get_by_category", formData));
    setActiveCatOrSubcatId(id);
  }

  return (
    <div className='flex w-full xl:px-20 lg:px-15 md:px-10 sm:px-5 px-2'>
      {isCategoryBarOpen &&(
        <ClickAwayListener onClickAway={() => setIsCategoryBarOpen(false)}>
          <div className={`top-0 left-0 fixed h-screen w-60 border-r-2 rounded-r-2xl bg-card shadow-lg  z-50 transform transition-transform duration-300 ease-in-out ${isCategoryBarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                     
            
                    
            <div className=' bg-card px-3 py-4 rounded-2xl  max-h-screen overflow-y-auto'>
              <div className='mb-3'>
                <div className='flex justify-between items-center mb-2 pb-2 border-b'>
                  <p className='font-bold text-lg'>Categories</p>
                  <div><IconX onClick={() => setIsCategoryBarOpen(false)} className='cursor-pointer'/></div>
                </div>
                
                <input
                  type='text'
                  placeholder='Search categories...'
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
                  className='w-full px-2 py-2 border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 text-sm'
                />
              </div>

              {categoriesPromise ? (
                  <Suspense fallback={<CategoriesSkeleton />}>
                      <CategoryList 
                          categoriesPromise={categoriesPromise}
                          categorySearch={categorySearch}
                          activeCatOrSubcatId={activeCatOrSubcatId}
                          activeCategoryId={activeCategoryId}
                          activeCategoryList={activeCategoryList}
                          setActiveCategoryList={setActiveCategoryList}
                          subcategoriesData={subcategoriesData}
                          getSubcategories={getSubcategories}
                          getProductsBySubcategory={getProductsBySubcategory}
                      />
                  </Suspense>
              ) : (
                  <CategoriesSkeleton />
              )}
            </div>        
                    
        
                    
          </div>
        </ClickAwayListener>
      )}
      <div>
        <div className='hidden md:flex sticky top-20 md:mt-5 mt-5'>
          <div className=' bg-card px-3 py-3 shadow-xl border rounded-lg w-55 lg:w-64 sticky top-20 max-h-screen overflow-y-auto'>
            <div className='mb-3'>
              <p className='font-bold text-lg mb-2 border-b pb-2'>Categories</p>
              <input
                type='text'
                placeholder='Search categories...'
                value={categorySearch}
                onChange={(e) => setCategorySearch(e.target.value)}
                className='w-full px-2 py-2 border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 text-sm'
              />
            </div>

            {categoriesPromise ? (
                <Suspense fallback={<CategoriesSkeleton />}>
                    <CategoryList 
                        categoriesPromise={categoriesPromise}
                        categorySearch={categorySearch}
                        activeCatOrSubcatId={activeCatOrSubcatId}
                        activeCategoryId={activeCategoryId}
                        activeCategoryList={activeCategoryList}
                        setActiveCategoryList={setActiveCategoryList}
                        subcategoriesData={subcategoriesData}
                        getSubcategories={getSubcategories}
                        getProductsBySubcategory={getProductsBySubcategory}
                    />
                </Suspense>
            ) : (
                <CategoriesSkeleton />
            )}
          </div>
        </div>
      </div>  
      <div className='flex flex-col overflow-y-auto sm:p-4 p-2 flex-1'>
        <div className='mb-4'>
          <p className='text-xl font-bold mb-3'>Products</p>
          <div className='flex justify-between gap-2'>
            <div onClick={()=> setIsCategoryBarOpen(true)} className='p-2 bg-card rounded-md flex md:hidden'><IconMenu2 size={25} /></div>
            <input
              type='text'
              placeholder='Search products by name...'
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              className='w-full max-w-md px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700'
            />
          </div>  
        </div>
        {productsPromise ? (
            <Suspense fallback={<ProductsSkeleton />}>
                <ProductList productsPromise={productsPromise} productSearch={productSearch} router={router} />
            </Suspense>
        ) : (
            <ProductsSkeleton />
        )}
      </div>   
    </div>
  )
}
export default Shop;