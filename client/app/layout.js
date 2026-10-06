import { Poppins } from "next/font/google";
import "./globals.css";
import "./custom-animations.css";
import { ThemeProvider } from "@/components/theme-provider";
import GoogleTranslate from "@/components/google-translate";
import PageTransitionLoader from "@/components/PageTransitionLoader";

const poppins = Poppins({ weight: ["300", "400", "500", "600", "700"], variable: "--font-poppins", subsets: ["latin"] });



export const metadata = {
  title: "Stoofi ERP - Smarter Education, Simple Management",
  description: "Stoofi School Management System & ERP",
  icons: {
    icon: [
      { url: '/stoofi-icon.png', type: 'image/png' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    shortcut: '/stoofi-icon.png',
    apple: '/stoofi-icon.png',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning >
      <head>
        <link rel="icon" href="/stoofi-icon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/stoofi-icon.png" />
      </head>
      <body suppressHydrationWarning className={`min-h-screen bg-background text-foreground overflow-x-hidden ${poppins.className}`}>
        <GoogleTranslate />
        <ThemeProvider attribute="class" forcedTheme="light">
          <PageTransitionLoader />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
