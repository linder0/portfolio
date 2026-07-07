export type CreditRow = {
  label: string;
  value: React.ReactNode;
};

// The credits block on a project page, as an actual table: a compact,
// self-contained unit. Hairline grid lines (rows and the label/value column
// divider), a whisper of fill behind the label column so the block reads as
// one solid piece, label-eyebrow keys, body-copy values. Rows with no value
// are simply omitted by the caller.
export function CreditsTable({
  rows,
  className,
}: {
  rows: CreditRow[];
  className?: string;
}) {
  return (
    <table
      className={`w-full max-w-cap-md border-collapse border border-border ${className ?? ""}`}
    >
      <tbody>
        {rows.map((row) => (
          <tr key={row.label} className="border-b border-border last:border-b-0">
            <th
              scope="row"
              className="label-eyebrow w-24 border-r border-border bg-foreground/[0.03] px-3 py-1.5 text-left align-baseline font-normal"
            >
              {row.label}
            </th>
            <td className="copy-16 px-3 py-1.5 align-baseline">{row.value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
