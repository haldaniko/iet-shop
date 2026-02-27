import type { Lang } from "@/lib/translations";

export type Review = {
    id: string;
    text: string;
    name: string;
    studentStatus: string; // e.g., "Student" or "Graduate"
};

export type ReviewsTranslations = {
    title: string;
    highlight: string;
    reminderTitle: string;
    reminderHighlight: string;
    reviews: Review[];
};

export const translations: Record<Lang, ReviewsTranslations> = {
    en: {
        title: "We’re proud to have such",
        highlight: "incredible alumni!",
        reminderTitle: 'Glad You Asked!',
        reminderHighlight: 'If there’s still something you want to check, don’t hesistate to give us a shout!',
        reviews: [
            {
                id: "1",
                text: "The mentor support was incredible. I never felt alone during my learning journey, and the practical projects really helped me land my first job.",
                name: "Alex Johnson",
                studentStatus: "Frontend Developer Student"
            },
            {
                id: "2",
                text: "IET provided the perfect balance between theory and practice. The community is very supportive, and the curriculum is up-to-date with industry standards.",
                name: "Maria Petrova",
                studentStatus: "UI/UX Design Graduate"
            },
            {
                id: "3",
                text: "Transitioning from a non-tech background was scary, but the way courses are structured at IET made it smooth and understandable.",
                name: "Ivan Ivanov",
                studentStatus: "QA Engineering Student"
            },
            {
                id: "4",
                text: "The Python course changed my life. Now I automate everything at my current job and I am planning to move into data science soon.",
                name: "Sarah Miller",
                studentStatus: "Python Graduate"
            },
            {
                id: "5",
                text: "I really appreciated the flexibility of the classes. As a working parent, I needed a schedule that works for me, and IET delivered.",
                name: "David Wilson",
                studentStatus: "Fullstack Web Student"
            },
            {
                id: "6",
                text: "Top-tier education. The curriculum is dense but very practical. The final project felt like a real-world task from a premium client.",
                name: "Elena Richardson",
                studentStatus: "Project Management Graduate"
            },
            {
                id: "7",
                text: "What I liked most was the networking. I met so many talented people and we even started a side project together after the course.",
                name: "Michael Chen",
                studentStatus: "Cybersecurity Student"
            }
        ]
    },
    bg: {
        title: "Гордеем се, че имаме такива",
        highlight: "невероятни възпитаници!",
        reminderTitle: 'Радвам се, че попитахте!',
        reminderHighlight: 'If there’s still something you want to check, don’t hesistate to give us a shout!',
        reviews: [
            {
                id: "1",
                text: "Подкрепата от менторите беше невероятна. Никога не се чувствах сам по време на обучението си, а практическите проекти наистина ми помогнаха да намеря първата си работа.",
                name: "Алекс Джонсън",
                studentStatus: "Студент по Frontend разработка"
            },
            {
                id: "2",
                text: "ИОТ осигури перфектния баланс между теория и практика. Общността подкрепя много, а учебната програма е съобразена със съвременните индустриални стандарти.",
                name: "Мария Петрова",
                studentStatus: "Завършил UI/UX дизайн"
            },
            {
                id: "3",
                text: "Преминаването от нетехнологична сфера беше плашещо, но начинът, по който са структурирани курсовете в ИОТ, го направи плавно и разбираемо.",
                name: "Иван Иванов",
                studentStatus: "Студент по QA инженерство"
            },
            {
                id: "4",
                text: "Курсът по Python промени живота ми. Сега автоматизирам всичко на текущата си работа и планирам скоро да се насоча към data science.",
                name: "Сара Милър",
                studentStatus: "Завършил Python"
            },
            {
                id: "5",
                text: "Наистина оцених гъвкавостта на часовете. Като работещ родител, имах нужда от график, който да работи за мен, и ИОТ го осигури.",
                name: "Дейвид Уилсън",
                studentStatus: "Студент по Fullstack Web"
            },
            {
                id: "6",
                text: "Образование на най-високо ниво. Учебната програма е плътна, но много практична. Финалният проект се усещаше като истинска задача от реален клиент.",
                name: "Елена Ричардсън",
                studentStatus: "Завършил Project Management"
            },
            {
                id: "7",
                text: "Това, което ми хареса най-много, беше нетъркингът. Запознах се с толкова много талантливи хора и дори започнахме малък страничен проект заедно след курса.",
                name: "Майкъл Чен",
                studentStatus: "Студент по Киберсигурност"
            }
        ]
    }
};
