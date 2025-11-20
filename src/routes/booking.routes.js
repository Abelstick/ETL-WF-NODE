import { Router } from "express";
import upload from "../middlewares/uploadExcel.js";
import { uploadBooking } from "../controllers/booking.controller.js";
import { uploadPrograma } from "../controllers/programa.controller.js";
import { mergeController } from "../controllers/excelMerge.controller.js";

const router = Router();

router.post("/booking", upload.single("excel"), uploadBooking);

router.post("/programa", upload.single("excel"), uploadPrograma);

router.post(
    "/embarquebase",
    upload.fields([
        { name: "booking", maxCount: 1 },
        { name: "programa", maxCount: 1 }
    ]),
    mergeController
);


export default router;
