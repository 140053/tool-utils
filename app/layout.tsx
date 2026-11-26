import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "QR & Barcode Generator",
  description: "Generate QR codes (text, website, WiFi) and barcodes (Code 128, EAN, UPC and more).",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
      <footer className="container">
        <p className="credit muted">
          Made with ❤️ by <a href="https://github.com/140053" target="_blank" rel="noopener noreferrer">  k.b.r</a>          
        </p>
      </footer>
    </html>
  );
}
