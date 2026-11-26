"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import {
  buildWebsitePayload,
  buildWifiPayload,
  type QrTemplate,
  type WifiEncryption,
} from "@/lib/qr-templates";
import { downloadDataUrl, downloadText } from "@/lib/download";

type ErrorLevel = "L" | "M" | "Q" | "H";

export default function QrGenerator() {
  const [template, setTemplate] = useState<QrTemplate>("text");

  const [text, setText] = useState("Hello from my QR code!");
  const [url, setUrl] = useState("example.com");
  const [ssid, setSsid] = useState("");
  const [password, setPassword] = useState("");
  const [encryption, setEncryption] = useState<WifiEncryption>("WPA");
  const [hidden, setHidden] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [size, setSize] = useState(320);
  const [ecc, setEcc] = useState<ErrorLevel>("M");
  const [fg, setFg] = useState("#000000");
  const [bg, setBg] = useState("#ffffff");

  const [png, setPng] = useState("");
  const [error, setError] = useState("");

  const payload =
    template === "text"
      ? text
      : template === "website"
        ? buildWebsitePayload(url)
        : buildWifiPayload({ ssid, password, encryption, hidden });

  useEffect(() => {
    if (!payload) {
      setPng("");
      setError("");
      return;
    }
    let cancelled = false;
    QRCode.toDataURL(payload, {
      width: size,
      margin: 2,
      errorCorrectionLevel: ecc,
      color: { dark: fg, light: bg },
    })
      .then((data) => {
        if (cancelled) return;
        setPng(data);
        setError("");
      })
      .catch((e: Error) => {
        if (cancelled) return;
        setPng("");
        setError(e.message || "Could not generate QR code (content may be too long).");
      });
    return () => {
      cancelled = true;
    };
  }, [payload, size, ecc, fg, bg]);

  const downloadSvg = async () => {
    const svg = await QRCode.toString(payload, {
      type: "svg",
      margin: 2,
      errorCorrectionLevel: ecc,
      color: { dark: fg, light: bg },
    });
    downloadText(svg, `qrcode-${template}.svg`);
  };

  return (
    <div className="grid">
      <section className="panel">
        <h2>Content</h2>

        <div className="seg" role="tablist" aria-label="QR template">
          {(["text", "website", "wifi"] as QrTemplate[]).map((t) => (
            <button
              key={t}
              role="tab"
              aria-selected={template === t}
              className={template === t ? "active" : ""}
              onClick={() => setTemplate(t)}
            >
              {t === "text" ? "Text" : t === "website" ? "Website" : "WiFi"}
            </button>
          ))}
        </div>

        {template === "text" && (
          <label>
            Text
            <textarea rows={5} value={text} onChange={(e) => setText(e.target.value)} placeholder="Type any text…" />
          </label>
        )}

        {template === "website" && (
          <label>
            Website URL
            <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="example.com" inputMode="url" />
            <small>https:// is added automatically if missing.</small>
          </label>
        )}

        {template === "wifi" && (
          <>
            <label>
              Network name (SSID)
              <input value={ssid} onChange={(e) => setSsid(e.target.value)} placeholder="MyWiFi" />
            </label>
            <label>
              Security
              <select value={encryption} onChange={(e) => setEncryption(e.target.value as WifiEncryption)}>
                <option value="WPA">WPA / WPA2 / WPA3</option>
                <option value="WEP">WEP</option>
                <option value="nopass">None (open network)</option>
              </select>
            </label>
            {encryption !== "nopass" && (
              <label>
                Password
                <div className="row">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Network password"
                    autoComplete="off"
                  />
                  <button type="button" className="ghost" onClick={() => setShowPassword((s) => !s)}>
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </label>
            )}
            <label className="check">
              <input type="checkbox" checked={hidden} onChange={(e) => setHidden(e.target.checked)} />
              Hidden network
            </label>
          </>
        )}

        <h2>Options</h2>
        <div className="two">
          <label>
            Size: {size}px
            <input type="range" min={128} max={640} step={16} value={size} onChange={(e) => setSize(Number(e.target.value))} />
          </label>
          <label>
            Error correction
            <select value={ecc} onChange={(e) => setEcc(e.target.value as ErrorLevel)}>
              <option value="L">Low (7%)</option>
              <option value="M">Medium (15%)</option>
              <option value="Q">Quartile (25%)</option>
              <option value="H">High (30%)</option>
            </select>
          </label>
          <label>
            Foreground
            <input type="color" value={fg} onChange={(e) => setFg(e.target.value)} />
          </label>
          <label>
            Background
            <input type="color" value={bg} onChange={(e) => setBg(e.target.value)} />
          </label>
        </div>
      </section>

      <section className="panel preview">
        <h2>Preview</h2>
        <div className="canvas">
          {png ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={png} alt="Generated QR code" width={size} height={size} style={{ maxWidth: "100%", height: "auto" }} />
          ) : (
            <p className="muted">{error || (template === "wifi" ? "Enter a network name to generate." : "Enter content to generate.")}</p>
          )}
        </div>
        {payload && template === "wifi" && <code className="payload">{payload.replace(/P:[^;]*/, "P:••••••")}</code>}
        <div className="actions">
          <button disabled={!png} onClick={() => downloadDataUrl(png, `qrcode-${template}.png`)}>
            Download PNG
          </button>
          <button className="ghost" disabled={!png} onClick={downloadSvg}>
            Download SVG
          </button>
        </div>
      </section>
    </div>
  );
}
