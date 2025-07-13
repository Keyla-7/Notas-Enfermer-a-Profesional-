document.addEventListener("DOMContentLoaded", () => {
  // Materias organizadas por años
  const materiasPorAnio = {
    1: [
      "Antropologia",
      "Procesos psicologicos y sociales",
      "Entornos virtuales",
      "Comunicación en salud",
      "Bases del cuidado",
      "Morfofisiologia",
      "Fisico-quimica",
      "Enfermeria comunitaria y salud publica",
      "Practica profesionalizante I",
      "Matematicas",
      "Comprension y produccion lectora"
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
      "Cuidados de enfermeria en el adulto mayor"
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
      "Practica profesionalizante III",
      "Vacunacion e inmunizacion"
    ]
  };

  // Guardar notas en localStorage con esta clave
  const LS_KEY = "notasEnfermeriaProfesional";

  // Recuperar o iniciar notas
  let notasGuardadas = JSON.parse(localStorage.getItem(LS_KEY) || "{}");

  const contenedor = document.getElementById("contenedor-notas");

  // Función para crear el select de notas 60-100 y opción desaprobado
  function crearSelectNota(valorActual, onChangeCallback) {
    const select = document.createElement("select");
    select.className = "nota-select";

    // Opción desaprobado
    const opcionDesaprobado = document.createElement("option");
    opcionDesaprobado.value = "desaprobado";
    opcionDesaprobado.textContent = "Desaprobado";
    select.appendChild(opcionDesaprobado);

    // Opciones de 60 a 100 de uno en uno
    for (let i = 60; i <= 100; i++) {
      const opt = document.createElement("option");
      opt.value = i;
      opt.textContent = i;
      select.appendChild(opt);
    }

    // Si valorActual es menor a 60 y numérico, setear select en desaprobado
    if (typeof valorActual === "number" && valorActual < 60) {
      select.value = "desaprobado";
    } else if (typeof valorActual === "number") {
      select.value = valorActual;
    } else {
      select.value = "desaprobado";
    }

    select.addEventListener("change", (e) => {
      onChangeCallback(e.target.value);
    });

    return select;
  }

  // Función para crear input para nota manual si desaprobado
  function crearInputNota(valorActual, onInputCallback) {
    const input = document.createElement("input");
    input.type = "number";
    input.min = 0;
    input.max = 59;
    input.step = 1;
    input.className = "nota-input";
    input.placeholder = "0 - 59";

    if (typeof valorActual === "number" && valorActual < 60) {
      input.value = valorActual;
      input.style.display = "inline-block";
    }

    input.addEventListener("input", (e) => {
      const val = parseInt(e.target.value, 10);
      if (!isNaN(val)) {
        onInputCallback(val);
      } else {
        onInputCallback(null);
      }
    });

    return input;
  }

  // Crear un item de nota: label + select + input (input solo visible si desaprobado) + boton eliminar para TP
  // tipo: "tp", "parcial", "final", "recuperatorio"
  // eliminarBtnVisible solo para TPs
  function crearNotaItem(materia, tipo, numero, valorNota, onChange, eliminarBtnVisible = false, onEliminar) {
    const div = document.createElement("div");
    div.className = "nota-item";
    div.dataset.tipo = tipo;

    // Etiqueta
    const label = document.createElement("div");
    label.className = "nota-label";
    let textoLabel = tipo.toUpperCase();
    if (tipo === "tp") textoLabel = `TP ${numero}`;
    if (tipo === "parcial") textoLabel = `Parcial ${numero}`;
    if (tipo === "final") textoLabel = "Final";
    if (tipo === "recuperatorio") textoLabel = `Recuperatorio ${numero}`;

    label.textContent = textoLabel;
    div.appendChild(label);

    // Select nota
    const select = crearSelectNota(valorNota, (nuevoValor) => {
      if (nuevoValor === "desaprobado") {
        input.style.display = "inline-block";
        // Actualizar estado visual a desaprobado
        div.classList.remove("aprobado");
        div.classList.add("desaprobado");
        actualizarNota(materia, tipo, numero, null, true);
      } else {
        input.style.display = "none";
        div.classList.remove("desaprobado");
        div.classList.add("aprobado");
        actualizarNota(materia, tipo, numero, Number(nuevoValor), false);
      }
      actualizarPromedio(materia);
      actualizarVisualNotas(div);
      manejarRecuperatorios(materia);
    });
    div.appendChild(select);

    // Input nota manual (solo para desaprobado)
    const input = crearInputNota(valorNota, (nuevoValor) => {
      if (nuevoValor !== null && nuevoValor >= 0 && nuevoValor <= 59) {
        actualizarNota(materia, tipo, numero, nuevoValor, true);
        actualizarPromedio(materia);
        actualizarVisualNotas(div);
        manejarRecuperatorios(materia);
      }
    });
    div.appendChild(input);

    // Mostrar u ocultar input segun valorNota
    if (typeof valorNota === "number" && valorNota < 60) {
      input.style.display = "inline-block";
      div.classList.add("desaprobado");
    } else if (typeof valorNota === "number" && valorNota >= 60) {
      div.classList.add("aprobado");
    }

    // Boton eliminar para trabajos practicos
    if (eliminarBtnVisible) {
      const btnEliminar = document.createElement("button");
      btnEliminar.className = "eliminar-tp-btn boton-emoj";
      btnEliminar.title = "Eliminar trabajo práctico ❌";
      btnEliminar.textContent = "❌";
      btnEliminar.addEventListener("click", () => {
        if (confirm(`¿Eliminar ${textoLabel} de ${materia}?`)) {
          eliminarTrabajoPractico(materia, numero);
        }
      });
      div.appendChild(btnEliminar);
    }

    return div;
  }

  // Actualizar nota en el objeto y guardar
  function actualizarNota(materia, tipo, numero, valor, desaprobado = false) {
    if (!notasGuardadas[materia]) notasGuardadas[materia] = {};

    if (!notasGuardadas[materia][tipo]) notasGuardadas[materia][tipo] = {};

    if (valor === null) {
      delete notasGuardadas[materia][tipo][numero];
    } else {
      notasGuardadas[materia][tipo][numero] = { valor, desaprobado };
    }

    // Si está vacío el objeto tipo lo eliminamos
    if (Object.keys(notasGuardadas[materia][tipo]).length === 0) {
      delete notasGuardadas[materia][tipo];
    }

    // Si materia vacía la borramos
    if (Object.keys(notasGuardadas[materia]).length === 0) {
      delete notasGuardadas[materia];
    }

    localStorage.setItem(LS_KEY, JSON.stringify(notasGuardadas));
  }

  // Eliminar trabajo practico entero
  function eliminarTrabajoPractico(materia, numero) {
    if (notasGuardadas[materia] && notasGuardadas[materia].tp && notasGuardadas[materia].tp[numero]) {
      delete notasGuardadas[materia].tp[numero];

      // Si tp queda vacío
      if (Object.keys(notasGuardadas[materia].tp).length === 0) {
        delete notasGuardadas[materia].tp;
      }
      // Si materia vacía la borramos
      if (Object.keys(notasGuardadas[materia]).length === 0) {
        delete notasGuardadas[materia];
      }

      localStorage.setItem(LS_KEY, JSON.stringify(notasGuardadas));
      renderizarPagina();
    }
  }

  // Actualizar estilos visuales según nota
  function actualizarVisualNotas(divNotaItem) {
    const select = divNotaItem.querySelector("select");
    const input = divNotaItem.querySelector("input");

    let valor = null;
    if (select.value === "desaprobado") {
      valor = parseInt(input.value) || null;
    } else {
      valor = parseInt(select.value) || null;
    }

    divNotaItem.classList.remove("aprobado", "desaprobado");

    if (valor !== null) {
      if (valor >= 60) {
        divNotaItem.classList.add("aprobado");
      } else {
        divNotaItem.classList.add("desaprobado");
      }
    }
  }

  // Mostrar u ocultar recuperatorios según notas desaprobadas
  function manejarRecuperatorios(materia) {
    const materiaNotas = notasGuardadas[materia] || {};

    // Para parciales 1 y 2
    for (let parcialNum = 1; parcialNum <= 2; parcialNum++) {
      const parcial = materiaNotas.parcial && materiaNotas.parcial[parcialNum];
      const recuperatorioSelector = document.querySelector(
        `[data-materia="${materia}"] .nota-item.recuperatorio[data-rel="parcial${parcialNum}"]`
      );

      if (parcial && parcial.valor !== null && parcial.valor < 60) {
        // Mostrar recuperatorio
        if (recuperatorioSelector) recuperatorioSelector.classList.add("visible");
      } else {
        // Ocultar recuperatorio y limpiar nota si existía
        if (recuperatorioSelector) {
          recuperatorioSelector.classList.remove("visible");
          // Limpiar nota recuperatorio
          actualizarNota(materia, "recuperatorio", `parcial${parcialNum}`, null);
          // Actualizar select/input para que desaparezca la nota visualmente
          const select = recuperatorioSelector.querySelector("select");
          const input = recuperatorioSelector.querySelector("input");
          if (select) select.value = "desaprobado";
          if (input) {
            input.value = "";
            input.style.display = "none";
          }
        }
      }
    }

    // Para final
    const final = materiaNotas.final && Object.values(materiaNotas.final)[0];
    const recuperatorioFinalDiv = document.querySelector(
      `[data-materia="${materia}"] .nota-item.recuperatorio[data-rel="final"]`
    );

    if (final && final.valor !== null && final.valor < 60) {
      if (recuperatorioFinalDiv) recuperatorioFinalDiv.classList.add("visible");
    } else {
      if (recuperatorioFinalDiv) {
        recuperatorioFinalDiv.classList.remove("visible");
        // Limpiar nota recuperatorio final
        actualizarNota(materia, "recuperatorio", "final", null);
        const select = recuperatorioFinalDiv.querySelector("select");
        const input = recuperatorioFinalDiv.querySelector("input");
        if (select) select.value = "desaprobado";
        if (input) {
          input.value = "";
          input.style.display = "none";
        }
      }
    }
  }

  // Calcular y mostrar promedio solo de TP y parciales (no finales)
  function actualizarPromedio(materia) {
    const materiaNotas = notasGuardadas[materia];
    if (!materiaNotas) {
      actualizarPromedioVisual(materia, null);
      return;
    }

    let suma = 0;
    let count = 0;

    // TP
    if (materiaNotas.tp) {
      for (const key in materiaNotas.tp) {
        const nota = materiaNotas.tp[key];
        if (nota.valor !== null && nota.valor >= 0) {
          suma += nota.valor;
          count++;
        }
      }
    }

    // Parciales
    if (materiaNotas.parcial) {
      for (const key in materiaNotas.parcial) {
        const nota = materiaNotas.parcial[key];
        if (nota.valor !== null && nota.valor >= 0) {
          suma += nota.valor;
          count++;
        }
      }
    }

    if (count === 0) {
      actualizarPromedioVisual(materia, null);
      return;
    }

    const promedio = (suma / count).toFixed(2);
    actualizarPromedioVisual(materia, promedio);
  }

  function actualizarPromedioVisual(materia, promedio) {
    const contenedorMateria = document.querySelector(`[data-materia="${materia}"]`);
    if (!contenedorMateria) return;

    let elemPromedio = contenedorMateria.querySelector(".promedio");
    if (!elemPromedio) {
      elemPromedio = document.createElement("div");
      elemPromedio.className = "promedio";
      contenedorMateria.appendChild(elemPromedio);
    }

    if (promedio === null) {
      elemPromedio.textContent = "Promedio: -";
    } else {
      elemPromedio.textContent = `Promedio TP + Parciales: ${promedio}%`;
    }
  }

  // Crear materia con todos sus controles
  function crearMateria(materia, anio) {
    const divMateria = document.createElement("div");
    divMateria.className = "materia";
    divMateria.dataset.materia = materia;

    const titulo = document.createElement("h3");
    titulo.textContent = materia;
    divMateria.appendChild(titulo);

    const listaNotas = document.createElement("div");
    listaNotas.className = "notas-list";

    // Trabajos prácticos (tp)
    const tps = notasGuardadas[materia] && notasGuardadas[materia].tp ? notasGuardadas[materia].tp : {};
    const numTPs = Object.keys(tps).length || 0;

    // Mostrar TP existentes
    for (let i = 1; i <= numTPs; i++) {
      const valorNota = tps[i] ? tps[i].valor : null;
      const desaprobado = tps[i] ? tps[i].desaprobado : false;
      const notaItem = crearNotaItem(materia, "tp", i, valorNota, null, true);
      listaNotas.appendChild(notaItem);
    }

    // Botón para agregar TP
    const btnAgregarTP = document.createElement("button");
    btnAgregarTP.className = "agregar-tp-btn";
    btnAgregarTP.textContent = "➕ Agregar TP";
    btnAgregarTP.title = `Agregar trabajo práctico a ${materia}`;
    btnAgregarTP.addEventListener("click", () => {
      const nuevoNumTP = Object.keys(tps).length + 1;
      // Crear nuevo TP con nota null
      actualizarNota(materia, "tp", nuevoNumTP, null);
      renderizarPagina(); // Recargar toda la página para refrescar vista
    });
    divMateria.appendChild(listaNotas);
    divMateria.appendChild(btnAgregarTP);

    // Parciales (2)
    for (let p = 1; p <= 2; p++) {
      const valorNota = notasGuardadas[materia]?.parcial?.[p]?.valor ?? null;
      const notaItemParcial = crearNotaItem(materia, "parcial", p, valorNota, null);
      listaNotas.appendChild(notaItemParcial);

      // Recuperatorio parcial
      const valorRecup = notasGuardadas[materia]?.recuperatorio?.[`parcial${p}`]?.valor ?? null;
      const recupDiv = crearNotaItem(materia, "recuperatorio", `parcial${p}`, valorRecup, null);
      recupDiv.classList.add("recuperatorio");
      recupDiv.dataset.rel = `parcial${p}`;
      listaNotas.appendChild(recupDiv);
    }

    // Final
    const valorFinal = notasGuardadas[materia]?.final?.[1]?.valor ?? null;
    const notaFinal = crearNotaItem(materia, "final", 1, valorFinal, null);
    listaNotas.appendChild(notaFinal);

    // Recuperatorio final
    const valorRecupFinal = notasGuardadas[materia]?.recuperatorio?.final?.valor ?? null;
    const recupFinalDiv = crearNotaItem(materia, "recuperatorio", "final", valorRecupFinal, null);
    recupFinalDiv.classList.add("recuperatorio");
    recupFinalDiv.dataset.rel = "final";
    listaNotas.appendChild(recupFinalDiv);

    actualizarPromedio(materia);
    manejarRecuperatorios(materia);

    return divMateria;
  }

  // Renderizar toda la página
  function renderizarPagina() {
    contenedor.innerHTML = "";
    for (const anio in materiasPorAnio) {
      const divAnio = document.createElement("section");
      divAnio.className = "anio";
      divAnio.dataset.anio = anio;

      const h2 = document.createElement("h2");
      h2.textContent = `Año ${anio}`;
      divAnio.appendChild(h2);

      const divMaterias = document.createElement("div");
      divMaterias.className = "materias-container";

      materiasPorAnio[anio].forEach((mat) => {
        const materiaDiv = crearMateria(mat, anio);
        divMaterias.appendChild(materiaDiv);
      });

      divAnio.appendChild(divMaterias);
      contenedor.appendChild(divAnio);
    }
  }

  // Inicializar
  renderizarPagina();
});
        
