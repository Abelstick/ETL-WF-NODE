import { Router } from "express";
import upload from "../middlewares/uploadExcel.js";
import { uploadBooking } from "../controllers/booking.controller.js";
import { uploadPrograma } from "../controllers/programa.controller.js";

const router = Router();

router.post("/booking", upload.single("excel"), uploadBooking);

router.post("/programa", upload.single("excel"), uploadPrograma);

export default router;
