import { Geist, Geist_Mono, IBM_Plex_Sans, Courier_Prime } from "next/font/google";
import "./globals.css";

// UI sans (body, most headings)
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// Code / terminal / timestamps
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Big display headings + large stat numbers (weight 300 only, per DESIGN.md)
const ibmPlexSans = IBM_Plex_Sans({
  variable: "--font-ibm-plex",
  subsets: ["latin"],
  weight: ["300", "400"],
});

// Logo wordmark only
const courierPrime = Courier_Prime({
  variable: "--font-courier-prime",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata = {
  title: "AssetFlow — Asset & Resource Management",
  description:
    "Enterprise Asset & Resource Management System — track, allocate, and maintain assets and shared resources.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${ibmPlexSans.variable} ${courierPrime.variable} h-full antialiased`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
