import type { Metadata } from "next";
import { Work_Sans } from "next/font/google";
import "./globals.css";
import { Room } from "./Room";


const work_sans = Work_Sans({ subsets: ["latin"], variable: '--font-work-sans', weight: ['400', '600', '700'] });

export const metadata: Metadata = {
  title: "Figma clone",
  description: "Figma clone with colaborative board using liveblocks",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${work_sans.className} bg-primary-grey-200`}>
        <Room>
          {children}
        </Room>
      </body>
    </html>
  );
}
