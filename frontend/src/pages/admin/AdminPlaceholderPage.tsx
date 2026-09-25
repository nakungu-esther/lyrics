import { Card } from "../../components/ui/Card";

export function AdminPlaceholderPage({ title, description }: { title: string; description: string }) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-white">{title}</h2>
      <Card>
        <p className="text-sm text-slate-400">{description}</p>
      </Card>
    </div>
  );
}
