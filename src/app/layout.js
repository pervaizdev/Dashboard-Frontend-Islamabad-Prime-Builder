import { Poppins, Parisienne, Playfair_Display_SC } from "next/font/google";
import "./globals.css";

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
      className={`${poppins.variable} ${parisienne.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
