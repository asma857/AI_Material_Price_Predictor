const API = "http://127.0.0.1:8000";



// Generic fetch
async function fetchJSON(endpoint, params = {}) {
    const url = new URL(API + endpoint);
    Object.keys(params).forEach(k => url.searchParams.append(k, params[k]));
    const response = await fetch(url);
    return response.json();
}



// Load Regions
async function loadRegions() {
    let data = await fetchJSON("/regions");
    let regions = data.items || [];

    const REGION_NAMES = {
        "BKH": "Béni Mellal-Khénifra",
        "SM": "Souss-Massa",
        "RSK": "Rabat-Salé-Kénitra",
        "TTAH": "Tanger-Tétouan-Al Hoceima",
        "MS": "Marrakech-Safi",
        "FM": "Fès-Meknès",
        "CS": "Casablanca-Settat",
        "ORI": "Oriental",
        "DT": "Drâa-Tafilalet",
        "GON": "Guelmim-Oued Noun",
        "LSH": "Laâyoune-Sakia El Hamra",
        "EOD": "Dakhla-Oued Ed-Dahab"
    };

    const select = document.getElementById("region");
    select.innerHTML = "";

    regions.forEach(code => {
        let opt = document.createElement("option");
        opt.value = code;
        opt.textContent = REGION_NAMES[code] || code;
        select.appendChild(opt);
    });
}




// Load Products
async function loadProduits() {
    let data = await fetchJSON("/produits");
    let produits = data.items || [];

    const select = document.getElementById("product");
    select.innerHTML = "";

    produits.forEach(p => {
        let opt = document.createElement("option");
        opt.value = p;
        opt.textContent = p;
        select.appendChild(opt);
    });
}



// Load Varieties
async function loadVarietes(produit) {
    let data = await fetchJSON("/varietes", { produit });
    let varietes = data.items || [];

    const select = document.getElementById("variety");
    select.innerHTML = "";

    varietes.forEach(v => {
        let opt = document.createElement("option");
        opt.value = v;
        opt.textContent = v;
        select.appendChild(opt);
    });
}



// Prediction
async function predictPrice() {
    let region = document.getElementById("region").value;
    let produit = document.getElementById("product").value;
    let variete = document.getElementById("variety").value;
    let year = document.getElementById("year").value;

    const resultDiv = document.getElementById("result");
    resultDiv.innerHTML = "<p style='color:white;'>⏳ Loading...</p>";

    let result = await fetchJSON("/predict", {
        region,
        produit,
        variete,
        annee: year
    });

    if (result.detail) {
        resultDiv.innerHTML =
            `<div class="error-card glass">❌ ${result.detail}</div>`;
        return;
    }

    resultDiv.innerHTML = `
        <div class="result-card glass">
            <h3>Predicted Price for ${year}</h3>
            <p class="price">${result.prix} MAD</p>
        </div>`;
}

// Navigation
function openPage(page) {
    document.querySelectorAll(".page").forEach(p => p.classList.add("hidden"));
    document.getElementById(page).classList.remove("hidden");
}



// Page init
document.addEventListener("DOMContentLoaded", () => {

    loadRegions();
    loadProduits();

    document.getElementById("product").addEventListener("change", e => {
        loadVarietes(e.target.value);
    });

    // load years
    const yearSelect = document.getElementById("year");
    for (let y = 2005; y <= 2030; y++) {
        let opt = document.createElement("option");
        opt.value = y;
        opt.textContent = y;
        yearSelect.appendChild(opt);
    }

    document.getElementById("predictBtn")
        .addEventListener("click", predictPrice);
});




function startFlowTransition() {
    const flow = document.getElementById("flowTransition");

    // Expand flow overlay
    flow.style.height = "100%";

    // After animation → switch page
    setTimeout(() => {
        openPage("predict");
        
        // Close flow (return to 0)
        flow.style.height = "0%";
    }, 900);
}
