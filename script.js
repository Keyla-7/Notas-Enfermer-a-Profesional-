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
    "Práctica profesionalizante I",
    "Matemáticas",
    "Comprensión y producción lectora"
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
    "Cuidados de enfermería en el adulto mayor"
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
    "Vacunación e inmunización"
  ],
};

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".anio").forEach(seccion => {
    const anio = seccion.dataset.anio;
    const cont = seccion.querySelector(".materias-container");

    const guardado = JSON.parse(localStorage.getItem("notasMaterias_" + anio)) || [];

    if (guardado.length > 0) {
      guardado.forEach(materia => {
        crearMateriaUI(cont, materia.nombre, materia.notas);
      });
    } else {
      materiasPorAnio[anio].forEach(nombre => {
        crearMateriaUI(cont, nombre, []);
      });
    }
  });
});

function crearMateriaUI(container, nombre, notas) {
  const div = document.createElement("div");
  div.className = "materia";

  const titulo = document.createElement("h3");
  titulo.textContent = nombre;
  div.appendChild(titulo);

  const notasList = document.createElement("div");
  notasList.className = "notas-list";
  div.appendChild(notasList);

  notas.forEach(n => crearNotaUI(notasList, n.tipo, n.valor));

  ["Parcial 1", "Parcial 2", "Final"].forEach(tipo => {
    if (!existeNota(notasList, tipo)) {
      crearNotaUI(notasList, tipo);
    }
  });

  verificarRecuperatorios(notasList);

  const btnTP = document.createElement("button");
  btnTP.textContent = "➕ Agregar trabajo práctico";
  btnTP.onclick = () => {
    const numero = contarNotasTipo(notasList, "TP") + 1;
    crearNotaUI(notasList, "TP", null, numero);
    guardarTodo();
  };
  div.appendChild(btnTP);

  container.appendChild(div);

  mostrarPromedio(div);
}

function crearNotaUI(container, tipo, valor = null, numeroTP = null) {
  if (tipo !== "TP" && existeNota(container, tipo)) return;

  const div = document.createElement("div");
  div.className = "nota-item";

  const label = document.createElement("span");
  label.className = "nota-label";
  label.textContent = tipo === "TP" && numeroTP ? `TP${numeroTP}` : tipo;
  div.appendChild(label);

  const select = document.createElement("select");
  select.className = "nota-select";

  const optDesaprobado = document.createElement("option");
  optDesaprobado.value = "desaprobado";
  optDesaprobado.textContent = "Desaprobado (manual)";
  select.appendChild(optDesaprobado);

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

  select.onchange = () => {
    if (select.value === "desaprobado") {
      select.style.display = "none";
      input.style.display = "inline-block";
      input.focus();
    } else {
      input.style.display = "none";
      select.style.display = "inline-block";
    }
    actualizarEstadoNota(div);
    guardarTodo();
    verificarRecuperatorios(container);
    mostrarPromedio(div.closest(".materia"));
  };

  input.oninput = () => {
    actualizarEstadoNota(div);
    guardarTodo();
    verificarRecuperatorios(container);
    mostrarPromedio(div.closest(".materia"));
  };

  div.appendChild(select);
  div.appendChild(input);

  if (tipo === "TP") {
    const btnEliminar = document.createElement("button");
    btnEliminar.className = "btn-eliminar";
    btnEliminar.title = "Eliminar trabajo práctico";
    btnEliminar.textContent = "🗑️";
    btnEliminar.onclick = () => {
      container.removeChild(div);
      guardarTodo();
      mostrarPromedio(div.closest(".materia"));
    };
    div.appendChild(btnEliminar);
  }

  container.appendChild(div);
  actualizarEstadoNota(div);
}

function obtenerValorNota(div) {
  const select = div.querySelector("select");
  const input = div.querySelector("input");
  if (select.style.display === "none") {
    const val = Number(input.value);
    return isNaN(val) ? 0 : val;
  } else {
    if (select.value === "desaprobado") return 0;
    const val = Number(select.value);
    return isNaN(val) ? 0 : val;
  }
}

function actualizarEstadoNota(div) {
  const val = obtenerValorNota(div);
  div.classList.remove("aprobado", "desaprobado");
  if (val >= 60) {
    div.classList.add("aprobado");
  } else {
    div.classList.add("desaprobado");
  }
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

    const val = obtenerValorNota(original);
    const recupTipo = tipo === "Final" ? "Final Recuperatorio" : tipo + " Recuperatorio";

    const existeRecup = existeNota(container, recupTipo);

    if (val < 60 && !existeRecup) {
      crearNotaUI(container, recupTipo);
    } else if (val >= 60 && existeRecup) {
      const recup = [...container.children].find(div =>
        div.querySelector(".nota-label").textContent === recupTipo
      );
      container.removeChild(recup);
      guardarTodo();
    }
  });
}

function guardarTodo() {
  document.querySelectorAll(".anio").forEach(seccion => {
    const anio = seccion.dataset.anio;
    const materias = [];

    seccion.querySelectorAll(".materia").forEach(materiaDiv => {
      const nombre = materiaDiv.querySelector("h3").textContent;
      const notas = [];

      materiaDiv.querySelectorAll(".nota-item").forEach(notaDiv => {
        const tipo = notaDiv.querySelector(".nota-label").textContent;
        const valor = obtenerValorNota(notaDiv);
        notas.push({ tipo, valor });
      });

      materias.push({ nombre, notas });
    });

    localStorage.setItem("notasMaterias_" + anio, JSON.stringify(materias));
  });
}

function mostrarPromedio(materiaDiv) {
  if (!materiaDiv) return;

  const notas = materiaDiv.querySelectorAll(".nota-item");
  let suma = 0;
  let count = 0;

  const parciales = { "Parcial 1": null, "Parcial 2": null };

  notas.forEach(notaDiv => {
    const label = notaDiv.querySelector(".nota-label").textContent.toLowerCase();
    const val = obtenerValorNota(notaDiv);
    if (label.startsWith("tp")) {
      suma += val;
      count++;
    } else if (label === "parcial 1") {
      parciales["Parcial 1"] = val;
    } else if (label === "parcial 2") {
      parciales["Parcial 2"] = val;
    }
  });

  ["Parcial 1", "Parcial 2"].forEach(tipo => {
    const recup = [...notas].find(n =>
      n.querySelector(".nota-label").textContent.toLowerCase() === tipo.toLowerCase() + " recuperatorio"
    );
    if (recup) {
      const valRecup = obtenerValorNota(recup);
      if (valRecup > parciales[tipo]) {
        parciales[tipo] = valRecup;
      }
    }
  });

  Object.values(parciales).forEach(val => {
    if (val !== null) {
      suma += val;
      count++;
    }
  });

  const promedioDiv = materiaDiv.querySelector(".promedio") || (() => {
    const d = document.createElement("div");
    d.className = "promedio";
    materiaDiv.appendChild(d);
    return d;
  })();

  if (count === 0) {
    promedioDiv.textContent = "Promedio TP + parciales: N/A";
  } else {
    promedioDiv.textContent = `Promedio TP + parciales: ${(suma / count).toFixed(2)}%`;
  }
}
