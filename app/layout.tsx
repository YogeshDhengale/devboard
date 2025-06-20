import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Suspense } from "react";
import NavBar from "@/components/nav-bar";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/hooks/use-auth";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DevBoard Arena - Developer Discussion Platform",
  description:
    "A lightweight developer discussion platform for asking questions and sharing knowledge",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <Suspense fallback={<div>Loading...</div>}>
            <NavBar />
          </Suspense>

          <main className="bg-gray-50 px-2 md:px-4">
            <div className="max-w-5xl mx-auto py-8 px-2">{children}</div>
          </main>

          <Toaster position="top-center" richColors />
        </AuthProvider>
      </body>
    </html>
  );
}
