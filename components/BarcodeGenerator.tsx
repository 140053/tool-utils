"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import JsBarcode from "jsbarcode";
import { BARCODE_FORMATS } from "@/lib/barcode-formats";
import { downloadBlob, downloadText, svgToPngBlob } from "@/lib/download";

export default function BarcodeGenerator() {
  const svgRef = useRef<SVGSVGElement>(null);

  const [formatId, setFormatId] = useState("CODE128");
  const format = useMemo(() => BARCODE_FORMATS.find((f) => f.id === formatId)!, [formatId]);
  const [value, setValue] = useState(format.sample);

  const [barWidth, setBarWidth] = useState(2);
  const [height, setHeight] = useState(100);
  const [displayValue, setDisplayValue] = useState(true);
  const [fontSize, setFontSize] = useState(18);
  const [margin, setMargin] = useState(10);
  const [fg, setFg] = useState("#000000");
  const [bg, setBg] = useState("#ffffff");

  const [error, setError] = useState<string | null>(null);

  const changeFormat = (id: string) => {
    setFormatId(id);
    const next = BARCODE_FORMATS.find((f) => f.id === id)!;
    setValue(next.sample);
  };

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const problem = value ? format.validate(value) : "Enter a value.";
    if (problem) {
      setError(problem);
      svg.innerHTML = "";
      svg.removeAttribute("width");
      svg.removeAttribute("height");
      return;
    }
    try {
      JsBarcode(svg, value, {
        format: format.id,
        width: barWidth,
        height,
        displayValue,
        fontSize,
        margin,
        lineColor: fg,
        background: bg,
        valid: (ok: boolean) => {
          if (!ok) throw new Error("Invalid value for this format.");
        },
      });
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not generate barcode.");
      svg.innerHTML = "";
    }
  }, [value, format, barWidth, height, displayValue, fontSize, margin, fg, bg]);

  const getSvgString = () => {
    const svg = svgRef.current!;
    const clone = svg.cloneNode(true) as SVGSVGElement;
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    return new XMLSerializer().serializeToString(clone);
  };

  const downloadPng = async () => {
    const blob = await svgToPngBlob(getSvgString(), 3);
    downloadBlob(blob, `barcode-${format.id}.png`);
  };

  const downloadSvg = () => downloadText(getSvgString(), `barcode-${format.id}.svg`);

  const ok = !error;

  return (
    <div className="grid">
      <section className="panel">
        <h2>Content</h2>
        <label>
          Barcode type
          <select value={formatId} onChange={(e) => changeFormat(e.target.value)}>
            {BARCODE_FORMATS.map((f) => (
              <option key={f.id} value={f.id}>
                {f.label}
              </option>
            ))}
          </select>
          <small>{format.hint}</small>
        </label>
        <label>
          Value
          <input value={value} onChange={(e) => setValue(e.target.value)} placeholder={format.sample} spellCheck={false} />
        </label>

        <h2>Options</h2>
        <div className="two">
          <label>
            Bar width: {barWidth}
            <input type="range" min={1} max={5} step={0.5} value={barWidth} onChange={(e) => setBarWidth(Number(e.target.value))} />
          </label>
          <label>
            Height: {height}px
            <input type="range" min={30} max={250} step={5} value={height} onChange={(e) => setHeight(Number(e.target.value))} />
          </label>
          <label>
            Margin: {margin}px
            <input type="range" min={0} max={40} step={1} value={margin} onChange={(e) => setMargin(Number(e.target.value))} />
          </label>
          <label>
            Text size: {fontSize}px
            <input
              type="range"
              min={10}
              max={40}
              step={1}
              value={fontSize}
              disabled={!displayValue}
              onChange={(e) => setFontSize(Number(e.target.value))}
            />
          </label>
          <label>
            Bar color
            <input type="color" value={fg} onChange={(e) => setFg(e.target.value)} />
          </label>
          <label>
            Background
            <input type="color" value={bg} onChange={(e) => setBg(e.target.value)} />
          </label>
        </div>
        <label className="check">
          <input type="checkbox" checked={displayValue} onChange={(e) => setDisplayValue(e.target.checked)} />
          Show text under the bars
        </label>
      </section>

      <section className="panel preview">
        <h2>Preview</h2>
        <div className="canvas">
          <svg ref={svgRef} style={{ maxWidth: "100%", height: "auto", display: ok ? "block" : "none" }} />
          {!ok && <p className="muted error">{error}</p>}
        </div>
        <div className="actions">
          <button disabled={!ok} onClick={downloadPng}>
            Download PNG
          </button>
          <button className="ghost" disabled={!ok} onClick={downloadSvg}>
            Download SVG
          </button>
        </div>
      </section>
    </div>
  );
}
