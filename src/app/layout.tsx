import type { Metadata } from "next";
import { Newsreader, Manrope } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { NavigationWrapper } from "@/components/NavigationWrapper";
import { Bell, Settings } from "lucide-react";

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ParentHq Command Center",
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
      className={`${newsreader.variable} ${manrope.variable} h-full antialiased`}
    >
      <body className="bg-background text-on-background font-body selection:bg-primary-container selection:text-on-primary-container h-full flex flex-col">
        <AuthProvider>
          {/* Desktop Command Header */}
          <header className="hidden md:flex fixed top-0 right-0 left-0 md:left-64 z-30 h-16 bg-[#f8f9fb]/80 backdrop-blur-xl justify-between items-center px-8 shadow-xl shadow-indigo-900/5">
            <div className="flex items-center gap-4">
              <span className="font-headline italic text-2xl text-primary">ParentHQ Command Center</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-6 mr-6">
                <span className="text-primary font-bold transition-all cursor-pointer">Overview</span>
                <span className="text-slate-400 hover:bg-primary/5 transition-all px-3 py-1 rounded-full cursor-pointer font-bold">Community</span>
                <span className="text-slate-400 hover:bg-primary/5 transition-all px-3 py-1 rounded-full cursor-pointer font-bold">Learning</span>
              </div>
              <button className="p-2 rounded-full hover:bg-primary/5 transition-all relative">
                <Bell className="text-primary" size={24} strokeWidth={2} />
                <span className="absolute top-2 right-2 w-2 h-2 bg-tertiary rounded-full border-2 border-white"></span>
              </button>
              <button className="p-2 rounded-full hover:bg-primary/5 transition-all" title="Settings">
                <Settings className="text-primary" size={24} strokeWidth={2} />
              </button>
            </div>
          </header>

          <main className="flex-1 pt-0 md:pt-16 pb-24 md:pb-8 md:pl-64 relative z-10 w-full overflow-x-hidden transition-all duration-300 min-h-screen">
            {children}
          </main>
          <NavigationWrapper />
        </AuthProvider>
      </body>
    </html>
  );
}
