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

    // Convertir a string
    let str = String(value).trim();

    // 1) Quitar caracteres invisibles (NBSP, BOM, ZERO-WIDTH)
    str = str.replace(/[\u00A0\u200B-\u200D\uFEFF]/g, "");

    // 2) Quitar texto basura (KGS, KG, $, TON, etc.)
    str = str.replace(/[^\d.,-]/g, "");

    // 3) Si tiene punto y coma → formato US → quitar comas
    if (str.includes(",") && str.includes(".")) {
        str = str.replace(/,/g, "");
    }
    else if (str.includes(",") && !str.includes(".")) {
        // Caso solo comas: decidir si es decimal LATAM
        const parts = str.split(",");
        if (parts[1]?.length === 2) {
            // decimal LATAM → "62,50" → "62.50"
            str = parts[0] + "." + parts[1];
        } else {
            // separador de miles → quitar comas
            str = str.replace(/,/g, "");
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