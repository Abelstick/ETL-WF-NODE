import XLSX from "xlsx";

export function readExcel(filePath) {
  const workbook = XLSX.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  let rows = XLSX.utils.sheet_to_json(sheet, { defval: null, raw: true });

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
function excelDateToJSDateold(excelDate) {
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

function excelDateToJSDatev1(excelDate) {
  if (!excelDate) return null;

  // 1) Serial Excel número
  if (typeof excelDate === "number") {
    return new Date(Math.round((excelDate - 25569) * 86400 * 1000));
  }

  // 2) Serial Excel en string
  if (typeof excelDate === "string" && /^\d+$/.test(excelDate.trim())) {
    const serial = Number(excelDate);
    return new Date(Math.round((serial - 25569) * 86400 * 1000));
  }

  // 3) Fechas con slash
  if (typeof excelDate === "string" && excelDate.includes("/")) {
    const parts = excelDate.split("/").map(Number);

    if (parts.length === 3) {
      let [a, b, c] = parts;

      // Normalizar año
      let year = c < 100 ? c + 2000 : c;

      let day, month;

      // Si b > 12 => no puede ser mes -> formato US mm/dd/yy
      if (b > 12) {
        month = a;
        day = b;
      } else {
        // Por defecto dd/mm
        day = a;
        month = b;
      }

      return new Date(year, month - 1, day);
    }
  }

  return null;
}

export function excelDateToJSDate(excelDate) {
  if (!excelDate) return null;

  // ----- 1) Serial de Excel (número) -----
  if (typeof excelDate === "number") {
    // Excel usa 25569 como epoch
    const jsDate = new Date((excelDate - 25569) * 86400 * 1000);
    return jsDate;
  }

  if (typeof excelDate !== "string") return null;

  let str = excelDate.trim();

  // ----- 2) Formato con hora  dd/mm/yyyy HH:mm -----
  const regexFechaHora = /^(\d{1,2})\/(\d{1,2})\/(\d{2,4})\s+(\d{1,2}):(\d{2})$/;
  let m = str.match(regexFechaHora);
  if (m) {
    let [, d, mth, y, hh, mm] = m;
    y = y.length === 2 ? 2000 + Number(y) : Number(y);
    return new Date(y, Number(mth) - 1, Number(d), Number(hh), Number(mm));
  }

  // ----- 3) Solo fecha  dd/mm/yyyy -----
  const regexFecha = /^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/;
  m = str.match(regexFecha);
  if (m) {
    let [, d, mth, y] = m;
    y = y.length === 2 ? 2000 + Number(y) : Number(y);
    return new Date(y, Number(mth) - 1, Number(d));
  }

  return null;
}


export function excelDateToJSDateBooking(excelDate) {
  if (excelDate == null) return null;

  // Si viene como string numérico ("45024")
  if (typeof excelDate === "string" && /^\d+(\.\d+)?$/.test(excelDate)) {
    excelDate = Number(excelDate);
  }

  // ----- 1) Serial de Excel -----
  if (typeof excelDate === "number") {
    return new Date((excelDate - 25569) * 86400 * 1000);
  }

  if (typeof excelDate !== "string") return null;
  let str = excelDate.trim();

  // dd/mm/yyyy HH:mm
  const regexFechaHora = /^(\d{1,2})\/(\d{1,2})\/(\d{2,4})\s+(\d{1,2}):(\d{2})$/;
  let m = str.match(regexFechaHora);
  if (m) {
    let [, d, mth, y, hh, mm] = m;
    y = y.length === 2 ? 2000 + Number(y) : Number(y);
    return new Date(y, mth - 1, d, hh, mm);
  }

  // dd/mm/yyyy
  const regexFecha = /^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/;
  m = str.match(regexFecha);
  if (m) {
    let [, d, mth, y] = m;
    y = y.length === 2 ? 2000 + Number(y) : Number(y);
    return new Date(y, mth - 1, d);
  }

  return null;
}

