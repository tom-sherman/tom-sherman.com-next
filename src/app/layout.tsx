import "./globals.css";
import "@picocss/pico/css/pico.min.css";
import styles from "./root.module.css";
import { Analytics } from "@vercel/analytics/react";
import { Viewport } from "next";

export const viewport: Viewport = {
  themeColor: "#9b4dca",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" />
      </head>
      <body className={styles.body}>
        {children}
        <footer className="container">
          ⚛️ Copyright Tom Sherman, {new Date().getFullYear()}.
        </footer>
        <Analytics />
      </body>
    </html>
  );
}
