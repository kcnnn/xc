import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Xactimate PDF Comparator",
  description: "Compare two Xactimate PDF estimates and identify differences. Export results as CSV for detailed analysis.",
  keywords: ["Xactimate", "PDF", "comparison", "estimate", "construction", "insurance"],
  authors: [{ name: "Xactimate PDF Comparator" }],
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
