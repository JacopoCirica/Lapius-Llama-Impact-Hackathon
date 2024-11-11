import type { Metadata } from "next";
// import localFont from "next/font/local";
import "./globals.css";
import { Manrope } from "next/font/google";

const manrope = Manrope({ subsets: ["latin"] });

// const geistSans = localFont({
//   src: "./fonts/GeistVF.woff",
//   variable: "--font-geist-sans",
//   weight: "100 900",
// });
// const geistMono = localFont({
//   src: "./fonts/GeistMonoVF.woff",
//   variable: "--font-geist-mono",
//   weight: "100 900",
// });

export const metadata: Metadata = {
  title: "Lapius Chat",
  description: "Medical coding chat application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${manrope.className} flex flex-col min-h-screen md:px-2 md:py-4 overflow-y-auto`}
      >
        <div className="flex-grow relative w-full mx-auto h-full bg-gradient-to-b from-white via-[#4E8C3299] to-[#2C770B] rounded-2xl overflow-hidden m-2 md:p-4">
          {/* Grid Background */}
          <div className="absolute inset-0 bg-grid opacity-40 pointer-events-none z-0"></div>

          {/* Main content (children) */}
          <main className="relative z-10">{children}</main>
        </div>
      </body>
    </html>
  );
}
