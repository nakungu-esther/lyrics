import { AdminTablePage } from "./AdminTablePage";

export function AdminLanguagesPage() {
  return (
    <AdminTablePage
      title="Languages"
      description="Supported transcription and UI languages."
      queryKey={["admin-languages"]}
      path="/api/v1/admin/languages"
      renderRows={(data) => {
        const languages = (data as { languages: { code: string; name: string }[] }).languages;
        return (
          <ul className="divide-y divide-slate-800 px-4 py-2 text-sm text-slate-300">
            {languages.map((l) => (
              <li key={l.code} className="flex justify-between py-2">
                <span>{l.name}</span>
                <span className="text-slate-500">{l.code}</span>
              </li>
            ))}
          </ul>
        );
      }}
    />
  );
}
