This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.



NOTE:

2. Database Architecture: Order Item Snapshots vs References
Where: src/models/server/online_orders.table.ts

The Issue: Your onlineOrderTable stores itemId as an array of strings (references).

Quantity: If a user buys 3 of the same product, how is the quantity stored? If it relies on a Cart item, what happens when the cart is cleared?
Price Changes: If a seller updates the price of a product next week, or deletes the product entirely, your past orders will either show the new price or break completely, destroying your financial history.
The Fix: When an order is placed, you must take a "snapshot" of the cart. Instead of just storing an array of references, you should store the exact details at the time of purchase. You can either:

Create an order_items table with columns: orderId, productId, productName, quantity, priceAtPurchase.
(Alternative) Store a stringified JSON array in the online_orders table containing these details.
