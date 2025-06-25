import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SocketProvider } from "@/components/providers/socket-providers";
import { QueryProvider } from "@/components/providers/query-provider";
import { ToastContainer } from "@/components/ui/toast-container";
import localFont from "next/font/local";
import { ConfirmDialogProvider } from "@/components/providers/confirm-dialog-provider";
import { AlertModal } from "@/components/modal/alert-modal";

export const metadata = {
  title: "WELCOME CHAT APP",
};

const pretendard = localFont({
  src: "../public/fonts/Pretendard.woff2",
  display: "swap",
  weight: "45 920",
  variable: "--font-pretendard",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${pretendard.variable} font-pretendard`}>
        <SocketProvider>
          <QueryProvider>
            {children}
            <ConfirmDialogProvider />
            <ToastContainer />
            <AlertModal />
          </QueryProvider>
        </SocketProvider>
      </body>
    </html>
  );
}
