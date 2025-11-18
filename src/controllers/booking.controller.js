import { processBookingExcel } from "../services/booking.service.js";

export async function uploadBooking(req, res) {
  try {
    const result = await processBookingExcel(req.file.path);
    res.json({
      message: "Archivo procesado correctamente",
      ...result
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
