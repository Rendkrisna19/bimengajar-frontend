import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pre-Test & Post-Test Kebanksentralan",
  description: "Evaluasi pemahaman dan pengujian tingkat literasi Cinta Bangga Paham Rupiah bagi peserta kegiatan BI Mengajar.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
