import { useState } from "react";
import { ref, remove as dbRemove, update } from "firebase/database";
import { db } from "../firebase";
import { fmtDate } from "../utils";

function ShiftRow({ s }) {
  const [val, setVal] = useState("");

  const close = async () => {
    const r = Number(val);
    if (val === "" || isNaN(r) || r < 0 || r > s.issued) {
      alert(`Wpisz liczbę od 0 do ${s.issued}`);
      return;
    }
    await update(ref(db, `shifts/${s.id}`), {
      returned: r,
      status: "closed",
      closedAt: Date.now(),
    });
    setVal("");
  };

  const reopen = () =>
    update(ref(db, `shifts/${s.id}`), {
      returned: null,
      status: "open",
      closedAt: null,
    });

  const del = () => {
    if (window.confirm("Usunąć tę zmianę?")) dbRemove(ref(db, `shifts/${s.id}`));
  };

  return (
    <div className={`shift ${s.status}`}>
      <div className="shift-head">
        <b>{s.faceControl}</b>
        <span className="muted">{fmtDate(s.date)}</span>
      </div>

      <div className="shift-nums">
        <div>
          <span className="label">Wydano</span>
          <b>{s.issued}</b>
        </div>
        {s.status === "closed" ? (
          <>
            <div>
              <span className="label">Zwrócił</span>
              <b>{s.returned}</b>
            </div>
            <div>
              <span className="label">Wykorzystano</span>
              <b className="accent">{s.issued - s.returned}</b>
            </div>
          </>
        ) : (
          <div>
            <span className="badge">Trwa zmiana</span>
          </div>
        )}
      </div>

      {s.status === "open" ? (
        <div className="row">
          <input
            type="number"
            inputMode="numeric"
            min="0"
            max={s.issued}
            placeholder="Ile zwrócił"
            value={val}
            onChange={(e) => setVal(e.target.value)}
          />
          <button onClick={close}>Zamknij zmianę</button>
          <button className="ghost" onClick={del}>Usuń</button>
        </div>
      ) : (
        <div className="row">
          <button className="ghost" onClick={reopen}>Popraw</button>
          <button className="ghost" onClick={del}>Usuń</button>
        </div>
      )}
    </div>
  );
}

export default function Shifts({ shifts }) {
  const open = shifts.filter((s) => s.status === "open");
  const closed = shifts.filter((s) => s.status === "closed");

  return (
    <>
      <section className="block">
        <h2>Otwarte zmiany <span className="count">{open.length}</span></h2>
        {open.length === 0 && (
          <p className="muted">Brak otwartych zmian. Wydaj bilety selekcjonerowi powyżej.</p>
        )}
        {open.map((s) => <ShiftRow key={s.id} s={s} />)}
      </section>

      <section className="block">
        <h2>Zamknięte zmiany</h2>
        {closed.length === 0 && <p className="muted">Na razie pusto.</p>}
        {closed.slice(0, 20).map((s) => <ShiftRow key={s.id} s={s} />)}
      </section>
    </>
  );
}
