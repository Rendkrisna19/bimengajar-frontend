import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Formulir Pengajuan Kegiatan BI Mengajar",
  description: "Ajukan permohonan narasumber atau kegiatan edukasi BI Mengajar untuk sekolah, kampus, komunitas, atau instansi Anda.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
