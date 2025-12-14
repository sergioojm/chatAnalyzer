import React from "react";
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";
import "./overview.css";

export default function OverviewChart({ data }) {
  return (
    <div className="overview-card">
      <div className="overview-header">
        <div className="overview-title">Top participantes (mensajes)</div>
        <div className="overview-sub">Muestra 12</div>
      </div>
      <div className="overview-chart">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
            <XAxis dataKey="name" hide />
            <YAxis />
            <Tooltip />
            <Bar dataKey="msgs" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}