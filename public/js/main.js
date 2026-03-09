import { getItems, getItem, createItem, updateItem, deleteItem } from "./services/api.js";
import { renderItems, resetForm, fillForm } from "./ui/ui.js";

const form = document.getElementById("itemForm");
const tableBody = document.getElementById("itemsTable");
const submitBtn = document.getElementById("submitBtn");
let editingId = null;

// Elementos del Modal
const addModal = document.getElementById("addModal");
const openAddModalBtn = document.getElementById("openAddModalBtn");
const closeAddModalBtn = document.getElementById("closeAddModalBtn");

// Eventos del Modal
openAddModalBtn.addEventListener("click", () => {
    resetForm(form, submitBtn);
    editingId = null;
    addModal.style.display = "block";
});

closeAddModalBtn.addEventListener("click", () => {
    addModal.style.display = "none";
});

window.addEventListener("click", (e) => {
    if (e.target === addModal) {
        addModal.style.display = "none";
    }
});

// Eventos de tabla (delegación)
tableBody.addEventListener("click", async (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;

    const id = Number(btn.dataset.id);

    if (btn.classList.contains("btn-delete")) {
        const confirmacion = confirm("¿Está seguro de que desea borrar este producto?");
        if (!confirmacion) return;
        try {
            await deleteItem(id);
            loadItems();
        } catch (err) {
            console.error("Error eliminando:", err);
            alert("No se pudo eliminar el item.");
        }
    } else if (btn.classList.contains("btn-edit")) {
        try {
            if (editingId === id) {
                resetForm(form, submitBtn);
                editingId = null;
                addModal.style.display = "none";
                return;
            }
            const item = await getItem(id);
            fillForm(form, item, submitBtn);
            editingId = id;
            addModal.style.display = "block";
        } catch (err) {
            console.error("Error cargando item:", err);
            alert("No se pudo cargar el item para edición.");
        }
    }
});

// Envío del form
form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = form.querySelector("#name").value;
    const description = form.querySelector("#description").value;
    const precio = document.getElementById("precio").value;
    const categoria = document.getElementById("categoria").value;
    const stock = document.getElementById("stock").value;
    const fecha = document.getElementById("fecha").value;
    const imageUrl = document.getElementById("imageUrl").value; // NUEVA PROPIEDAD

    if (!name || !precio || !categoria || !stock || !fecha) {
        alert("Todos los campos obligatorios deben ser llenados");
        return;
    }

    try {
        if (editingId) {
            await updateItem(editingId, { name, description, precio, categoria, stock, fecha, imageUrl });
            editingId = null;
        } else {
            await createItem({ name, description, precio, categoria, stock, fecha, imageUrl });
        }

        resetForm(form, submitBtn);
        addModal.style.display = "none";
        loadItems();
    } catch (err) {
        console.error("Error guardando item:", err);
        alert("No se pudo guardar el item.");
    }
});

// Cargar al inicio
async function loadItems() {
    try {
        const items = await getItems();
        renderItems(items, tableBody);
    } catch (err) {
        console.error("Error cargando lista:", err);
        alert("No se pudieron cargar los items.");
    }
}

loadItems();