import ExcelJS from "exceljs";
import { writeLog } from "../utils/logger.js";
import { getConnection, sql } from "../config/db.js";
import { asignarReservaRepositorio } from "../repositories/programaExportacionAsignaReserva.repository.js";

// --- HELPERS ---
function normalizeForSql(value, type) {
  switch (type) {
    case "varchar":
      return value == null ? "" : String(value).trim();

    case "decimal": {
      if (value == null) return 0;

      let str = String(value).trim();

      // 1. Quitar caracteres invisibles
      str = str.replace(/[\u00A0\u200B-\u200D\uFEFF]/g, "");

      // 2. Quitar todo lo que no sea número, coma, punto o signo
      str = str.replace(/[^\d.,-]/g, "");

      const countDots = (str.match(/\./g) || []).length;
      const countCommas = (str.match(/,/g) || []).length;

      // --- SOPORTE PARA "25.510.00" ---
      if (countDots > 1 && countCommas === 0) {
        const parts = str.split(".");
        const decimal = parts.pop();      
        const integer = parts.join("");    
        str = integer + "." + decimal;     
      }

      // --- FORMATO US: 12,345.67 ---
      if (str.includes(",") && str.includes(".")) {
        str = str.replace(/,/g, "");
      }
      // --- FORMATO LATAM: 45,90 ---
      else if (str.includes(",") && !str.includes(".")) {
        const parts = str.split(",");
        if (parts[1]?.length === 2) {
          str = parts[0] + "." + parts[1];
        } else {
          str = str.replace(/,/g, ""); // miles
        }
      }

      const n = Number(str);
      return isNaN(n) ? 0 : Math.round(n * 100) / 100;
    }

    case "bigint": {
      if (value == null) return 0;

      let str = String(value)
        .trim()
        .replace(/[^\d.-]/g, "");

      const n = parseInt(str, 10);
      return isNaN(n) ? 0 : n;
    }

    case "date":
      if (!value) return null;
      const d = new Date(value);
      return isNaN(d.getTime()) ? null : d;

    default:
      return value;
  }
}


export async function mergeService({ bookingPath, programaPath }) {
  const bookingWorkbook = new ExcelJS.Workbook();
  await bookingWorkbook.xlsx.readFile(bookingPath);

  const programaWorkbook = new ExcelJS.Workbook();
  await programaWorkbook.xlsx.readFile(programaPath);

  const bookingSheet = bookingWorkbook.worksheets[0];
  const programaSheet = programaWorkbook.worksheets[0];

  const getHeaders = (sheet) => {
    const headers = {};
    sheet.getRow(1).eachCell((cell, col) => {
      headers[String(cell.value).trim().toUpperCase()] = col;
    });
    return headers;
  };

  const bookingHeaders = getHeaders(bookingSheet);
  const programaHeaders = getHeaders(programaSheet);

  // --- Leer bookings ---
  const bookingValues = [];
  bookingSheet.eachRow((row, n) => {
    if (n === 1) return;
    const booking = normalizeForSql(row.getCell(bookingHeaders["BOOKING"]).value, "varchar");
    const idCampanha = normalizeForSql(row.getCell(bookingHeaders["IDCAMPANHA"]).value, "bigint");
    if (booking) bookingValues.push({ booking, idCampanha });
  });

  // --- Leer programa ---
  const programaValues = [];
  programaSheet.eachRow((row, n) => {
    if (n === 1) return;
    const read = (header, type = "varchar") => {
      const col = programaHeaders[header];
      if (!col) return type === "decimal" || type === "bigint" ? 0 : type === "varchar" ? "" : null;
      return normalizeForSql(row.getCell(col).value, type);
    };

    const prog = {
      CodigoProduccion: read("COD.PROD", "varchar"),
      IdPlanta: read("IDPACKINGHOUSE", "bigint"),
      IdVariedad: read("IDVARIETY", "bigint"),
      Senasa: read("EXPEDIENTESENASA", "varchar"),
      Invoice: read("INVOICE", "varchar"),
      Monto: read("IMPORTE DE FACTURA (AMOUNT)", "decimal"),
      FOB: read("FOB", "decimal"),
      PesoNeto: read("PESO NETO", "decimal"),
      PesoBruto: read("PESO BRUTO", "decimal"),
      IdTerminoPago: read("IDCONDICION DE VENTA", "bigint"),
      ObsFechaCarga: read("OBS FECHA DE CARGA", "varchar"),
      PedidoDinamic: read("PEDIDO DE VENTA DYNAMIC", "varchar"),
      NumeroFactura: read("FACTURA PLANTA", "varchar"),
      MontoMaquila: read("MONTO", "decimal"),
      FechaEmisionMaquila: read("EMISION DOC.", "date"),
      IdCampanha: read("IDCAMPANHA", "bigint")
    };

    if (prog.CodigoProduccion) programaValues.push(prog);
  });

  const totalRows = Math.min(bookingValues.length, programaValues.length);
  const pool = await getConnection();
  const processed = [];
  const errors = [];
  const logLines = [`=== PROCESO MERGE ===`, `Total filas: ${totalRows}\n`];

  for (let i = 0; i < totalRows; i++) {
    const book = bookingValues[i];
    const prog = programaValues[i];

    try {
      const q = pool.request();
      q.input("CodigoProduccion", sql.VarChar, normalizeForSql(prog.CodigoProduccion, "varchar"));
      q.input("IdPlanta", sql.BigInt, normalizeForSql(prog.IdPlanta, "bigint"));
      q.input("IdVariedad", sql.BigInt, normalizeForSql(prog.IdVariedad, "bigint"));
      q.input("Senasa", sql.VarChar, normalizeForSql(prog.Senasa, "varchar"));
      q.input("Invoice", sql.VarChar, normalizeForSql(prog.Invoice, "varchar"));
      q.input("Monto", sql.Decimal(18, 2), normalizeForSql(prog.Monto, "decimal"));
      q.input("FOB", sql.Decimal(18, 2), normalizeForSql(prog.FOB, "decimal"));
      q.input("PesoNeto", sql.Decimal(18, 2), normalizeForSql(prog.PesoNeto, "decimal"));
      q.input("PesoBruto", sql.Decimal(18, 2), normalizeForSql(prog.PesoBruto, "decimal"));
      q.input("IdTerminoPago", sql.BigInt, normalizeForSql(prog.IdTerminoPago, "bigint"));
      q.input("ObsFechaCarga", sql.VarChar, normalizeForSql(prog.ObsFechaCarga, "varchar"));
      q.input("PedidoDinamic", sql.VarChar, normalizeForSql(prog.PedidoDinamic, "varchar"));
      q.input("NumeroFactura", sql.VarChar, normalizeForSql(prog.NumeroFactura, "varchar"));
      q.input("MontoMaquila", sql.Decimal(18, 2), normalizeForSql(prog.MontoMaquila, "decimal"));
      q.input("FechaEmisionMaquila", sql.Date, normalizeForSql(prog.FechaEmisionMaquila, "date"));
      q.input("IdCampanha", sql.BigInt, normalizeForSql(prog.IdCampanha, "bigint"));

      const result = await q.query(`
        SELECT TOP 1 IdProgramaExportacion
        FROM ProgramaExportacion
        WHERE CodigoProduccion = @CodigoProduccion
          AND IdPlanta = @IdPlanta
          AND IdVariedad = @IdVariedad
          AND Senasa = @Senasa
          AND Invoice = @Invoice
          AND Monto = @Monto
          AND FOB = @FOB
          AND PesoNeto = @PesoNeto
          AND PesoBruto = @PesoBruto
          AND IdTerminoPago = @IdTerminoPago
          AND PedidoDinamic = @PedidoDinamic
          AND MontoMaquila = @MontoMaquila
          AND IdCampanha = @IdCampanha
          `);
      // AND ObsFechaCarga = @ObsFechaCarga
      //AND NumeroFactura = @NumeroFactura
      //AND FechaEmisionMaquila = @FechaEmisionMaquila

      const IdProgramaExportacion = result.recordset[0]?.IdProgramaExportacion;
      if (!IdProgramaExportacion) throw new Error(`No existe ProgramaExportacion exacto para ${prog.CodigoProduccion}`);

      const reserva = await pool.request()
        .input("Booking", sql.VarChar, book.booking)
        .query(`SELECT TOP 1 IdReserva FROM Booking WHERE Booking = @Booking`);
      const IdReserva = reserva.recordset[0]?.IdReserva;
      if (!IdReserva) throw new Error(`No existe IdReserva para ${book.booking}`);

      const sp = await asignarReservaRepositorio({
        IdProgramaExportacion,
        CodigoProduccion: prog.CodigoProduccion,
        IdReserva,
        IdTipoEmbarque: 1,
        CambioFechas: 0,
        CambioDatosPrograma: 0,
        id_usuario: 1
      });

      processed.push({ booking: book.booking, ...prog, IdProgramaExportacion, IdReserva, IdEmbarque: sp.IdEmbarque });
      logLines.push(`✔ OK Fila ${i + 2} – Booking ${book.booking}`);

    } catch (e) {
      errors.push({ index: i + 2, booking: book.booking, prog, error: e.message });
      logLines.push(`❌ ERROR Fila ${i + 2} – ${e.message}`);
    }
  }

  const finalLogPath = writeLog("merge-result", logLines.join("\n"));

  return {
    totalProcesados: processed.length,
    totalErrores: errors.length,
    procesados: processed,
    errores: errors,
    logFile: finalLogPath
  };
}
