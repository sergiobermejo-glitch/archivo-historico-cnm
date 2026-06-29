/*
=========================================================
 Archivo Histórico CNM
 Generador automático de records
 Versión 2.0
=========================================================
*/

const fs = require("fs");
const path = require("path");
const XLSX = require("xlsx");

//=========================================================
// CONFIGURACIÓN
//=========================================================

const STRICT_MODE = false;

const DATA_FOLDER = path.join(__dirname, "data");
const OUTPUT_FILE = path.join(__dirname, "..", "public", "records.json");

//=========================================================
// CATÁLOGO OFICIAL DE PRUEBAS
//=========================================================

const OFFICIAL_EVENTS = {
    "25": [
        "50 Libre",
        "100 Libre",
        "200 Libre",
        "400 Libre",
        "800 Libre",
        "1500 Libre",

        "50 Espalda",
        "100 Espalda",
        "200 Espalda",

        "50 Braza",
        "100 Braza",
        "200 Braza",

        "50 Mariposa",
        "100 Mariposa",
        "200 Mariposa",

        "100 Estilos",
        "200 Estilos",
        "400 Estilos"
    ],

    "50": [
        "50 Libre",
        "100 Libre",
        "200 Libre",
        "400 Libre",
        "800 Libre",
        "1500 Libre",

        "50 Espalda",
        "100 Espalda",
        "200 Espalda",

        "50 Braza",
        "100 Braza",
        "200 Braza",

        "50 Mariposa",
        "100 Mariposa",
        "200 Mariposa",

        "200 Estilos",
        "400 Estilos"
    ]
};

//=========================================================
// ORDEN DE LAS PRUEBAS
//=========================================================

const EVENT_ORDER = [
    "50 Libre",
    "100 Libre",
    "200 Libre",
    "400 Libre",
    "800 Libre",
    "1500 Libre",

    "50 Espalda",
    "100 Espalda",
    "200 Espalda",

    "50 Braza",
    "100 Braza",
    "200 Braza",

    "50 Mariposa",
    "100 Mariposa",
    "200 Mariposa",

    "100 Estilos",
    "200 Estilos",
    "400 Estilos"
];

//=========================================================
// ESTADÍSTICAS
//=========================================================

const stats = {

    excel: 0,

    registros: 0,

    relevos: 0,

    parciales: 0,

    ignorados: 0,

    duplicados: 0

};

//=========================================================
// LEER TODOS LOS EXCEL
//=========================================================

function getExcelFiles() {

    return fs.readdirSync(DATA_FOLDER)

        .filter(file => file.toLowerCase().endsWith(".xlsx"))

        .map(file => path.join(DATA_FOLDER, file));

}

//=========================================================
// EXTRAER SEXO Y PISCINA DEL NOMBRE DEL ARCHIVO
//=========================================================

function getFileInfo(filePath) {

    const name = path.basename(filePath);

    const pool = name.startsWith("25") ? "25" : "50";

    const gender = name.toLowerCase().includes("masculino")
        ? "Masculino"
        : "Femenino";

    return {

        pool,

        gender

    };

}

//=========================================================
// LEER UN EXCEL
//=========================================================

function readExcel(filePath) {

    const workbook = XLSX.readFile(filePath);

    const sheet = workbook.Sheets[workbook.SheetNames[0]];

    return XLSX.utils.sheet_to_json(sheet, {

        defval: ""

    });

}

//=========================================================
// UTILIDADES
//=========================================================

function isOfficialEvent(pool, event) {

    return OFFICIAL_EVENTS[pool].includes(event);

}

function createKey(pool, gender, event) {

    return `${pool}|${gender}|${event}`;

}

function parseIsNew(value) {

    if (typeof value === "boolean") return value;

    const normalized = String(value || "").trim().toLowerCase();

    return normalized === "true" ||
        normalized === "si" ||
        normalized === "sí" ||
        normalized === "1";

}

//=========================================================
// CONVERSIÓN DE TIEMPOS
//=========================================================

function timeToMilliseconds(time) {

    if (!time) return Number.MAX_SAFE_INTEGER;

    const parts = time.toString().split(":");

    let hours = 0;
    let minutes = 0;
    let seconds = 0;

    if (parts.length === 3) {

        hours = Number(parts[0]);
        minutes = Number(parts[1]);
        seconds = Number(parts[2]);

    }

    else if (parts.length === 2) {

        minutes = Number(parts[0]);
        seconds = Number(parts[1]);

    }

    else {

        seconds = Number(parts[0]);

    }

    return Math.round(

        ((hours * 3600) + (minutes * 60) + seconds) * 1000

    );

}

//=========================================================
// FORMATO PARA LA WEB
//=========================================================

function formatTime(time) {

    if (!time) return "";

    let t = time.toString().trim();

    // Elimina horas si son 00
    if (t.startsWith("00:")) t = t.substring(3);
    // Elimina minutos si también son 00
    if (t.startsWith("00:")) t = t.substring(3);

    return t;

}

function formatDate(excelDate) {

    if (excelDate === "" || excelDate === null || excelDate === undefined) {
        return "";
    }

    if (typeof excelDate === "string" && excelDate.includes("/")) {
        return excelDate;
    }

    const value = Number(excelDate);

    if (isNaN(value)) {
        return String(excelDate);
    }

    const fecha = new Date((value - 25569) * 86400 * 1000);

    const dia = String(fecha.getDate()).padStart(2, "0");
    const mes = String(fecha.getMonth() + 1).padStart(2, "0");
    const anio = fecha.getFullYear();

    return `${dia}/${mes}/${anio}`;

}

function isNewRecord(excelDate) {
    const formattedDate = formatDate(excelDate);

    if (!formattedDate) {
        return false;
    }

    const parts = formattedDate.split("/");

    if (parts.length !== 3) {
        return false;
    }

    const day = Number(parts[0]);
    const month = Number(parts[1]);
    const year = Number(parts[2]);

    if (!day || !month || !year) {
        return false;
    }

    const recordDate = new Date(year, month - 1, day);

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setHours(0, 0, 0, 0);
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    return recordDate >= sixMonthsAgo;
}

//=========================================================
// PROCESAR TODOS LOS REGISTROS
//=========================================================

function processRecords() {

    const bestRecords = new Map();

    const files = getExcelFiles();

    stats.excel = files.length;

    for (const file of files) {

        const info = getFileInfo(file);

        const rows = readExcel(file);

        for (const row of rows) {

            stats.registros++;

            //-------------------------------------------------
            // RELEVOS
            //-------------------------------------------------

            if (
                row["Tipo"] &&
                row["Tipo"].toString().toLowerCase().includes("relevo")
            ) {
                stats.relevos++;
                continue;
            }

            //-------------------------------------------------
            // PARCIALES
            //-------------------------------------------------

            if (
                row["Parcial"] &&
                row["Parcial"].toString().trim().toLowerCase() === "sí"
            ) {
                stats.parciales++;
                continue;
            }

            //-------------------------------------------------
            // PRUEBA
            //-------------------------------------------------

            const prueba = (row["Prueba"] || "").toString().trim();

            if (!prueba) continue;

            if (!isOfficialEvent(info.pool, prueba)) {

                stats.ignorados++;

                console.log("⚠ Prueba ignorada:", prueba);

                continue;

            }

            //-------------------------------------------------
            // MARCA
            //-------------------------------------------------

            const marca = (row["Marca"] || "").toString().trim();

            if (!marca) continue;

            //-------------------------------------------------
            // CLAVE
            //-------------------------------------------------

            const key = createKey(

                info.pool,

                info.gender,

                prueba

            );

            //-------------------------------------------------
            // NUEVO RECORD
            //-------------------------------------------------

            const nuevo = {

                piscina: info.pool,

                sexo: info.gender,

                prueba,

                nombre: String(row["Nombre y Apellidos"] || "").trim(),

                anio: Number(row["Año Nacimiento"] || 0),

                club: String(row["Club"] || "").trim(),

                marca,

                marcaFormateada: formatTime(marca),

                fina: Number(row["Ptos FINA"] || 0),

                fecha: formatDate(row["Fecha"]),

                competicion: String(row["Competición"] || "").trim(),

                lugar: String(row["Lugar"] || "").trim(),

                isNew: isNewRecord(row["Fecha"])

            };

            //-------------------------------------------------
            // ¿EXISTE YA?
            //-------------------------------------------------

            if (!bestRecords.has(key)) {

                bestRecords.set(key, nuevo);

                continue;

            }

            //-------------------------------------------------
            // COMPARAR TIEMPOS
            //-------------------------------------------------

            const actual = bestRecords.get(key);

            const tiempoActual = timeToMilliseconds(actual.marca);

            const tiempoNuevo = timeToMilliseconds(nuevo.marca);

            if (tiempoNuevo < tiempoActual) {

                bestRecords.set(key, nuevo);

                stats.duplicados++;

            }

        }

    }

    return bestRecords;

}
//=========================================================
// ORDENAR RESULTADOS
//=========================================================

function sortRecords(records) {

    return records.sort((a, b) => {

        // Piscina
        if (a.piscina !== b.piscina) {
            return Number(a.piscina) - Number(b.piscina);
        }

        // Sexo
        if (a.sexo !== b.sexo) {
            return a.sexo.localeCompare(b.sexo);
        }

        // Prueba
        return (
            EVENT_ORDER.indexOf(a.prueba) -
            EVENT_ORDER.indexOf(b.prueba)
        );

    });

}

//=========================================================
// VALIDACIÓN
//=========================================================

function validateRecords(records) {

    console.log("");
    console.log("======================================");
    console.log("VALIDACIÓN");
    console.log("======================================");

    let missing = 0;

    ["25", "50"].forEach(pool => {

        ["Masculino", "Femenino"].forEach(gender => {

            const expected = OFFICIAL_EVENTS[pool];

            expected.forEach(event => {

                const exists = records.some(r =>
                    r.piscina === pool &&
                    r.sexo === gender &&
                    r.prueba === event
                );

                if (!exists) {

                    missing++;

                    console.log(
                        `⚠ Falta: ${pool}m - ${gender} - ${event}`
                    );

                }

            });

        });

    });

    console.log("");

    if (missing === 0) {

        console.log("✔ Validación correcta");

    } else {

        console.log(`⚠ Faltan ${missing} récord(s)`);

        if (STRICT_MODE) {

            console.log("");
            console.log("Modo estricto activado.");
            console.log("No se generará records.json.");

            process.exit(1);

        }

    }

}

//=========================================================
// RESUMEN
//=========================================================

function showSummary(records) {

    const m25 = records.filter(r =>
        r.piscina === "25" &&
        r.sexo === "Masculino"
    ).length;

    const f25 = records.filter(r =>
        r.piscina === "25" &&
        r.sexo === "Femenino"
    ).length;

    const m50 = records.filter(r =>
        r.piscina === "50" &&
        r.sexo === "Masculino"
    ).length;

    const f50 = records.filter(r =>
        r.piscina === "50" &&
        r.sexo === "Femenino"
    ).length;

    console.log("");
    console.log("======================================");
    console.log("ARCHIVO HISTÓRICO CNM");
    console.log("======================================");
    console.log("");

    console.log(`Excel leídos .............. ${stats.excel}`);
    console.log(`Registros leídos .......... ${stats.registros}`);
    console.log(`Relevos descartados ....... ${stats.relevos}`);
    console.log(`Parciales descartados ..... ${stats.parciales}`);
    console.log(`Pruebas ignoradas ......... ${stats.ignorados}`);
    console.log(`Récords sustituidos ....... ${stats.duplicados}`);

    console.log("");

    console.log(`25 Masculino .............. ${m25}`);
    console.log(`25 Femenino ............... ${f25}`);
    console.log(`50 Masculino .............. ${m50}`);
    console.log(`50 Femenino ............... ${f50}`);

    console.log("");

    console.log(`TOTAL RÉCORDS ............. ${records.length}`);

    console.log("");

}
//=========================================================
// GUARDAR JSON
//=========================================================

function saveJSON(records) {

    const json = JSON.stringify(records, null, 2);

    fs.writeFileSync(

        OUTPUT_FILE,

        json,

        "utf8"

    );

    console.log("✔ records.json generado correctamente");
    console.log("");

}

//=========================================================
// MAIN
//=========================================================

function main() {

    console.log("");
    console.log("======================================");
    console.log("Archivo Histórico CNM");
    console.log("Generando records...");
    console.log("======================================");
    console.log("");

    const bestRecords = processRecords();

    let records = Array.from(bestRecords.values());

    records = sortRecords(records);

    validateRecords(records);

    saveJSON(records);

    showSummary(records);

}

main();