import { useState } from "react";
import { useList } from "./hooks/useList";
import { calcStock } from "./utils";
import StockForm from "./components/StockForm";
import IssueForm from "./components/IssueForm";
import Shifts from "./components/Shifts";
import Stats from "./components/Stats";

export default function App() {
  const [tab, setTab] = useState("work");
  const incomes = useList("incomes");
  const shifts = useList("shifts");

  if (incomes.loading || shifts.loading) {
    return (
      <div className="container">
        <p className="muted">Ładowanie…</p>
      </div>
    );
  }

  if (incomes.error || shifts.error) {
    return (
      <div className="container">
        <h1>Brak połączenia z bazą</h1>
        <p className="muted">
          Sprawdź w Firebase Console, czy baza Realtime Database jest utworzona
          i czy reguły (Rules) pozwalają na odczyt i zapis.
        </p>
      </div>
    );
  }

  const stock = calcStock(incomes.items, shifts.items);

  return (
    <div className="container">
      <header className="top">
        <h1>Ewidencja biletów</h1>
        <nav className="tabs">
          <button
            className={tab === "work" ? "active" : ""}
            onClick={() => setTab("work")}
          >
            Panel
          </button>
          <button
            className={tab === "stats" ? "active" : ""}
            onClick={() => setTab("stats")}
          >
            Statystyki
          </button>
        </nav>
      </header>

      <section className="hero">
        <div className="hero-main">
          <span className="label">Na magazynie</span>
          <b className={`hero-number ${stock.inStock < 0 ? "neg" : ""}`}>
            {stock.inStock}
          </b>
        </div>
        <div className="hero-side">
          <span className="label">U selekcjonerów</span>
          <b>{stock.onHands}</b>
        </div>
      </section>

      {tab === "work" ? (
        <>
          <StockForm incomes={incomes.items} />
          <IssueForm inStock={stock.inStock} />
          <Shifts shifts={shifts.items} />
        </>
      ) : (
        <Stats shifts={shifts.items} stock={stock} />
      )}
    </div>
  );
}
