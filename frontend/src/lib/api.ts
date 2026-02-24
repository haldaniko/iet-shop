// Здесь позже будет реальный доступ к бэкенду.
// Пока что экспортируем тип и мок‑данные, чтобы верстка и типы работали.

export interface Product {
  id: string;
  title: string;
  subtitle?: string;
  thumbnail?: string;

  price?: number;
  currency?: string;

  raw: unknown;
}

// Временные заглушки продуктов
export const mockProducts: Product[] = [
  {
    id: "1",
    title: "Курс по JavaScript",
    subtitle: "С нуля до первых проектов",
    thumbnail: "/next.svg",
    price: 199,
    currency: "€",
    raw: {},
  },
  {
    id: "2",
    title: "Курс по Python",
    subtitle: "Автоматизация и бэкенд",
    thumbnail: "/next.svg",
    price: 249,
    currency: "€",
    raw: {},
  },
  {
    id: "3",
    title: "Курс по UX/UI",
    subtitle: "Дизайн интерфейсов",
    thumbnail: "/next.svg",
    price: 149,
    currency: "€",
    raw: {},
  },
];

// Заглушка под будущий вызов API
export async function getProducts() {
  return mockProducts;
}

