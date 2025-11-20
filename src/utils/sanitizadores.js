// Limpia espacios, saltos de línea, tabs, etc.
function cleanValue(value) {
    if (value === null || value === undefined) return null;

    if (typeof value === "string") {
        const cleaned = value.replace(/\s+/g, " ").trim();
        return cleaned === "" ? null : cleaned;
    }

    return value;
}

// Convierte a número seguro
function toNumber(value) {
    if (value == null || value === "") return 0;

    // Si ya es número
    if (typeof value === "number") return value;

    let str = String(value).trim();

    // Quitar caracteres invisibles
    str = str.replace(/[\u00A0\u200B-\u200D\uFEFF]/g, "");

    // Quitar letras y símbolos (KGS, KG, $, TON...)
    str = str.replace(/[^\d.,-]/g, "");

    // --- NUEVA LÓGICA PARA CASOS COMO "25.510.00" ---
    const countDots = (str.match(/\./g) || []).length;
    const countCommas = (str.match(/,/g) || []).length;

    // Caso: múltiples puntos → reconstruir número
    if (countDots > 1 && countCommas === 0) {
        // "25.510.00" → quitar todos los puntos menos el último
        const parts = str.split(".");
        const decimal = parts.pop();         // último → decimal
        const integer = parts.join("");      // unir los demás como miles
        str = integer + "." + decimal;       // reconstruir
    }

    // Si tiene punto y coma → formato US → quitar comas
    if (str.includes(",") && str.includes(".")) {
        str = str.replace(/,/g, "");
    }
    else if (str.includes(",") && !str.includes(".")) {
        const parts = str.split(",");
        if (parts[1]?.length === 2) {
            str = parts[0] + "." + parts[1]; // decimal latam
        } else {
            str = str.replace(/,/g, "");     // separador de miles
        }
    }

    const num = Number(str);
    return isNaN(num) ? 0 : num;
}



function toBit(value) {
    const cleaned = cleanValue(value);

    if (cleaned === null) return 0;

    const v = String(cleaned).toLowerCase();

    if (["1", "si", "true"].includes(v)) return 1;
    if (["0", "no", "false", ""].includes(v)) return 0;

    return 0;
}


function normalizeVarcharNumber(value) {
    const v = cleanValue(value);

    // Si viene vacío, guion o null → enviar "0"
    if (v === "" || v === "-" || v === null) return "0";

    // Si es un número válido (incluye negativos)
    if (!isNaN(Number(v))) return String(v);

    return "0";
}

function getMappedExcelKey(raw, excelCol) {
    const rawKeys = Object.keys(raw);
    // Buscar coincidencia exacta (rápido)
    if (rawKeys.includes(excelCol)) return excelCol;

    // Buscar coincidencia case-insensitive
    const found = rawKeys.find(k => k.toLowerCase() === excelCol.toLowerCase());
    return found ?? null;
}

function normalizeDecimal(value) {
    if (value === null || value === undefined) return null;

    if (typeof value === "string") {
        // Eliminar separadores de miles (comas)
        const clean = value.replace(/,/g, "");
        const num = parseFloat(clean);
        return isNaN(num) ? null : num;
    }

    if (typeof value === "number") return value;

    return null;
}




export { cleanValue, toNumber, toBit, normalizeVarcharNumber, getMappedExcelKey, normalizeDecimal };