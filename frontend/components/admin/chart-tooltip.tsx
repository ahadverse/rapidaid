type TooltipEntry = { value?: number | string | readonly (number | string)[] };

type ChartTooltipProps = {
  active?: boolean;
  payload?: readonly TooltipEntry[];
  label?: string | number;
  format: (value: number) => string;
  color: string;
  seriesLabel: string;
};

export function ChartTooltip({
  active,
  payload,
  label,
  format,
  color,
  seriesLabel,
}: ChartTooltipProps) {
  const entry = payload?.[0];

  if (!active || !entry) {
    return null;
  }

  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-sm text-popover-foreground shadow-md">
      <p className="mb-1 font-medium">{label}</p>
      <p className="flex items-center gap-2 text-muted-foreground">
        <span
          className="size-2.5 rounded-full"
          style={{ backgroundColor: color }}
          aria-hidden="true"
        />
        {seriesLabel}
        <span className="font-medium text-foreground">{format(Number(entry.value ?? 0))}</span>
      </p>
    </div>
  );
}
