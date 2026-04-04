/**
 * Normalizes analytics_events rows into per-trip click / inquiry totals.
 * Supports either aggregated rows (click_count / inquiry_count) or per-event rows (kind).
 */
export function buildTripMetricsMap(
  rows: Record<string, unknown>[],
): Map<string, { click_count: number; inquiry_count: number }> {
  const map = new Map<string, { click_count: number; inquiry_count: number }>();

  for (const row of rows) {
    if (row.trip_id == null) continue;
    const tid = String(row.trip_id);
    if (!tid) continue;

    const hasAggregated =
      typeof row.click_count === "number" || typeof row.inquiry_count === "number";

    if (hasAggregated) {
      map.set(tid, {
        click_count: Number(row.click_count ?? 0),
        inquiry_count: Number(row.inquiry_count ?? 0),
      });
      continue;
    }

    const kind = typeof row.kind === "string" ? row.kind : "";
    const increment =
      typeof row.count === "number" && Number.isFinite(row.count) ? row.count : 1;
    const cur = map.get(tid) ?? { click_count: 0, inquiry_count: 0 };
    if (kind === "click") cur.click_count += increment;
    else if (kind === "inquiry") cur.inquiry_count += increment;
    map.set(tid, cur);
  }

  return map;
}
