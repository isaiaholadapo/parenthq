import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { NavigationWrapper } from "@/components/NavigationWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ParentHq",
  description: "Private pregnancy dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-100">
        <AuthProvider>
          <main className="flex-1 pb-24 md:pb-8 md:pl-64 relative z-10 w-full overflow-x-hidden transition-all duration-300">
            {/* Desktop Command Header */}
            <div className="hidden md:flex h-16 border-b border-slate-200/60 bg-white/50 backdrop-blur-md items-center justify-between px-8 w-full sticky top-0 z-30">
              <h2 className="text-slate-900 font-semibold tracking-tight text-lg">ParentHq Command Center</h2>
              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm shadow-sm border border-indigo-200">
                P
              </div>
            </div>
            {children}
          </main>
          <NavigationWrapper />
        </AuthProvider>
      </body>
    </html>
  );
}
