"use client";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";

const CvPreviewViewer = dynamic(
  () => import("@/components/cv-preview-viewer").then((module) => module.CvPreviewViewer),
  {
    ssr: false,
    loading: () => <PreviewLoading />,
  },
);

export function CvPreview({ file }: { file: string }) {
  return <CvPreviewViewer file={file} />;
}

function PreviewLoading() {
  const t = useTranslations("PdfPreview");
  return <div className="cv-preview-status">{t("preparing")}</div>;
}
