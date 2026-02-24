import Link from 'next/link'

export const Navbar = () => {
    return (
        <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b">
            <div className="container mx-auto px-8 h-16 flex items-center justify-between">
                {/* Логотип */}
                <Link href="/" className="text-xl font-black text-blue-600">
                    IET.SHOP
                </Link>

                {/* Ссылки */}
                <div className="flex gap-8 text-sm font-medium text-gray-600">
                    <Link href="/" className="hover:text-black transition-colors">
                        Главная
                    </Link>
                    <Link href="/catalog" className="hover:text-black transition-colors">
                        Каталог
                    </Link>
                    <Link href="/about" className="hover:text-black transition-colors">
                        О нас
                    </Link>
                </div>

                {/* Корзина (заглушка) */}
                <Link href="/cart" className="relative p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
                    🛒
                    <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                        0
                    </span>
                </Link>
            </div>
        </nav>
    )
}
