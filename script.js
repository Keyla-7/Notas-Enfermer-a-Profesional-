// Lista de materias precargadas para cada año
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

  // Cargar materias guardadas o iniciales
  aniosSections.forEach((seccion) => {
    const anio = seccion.dataset.anio;
    const container = seccion.querySelector(".materias-container");

    // Cargar materias guardadas en localStorage
    const materiasGuardadas = JSON.parse(localStorage.getItem("notasMaterias_" + anio)) || [];

    if (materiasGuardadas.length > 0) {
      materiasGuardadas.forEach((materia) => {
        agregarMateriaUI(container, materia.nombre, materia.notas);
      });
    } else {
      // Cargar materias iniciales
      materiasPorAnio[anio].forEach((nombreMateria) => {
        agregarMateriaUI(container, nombreMateria, []);
      });
    }
  });

  // Función para crear el UI de una materia
  function agregarMateriaUI(container, nombre, notas = []) {
    const materiaDiv = document.createElement("div");
    materiaDiv.className = "materia";

    const titulo = document.createElement("h3");
    titulo.textContent = nombre;
    materiaDiv.appendChild(titulo);

    // Contenedor de notas
    const notasList = document.createElement("div");
    notasList.className = "notas-list";
    materiaDiv.appendChild(notasList);

    // Agregar notas precargadas si hay
    notas.forEach((notaObj) => {
      agregarNotaUI(notasList, notaObj.tipo, notaObj.valor);
    });

    // Botón para agregar TP
    const agregarTPbtn = document.createElement("button");
    agregarTPbtn.className = "agregar-tp-btn";
    agregarTPbtn.textContent = "➕ Agregar trabajo práctico";
    materiaDiv.appendChild(agregarTPbtn);

    // Manejar click agregar TP
    agregarTPbtn.addEventListener("click", () => {
      const nuevoTpNum = contarNotasTipo(notasList, "TP") + 1;
      agregarNotaUI(notasList, "TP", null, nuevoTpNum);
      guardarNotas();
    });

    // Agregar parciales y final si no existen
    ["Parcial 1", "Parcial 2", "Final"].forEach((tipo) => {
      if (!tieneNotaTipo(notasList, tipo)) {
        agregarNotaUI(notasList, tipo);
      }
    });

    // Guardar notas cuando cambian
    notasList.addEventListener("change", (e) => {
      if (e.target.classList.contains("nota-select") || e.target.classList.contains("nota-input")) {
        manejarCambioNota(e.target);
      }
    });

    container.appendChild(materiaDiv);
  }

  // Función para agregar un campo de nota al UI
  function agregarNotaUI(container, tipo, valor = null, numeroTP = null) {
    const notaDiv = document.createElement("div");
    notaDiv.className = "nota-item";

    const label = document.createElement("span");
    label.className = "nota-label";
    label.textContent = numeroTP && tipo === "TP" ? `TP${numeroTP}` : tipo;
    notaDiv.appendChild(label);

    // Select desplegable para nota 60-100 o opción "Desaprobado"
    const selectNota = document.createElement("select");
    selectNota.className = "nota-select";

    // Opción "Desaprobado" para notas < 60
    const opcionDesaprobado = document.createElement("option");
    opcionDesaprobado.value = "desaprobado";
    opcionDesaprobado.textContent = "Desaprobado (ingresar nota manual)";
    selectNota.appendChild(opcionDesaprobado);

    // Opciones 60 a 100 de uno en uno
    for (let i = 60; i <= 100; i++) {
      const opt = document.createElement("option");
      opt.value = i;
      opt.textContent = i;
      selectNota.appendChild(opt);
    }

    notaDiv.appendChild(selectNota);

    // Input para nota manual (solo si desaprobado)
    const inputManual = document.createElement("input");
    inputManual.type = "number";
    inputManual.min = 0;
    inputManual.max = 59;
    inputManual.className = "nota-input";
    inputManual.placeholder = "Nota < 60";
    notaDiv.appendChild(inputManual);

    // Mostrar input manual solo si valor < 60
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

    // Si valor dado es < 60, mostrar input manual con valor
    if (valor !== null) {
      if (valor < 60) {
        selectNota.value = "desaprobado";
        inputManual.value = valor;
        actualizarInputManual();
      } else {
        selectNota.value = valor.toString();
      }
    } else {
      selectNota.value = "desaprobado"; // Por defecto desaprobado, para que agregues
      actualizarInputManual();
    }

    // Cambiar select/input
    selectNota.addEventListener("change", () => {
      actualizarInputManual();
      actualizarEstadoNota(notaDiv);
      guardarNotas();
      calcularYMostrarPromedio(container.closest(".materia"));
    });

    inputManual.addEventListener("input", () => {
      actualizarEstadoNota(notaDiv);
      guardarNotas();
      calcularYMostrarPromedio(container.closest(".materia"));
    });

    // Botón eliminar para TP (solo si es TP)
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

  // Actualiza el color y clase según nota (aprobado o desaprobado)
  function actualizarEstadoNota(notaDiv) {
    let valorNota;
    const select = notaDiv.querySelector(".nota-select");
    const input = notaDiv.querySelector(".nota-input");

    if (select.style.display === "none") {
      // Input manual visible (nota < 60)
      valorNota = Number(input.value);
    } else {
      valorNota = Number(select.value);
    }

    if (isNaN(valorNota)) valorNota = 0;

    // Limpiar clases
    notaDiv.classList.remove("aprobado", "desaprobado");

    if (valorNota >= 60) {
      notaDiv.classList.add("aprobado");
    } else {
      notaDiv.classList.add("desaprobado");
    }
  }

  // Función para contar cuántos TP hay
  function contarNotasTipo(container, tipo) {
    return [...container.children].filter((notaDiv) => {
      const label = notaDiv.querySelector(".nota-label").textContent;
      return tipo === "TP" ? label.startsWith("TP") : label === tipo;
    }).length;
  }

  // Verifica si ya existe nota de cierto tipo (Parcial1, etc)
  function tieneNotaTipo(container, tipo) {
    return [...container.children].some((notaDiv) => {
      const label = notaDiv.querySelector(".nota-label").textContent;
      return label === tipo;
    });
  }

  // Guarda todo en localStorage
  function guardarNotas() {
    document.querySelectorAll(".anio").forEach((seccion) => {
      const anio = seccion.dataset.anio;
      const materias = [];

      seccion.querySelectorAll(".materia").forEach((materiaDiv) => {
        const nombre = materiaDiv.querySelector("h3").textContent;
        const notas = [];

        materiaDiv.querySelectorAll(".nota-item").forEach((notaDiv) => {
          const tipo = notaDiv.querySelector(".nota-label").textContent;
          const select = notaDiv.querySelector(".nota-select");
          const input = notaDiv.querySelector(".nota-input");

          let valorNota;

          if (select.style.display === "none") {
            valorNota = Number(input.value);
          } else {
            valorNota = Number(select.value);
          }
          notas.push({ tipo, valor: valorNota });
        });

        materias.push({ nombre, notas });
      });

      localStorage.setItem("notasMaterias_" + anio, JSON.stringify(materias));
    });
  }

  // Calcula el promedio de TP + parciales (sin final) y muestra
  function calcularYMostrarPromedio(materiaDiv) {
    if (!materiaDiv) return;

    const notas = Array.from(materiaDiv.querySelectorAll(".nota-item"));
    let suma = 0;
    let contador = 0;

    notas.forEach((notaDiv) => {
      const label = notaDiv.querySelector(".nota-label").textContent.toLowerCase();
      const isTP = label.startsWith("tp");
      const isParcial = label.startsWith("parcial");

      if (isTP || isParcial) {
        let valorNota;
        const select = notaDiv.querySelector(".nota-select");
        const input = notaDiv.querySelector(".nota-input");

        if (select.style.display === "none") {
          valorNota = Number(input.value);
        } else {
          valorNota = Number(select.value);
        }

        if (!isNaN(valorNota)) {
          suma += valorNota;
          contador++;
        }
      }
    });

    let promedioTexto = "Promedio TP + parciales: N/A";
    if (contador > 0) {
      const promedio = suma / contador;
      promedioTexto = `Promedio TP + parciales: ${promedio.toFixed(2)}%`;
    }

    // Mostrar o actualizar promedio en la materia
    let promDiv = materiaDiv.querySelector(".promedio");
    if (!promDiv) {
      promDiv = document.createElement("div");
      promDiv.className = "promedio";
      materiaDiv.appendChild(promDiv);
    }
    promDiv.textContent = promedioTexto;
  }

  // Cargar materias con datos y calcular promedios al cargar
  aniosSections.forEach((seccion) => {
    seccion.querySelectorAll(".materia").forEach((materiaDiv) => {
      calcularYMostrarPromedio(materiaDiv);
    });
  });

  // Botones para agregar materias manualmente
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
      
