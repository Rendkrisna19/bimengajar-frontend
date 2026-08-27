import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Artikel & Edukasi Keuangan",
  description: "Artikel pilihan mengenai kebijakan moneter, Cinta Bangga Paham Rupiah, sistem pembayaran, dan literasi kebanksentralan.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
