import { BuilderShell } from "@/components/layout/BuilderShell";

export default function BuilderLayout({ children }: { children: React.ReactNode }) {
  return <BuilderShell>{children}</BuilderShell>;
}
