import XLSX from "xlsx";

export function readExcel(filePath) {
  const workbook = XLSX.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  let rows = XLSX.utils.sheet_to_json(sheet, { defval: null, raw: false });

  // Limpiar espacios en los nombres de columna
  rows = rows.map(row => {
    const newRow = {};
    for (const key in row) {
      const cleanKey = key.trim(); // elimina espacios al inicio y fin
      newRow[cleanKey] = row[key];
    }
    return newRow;
  });

  return rows;
}

// Función para convertir fechas de Excel (números) a JS Date
export function excelDateToJSDate(excelDate) {
  if (!excelDate) return null;

  // Si es número, asumimos formato Excel serial date
  if (typeof excelDate === "number") {
    const jsDate = new Date(Math.round((excelDate - 25569) * 86400 * 1000));
    return jsDate;
  }

  // Si es string, intentar parsear
  if (typeof excelDate === "string") {
    const parsed = Date.parse(excelDate);
    if (!isNaN(parsed)) return new Date(parsed);

    // A veces Excel devuelve "dd/mm/yyyy", forzar swap
    const parts = excelDate.split("/");
    if (parts.length === 3) {
      const [day, month, year] = parts.map(Number);
      if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
        return new Date(year, month - 1, day);
      }
    }

    return null;
  }

  // Si ya es Date
  if (excelDate instanceof Date && !isNaN(excelDate)) return excelDate;

  return null;
}
