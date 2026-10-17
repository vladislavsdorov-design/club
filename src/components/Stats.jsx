import { useMemo, useState } from "react";
import { fmtDate } from "../utils";

function groupBy(list, key) {
  const m = {};
  list.forEach((s) => {
    const k = s[key];
    m[k] ??= { key: k, shifts: 0, issued: 0, returned: 0 };
    m[k].shifts++;
    m[k].issued += s.issued;
    m[k].returned += s.returned;
  });
  return Object.values(m).map((r) => ({ ...r, used: r.issued - r.returned }));
}

function Table({ title, rows, firstCol, formatKey }) {
  return (
    <section className="block">
      <h2>{title}</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>{firstCol}</th>
              <th className="num">Zmian</th>
              <th className="num">Wydano</th>
              <th className="num">Zwrócono</th>
              <th className="num">Wykorzystano</th>
              <th>Wykorzystanie</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const pct = r.issued ? Math.round((r.used / r.issued) * 100) : 0;
              return (
                <tr key={r.key}>
                  <td>{formatKey ? formatKey(r.key) : r.key}</td>
                  <td className="num">{r.shifts}</td>
                  <td className="num">{r.issued}</td>
                  <td className="num">{r.returned}</td>
                  <td className="num"><b>{r.used}</b></td>
                  <td>
                    <div className="meter">
                      <div className="meter-bar">
                        <div className="meter-fill" style={{ width: `${pct}%` }} />
                      </div>
                      <span>{pct}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr><td colSpan="6" className="muted">Brak danych</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default function Stats({ shifts, stock }) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const closed = useMemo(
    () =>
      shifts.filter(
        (s) =>
          s.status === "closed" &&
          (!from || s.date >= from) &&
          (!to || s.date <= to)
      ),
    [shifts, from, to]
  );

  const totals = useMemo(() => {
    const issued = closed.reduce((a, s) => a + s.issued, 0);
    const returned = closed.reduce((a, s) => a + s.returned, 0);
    return { issued, returned, used: issued - returned, shifts: closed.length };
  }, [closed]);

  const byPerson = useMemo(
    () => groupBy(closed, "faceControl").sort((a, b) => b.used - a.used),
    [closed]
  );
  const byDate = useMemo(
    () => groupBy(closed, "date").sort((a, b) => (a.key < b.key ? 1 : -1)),
    [closed]
  );

  return (
    <>
      <section className="block">
        <h2>Magazyn ogółem</h2>
        <div className="stats">
          <div><span className="label">Łącznie przyjęto</span><b>{stock.received}</b></div>
          <div><span className="label">Na magazynie</span><b>{stock.inStock}</b></div>
          <div><span className="label">U selekcjonerów</span><b>{stock.onHands}</b></div>
          <div><span className="label">Łącznie wykorzystano</span><b className="accent">{stock.used}</b></div>
        </div>
      </section>

      <section className="block">
        <h2>Wybrany okres</h2>
        <div className="row">
          <label>Od <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} /></label>
          <label>Do <input type="date" value={to} onChange={(e) => setTo(e.target.value)} /></label>
          <button className="ghost" onClick={() => { setFrom(""); setTo(""); }}>
            Wyczyść
          </button>
        </div>
        <div className="stats">
          <div><span className="label">Zmian</span><b>{totals.shifts}</b></div>
          <div><span className="label">Wydano</span><b>{totals.issued}</b></div>
          <div><span className="label">Zwrócono</span><b>{totals.returned}</b></div>
          <div><span className="label">Wykorzystano</span><b className="accent">{totals.used}</b></div>
        </div>
      </section>

      <Table title="Według selekcjonerów" rows={byPerson} firstCol="Imię" />
      <Table title="Według dni" rows={byDate} firstCol="Data" formatKey={fmtDate} />
    </>
  );
}
