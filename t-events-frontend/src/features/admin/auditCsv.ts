export type AuditPreviewRow = {
  audit_log_id: string;
  created_at: string;
  actor_full_name: string;
  action: string;
  entity_type: string;
  entity_id: string;
  event_id: string;
};

export function countCsvDataRows(csv: string): number {
  const rows = parseCsvRows(csv);
  return Math.max(rows.length - 1, 0);
}

export function parseCsvRows(csv: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;

  for (let index = 0; index < csv.length; index += 1) {
    const char = csv[index];
    const next = csv[index + 1];

    if (char === "\"" && next === "\"") {
      cell += "\"";
      index += 1;
      continue;
    }

    if (char === "\"") {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(cell);
      cell = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(cell);
      if (row.some((value) => value.length > 0)) rows.push(row);
      row = [];
      cell = "";
      continue;
    }

    cell += char;
  }

  row.push(cell);
  if (row.some((value) => value.length > 0)) rows.push(row);

  return rows;
}

export function parsePreviewRows(csv: string): AuditPreviewRow[] {
  const [headers, ...rows] = parseCsvRows(csv);
  if (!headers) return [];

  return rows.map((values) => {
    const row = Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]));
    return {
      audit_log_id: row.audit_log_id ?? "",
      created_at: row.created_at ?? "",
      actor_full_name: row.actor_full_name ?? "",
      action: row.action ?? "",
      entity_type: row.entity_type ?? "",
      entity_id: row.entity_id ?? "",
      event_id: row.event_id ?? "",
    };
  });
}

export function downloadCsv(csv: string, filename: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}
