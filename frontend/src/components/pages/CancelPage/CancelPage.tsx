import Image from "next/image";
import { Footer } from "@/components/footer/Footer/Footer";
import { Header } from "@/components/header/Header/Header";
import { IconClose } from "@/components/icons";
import { LocalizedLink } from "@/components/ui/LocalizedLink/LocalizedLink";
import {
  type CancelPageLanguage,
  translations,
} from "./translations";
import styles from "./CancelPage.module.scss";

type CancelPageProps = {
  lang: CancelPageLanguage;
};

export const CancelPage = ({ lang }: CancelPageProps) => {
  const content = translations[lang];

  return (
    <>
      <Header />
      <main className={styles.main}>
        <section className={styles.content}>
          <div className={styles.message}>
            <Image
              className={styles.georgeImage}
              src="/assets/Journey/george-sad.png"
              alt={content.imageAlt}
              width={200}
              height={200}
              priority
            />
            <div className={styles.headingRow}>
              <span className={styles.statusIcon} aria-hidden="true">
                <IconClose className={styles.statusIconSvg} />
              </span>
              <h1>{content.title}</h1>
            </div>
            <p>{content.description}</p>
            <LocalizedLink className={styles.submitBtn} href="/">
              {content.homeLink}
            </LocalizedLink>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};
