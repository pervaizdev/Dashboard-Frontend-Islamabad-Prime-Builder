import { Poppins, Parisienne, Playfair_Display_SC } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "react-hot-toast";

const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-body",
  subsets: ["latin"],
});

const parisienne = Parisienne({
  weight: ["400"],
  variable: "--font-script",
  subsets: ["latin"],
  preload: false,
});

const playfair = Playfair_Display_SC({
  weight: ["400", "700"],
  variable: "--font-serif",
  subsets: ["latin"],
  preload: false,
});

export const metadata = {
  title: "Client Portal",
  description: "Experience premium luxury with Prime-Builder.",
  icons: {
    icon: "/images/logo.png",
  },
  manifest: "/manifest.json",
  
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${poppins.variable} ${parisienne.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="bg-white text-black">
        <AuthProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              className: "font-body text-sm rounded-xl",
              duration: 4000,
            }}
          />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}