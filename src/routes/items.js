const fs = require("fs");
const path = require("path");

const DATA_PATH = path.join(__dirname, "..", "data", "items.json");

function readData() {
    return JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));
}

function writeData(data) {
    fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
}

function handleItemsRoutes(req, res) {
    if (!req.url.startsWith("/api/items")) return false;

    res.setHeader("Content-Type", "application/json");

    // GET /api/items
    if (req.method === "GET" && req.url === "/api/items") {
        res.end(JSON.stringify(readData()));
        return true;
    }

    // GET /api/items/:id
    if (req.method === "GET" && req.url.startsWith("/api/items/")) {
        const id = parseInt(req.url.split("/").pop());

        if (!isNaN(id)) {
            const item = readData().find(i => i.id === id);
            res.end(JSON.stringify(item || { error: "No encontrado" }));
            return true;
        }
    }

    // POST /api/items
    if (req.method === "POST" && req.url === "/api/items") {
        let body = "";
        req.on("data", chunk => body += chunk);
        req.on("end", () => {
            const items = readData();
            const { name, description, precio, categoria, stock, fecha, imageUrl } = JSON.parse(body);

            // Validación básica
            if (!name) {
                res.writeHead(400, { "Content-Type": "application/json" });
                return res.end(JSON.stringify({ error: "El nombre es obligatorio" }));
            }

            const newItem = {
                id: Date.now(), // Generar un ID simple y único
                name,
                description: description || "",
                precio: precio !== undefined ? Number(precio) : 0,
                categoria: categoria || "Sin categoría",
                stock: stock !== undefined ? Number(stock) : 0,
                fecha: fecha || new Date().toISOString().split('T')[0],
                imageUrl: imageUrl || "https://picsum.photos/seed/shoe/400/300" // Placeholder por defecto
            };
            items.push(newItem);
            writeData(items);
            res.end(JSON.stringify(newItem));
        });
        return true;
    }

    // PUT /api/items/:id
    if (req.method === "PUT" && req.url.startsWith("/api/items/")) {
        const id = parseInt(req.url.split("/").pop());

        if (!isNaN(id)) {
            let body = "";
            req.on("data", chunk => body += chunk);
            req.on("end", () => {
                const items = readData();
                const index = items.findIndex(i => i.id == id);
                if (index !== -1) {
                    const { name, description, precio, categoria, stock, fecha, imageUrl } = JSON.parse(body);
                    items[index] = {
                        ...items[index],
                        name: name || items[index].name,
                        description: description || items[index].description,
                        precio: precio !== undefined ? Number(precio) : items[index].precio,
                        categoria: categoria || items[index].categoria,
                        stock: stock !== undefined ? Number(stock) : items[index].stock,
                        fecha: fecha || items[index].fecha,
                        imageUrl: imageUrl || items[index].imageUrl
                    };
                    writeData(items);
                    res.end(JSON.stringify(items[index]));
                } else {
                    res.end(JSON.stringify({ error: "No encontrado" }));
                }
            });
            return true;
        }
    }

    // DELETE /api/items/:id
    if (req.method === "DELETE" && req.url.startsWith("/api/items/")) {
        const id = parseInt(req.url.split("/").pop());

        if (!isNaN(id)) {
            let items = readData();
            const newItems = items.filter(i => i.id !== id);

            if (newItems.length !== items.length) {
                writeData(newItems);
                res.end(JSON.stringify({ mensaje: "Eliminado" }));
            } else {
                res.end(JSON.stringify({ error: "No encontrado" }));
            }
            return true;
        }
    }

    return false;
}

module.exports = handleItemsRoutes;