import React from "react";
import "./ZipUploader.css";

export default function ZipUploader({
  from,
  to,
  authorsCsv,
  setFrom,
  setTo,
  setAuthorsCsv,
  onZipChange,
  busy,
  onDownloadPdf,
  pdfDisabled,
}) {
  return (
    <div className="uploader">
      <input
        className="input-field"
        value={from}
        onChange={(e) => setFrom(e.target.value)}
        placeholder="from YYYY-MM-DD"
      />
      <input
        className="input-field"
        value={to}
        onChange={(e) => setTo(e.target.value)}
        placeholder="to YYYY-MM-DD"
      />
      <input
        className="input-field authors"
        value={authorsCsv}
        onChange={(e) => setAuthorsCsv(e.target.value)}
        placeholder='Autores (opcional): "A,B,C"'
      />

      <label className="btn-upload">
        {busy ? "Analizando..." : "Subir ZIP"}
        <input
          type="file"
          accept=".zip,application/zip"
          onChange={onZipChange}
          style={{ display: "none" }}
        />
      </label>

      <button
        className="btn"
        disabled={pdfDisabled}
        onClick={onDownloadPdf}
        title="Descargar resultados en PDF"
      >
        Descargar PDF
      </button>
    </div>
  );
}
