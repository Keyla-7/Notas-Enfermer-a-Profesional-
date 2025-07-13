document.addEventListener("DOMContentLoaded", () => {
  const materias = {
    "Primer año": [
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
      "Comprensión y producción lectora",
    ],
    "Segundo año": [
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
    "Tercer año": [
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

  const container = document.getElementById("notas-container");

  // Carga de notas guardadas en localStorage
  let notasGuardadas = JSON.parse(localStorage.getItem("notasGuardadas") || "{}");

  // Función para crear select de notas aprobadas (60-100) y opción desaprobado
  function crearSelectNota(valorActual = null) {
    const select = document.createElement("select");

    // Opción "desaprobado" especial para notas < 60
    const desaprobadoOption = document.createElement("option");
    desaprobadoOption.value = "desaprobado";
    desaprobadoOption.textContent = "Desaprobado (poner nota manual)";
    select.appendChild(desaprobadoOption);

    for (let i = 60; i <= 100; i++) {
      const option = document.createElement("option");
      option.value = i;
      option.textContent = i;
      select.appendChild(option);
    }

    if (valorActual !== null) {
      if (valorActual < 60) {
        select.value = "desaprobado";
      } else {
        select.value = valorActual;
      }
    } else {
      select.value = 60;
    }

    return select;
  }

  // Crear input para notas manuales (desaprobados)
  function crearInputManual(valor = "") {
    const input = document.createElement("input");
    input.type = "number";
    input.min = 0;
    input.max = 59;
    input.placeholder = "Nota < 60";
    input.value = valor;
    input.style.width = "80px";
    return input;
  }

  // Crear nota UI (práctico, parcial, recuperatorio, final)
  function crearNotaItem(materia, tipo, valor = null) {
    const div = document.createElement("div");
    div.classList.add("nota-item");
    div.dataset.materia = materia;
    div.dataset.tipo = tipo;

    const label = document.createElement("label");
    label.classList.add("nota-label");
    label.textContent = `${tipo} (${materia}): `;
    label.style.minWidth = "180px";
    label.style.textAlign = "left";

    div.appendChild(label);

    if (tipo === "Recuperatorio Parcial 1" || tipo === "Recuperatorio Parcial 2" || tipo === "Recuperatorio Final") {
      div.classList.add("recuperatorio");
      div.style.display = "none"; // oculto por defecto
    }

    let select = crearSelectNota(valor);
    div.appendChild(select);

    let inputManual = null;

    // Si el valor es desaprobado, mostrar input manual
    if (valor !== null && valor < 60) {
      select.value = "desaprobado";
      inputManual = crearInputManual(valor);
      div.appendChild(inputManual);
    }

    // Cambiar entre select e input manual según opción elegida
    select.addEventListener("change", () => {
      if (select.value === "desaprobado") {
        inputManual = crearInputManual();
        div.appendChild(inputManual);
      } else {
        if (inputManual) {
          div.removeChild(inputManual);
          inputManual = null;
        }
      }
      actualizarNota(materia);
    });

    if (inputManual) {
      inputManual.addEventListener("input", () => {
        actualizarNota(materia);
      });
    }

    // Para eliminar nota si es práctico
    if (tipo.startsWith("Tp")) {
      const btnEliminar = document.createElement("button");
      btnEliminar.textContent = "🗑️";
      btnEliminar.title = "Eliminar trabajo práctico";
      btnEliminar.style.marginLeft = "10px";
      btnEliminar.style.cursor = "pointer";
      btnEliminar.addEventListener("click", () => {
        div.remove();
        guardarNotas();
        actualizarPromedios();
      });
      div.appendChild(btnEliminar);
    }

    return div;
  }

  // Crear sección materia con trabajos prácticos, parciales, final y recuperatorios
  function crearSeccionMateria(nombreMateria) {
    const div = document.createElement("div");
    div.classList.add("materia");

    const h3 = document.createElement("h3");
    h3.textContent = nombreMateria;
    div.appendChild(h3);

    // Contenedor para notas de la materia
    const notasList = document.createElement("div");
    notasList.classList.add("notas-list");
    div.appendChild(notasList);

    // Botón para agregar trabajo práctico
    const btnAgregarTp = document.createElement("button");
    btnAgregarTp.textContent = "➕ agregar TP";
    btnAgregarTp.style.margin = "10px";
    btnAgregarTp.style.cursor = "pointer";

    let contadorTp = 0;
    // Contar TPs guardados para esta materia si existen
    Object.keys(notasGuardadas).forEach(key => {
      if (key.startsWith(nombreMateria + "_Tp")) {
        contadorTp++;
      }
    });

    btnAgregarTp.addEventListener("click", () => {
      contadorTp++;
      const tipoTp = `Tp${contadorTp}`;
      const notaTp = crearNotaItem(nombreMateria, tipoTp);
      notasList.appendChild(notaTp);
      guardarNotas();
    });
    div.appendChild(btnAgregarTp);

    // Crear 2 parciales y un final
    const parcial1 = crearNotaItem(nombreMateria, "Parcial 1");
    const parcial2 = crearNotaItem(nombreMateria, "Parcial 2");
    const final = crearNotaItem(nombreMateria, "Final");

    notasList.appendChild(parcial1);
    notasList.appendChild(parcial2);
    notasList.appendChild(final);

    // Recuperatorios están ocultos por defecto, se mostrarán si es necesario
    const recupP1 = crearNotaItem(nombreMateria, "Recuperatorio Parcial 1");
    const recupP2 = crearNotaItem(nombreMateria, "Recuperatorio Parcial 2");
    const recupFinal = crearNotaItem(nombreMateria, "Recuperatorio Final");

    notasList.appendChild(recupP1);
    notasList.appendChild(recupP2);
    notasList.appendChild(recupFinal);

    return div;
  }

  // Actualiza las notas en el objeto y en el DOM, maneja mostrar/ocultar recuperatorios y colores
  function actualizarNota(materia) {
    const materiaDiv = [...container.children].find(div => div.querySelector("h3")?.textContent === materia);
    if (!materiaDiv) return;

    const notasList = materiaDiv.querySelector(".notas-list");
    let guardar = false;

    // Recorre cada nota para actualizar estados y valores
    [...notasList.children].forEach(divNota => {
      const select = divNota.querySelector("select");
      const inputManual = divNota.querySelector("input[type=number]");
      let valor = null;

      if (select) {
        if (select.value === "desaprobado" && inputManual) {
          valor = parseInt(inputManual.value) || 0;
        } else {
          valor = parseInt(select.value);
        }
      }

      // Actualizar clases para color según aprobado o no
      if (valor !== null) {
        divNota.classList.toggle("aprobado", valor >= 60);
        divNota.classList.toggle("desaprobado", valor < 60);
      }

      // Guardar nota en el objeto global
      const key = materia + "_" + divNota.dataset.tipo;
      if (valor !== null) {
        notasGuardadas[key] = valor;
        guardar = true;
      }

      // Lógica para mostrar/ocultar recuperatorios según nota
      if (divNota.dataset.tipo === "Parcial 1") {
        const recup = notasList.querySelector("[data-tipo='Recuperatorio Parcial 1']");
        if (valor < 60) {
          recup.style.display = "flex";
          recup.classList.add("visible");
        } else {
          recup.style.display = "none";
          recup.classList.remove("visible");
          // Borra la nota de recuperatorio si la hay
          delete notasGuardadas[materia + "_Recuperatorio Parcial 1"];
        }
      }
      if (divNota.dataset.tipo === "Parcial 2") {
        const recup = notasList.querySelector("[data-tipo='Recuperatorio Parcial 2']");
        if (valor < 60) {
          recup.style.display = "flex";
          recup.classList.add("visible");
        } else {
          recup.style.display = "none";
          recup.classList.remove("visible");
          delete notasGuardadas[materia + "_Recuperatorio Parcial 2"];
        }
      }
      if (divNota.dataset.tipo === "Final") {
        const recup = notasList.querySelector("[data-tipo='Recuperatorio Final']");
        if (valor < 60) {
          recup.style.display = "flex";
          recup.classList.add("visible");
        } else {
          recup.style.display = "none";
          recup.classList.remove("visible");
          delete notasGuardadas[materia + "_Recuperatorio Final"];
        }
      }
    });

    if (guardar) guardarNotas();
    actualizarPromedios();
  }

  // Guarda el objeto de notas en localStorage
  function guardarNotas() {
    localStorage.setItem("notasGuardadas", JSON.stringify(notasGuardadas));
  }

  // Calcula y muestra el promedio de trabajos prácticos y parciales (final no)
  function actualizarPromedios() {
    [...container.children].forEach(materiaDiv => {
      const notasList = materiaDiv.querySelector(".notas-list");
      const materia = materiaDiv.querySelector("h3").textContent;

      let suma = 0;
      let cantidad = 0;

      [...notasList.children].forEach(divNota => {
        const tipo = divNota.dataset.tipo;
        const key = materia + "_" + tipo;
        const valor = notasGuardadas[key];

        if (valor !== undefined) {
          // Solo trabajos prácticos y parciales cuentan para promedio
          if (tipo.startsWith("Tp") || tipo.startsWith("Parcial")) {
            suma += valor;
            cantidad++;
          }
        }
      });

      const promedio = cantidad === 0 ? 0 : (suma / cantidad).toFixed(2);

      // Mostrar promedio en un elemento o crear uno si no existe
      let promedioDiv = materiaDiv.querySelector(".promedio");
      if (!promedioDiv) {
        promedioDiv = document.createElement("div");
        promedioDiv.classList.add("promedio");
        promedioDiv.style.marginTop = "10px";
        promedioDiv.style.fontWeight = "bold";
        materiaDiv.appendChild(promedioDiv);
      }
      promedioDiv.textContent = `Promedio TP y Parciales: ${promedio}`;
    });
  }

  // Carga las notas guardadas y arma la UI
  function cargarNotas() {
    Object.entries(notasGuardadas).forEach(([key, valor]) => {
      const [materia, tipo] = key.split("_");
      if (!materia || !tipo) return;
      // No hago nada acá porque las notas se cargan al crear cada nota y actualizar estado
    });
  }

  // Crear toda la página con materias y notas
  function crearPagina() {
    Object.entries(materias).forEach(([anio, listaMaterias]) => {
      const seccion = document.createElement("section");
      seccion.classList.add("anio");
      const h2 = document.createElement("h2");
      h2.textContent = anio;
      seccion.appendChild(h2);

      listaMaterias.forEach(materia => {
        const materiaDiv = crearSeccionMateria(materia);
        seccion.appendChild(materiaDiv);
      });

      container.appendChild(seccion);
    });
  }

  crearPagina();

  // Después de crear toda la UI, asignamos valores guardados y eventos para actualizar notas
  [...container.querySelectorAll(".nota-item")].forEach(divNota => {
    const materia = divNota.dataset.materia;
    const tipo = divNota.dataset.tipo;
    const key = materia + "_" + tipo;
    const valorGuardado = notasGuardadas[key];

    const select = divNota.querySelector("select");
    const inputManual = divNota.querySelector("input[type=number]");

    if (valorGuardado !== undefined) {
      if (valorGuardado < 60) {
        select.value = "desaprobado";
        if (inputManual) {
          inputManual.value = valorGuardado;
        } else {
          // Crear input manual si no existe
          const nuevoInput = crearInputManual(valorGuardado);
          divNota.appendChild(nuevoInput);
        }
      } else {
        select.value = valorGuardado;
        if (inputManual) {
          inputManual.remove();
        }
      }
    }

    // Evento para actualizar nota cuando cambia select o input manual
    select.addEventListener("change", () => {
      if (select.value === "desaprobado") {
        let input = divNota.querySelector("input[type=number]");
        if (!input) {
          input = crearInputManual();
          divNota.appendChild(input);
          input.addEventListener("input", () => actualizarNota(materia));
        }
      } else {
        let input = divNota.querySelector("input[type=number]");
        if (input) input.remove();
      }
      actualizarNota(materia);
    });

    if (inputManual) {
      inputManual.addEventListener("input", () => actualizarNota(materia));
    }
  });

  actualizarPromedios();
});
                          
