
//Formulario para agregar juegos en agregar.html

const form = document.getElementById("form-juego");

if (form) {
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        let imagen = document.getElementById("imagen").value;

        // Si no hay imagen, buscar en CheapShark
        if (!imagen) {
            const nombreJuego = document.getElementById("nombre").value;

            try {
                const res = await fetch(`https://www.cheapshark.com/api/1.0/games?title=${encodeURIComponent(nombreJuego)}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.length > 0) {
                        imagen = data[0].thumb;  // thumbnail del primer resultado
                    }
                }
            } catch (err) {
                console.error("Error al obtener imagen desde CheapShark:", err);
            }
        }

        const juego = {
            nombre: document.getElementById("nombre").value,
            genero: document.getElementById("genero").value,
            plataforma: document.getElementById("plataforma").value,
            descripcion: document.getElementById("descripcion").value,
            precio: document.getElementById("precio").value,
            imagen: imagen  // aquí usamos la imagen ya sea ingresada o buscada
        };

        const response = await fetch("http://localhost:8080/api/juegos", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(juego)
        });

        if (response.ok) {
            Swal.fire({
                icon: 'success',
                title: '¡Éxito!',
                text: 'Juego agregado correctamente',
                confirmButtonText: 'OK'
            }).then(() => {
                window.location.href = "/gestion.html";
            });
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo guardar el juego',
                confirmButtonText: 'OK'
            });
        }

    });
}


//Catálogo de juegos
async function cargarJuegos() {
    const contenedor = document.getElementById("catalogo");
    contenedor.innerHTML = "Cargando juegos...";

    try {
        const response = await fetch("http://localhost:8080/api/juegos");
        if (!response.ok) throw new Error("Error al cargar juegos");

        const juegos = await response.json();

        if (juegos.length === 0) {
            contenedor.innerHTML = "<p>No hay juegos registrados aún.</p>";
            return;
        }

        contenedor.innerHTML = "";

        juegos.forEach(juego => {
            const card = document.createElement("div");
            card.className = "bg-white rounded shadow p-4 flex flex-col";

            card.innerHTML = `
        <img src="${juego.imagen || 'https://via.placeholder.com/150'}" alt="${juego.nombre}" class="w-full h-48 object-cover rounded mb-4" />
        <h2 class="text-xl font-semibold mb-2">${juego.nombre}</h2>
        <p class="text-gray-700 mb-1"><strong>Género:</strong> ${juego.genero}</p>
        <p class="text-gray-700 mb-1"><strong>Precio:</strong> ${juego.precio}</p>
      `;

            contenedor.appendChild(card);
        });

    } catch (error) {
        contenedor.innerHTML = `<p class="text-red-600">${error.message}</p>`;
    }
}

// Ejecutar al cargar la página
document.addEventListener("DOMContentLoaded", () => {
    cargarJuegos();            // Para catalogo.html
    cargarJuegosGestion();     // Para gestion.html
});


// Cargar juegos para la tabla de gestión
async function cargarJuegosGestion() {
    const tbody = document.getElementById("tabla-juegos");
    if (!tbody) return; // No estamos en gestion.html

    try {
        const response = await fetch("http://localhost:8080/api/juegos");
        if (!response.ok) throw new Error("Error al cargar juegos");

        const juegos = await response.json();

        tbody.innerHTML = "";
        juegos.forEach(juego => {
            const tr = document.createElement("tr");

            tr.innerHTML = `
      <td class="border border-gray-300 px-4 py-2">${juego.id}</td>
      <td class="border border-gray-300 px-4 py-2">${juego.nombre}</td>
      <td class="border border-gray-300 px-4 py-2">${juego.genero}</td>
      <td class="border border-gray-300 px-4 py-2">${juego.plataforma}</td>
      <td class="border border-gray-300 px-4 py-2">${juego.descripcion}</td>
      <td class="border border-gray-300 px-4 py-2">${juego.precio}</td>
      <td class="border border-gray-300 px-4 py-2">
        <img src="${juego.imagen}" alt="${juego.nombre}" class="h-16 w-auto object-cover rounded" />
      </td>
      <td class="border border-gray-300 px-4 py-2 space-x-2">
        <a href="/editar.html?id=${juego.id}" class="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded">Editar</a>
        <button class="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded" onclick="eliminarJuego(${juego.id})">Eliminar</button>
      </td>

    `;


            tbody.appendChild(tr);
        });
    } catch (error) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-red-600 p-4">${error.message}</td></tr>`;
    }
}

// Función para eliminar juego, igual que antes
async function eliminarJuego(id) {
    const confirmarEliminar = await Swal.fire({
        title: '¿Estás seguro?',
        text: "No podrás revertir esto",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    });

    if (!confirmarEliminar.isConfirmed) return;


    try {
        const response = await fetch(`http://localhost:8080/api/juegos/${id}`, { method: "DELETE" });
        if (!response.ok) throw new Error("Error al eliminar el juego");

        Swal.fire({
            icon: 'success',
            title: 'Eliminado',
            text: 'El juego fue eliminado correctamente',
            confirmButtonText: 'OK'
        });
        cargarJuegosGestion(); // refrescar tabla
    }
    catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message,
            confirmButtonText: 'OK'
        });
    }
}