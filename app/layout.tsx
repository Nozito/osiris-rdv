import type { Metadata } from "next";
import "./globals.css";
import { ToastContainer } from "@/components/ui/Toast";

export const metadata: Metadata = {
  title: {
    template: "%s — OSIRIS",
    default: "OSIRIS RDV",
  },
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className="h-full">
      <head>
        <link
          rel="stylesheet"
          href="https://api.fontshare.com/v2/css?f[]=clash-display@400,500,600,700&f[]=satoshi@300,400,500,700&display=swap"
        />
      </head>
      <body className="min-h-full flex flex-col antialiased">
        {children}
        {/* OSIRIS UX — toast notifications */}
        <ToastContainer />
      </body>
    </html>
  );
}
