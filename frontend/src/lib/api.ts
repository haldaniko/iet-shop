// const BACKEND_URL =
//   process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:9000";

// const PUBLISHABLE_KEY =
//   process.env.NEXT_PUBLIC_API_PUBLISHABLE_KEY || "";

// const PRODUCTS_ENDPOINT =
//   process.env.NEXT_PUBLIC_PRODUCTS_ENDPOINT || "/store/products";

// export interface Product {
//   id: string;
//   title: string;
//   subtitle?: string;
//   thumbnail?: string;

//   price?: number;
//   currency?: string;

//   raw: unknown;
// }

// type BackendProduct = {
//   id?: string | number;
//   title?: string;
//   subtitle?: string;
//   thumbnail?: string;
//   variants?: Array<{
//     prices?: Array<{
//       amount?: number;
//       currency_code?: string;
//     }>;
//   }>;
// };

// function normalizeProduct(apiProduct: BackendProduct): Product {
//   const variant = apiProduct?.variants?.[0];
//   const priceObj = variant?.prices?.[0];

//   const amount =
//     typeof priceObj?.amount === "number" ? priceObj.amount : undefined;
//   const currency =
//     typeof priceObj?.currency_code === "string"
//       ? priceObj.currency_code
//       : undefined;

//   return {
//     id: String(apiProduct.id ?? ""),
//     title: apiProduct.title ?? "",
//     subtitle: apiProduct.subtitle ?? "",
//     thumbnail: apiProduct.thumbnail ?? "",
//     price: typeof amount === "number" ? amount / 100 : undefined,
//     currency,
//     raw: apiProduct,
//   };
// }

// export async function getProducts() {
//   try {
//     const response = await fetch(`${BACKEND_URL}${PRODUCTS_ENDPOINT}`, {
//       cache: "no-store",
//       headers: {
//         ...(PUBLISHABLE_KEY
//           ? { "x-publishable-api-key": PUBLISHABLE_KEY }
//           : {}),
//       },
//     });

//     if (!response.ok) {
//       const errorData = await response.json();
//       console.error(`API error: ${response.status}`, errorData);
//       return [];
//     }

//     const data = await response.json();
//     const products = Array.isArray(data?.products) ? data.products : [];

//     return products.map(normalizeProduct);
//   } catch {
//     console.error("Could not connect to backend");
//     return [];
//   }
// }

