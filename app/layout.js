// CSS
import "./globals.css";

// Fonts
import { Lexend } from "next/font/google";
const lexend = Lexend({ subsets: ['latin'] });

// Components
import MetaMaskProvider from "./components/providers/MetaMaskProvider";
import TopNav from './components/TopNav'

export const metadata = {
  title: "AI Exchange",
  description: "Your favorite Agent Exchange and Marketplace",
};

export default function RootLayout({ children }) {
  return (
    <MetaMaskProvider>
      <html lang="en">
        <body className={`${lexend.className}`}>
          <main className="content">
            <TopNav />
            {children}
          </main>
        </body>
      </html>
    </MetaMaskProvider>
  );
}
