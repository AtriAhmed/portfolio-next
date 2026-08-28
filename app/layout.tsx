import type { Metadata } from "next";
import { Noto_Sans_Arabic } from "next/font/google";
import { headers } from "next/headers";
import { Toaster } from "sonner";
import { MotionProvider } from "@/components/motion-provider";
import "./globals.css";

const notoSansArabic = Noto_Sans_Arabic({
  variable: "--font-arabic",
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Mohamed Zayani | Journalist & Content Producer",
  description: "Journalism, content production, research, and selected work by Mohamed Zayani.",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const requestedLocale = (await headers()).get("x-next-intl-locale");
  const locale = requestedLocale === "ar" || requestedLocale === "tr" ? requestedLocale : "en";
  return (
    <html lang={locale} dir={locale === "ar" ? "rtl" : "ltr"} className={notoSansArabic.variable}>
      <body>
        <MotionProvider>{children}</MotionProvider>
        <Toaster position="bottom-right" theme="dark" richColors closeButton />
      </body>
    </html>
  );
}
