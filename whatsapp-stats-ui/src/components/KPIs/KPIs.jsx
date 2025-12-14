import React from "react";
import "./KPIs.css";

function Card({ children }) {
  return <div className="kpi-card">{children}</div>;
}
function Stat({ label, value, sub }) {
  return (
    <div style={{display:"flex", flexDirection:"column", gap:6}}>
      <div className="kpi-label">{label}</div>
      <div className="kpi-value">{value}</div>
      {sub ? <div className="kpi-sub">{sub}</div> : null}
    </div>
  );
}

export default function KPIs({ totals, global }) {
  return (
    <div className="kpi-grid">
      <Card><Stat label="Mensajes parseados" value={totals.totalMessagesParsed ?? 0} /></Card>
      <Card><Stat label="Mensajes analizados" value={totals.totalMessagesSelected ?? 0} sub={`${(global?.messagesPerDay?.avgPerDay ?? 0).toFixed(2)} msgs/día`} /></Card>
      <Card><Stat label="Participantes" value={totals.totalParticipantsSelected ?? 0} /></Card>
      <Card><Stat label="Palabras analizadas" value={totals.totalWordsSelected ?? 0} /></Card>
      <Card><Stat label="Hora más activa" value={global?.busiest?.hour != null ? `${String(global.busiest.hour).padStart(2,"0")}:00` : "—"} sub={global?.busiest?.hourMessages ? `${global.busiest.hourMessages} msgs` : ""} /></Card>
      <Card><Stat label="Día más activo" value={global?.busiest?.weekdayName ?? "—"} sub={global?.busiest?.weekdayMessages ? `${global.busiest.weekdayMessages} msgs` : ""} /></Card>
    </div>
  );
}