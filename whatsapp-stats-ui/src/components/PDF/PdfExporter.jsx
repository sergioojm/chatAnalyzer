import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { fmt } from "../../utils/helpers";

const PdfExporter = ({ stats }) => {
  const downloadPdfReport = () => {
    const doc = new jsPDF({ unit: "pt", format: "a4" });

    const title = "WhatsApp Stats Report";
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text(title, 40, 48);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);

    const input = stats?.input ?? {};
    const totals = stats?.totals ?? {};
    const global = stats?.global ?? {};

    doc.text(`Rango: ${input.from ?? "-"} → ${input.to ?? "-"}`, 40, 70);
    doc.text(`Mensajes analizados: ${fmt(totals.totalMessagesSelected ?? 0)} | Participantes: ${fmt(totals.totalParticipantsSelected ?? 0)}`, 40, 86);
    doc.text(`Palabras analizadas: ${fmt(totals.totalWordsSelected ?? 0)}`, 40, 102);

    if (global?.busiest?.hour != null) {
      doc.text(
        `Hora más activa: ${String(global.busiest.hour).padStart(2, "0")}:00 (${fmt(global.busiest.hourMessages)} msgs)`,
        40,
        118
      );
    }
    if (global?.busiest?.weekdayName) {
      doc.text(
        `Día más activo: ${global.busiest.weekdayName} (${fmt(global.busiest.weekdayMessages)} msgs)`,
        40,
        134
      );
    }

    // Top palabras global
    autoTable(doc, {
      startY: 155,
      head: [["Top 10 palabras (global)", "Count"]],
      body: (global.topWords ?? []).map((x) => [x.word, String(x.count)]),
      styles: { font: "helvetica", fontSize: 10 },
      headStyles: { fillColor: [20, 20, 20] },
      theme: "striped",
      margin: { left: 40, right: 40 },
    });

    // Tabla participantes
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 18,
      head: [["Participante", "Mensajes", "Sent. media", "Pos%", "Neu%", "Neg%", "Palabras", "Únicas", "Pal/msg"]],
      body: (stats.participants ?? []).map((p) => [
        p.author,
        String(p.messagesAnalyzed ?? 0),
        (p.sentimentAvg ?? 0).toFixed(3),
        String(p.percent?.positive ?? 0),
        String(p.percent?.neutral ?? 0),
        String(p.percent?.negative ?? 0),
        String(p.totalWords ?? 0),
        String(p.uniqueWords ?? 0),
        (p.avgWordsPerMsg ?? 0).toFixed(1),
      ]),
      styles: { font: "helvetica", fontSize: 9 },
      headStyles: { fillColor: [20, 20, 20] },
      theme: "grid",
      margin: { left: 40, right: 40 },
    });

    doc.save(`whatsapp-stats_${input.from ?? "from"}_${input.to ?? "to"}.pdf`);
  };

  return (
    <button
      onClick={downloadPdfReport}
      style={{
        padding: "10px 12px",
        borderRadius: 12,
        border: "1px solid rgba(255,255,255,0.12)",
        background: "rgba(255,255,255,0.04)",
        color: "white",
        fontWeight: 800,
        cursor: "pointer",
      }}
      title="Descargar resultados en PDF"
    >
      Descargar PDF
    </button>
  );
};

export default PdfExporter;