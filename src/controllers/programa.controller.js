import { processProgramaExcel } from "../services/programa.service.js";

export async function uploadPrograma(req, res) {
  try {
    const result = await processProgramaExcel(req.file.path);
    res.json({
      message: "Archivo procesado correctamente",
      ...result
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
