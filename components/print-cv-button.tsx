"use client";

import { Download } from "lucide-react";
import { useState, type ReactElement } from "react";
import { toast } from "sonner";
import type { DocumentProps } from "@react-pdf/renderer";
import type { PortfolioData } from "@/lib/content";

export function PrintCvButton({ data, label = "Download CV" }: { data: PortfolioData; label?: string }) {
  const [generating, setGenerating] = useState(false);

  async function download() {
    if (generating) return;
    setGenerating(true);

    try {
      const [{ pdf }, { CvDocument }, React] = await Promise.all([
        import("@react-pdf/renderer"),
        import("@/components/cv-document"),
        import("react"),
      ]);
      const document = React.createElement(CvDocument, { data }) as ReactElement<DocumentProps>;
      const blob = await pdf(document).toBlob();
      const url = URL.createObjectURL(blob);
      const anchor = window.document.createElement("a");
      const name = data.contact ? `${data.contact.name}${data.contact.lastname}` : "Portfolio";
      anchor.href = url;
      anchor.download = `${name.replace(/[^a-z0-9]/gi, "")}CV.pdf`;
      window.document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
    } catch (error) {
      console.error("CV generation failed", error);
      toast.error("Could not generate the CV. Please try again.");
    } finally {
      setGenerating(false);
    }
  }

  return <button className="button print-cv" type="button" onClick={download} disabled={generating}><Download size={17} /> {generating ? "Generating CV…" : label}</button>;
}
