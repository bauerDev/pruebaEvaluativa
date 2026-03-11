let map;

document.addEventListener("DOMContentLoaded", () => {
  inicializarMapa();
});


//FUNCIONES TODO PARA EL MAPA

function inicializarMapa() {
  const mapDiv = document.getElementById("map");
  if (!mapDiv || !window.L) return;

  // Centro inicial
  map = L.map("map").setView([36.7213, -4.4214], 13);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "© OpenStreetMap"
  }).addTo(map);

  cargarLugares();
}

async function cargarLugares() {
  try {
    const response = await fetch("/data/lugares.json");
    if (!response.ok) {
      throw new Error("No se pudo cargar lugares.json");
    }

    const data = await response.json();
    const features = Array.isArray(data.features) ? data.features : [];
    const bounds = L.latLngBounds([]);

    features.forEach((feature) => {
      const geometry = feature.geometry || {};
      const coordinates = geometry.coordinates;

      if (!Array.isArray(coordinates) || coordinates.length < 2) {
        return;
      }

      const lon = Number(coordinates[0]);
      const lat = Number(coordinates[1]);

      if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
        return;
      }

      const properties = feature.properties || {};
      const nombre = properties.NOMBRE || "Sin nombre";
      const direccion = properties.DIRECCION || "Sin dirección";

      L.marker([lat, lon])
        .addTo(map)
        .bindPopup(nombre)
        .on('click', function() {
          Swal.fire({
            title: nombre,
            html:`
                <div>
                <strong>Dirección:</strong> ${direccion}<br><br>
                ${properties.DESCRIPCION || "Sin descripción"}
                </div>
            `,
            icon: "info",
            confirmButtonText: 'Ok'
          });
        });

      bounds.extend([lat, lon]);
    });

    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [30, 30] });
    }
  } catch (error) {
    console.error("Error cargando lugares:", error);
  }
}


//FUNCION PARA INICIAR SESION

function iniciarSesion() {

  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;   
  const loginBtn = document.getElementById("login-btn");

    if (loginBtn) {
        loginBtn.textContent = "Logout";
        loginBtn.removeEventListener("click", iniciarSesion);
        loginBtn.addEventListener("click", cerrarSesion);
    }

  if (username === "admin" && password === "1234") {
    Swal.fire({
      title: "¡Bienvenido, admin!",
      icon: "success",
    });
  } else {
    Swal.fire({
      title: "Error",
      text: "Usuario o contraseña incorrectos.",
      icon: "error",
    });
  }
}

document.getElementById("loginForm").addEventListener("submit", function(event) {
  event.preventDefault();
  iniciarSesion();
});


//FUNCION PARA CERRAR SESION SIN ALERTAS

function cerrarSesion() {
  window.location.href = "/";
}
