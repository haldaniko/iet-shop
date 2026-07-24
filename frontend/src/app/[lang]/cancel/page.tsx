import { notFound } from "next/navigation";
import { CancelPage } from "@/components/pages/CancelPage/CancelPage";
import {
  type CancelPageLanguage,
  translations,
} from "@/components/pages/CancelPage/translations";

type CancelRouteProps = {
  params: Promise<{ lang: string }>;
};

export default async function CancelRoute({ params }: CancelRouteProps) {
  const { lang } = await params;

  if (!(lang in translations)) {
    notFound();
  }

  return <CancelPage lang={lang as CancelPageLanguage} />;
}
