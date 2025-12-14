import React from "react";
import "./Header.css";

export default function Header({ title, input, totals, zipName, chatFileName, rightControls }) {
  return (
    <div className="header-bg">
      <header className="app-header">
        <div className="header-left">
          <div className="app-title">{title}</div>
          <div className="app-sub">
            Rango: {input.from ?? "-"} → {input.to ?? "-"} · Participantes: {totals.totalParticipantsSelected ?? 0}
          </div>
          {(zipName || chatFileName) && (
            <div className="app-sub small">ZIP: {zipName || "-"} · Chat: {chatFileName || "-"}</div>
          )}
        </div>

        <div className="header-right">{rightControls}</div>
      </header>
    </div>
  );
}