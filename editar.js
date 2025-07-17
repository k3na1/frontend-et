document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const juegoId = params.get("id");

    if (!juegoId) {
        alert("ID de juego no proporcionado");
        window.location.href = "/gestion.html";
        return;
    }

    const form = document.getElementById("form-editar");
    const fields = {
        id: document.getElementById("juego-id"),
        nombre: document.getElementById("nombre"),
        genero: document.getElementById("genero"),
        plataforma: document.getElementById("plataforma"),
        descripcion: document.getElementById("descripcion"),
        precio: document.getElementById("precio"),
        imagen: document.getElementById("imagen")
    };

    // Obtener datos del juego
    fetch(`https://backend-et-production.up.railway.app/api/juegos`)
        .then(res => res.json())
        .then(juegos => {
            const juego = juegos.find(j => j.id == juegoId);
            if (!juego) throw new Error("Juego no encontrado");

            fields.id.value = juego.id;
            fields.nombre.value = juego.nombre;
            fields.genero.value = juego.genero;
            fields.plataforma.value = juego.plataforma;
            fields.descripcion.value = juego.descripcion;
            fields.precio.value = juego.precio;
            fields.imagen.value = juego.imagen;
        })
        .catch(err => {
            alert("Error al cargar juego: " + err.message);
            window.location.href = "/gestion.html";
        });

    // Enviar cambios
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const cambios = {
            nombre: fields.nombre.value,
            genero: fields.genero.value,
            plataforma: fields.plataforma.value,
            descripcion: fields.descripcion.value,
            precio: fields.precio.value,
            imagen: fields.imagen.value
        };

        try {
            const response = await fetch(`https://backend-et-production.up.railway.app/api/juegos/${fields.id.value}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(cambios)
            });

            if (!response.ok) throw new Error("Error al actualizar juego");
            alert("Juego actualizado correctamente");
            window.location.href = "/gestion.html";

        } catch (error) {
            alert("Error: " + error.message);
        }
    });
});
