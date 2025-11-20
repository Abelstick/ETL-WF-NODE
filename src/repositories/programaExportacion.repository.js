import { getConnection, sql } from "../config/db.js";

export async function findProgramaExportacionByExcel({
  CodigoProduccion,
  IdPlanta,
  IdVariedad,
  Senasa,
  Invoice,
  Monto,
  FOB,
  PesoNeto,
  PesoBruto,
  IdTerminoPago,
  ObsFechaCarga,
  PedidoDinamic,
  NumeroFactura,
  MontoMaquila,
  FechaEmisionMaquila,
  IdCampanha
}) {
  const pool = await getConnection();

  const result = await pool
    .request()
    .input("CodigoProduccion", sql.VarChar, CodigoProduccion)
    .input("IdPlanta", sql.BigInt, IdPlanta)
    .input("IdVariedad", sql.BigInt, IdVariedad)
    .input("Senasa", sql.VarChar, Senasa)
    .input("Invoice", sql.VarChar, Invoice)
    .input("Monto", sql.Decimal(18, 4), Monto)
    .input("FOB", sql.Decimal(18, 4), FOB)
    .input("PesoNeto", sql.Decimal(18, 4), PesoNeto)
    .input("PesoBruto", sql.Decimal(18, 4), PesoBruto)
    .input("IdTerminoPago", sql.TinyInt, IdTerminoPago)
    .input("ObsFechaCarga", sql.VarChar, ObsFechaCarga)
    .input("PedidoDinamic", sql.VarChar, PedidoDinamic)
    .input("NumeroFactura", sql.VarChar, NumeroFactura)
    .input("MontoMaquila", sql.Decimal(18, 4), MontoMaquila)
    .input("FechaEmisionMaquila", sql.Date, FechaEmisionMaquila)
    .input("IdCampanha", sql.BigInt, IdCampanha)
    .query(`
      SELECT TOP 1 *
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
        AND ISNULL(ObsFechaCarga,'') = ISNULL(@ObsFechaCarga,'')
        AND ISNULL(PedidoDinamic,'') = ISNULL(@PedidoDinamic,'')
        AND ISNULL(NumeroFactura,'') = ISNULL(@NumeroFactura,'')
        AND MontoMaquila = @MontoMaquila
        AND FechaEmisionMaquila = @FechaEmisionMaquila
        AND IdCampanha = @IdCampanha
    `);

  return result.recordset[0] ?? null;
}
