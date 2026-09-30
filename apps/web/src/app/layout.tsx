import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TerraShift | NASA Space Apps 2026 - Adapting Farms with NASA Data",
  description:
    "Drop a pin on your field to receive an agronomist-validated, climate-adaptive 4-year crop rotation powered by NASA SMAP L4 soil moisture and NASA POWER agroclimatology.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "TerraShift",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#16a34a",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="bn">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="bg-slate-50 dark:bg-black text-gray-900 dark:text-gray-100 min-h-screen selection:bg-agrogreen-500 selection:text-white transition-colors duration-200">
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(
                    function(registration) {
                      console.log('TerraShift Service Worker registered with scope: ', registration.scope);
                    },
                    function(err) {
                      console.log('TerraShift Service Worker registration failed: ', err);
                    }
                  );
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
