import React, { useMemo, useState } from "react";
import { extractChatTxtFromZip, buildStatsFromChatText, clamp, fmt, downloadPdfReport } from "./utils/helpers";
import "./styles/global.css";

import Header from "./components/Header/Header";
import ZipUploader from "./components/Upload/ZipUploader";
import KPIs from "./components/KPIs/KPIs";
import OverviewChart from "./components/Overview/OverviewChart";
import ParticipantsList from "./components/Participants/ParticipantsList";
import DetailPanel from "./components/Detail/DetailPanel";

import useResponsive from "./hooks/useResponsive";


// App
export default function App(){
  const [zipName, setZipName] = useState("");
  const [chatFileName, setChatFileName] = useState("");
  const [from, setFrom] = useState("2025-01-01");
  const [to, setTo] = useState("2025-12-01");
  const [authorsCsv, setAuthorsCsv] = useState("");
  const [data, setData] = useState(null);
  const [selected, setSelected] = useState(null);
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("messages");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const screen = useResponsive();

  async function onZipUpload(e){
    setError("");
    const file = e.target.files?.[0];
    if(!file) return;
    setBusy(true); setZipName(file.name); setChatFileName(""); setData(null); setSelected(null);
    try{
      const { name, text } = await extractChatTxtFromZip(file);
      setChatFileName(name);
      const stats = buildStatsFromChatText(text, { from, to, authorsCsv });
      setData(stats);
    }catch(err){
      setError(String(err?.message || err));
    }finally{ setBusy(false); }
  }

  const participants = useMemo(()=>{
    if(!data?.participants) return [];
    let list = [...data.participants];
    if(query.trim()){
      const q = query.trim().toLowerCase();
      list = list.filter((p)=> (p.author||"").toLowerCase().includes(q));
    }
    if(sortBy === "avg") list.sort((a,b)=>(b.sentimentAvg ?? 0) - (a.sentimentAvg ?? 0));
    else list.sort((a,b)=>(b.messagesAnalyzed ?? 0) - (a.messagesAnalyzed ?? 0));
    return list;
  }, [data, query, sortBy]);

  const totals = data?.totals ?? {};
  const input = data?.input ?? {};
  const global = data?.global ?? {};

  const overviewBars = useMemo(()=> participants.slice(0,12).map(p=>({ name:p.author, msgs:p.messagesAnalyzed ?? 0 })), [participants]);
  const pie = useMemo(()=> selected ? [{ name:"Positivo", value: selected.positive ?? 0 }, { name:"Neutral", value: selected.neutral ?? 0 }, { name:"Negativo", value: selected.negative ?? 0 }] : null, [selected]);
  const topWordsBar = useMemo(()=> selected?.topWords ? selected.topWords.map(w=>({ word:w.word, count:w.count })) : [], [selected]);

  const yAxisWidth = useMemo(()=>{
    const maxLen = Math.max(0, ...(topWordsBar.map(x=> (x.word?.length ?? 0))));
    return clamp(20 + maxLen * 7, 90, 200);
  }, [topWordsBar]);

  const truncateWord = (w) => (w.length > 18 ? w.slice(0,18) + "…" : w);

  return (
    <div className="app-root">
      <div className="app-inner">
        <Header
          title="WhatsApp Stats Dashboard"
          input={input}
          totals={totals}
          zipName={zipName}
          chatFileName={chatFileName}
          rightControls={
            <ZipUploader
              from={from} to={to} authorsCsv={authorsCsv}
              setFrom={setFrom} setTo={setTo} setAuthorsCsv={setAuthorsCsv}
              onZipChange={onZipUpload}
              busy={busy}
              onDownloadPdf={()=> data && downloadPdfReport(data)}
              pdfDisabled={!data}
            />
          }
        />

        {error && <div className="error-box">{error}</div>}

        <KPIs totals={totals} global={global} />

        <div className="grid-two">
          <OverviewChart data={overviewBars} />

          <div className="panel participants-panel">
            <div className="panel-inner">
              <div className="panel-title">Participantes</div>

              <input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Buscar por nombre…" className="input-search" />

              <div className="segmented">
                <button onClick={()=>setSortBy("messages")} className={`seg-btn ${sortBy==="messages"?"active":""}`}>Orden: mensajes</button>
                <button onClick={()=>setSortBy("avg")} className={`seg-btn ${sortBy==="avg"?"active":""}`}>Orden: sentimiento</button>
              </div>

              <div className="participants-list-wrap">
                <ParticipantsList participants={participants} selectedAuthor={selected?.author} onSelect={setSelected} />
              </div>
            </div>
          </div>
        </div>

        {data && (
          <div className="topwords">
            <div className="panel-inner card">
              <div className="panel-title">Top 10 palabras (global)</div>
              <div className="chips">
                {(global.topWords ?? []).map(w=>(
                  <span key={w.word} title={`${w.word}: ${w.count}`} className="chip">
                    {w.word} · {w.count}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="detail-section">
          <div className="panel-inner card">
            <div className="detail-header">
              <div className="panel-title">Detalle</div>
              <div className="selected-txt">{selected ? `Seleccionado: ${selected.author}` : "Selecciona un participante"}</div>
            </div>

            <div style={{ marginTop:14 }}>
              <DetailPanel selected={selected} topWordsBar={topWordsBar} pie={pie} yAxisWidth={yAxisWidth} truncateWord={truncateWord} />
            </div>
          </div>
        </div>

        <footer className="app-footer">
          Nota: el análisis de sentimiento es aproximado (la librería está muy orientada a inglés), pero sirve como métrica comparativa.
        </footer>
      </div>
    </div>
  );
}
