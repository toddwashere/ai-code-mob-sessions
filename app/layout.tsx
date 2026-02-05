import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SupportWidget } from "@/components/support-widget";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Expense Shamer",
  description: "Face your financial shame. Your mom will hear about this.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
        <SupportWidget />
      </body>
    </html>
  );
}
