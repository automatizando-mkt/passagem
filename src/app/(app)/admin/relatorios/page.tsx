import { getRelatorioPorViagem } from "@/features/admin/relatorios/queries";
import { RelatoriosContent } from "./relatorios-content";

export default async function RelatoriosPage() {
  const relatorio = await getRelatorioPorViagem();
  return <RelatoriosContent relatorio={relatorio} />;
}
