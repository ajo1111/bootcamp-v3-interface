// CSS
import "./globals.css";

// Fonts
import { Lexend } from "next/font/google";
const lexend = Lexend({ subsets: ['latin'] });

// Components
import TopNav from "./components/TopNav";
import MetaMaskProvider from "./components/providers/MetaMaskProvider";
import StoreProvider from "./components/providers/StoreProvider";
import SideNav from "./components/SideNav";


export const metadata = {
  title: "DAPP Exchange",
  description: "Your Favorite Crypto Exchange",
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <StoreProvider>
    <MetaMaskProvider>
      <html lang="en">
        <body className={`${lexend.className} bg-gray-50`} suppressHydrationWarning>
          <SideNav/>
          <main className="content">
            <TopNav />
            {children}
          </main>
        </body>
      </html>
    </MetaMaskProvider>
    </StoreProvider>
  );
}
