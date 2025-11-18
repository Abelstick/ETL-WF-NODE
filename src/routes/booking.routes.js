import { Router } from "express";
import upload from "../middlewares/uploadExcel.js";
import { uploadBooking } from "../controllers/booking.controller.js";

const router = Router();

router.post("/booking", upload.single("excel"), uploadBooking);

export default router;
