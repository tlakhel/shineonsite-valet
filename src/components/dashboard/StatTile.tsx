export default function StatTile({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-lines bg-surface p-5 shadow-sm">
      <p className="text-sm font-bold text-ink-soft">{label}</p>
      <p className="mt-2 text-3xl font-extrabold text-ink">{value}</p>
    </div>
  );
}
