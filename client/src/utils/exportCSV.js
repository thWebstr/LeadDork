// These columns are always pinned to the front of every CSV export
const MANDATORY_COLUMNS = ['name', 'email', 'phone_whatsapp', 'linkedin_url', 'website'];

export const generateCsv = (data, filename = 'leaddork_results.csv') => {
  if (!data || !data.length) return;

  // Collect all keys across every row (AI may add extra keys on some rows)
  const allKeys = Array.from(new Set(data.flatMap(row => Object.keys(row))));

  // Build final header order: mandatory columns first, then the rest (excluding duplicates)
  const extraColumns = allKeys.filter(k => !MANDATORY_COLUMNS.includes(k));
  const headers = [...MANDATORY_COLUMNS, ...extraColumns];

  // Convert objects to CSV rows, always respecting the header order
  const csvRows = data.map(row => {
    return headers.map(header => {
      const val = row[header];
      // Arrays (e.g. multiple emails / websites) → join with " | "
      const rawVal = Array.isArray(val) ? val.join(' | ') : val;
      // Escape nulls/undefined and quote-wrap strings
      const safeVal = (rawVal === null || rawVal === undefined) ? '' : String(rawVal);
      return `"${safeVal.replace(/"/g, '""')}"`;
    }).join(',');
  });

  // Combine Headers + Rows
  const csvContent = [headers.join(','), ...csvRows].join('\n');

  // Create Blob & Trigger Download File
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
