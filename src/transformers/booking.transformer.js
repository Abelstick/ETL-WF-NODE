import { bookingMapping } from "../mappings/booking.js";
import { getProductoByCampanha, findPuertoByName, findLugarEmisionBLByName } from "../repositories/booking.repository.js";
import { excelDateToJSDate } from "../utils/excel.js";
import { cleanValue, normalizeVarcharNumber, toBit, toNumber } from "../utils/sanitizadores.js";

export async function normalizeBookingRow(raw) {
    const data = {};

    // Aplicamos mapeo Excel → parámetros
    for (const excelCol in bookingMapping) {
        const param = bookingMapping[excelCol];
        let valor = raw[excelCol] ?? "";

        // Forzar a string
        if (valor != null && typeof valor !== "string") {
            valor = String(valor);
        }

        // Limpiar espacios, saltos de línea, tabs
        valor = cleanValue(valor);

        // Si es un campo obligatorio y sigue vacío, lo dejamos como ""
        const camposVarchar = [
            "Booking", "Nave", "Viaje", "Rumbo", "SCO",
            "O2", "CO2", "HumedadPorcentaje", "CbmHr",
            "ObsCondicionFlete", "ObsLugarEmisionBL",
            "Customer", "LugarPagoBL", "TransbordoObservaciones",
            "Temperatura"
        ];

        if (camposVarchar.includes(param) && (!valor || valor === "")) {
            valor = "";
        }

        data[param] = valor;
    }

    // FechaReserva
    const fReserva = excelDateToJSDate(data.FechaReserva);
    data.FechaReserva = fReserva instanceof Date && !isNaN(fReserva) ? fReserva : new Date();


    // Normalizar ETA y ETD
    data.ETA = excelDateToJSDate(data.ETA) || null;
    data.ETD = excelDateToJSDate(data.ETD) || null;


    // Obtener IdProducto según campaña
    const prod = await getProductoByCampanha(data.IdCampanha);
    if (!prod) throw new Error(`No existe IdProducto para IdCampanha ${data.IdCampanha}`);
    data.IdProducto = prod.IdProducto;

    // Campos de puertos
    const puertosCampos = ["IdPuertoEmbarque", "IdPuertoDestino", "IdPuertoTransbordo"];
    for (const campo of puertosCampos) {
        let val = cleanValue(data[campo]);

        if (!val) {
            data[campo] = 0;
        } else if (isNaN(val)) {
            const puerto = await findPuertoByName(val);
            data[campo] = puerto ? puerto.id_puerto : 0;
        } else {
            data[campo] = Number(val);
        }
    }

    // Lugar Emisión BL
    let valLugar = cleanValue(data.IdLugarEmisionBL);
    if (!valLugar) {
        data.IdLugarEmisionBL = 0;
    } else if (isNaN(valLugar)) {
        const lugar = await findLugarEmisionBLByName(valLugar);
        data.IdLugarEmisionBL = lugar ? lugar.IdLugarEmisionBL : 0;
    } else {
        data.IdLugarEmisionBL = Number(valLugar);
    }

    const camposNumericos = [
        "IdTecnologia",
        "IdCondicionFlete",
        "IdLugarEmisionBL",
        "IdProveedorFlete",
        "IdIcoterm",
        "CantidadContenedorSolicitados",
        "CantidadContenedorAsignados"
    ];


    camposNumericos.forEach(campo => {
        if (campo in data) data[campo] = toNumber(data[campo]);
    });

    // Campos BIT
    const camposBit = [
        "Humedad",
        "Ventilacion",
        "Transbordo",
        "TransbordoM1P",
        "AtmosferaControlada",
        "ColdTreatment",
        "Refrigerado"
    ];

    camposBit.forEach(campo => {
        if (campo in data) data[campo] = toBit(data[campo]);
    });

    const camposVarcharNumericos = [
        "O2", "CO2", "HumedadPorcentaje", "CbmHr", "Temperatura"
    ];

    camposVarcharNumericos.forEach(campo => {
        if (campo in data) {
            data[campo] = normalizeVarcharNumber(data[campo]);
        }
    });
    return data;
}
