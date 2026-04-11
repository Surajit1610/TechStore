import { MetadataRoute } from 'next'
import { db, productTable } from "@/models/name";
import { tablesDB } from "@/models/server/config";
import { Query } from "appwrite";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Use environment variable for the base URL or fallback to your domain
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://your-domain.com';

  // Define static routes
  const staticRoutes = [
    '',
    '/about',
    '/shop',
    '/login',
    '/register',
    '/reset-password',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  // Fetch products dynamically for the sitemap
  let productRoutes: MetadataRoute.Sitemap = [];
  try {
    const productsResponse = await tablesDB.listRows(db, productTable, [
      Query.limit(5000), // Adjust the limit depending on your catalog size
      Query.select(['slug', '$updatedAt'])
    ]);
    
    productRoutes = productsResponse.rows.map((product: any) => ({
      url: `${baseUrl}/shop/product/${product.slug}`,
      lastModified: product.$updatedAt ? new Date(product.$updatedAt) : new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    }));
  } catch (error) {
    console.error("Error fetching products for sitemap:", error);
  }

  return [...staticRoutes, ...productRoutes];
}
