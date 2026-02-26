import type { Metadata } from "next";
import { Roboto, Rubik, Roboto_Flex } from "next/font/google";
import "./globals.scss";
import { Header } from "@/components/header/Header/Header";
import { Footer } from "@/components/footer/Footer/Footer";
import { LanguageProvider } from "@/lib/LanguageContext";

const roboto = Roboto({
  weight: ["400", "500", "700", "900"],
  variable: "--font-roboto",
  subsets: ["latin", "cyrillic"],
});

const robotoFlex = Roboto_Flex({
  variable: "--font-roboto-flex",
  subsets: ["latin", "cyrillic"],
});

const rubik = Rubik({
  variable: "--font-rubik",
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  title: "IET Shop",
  description: "Get your right course",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${roboto.variable} ${robotoFlex.variable} ${rubik.variable} antialiased text-gray-900 bg-gray-50`}
      >
        <LanguageProvider>
          <Header />
          <main>
            {children}
          </main>
          <Footer />
        </LanguageProvider>
      </body>
    </html>
  );
}
