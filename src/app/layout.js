import { Poppins, Parisienne, Playfair_Display_SC } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "react-hot-toast";
import Script from "next/script";

const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-body",
  subsets: ["latin"],
});

const parisienne = Parisienne({
  weight: ["400"],
  variable: "--font-script",
  subsets: ["latin"],
});

const playfair = Playfair_Display_SC({
  weight: ["400", "700"],
  variable: "--font-serif",
  subsets: ["latin"],
});

export const metadata = {
  title: "Prime-Builder Client Portal",
  description: "Experience premium luxury with Prime-Builder.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${poppins.variable} ${parisienne.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="bg-white text-black">
        <Script
          id="match-media-polyfill"
          strategy="beforeInteractive"
        >
          {`
            (function() {
              if (typeof window !== 'undefined') {
                const originalMatchMedia = window.matchMedia;
                window.matchMedia = function(query) {
                  const mql = originalMatchMedia ? originalMatchMedia(query) : null;
                  if (!mql) {
                    return {
                      matches: false,
                      media: query,
                      onchange: null,
                      addListener: function() {},
                      removeListener: function() {},
                      addEventListener: function() {},
                      removeEventListener: function() {},
                      dispatchEvent: function() { return true; },
                    };
                  }
                  if (typeof mql.addListener === 'undefined') {
                    mql.addListener = function(cb) { this.addEventListener('change', cb); };
                  }
                  if (typeof mql.removeListener === 'undefined') {
                    mql.removeListener = function(cb) { this.removeEventListener('change', cb); };
                  }
                  return mql;
                };
              }
            })();
          `}
        </Script>
        <AuthProvider>
          <Toaster 
            position="top-right"
            toastOptions={{
              className: 'font-body text-sm rounded-xl',
              duration: 4000,
            }}
          />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
