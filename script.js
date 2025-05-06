function cleanObjectKeys(obj) {
  const cleaned = {};
  for (let key in obj) {
    cleaned[key.trim()] = obj[key];
  }
  return cleaned;
}

const container = document.getElementById("container");
const formContainer = document.getElementById("formContainer");
const startFormBtn = document.getElementById("startFormBtn");

startFormBtn.addEventListener("click", () => {
  formContainer.innerHTML = "";
  generateForm();
  formContainer.classList.add("show");
});

function createCard(
  item,
  showDecision = false,
  decisionIndex = null,
  onDecision = null
) {
  const card = document.createElement("div");
  card.className = "card";
  card.innerHTML = `
    <h3>Szituáció #${item["Szituáció"]}</h3>
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
        <li><strong>Túlélte:</strong> ${
          item["Gyalogos túlélte"] ? "✅" : "❌"
        }</li>
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
        <li><strong>Túlélte:</strong> ${item["Utas túlélte"] ? "✅" : "❌"}</li>
      </ul>
    </section>
    <p><strong>⚠️ Manőver történt:</strong> ${
      item["Manőver történt"] ? "✅ Igen" : "❌ Nem"
    }</p>
  `;

  if (showDecision) {
    const decisionDiv = document.createElement("div");
    decisionDiv.className = "decision";
    const gyalogosBtn = document.createElement("button");
    const utasBtn = document.createElement("button");
    gyalogosBtn.textContent = "Gyalogosok túlélnek";
    utasBtn.textContent = "Utasok túlélnek";

    [gyalogosBtn, utasBtn].forEach((btn) => {
      btn.addEventListener("click", () => {
        onDecision(decisionIndex, btn.textContent.includes("Gyalogos"));
        gyalogosBtn.disabled = true;
        utasBtn.disabled = true;
      });
    });

    decisionDiv.appendChild(gyalogosBtn);
    decisionDiv.appendChild(utasBtn);
    card.appendChild(decisionDiv);
  }

  return card;
}

function generateForm() {
  fetch("data.json")
    .then((res) => res.json())
    .then((data) => {
      const cleaned = data.map(cleanObjectKeys);
      const groupBySzitu = cleaned.reduce((acc, item) => {
        if (item["Szituáció"] && item["Kitöltő"] === 1) {
          acc.push(item);
        }
        return acc;
      }, []);

      const answers = new Array(groupBySzitu.length).fill(null);
      const grid = document.createElement("div");
      grid.className = "card-grid";

      groupBySzitu.forEach((item, index) => {
        grid.appendChild(
          createCard(item, true, index, (i, isGyalogos) => {
            answers[i] = isGyalogos;
            checkIfComplete();
          })
        );
      });

      const saveBtn = document.createElement("button");
      saveBtn.textContent = "Mentés";
      saveBtn.disabled = true;

      function checkIfComplete() {
        saveBtn.disabled = answers.includes(null);
      }

      saveBtn.addEventListener("click", () => {
        const stored = JSON.parse(localStorage.getItem("kitoltesek") || "[]");
        const kitoltoSzam =
          (Math.max(0, ...stored.map((s) => s[0]?.Kitöltő || 0)) || 0) + 1;

        const result = groupBySzitu.map((item, index) => {
          const gyalogosTulelt = answers[index];
          const utasTulelt = !gyalogosTulelt;

          return {
            ...item,
            Kitöltő: kitoltoSzam,
            "Gyalogos túlélte": gyalogosTulelt,
            "Utas túlélte": utasTulelt,
          };
        });

        stored.push(result);
        localStorage.setItem("kitoltesek", JSON.stringify(stored));
        location.reload();
      });

      formContainer.appendChild(grid);
      formContainer.appendChild(saveBtn);
    });
}

function renderKitoltesek(data, local = false) {
  const validData = data
    .map(cleanObjectKeys)
    .filter(
      (item) =>
        typeof item["Kitöltő"] === "number" &&
        typeof item["Szituáció"] === "number"
    );

  const kitoltoMap = new Map();
  validData.forEach((item) => {
    const id = item["Kitöltő"];
    if (!kitoltoMap.has(id)) {
      kitoltoMap.set(id, []);
    }
    kitoltoMap.get(id).push(item);
  });

  kitoltoMap.forEach((szituaciok, kitoltoSzam) => {
    const accordion = document.createElement("button");
    accordion.className = "accordion";
    accordion.textContent = `${
      local ? "📝 Új Kitöltő" : "Kitöltő"
    } #${kitoltoSzam}`;

    const panel = document.createElement("div");
    panel.className = "panel";

    const grid = document.createElement("div");
    grid.className = "card-grid";

    szituaciok.forEach((item) => {
      grid.appendChild(createCard(item));
    });

    panel.appendChild(grid);
    container.appendChild(accordion);
    container.appendChild(panel);

    accordion.addEventListener("click", () => {
      panel.classList.toggle("show");
    });
  });
}

// Adatok betöltése JSON-ból
fetch("data.json")
  .then((res) => res.json())
  .then((data) => {
    renderKitoltesek(data);
    const local = JSON.parse(localStorage.getItem("kitoltesek") || "[]");
    local.forEach((kitoltes) => renderKitoltesek(kitoltes, true));
  })
  .catch((err) => console.error("Hiba történt:", err));
