import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Provider";
import { Toaster } from "@/components/ui/sonner"
import LayoutWrapper from "@/components/LayoutWrapper";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VyaparEasy",
  description: "Make Business Easy",
  icons: {
    icon: {
      url:'/assets_task_01jtk0k64vf999vsvfvfbv3w5b_1746542400_img_1.webp',
      type: 'image/webp',
      sizes: '64x64',
    }
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <LayoutWrapper>
            {children}
          </LayoutWrapper>
          <Toaster 
          position="top-right"
          toastOptions={{
            classNames: {
              error: 'bg-red-600 text-white font-medium shadow-md rounded',
              success: 'bg-green-600 text-white font-medium shadow-md rounded',
            },
          }}
          />
        </Providers>
      </body>
    </html>
  );
}
