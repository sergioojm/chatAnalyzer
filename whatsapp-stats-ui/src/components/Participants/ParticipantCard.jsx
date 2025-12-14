import React from "react";
import "./participants.css";
import { fmt } from "../../utils/helpers";

function pillStyle(avg) {
  if (avg > 0.15) return { background: "rgba(34,197,94,.15)", borderColor: "rgba(34,197,94,.35)", color: "rgb(134,239,172)" };
  if (avg < -0.1) return { background: "rgba(239,68,68,.15)", borderColor: "rgba(239,68,68,.35)", color: "rgb(252,165,165)" };
  return { background: "rgba(148,163,184,.12)", borderColor: "rgba(148,163,184,.35)", color: "rgb(226,232,240)" };
}

export default function ParticipantCard({ p, onSelect, selected }) {
  const avg = p.sentimentAvg ?? 0;
  return (
    <button className={`participant-card ${selected ? "selected":""}`} onClick={()=>onSelect(p)}>
      <div className="participant-top">
        <div className="participant-meta">
          <div className="participant-name">{p.author}</div>
          <div className="participant-sub">{fmt(p.messagesAnalyzed)} mensajes · {fmt(p.avgWordsPerMsg ?? 0,1)} palabras/msg</div>
        </div>
        <span className="participant-pill" style={pillStyle(avg)}>
          {(avg>0.15)?"Positivo":avg<-0.1?"Negativo":"Neutral"} · {fmt(avg,3)}
        </span>
      </div>

      <div className="participant-stats">
        <div>✅ {p.percent?.positive ?? 0}%</div>
        <div>➖ {p.percent?.neutral ?? 0}%</div>
        <div>❌ {p.percent?.negative ?? 0}%</div>
      </div>
    </button>
  );
}