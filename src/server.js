const http = require("http");
const fs = require("fs/promises");
const path = require("path");
const handleItemsRoutes = require("./routes/items");

const PORT = 3000;
const PUBLIC_PATH = path.join(__dirname, "..", "public");

const MIME_TYPES = {
    ".html": "text/html",
    ".css": "text/css",
    ".js": "text/javascript",
    ".json": "application/json",
    ".png": "image/png",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif"
};

const server = http.createServer(async (req, res) => {
    // Imprimir peticiones
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);

    // Rutas API (items.js)
    if (handleItemsRoutes(req, res)) return;

    // Archivos estáticos
    try {
        // Saca la ruta y la extensión de la URL según lo que venga en la petición
        const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
        let pathname = parsedUrl.pathname === "/" ? "/index.html" : parsedUrl.pathname;
        const ext = path.extname(pathname);
        const fullPath = path.join(PUBLIC_PATH, pathname);

        // Tipo de contenido según extensión y contenido desde la ruta obtenida
        let contentType = MIME_TYPES[ext] || "text/plain";

        // Fix de Codificación para archivos de texto (Fase 5)
        if (contentType.startsWith('text/') || contentType === 'application/json') {
            contentType += '; charset=utf-8';
        }

        const content = await fs.readFile(fullPath);

        res.writeHead(200, { "Content-Type": contentType });
        res.end(content);
    } catch (err) {
        // Captura el error y lo muestra
        const statusCode = err.code === "ENOENT" ? 404 : err.statusCode || 500;

        res.writeHead(statusCode, { "Content-Type": "text/plain" });
        res.end(`${statusCode} - ${err.message}`);
    }
});

server.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});