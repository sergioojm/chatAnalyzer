import React from "react";
import { ResponsiveContainer, PieChart, Pie, Tooltip, Legend, BarChart, CartesianGrid, XAxis, YAxis, Bar } from "recharts";
import "./detail.css";

function fmt(n, digits=0){ if(typeof n!=="number"||Number.isNaN(n)) return "-"; return n.toLocaleString(undefined,{maximumFractionDigits:digits}); }
function pillStyle(avg) {
  if (avg > 0.15) return { background: "rgba(34,197,94,.15)", borderColor: "rgba(34,197,94,.35)", color: "rgb(134,239,172)" };
  if (avg < -0.15) return { background: "rgba(239,68,68,.15)", borderColor: "rgba(239,68,68,.35)", color: "rgb(252,165,165)" };
  return { background: "rgba(148,163,184,.12)", borderColor: "rgba(148,163,184,.35)", color: "rgb(226,232,240)" };
}

export default function DetailPanel({ selected, topWordsBar, pie, yAxisWidth, truncateWord }) {
  if (!selected) {
    return <div className="detail-empty">Haz click en un miembro para ver su sentimiento y su top de palabras.</div>;
  }

  return (
    <div className="detail-grid">
      <div className="detail-left">
        <div className="detail-kpis">
          <div className="kpi-card small"><div className="kpi-label">Mensajes</div><div className="kpi-value">{fmt(selected.messagesAnalyzed ?? 0)}</div></div>

          <div className="kpi-card small">
            <div className="kpi-label">Sentimiento medio</div>
            <div className="kpi-value">{fmt(selected.sentimentAvg ?? 0,3)}</div>
            <div className="sentiment-pill" style={pillStyle(selected.sentimentAvg ?? 0)}>{selected.sentimentAvg>0.15?"Positivo":selected.sentimentAvg<-0.15?"Negativo":"Neutral"}</div>
          </div>

          <div className="kpi-card small"><div className="kpi-label">Palabras</div><div className="kpi-value">{fmt(selected.totalWords ?? 0)}</div><div className="kpi-sub">{fmt(selected.uniqueWords ?? 0)} únicas</div></div>
          <div className="kpi-card small"><div className="kpi-label">Palabras/msg</div><div className="kpi-value">{fmt(selected.avgWordsPerMsg ?? 0,1)}</div></div>

          <div className="pie-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip />
                <Legend />
                <Pie data={pie} dataKey="value" nameKey="name" outerRadius={80} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="detail-right">
        <div className="detail-title">Top 10 palabras</div>
        <div className="bar-wrap">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topWordsBar} layout="vertical" margin={{left:10,right:20,top:10,bottom:10}}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis type="number" />
              <YAxis type="category" dataKey="word" width={yAxisWidth} interval={0} tickFormatter={(v)=>truncateWord(String(v))} />
              <Tooltip formatter={(value)=>[`${value}`,"Count"]} labelFormatter={(label)=>`Palabra: ${label}`} />
              <Bar dataKey="count" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="tip">Tip: pasa el ratón por una barra para ver la palabra completa.</div>
      </div>
    </div>
  );
}