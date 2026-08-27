import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Game & Kuis Interaktif Kebanksentralan",
  description: "Uji pengetahuan kebanksentralan dan keaslian uang Rupiah melalui kuis serta game interaktif yang seru dan edukatif.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
