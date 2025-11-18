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
    if (value === null || value === undefined) return 0;
    const n = Number(value);
    return isNaN(n) ? 0 : n;
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


export { cleanValue, toNumber, toBit, normalizeVarcharNumber, getMappedExcelKey };