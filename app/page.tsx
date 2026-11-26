"use client";

import { useState } from "react";
import QrGenerator from "@/components/QrGenerator";
import BarcodeGenerator from "@/components/BarcodeGenerator";

export default function Home() {
  const [mode, setMode] = useState<"qr" | "barcode">("qr");

  return (
    <main className="container">
      <header>
        <h1>QR &amp; Barcode Generator</h1>
        <p className="muted">Everything is generated in your browser — nothing is uploaded.</p>
      </header>

      <nav className="tabs" role="tablist" aria-label="Generator type">
        <button role="tab" aria-selected={mode === "qr"} className={mode === "qr" ? "active" : ""} onClick={() => setMode("qr")}>
          QR Code
        </button>
        <button
          role="tab"
          aria-selected={mode === "barcode"}
          className={mode === "barcode" ? "active" : ""}
          onClick={() => setMode("barcode")}
        >
          Barcode
        </button>
      </nav>

      {mode === "qr" ? <QrGenerator /> : <BarcodeGenerator />}
    </main>
  );
}
