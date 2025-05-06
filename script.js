function cleanObjectKeys(obj) {
  const cleaned = {};
  for (let key in obj) {
    cleaned[key.trim()] = obj[key];
  }
  return cleaned;
}

fetch("data.json")
  .then((res) => res.json())
  .then((data) => {
    const container = document.getElementById("container");

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
      accordion.textContent = `Kitöltő #${kitoltoSzam}`;

      const panel = document.createElement("div");
      panel.className = "panel";

      const grid = document.createElement("div");
      grid.className = "card-grid";

      szituaciok.forEach((item) => {
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
              <li><strong>Túlélte:</strong> ${
                item["Utas túlélte"] ? "✅" : "❌"
              }</li>
            </ul>
          </section>

          <p><strong>⚠️ Manőver történt:</strong> ${
            item["Manőver történt"] ? "✅ Igen" : "❌ Nem"
          }</p>
        `;

        grid.appendChild(card);
      });

      panel.appendChild(grid);
      container.appendChild(accordion);
      container.appendChild(panel);

      accordion.addEventListener("click", () => {
        panel.classList.toggle("show");
      });
    });
  })
  .catch((err) => {
    console.error("Hiba történt:", err);
  });
