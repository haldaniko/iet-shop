interface TranslationNode {
  [key: string]: string | TranslationNode;
}

const translations: TranslationNode = {
  courseTypes: {
    hybrid: "Хибриден",
    online: "Онлайн",
    offline: "Лично",
  },
  audience: {
    adults: "Възрастни",
    kids: "Деца",
  },
  eventTypes: {
    online: "Онлайн",
    offline: "Лично",
    hybrid: "Хибриден",
  },
  resources: {
    tags: {
      title: "Етикети",
      description: "Създавайте и редактирайте двуезични етикети.",
    },
    courses: {
      title: "Курсове",
      description: "Пълно управление на курсове, включително медии, цени и етикети.",
    },
    events: {
      title: "Събития",
      description: "Създавайте и актуализирайте график и визуали на събития.",
    },
    posts: {
      title: "Публикации",
      description: "Управление на публикации в блога и връзките им към етикети.",
    },
    projects: {
      title: "Проекти",
      description: "Управление на страници с проекти и богато съдържание.",
    },
    consultations: {
      title: "Консултации",
      description: "Четене на входящи заявки за консултация.",
    },
    "event-requests": {
      title: "Заявки за събития",
      description: "Четене на входящи заявки за събития.",
    },
    orders: {
      title: "Поръчки",
      description: "Четене на данни за плащане.",
    },
  },
  fieldLabels: {
    id: "ID",
    name: "Име",
    name_en: "Име (англ.)",
    name_bg: "Име (бълг.)",
    slug: "Кратък адрес",
    title_en: "Заглавие (англ.)",
    title_bg: "Заглавие (бълг.)",
    type: "Тип",
    price: "Цена",
    is_active: "Активен",
    start: "Начална дата",
    audience: "Аудитория",
    monthly_installment_price: "Месечна вноска",
    visits_per_week: "Посещения / седмица",
    stripe_product_id: "ID на продукт в Stripe",
    stripe_price_id: "ID на цена в Stripe",
    tags: "Етикети",
    description_en: "Описание (англ.)",
    description_bg: "Описание (бълг.)",
    duration_en: "Продължителност (англ.)",
    duration_bg: "Продължителност (бълг.)",
    about_title_en: "Заглавие за секция За курса (англ.)",
    about_title_bg: "Заглавие за секция За курса (бълг.)",
    about_description_top_en: "Горно описание в секция За курса (англ.)",
    about_description_top_bg: "Горно описание в секция За курса (бълг.)",
    about_description_bottom_en: "Долно описание в секция За курса (англ.)",
    about_description_bottom_bg: "Долно описание в секция За курса (бълг.)",
    image: "Основно изображение",
    about_image: "Изображение за секция За курса",
    audience_image: "Изображение на аудиторията",
    date: "Дата",
    image_2: "Изображение 2",
    author: "Автор",
    content_en: "Съдържание (англ.)",
    content_bg: "Съдържание (бълг.)",
    picture: "Изображение",
    cover_image: "Основно изображение",
    excerpt_en: "Кратко описание (англ.)",
    excerpt_bg: "Кратко описание (бълг.)",
    created_at: "Създадено",
    updated_at: "Актуализирано",
    paid_at: "Платено в",
    email: "Имейл",
    phone: "Телефон",
    interested: "Интерес",
    status: "Платено",
    total_amount: "Обща сума",
    stripe_payment_intent_id: "ID на намерение за плащане в Stripe",
    stripe_checkout_session_id: "ID на checkout сесия в Stripe",
    text_en: "Текст (англ.)",
    text_bg: "Текст (бълг.)",
    icon: "Икона",
    descriptions_en: "Описания (англ.)",
    descriptions_bg: "Описания (бълг.)",
  },
  buttons: {
    save: "Запази",
    create: "Създай",
    update: "Обнови",
    delete: "Изтрий",
    "add-tag": "Добави етикет",
    "remove-tag": "Премахни етикет",
    cancel: "Отказ",
    refresh: "Опресни",
    reload: "Презареди",
    "new-record": "Нов запис",
    "archive-session": "Архивирай сесия",
    "activate-session": "Активирай сесия",
    "send-reply": "Изпрати отговор",
    sending: "Изпращане...",
    saving: "Запазване...",
    deleting: "Изтриване...",
    logout: "Изход",
    "sign-in": "Влез",
    "signing-in": "Влизане...",
    "add-instrument": "Добави инструмент",
    "add-module": "Добави модул",
    remove: "Премахни",
  },
  login: {
    title: "Вход за суперпотребители",
    description: "Достъпът е ограничен само за суперпотребители. Сесиите се управляват чрез бисквитки и са защитени с CSRF.",
    username: "Потребителско име",
    password: "Парола",
    "error-empty": "Моля, въведете потребителско име и парола.",
    "error-failed": "Неуспешен вход. Проверете данните си.",
  },
  placeholders: {
    message: "Съобщение",
    "select-tag": "Изберете етикет",
    "tag-ids": "ID на етикети: 1,2,3",
  },
  messages: {
    "no-messages-yet": "Няма съобщения",
    "no-messages-in-session": "Няма съобщения в тази сесия.",
    "select-dialog": "Изберете диалог.",
    "loading-sessions": "Зареждане на сесии...",
    "loading-tags": "Зареждане на етикети...",
    "no-tags-available": "Няма налични етикети",
    "no-tags-selected": "Няма избрани етикети",
    "hold-ctrl-select-many": "Задръжте Ctrl (или Cmd на Mac), за да изберете няколко етикета.",
    active: "активна",
    archived: "архивирана",
    "course-type": "Тип курс",
    "select-option": "Изберете опция",
    "current-file": "Текущ файл",
    "current-icon": "Текуща икона",
    "one-line-description": "Един ред на запис",
    "connection-idle": "неактивна",
    "connection-connecting": "свързване",
    "connection-connected": "свързан",
    "connection-reconnecting": "повторно свързване",
    "connection-error": "грешка",
    "checking-session": "Проверка на сесия...",
    "slug-english-hint": "Краткият адрес трябва да бъде на английски: използвайте латински букви, цифри, тирета или долни черти.",
  },
  ui: {
    "admin-title": "IET Админ",
    "operator-chat": "Оператор чат",
    main: "Основно",
    content: "Съдържание",
    requests: "Заявки",
    chats: "Чатове",
    details: "Детайли",
    "create-new": "Нов запис",
    edit: "Редактиране",
    "course-main": "Основно",
    "course-titles": "Заглавие и описание",
    "course-about": "Секция За курса",
    "course-payments": "Плащания",
    "course-audience": "Карти за аудитория (точно 4)",
    "course-instruments": "Инструменти",
    "course-outcomes": "Резултати (точно 6)",
    "course-modules": "Модули",
    instrument: "Инструмент",
    module: "Модул",
    outcome: "Резултат",
    card: "Карта",
  },
};

export const getAdminTranslation = (
  keyOrLang: string,
  maybeKey?: string,
  maybeSubKey?: string,
): string => {
  const hasLegacyLangArgument = keyOrLang === "bg" || keyOrLang === "en";
  const key = hasLegacyLangArgument ? maybeKey : keyOrLang;
  const subKey = hasLegacyLangArgument ? maybeSubKey : maybeKey;

  if (!key) {
    return "";
  }

  const keys = key.split(".");
  let current: string | TranslationNode = translations;

  for (const currentKey of keys) {
    if (typeof current === "object" && currentKey in current) {
      current = current[currentKey] as string | TranslationNode;
    } else {
      return key;
    }
  }

  if (subKey && typeof current === "object" && subKey in current) {
    return current[subKey] as string;
  }

  return typeof current === "string" ? current : key;
};
