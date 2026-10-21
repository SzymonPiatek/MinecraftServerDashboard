import type { Metadata } from "next";
import { JetBrains_Mono, Plus_Jakarta_Sans, VT323 } from "next/font/google";
import { ToastProvider } from "@/components/ui/toast";
import { siteConfig } from "@/lib/site-config";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500"],
});

const vt323 = VT323({
  variable: "--font-vt323",
  subsets: ["latin", "latin-ext"],
  weight: "400",
});

export const metadata: Metadata = {
  title: `${siteConfig.name} – serwer Minecraft`,
  description: siteConfig.description,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pl" className={`${jakarta.variable} ${jetbrains.variable} ${vt323.variable}`}>
      <body>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
