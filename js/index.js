function elem(id) {
  return document.getElementById(id);
}

function v(id) {
  return document.getElementById(id).value;
}

function vn(id) {
  let element = document.getElementById(id);
  if (element) {
    if (element.value !== null && element.value !== '') {
      return Number.parseFloat(element.value);
    }
  }
  return Number.NaN;
}

function setValue(id, value) {
  let element = document.getElementById(id);
  if (element) {
    element.innerHTML = value;
  }
}

function menuBuscarUsuario() {
  refrescar = false;
  document.getElementById("menu-buscar-usuario").style.display = "block";
  document.getElementById("menu-rotaciones").style.display = "none";
  document.getElementById("menu-juegos-destacados").style.display = "none";
}

function menuRotaciones() {
  refrescar = false;
  document.getElementById("menu-buscar-usuario").style.display = "none";
  document.getElementById("menu-rotaciones").style.display = "block";
  document.getElementById("menu-juegos-destacados").style.display = "none";
  get("/?url=/lol/platform/v3/champion-rotations")
    .then(res => {
      document.getElementById("rotaciones").innerHTML = res;
    })
    .catch(error => {
      console.error(error);
    });
}

function juegosDestacados() {
  refrescar = true;
  document.getElementById("menu-buscar-usuario").style.display = "none";
  document.getElementById("menu-rotaciones").style.display = "none";
  document.getElementById("menu-juegos-destacados").style.display = "block";
  refrescarJuegosDestacados({
    clientRefreshInterval: 0
  });
}

function refrescarJuegosDestacados(respuesta) {
  if (refrescar) {
    setTimeout(() => {
      get("/?url=/lol/spectator/v4/featured-games")
        .then(res => {
          let respuesta = JSON.parse(res);
          document.getElementById("juegos-destacados").innerHTML = res;
          refrescarJuegosDestacados(respuesta);
        })
        .catch(error => {
          console.error(error);
        });
    }, respuesta.clientRefreshInterval);
  }
}

function get(url, cb) {
  return new Promise((resolve, reject) => {
    var api = "https://hidden-badlands-27037.herokuapp.com"
    var xhttp = new XMLHttpRequest();
    xhttp.withCredentials = false;
    xhttp.onreadystatechange = function () {
      if (this.readyState == 4)
        if (this.status == 200) {
          resolve(this.response);
        } else {
          reject(this.response);
        }
    }
    xhttp.open("GET", api + url);
    xhttp.send(null);
  });
}

var usuario, posiciones, refrescar = false;

function buscarUsuario() {
  let nombreUsuario = encodeURI(v("usuario"));
  console.log(nombreUsuario)

  get("/?url=/lol/summoner/v4/summoners/by-name/" + nombreUsuario)
    .then(response => {
      console.log(response)
      var res = JSON.parse(response);
      usuario = res;
      document.getElementById("id").innerHTML = res.id;
      document.getElementById("accountId").innerHTML = res.accountId;
      document.getElementById("puuid").innerHTML = res.puuid;
      document.getElementById("name").innerHTML = res.name;
      document.getElementById("profileIconId").innerHTML = '<img src="http://ddragon.leagueoflegends.com/cdn/6.24.1/img/profileicon/' + res.profileIconId + '.png?api_key=RGAPI-e5f6010f-404b-438b-8f68-76f034dfa4a6" alt="profileIconId" />';

      document.getElementById("revisionDate").innerHTML = res.revisionDate;
      document.getElementById("summonerLevel").innerHTML = res.summonerLevel;
    })
    .catch(error => {
      console.error(error);
    });
}

function buscarMaestrias() {
  get("/?url=/lol/champion-mastery/v4/champion-masteries/by-summoner/" + usuario.id)
    .then(res => {
      limpiar();
      document.getElementById("maestrias").innerHTML = res;
    })
    .catch(error => {
      console.error(error);
    });
}

function buscarPartidas() {
  get("/?url=/lol/match/v4/matchlists/by-account/" + usuario.accountId)
    .then(res => {
      limpiar();
      document.getElementById("historial").innerHTML = res;
    })
    .catch(error => {
      console.error(error);
    });
}

function buscarPosicion() {
  get("/?url=/lol/league/v4/positions/by-summoner/" + usuario.id)
    .then(res => {
      posiciones = JSON.parse(res);
      console.log(posicion)
      limpiar();
      let dom = "";
      for (let i = 0; i < posiciones.length; i++) {
        dom += `
        <div class="container mx-auto px-4">
          <button class="bg-blue hover:bg-blue-light text-white font-bold py-2 px-4 border-b-4 border-blue-dark hover:border-blue rounded"
          onclick="buscarLiga('${posiciones[i].leagueId}')">Ver liga</button>
          <div id="liga${posiciones[i].leagueId}"></div>
        </div>
        `;
      }
      document.getElementById("posicion").innerHTML = res + dom;

    })
    .catch(error => {
      console.error(error);
    });
}

function buscarLiga(leagueId) {
  get("/?url=/lol/league/v4/leagues/" + leagueId)
    .then(res => {
      document.getElementById("liga"+leagueId).innerHTML = res;
    })
    .catch(error => {
      console.error(error);
    });
}

function limpiar() {
  document.getElementById("maestrias").innerHTML = "";
  document.getElementById("historial").innerHTML = "";
  document.getElementById("posicion").innerHTML = "";
}
