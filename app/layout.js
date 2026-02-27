// CSS
import "./globals.css";

// Fonts
import { Lexend } from 'next/font/google'
const lexend = Lexend({ subsets: ['latin'] })

// Components
import MetaMaskProvider from "./components/providers/MetaMaskProvider"
import StoreProvider from "./components/providers/StoreProvider"
import DemoSessionSync from "./components/providers/DemoSessionSync"
import TopNav from './components/TopNav'
import SideNav from './components/SideNav'
import DemoGuide from "./components/DemoGuide"

export const metadata = {
  title: "DAPP Exchange",
  description: "Your favorite Peer to peer orderbook exchange",
};

export default function RootLayout({ children }) {
  return (
    <StoreProvider>
      <MetaMaskProvider>    
        <html lang="en">
          <body className={`${lexend.className}`}>
            <DemoSessionSync />
            <SideNav/>

            <main className="content">
              <TopNav />
              <DemoGuide />
              {children}
            </main>
          </body>
        </html>
      </MetaMaskProvider>
    </StoreProvider>
  );
}
