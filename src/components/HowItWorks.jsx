import { useEffect, useRef, useState } from "react";
import howImg from "../assets/capture 6.jpg";

import { API_BASE } from "../config/api";

const labelStyle = (label) => {
  const map = {
    "Outstanding Stay": "#0ea5e9",
    "Excellent Stay": "#22c55e",
    "Looks Legit": "#10b981",
    "Probably OK": "#eab308",
    "A Bit Risky": "#f59e0b",
    "Looks Sketchy": "#f97316",
    "Travel Trap": "#ef4444",
    "Booking Nightmare": "#991b1b",
    "Insufficient Data": "#64748b",
  };
  return { backgroundColor: map[label] || "#64748b" };
};

export default function HowItWorks() {
  const [imageUrl] = useState(howImg);
  const [url, setUrl] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [showRaw, setShowRaw] = useState(false);

  // NEW: quota + past scans
  const [me, setMe] = useState(null);            // { remaining, used, plan, ... }
  const [myScans, setMyScans] = useState([]);    // [{id, listing_url, created_at}]

  // Q&A
  const [q, setQ] = useState("");
  const [qLoading, setQLoading] = useState(false);
  const [qError, setQError] = useState("");
  const [qMessages, setQMessages] = useState([]); // [{role:'user'|'assistant', text:string}]

  // Compare
  const [cA, setCA] = useState("");      // listing_url A
  const [cB, setCB] = useState("");      // listing_url B
  const [cQ, setCQ] = useState("");      // optional question
  const [cLoading, setCLoading] = useState(false);
  const [cError, setCError] = useState("");
  const [cAnswer, setCAnswer] = useState("");

  const tickRef = useRef(null);

  // smooth progress for scan
  useEffect(() => {
    if (isScanning) {
      tickRef.current = setInterval(() => {
        setScanProgress((p) => (p < 90 ? p + 2 : 90));
      }, 120);
    }
    return () => clearInterval(tickRef.current);
  }, [isScanning]);

  // NEW: fetch /me and /my-scans on mount (and whenever auth changes)
  const refreshMeAndScans = async () => {
    try {
      const token = localStorage.getItem("by_token");
      if (!token) { setMe(null); setMyScans([]); return; }
      const [r1, r2] = await Promise.all([
        fetch(`${API_BASE}/me`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE}/my-scans?page=1&limit=30`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (r1.ok) setMe(await r1.json());
      if (r2.ok) {
        const data = await r2.json();
        // Handle both old format (array) and new format (object with scans array) for backward compatibility
        const scansData = Array.isArray(data) ? data : (data.scans || []);
        setMyScans(scansData);
      }
    } catch (e) {
      // non-fatal
    }
  };

  useEffect(() => { refreshMeAndScans(); }, []);

  // SCAN
  const handleScan = async () => {
    setError(""); setResult(null); setQMessages([]); // reset QA for a new scan
    const listing_url = url.trim();
    if (!listing_url) return;

    setIsScanning(true); setScanProgress(0);
    try {
      const token = localStorage.getItem("by_token");
      const res = await fetch(`${API_BASE}/scan`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ listing_url }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
      const json = await res.json();
      setResult(json);
      setScanProgress(100);
      await refreshMeAndScans(); // update remaining + recent scans
    } catch (e) {
      setError(e.message || String(e));
    } finally {
      setIsScanning(false);
      setTimeout(() => setScanProgress(0), 800);
    }
  };

  // ASK (multi-turn; keep appending)
  const ask = async () => {
    setQError("");
    const text = q.trim();
    if (!text) return;

    setQMessages((m) => [...m, { role: "user", text }]);
    setQ(""); setQLoading(true);
    try {
      const token = localStorage.getItem("by_token");
      if (!token) { setQError("Please log in first."); return; }
      const res = await fetch(`${API_BASE}/question`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ question: text }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
      const json = await res.json(); // { answer }
      setQMessages((m) => [...m, { role: "assistant", text: json.answer || "" }]);
      await refreshMeAndScans(); // decrement remaining
    } catch (e) {
      setQError(e.message || String(e));
    } finally {
      setQLoading(false);
    }
  };

  // COMPARE
  const doCompare = async () => {
    setCError(""); setCAnswer(""); setCLoading(true);
    try { 
      const token = localStorage.getItem("by_token");
      if (!token) { setCError("Please log in first."); return; }
      const res = await fetch(`${API_BASE}/compare`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ scan_a_url: cA, scan_b_url: cB, question: cQ || null }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
      const json = await res.json(); // { answer }
      setCAnswer(json.answer || "");
      await refreshMeAndScans(); // decrement remaining
    } catch (e) {
      setCError(e.message || String(e));
    } finally {
      setCLoading(false);
    }
  };

  return (
    <section id="how-it-works" className="relative py-14 bg-[#f8fafb] overflow-hidden">
      {/* background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-0 top-0 h-full w-1/2 bg-[radial-gradient(600px_400px_at_-150px_150px,rgba(59,130,246,0.08),transparent)]" />
        <div className="absolute right-0 bottom-0 h-full w-1/2 bg-[radial-gradient(500px_300px_at_150px_-100px,rgba(147,51,234,0.06),transparent)]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* LEFT image */}
          <div className="relative rounded-3xl bg-white/70 ring-1 ring-gray-200 shadow-sm overflow-hidden flex items-center justify-center min-h-[360px]">
            <img src={imageUrl} alt="How it works" className="h-full w-full object-contain p-6" />
          </div>

          {/* RIGHT steps */}
          <div className="rounded-3xl bg-white ring-1 ring-gray-200 shadow-sm p-6 md:p-8">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">How It Works</h2>

            {/* NEW: remaining line */}
            {me && (
              <div className="mb-4 text-sm text-gray-700">
                Remaining this year: <span className="font-semibold">{me.remaining}</span> of {me?.limits?.cap} (
                plan: {me.plan})
              </div>
            )}

            <div className="space-y-6">
              {/* step 1/2/3 (unchanged) */}
              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-gray-50 text-sm font-semibold text-gray-700">01</div>
                <div className="flex-1">
                  <h3 className="text-base md:text-lg font-semibold text-gray-900">Paste any listing link</h3>
                  <p className="mt-1 text-sm text-gray-600">Drop in an Airbnb or Booking.com URL — works instantly on web and mobile.</p>
                </div>
              </div>
              <div className="h-px w-full bg-gray-100" />

              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-gray-50 text-sm font-semibold text-gray-700">02</div>
                <div className="flex-1">
                  <h3 className="text-base md:text-lg font-semibold text-gray-900">Let our AI do the digging</h3>
                  <p className="mt-1 text-sm text-gray-600">
                    We analyze every corner of the listing and uncover hidden patterns you’d<br />never catch on your own.
                  </p>
                </div>
              </div>
              <div className="h-px w-full bg-gray-100" />

              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-gray-50 text-sm font-semibold text-gray-700">03</div>
                <div className="flex-1">
                  <h3 className="text-base md:text-lg font-semibold text-gray-900">Book smarter</h3>
                  <p className="mt-1 text-sm text-gray-600">
                    Use our insights to book what truly fits your expectations. Ask questions,<br />chat with the AI, and compare listings side by side.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-10 rounded-3xl bg-white ring-1 ring-gray-200 shadow-sm p-4 md:p-6 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Ready to start scanning?</h3>
          <p className="text-gray-600 mb-4">Get detailed insights into any Airbnb or Booking.com listing with our AI-powered analysis.</p>
          <button
            onClick={() => window.location.href = '/scan'}
            className="rounded-xl bg-gray-900 px-6 py-3 text-white font-semibold shadow-sm hover:bg-gray-800"
          >
            Start Scanning
          </button>
        </div>
      </div>
    </section>
  );
}
