import { programaMapping } from "../mappings/programa.js";
import {
    getProductoByCampanha,
    findPuertoByName,
    findACByName,
    findMonedaByName
} from "../repositories/programa.repository.js";

import { excelDateToJSDate } from "../utils/excel.js";
import { normalizeEstadoMaquila } from "../utils/programa.helper.js";
import { cleanTemperature, cleanValue, getMappedExcelKey, normalizeDecimal, normalizeVarchar, toBit, toNumber } from "../utils/sanitizadores.js";

export async function normalizeProgramaRow(raw) {

    const data = {};
    // 1. Aplicamos mapeo Excel → parámetros
    for (const paramName in programaMapping) {
        const excelColumnName = programaMapping[paramName];

        const realKey = getMappedExcelKey(raw, excelColumnName);
        let valor = realKey ? raw[realKey] : "";

        // NO convertir fechas serializadas a string
        if (typeof valor === "number") {
            // probablemente fecha → dejar así
        } else if (valor != null) {
            valor = String(valor);
        }

        valor = cleanValue(valor);
        data[paramName] = valor ?? "";
    }

    // 2. FECHAS IMPORTANTES
    const fRegistroPrograma = excelDateToJSDate(data.FechaRegistro);
    data.FechaRegistro = fRegistroPrograma instanceof Date && !isNaN(fRegistroPrograma)
        ? fRegistroPrograma
        : new Date();

    data.ETA = excelDateToJSDate(data.ETA) || null;
    data.ETD = excelDateToJSDate(data.ETD) || null;
    data.FechaEmisionMaquila = excelDateToJSDate(data.FechaEmisionMaquila) || null;
    data.FechaEmision = excelDateToJSDate(data.FechaEmision) || null;

    // 3. Obtener IdProducto según campaña
    const prod = await getProductoByCampanha(data.IdCampanha);
    if (!prod) {
        throw new Error(`No existe IdProducto para IdCampanha ${data.IdCampanha}`);
    }
    data.IdProducto = prod.IdProducto;

    // 4. Normalizar puertos
    const puertos = ["IdPuertoEmbarque", "IdPuertoDestino"];
    for (const campo of puertos) {
        let val = cleanValue(data[campo]);

        if (!val) {
            data[campo] = 0;
        }
        else if (isNaN(val)) {
            const puerto = await findPuertoByName(val);
            data[campo] = puerto ? puerto.id_puerto : 0;
        }
        else {
            data[campo] = Number(val);
        }
    }

    // 5. AC → IdTecnologia
    let acVal = cleanValue(data.IdTecnologia);
    if (!acVal) {
        data.IdTecnologia = 0;
    }
    else if (isNaN(acVal)) {
        const ac = await findACByName(acVal);
        data.IdTecnologia = ac ? ac.IdTecnologia : 0;
    }
    else {
        data.IdTecnologia = Number(acVal);
    }

    // 6. Moneda → IdMoneda
    let monedaVal = cleanValue(data.IdMoneda);
    if (!monedaVal) {
        data.IdMoneda = 0;
    }
    else if (isNaN(monedaVal)) {
        const m = await findMonedaByName(monedaVal);
        data.IdMoneda = m ? m.id_moneda : 0;
    }
    else {
        data.IdMoneda = Number(monedaVal);
    }

    // 7. Normalizar campos numéricos
    const camposNumericos = [
        "IdCampanha", "IdDestinatario", "IdPuertoEmbarque", "IdPuertoDestino",
        "ETASemana", "ETDSemana", "DiasTransito", "IdPlanta", "IdProducto",
        "IdVariedad", "IdTecnologia", "IdOperadorLogistico", "IdIcoterm",
        "IdMoneda", "FOB", "PesoNeto", "PesoBruto", "IdTerminoPago",
        "TotalCajas", "TotalKilos", "MontoMaquila"
    ];

    camposNumericos.forEach(c => {
        if (c in data) {
            data[c] = toNumber(data[c]);
        }
    });


    // 8. Campos BIT
    const camposBit = ["LAR"];
    camposBit.forEach(c => {
        if (c in data) data[c] = toBit(data[c]);
    });

    // 9. Estado Maquila
    normalizeEstadoMaquila(data, raw["ESTADOMAQUILA"]);
    // 10. LAR desde raw
    const rawLAR = cleanValue(raw["LAR"]);
    data.LAR = rawLAR ? 1 : 0;

    // 11. LOADINGDATE → FechaCarga + HoraCarga
    let loadingRaw = raw["LOADING DATE"];
    data.FechaCarga = "";
    data.HoraCarga = "";

    if (loadingRaw !== null && loadingRaw !== undefined && loadingRaw !== "") {

        // Caso 1: Excel entrega número (fecha serial)
        if (typeof loadingRaw === "number") {

            // Convertir número Excel → fecha JS (serial base 1899-12-30)
            const excelEpoch = new Date(1899, 11, 30);

            const fechaCompleta = new Date(
                excelEpoch.getTime() + loadingRaw * 24 * 60 * 60 * 1000
            );

            // Separar fecha y hora
            data.FechaCarga = new Date(
                fechaCompleta.getFullYear(),
                fechaCompleta.getMonth(),
                fechaCompleta.getDate()
            );

            data.HoraCarga = fechaCompleta
                .toTimeString()
                .split(" ")[0]  // hh:mm:ss
                .substring(0, 5); // hh:mm

        } else {
            // Caso 2: Excel entrega texto (4/09/2023 09:00)
            loadingRaw = String(loadingRaw);

            const match = loadingRaw.match(
                /^(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})(?:\s+(\d{1,2}:\d{2}(?::\d{2})?))?/i
            );

            if (match) {
                const fechaTxt = match[1];
                const horaTxt = match[2] || "";

                const fecha = excelDateToJSDate(fechaTxt);

                data.FechaCarga = fecha instanceof Date && !isNaN(fecha) ? fecha : "";
                data.HoraCarga = horaTxt.trim();
            }
        }
    }
    data.Temperatura = cleanTemperature(data.Temperatura);
    data.Monto = normalizeDecimal(data.Monto);
    data.Senasa = normalizeVarchar(data.Senasa);
    data.GuiaRemision = normalizeVarchar(data.GuiaRemision);
    data.Po = normalizeVarchar(data.Po);
    data.Invoice = normalizeVarchar(data.Invoice);
    data.NumeroFactura = normalizeVarchar(data.NumeroFactura);
    data.PedidoDinamic = normalizeVarchar(data.PedidoDinamic);

    return data;
}
