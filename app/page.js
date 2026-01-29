"use client";

// Components
import Markets from "@/app/components/Markets";
import PriceChart from "@/app/components/PriceChart";
import NewOrder from "@/app/components/NewOrder";
import Orderbook from "@/app/components/Orderbook";
import MyTrades from "@/app/components/MyTrades";
import Trades from "@/app/components/Trades";

// Hooks
import { useMarkets } from "@/app/hooks/useMarkets";

export default function Home() {
  // Load markets from config into Redux
  useMarkets();

  return (
    <div className="page trading">
      <h1 className="title">Trading</h1>

      {/* Market Selector - Top left, prominent position */}
      <section className="market">
        <Markets />
      </section>

      {/* Price Chart - Left side, large area for visibility */}
      <section className="chart-section">
        <PriceChart />
      </section>

      {/* Order Entry Form - Right side, always accessible */}
      <section className="order">
        <NewOrder />
      </section>

      {/* Recent Trades - Right side below order form */}
      <section className="trades-section">
        <Trades />
      </section>

      {/* Orderbook - Left side below price chart */}
      <section className="orderbook-section">
        <Orderbook />
      </section>

      {/* User's Trades - Bottom full width */}
      <section className="mytrades-section">
        <MyTrades />
      </section>
    </div>
  );
}
