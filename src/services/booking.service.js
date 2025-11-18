import { readExcel } from "../utils/excel.js";
import { writeLog } from "../utils/logger.js";
import { normalizeBookingRow } from "../transformers/booking.transformer.js";
import { validateBookingRow } from "../validators/booking.validator.js";
import { insertBooking } from "../repositories/booking.repository.js";

export async function processBookingExcel(filePath) {
  const rows = readExcel(filePath);

  let insertados = 0;
  let omitidos = 0;
  let errores = [];

  for (let i = 0; i < rows.length; i++) {
    const fila = i + 1;
    const raw = rows[i];

    try {
      // 1) Normalizamos
      const data = await normalizeBookingRow(raw);

      // 2) Validaciones de negocio
      const valid = await validateBookingRow(data);

      if (!valid.ok) {
        errores.push(`Fila ${fila + 1}: ${valid.error}`);
        omitidos++;
        continue;
      }

      // 3) Inserción final
      await insertBooking(valid.data);

      insertados++;

    } catch (err) {
      errores.push(`Fila ${fila + 1}: ERROR → ${err.message}`);
      omitidos++;
    }
  }

  // LOG FINAL
  const logFile = writeLog(
    "booking",
    `Insertados: ${insertados}\nOmitidos: ${omitidos}\nErrores:\n${errores.join("\n")}`
  );

  return { insertados, omitidos, logFile };
}
