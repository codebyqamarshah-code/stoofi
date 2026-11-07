import { Poppins } from "next/font/google";
import "./globals.css";
import "./custom-animations.css";
import { ThemeProvider } from "@/components/theme-provider";
import GoogleTranslate from "@/components/google-translate";
import PageTransitionLoader from "@/components/PageTransitionLoader";
// import CustomCursor from "@/components/CustomCursor";

const poppins = Poppins({ weight: ["300", "400", "500", "600", "700"], variable: "--font-poppins", subsets: ["latin"] });



export const metadata = {
  title: "Stoofi ERP - Smarter Education, Simple Management",
  description: "Stoofi School Management System & ERP",
  icons: {
    icon: '/favicon.ico',
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
    <html lang="en-GB" suppressHydrationWarning >
      <head>
        {/* Google Translate DOM reconciliation patch: prevents fatal React removeChild / insertBefore NotFoundError crashes */}
        <script
          id="google-translate-dom-patch"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                if (typeof window === 'undefined') return;
                try {
                  if (typeof Node === 'function' && Node.prototype) {
                    var origRemoveChild = Node.prototype.removeChild;
                    Node.prototype.removeChild = function(child) {
                      if (child && child.parentNode !== this) {
                        if (child.parentNode) {
                          return child.parentNode.removeChild(child);
                        }
                        return child;
                      }
                      return origRemoveChild.apply(this, arguments);
                    };

                    var origInsertBefore = Node.prototype.insertBefore;
                    Node.prototype.insertBefore = function(newNode, referenceNode) {
                      if (referenceNode && referenceNode.parentNode !== this) {
                        if (referenceNode.parentNode) {
                          return referenceNode.parentNode.insertBefore(newNode, referenceNode);
                        }
                        return origInsertBefore.call(this, newNode, null);
                      }
                      return origInsertBefore.apply(this, arguments);
                    };

                    var origReplaceChild = Node.prototype.replaceChild;
                    Node.prototype.replaceChild = function(newChild, oldChild) {
                      if (oldChild && oldChild.parentNode !== this) {
                        if (oldChild.parentNode) {
                          return oldChild.parentNode.replaceChild(newChild, oldChild);
                        }
                        return newChild;
                      }
                      return origReplaceChild.apply(this, arguments);
                    };
                  }
                } catch (e) {
                  if (console && console.warn) console.warn('DOM translation patch error:', e);
                }
              })();
            `,
          }}
        />
        <link rel="icon" href="/stoofi-icon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/stoofi-icon.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@600;700&family=Dancing+Script:wght@600;700&display=swap" rel="stylesheet" />
      </head>
      <body suppressHydrationWarning className={`min-h-screen bg-background text-foreground overflow-x-hidden ${poppins.className}`}>
        <GoogleTranslate />
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <PageTransitionLoader />
          {/* <CustomCursor /> */}
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
