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

  // Si viene como número (serial de Excel)
  if (typeof excelDate === "number") {
    return new Date(Math.round((excelDate - 25569) * 86400 * 1000));
  }

  // Manejo de strings
  if (typeof excelDate === "string") {
    // Detectar formato dd/mm/yyyy o d/m/yyyy
    if (excelDate.includes("/")) {
      const parts = excelDate.split("/").map(Number);

      if (parts.length === 3) {
        const [day, month, year] = parts;
        if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
          return new Date(year, month - 1, day);
        }
      }
    }

    // Cualquier otro formato, intentar parsearlo
    const parsed = Date.parse(excelDate);
    return isNaN(parsed) ? null : new Date(parsed);
  }

  return null;
}

