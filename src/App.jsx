import { useState, useRef, useEffect } from "react";

// ─── FICTIONAL HOTEL KNOWLEDGE BASE ───────────────────────────────────────────
const HOTEL_KNOWLEDGE = `
You are "Mia", a warm and elegant AI concierge for Villa Jadran — a boutique guesthouse on the island of Brač, Croatia.
Respond ONLY based on the information below. If unsure, say you'll check with the team.
Never make up prices or availability — if asked about specific dates, say you'll forward the request to reception.
Always be warm, friendly, and slightly poetic when describing the property. Keep answers concise (max 4 sentences unless listing items).
ALWAYS detect the language the user writes in and respond in that EXACT same language.
Sign messages warmly — never robotic.

═══ PROPERTY INFO ═══
Name: Villa Jadran
Type: Boutique guesthouse / family-run
Location: Uvala Soline 14, Postira, otok Brač, Croatia
Coordinates: 15 min from Supetar ferry port, 5 min walk to beach
Phone: +385 21 456 789
Email: dobrodosli@villajadran.hr
Website: www.villajadran.hr
Instagram: @villajadran

═══ ROOMS & PRICING ═══
We have 8 rooms total:

1. Sea View Double (4 rooms) — €90–140/night depending on season
   King bed, private terrace with sea view, AC, minibar, ensuite bathroom

2. Garden Room Double (2 rooms) — €70–110/night
   Queen bed, garden terrace, AC, ensuite bathroom

3. Family Suite (2 rooms) — €130–200/night
   1 king + 2 single beds, living area, kitchenette, two terraces

All rooms include: Free WiFi, daily cleaning, welcome bottle of local wine, beach towels

═══ SEASONS & AVAILABILITY ═══
High season: July–August (minimum 4 night stay, higher prices)
Shoulder season: May–June, September–October (best value, quieter)
Off season: November–April (closed)
Earliest check-in: 14:00 | Latest check-out: 11:00
Late check-in (after 22:00): please notify in advance

═══ BREAKFAST & FOOD ═══
Breakfast: €12/person — served 7:30–10:00 on the terrace
Menu: Fresh local bread, homemade fig jam, cheese, prosciutto, eggs, fresh fruit, coffee
We do NOT have a restaurant but have a fully equipped shared kitchen guests can use
Nearest restaurant: Konoba Blato — 3 min walk, excellent fresh fish
We can arrange private BBQ dinners on request (€35/person, min 4 guests, book 48h ahead)

═══ AMENITIES ═══
- Private beach access (5 min walk, sunbeds included for guests)
- Outdoor pool (open June–September, 9:00–20:00)
- Free parking on property
- Free WiFi throughout
- Bikes available to rent (€10/day)
- Kayaks and paddleboards (€15/half day, €25/full day)
- Airport/ferry transfer service (€30 one-way, €55 return, book 24h ahead)
- Baby cot available on request (free)
- Pet friendly (small dogs only, €15/night supplement)

═══ NEARBY ATTRACTIONS ═══
- Zlatni Rat beach (Bol): 30 min by car or boat, most famous beach in Croatia
- Supetar town: 15 min by car, market every Tuesday
- Wine tasting at Stina Winery: 20 min, we can arrange
- Boat trips to Blue Cave (Biševo): day trip, we can book for guests
- Olive oil tour: local family farm, 10 min, €20/person
- Hiking trails: marked trails directly from property

═══ BOOKING PROCESS ═══
- Book via website: www.villajadran.hr/booking
- Or send us: arrival date, departure date, number of guests, room preference
- 30% deposit required to confirm reservation
- Remaining 70% paid on arrival (cash or card)
- Free cancellation up to 14 days before arrival
- Cancellation within 14 days: deposit non-refundable

═══ LANGUAGES ═══
Staff speaks: Croatian, English, German, Italian
The AI concierge also speaks: Slovenian, Czech, Polish, French

═══ UPSELLS TO MENTION NATURALLY ═══
- When guest asks about check-in: mention airport/ferry transfer service
- When guest asks about beach: mention kayak and paddleboard rental
- When guest asks about food: mention private BBQ dinner option
- When guest asks what to do: mention boat trip to Blue Cave and wine tasting
- When guest confirms booking interest: mention breakfast add-on

═══ IMPORTANT RULES ═══
- You are "Mia" — always introduce yourself by name on first message
- Be warm, personal, and make the guest feel excited about their stay
- For specific availability questions, collect their dates and say the team will confirm within 2 hours
- Never invent information not listed above
- If someone seems interested in booking, gently guide them toward sharing their dates
`;

// ─── LANGUAGE CONFIG ──────────────────────────────────────────────────────────
const LANGS = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "hr", label: "Hrvatski", flag: "🇭🇷" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "sl", label: "Slovenščina", flag: "🇸🇮" },
];

const WELCOME = {
  en: "Hello, I'm **Mia** 🌊 your personal concierge at Villa Jadran. Whether you're dreaming of a stay with us or already planning your trip to Brač — I'm here to help. What can I do for you?",
  hr: "Pozdrav, ja sam **Mia** 🌊 vaša osobna koncijergica u Villa Jadran. Imate li pitanja o smještaju, sadržajima ili otoku Braču — tu sam za vas. Kako vam mogu pomoći?",
  de: "Hallo, ich bin **Mia** 🌊 Ihre persönliche Concierge der Villa Jadran. Ob Sie von einem Urlaub bei uns träumen oder bereits Ihre Reise nach Brač planen — ich bin für Sie da. Wie kann ich Ihnen helfen?",
  sl: "Pozdravljeni, sem **Mia** 🌊 vaša osebna koncijergica v Villa Jadran. Ali sanjate o bivanju pri nas ali že načrtujete potovanje na Brač — tukaj sem za vas. Kako vam lahko pomagam?",
};

const QUICK = {
  en: ["🛏️ Rooms & prices", "📅 Book a stay", "🏖️ Beach & pool", "🚗 Getting here", "🍽️ Food & dining", "🤿 Activities"],
  hr: ["🛏️ Sobe i cijene", "📅 Rezervacija", "🏖️ Plaža i bazen", "🚗 Kako doći", "🍽️ Hrana", "🤿 Aktivnosti"],
  de: ["🛏️ Zimmer & Preise", "📅 Buchung", "🏖️ Strand & Pool", "🚗 Anreise", "🍽️ Essen", "🤿 Aktivitäten"],
  sl: ["🛏️ Sobe in cene", "📅 Rezervacija", "🏖️ Plaža in bazen", "🚗 Kako priti", "🍽️ Hrana", "🤿 Aktivnosti"],
};

const PLACEHOLDER = {
  en: "Ask me anything about Villa Jadran...",
  hr: "Postavite mi pitanje o Villa Jadran...",
  de: "Stellen Sie mir eine Frage zur Villa Jadran...",
  sl: "Vprašajte me karkoli o Villa Jadran...",
};

function detectLang(text) {
  if (/(ich|sie|bitte|danke|haben|möchte|urlaub|zimmer|hallo|guten)/i.test(text)) return "de";
  if (/[čšž]/.test(text) && /(sem|ste|kaj|kako|hvala|prosim|soba|kdaj)/i.test(text)) return "sl";
  if (/[čšž]/.test(text) && /(sam|ste|što|kako|hvala|molim|soba|kada|imam)/i.test(text)) return "hr";
  return "en";
}

// ─── WAVE ANIMATION ───────────────────────────────────────────────────────────
function WaveIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M2 12c1.5-3 3-4.5 4.5-4.5S9 9 10.5 9 13.5 6 15 6s3 2.5 4.5 2.5S22 7 22 7" 
        stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M2 17c1.5-3 3-4.5 4.5-4.5S9 14 10.5 14 13.5 11 15 11s3 2.5 4.5 2.5S22 12 22 12" 
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.5"/>
    </svg>
  );
}

function TypingDots() {
  return (
    <div style={{ display: "flex", gap: 5, alignItems: "center", padding: "3px 0" }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          width: 6, height: 6, borderRadius: "50%",
          background: "#c8a96e",
          animation: `wave ${1.2}s ease-in-out ${i * 0.15}s infinite`,
        }} />
      ))}
    </div>
  );
}

function Message({ msg, isNew }) {
  const isBot = msg.role === "bot";
  return (
    <div style={{
      display: "flex",
      justifyContent: isBot ? "flex-start" : "flex-end",
      marginBottom: 14,
      animation: isNew ? "slideIn 0.35s cubic-bezier(0.34,1.56,0.64,1)" : "none",
    }}>
      {isBot && (
        <div style={{
          width: 34, height: 34, borderRadius: "50%",
          background: "linear-gradient(135deg, #c8a96e, #e8c98e)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 15, marginRight: 9, flexShrink: 0, marginTop: 2,
          boxShadow: "0 3px 10px rgba(200,169,110,0.4)",
          color: "#fff", fontWeight: 700, fontFamily: "serif",
        }}>M</div>
      )}
      <div style={{
        maxWidth: "78%",
        padding: "11px 15px",
        borderRadius: isBot ? "4px 18px 18px 18px" : "18px 4px 18px 18px",
        background: isBot
          ? "rgba(255,255,255,0.92)"
          : "linear-gradient(135deg, #1a5276, #2471a3)",
        color: isBot ? "#2c3e50" : "#fff",
        fontSize: 13.5,
        lineHeight: 1.6,
        boxShadow: isBot
          ? "0 4px 16px rgba(0,0,0,0.08)"
          : "0 4px 16px rgba(26,82,118,0.35)",
        backdropFilter: isBot ? "blur(10px)" : "none",
        border: isBot ? "1px solid rgba(200,169,110,0.15)" : "none",
      }}
        dangerouslySetInnerHTML={{
          __html: msg.content
            .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
            .replace(/\n/g, "<br/>")
        }}
      />
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function HotelChatbot() {
  const [phase, setPhase] = useState("splash"); // splash | lang | chat
  const [lang, setLang] = useState("en");
  const [messages, setMessages] = useState([]);
  const [newMsgIdx, setNewMsgIdx] = useState(-1);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (phase === "splash") {
      const t = setTimeout(() => setPhase("lang"), 2200);
      return () => clearTimeout(t);
    }
  }, [phase]);

  function startChat(selectedLang) {
    setLang(selectedLang);
    setPhase("chat");
    const welcome = { role: "bot", content: WELCOME[selectedLang] };
    setMessages([welcome]);
    setNewMsgIdx(0);
  }

  async function send(text) {
    if (!text.trim() || loading) return;
    const detected = detectLang(text);
    if (detected !== "en") setLang(detected);

    const userMsg = { role: "user", content: text };
    setMessages(p => [...p, userMsg]);
    setNewMsgIdx(prev => prev + 1);
    setInput("");
    setLoading(true);

    const newHistory = [...history, { role: "user", content: text }];

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
       headers: {
  "Content-Type": "application/json",
  "x-api-key": import.meta.env.VITE_ANTHROPIC_API_KEY,
  "anthropic-version": "2023-06-01",
},
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: HOTEL_KNOWLEDGE,
          messages: newHistory,
        }),
      });
      const data = await res.json();
      const reply = data.content?.[0]?.text || "Sorry, something went wrong.";
      setMessages(p => { setNewMsgIdx(p.length); return [...p, { role: "bot", content: reply }]; });
      setHistory([...newHistory, { role: "assistant", content: reply }]);
    } catch {
      setMessages(p => [...p, { role: "bot", content: "⚠️ Connection error. Please try again." }]);
    }
    setLoading(false);
  }

  const quickReplies = (QUICK[lang] || QUICK.en);

  // ── SPLASH ─────────────────────────────────────────────────────────────────
  if (phase === "splash") {
    return (
      <div style={styles.fullscreen}>
        <GlobalStyles />
        <div style={{ textAlign: "center", animation: "fadeIn 0.8s ease" }}>
          <div style={{ fontSize: 56, marginBottom: 20, filter: "drop-shadow(0 4px 20px rgba(200,169,110,0.6))" }}>🌊</div>
          <div style={{ fontFamily: "'Georgia', serif", color: "#c8a96e", fontSize: 42, fontWeight: 300, letterSpacing: 4 }}>
            VILLA JADRAN
          </div>
          <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 12, letterSpacing: 5, marginTop: 8, textTransform: "uppercase" }}>
            Brač · Croatia
          </div>
          <div style={{ marginTop: 40, display: "flex", gap: 8, justifyContent: "center" }}>
            {[0,1,2].map(i => (
              <div key={i} style={{
                width: 6, height: 6, borderRadius: "50%", background: "#c8a96e",
                animation: `wave 1.4s ease-in-out ${i * 0.2}s infinite`
              }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── LANGUAGE SELECT ────────────────────────────────────────────────────────
  if (phase === "lang") {
    return (
      <div style={styles.fullscreen}>
        <GlobalStyles />
        <div style={{
          background: "rgba(255,255,255,0.04)",
          backdropFilter: "blur(24px)",
          border: "1px solid rgba(200,169,110,0.2)",
          borderRadius: 28,
          padding: "44px 36px",
          maxWidth: 400,
          width: "100%",
          textAlign: "center",
          animation: "slideUp 0.5s cubic-bezier(0.34,1.56,0.64,1)",
          boxShadow: "0 40px 80px rgba(0,0,0,0.5)",
        }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>🌊</div>
          <div style={{ fontFamily: "'Georgia', serif", color: "#c8a96e", fontSize: 26, letterSpacing: 3, marginBottom: 4 }}>
            VILLA JADRAN
          </div>
          <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, letterSpacing: 4, textTransform: "uppercase", marginBottom: 32 }}>
            AI Concierge
          </div>
          <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>
            Welcome. Choose your language to meet Mia, your personal concierge.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {LANGS.map(l => (
              <button key={l.code} onClick={() => startChat(l.code)} style={styles.langBtn}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(200,169,110,0.25)"}
                onMouseLeave={e => e.currentTarget.style.background = "rgba(200,169,110,0.08)"}
              >
                <span style={{ fontSize: 24, display: "block", marginBottom: 4 }}>{l.flag}</span>
                <span style={{ fontSize: 13, color: "rgba(255,255,255,0.85)" }}>{l.label}</span>
              </button>
            ))}
          </div>
          <p style={{ color: "rgba(255,255,255,0.2)", fontSize: 10, marginTop: 28, letterSpacing: 1 }}>
            POWERED BY AI · DEMO BY DIGITAL CREATING 101
          </p>
        </div>
      </div>
    );
  }

  // ── CHAT ───────────────────────────────────────────────────────────────────
  return (
    <div style={styles.fullscreen}>
      <GlobalStyles />
      <div style={{
        width: "100%", maxWidth: 500,
        height: "min(720px, 93vh)",
        display: "flex", flexDirection: "column",
        background: "rgba(10,20,35,0.65)",
        backdropFilter: "blur(30px)",
        border: "1px solid rgba(200,169,110,0.18)",
        borderRadius: 28,
        overflow: "hidden",
        boxShadow: "0 40px 100px rgba(0,0,0,0.6)",
        animation: "slideUp 0.4s cubic-bezier(0.34,1.56,0.64,1)",
      }}>

        {/* Header */}
        <div style={{
          padding: "16px 20px",
          background: "linear-gradient(135deg, rgba(26,50,76,0.9), rgba(15,35,60,0.95))",
          borderBottom: "1px solid rgba(200,169,110,0.15)",
          display: "flex", alignItems: "center", gap: 12,
        }}>
          <div style={{
            width: 44, height: 44, borderRadius: "50%",
            background: "linear-gradient(135deg, #c8a96e, #e8c98e)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18, fontWeight: 700, color: "#fff",
            fontFamily: "serif", flexShrink: 0,
            boxShadow: "0 4px 14px rgba(200,169,110,0.45)",
          }}>M</div>
          <div style={{ flex: 1 }}>
            <div style={{ color: "#e8c98e", fontFamily: "'Georgia', serif", fontSize: 15, letterSpacing: 1 }}>Mia</div>
            <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 11, display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ade80", display: "inline-block", animation: "pulse 2s infinite" }} />
              Villa Jadran · Brač, Croatia
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ color: "rgba(200,169,110,0.7)", fontSize: 10, letterSpacing: 2, textTransform: "uppercase" }}>Boutique</div>
            <div style={{ color: "rgba(200,169,110,0.7)", fontSize: 10, letterSpacing: 2 }}>Guesthouse</div>
          </div>
          <button onClick={() => { setPhase("lang"); setMessages([]); setHistory([]); }}
            style={{ background: "rgba(200,169,110,0.1)", border: "1px solid rgba(200,169,110,0.2)", borderRadius: 8, color: "rgba(200,169,110,0.7)", fontSize: 10, padding: "4px 8px", cursor: "pointer", letterSpacing: 1, fontFamily: "inherit" }}>
            🌐
          </button>
        </div>

        {/* Location bar */}
        <div style={{
          padding: "7px 20px",
          background: "rgba(200,169,110,0.06)",
          borderBottom: "1px solid rgba(200,169,110,0.1)",
          display: "flex", gap: 20, alignItems: "center",
        }}>
          {["📍 Postira, Brač", "🏖️ 5 min to beach", "⭐ 9.4 Booking.com"].map(item => (
            <span key={item} style={{ color: "rgba(255,255,255,0.35)", fontSize: 10, letterSpacing: 0.5 }}>{item}</span>
          ))}
        </div>

        {/* Messages */}
        <div style={{
          flex: 1, overflowY: "auto",
          padding: "20px 16px 12px",
          background: "linear-gradient(180deg, rgba(10,25,45,0.3) 0%, rgba(5,15,30,0.2) 100%)",
        }}>
          {messages.map((msg, i) => <Message key={i} msg={msg} isNew={i === newMsgIdx} />)}
          {loading && (
            <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 12 }}>
              <div style={{
                width: 34, height: 34, borderRadius: "50%",
                background: "linear-gradient(135deg, #c8a96e, #e8c98e)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 15, color: "#fff", fontWeight: 700, fontFamily: "serif",
              }}>M</div>
              <div style={{
                background: "rgba(255,255,255,0.9)", padding: "11px 16px",
                borderRadius: "4px 18px 18px 18px",
                boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
              }}>
                <TypingDots />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Quick Replies */}
        <div style={{
          padding: "8px 14px",
          background: "rgba(10,20,35,0.8)",
          borderTop: "1px solid rgba(200,169,110,0.08)",
          display: "flex", gap: 7, overflowX: "auto",
        }}>
          {quickReplies.map(q => (
            <button key={q}
              onClick={() => send(q.replace(/^[\S]+\s/, ""))}
              style={styles.quickBtn}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(200,169,110,0.2)"; e.currentTarget.style.borderColor = "rgba(200,169,110,0.5)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(200,169,110,0.06)"; e.currentTarget.style.borderColor = "rgba(200,169,110,0.2)"; }}
            >{q}</button>
          ))}
        </div>

        {/* Input */}
        <div style={{
          padding: "12px 14px",
          background: "rgba(8,18,32,0.95)",
          borderTop: "1px solid rgba(200,169,110,0.1)",
          display: "flex", gap: 9, alignItems: "flex-end",
        }}>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
            placeholder={PLACEHOLDER[lang] || PLACEHOLDER.en}
            rows={1}
            style={{
              flex: 1,
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(200,169,110,0.2)",
              borderRadius: 14, padding: "10px 14px",
              color: "#fff", fontSize: 13.5,
              fontFamily: "'Georgia', serif",
              resize: "none", lineHeight: 1.5,
              transition: "border 0.2s",
            }}
            onFocus={e => e.target.style.border = "1px solid rgba(200,169,110,0.6)"}
            onBlur={e => e.target.style.border = "1px solid rgba(200,169,110,0.2)"}
          />
          <button
            onClick={() => send(input)}
            disabled={loading || !input.trim()}
            style={{
              width: 42, height: 42, borderRadius: 12, border: "none",
              background: loading || !input.trim()
                ? "rgba(200,169,110,0.15)"
                : "linear-gradient(135deg, #c8a96e, #e8c98e)",
              color: loading || !input.trim() ? "rgba(200,169,110,0.3)" : "#fff",
              fontSize: 17, cursor: loading || !input.trim() ? "default" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0, transition: "all 0.2s",
              boxShadow: loading || !input.trim() ? "none" : "0 4px 14px rgba(200,169,110,0.4)",
            }}
          >➤</button>
        </div>
      </div>
    </div>
  );
}

// ─── STYLES ───────────────────────────────────────────────────────────────────
const styles = {
  fullscreen: {
    minHeight: "100vh",
    background: "linear-gradient(160deg, #0a1628 0%, #0d2444 40%, #0a1e38 70%, #061020 100%)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontFamily: "'Georgia', 'Times New Roman', serif",
    padding: 16,
    position: "relative",
    overflow: "hidden",
  },
  langBtn: {
    background: "rgba(200,169,110,0.08)",
    border: "1px solid rgba(200,169,110,0.2)",
    borderRadius: 14, padding: "16px 10px",
    cursor: "pointer", transition: "all 0.2s",
    fontFamily: "'Georgia', serif",
  },
  quickBtn: {
    background: "rgba(200,169,110,0.06)",
    border: "1px solid rgba(200,169,110,0.2)",
    borderRadius: 20, padding: "5px 11px",
    color: "rgba(200,169,110,0.85)",
    fontSize: 11, cursor: "pointer",
    whiteSpace: "nowrap", flexShrink: 0,
    fontFamily: "inherit", transition: "all 0.15s",
    letterSpacing: 0.3,
  },
};

function GlobalStyles() {
  return (
    <style>{`
      @keyframes fadeIn { from{opacity:0} to{opacity:1} }
      @keyframes slideUp { from{opacity:0;transform:translateY(30px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }
      @keyframes slideIn { from{opacity:0;transform:translateY(10px) scale(0.96)} to{opacity:1;transform:translateY(0) scale(1)} }
      @keyframes wave { 0%,80%,100%{transform:translateY(0);opacity:0.5} 40%{transform:translateY(-7px);opacity:1} }
      @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
      * { box-sizing: border-box; margin: 0; padding: 0; }
      ::-webkit-scrollbar { width: 3px; }
      ::-webkit-scrollbar-track { background: transparent; }
      ::-webkit-scrollbar-thumb { background: rgba(200,169,110,0.3); border-radius: 2px; }
      textarea { outline: none !important; }
    `}</style>
  );
}
