import { getProducts } from "@/lib/api";
import { PageContent } from "@/components/pages/HomePage/PageContent";

export default async function Home() {
    const products = await getProducts();
    return (
        <PageContent products={products}></PageContent>

    );
}
