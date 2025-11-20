// src/controllers/excelMerge.controller.js
import { mergeService } from "../services/excelMerge.service.js";

export async function mergeController(req, res) {
  try {
    const bookingFile = req.files?.booking?.[0];
    const programaFile = req.files?.programa?.[0];

    if (!bookingFile || !programaFile) {
      return res.status(400).json({ message: "Debes enviar ambos archivos: booking y programa" });
    }

    const data = await mergeService({
      bookingPath: bookingFile.path,
      programaPath: programaFile.path
    });

    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error al procesar los Excel",
      error: error.message
    });
  }
}
