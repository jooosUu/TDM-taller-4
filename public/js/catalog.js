import { getItems, getItem } from "./services/api.js";

const catalogContainer = document.getElementById("catalogContainer");
const carouselTrack = document.getElementById("carouselTrack");
const carouselPrev = document.getElementById("carouselPrev");
const carouselNext = document.getElementById("carouselNext");
const filterPills = document.getElementById("filterPills");
const modal = document.getElementById("detailModal");
const modalDetails = document.getElementById("modalDetails");
const closeBtn = document.querySelector(".close-btn");
const searchInput = document.getElementById("searchInput");

let allItems = [];
let activeCategory = "all";

// =====================================
// Modal: cerrar
// =====================================
closeBtn.onclick = () => { modal.style.display = "none"; }
window.onclick = (e) => { if (e.target == modal) modal.style.display = "none"; }

// =====================================
// Carousel: scroll con flechas
// =====================================
carouselPrev.addEventListener("click", () => {
    carouselTrack.scrollBy({ left: -300, behavior: "smooth" });
});
carouselNext.addEventListener("click", () => {
    carouselTrack.scrollBy({ left: 300, behavior: "smooth" });
});

// Renderizar tarjetas dentro del carousel
function renderCarousel(items) {
    carouselTrack.innerHTML = "";
    items.forEach(item => {
        const img = item.imageUrl && item.imageUrl.trim() !== ""
            ? item.imageUrl : "https://picsum.photos/seed/shoe/400/300";
        const card = document.createElement("div");
        card.className = "carousel-card";
        card.innerHTML = `
            <div class="carousel-card-img">
                <img src="${img}" alt="${item.name}">
            </div>
            <div class="carousel-card-info">
                <span class="badge">${item.categoria || 'General'}</span>
                <span class="price">$ ${item.precio !== undefined ? item.precio.toLocaleString('es-CO') : 0}</span>
            </div>
            <h3>${item.name}</h3>
            <button class="btn-detail" data-id="${item.id}">VER DETALLES</button>
        `;
        attachDetailEvent(card, item);
        carouselTrack.appendChild(card);
    });
}

// =====================================
// Filtros por categoría
// =====================================
function buildFilters(items) {
    const categories = [...new Set(items.map(i => i.categoria).filter(Boolean))];
    filterPills.innerHTML = '<button class="filter-pill active" data-category="all">Todos</button>';
    categories.forEach(cat => {
        const pill = document.createElement("button");
        pill.className = "filter-pill";
        pill.dataset.category = cat;
        pill.textContent = cat;
        filterPills.appendChild(pill);
    });

    filterPills.addEventListener("click", (e) => {
        if (!e.target.classList.contains("filter-pill")) return;
        filterPills.querySelectorAll(".filter-pill").forEach(p => p.classList.remove("active"));
        e.target.classList.add("active");
        activeCategory = e.target.dataset.category;
        applyFilters();
    });
}

// =====================================
// Búsqueda en tiempo real
// =====================================
if (searchInput) {
    searchInput.addEventListener("input", () => { applyFilters(); });
}

function applyFilters() {
    const query = searchInput ? searchInput.value.toLowerCase().trim() : "";
    let filtered = allItems;

    if (activeCategory !== "all") {
        filtered = filtered.filter(i => i.categoria === activeCategory);
    }
    if (query) {
        filtered = filtered.filter(i =>
            i.name.toLowerCase().includes(query) ||
            (i.categoria && i.categoria.toLowerCase().includes(query)) ||
            (i.description && i.description.toLowerCase().includes(query))
        );
    }
    renderGrid(filtered);
}

// =====================================
// Grid completo de productos
// =====================================
function renderGrid(items) {
    catalogContainer.innerHTML = "";
    if (items.length === 0) {
        catalogContainer.innerHTML = "<p class='no-results'>No se encontraron productos.</p>";
        return;
    }
    items.forEach(item => renderItem(item));
}

function renderItem(item) {
    const card = document.createElement("div");
    card.className = "card";

    const resolvedImage = item.imageUrl && item.imageUrl.trim() !== ""
        ? item.imageUrl : "https://picsum.photos/seed/shoe/400/300";

    card.innerHTML = `
        <div class="card-img-wrapper">
            <img class="card-img" src="${resolvedImage}" alt="${item.name}">
        </div>
        <div class="card-content">
            <div class="card-row">
                <span class="badge">${item.categoria || 'General'}</span>
                <span class="price">$ ${item.precio !== undefined ? item.precio.toLocaleString('es-CO') : 0}</span>
            </div>
            <h3 class="card-title">${item.name}</h3>
            <p class="card-stock">Disponibles: ${item.stock !== undefined ? item.stock : 0} pares</p>
            <button class="btn-detail" data-id="${item.id}">VER DETALLES</button>
        </div>
    `;

    attachDetailEvent(card, item);
    catalogContainer.appendChild(card);
}

// =====================================
// Evento de detalle (modal)
// =====================================
function attachDetailEvent(cardEl, item) {
    const btn = cardEl.querySelector(".btn-detail");
    btn.addEventListener("click", async () => {
        try {
            const fullItem = await getItem(item.id);
            const modalImage = fullItem.imageUrl && fullItem.imageUrl.trim() !== ""
                ? fullItem.imageUrl : "https://picsum.photos/seed/shoe/400/300";

            modalDetails.innerHTML = `
                <div class="modal-product">
                    <div class="modal-product-img">
                        <img src="${modalImage}" alt="${fullItem.name}">
                    </div>
                    <div class="modal-product-info">
                        <h2>${fullItem.name}</h2>
                        <span class="modal-badge">${fullItem.categoria || "General"}</span>
                        <p class="modal-price">$ ${fullItem.precio !== undefined ? fullItem.precio.toLocaleString('es-CO') : "N/A"} <small>COP</small></p>
                        <p class="modal-description">${fullItem.description || "Sin descripción disponible."}</p>
                        <div class="modal-meta">
                            <p><strong>Disponibles:</strong> ${fullItem.stock !== undefined ? fullItem.stock : "0"} pares</p>
                            <p><strong>Fecha de ingreso:</strong> ${fullItem.fecha || "N/A"}</p>
                        </div>
                        <p class="modal-ref">Ref: ${fullItem.id}</p>
                    </div>
                </div>
            `;
            modal.style.display = "block";
        } catch (err) {
            console.error("Error abriendo detalle:", err);
            alert("No se pudo cargar el detalle.");
        }
    });
}

// =====================================
// Inicialización
// =====================================
async function loadCatalog() {
    try {
        allItems = await getItems();
        renderCarousel(allItems);
        buildFilters(allItems);
        renderGrid(allItems);
    } catch (err) {
        console.error("Error cargando catálogo:", err);
        catalogContainer.innerHTML = `<p style="color:red;">Error: ${err.message}</p>`;
    }
}

document.addEventListener("DOMContentLoaded", () => { loadCatalog(); });