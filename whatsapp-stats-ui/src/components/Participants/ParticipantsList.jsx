import React from "react";
import ParticipantCard from "./ParticipantCard";

export default function ParticipantsList({ participants, selectedAuthor, onSelect }) {
  if (!participants || participants.length === 0) {
    return <div style={{ color: "rgba(255,255,255,.65)", fontSize:13 }}>Sube un ZIP exportado de WhatsApp para generar las estadísticas.</div>;
  }
  return (
    <div className="participants-list">
      {participants.map(p => (
        <ParticipantCard key={p.author} p={p} selected={selectedAuthor === p.author} onSelect={onSelect} />
      ))}
    </div>
  );
}