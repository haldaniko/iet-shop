export const translations = {
  bg: {
    title: "Плащането е отменено",
    description:
      "Плащането не беше извършено и няма да бъдете таксувани. Можете да се върнете към началната страница и да продължите да разглеждате нашите обучения.",
    homeLink: "Към началната страница",
    imageAlt: "Джордж Максот",
  },
  en: {
    title: "Payment canceled",
    description:
      "Your payment was not completed and you have not been charged. You can return to the home page and continue exploring our courses.",
    homeLink: "Back to home",
    imageAlt: "George Maxot",
  },
} as const;

export type CancelPageLanguage = keyof typeof translations;
