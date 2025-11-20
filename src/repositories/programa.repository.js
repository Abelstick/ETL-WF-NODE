import { getConnection, sql } from "../config/db.js";

export async function findPuertoByName(name) {
  const pool = await getConnection();
  const result = await pool
    .request()
    .input("name", sql.VarChar, `%${name}%`)
    .query("SELECT TOP 1 id_puerto, nm_puerto FROM Puerto WHERE nm_puerto LIKE @name");
  return result.recordset[0] ?? null;
}

export async function findACByName(name) {
  const pool = await getConnection();
  const result = await pool
    .request()
    .input("name", sql.VarChar, `%${name}%`)
    .query("SELECT TOP 1 IdTecnologia, TecnologiaAC FROM TecnologiaAC WHERE TecnologiaAC LIKE @name");
  return result.recordset[0] ?? null;
}

export async function findMonedaByName(name) {
  const pool = await getConnection();
  const result = await pool
    .request()
    .input("name", sql.VarChar, `%${name}%`)
    .query("SELECT TOP 1 id_moneda, moneda FROM Moneda WHERE moneda LIKE @name");
  return result.recordset[0] ?? null;
}

export async function getProductoByCampanha(idCampanha) {
  const pool = await getConnection();

  const result = await pool.request()
    .input("IdCampanha", sql.BigInt, idCampanha)
    .query(`
      SELECT TOP 1 IdProducto
      FROM Campanha
      WHERE IdCampanha = @IdCampanha
      ORDER BY IdProducto
    `);

  return result.recordset[0] ?? null;
}

export async function insertPrograma(data) {
  console.log('aqui')
  console.log(data.Temperatura)
  const pool = await getConnection();
  return await pool
    .request()

    // OUTPUT del procedimiento
    .output("IdProgramaExportacion", sql.BigInt)

    // ===== CAMPOS EXACTOS DEL PROCEDIMIENTO =====
    .input("FechaRegistro", sql.Date, data.FechaRegistro)
    .input("IdCampanha", sql.BigInt, data.IdCampanha)
    .input("IdDestinatario", sql.BigInt, data.IdDestinatario)
    .input("IdPuertoEmbarque", sql.Int, data.IdPuertoEmbarque)
    .input("IdPuertoDestino", sql.Int, data.IdPuertoDestino)
    .input("ETA", sql.Date, data.ETA)
    .input("ETASemana", sql.TinyInt, data.ETASemana)
    .input("ETD", sql.Date, data.ETD)
    .input("ETDSemana", sql.TinyInt, data.ETDSemana)
    .input("DiasTransito", sql.TinyInt, data.DiasTransito)
    .input("NumeracionCheps", sql.VarChar, data.NumeracionCheps)
    .input("IdPlanta", sql.Int, data.IdPlanta)
    .input("IdProducto", sql.BigInt, data.IdProducto)
    .input("IdVariedad", sql.BigInt, data.IdVariedad)
    .input("IdTecnologia", sql.TinyInt, data.IdTecnologia)
    .input("Temperatura", sql.VarChar, data.Temperatura)

    // ========= FECHA/HORA DE CARGA NORMALIZADA ============
    .input("FechaCarga", sql.Date, data.FechaCarga || null)
    .input("ObsFechaCarga", sql.VarChar, data.ObsFechaCarga || "")
    .input("HoraCarga", sql.VarChar, data.HoraCarga || "")

    .input("CodigoProduccion", sql.VarChar, data.CodigoProduccion)
    .input("IdOperadorLogistico", sql.BigInt, data.IdOperadorLogistico)

    // ========= LAR NORMALIZADO ============
    .input("LAR", sql.Bit, data.LAR)

    .input("IdIcoterm", sql.TinyInt, data.IdIcoterm)
    .input("Po", sql.VarChar, data.Po)
    .input("Senasa", sql.VarChar, data.Senasa)
    .input("Coo", sql.VarChar, data.Coo)
    .input("PedidoDinamic", sql.VarChar, data.PedidoDinamic)
    .input("Invoice", sql.VarChar, data.Invoice)

    .input("FechaEmision", sql.Date, data.FechaEmision || null)
    .input("IdMoneda", sql.TinyInt, data.IdMoneda)
    .input("Monto", sql.Decimal(12, 2), data.Monto)
    .input("FOB", sql.Decimal(12, 2), data.FOB)
    .input("PesoNeto", sql.Decimal(12, 2), data.PesoNeto)
    .input("PesoBruto", sql.Decimal(12, 2), data.PesoBruto)
    .input("IdTerminoPago", sql.TinyInt, data.IdTerminoPago)
    .input("GuiaRemision", sql.VarChar, data.GuiaRemision)

    // ===== ESTADO MAQUILA YA NORMALIZADO =====
    .input("IdEstadoMaquila", sql.TinyInt, data.IdEstadoMaquila)
    .input("TotalCajas", sql.BigInt, data.TotalCajas)
    .input("NumeroFactura", sql.VarChar, data.NumeroFactura)
    .input("TotalKilos", sql.Decimal(12, 2), data.TotalKilos)
    .input("FechaEmisionMaquila", sql.Date, data.FechaEmisionMaquila || null)
    .input("MontoMaquila", sql.Decimal(12, 2), data.MontoMaquila)

    // Fijos
    .input("IdEstado", sql.TinyInt, 1)
    .input("idusuario", sql.Int, 1)

    .execute("usp_ProgramaExportacionInserta");
}

