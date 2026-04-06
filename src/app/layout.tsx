import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DaysWeMet",
  description: "A calendar made of photos — your private couple memory album",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="font-sans">{children}</body>
    </html>
  );
}
