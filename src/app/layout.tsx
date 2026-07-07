import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/components/Layout/AppContext";
import PageWrapper from "@/components/Layout/PageWrapper";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Vigilant AI | Compliance & Regulatory Intelligence for Indian SMEs",
  description: "Automate corporate compliance, GST filing check, EPF / ESIC deposits, Labour Laws, PCB, and Factory Act compliance logs with Gemini-powered AI employee agent.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col font-sans" suppressHydrationWarning>
        <AppProvider>
          <PageWrapper>
            {children}
          </PageWrapper>
        </AppProvider>
      </body>
    </html>
  );
}
