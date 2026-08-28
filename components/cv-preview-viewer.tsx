"use client";

import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { useTranslations } from "next-intl";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

export function CvPreviewViewer({ file }: { file: string }) {
  const t = useTranslations("PdfPreview");
  const containerRef = useRef<HTMLDivElement>(null);
  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageWidth, setPageWidth] = useState(820);
  const path = file.startsWith("/") ? file : `/${file}`;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resize = () => setPageWidth(Math.min(820, Math.max(280, container.clientWidth - 32)));
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="cv-preview" ref={containerRef}>
      <div className="cv-preview-document">
        <Document
          file={path}
          loading={<div className="cv-preview-status">{t("loading")}</div>}
          error={<div className="cv-preview-status error">{t("error")}</div>}
          onLoadSuccess={({ numPages: pages }) => {
            setNumPages(pages);
            setPageNumber((current) => Math.min(current, pages));
          }}
        >
          <Page
            pageNumber={pageNumber}
            width={pageWidth}
            renderAnnotationLayer={false}
            renderTextLayer={false}
            loading={<div className="cv-preview-status">{t("rendering")}</div>}
          />
        </Document>
      </div>
      <div className="cv-preview-controls" aria-label={t("controls")}>
        <button type="button" onClick={() => setPageNumber((page) => Math.max(1, page - 1))} disabled={pageNumber <= 1} aria-label={t("previous")}><ChevronLeft size={18} /></button>
        <span>{numPages ? t("pageCount", { page: pageNumber, total: numPages }) : t("loadingPages")}</span>
        <button type="button" onClick={() => setPageNumber((page) => Math.min(numPages, page + 1))} disabled={!numPages || pageNumber >= numPages} aria-label={t("next")}><ChevronRight size={18} /></button>
        <a href={path} target="_blank" rel="noreferrer"><ExternalLink size={16} /> {t("open")}</a>
      </div>
    </div>
  );
}
