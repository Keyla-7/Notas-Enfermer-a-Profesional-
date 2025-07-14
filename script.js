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
    "Practica profesionalizante i",
    "Matemáticas",
    "Comprensión y producción lectora",
  ],
  2: [
    "Educacion para la salud",
    "Nutricion y dietoterapia",
    "Microbiologia parasitologia e inmunologia",
    "Epidemiologia y bioestadistica",
    "Farmacologia aplicada a la enfermeria",
    "Fisiopatologia humana",
    "Cuidados de enfermeria en el adulto",
    "Aspectos psicosociales y culturales del desarrollo",
    "Cuidados de enfermeria en el adulto mayor",
  ],
  3: [
    "Ingles tecnico",
    "Investigacion en salud",
    "Cuidados de enfermeria en salud mental",
    "Cuidados de enfermeria en emergencias y catastrofes",
    "Etica y legislacion aplicada a la enfermeria",
    "Gestion del cuidado en enfermeria",
    "Cuidados de enfermeria materna y del recien nacido",
    "Cuidados de enfermeria en las infancias y adolescencias",
    "Practica profesionalizante iii",
    "Vacunacion e inmunizacion",
  ],
};

document.addEventListener("DOMContentLoaded", () => {
  const aniosSections = document.querySelectorAll(".anio");

  aniosSections.forEach((seccion) => {
    const anio = seccion.dataset.anio;
    const container = seccion.querySelector(".materias-container");

    const materiasGuardadas = JSON.parse(localStorage.getItem("notasMaterias_" + anio)) || [];

    if (materiasGuardadas.length > 0) {
      materiasGuardadas.forEach((materia) => {
        agregarMateriaUI(container, materia.nombre, materia.notas);
      });
    } else {
      materiasPorAnio[anio].forEach((nombreMateria) => {
        agregarMateriaUI(container, nombreMateria, []);
      });
    }
  });

  function agregarMateriaUI(container, nombre, notas = []) {
    const materiaDiv = document.createElement("div");
    materiaDiv.className = "materia";

    const titulo = document.createElement("h3");
    titulo.textContent = nombre;
    materiaDiv.appendChild(titulo);

    const notasList = document.createElement("div");
    notasList.className = "notas-list";
    materiaDiv.appendChild(notasList);

    notas.forEach((notaObj) => {
      agregarNotaUI(notasList, notaObj.tipo, notaObj.valor);
    });

    const agregarTPbtn = document.createElement("button");
    agregarTPbtn.className = "agregar-tp-btn";
    agregarTPbtn.textContent = "➕ Agregar trabajo práctico";
    materiaDiv.appendChild(agregarTPbtn);

    agregarTPbtn.addEventListener("click", () => {
      const nuevoTpNum = contarNotasTipo(notasList, "TP") + 1;
      agregarNotaUI(notasList, "TP", null, nuevoTpNum);
      guardarNotas();
    });

    ["Parcial 1", "Parcial 2", "Final"].forEach((tipo) => {
      if (!tieneNotaTipo(notasList, tipo)) {
        agregarNotaUI(notasList, tipo);
      }
    });

    verificarYAgregarRecuperatorios(notasList);

    notasList.addEventListener("change", (e) => {
      if (
        e.target.classList.contains("nota-select") ||
        e.target.classList.contains("nota-input")
      ) {
        manejarCambioNota(e.target, notasList);
      }
    });

    container.appendChild(materiaDiv);

    calcularYMostrarPromedio(materiaDiv);
  }

  function agregarNotaUI(container, tipo, valor = null, numeroTP = null) {
    if (
      tipo !== "TP" &&
      [...container.children].some(
        (n) => n.querySelector(".nota-label").textContent === tipo
      )
    ) {
      return;
    }

    const notaDiv = document.createElement("div");
    notaDiv.className = "nota-item";

    const label = document.createElement("span");
    label.className = "nota-label";
    label.textContent = numeroTP && tipo === "TP" ? `TP${numeroTP}` : tipo;
    notaDiv.appendChild(label);

    const selectNota = document.createElement("select");
    selectNota.className = "nota-select";

    const opcionDesaprobado = document.createElement("option");
    opcionDesaprobado.value = "desaprobado";
    opcionDesaprobado.textContent = "Desaprobado (ingresar nota manual)";
    selectNota.appendChild(opcionDesaprobado);

    for (let i = 60; i <= 100; i++) {
      const opt = document.createElement("option");
      opt.value = i;
      opt.textContent = i;
      selectNota.appendChild(opt);
    }

    notaDiv.appendChild(selectNota);

    const inputManual = document.createElement("input");
    inputManual.type = "number";
    inputManual.min = 0;
    inputManual.max = 59;
    inputManual.className = "nota-input";
    inputManual.placeholder = "Nota < 60";
    notaDiv.appendChild(inputManual);

    function actualizarInputManual() {
      if (selectNota.value === "desaprobado") {
        inputManual.style.display = "inline-block";
        selectNota.style.display = "none";
        inputManual.focus();
      } else {
        inputManual.style.display = "none";
        selectNota.style.display = "inline-block";
      }
    }

    actualizarInputManual();

    if (valor !== null) {
      if (valor < 60) {
        selectNota.value = "desaprobado";
        inputManual.value = valor;
        actualizarInputManual();
      } else {
        selectNota.value = valor.toString();
      }
    } else {
      selectNota.value = "desaprobado";
      actualizarInputManual();
    }

    selectNota.addEventListener("change", () => {
      actualizarInputManual();
      actualizarEstadoNota(notaDiv);
      guardarNotas();
      verificarYAgregarRecuperatorios(container);
      calcularYMostrarPromedio(container.closest(".materia"));
    });

    inputManual.addEventListener("input", () => {
      actualizarEstadoNota(notaDiv);
      guardarNotas();
      verificarYAgregarRecuperatorios(container);
      calcularYMostrarPromedio(container.closest(".materia"));
    });

    if (tipo === "TP") {
      const btnEliminar = document.createElement("button");
      btnEliminar.className = "eliminar-tp-btn boton-emoj";
      btnEliminar.title = "Eliminar trabajo práctico 🗑️";
      btnEliminar.textContent = "🗑️";
      btnEliminar.addEventListener("click", () => {
        container.removeChild(notaDiv);
        guardarNotas();
        calcularYMostrarPromedio(container.closest(".materia"));
      });
      notaDiv.appendChild(btnEliminar);
    }

    container.appendChild(notaDiv);
    actualizarEstadoNota(notaDiv);
  }

  // Esta función es clave: obtiene el valor numérico real de la nota
  function obtenerValorNota(notaDiv) {
    const select = notaDiv.querySelector(".nota-select");
    const input = notaDiv.querySelector(".nota-input");

    if (select.style.display === "none") {
      // Si está en modo input manual (desaprobado), tomar valor del input
      const val = Number(input.value);
      return isNaN(val) ? 0 : val;
    } else {
      // Si está en modo select, tomar el valor seleccionado (número o "desaprobado")
      if (select.value === "desaprobado") {
        // Si es desaprobado pero no hay input visible, devolver 0 para evitar errores
        return 0;
      }
      const val = Number(select.value);
      return isNaN(val) ? 0 : val;
    }
  }

  function actualizarEstadoNota(notaDiv) {
    const valorNota = obtenerValorNota(notaDiv);

    notaDiv.classList.remove("aprobado", "desaprobado");

    if (valorNota >= 60) {
      notaDiv.classList.add("aprobado");
    } else {
      notaDiv.classList.add("desaprobado");
    }
  }

  function contarNotasTipo(container, tipo) {
    return [...container.children].filter((notaDiv) => {
      const label = notaDiv.querySelector(".nota-label").textContent;
      return tipo === "TP" ? label.startsWith("TP") : label === tipo;
    }).length;
  }

  function tieneNotaTipo(container, tipo) {
    return [...container.children].some((notaDiv) => {
      const label = notaDiv.querySelector(".nota-label").textContent;
      return label === tipo;
    });
  }

  function verificarYAgregarRecuperatorios(notasList) {
    ["Parcial 1", "Parcial 2", "Final"].forEach((tipo) => {
      const notaOriginal = [...notasList.children].find(
        (n) => n.querySelector(".nota-label").textContent === tipo
      );
      if (!notaOriginal) return;

      const valorOriginal = obtenerValorNota(notaOriginal);

      let etiquetaRecup = "";
      if (tipo === "Final") etiquetaRecup = "Final Recuperatorio";
      else etiquetaRecup = tipo + " Recuperatorio";

      const existeRecup = tieneNotaTipo(notasList, etiquetaRecup);

      if (valorOriginal < 60 && !existeRecup) {
        agregarNotaUI(notasList, etiquetaRecup);
      } else if (valorOriginal >= 60 && existeRecup) {
        const recupDiv = [...notasList.children].find(
          (n) => n.querySelector(".nota-label").textContent === etiquetaRecup
        );
        if (recupDiv) {
          notasList.removeChild(recupDiv);
          guardarNotas();
        }
      }
    });
  }

  function guardarNotas() {
    document.querySelectorAll(".anio").forEach((seccion) => {
      const anio = seccion.dataset.anio;
      const materias = [];

      seccion.querySelectorAll(".materia").forEach((materiaDiv) => {
        const nombre = materiaDiv.querySelector("h3").textContent;
        const notas = [];

        materiaDiv.querySelectorAll(".nota-item").forEach((notaDiv) => {
          const tipo = notaDiv.querySelector(".nota-label").textContent;

          // Aquí usamos la función que siempre devuelve el valor correcto
          const valorNota = obtenerValorNota(notaDiv);

          notas.push({ tipo, valor: valorNota });
        });

        materias.push({ nombre, notas });
      });

      localStorage.setItem("notasMaterias_" + anio, JSON.stringify(materias));
    });
  }

  function calcularYMostrarPromedio(materiaDiv) {
    if (!materiaDiv) return;

    const notas = Array.from(materiaDiv.querySelectorAll(".nota-item"));
    let suma = 0;
    let contador = 0;

    const parciales = { "Parcial 1": null, "Parcial 2": null };

    notas.forEach((notaDiv) => {
      const label = notaDiv.querySelector(".nota-label").textContent.toLowerCase();
      const valor = obtenerValorNota(notaDiv);

      if (label.startsWith("tp")) {
        if (!isNaN(valor)) {
          suma += valor;
          contador++;
        }
      } else if (label === "parcial 1" || label === "parcial 2") {
        parciales[capitalize(label)] = valor;
      }
    });

    ["Parcial 1", "Parcial 2"].forEach((tipo) => {
      const etiquetaRecup = tipo + " recuperatorio";
      const recupNotaDiv = notas.find(
        (n) => n.querySelector(".nota-label").textContent.toLowerCase() === etiquetaRecup
      );
      if (recupNotaDiv) {
        const recupValor = obtenerValorNota(recupNotaDiv);
        if (recupValor > parciales[tipo]) {
          parciales[tipo] = recupValor;
        }
      }
    });

    Object.values(parciales).forEach((val) => {
      if (val !== null && !isNaN(val)) {
        suma += val;
        contador++;
      }
    });

    let promedioTexto = "Promedio TP + parciales: N/A";
    if (contador > 0) {
      const promedio = suma / contador;
      promedioTexto = `Promedio TP + parciales: ${promedio.toFixed(2)}%`;
    }

    let promDiv = materiaDiv.querySelector(".promedio");
    if (!promDiv) {
      promDiv = document.createElement("div");
      promDiv.className = "promedio";
      materiaDiv.appendChild(promDiv);
    }
    promDiv.textContent = promedioTexto;
  }

  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // Esta función se usa para detectar cambios y actualizar todo
  function manejarCambioNota(target, notasList) {
    const notaDiv = target.closest(".nota-item");
    actualizarEstadoNota(notaDiv);
    guardarNotas();
    verificarYAgregarRecuperatorios(notasList);
    calcularYMostrarPromedio(notaDiv.closest(".materia"));
  }

  const agregarBtns = document.querySelectorAll(".agregar-materia-btn");
  agregarBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const anio = btn.dataset.anio;
      const container = btn.previousElementSibling;
      const nombreMateria = prompt("Nombre de la nueva materia:");
      if (nombreMateria && nombreMateria.trim() !== "") {
        agregarMateriaUI(container, nombreMateria.trim(), []);
        guardarNotas();
      }
    });
  });
});
                          
