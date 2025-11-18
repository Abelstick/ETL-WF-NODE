import { bookingExists } from "../repositories/booking.repository.js";

export async function validateBookingRow(data) {
  // Validar duplicado
  const exists = await bookingExists(data.Booking);

  if (exists) {
    return {
      ok: false,
      error: `Booking ${data.Booking} ya existe → omitido`
    };
  }

  

  return { ok: true, data };
}
