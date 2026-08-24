import type { Metadata } from "next";
import { Inter, Noto_Sans_Bengali } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const notoSansBengali = Noto_Sans_Bengali({
  variable: "--font-noto-sans-bengali",
  subsets: ["bengali"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "বই লাগবে — ক্যাম্পাসের পুরনো বই কেনাবেচা",
  description:
    "বই লাগবে — বাংলাদেশের শিক্ষার্থীদের জন্য পুরনো বই কেনাবেচার সবচেয়ে সহজ প্ল্যাটফর্ম। আপনার কাছের ইনস্টিটিউটের বই খুঁজুন, বিক্রি করুন।",
  keywords: ["বই", "পুরনো বই", "used books", "campus books", "Bangladesh", "polytechnic", "university"],
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bn" className={`${inter.variable} ${notoSansBengali.variable} h-full`}>
      <body className="min-h-full flex flex-col font-[var(--font-noto-sans-bengali)] antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
