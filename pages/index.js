import { useState } from "react";

const PHILOSOPHERS = [
  {
    id: "ackman",
    name: "Bill Ackman",
    fund: "Pershing Square",
    avatar: "BA",
    color: "#1a3a5c",
    accent: "#c8a84b",
    tagline: "Concentrated, high-conviction, activist",
  },
  {
    id: "dalio",
    name: "Ray Dalio",
    fund: "Bridgewater Associates",
    avatar: "RD",
    color: "#2d4a1e",
    accent: "#7ab648",
    tagline: "Macro, all-weather, principle-driven",
  },
  {
    id: "hohn",
    name: "Chris Hohn",
    fund: "TCI Fund Management",
    avatar: "CH",
    color: "#3a1a4a",
    accent: "#b084cc",
    tagline: "Long-term, activist, ESG-integrated",
  },
  {
    id: "lynch",
    name: "Peter Lynch",
    fund: "Fidelity Magellan",
    avatar: "PL",
    color: "#4a2a1a",
    accent: "#e07840",
    tagline: "Growth at reasonable price, invest in what you know",
  },
  {
    id: "buffett",
    name: "Warren Buffett",
    fund: "Berkshire Hathaway",
    avatar: "WB",
    color: "#1a1a3a",
    accent: "#4a90d9",
    tagline: "Wonderful company, fair price, forever hold",
  },
  {
    id: "stephena",
    name: "Stephen A",
    fund: "Global Income",
    avatar: "SA",
    color: "#4a1a2e",
    accent: "#d98aa8",
    tagline: "Underappreciated growth, all-weather, quietly different",
  },
  {
    id: "wood",
    name: "Cathie Wood",
    fund: "ARK Invest",
    avatar: "CW",
    color: "#1a3a3a",
    accent: "#00bcd4",
    tagline: "Disruptive innovation, 5-year horizon",
  }
];

const verdictColors = {
  "STRONG BUY": "#22c55e",
  "BUY": "#86efac",
  "PASS": "#fbbf24",
  "AVOID": "#ef4444"
};

function extractVerdict(text) {
  const match = text.match(/\b(STRONG BUY|BUY|PASS|AVOID)\b/);
  return match ? match[1] : null;
}

export default function InvestmentPhilosopher() {
  const [ticker, setTicker] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [selectedPhilosophers, setSelectedPhilosophers] = useState(["ackman", "dalio", "hohn"]);
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState({});
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(null);
  const [hasRun, setHasRun] = useState(false);
  const [researching, setResearching] = useState(false);
  const [researchData, setResearchData] = useState(null);
  const [researchFailed, setResearchFailed] = useState(false);

  const togglePhilosopher = (id) => {
    setSelectedPhilosophers(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const analyseStock = async () => {
    if (!ticker.trim()) return;
    setResults({});
    setError(null);
    setHasRun(true);
    setResearchData(null);
    setResearchFailed(false);

    const selected = PHILOSOPHERS.filter(p => selectedPhilosophers.includes(p.id));
    const firstId = selected[0]?.id;
    setActiveTab(firstId);

    // STAGE 1: one shared research call gathers current market data.
    // Every philosopher then reasons from the same fact sheet.
    setResearching(true);
    let research = null;
    try {
      const r = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticker: ticker.toUpperCase(), companyName })
      });
      if (r.ok) {
        const d = await r.json();
        research = d.research || null;
      }
    } catch (e) {
      // fall through — analyses still run, just without live data
    }
    setResearching(false);
    setResearchData(research);
    if (!research) setResearchFailed(true);

    // STAGE 2: the philosopher analyses, in parallel, sharing the fact sheet.
    const loadingState = {};
    selected.forEach(p => loadingState[p.id] = true);
    setLoading(loadingState);

    await Promise.all(selected.map(async (philosopher) => {
      try {
        const response = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ticker: ticker.toUpperCase(),
            companyName,
            philosopherId: philosopher.id,
            research
          })
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        setResults(prev => ({ ...prev, [philosopher.id]: data.analysis }));
      } catch (e) {
        setResults(prev => ({ ...prev, [philosopher.id]: `Error: ${e.message}` }));
      } finally {
        setLoading(prev => ({ ...prev, [philosopher.id]: false }));
      }
    }));
  };

  const activePhilosopher = PHILOSOPHERS.find(p => p.id === activeTab);
  const selectedList = PHILOSOPHERS.filter(p => selectedPhilosophers.includes(p.id));

  const formatResult = (text) => {
    return text.split('\n').map((line, i) => {
      if (/^\d+\.\s/.test(line) || /^#{1,3}\s/.test(line) || line.trim().startsWith('**')) {
        const cleaned = line.replace(/^#{1,3}\s/, '').replace(/\*\*/g, '');
        return <p key={i} style={{ fontWeight: 700, marginTop: 16, marginBottom: 4, color: "#e8e0d0" }}>{cleaned}</p>;
      }
      if (line.trim() === '') return <div key={i} style={{ height: 8 }} />;
      return <p key={i} style={{ margin: "3px 0", color: "#c8c0b0", lineHeight: 1.65 }}>{line}</p>;
    });
  };

  // Dark-text version of formatResult for the print/PDF view (white background)
  const formatResultForPrint = (text) => {
    return text.split('\n').map((line, i) => {
      if (/^\d+\.\s/.test(line) || /^#{1,3}\s/.test(line) || line.trim().startsWith('**')) {
        const cleaned = line.replace(/^#{1,3}\s/, '').replace(/\*\*/g, '');
        return <p key={i} style={{ fontWeight: 700, marginTop: 14, marginBottom: 3, color: "#111" }}>{cleaned}</p>;
      }
      if (line.trim() === '') return <div key={i} style={{ height: 6 }} />;
      return <p key={i} style={{ margin: "3px 0", color: "#222", lineHeight: 1.6 }}>{line}</p>;
    });
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") window.print();
  };

  // Investors that actually have a completed (non-error) analysis, for the printout
  const completedList = selectedList.filter(
    p => results[p.id] && !loading[p.id] && !results[p.id].startsWith("Error:")
  );

  return (
    <div className="app-root" style={{
      minHeight: "100vh",
      background: "#0d0d0d",
      fontFamily: "'Georgia', serif",
      color: "#e8e0d0",
      padding: "32px 24px"
    }}>
      <style>{`
        /* Print-only content is hidden on screen */
        .print-only { display: none; }

        @media print {
          /* Hide interactive UI when printing */
          .no-print { display: none !important; }

          /* Reveal and reset the print view */
          .print-only { display: block !important; }

          /* Force a clean white page regardless of the dark theme */
          html, body {
            background: #fff !important;
            color: #111 !important;
          }
          /* Neutralise the dark page wrapper so colours print correctly */
          .app-root {
            background: #fff !important;
            color: #111 !important;
            padding: 0 !important;
            min-height: 0 !important;
          }
          .app-inner {
            max-width: none !important;
            margin: 0 !important;
          }

          /* Keep each investor's analysis together across page breaks */
          .print-investor {
            break-inside: avoid;
            page-break-inside: avoid;
          }
          .print-verdicts { break-inside: avoid; page-break-inside: avoid; }
          .print-header { break-after: avoid; }

          /* Ensure backgrounds/borders render */
          * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>
      <div style={{ maxWidth: 900, margin: "0 auto" }} className="app-inner">
        <div className="no-print" style={{ marginBottom: 8, fontSize: 11, letterSpacing: 4, color: "#666", textTransform: "uppercase" }}>
          Investment Analysis
        </div>
        <h1 className="no-print" style={{
          fontSize: "clamp(28px, 5vw, 48px)",
          fontWeight: 400,
          margin: "0 0 8px",
          letterSpacing: -1,
          color: "#f0e8d8"
        }}>
          The Philosopher's Table
        </h1>
        <p className="no-print" style={{ color: "#888", fontSize: 15, margin: "0 0 40px", fontStyle: "italic" }}>
          One stock, six legendary lenses
        </p>

        <div className="no-print" style={{
          background: "#161616",
          border: "1px solid #2a2a2a",
          borderRadius: 12,
          padding: "28px 32px",
          marginBottom: 32
        }}>
          <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
            <div style={{ flex: "0 0 140px" }}>
              <label style={{ display: "block", fontSize: 11, letterSpacing: 2, color: "#666", textTransform: "uppercase", marginBottom: 8 }}>
                Ticker
              </label>
              <input
                value={ticker}
                onChange={e => setTicker(e.target.value.toUpperCase())}
                placeholder="e.g. MSFT"
                onKeyDown={e => e.key === "Enter" && analyseStock()}
                style={{
                  width: "100%",
                  background: "#0d0d0d",
                  border: "1px solid #333",
                  borderRadius: 6,
                  padding: "10px 14px",
                  color: "#f0e8d8",
                  fontSize: 18,
                  fontFamily: "'Georgia', serif",
                  fontWeight: 700,
                  letterSpacing: 2,
                  outline: "none",
                  boxSizing: "border-box"
                }}
              />
            </div>
            <div style={{ flex: 1, minWidth: 180 }}>
              <label style={{ display: "block", fontSize: 11, letterSpacing: 2, color: "#666", textTransform: "uppercase", marginBottom: 8 }}>
                Company Name (optional)
              </label>
              <input
                value={companyName}
                onChange={e => setCompanyName(e.target.value)}
                placeholder="e.g. Microsoft Corporation"
                onKeyDown={e => e.key === "Enter" && analyseStock()}
                style={{
                  width: "100%",
                  background: "#0d0d0d",
                  border: "1px solid #333",
                  borderRadius: 6,
                  padding: "10px 14px",
                  color: "#f0e8d8",
                  fontSize: 15,
                  fontFamily: "'Georgia', serif",
                  outline: "none",
                  boxSizing: "border-box"
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: "block", fontSize: 11, letterSpacing: 2, color: "#666", textTransform: "uppercase", marginBottom: 12 }}>
              Choose your investors
            </label>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {PHILOSOPHERS.map(p => {
                const sel = selectedPhilosophers.includes(p.id);
                return (
                  <button
                    key={p.id}
                    onClick={() => togglePhilosopher(p.id)}
                    style={{
                      background: sel ? p.color : "#1a1a1a",
                      border: `1px solid ${sel ? p.accent : "#2a2a2a"}`,
                      borderRadius: 8,
                      padding: "8px 14px",
                      color: sel ? p.accent : "#666",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      fontSize: 13,
                      fontFamily: "'Georgia', serif",
                      transition: "all 0.15s"
                    }}
                  >
                    <span style={{
                      width: 26, height: 26, borderRadius: "50%",
                      background: sel ? p.accent : "#333",
                      color: sel ? p.color : "#666",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 9, fontWeight: 700, letterSpacing: 0.5, flexShrink: 0
                    }}>
                      {p.avatar}
                    </span>
                    {p.name}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            onClick={analyseStock}
            disabled={!ticker.trim() || selectedPhilosophers.length === 0 || researching}
            style={{
              background: ticker.trim() && selectedPhilosophers.length > 0 ? "#c8a84b" : "#2a2a2a",
              color: ticker.trim() && selectedPhilosophers.length > 0 ? "#0d0d0d" : "#444",
              border: "none",
              borderRadius: 8,
              padding: "12px 32px",
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: 2,
              textTransform: "uppercase",
              cursor: ticker.trim() && selectedPhilosophers.length > 0 ? "pointer" : "not-allowed",
              fontFamily: "'Georgia', serif"
            }}
          >
            Convene the Table →
          </button>
        </div>

        {hasRun && selectedList.length > 0 && (
          <div>
            {researching && (
              <div className="no-print" style={{
                background: "#161616",
                border: "1px solid #2a2a2a",
                borderRadius: 8,
                padding: "14px 18px",
                marginBottom: 24,
                display: "flex",
                alignItems: "center",
                gap: 12,
                color: "#c8a84b",
                fontSize: 13
              }}>
                <span style={{ fontSize: 18 }}>⟳</span>
                Gathering current market data for {ticker.toUpperCase()}…
              </div>
            )}

            {researchData && (
              <details className="no-print" style={{
                background: "#161616",
                border: "1px solid #2a2a2a",
                borderRadius: 8,
                padding: "12px 18px",
                marginBottom: 24
              }}>
                <summary style={{
                  cursor: "pointer",
                  color: "#c8a84b",
                  fontSize: 12,
                  letterSpacing: 1,
                  textTransform: "uppercase"
                }}>
                  ▸ Market data used in this analysis (live, gathered just now)
                </summary>
                <div style={{
                  marginTop: 12,
                  fontSize: 13,
                  color: "#c8c0b0",
                  lineHeight: 1.6,
                  whiteSpace: "pre-wrap"
                }}>
                  {researchData}
                </div>
              </details>
            )}

            {researchFailed && !researching && (
              <div className="no-print" style={{
                background: "#161616",
                border: "1px solid #4a3a1a",
                borderRadius: 8,
                padding: "12px 18px",
                marginBottom: 24,
                color: "#a89060",
                fontSize: 12,
                lineHeight: 1.6
              }}>
                ⚠ Live market data was unavailable — these analyses rely on the model's
                built-in knowledge, so figures may be out of date.
              </div>
            )}
            {selectedList.some(p => results[p.id]) && (
              <div className="no-print" style={{
                display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24, alignItems: "center"
              }}>
                {selectedList.map(p => {
                  const result = results[p.id];
                  const verdict = result ? extractVerdict(result) : null;
                  return (
                    <div key={p.id} style={{
                      background: "#161616",
                      border: `1px solid ${verdict ? verdictColors[verdict] + "55" : "#2a2a2a"}`,
                      borderRadius: 8,
                      padding: "8px 14px",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      opacity: loading[p.id] ? 0.5 : 1
                    }}>
                      <span style={{ fontSize: 11, color: "#666" }}>{p.name}</span>
                      {loading[p.id] ? (
                        <span style={{ fontSize: 11, color: "#555", fontStyle: "italic" }}>analysing…</span>
                      ) : verdict ? (
                        <span style={{
                          fontSize: 11,
                          fontWeight: 700,
                          letterSpacing: 1,
                          color: verdictColors[verdict]
                        }}>{verdict}</span>
                      ) : null}
                    </div>
                  );
                })}
                {completedList.length > 0 && (
                  <button
                    onClick={handlePrint}
                    title="Print or save all analyses as a PDF"
                    style={{
                      marginLeft: "auto",
                      background: "#c8a84b",
                      color: "#0d0d0d",
                      border: "none",
                      borderRadius: 8,
                      padding: "8px 16px",
                      fontSize: 12,
                      fontWeight: 700,
                      letterSpacing: 1,
                      textTransform: "uppercase",
                      cursor: "pointer",
                      fontFamily: "'Georgia', serif"
                    }}
                  >
                    ⎙ Print / Save PDF
                  </button>
                )}
              </div>
            )}

            <div className="no-print" style={{ display: "flex", gap: 2, marginBottom: 0, overflowX: "auto" }}>
              {selectedList.map(p => {
                const isActive = activeTab === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => setActiveTab(p.id)}
                    style={{
                      background: isActive ? p.color : "#111",
                      border: `1px solid ${isActive ? p.accent : "#222"}`,
                      borderBottom: isActive ? `1px solid ${p.color}` : "1px solid #222",
                      borderRadius: "8px 8px 0 0",
                      padding: "10px 20px",
                      color: isActive ? p.accent : "#555",
                      cursor: "pointer",
                      fontSize: 13,
                      fontFamily: "'Georgia', serif",
                      whiteSpace: "nowrap",
                      position: "relative",
                      zIndex: isActive ? 2 : 1
                    }}
                  >
                    <span style={{ marginRight: 6, fontSize: 10, fontWeight: 700 }}>{p.avatar}</span>
                    {p.name}
                    {loading[p.id] && <span style={{ marginLeft: 8, fontSize: 10, opacity: 0.7 }}>●</span>}
                  </button>
                );
              })}
            </div>

            {activePhilosopher && selectedPhilosophers.includes(activePhilosopher.id) && (
              <div className="no-print" style={{
                background: activePhilosopher.color + "22",
                border: `1px solid ${activePhilosopher.accent}44`,
                borderRadius: "0 8px 8px 8px",
                padding: "28px 32px",
                minHeight: 300
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                  <div>
                    <div style={{ fontSize: 11, letterSpacing: 3, color: activePhilosopher.accent, textTransform: "uppercase", marginBottom: 4 }}>
                      {activePhilosopher.fund}
                    </div>
                    <div style={{ fontSize: 20, color: "#f0e8d8" }}>{activePhilosopher.name}</div>
                    <div style={{ fontSize: 13, color: "#777", fontStyle: "italic", marginTop: 2 }}>{activePhilosopher.tagline}</div>
                  </div>
                  {results[activePhilosopher.id] && (() => {
                    const v = extractVerdict(results[activePhilosopher.id]);
                    return v ? (
                      <div style={{
                        background: verdictColors[v] + "22",
                        border: `1px solid ${verdictColors[v]}`,
                        borderRadius: 8,
                        padding: "8px 18px",
                        color: verdictColors[v],
                        fontSize: 14,
                        fontWeight: 700,
                        letterSpacing: 2
                      }}>{v}</div>
                    ) : null;
                  })()}
                </div>

                <div style={{ borderTop: `1px solid ${activePhilosopher.accent}22`, paddingTop: 20 }}>
                  {loading[activePhilosopher.id] ? (
                    <div style={{ textAlign: "center", padding: "60px 0", color: "#555" }}>
                      <div style={{ fontSize: 28, marginBottom: 16 }}>⟳</div>
                      <div style={{ fontSize: 13, letterSpacing: 2, textTransform: "uppercase" }}>
                        {activePhilosopher.name} is deliberating…
                      </div>
                    </div>
                  ) : results[activePhilosopher.id] ? (
                    <div style={{ fontSize: 14.5, lineHeight: 1.7 }}>
                      {formatResult(results[activePhilosopher.id])}
                    </div>
                  ) : (
                    <div style={{ color: "#444", fontStyle: "italic", textAlign: "center", padding: "40px 0" }}>
                      Awaiting analysis…
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* PRINT-ONLY VIEW: all completed analyses stacked, dark text on white */}
            {completedList.length > 0 && (
              <div className="print-only">
                <div className="print-header">
                  <h1 style={{ fontSize: 24, margin: "0 0 4px", color: "#111" }}>
                    The Philosopher's Table
                  </h1>
                  <div style={{ fontSize: 15, color: "#333", marginBottom: 2 }}>
                    Investment analysis for <strong>{ticker.toUpperCase()}</strong>
                    {companyName ? ` (${companyName})` : ""}
                  </div>
                  <div style={{ fontSize: 12, color: "#666" }}>
                    Generated {new Date().toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
                  </div>
                </div>

                {/* Verdict summary table */}
                <table className="print-verdicts" style={{ width: "100%", borderCollapse: "collapse", margin: "16px 0 24px" }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: "left", borderBottom: "2px solid #111", padding: "6px 8px", fontSize: 12, textTransform: "uppercase", letterSpacing: 1 }}>Investor</th>
                      <th style={{ textAlign: "left", borderBottom: "2px solid #111", padding: "6px 8px", fontSize: 12, textTransform: "uppercase", letterSpacing: 1 }}>Approach</th>
                      <th style={{ textAlign: "left", borderBottom: "2px solid #111", padding: "6px 8px", fontSize: 12, textTransform: "uppercase", letterSpacing: 1 }}>Verdict</th>
                    </tr>
                  </thead>
                  <tbody>
                    {completedList.map(p => {
                      const v = extractVerdict(results[p.id]);
                      return (
                        <tr key={p.id}>
                          <td style={{ padding: "6px 8px", borderBottom: "1px solid #ccc", fontSize: 13, fontWeight: 700, color: "#111" }}>{p.name}</td>
                          <td style={{ padding: "6px 8px", borderBottom: "1px solid #ccc", fontSize: 12, color: "#444" }}>{p.tagline}</td>
                          <td style={{ padding: "6px 8px", borderBottom: "1px solid #ccc", fontSize: 13, fontWeight: 700, color: "#111" }}>{v || "—"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {/* Market data basis */}
                {researchData && (
                  <div style={{ marginBottom: 24, breakInside: "avoid", pageBreakInside: "avoid" }}>
                    <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, borderBottom: "1px solid #111", paddingBottom: 4, marginBottom: 8, color: "#111" }}>
                      Market data used (gathered via live web search)
                    </div>
                    <div style={{ fontSize: 11, color: "#333", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>
                      {researchData}
                    </div>
                  </div>
                )}

                {/* Full detail for each investor */}
                {completedList.map(p => {
                  const v = extractVerdict(results[p.id]);
                  return (
                    <div key={p.id} className="print-investor" style={{ marginBottom: 28 }}>
                      <div style={{ borderBottom: "2px solid #111", paddingBottom: 6, marginBottom: 10 }}>
                        <div style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: "#666" }}>{p.fund}</div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                          <span style={{ fontSize: 19, fontWeight: 700, color: "#111" }}>{p.name}</span>
                          {v && <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: 1, color: "#111" }}>{v}</span>}
                        </div>
                        <div style={{ fontSize: 12, fontStyle: "italic", color: "#555" }}>{p.tagline}</div>
                      </div>
                      <div style={{ fontSize: 13 }}>
                        {formatResultForPrint(results[p.id])}
                      </div>
                    </div>
                  );
                })}

                <div style={{ marginTop: 24, paddingTop: 12, borderTop: "1px solid #ccc", fontSize: 10, color: "#666" }}>
                  For illustrative purposes only. Not financial advice. AI-generated assessments based on publicly known investor philosophies.
                </div>
              </div>
            )}
          </div>
        )}

        <div className="no-print" style={{ marginTop: 40, fontSize: 11, color: "#333", textAlign: "center", lineHeight: 1.6 }}>
          For illustrative purposes only. Not financial advice. AI-generated assessments based on publicly known investor philosophies.
        </div>
      </div>
    </div>
  );
}
