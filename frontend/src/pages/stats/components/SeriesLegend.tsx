import { SERIES, SERIES_KEYS, SERIES_LABELS } from "../model/stats.const";

/** Легенда рядов «Доходы / Расходы». */
export function SeriesLegend() {
  return (
    <div className="flex items-center gap-4 text-xs text-muted-foreground">
      {SERIES_KEYS.map((key) => (
        <span key={key} className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full" style={{ backgroundColor: SERIES[key] }} />
          {SERIES_LABELS[key]}
        </span>
      ))}
    </div>
  );
}
