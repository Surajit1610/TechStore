import { Metadata } from 'next'
import { db, productTable } from "@/models/name";
import { tablesDB } from "@/models/server/config";
import { Query } from "appwrite";
import ProductClient from './ProductClient'

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata(
  props: Props
): Promise<Metadata> {
  const params = await props.params;
  const slug = params.slug;
 
  try {
    const productsResponse = await tablesDB.listRows(db, productTable, [
      Query.equal('slug', slug),
      Query.limit(1)
    ]);
    
    if (productsResponse.total > 0) {
      const product = productsResponse.rows[0];
      
      const productImages = product.images || [product.image || "/save-more.jpg"];
      
      // Strip HTML tags for clean description text
      const cleanDescription = (product.description || '')
        .replace(/<[^>]+>/g, '')
        .substring(0, 160);

      const defaultDesc = `Buy ${product.productName} at the best price.`;

      return {
        title: `${product.productName} | TechStore`,
        description: cleanDescription || defaultDesc,
        openGraph: {
          title: `${product.productName} | TechStore`,
          description: cleanDescription || defaultDesc,
          images: productImages.slice(0, 1).map((url: string) => ({ url })),
        },
      }
    }
  } catch(error) {
    console.error("Error fetching product for metadata:", error);
  }
 
  return {
    title: 'Product Not Found | TechStore',
  }
}

export default function Page() {
  // Pass the rendering entirely to your client component
  return <ProductClient />
}
