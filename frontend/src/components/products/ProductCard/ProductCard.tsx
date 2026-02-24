import Image from "next/image";
import { Button } from "@/components/ui/Button/Button";
import { type Product } from "@/lib/api";
import styles from "./ProductCard.module.scss";

interface ProductCardProps {
    product: Product
}

export const ProductCard = ({ product }: ProductCardProps) => {
    return (
        <div className={styles.card}>
            <div className={styles.imageWrapper}>
                <Image
                    src={product.thumbnail || "/next.svg"}
                    alt={product.title}
                    fill
                    className={styles.image}
                />
            </div>
            <h3 className={styles.title}>{product.title}</h3>
            <p className={styles.subtitle}>{product.subtitle}</p>

            <div className={styles.footer}>
                <span className={styles.price}>
                    {product.price
                        ? `${product.price} ${product.currency ?? "€"}`
                        : "Цена по запросу"}
                </span>
                <Button size="sm">
                    Купить
                </Button>
            </div>
        </div>
    )
}
