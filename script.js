// Pautan CSV dari Google Sheets anda
const sheetUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQuqNXc-l_KPTK269UOpNoZ0U-TRXSCQCI_SVijjZdU04kYJpEOGtVjHxuqu1ysEEm290Yn_6Fsm8J-/pub?output=csv";

// Ambil data dari Google Sheets
async function fetchInventory() {
    try {
        const response = await fetch(sheetUrl);
        if (!response.ok) throw new Error("Gagal mengambil data dari Google Sheets: " + response.status);
        const text = await response.text();
        // Pisah baris, tangani CSV dengan betul
        const rows = text.split("\n").map(row => {
            const cols = row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
            return cols.map(col => col.replace(/^"|"$/g, "").trim());
        });

        // Lajur pertama ialah header, mula dari baris kedua
        const inventory = rows.slice(1).map(row => ({
            name: row[0] || "",
            model: row[1] || "",
            category: row[2] || "",
            quantity: row[3] || "",
            studio: row[4] || "",
            status: row[5] || ""
        }));
        return inventory.filter(item => item.name && item.model); // Buang baris kosong
    } catch (error) {
        console.error("Gagal ambil data dari Google Sheets:", error);
        document.getElementById("errorMessage").style.display = "block";
        return [];
    }
}

// Papar inventory
function displayInventory(items) {
    const inventoryList = document.getElementById("inventoryList");
    const errorMessage = document.getElementById("errorMessage");
    inventoryList.innerHTML = "";
    errorMessage.style.display = "none";

    if (items.length === 0) {
        inventoryList.innerHTML = "<p>Tiada data inventory ditemui. Sila semak Google Sheets atau sambungan.</p>";
        return;
    }

    items.forEach(item => {
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
            <p><strong>Nama:</strong> ${item.name}</p>
            <p><strong>Model:</strong> ${item.model}</p>
            <p><strong>Kategori:</strong> ${item.category}</p>
            <p><strong>Kuantiti:</strong> ${item.quantity}</p>
            <p><strong>Studio:</strong> ${item.studio}</p>
            <p><strong>Status:</strong> ${item.status}</p>
        `;
        inventoryList.appendChild(card);
    });
}

// Fungsi carian dan penapis
function searchItems() {
    const searchTerm = document.getElementById("searchInput").value.toLowerCase();
    const studioFilter = document.getElementById("filterStudio").value;
    fetchInventory().then(inventory => {
        const filteredItems = inventory.filter(item => 
            (item.name.toLowerCase().includes(searchTerm) || 
             item.model.toLowerCase().includes(searchTerm) || 
             item.studio.toLowerCase().includes(searchTerm)) &&
            (studioFilter === "" || item.studio === studioFilter)
        );
        displayInventory(filteredItems);
    });
}

// Borang laporan
document.getElementById("reportForm").addEventListener("submit", function(e) {
    e.preventDefault();
    const newItem = {
        name: document.getElementById("itemName").value,
        model: document.getElementById("model").value,
        category: document.getElementById("category").value,
        quantity: document.getElementById("quantity").value,
        studio: document.getElementById("studio").value,
        status: document.getElementById("status").value
    };
    alert("Laporan dihantar! Sila kemas kini data di Google Sheets secara manual: " + 
          newItem.name + ", " + newItem.model + ", " + newItem.category + ", " + 
          newItem.quantity + ", " + newItem.studio + ", " + newItem.status);
    this.reset();
    searchItems(); // Segarkan senarai
});

// Muat dan papar inventory awal
searchItems();