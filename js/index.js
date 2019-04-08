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
      let rotaciones = JSON.parse(res);
      let rotacionesGratuitos = rotaciones.freeChampionIds;
      let rotacionesGratuitosNuevos = rotaciones.freeChampionIdsForNewPlayers;
      getNativo("/rotaciones.html")
        .then(res => {
          rotacionesGratuitos.map(r => {
            let html = $(res);
            html.find("#championId").text(r);
            $("#rotacionesGratuitos").append(html);
            $("#rotacionesGratuitos").append($("<br>"));
          });
          rotacionesGratuitosNuevos.map(r => {
            let html = $(res);
            html.find("#championId").text(r);
            $("#rotacionesGratuitosNuevos").append(html);
            $("#rotacionesGratuitosNuevos").append($("<br>"));
          });
        });
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
  refrescarJuegosDestacados(0);
}

function refrescarJuegosDestacados(clientRefreshInterval) {
  if (refrescar) {
    setTimeout(() => {
      let respuesta;
      get("/?url=/lol/spectator/v4/featured-games")
        .then(res => {
          respuesta = JSON.parse(res);
          return getNativo("/juegos-destacados.html");
        })
        .then(res=>{
          respuesta.gameList.map(g=>{
            let html = $(res);
            html.find("#gameMode").text(g.gameMode);
            $("#juegos-destacados").append(html);
            $("#juegos-destacados").append($("<br>"));
          })
          refrescarJuegosDestacados(respuesta.clientRefreshInterval + 10000);
        })
        .catch(error => {
          console.error(error);
        });
    }, clientRefreshInterval);
  }
}

function getNativo(url) {
  return new Promise((resolve, reject) => {
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
    xhttp.open("GET", url);
    xhttp.send(null);
  });
}

function get(url) {
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
      document.getElementById("name").innerHTML = res.name;
      document.getElementById("profileIconId").innerHTML = '<img src="http://ddragon.leagueoflegends.com/cdn/6.24.1/img/profileicon/' + res.profileIconId + '.png?api_key=RGAPI-e5f6010f-404b-438b-8f68-76f034dfa4a6" alt="profileIconId" />';
      document.getElementById("summonerLevel").innerHTML = res.summonerLevel;
    })
    .catch(error => {
      console.error(error);
    });
}

function buscarMaestrias() {
  let maestrias;
  get("/?url=/lol/champion-mastery/v4/champion-masteries/by-summoner/" + usuario.id)
    .then(res => {
      limpiar();
      maestrias = JSON.parse(res);
      return getNativo("/maestrias.html");
    })
    .then(res => {
      maestrias.map(m => {
        let html = $(res);
        html.find("#championId").text(m.championId);
        html.find("#championPoints").text(m.championPoints);
        html.find("#championLevel").text(m.championLevel);
        html.find("#lastPlayTime").text(new Date(m.lastPlayTime).toDateString());
        html.find("#chestGranted").text(m.chestGranted);
        html.find("#championPointsSinceLastLevel").text(m.championPointsSinceLastLevel);
        html.find("#championPointsUntilNextLevel").text(m.championPointsUntilNextLevel);
        $("#maestrias").append(html);
        $("#maestrias").append($("<br>"));
      })
    })
    .catch(error => {
      console.error(error);
    });
}

function buscarPartidas() {
  let matches;
  get("/?url=/lol/match/v4/matchlists/by-account/" + usuario.accountId)
    .then(res => {
      limpiar();
      matches = (JSON.parse(res)).matches;
      return getNativo("/matches.html");
    })
    .then(res => {
      matches.map(m => {
        let html = $(res);
        html.find("#season").text(m.season);
        html.find("#champion").text(m.champion);
        html.find("#role").text(m.role);
        html.find("#timestamp").text(new Date(m.timestamp).toDateString());
        html.find("#lane").text(m.lane);
        $("#historial").append(html);
        $("#historial").append($("<br>"));
      });
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
      return getNativo("/posiciones.html");
      /*
        dom += `
        <div class="container mx-auto px-4">
          <button class="bg-blue hover:bg-blue-light text-white font-bold py-2 px-4 border-b-4 border-blue-dark hover:border-blue rounded"
          onclick="buscarLiga('${posiciones[i].leagueId}')">Ver liga</button>
          <div id="liga${posiciones[i].leagueId}"></div>
        </div>
        `
*/
    })
    .then(res => {
      for (let i = 0; i < posiciones.length; i++) {
        let p = posiciones[i];
        let html = $(res);
        html.find("#leagueName").text(p.leagueName);
        html.find("#wins").text(p.wins);
        html.find("#losses").text(p.losses);
        html.find("#tier").text(p.tier);
        html.find("#rank").text(p.rank);
        html.find("#queueType").text(p.queueType);
        html.find("#btnVerLiga").on('click', buscarLiga(p.leagueId));
        $("#posicion").append(html);
        $("#posicion").append($("<br>"));
      }
      $("#posicion").append(`<div id="liga"></div>`);
    })
    .catch(error => {
      console.error(error);
    });
}

function buscarLiga(leagueId) {
  return () => {
    let entries;
    get("/?url=/lol/league/v4/leagues/" + leagueId)
      .then(res => {
        entries = JSON.parse(res).entries;
        return getNativo("/liga.html");
      })
      .then(res => {
        entries.map(e => {
          let html = $(res);
          html.find("#summonerName").text(e.summonerName);
          html.find("#leaguePoints").text(e.leaguePoints);
          html.find("#rank").text(e.rank);
          html.find("#wins").text(e.wins);
          html.find("#losses").text(e.losses);
          $("#liga").append(html);
        });
      })
      .catch(error => {
        console.error(error);
      });
  };

}

function limpiar() {
  document.getElementById("maestrias").innerHTML = "";
  document.getElementById("historial").innerHTML = "";
  document.getElementById("posicion").innerHTML = "";
}
