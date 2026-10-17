import { useState } from "react";
import { push, ref } from "firebase/database";
import { db } from "../firebase";
import { today } from "../utils";

export default function IssueForm({ inStock }) {
  const [name, setName] = useState("");
  const [count, setCount] = useState("");
  const [date, setDate] = useState(today());

  const submit = async (e) => {
    e.preventDefault();
    const n = Number(count);
    if (!name.trim() || !n || n <= 0) return;

    if (
      n > inStock &&
      !window.confirm(`Na magazynie jest tylko ${inStock}. Wydać mimo to ${n}?`)
    ) {
      return;
    }

    await push(ref(db, "shifts"), {
      faceControl: name.trim(),
      issued: n,
      date,
      status: "open",
      createdAt: Date.now(),
    });
    setCount("");
  };

  return (
    <section className="block">
      <h2>Wydaj selekcjonerowi</h2>
      <form onSubmit={submit} className="row">
        <input
          className="grow"
          placeholder="Imię selekcjonera"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="number"
          inputMode="numeric"
          min="1"
          placeholder="Ile wydano"
          value={count}
          onChange={(e) => setCount(e.target.value)}
        />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <button type="submit">Wydaj</button>
      </form>
    </section>
  );
}
