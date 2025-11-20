function cleanText(value) {
    if (!value) return "";

    return value
        .toString()
        .normalize("NFD")                // separa tildes
        .replace(/[\u0300-\u036f]/g, "") // elimina tildes
        .replace(/\s+/g, " ")            // unifica espacios
        .trim()
        .toUpperCase();
}

function mapEstadoMaquila(raw) {
    console.log('maqui', raw)
    const v = cleanText(raw);

    if (v.includes("PLANTA PROPIA")) return 1;
    if (v.includes("PLANTA TERCERA")) return 2;

    return 3; // cualquier otro texto raro
}

export function normalizeEstadoMaquila(data, rawEstado) {
    const tipoEstado = mapEstadoMaquila(rawEstado);
    data.IdEstadoMaquila = tipoEstado;

    // Si NO es planta tercera → reseteamos campos relacionados
    if (tipoEstado !== 2) {
        data.TotalCajas = 0;
        data.TotalKilos = 0;
        data.FacturaPlanta = "";
        data.EmisionDocumento = null;
        data.MontoMaquila = 0;
    }

    return data;
}
