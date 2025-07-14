const materiasPorAnio = {
  1: [
    "Antropología",
    "Procesos psicológicos y sociales",
    "Entornos virtuales",
    "Comunicación en salud",
    "Bases del cuidado",
    "Morfofisiología",
    "Fisico-química",
    "Enfermería comunitaria y salud pública",
    "Practica profesionalizante I",
    "Matemáticas",
    "Comprensión y producción lectora",
  ],
  2: [
    "Educación para la salud",
    "Nutrición y dietoterapia",
    "Microbiología parasitología e inmunología",
    "Epidemiología y bioestadística",
    "Farmacología aplicada a la enfermería",
    "Fisiopatología humana",
    "Cuidados de enfermería en el adulto",
    "Aspectos psicosociales y culturales del desarrollo",
    "Cuidados de enfermería en el adulto mayor",
  ],
  3: [
    "Inglés técnico",
    "Investigación en salud",
    "Cuidados de enfermería en salud mental",
    "Cuidados de enfermería en emergencias y catástrofes",
    "Ética y legislación aplicada a la enfermería",
    "Gestión del cuidado en enfermería",
    "Cuidados de enfermería materna y del recién nacido",
    "Cuidados de enfermería en las infancias y adolescencias",
    "Práctica profesionalizante III",
    "Vacunación e inmunización",
  ],
};

document.addEventListener("DOMContentLoaded", () => {
  const secciones = document.querySelectorAll(".anio");

  secciones.forEach((seccion) => {
    const anio = seccion.dataset.anio;
    const container = seccion.querySelector(".materias-container");

    const materiasGuardadas = JSON.parse(localStorage.getItem("notasMaterias_" + anio)) || [];

    if (materiasGuardadas.length > 0) {
      materiasGuardadas.forEach((materia) => {
        agregarMateria(container, materia.nombre, materia.notas);
      });
    } else {
      materiasPorAnio[anio].forEach((nombre) => {
        agregarMateria(container, nombre);
      });
    }
  });

  function agregarMateria(container, nombre, notas = []) {
    const div = document.createElement("div");
    div.className = "materia";

    const titulo = document.createElement("h3");
    titulo.textContent = nombre;
    div.appendChild(titulo);

    const notasList = document.createElement("div");
    notasList.className = "notas-list";
    div.appendChild(notasList);

    notas.forEach(n => agregarNota(notasList, n.tipo, n.valor));

    // Asegurar que estén siempre presentes los parciales y final
    ["Parcial 1", "Parcial 2", "Final"].forEach(tipo => {
      if (!existeNota(notasList, tipo)) agregarNota(notasList, tipo);
    });

    // Verificar recuperatorios
    verificarRecuperatorios(notasList);

    const btnTP = document.createElement("button");
    btnTP.textContent = "➕ Agregar trabajo práctico";
    btnTP.className = "agregar-tp-btn";
    btnTP.addEventListener("click", () => {
      const numTP = contarNotasTipo(notasList, "TP") + 1;
      agregarNota(notasList, "TP", null, numTP);
      guardar();
    });
    div.appendChild(btnTP);

    container.appendChild(div);
    mostrarPromedio(div);
  }

  function agregarNota(container, tipo, valor = null, numeroTP = null) {
    if (tipo !== "TP" && existeNota(container, tipo)) return;

    const div = document.createElement("div");
    div.className = "nota-item";

    const label = document.createElement("span");
    label.className = "nota-label";
    label.textContent = tipo === "TP" && numeroTP ? `TP${numeroTP}` : tipo;
    div.appendChild(label);

    const select = document.createElement("select");
    select.className = "nota-select";

    const optManual = document.createElement("option");
    optManual.value = "desaprobado";
    optManual.textContent = "Desaprobado (manual)";
    select.appendChild(optManual);

    for (let i = 60; i <= 100; i++) {
      const opt = document.createElement("option");
      opt.value = i;
      opt.textContent = i;
      select.appendChild(opt);
    }

    const input = document.createElement("input");
    input.type = "number";
    input.min = 0;
    input.max = 59;
    input.placeholder = "< 60";
    input.className = "nota-input";
    input.style.display = "none";

    if (valor !== null) {
      if (valor < 60) {
        select.value = "desaprobado";
        input.value = valor;
        select.style.display = "none";
        input.style.display = "inline-block";
      } else {
        select.value = valor.toString();
      }
    }

    select.addEventListener("change", () => {
      if (select.value === "desaprobado") {
        select.style.display = "none";
        input.style.display = "inline-block";
        input.focus();
      } else {
        input.style.display = "none";
        select.style.display = "inline-block";
      }
      actualizarClase(div);
      guardar();
      verificarRecuperatorios(container);
      mostrarPromedio(div.closest(".materia"));
    });

    input.addEventListener("input", () => {
      actualizarClase(div);
      guardar();
      verificarRecuperatorios(container);
      mostrarPromedio(div.closest(".materia"));
    });

    div.appendChild(select);
    div.appendChild(input);

    if (tipo === "TP") {
      const eliminar = document.createElement("button");
      eliminar.textContent = "🗑️";
      eliminar.className = "eliminar-tp-btn";
      eliminar.title = "Eliminar trabajo práctico";
      eliminar.onclick = () => {
        container.removeChild(div);
        guardar();
        mostrarPromedio(div.closest(".materia"));
      };
      div.appendChild(eliminar);
    }

    container.appendChild(div);
    actualizarClase(div);
  }

  function obtenerValor(div) {
    const sel = div.querySelector("select");
    const inp = div.querySelector("input");
    if (sel.style.display === "none") {
      const val = Number(inp.value);
      return isNaN(val) ? 0 : val;
    } else {
      if (sel.value === "desaprobado") return 0;
      const val = Number(sel.value);
      return isNaN(val) ? 0 : val;
    }
  }

  function actualizarClase(div) {
    const val = obtenerValor(div);
    div.classList.remove("aprobado", "desaprobado");
    div.classList.add(val >= 60 ? "aprobado" : "desaprobado");
  }

  function existeNota(container, tipo) {
    return [...container.children].some(div =>
      div.querySelector(".nota-label").textContent === tipo
    );
  }

  function contarNotasTipo(container, tipo) {
    return [...container.children].filter(div =>
      div.querySelector(".nota-label").textContent.startsWith(tipo)
    ).length;
  }

  function verificarRecuperatorios(container) {
    ["Parcial 1", "Parcial 2", "Final"].forEach(tipo => {
      const original = [...container.children].find(div =>
        div.querySelector(".nota-label").textContent === tipo
      );
      if (!original) return;

      const valor = obtenerValor(original);
      const recupTipo = tipo === "Final" ? "Final Recuperatorio" : tipo + " Recuperatorio";

      const yaExiste = existeNota(container, recupTipo);
      if (valor < 60 && !yaExiste) {
        agregarNota(container, recupTipo);
      } else if (valor >= 60 && yaExiste) {
        const recup = [...container.children].find(div =>
          div.querySelector(".nota-label").textContent === recupTipo
        );
        container.removeChild(recup);
        guardar();
      }
    });
  }

  function guardar() {
    document.querySelectorAll(".anio").forEach((seccion) => {
      const anio = seccion.dataset.anio;
      const materias = [];

      seccion.querySelectorAll(".materia").forEach((matDiv) => {
        const nombre = matDiv.querySelector("h3").textContent;
        const notas = [];

        matDiv.querySelectorAll(".nota-item").forEach((notaDiv) => {
          const tipo = notaDiv.querySelector(".nota-label").textContent;
          const valor = obtenerValor(notaDiv);
          notas.push({ tipo, valor });
        });

        materias.push({ nombre, notas });
      });

      localStorage.setItem("notasMaterias_" + anio, JSON.stringify(materias));
    });
  }

  function mostrarPromedio(matDiv) {
    const notas = matDiv.querySelectorAll(".nota-item");
    let suma = 0, count = 0;
    const parciales = { "Parcial 1": null, "Parcial 2": null };

    notas.forEach(nota => {
      const label = nota.querySelector(".nota-label").textContent.toLowerCase();
      const val = obtenerValor(nota);
      if (label.startsWith("tp")) {
        suma += val; count++;
      } else if (label === "parcial 1") parciales["Parcial 1"] = val;
      else if (label === "parcial 2") parciales["Parcial 2"] = val;
    });

    ["Parcial 1", "Parcial 2"].forEach(tipo => {
      const recup = [...notas].find(n =>
        n.querySelector(".nota-label").textContent.toLowerCase() === tipo.toLowerCase() + " recuperatorio"
      );
      if (recup) {
        const valRecup = obtenerValor(recup);
        if (valRecup > parciales[tipo]) parciales[tipo] = valRecup;
      }
    });

    Object.values(parciales).forEach(val => {
      if (val !== null) {
        suma += val; count++;
      }
    });

    let texto = "Promedio TP + parciales: N/A";
    if (count > 0) texto = `Promedio TP + parciales: ${(suma / count).toFixed(2)}%`;

    let promDiv = matDiv.querySelector(".promedio");
    if (!promDiv) {
      promDiv = document.createElement("div");
      promDiv.className = "promedio";
      matDiv.appendChild(promDiv);
    }
    promDiv.textContent = texto;
  }

  document.querySelectorAll(".agregar-materia-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const anio = btn.dataset.anio;
      const container = btn.previousElementSibling;
      const nombre = prompt("Nombre de la nueva materia:");
      if (nombre && nombre.trim()) {
        agregarMateria(container, nombre.trim());
        guardar();
      }
    });
  });
});
        
