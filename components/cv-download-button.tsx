import { Download } from "lucide-react";

export function CvDownloadButton({ file, filename, label = "Download CV" }: { file: string; filename: string; label?: string }) {
  const path = file.startsWith("/") ? file : `/${file}`;
  const href = `${path}?download=1&filename=${encodeURIComponent(filename)}`;
  return <a className="button print-cv" href={href} download={filename}><Download size={17} /> {label}</a>;
}
