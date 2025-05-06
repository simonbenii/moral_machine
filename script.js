function cleanObjectKeys(obj) {
  const cleaned = {};
  for (let key in obj) {
    cleaned[key.trim()] = obj[key];
  }
  return cleaned;
}

function renderCard(item, index) {
  return `
    <div class="card">
      <h3>Szituáció #${item["Szituáció"] || index + 1}</h3>
      <section>
        <strong>🚶‍♂️ Gyalogosok</strong>
        <ul>
          <li><strong>Szám:</strong> ${item["Gyalogosok száma"]}</li>
          <li><strong>Gyerek:</strong> ${item["Gyal. Gyerek"]}</li>
          <li><strong>Nő:</strong> ${item["Gyal. nő"]}</li>
          <li><strong>Férfi:</strong> ${item["Gyal. Férfi"]}</li>
          <li><strong>Szabályos:</strong> ${
            item["Gyal. szabályos"] ? "✅" : "❌"
          }</li>
          <li><strong>Lámpa zöld:</strong> ${
            item["Gyal. Lámpa"] ? "✅" : "❌"
          }</li>
          ${
            "Gyalogos túlélte" in item
              ? `<li><strong>Túlélte:</strong> ${
                  item["Gyalogos túlélte"] ? "✅" : "❌"
                }</li>`
              : ""
          }
        </ul>
      </section>
      <section>
        <strong>🚗 Utasok</strong>
        <ul>
          <li><strong>Szám:</strong> ${item["Utasok száma"]}</li>
          <li><strong>Gyerek:</strong> ${item["Utas gyerek"]}</li>
          <li><strong>Nő:</strong> ${item["Utas nő"]}</li>
          <li><strong>Férfi:</strong> ${item["Utas férfi"]}</li>
          <li><strong>Szabályos:</strong> ${
            item["Utas szabályos"] ? "✅" : "❌"
          }</li>
          ${
            "Utas túlélte" in item
              ? `<li><strong>Túlélte:</strong> ${
                  item["Utas túlélte"] ? "✅" : "❌"
                }</li>`
              : ""
          }
        </ul>
      </section>
      <p><strong>⚠️ Manőver történt:</strong> ${
        item["Manőver történt"] ? "✅ Igen" : "❌ Nem"
      }</p>
    </div>
  `;
}

function renderKitolto(kitoltoSzam, szituaciok, container) {
  const accordion = document.createElement("button");
  accordion.className = "accordion";
  accordion.textContent = `Kitöltő #${kitoltoSzam}`;

  const panel = document.createElement("div");
  panel.className = "panel";

  const grid = document.createElement("div");
  grid.className = "card-grid";

  szituaciok.forEach((item, idx) => {
    const cardHTML = renderCard(item, idx);
    grid.innerHTML += cardHTML;
  });

  panel.appendChild(grid);
  container.appendChild(accordion);
  container.appendChild(panel);

  accordion.addEventListener("click", () => {
    panel.classList.toggle("show");
  });
}

// Betöltés a data.json-ból
fetch("data.json")
  .then((res) => res.json())
  .then((data) => {
    const container = document.getElementById("container");

    const validData = data
      .map(cleanObjectKeys)
      .filter((item) => typeof item["Kitöltő"] === "number");

    const kitoltoMap = new Map();
    validData.forEach((item) => {
      const id = item["Kitöltő"];
      if (!kitoltoMap.has(id)) {
        kitoltoMap.set(id, []);
      }
      kitoltoMap.get(id).push(item);
    });

    // Korábbi kitöltések localStorage-ból
    const local = JSON.parse(localStorage.getItem("kitoltesek") || "[]");
    local.forEach((val, i) => {
      renderKitolto(`local-${i + 1}`, val, container);
    });

    // JSON fájlban levő kitöltések
    kitoltoMap.forEach((szituaciok, kitoltoSzam) => {
      renderKitolto(kitoltoSzam, szituaciok, container);
    });
  });

// Új kitöltő form kezelése
document.getElementById("newFormBtn").addEventListener("click", () => {
  const formContainer = document.getElementById("formContainer");
  formContainer.innerHTML = "";
  formContainer.classList.add("show");

  const form = document.createElement("form");

  const szituaciok = Array.from({ length: 10 }, (_, i) => ({
    Szituáció: i + 1,
    "Gyalogosok száma": Math.floor(Math.random() * 5) + 1,
    "Gyal. Gyerek": Math.floor(Math.random() * 2),
    "Gyal. nő": Math.floor(Math.random() * 3),
    "Gyal. Férfi": Math.floor(Math.random() * 3),
    "Gyal. szabályos": Math.random() > 0.5,
    "Gyal. Lámpa": Math.random() > 0.5,
    "Utasok száma": Math.floor(Math.random() * 5) + 1,
    "Utas gyerek": Math.floor(Math.random() * 2),
    "Utas nő": Math.floor(Math.random() * 3),
    "Utas férfi": Math.floor(Math.random() * 3),
    "Utas szabályos": Math.random() > 0.5,
    "Manőver történt": Math.random() > 0.5,
  }));

  szituaciok.forEach((szit, index) => {
    const wrapper = document.createElement("div");
    wrapper.classList.add("form-section");
    wrapper.innerHTML = renderCard(szit, index);

    const choiceLabel = document.createElement("label");
    choiceLabel.textContent = "Ki éljen túl?";

    const select = document.createElement("select");
    select.required = true;
    select.name = `valasz-${index}`;
    select.innerHTML = `
      <option value="">-- válassz --</option>
      <option value="gyalogos">🚶‍♂️ Gyalogosok</option>
      <option value="utas">🚗 Utasok</option>
    `;

    wrapper.appendChild(choiceLabel);
    wrapper.appendChild(select);
    form.appendChild(wrapper);
  });

  const submitBtn = document.createElement("button");
  submitBtn.type = "submit";
  submitBtn.textContent = "Mentés";

  form.appendChild(submitBtn);

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const ujKitoltes = szituaciok.map((szit, index) => {
      const valasz = formData.get(`valasz-${index}`);
      return {
        ...szit,
        "Gyalogos túlélte": valasz === "gyalogos",
        "Utas túlélte": valasz === "utas",
      };
    });

    const existing = JSON.parse(localStorage.getItem("kitoltesek") || "[]");
    existing.push(ujKitoltes);
    localStorage.setItem("kitoltesek", JSON.stringify(existing));

    location.reload();
  });

  formContainer.appendChild(form);
});
