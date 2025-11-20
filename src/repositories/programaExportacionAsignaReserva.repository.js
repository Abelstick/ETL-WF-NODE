import { getConnection, sql } from "../config/db.js";

export async function asignarReservaRepositorio({
  IdProgramaExportacion,
  CodigoProduccion,
  IdReserva,
  IdTipoEmbarque = 1,
  CambioFechas = 0,
  CambioDatosPrograma = 0,
  id_usuario = 1
}) {
  const pool = await getConnection();

  const result = await pool
    .request()
    .input("IdProgramaExportacion", sql.BigInt, IdProgramaExportacion)
    .input("CodigoProduccion", sql.VarChar, CodigoProduccion)
    .input("IdReserva", sql.BigInt, IdReserva)
    .input("IdTipoEmbarque", sql.BigInt, IdTipoEmbarque)

    // OUTPUT
    .output("IdEmbarque", sql.BigInt)

    .input("CambioFechas", sql.Bit, CambioFechas)
    .input("CambioDatosPrograma", sql.Bit, CambioDatosPrograma)
    .input("id_usuario", sql.Int, id_usuario)
    .execute("usp_ProgramaExportacionAsignaReservaMasiva");

  return {
    IdEmbarque: result.output.IdEmbarque
  };
}
