import type { Lang } from "@/lib/LanguageContext";



export type Blog = {
  id: string;          
  author: string;           
  title: string;
  description: string;
  text: string;
  slug: string;
  tags: string[];
  img?: string;
};

export type BlogTranslations = {
  blogs: Blog[];
};

export type BlogTitleTranslations = {
  title: string;
  badge: string;
}

export const translationsTitle: Record<Lang, BlogTitleTranslations> = {
    en: {
        title: "From Latest from our Blog...",
        badge: "gathered here",
    },
    bg: {
        title: "Последно от нашия блог...",
        badge: "събрано тук",
    }
}

export const translations: Record<Lang, BlogTranslations> = {
  en: {
    blogs: [
      {
        id: "1",
        author: "Jane Smith",
        title: "How to become an interior designer without education?",
        description: "Discover how to break into interior design without formal education. Learn about self-study, online courses, and building a portfolio to kickstart your career.",
        text: "In this blog post, we explore the various pathways to becoming an interior designer without traditional education. From self-study resources and online courses to building a strong portfolio, we provide actionable tips for aspiring designers looking to break into the industry.",
        slug: "how-to-become-interior-designer-without-education",
        tags: ["Design", "Career"],
      },
      {
        id: "2",
        author: "John Doe",
        title: "How to create a stunning portfolio as a self-taught designer?",
        description: "Learn how to create an impressive portfolio as a self-taught interior designer. We cover project selection, presentation tips, and how to showcase your skills effectively.",
        text: "In this blog post, we guide you through creating a standout portfolio as a self-taught interior designer. From selecting the right projects to presenting them effectively, we provide practical advice to help you showcase your skills and attract potential clients.",
        slug: "how-to-create-stunning-portfolio-self-taught-designer",
        tags: ["Portfolio", "Design"],
      },
      {
        id: "3",
        author: "Alice Johnson",
        title: "Essential software tools for interior design beginners",
        description: "Explore the must-have software tools for interior design beginners. From 3D modeling to mood boards, we cover the essential programs to kickstart your design journey.",
        text: "In this blog post, we delve into the essential software tools for interior design beginners. From 3D modeling software to mood board creators, we cover the key programs that can help you bring your design ideas to life.",
        slug: "essential-software-tools-interior-design-beginners",
        tags: ["Tools", "Design"],
      },
      {
        id: "4",
        author: "Bob Wilson",
        title: "Mastering light and shadow in interior visualization",
        description: "Learn how to master light and shadow in interior visualization. We cover techniques for creating realistic lighting effects that enhance your design presentations.",
        text: "In this blog post, we explore techniques for mastering light and shadow in interior visualization. From understanding different light sources to using software tools effectively, we provide tips to help you create realistic lighting effects.",
        slug: "mastering-light-and-shadow-interior-visualization",
        tags: ["Visualization", "Design"],
      },
      {
        id: "5", 
        author: "Emily Davis",
        title: "Top 5 interior design trends for 2024",
        description: "Stay ahead of the curve with our rundown of the top 5 interior design trends for 2024. From sustainable materials to bold colors, discover what's shaping the future of interior design.",
        text: "In this blog post, we explore the top 5 interior design trends for 2024. From the rise of sustainable materials to the resurgence of bold colors, we provide insights into what's shaping the future of interior design and how you can incorporate these trends into your projects.",
        slug: "top-5-interior-design-trends-2024",
        tags: ["Trends", "Design"],
      }
    ]
  },
  bg: {
    blogs: [
      {
        id: "1",
        author: "Мария Иванова",
        title: "Как да станете интериорен дизайнер без образование?",
        description: "Открийте как да влезете в интериорния дизайн без формално образование. Научете за самообучение, онлайн курсове и изграждане на портфолио, за да започнете кариерата си.",
        text: "В този блог пост разглеждаме различните пътища към това да станете интериорен дизайнер без традиционно образование. От ресурси за самообучение до изграждане на силно портфолио, предоставяме практически съвети за амбициозни дизайнери.",
        slug: "how-to-become-interior-designer-without-education",
        tags: ["Дизайн", "Кариера"],
      },
      {
        id: "2",
        author: "Джон Доу",
        title: "Как да създадете впечатляващо портфолио като самоук дизайнер?",
        description: "Научете как да създадете впечатляващо портфолио като самоук интериорен дизайнер. Обсъждаме избора на проекти, съвети за представяне и как ефективно да покажете уменията си.",
        text: "В този блог пост ви водим през създаването на изключително портфолио като самоук интериорен дизайнер. От избора на правилните проекти до ефективното им представяне, предоставяме практически съвети.",
        slug: "how-to-create-stunning-portfolio-self-taught-designer",
        tags: ["Портфолио", "Дизайн"],
      },
      {
        id: "3",
        author: "Алис Джонсън",
        title: "Основни софтуерни инструменти за начинаещи в интериорния дизайн",
        description: "Разгледайте задължителните софтуерни инструменти за начинаещи в интериорния дизайн. От 3D моделиране до създаване на муд бордове, обсъждаме основните програми.",
        text: "В този блог пост разглеждаме основните софтуерни инструменти за начинаещи в интериорния дизайн. От софтуер за 3D моделиране до създатели на муд бордове, обсъждаме ключовите програми.",
        slug: "essential-software-tools-interior-design-beginners",
        tags: ["Инструменти", "Дизайн"],
      },
      {
        id: "4",
        author: "Боб Уилсън",
        title: "Овладяване на светлината и сенките в интериорната визуализация",
        description: "Научете как да овладеете светлината и сенките в интериорната визуализация. Обсъждаме техники за създаване на реалистични светлинни ефекти.",
        text: "В този блог пост разглеждаме техники за овладяване на светлината и сенките в интериорната визуализация. От разбирането на различните източници на светлина до ефективното използване на софтуерни инструменти, предоставяме съвети.",
        slug: "mastering-light-and-shadow-interior-visualization",
        tags: ["Визуализация", "Дизайн"],
      },
      {
        id: "5",
        author: "Емили Дейвис",
        title: "Топ 5 тенденции в интериорния дизайн за 2024 година",
        description: "Останете напред с нашето ръководство за топ 5 тенденции в интериорния дизайн за 2024 година. От устойчиви материали до смелите цветове, разгледайте какво формира бъдещето на интериорния дизайн.",
        text: "В този блог пост разглеждаме топ 5 тенденции в интериорния дизайн за 2024 година. От възхода на устойчивите материали до възраждането на смелите цветове, предоставяме инсайти какво формира бъдещето на интериорния дизайн и как можете да включите тези тенденции във вашите проекти.",
        slug: "top-5-interior-design-trends-2024",
        tags: ["Тенденции", "Дизайн"],
      }
    ]
  },
};