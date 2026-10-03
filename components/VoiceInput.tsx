"use client";
import { useState, useEffect } from "react";

export default function VoiceInput({
  onTranscript,
  className = "",
}: {
  onTranscript: (text: string) => void;
  className?: string;
}) {
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(true);
  const [lang, setLang] = useState<"en-IN" | "ta-IN">("en-IN");

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSupported(false);
    }
  }, []);

  function toggleListen() {
    if (!supported) {
      alert("Speech recognition is not supported in this browser. Please use Google Chrome or Edge.");
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    if (listening) {
      setListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = lang;

      recognition.onstart = () => {
        setListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results?.[0]?.[0]?.transcript;
        if (transcript) {
          onTranscript(transcript);
        }
        setListening(false);
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech recognition error:", event.error);
        setListening(false);
      };

      recognition.onend = () => {
        setListening(false);
      };

      recognition.start();
    } catch (e) {
      console.error("Failed to start speech recognition:", e);
      setListening(false);
    }
  }

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <button
        type="button"
        onClick={toggleListen}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
          listening
            ? "bg-alert text-white animate-pulse shadow-md shadow-alert/30"
            : "bg-paper hover:bg-gold-soft border border-ink/15 text-ink/75 hover:text-gold-dark hover:border-gold/40"
        }`}
        title={listening ? "Listening... Click to stop" : "Click to speak (Voice-to-Text)"}
      >
        <span>{listening ? "🔴" : "🎙️"}</span>
        <span>{listening ? "Listening…" : "Voice Input"}</span>
      </button>

      <select
        value={lang}
        onChange={(e) => setLang(e.target.value as "en-IN" | "ta-IN")}
        className="text-[11px] py-1 px-2 rounded-lg bg-paper border border-ink/15 text-ink/70 font-medium focus:outline-none"
        title="Recognition Language"
      >
        <option value="en-IN">English (India)</option>
        <option value="ta-IN">தமிழ் (Tamil)</option>
      </select>
    </div>
  );
}
