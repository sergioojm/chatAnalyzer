import JSZip from "jszip";
import { parseString } from "whatsapp-chat-parser";
import Sentiment from "sentiment";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const sentiment = new Sentiment();

export function fmt(n, digits = 0) {
  if (typeof n !== "number" || Number.isNaN(n)) return "-";
  return n.toLocaleString(undefined, { maximumFractionDigits: digits });
}
export function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }
export function parseISODateLocal(dateStr, endOfDay = false) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return null;
  const t = endOfDay ? "T23:59:59.999" : "T00:00:00.000";
  const d = new Date(dateStr + t);
  return Number.isNaN(d.getTime()) ? null : d;
}
export function tokenize(text) {
  const noUrls = (text || "").replace(/https?:\/\/\S+/gi, " ");
  const tokens = noUrls.match(/[\p{L}\p{N}']+/gu) ?? [];
  return tokens.map((t) => t.toLowerCase());
}
const STOPWORDS = new Set([ "de","la","que","el","en","y","a","los","del","se","las","por","un","para","con","no","una","su","al","lo","como","más","pero","sus","le","ya","o","este","sí","porque","esta","entre","cuando","muy","sin","sobre","también","me","hasta","hay","donde","quien","desde","todo","nos","durante","todos","uno","les","ni","contra","otros","ese","eso","ante","ellos","e","esto","mí","antes","algunos","qué","unos","yo","otro","otras","otra","él","tú","te","tu","the","a","an","and","or","to","of","in","on","for","with","is","are","was","were","be","been","i","you","he","she","it","we","they","me","my","your","yours","his","her","their","our" ]);
export function isUsefulWord(w){ if(!w) return false; if(w.length<2) return false; if(STOPWORDS.has(w)) return false; if(/^\d+$/.test(w)) return false; return true; }
export function addCount(map, key, inc = 1){ map.set(key, (map.get(key) ?? 0) + inc); }
export function topNFromMap(map, n){ return [...map.entries()].sort((a,b)=>b[1]-a[1]).slice(0,n).map(([word,count])=>({word,count})); }
export function pct(part, total){ if(!total) return 0; return Math.round((part/total)*1000)/10; }

export async function extractChatTxtFromZip(file){
  const zip = await JSZip.loadAsync(file);
  const entries = Object.values(zip.files);
  const candidates = entries.filter((f)=>!f.dir && /\.txt$/i.test(f.name));
  const best = candidates.find((f)=>/_chat\.txt$/i.test(f.name)) || candidates.find((f)=>/chat\.txt$/i.test(f.name)) || candidates[0];
  if(!best) throw new Error("No se encontró ningún .txt dentro del zip.");
  const text = await best.async("string");
  return { name: best.name, text };
}

export function computeExtraGlobalStats(selectedMsgs){
  const hourCount = new Map(); const weekdayCount = new Map(); const dayCount = new Map();
  let minDate=null, maxDate=null;
  for(const m of selectedMsgs){
    const d = new Date(m.date);
    if(!minDate || d < minDate) minDate = d;
    if(!maxDate || d > maxDate) maxDate = d;
    addCount(hourCount, d.getHours(), 1);
    addCount(weekdayCount, d.getDay(), 1);
    addCount(dayCount, d.toISOString().slice(0,10), 1);
  }
  const topHour = [...hourCount.entries()].sort((a,b)=>b[1]-a[1])[0] ?? [null,0];
  const topWeekday = [...weekdayCount.entries()].sort((a,b)=>b[1]-a[1])[0] ?? [null,0];
  const avgPerDay = dayCount.size ? selectedMsgs.length / dayCount.size : 0;
  const weekdayName = (n)=>["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"][n] ?? "-";
  return {
    range:{ firstMessageAt: minDate?minDate.toISOString():null, lastMessageAt: maxDate?maxDate.toISOString():null },
    busiest:{ hour: topHour[0], hourMessages: topHour[1], weekday: topWeekday[0], weekdayName: topWeekday[0] != null ? weekdayName(topWeekday[0]) : "-", weekdayMessages: topWeekday[1] },
    messagesPerDay:{ uniqueDays: dayCount.size, avgPerDay }
  };
}

export function buildStatsFromChatText(chatText, { from, to, authorsCsv }){
  const startDate = parseISODateLocal(from, false);
  const endDate = parseISODateLocal(to, true);
  if(!startDate || !endDate) throw new Error("Fechas inválidas (usa YYYY-MM-DD).");
  if(startDate > endDate) throw new Error("Rango inválido: from > to.");
  const authorsFilter = authorsCsv?.trim() ? new Set(authorsCsv.split(",").map(s=>s.trim()).filter(Boolean)) : null;

  const messages = parseString(chatText);
  const selected = messages.filter((m)=>m && m.date && m.author && typeof m.message === "string")
    .filter((m)=>{ const d = new Date(m.date); return d >= startDate && d <= endDate; })
    .filter((m)=> (!authorsFilter ? true : authorsFilter.has(m.author)))
    .filter((m)=>{ const t = m.message.trim(); if(!t) return false; if(t === "<Media omitted>") return false; return true; });

  const byAuthor = new Map(); const globalWordFreq = new Map(); let globalWords = 0;
  for(const m of selected){
    const author = m.author;
    if(!byAuthor.has(author)){
      byAuthor.set(author, {
        author, messagesAnalyzed:0, sentimentSum:0, sentimentAvg:0, positive:0, negative:0, neutral:0,
        wordFreq:new Map(), topWords:[], percent:{ positive:0, negative:0, neutral:0 }, totalWords:0, uniqueWords:0, avgWordsPerMsg:0
      });
    }
    const s = byAuthor.get(author);
    s.messagesAnalyzed++;
    const res = sentiment.analyze(m.message);
    const score = typeof res?.score === "number" ? res.score : 0;
    s.sentimentSum += score;
    if (score > 0) s.positive++; else if(score < 0) s.negative++; else s.neutral++;
    for(const w of tokenize(m.message)){
      if(!isUsefulWord(w)) continue;
      addCount(s.wordFreq, w, 1);
      addCount(globalWordFreq, w, 1);
      s.totalWords++; globalWords++;
    }
  }

  const globalExtras = computeExtraGlobalStats(selected);
  const result = {
    input: { from, to, authors: authorsFilter ? [...authorsFilter] : null },
    totals: { totalMessagesParsed: messages.length, totalMessagesSelected: selected.length, totalParticipantsSelected: byAuthor.size, totalWordsSelected: globalWords },
    global: { topWords: topNFromMap(globalWordFreq, 10), ...globalExtras },
    participants: []
  };

  for(const s of byAuthor.values()){
    s.sentimentAvg = s.messagesAnalyzed ? s.sentimentSum / s.messagesAnalyzed : 0;
    s.topWords = topNFromMap(s.wordFreq, 10);
    s.uniqueWords = s.wordFreq.size;
    s.avgWordsPerMsg = s.messagesAnalyzed ? s.totalWords / s.messagesAnalyzed : 0;
    s.percent = { positive: pct(s.positive, s.messagesAnalyzed), negative: pct(s.negative, s.messagesAnalyzed), neutral: pct(s.neutral, s.messagesAnalyzed) };
    delete s.wordFreq;
    result.participants.push(s);
  }

  result.participants.sort((a,b)=>(b.messagesAnalyzed ?? 0) - (a.messagesAnalyzed ?? 0));
  return result;
}

export function downloadPdfReport(stats){
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  doc.setFont("helvetica","bold"); doc.setFontSize(16);
  doc.text("WhatsApp Stats Report", 40, 48);
  doc.setFont("helvetica","normal"); doc.setFontSize(11);
  const input = stats?.input ?? {}; const totals = stats?.totals ?? {}; const global = stats?.global ?? {};
  doc.text(`Rango: ${input.from ?? "-"} → ${input.to ?? "-"}`, 40, 70);
  doc.text(`Mensajes analizados: ${fmt(totals.totalMessagesSelected ?? 0)} | Participantes: ${fmt(totals.totalParticipantsSelected ?? 0)}`, 40, 86);
  doc.text(`Palabras analizadas: ${fmt(totals.totalWordsSelected ?? 0)}`, 40, 102);
  if(global?.busiest?.hour != null){
    doc.text(`Hora más activa: ${String(global.busiest.hour).padStart(2,"0")}:00 (${fmt(global.busiest.hourMessages)} msgs)`, 40, 118);
  }
  if(global?.busiest?.weekdayName){
    doc.text(`Día más activo: ${global.busiest.weekdayName} (${fmt(global.busiest.weekdayMessages)} msgs)`, 40, 134);
  }
  autoTable(doc, {
    startY: 155,
    head:[["Top 10 palabras (global)","Count"]],
    body:(global.topWords ?? []).map(x=>[x.word,String(x.count)]),
    styles:{ font:"helvetica", fontSize:10 },
    headStyles:{ fillColor:[20,20,20] }, theme:"striped", margin:{ left:40, right:40 }
  });
  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 18,
    head:[["Participante","Mensajes","Sent. media","Pos%","Neu%","Neg%","Palabras","Únicas","Pal/msg"]],
    body:(stats.participants ?? []).map(p=>[ p.author, String(p.messagesAnalyzed ?? 0), (p.sentimentAvg ?? 0).toFixed(3), String(p.percent?.positive ?? 0), String(p.percent?.neutral ?? 0), String(p.percent?.negative ?? 0), String(p.totalWords ?? 0), String(p.uniqueWords ?? 0), (p.avgWordsPerMsg ?? 0).toFixed(1) ]),
    styles:{ font:"helvetica", fontSize:9 }, headStyles:{ fillColor:[20,20,20] }, theme:"grid", margin:{ left:40, right:40 }
  });
  doc.save(`whatsapp-stats_${input.from ?? "from"}_${input.to ?? "to"}.pdf`);
}