import "./globals.css";

export const metadata = {
  title: "Google Calendar Flairs",
  description: "Google Calendar event flair browser built with Next.js, React, and Tailwind CSS.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased text-slate-900">{children}</body>
    </html>
  );
}
