import { Poppins } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import GoogleTranslate from "@/components/google-translate";
import PageTransitionLoader from "@/components/PageTransitionLoader";

const poppins = Poppins({ weight: ["300", "400", "500", "600", "700"], variable: "--font-poppins", subsets: ["latin"] });



export const metadata = {
  title: "Stoofi Dashboard",
  description: "Stoofi Management System",
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
