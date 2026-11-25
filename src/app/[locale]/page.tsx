import { setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <HomeContent />;
}

function HomeContent() {
  const t = useTranslations("nav");
  return (
    <main className="flex-1 flex items-center justify-center p-8">
      <p className="text-2xl font-bold">{t("home")} — Athlora 🚀</p>
    </main>
  );
}
