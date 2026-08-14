// Shared CSV export helper - used by ModuleListPage's generic "Export"
// button and by the Reports page's per-report downloads, so both produce
// consistently-formatted files.
export const csvCell = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;

export const downloadCsv = (filename, headerLabels, keys, rows) => {
  if (!rows.length) {
    alert('No data to export.');
    return;
  }
  const lines = [headerLabels.map(csvCell).join(',')];
  rows.forEach((row) => {
    lines.push(
      keys
        .map((key) => {
          const raw = row[key];
          if (raw === null || raw === undefined) return csvCell('');
          if (typeof raw === 'object') return csvCell(raw.name || raw.title || JSON.stringify(raw));
          return csvCell(raw);
        })
        .join(',')
    );
  });
  const blob = new Blob([lines.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename.replace(/\s+/g, '_')}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
