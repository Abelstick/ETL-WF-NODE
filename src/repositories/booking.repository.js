import { getConnection, sql } from "../config/db.js";

export async function bookingExists(booking) {
  const pool = await getConnection();
  const result = await pool
    .request()
    .input("Booking", sql.VarChar, booking)
    .query("SELECT COUNT(*) AS c FROM Booking WHERE Booking = @Booking");

  return result.recordset[0].c > 0;
}

export async function findPuertoByName(name) {
  const pool = await getConnection();
  const result = await pool
    .request()
    .input("name", sql.VarChar, `%${name}%`)
    .query("SELECT TOP 1 id_puerto, nm_puerto FROM Puerto WHERE nm_puerto LIKE @name");
  return result.recordset[0] ?? null;
}

export async function findLugarEmisionBLByName(name) {
  const pool = await getConnection();
  const result = await pool
    .request()
    .input("name", sql.VarChar, name)
    .query("SELECT IdLugarEmisionBL, LugarEmisionBL FROM LugarEmisionBL WHERE LugarEmisionBL = @name");
  return result.recordset[0] ?? null;
}

export async function findCondicionFleteByName(name) {
  const pool = await getConnection();
  const result = await pool
    .request()
    .input("name", sql.VarChar, name)
    .query("SELECT IdCondicionFlete, CondicionFlete FROM CondicionFlete WHERE CondicionFlete = @name");
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

export async function insertBooking(data) {
  const pool = await getConnection();

  return await pool
    .request()
    .output("IdReserva", sql.BigInt)

    // Aquí van TODOS los input sin excepción:
    .input("Booking", sql.VarChar, data.Booking)
    .input("FechaReserva", sql.Date, data.FechaReserva)
    .input("IdCampanha", sql.BigInt, data.IdCampanha)
    .input("SCO", sql.VarChar, data.SCO)
    .input("IdNaviera", sql.BigInt, data.IdNaviera)
    .input("Nave", sql.VarChar, data.Nave)
    .input("Viaje", sql.VarChar, data.Viaje)
    .input("Rumbo", sql.VarChar, data.Rumbo)
    .input("ETA", sql.Date, data.ETA)
    .input("ETASemana", sql.TinyInt, data.ETASemana)
    .input("ETD", sql.Date, data.ETD)
    .input("ETDSemana", sql.TinyInt, data.ETDSemana)
    .input("TiempoTransito", sql.Int, data.TiempoTransito)
    .input("IdPuertoEmbarque", sql.Int, data.IdPuertoEmbarque)
    .input("IdPuertoDestino", sql.Int, data.IdPuertoDestino)
    .input("Transbordo", sql.Bit, data.Transbordo)
    .input("TransbordoM1P", sql.Bit, data.TransbordoM1P)
    .input("TransbordoObservaciones", sql.VarChar, data.TransbordoObservaciones)
    .input("IdPuertoTransbordo", sql.Int, data.IdPuertoTransbordo)

    .input("IdProducto", sql.BigInt, data.IdProducto)

    .input("AtmosferaControlada", sql.Bit, data.AtmosferaControlada)
    .input("O2", sql.VarChar, data.O2)
    .input("CO2", sql.VarChar, data.CO2)
    .input("Humedad", sql.Bit, data.Humedad)
    .input("HumedadPorcentaje", sql.VarChar, data.HumedadPorcentaje)
    .input("Ventilacion", sql.Bit, data.Ventilacion)
    .input("CbmHr", sql.VarChar, data.CbmHr)
    .input("ColdTreatment", sql.Bit, data.ColdTreatment)
    .input("Refrigerado", sql.Bit, data.Refrigerado)
    .input("Temperatura", sql.VarChar, data.Temperatura)
    .input("IdTecnologia", sql.TinyInt, data.IdTecnologia)
    .input("ObsCondicionFlete", sql.VarChar, data.ObsCondicionFlete)
    .input("IdLugarEmisionBL", sql.TinyInt, data.IdLugarEmisionBL)
    .input("ObsLugarEmisionBL", sql.VarChar, data.ObsLugarEmisionBL)
    .input("IdCondicionFlete", sql.TinyInt, data.IdCondicionFlete)
    .input("Customer", sql.VarChar, data.Customer)
    .input("IdProveedorFlete", sql.BigInt, data.IdProveedorFlete)
    .input("IdIcoterm", sql.TinyInt, data.IdIcoterm)
    .input("CantidadContenedorSolicitados", sql.SmallInt, data.CantidadContenedorSolicitados)
    .input("CantidadContenedorAsignados", sql.SmallInt, data.CantidadContenedorAsignados)
    .input("LugarPagoBL", sql.VarChar, data.LugarPagoBL)

    .input("IdEstado", sql.TinyInt, 1)
    .input("idusuario", sql.Int, 1)

    .execute("usp_BookingInserta");
}
