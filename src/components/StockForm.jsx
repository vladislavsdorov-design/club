import { useState } from "react";
import { push, ref, remove } from "firebase/database";
import { db } from "../firebase";
import { today, fmtDate } from "../utils";

export default function StockForm({ incomes }) {
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    const n = Number(amount);
    if (!n || n <= 0) return;
    await push(ref(db, "incomes"), {
      amount: n,
      note: note.trim(),
      date: today(),
      createdAt: Date.now(),
    });
    setAmount("");
    setNote("");
  };

  const del = (id) => {
    if (window.confirm("Usunąć to przyjęcie?")) remove(ref(db, `incomes/${id}`));
  };

  return (
    <section className="block">
      <h2>Przyjęcie biletów</h2>
      <form onSubmit={submit} className="row">
        <input
          type="number"
          inputMode="numeric"
          min="1"
          placeholder="Ile biletów"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <input
          className="grow"
          placeholder="Komentarz (opcjonalnie)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <button type="submit">Dodaj</button>
      </form>

      {incomes.length > 0 && (
        <ul className="list">
          {incomes.slice(0, 5).map((i) => (
            <li key={i.id}>
              <span className="list-main">
                <b className="plus">+{i.amount}</b>
                <span className="muted">{fmtDate(i.date)}</span>
                {i.note && <span>{i.note}</span>}
              </span>
              <button
                className="icon"
                onClick={() => del(i.id)}
                aria-label="Usuń przyjęcie"
                title="Usuń"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
