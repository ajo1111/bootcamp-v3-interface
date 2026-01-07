// CSS
import "./globals.css";

// Fonts
import { Lexend } from "next/font/google";
const lexend = Lexend({ subsets: ['latin'] });

// Components
import TopNav from "./components/TopNav";
import MetaMaskProvider from "./components/providers/MetaMaskProvider";

export const metadata = {
  title: "DAPP Exchange",
  description: "Your Favorite Crypto Exchange",
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <MetaMaskProvider>
      <html lang="en">
        <body className={`${lexend.className} bg-gray-50`} suppressHydrationWarning>
          <main className="content">
            <TopNav />
            {children}
          </main>
        </body>
      </html>
    </MetaMaskProvider>
  );
}
