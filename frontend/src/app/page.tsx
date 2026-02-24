import { getProducts } from "@/lib/api";
import { PageContent } from "@/components/PageContent/PageContent";

export default async function Home() {
    const products = await getProducts();
    return (
        <PageContent products={products}></PageContent>

    );
}
