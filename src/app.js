import express from "express";
import bookingRoutes from "./routes/booking.routes.js";

const app = express();
app.use(express.json());
app.use("/api", bookingRoutes);

export default app;
