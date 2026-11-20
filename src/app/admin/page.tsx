import { OwnerPanel } from "@/components/admin/owner-panel";
export const metadata = { title: "Área do proprietário", robots: { index: false, follow: false } };
export default function AdminPage() { return <main id="conteudo" className="site-container py-10"><OwnerPanel /></main>; }
