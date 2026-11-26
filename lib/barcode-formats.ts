export interface BarcodeFormat {
  id: string;
  label: string;
  hint: string;
  sample: string;
  // Returns an error message, or null if the value is valid for this format.
  validate: (value: string) => string | null;
}

const digits = (n: number | number[], name: string) => (v: string) => {
  const lengths = Array.isArray(n) ? n : [n];
  if (!/^\d+$/.test(v)) return `${name} accepts digits only.`;
  if (!lengths.includes(v.length)) return `${name} needs ${lengths.join(" or ")} digits (got ${v.length}).`;
  return null;
};

export const BARCODE_FORMATS: BarcodeFormat[] = [
  {
    id: "CODE128",
    label: "Code 128",
    hint: "Any ASCII text. General purpose, most flexible.",
    sample: "HELLO-12345",
    validate: (v) => (/^[\x00-\x7F]+$/.test(v) ? null : "Code 128 accepts ASCII characters only."),
  },
  {
    id: "CODE39",
    label: "Code 39",
    hint: "A–Z, 0–9, space and - . $ / + %",
    sample: "CODE-39",
    validate: (v) => (/^[A-Z0-9 \-.$/+%]+$/.test(v) ? null : "Code 39 accepts A–Z (uppercase), 0–9, space and - . $ / + %"),
  },
  {
    id: "EAN13",
    label: "EAN-13",
    hint: "12 digits (check digit auto-added) or 13 digits.",
    sample: "590123412345",
    validate: digits([12, 13], "EAN-13"),
  },
  {
    id: "EAN8",
    label: "EAN-8",
    hint: "7 digits (check digit auto-added) or 8 digits.",
    sample: "9638507",
    validate: digits([7, 8], "EAN-8"),
  },
  {
    id: "UPC",
    label: "UPC-A",
    hint: "11 digits (check digit auto-added) or 12 digits.",
    sample: "12345678901",
    validate: digits([11, 12], "UPC-A"),
  },
  {
    id: "ITF14",
    label: "ITF-14",
    hint: "13 digits (check digit auto-added) or 14 digits.",
    sample: "1234567890123",
    validate: digits([13, 14], "ITF-14"),
  },
  {
    id: "ITF",
    label: "Interleaved 2 of 5",
    hint: "Even number of digits.",
    sample: "123456",
    validate: (v) => {
      if (!/^\d+$/.test(v)) return "ITF accepts digits only.";
      if (v.length % 2 !== 0) return "ITF needs an even number of digits.";
      return null;
    },
  },
  {
    id: "MSI",
    label: "MSI",
    hint: "Digits only.",
    sample: "1234567",
    validate: (v) => (/^\d+$/.test(v) ? null : "MSI accepts digits only."),
  },
  {
    id: "pharmacode",
    label: "Pharmacode",
    hint: "A number between 3 and 131070.",
    sample: "1234",
    validate: (v) => {
      if (!/^\d+$/.test(v)) return "Pharmacode accepts a number only.";
      const n = Number(v);
      return n >= 3 && n <= 131070 ? null : "Pharmacode must be between 3 and 131070.";
    },
  },
  {
    id: "codabar",
    label: "Codabar",
    hint: "Digits and - $ : / . + (optionally wrapped in A–D).",
    sample: "A123456B",
    validate: (v) => (/^[A-D]?[0-9\-$:/.+]+[A-D]?$/i.test(v) ? null : "Codabar accepts digits and - $ : / . +"),
  },
];
