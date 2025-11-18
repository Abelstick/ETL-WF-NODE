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
    if (value === null || value === undefined) return null;
    const n = Number(value);
    return isNaN(n) ? null : n;
}

function toBit(value) {
    const v = cleanValue(value).toLowerCase();
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

    // Cualquier otro caso raro → 0
    return "0";
}

export { cleanValue, toNumber, toBit, normalizeVarcharNumber };