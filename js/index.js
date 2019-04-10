
var usuario, posiciones, refrescar = false, campeones;

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
            let champ = campeon(r);
            if (!champ) {
              return;
            }
            html.find("#championImg").append($(`<img src="http://ddragon.leagueoflegends.com/cdn/img/champion/loading/${champ.id}_0.jpg" style="height: 45vh;" alt="Background ${champ.name}"/>`));
            html.find("#championId").text(champ.name);
            $("#rotacionesGratuitos").append(html);
            $("#rotacionesGratuitos").append($("<br>"));
          });
          rotacionesGratuitosNuevos.map(r => {
            let html = $(res);
            let champ = campeon(r);
            if (!champ) {
              return;
            }
            html.find("#championImg").append($(`<img src="http://ddragon.leagueoflegends.com/cdn/img/champion/loading/${champ.id}_0.jpg" style="height: 45vh;" alt="Background ${champ.name}"/>`));
            html.find("#championId").text(champ.name);
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

function htmlJugadorEquipo(data) {
  let champ = campeon(data.championId);
  if (!champ) {
    return;
  }
  return `
    <div class="flex items-center m-2">
      <img class="w-10 h-10 rounded-full mr-4" src="http://ddragon.leagueoflegends.com/cdn/9.7.1/img/profileicon/${data.profileIconId}.png" alt="profileIconId" />
      <div class="text-sm w-full">
        <p class="text-black leading-none">${data.summonerName}</p>
        <p class="text-grey-dark">${champ.name}</p>
      </div>
      <img style="height: 3.2rem;" src="http://ddragon.leagueoflegends.com/cdn/img/champion/loading/${champ.id}_0.jpg" alt="Avatar of Champion">
    </div>
  `;
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
          $("#juegos-destacados").html("");
          respuesta.gameList.map(g=>{
            let html = $(res);
            
            html.find("#mapId").append($(`<img src="http://ddragon.leagueoflegends.com/cdn/6.24.1/img/map/map${g.mapId}.png" alt="bgk" style="height: 30vh;" />`));
            html.find("#gameMode").text(g.gameMode);
            html.find("#gameStartTime").text("Inicio de partida: " + new Date(g.gameStartTime).toDateString());
            let platform = getPlatformData(g.platformId);
            html.find("#comando").text(`Carpeta: C:/Riot Games/League of Legends/RADS/projects/league_client/releases/0.0.0.195/deploy/\n./LeagueClient.exe 8394 "LeagueClient.exe" "/path" "spectator ${platform.domain}:${platform.port} ${g.observers.encryptionKey} ${g.gameId} ${g.platformId}"`);
            
            for (let e = "1", i = 0; i < 10; i ++) {
              if (i == 5) {
                e = "2"
              }
              html.find("#equipo"+e).append($(htmlJugadorEquipo(g.participants[i])));
            }
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

function getPlatformData(platformId) {
  let platforms = {
   	NA1: { domain: "spectator.na.lol.riotgames.com", port: "80"},
    EUW1: { domain: "spectator.euw1.lol.riotgames.com", port: "80"},
    EUN1: { domain: "spectator.eu.lol.riotgames.com", port: "8088"},
    JP1: { domain: "spectator.jp1.lol.riotgames.com", port: "80"},
    KR: { domain: "spectator.kr.lol.riotgames.com", port: "80"},
    OC1: { domain: "spectator.oc1.lol.riotgames.com", port: "80"},
    BR1: { domain: "spectator.br.lol.riotgames.com", port: "80"},
    LA1: { domain: "spectator.la1.lol.riotgames.com", port: "80"},
    LA2: { domain: "spectator.la2.lol.riotgames.com", port: "80"},
    RU: { domain: "spectator.ru.lol.riotgames.com", port: "80"},
    TR1: { domain: "spectator.tr.lol.riotgames.com", port: "80"},
    PBE1: { domain: "spectator.pbe1.lol.riotgames.com", port: "80"}
  };
  return platforms[platformId]
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

function buscarUsuario() {
  let nombreUsuario = encodeURI(v("usuario"));
  console.log(nombreUsuario)

  get("/?url=/lol/summoner/v4/summoners/by-name/" + nombreUsuario)
    .then(response => {
      console.log(response)
      var res = JSON.parse(response);
      usuario = res;
      document.getElementById("name").innerHTML = res.name;
      document.getElementById("profileIconId").innerHTML = '<img src="http://ddragon.leagueoflegends.com/cdn/9.7.1/img/profileicon/' + res.profileIconId + '.png" alt="profileIconId" />';
      document.getElementById("summonerLevel").innerHTML = "Nivel "+ res.summonerLevel;
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
        let champ = campeon(m.championId);
        if (!champ) {
          return;
        }
        
        html.find("#championImg").append($(`<img src="http://ddragon.leagueoflegends.com/cdn/img/champion/splash/${champ.id}_0.jpg" alt="Background ${champ.name}"/>`));
        html.find("#championId").text(champ.name);
        html.find("#championPoints").text("Puntos de maestría: " + m.championPoints);
        html.find("#championLevel").text("Nivel de Campeón: "+m.championLevel);
        html.find("#lastPlayTime").text("Jugado última vez: " + new Date(m.lastPlayTime).toDateString());
        html.find("#chestGranted").text(m.chestGranted ? "Cofre otorgado" : "Aún no tiene cofre");
        html.find("#championPointsSinceLastLevel").text("Puntos desde la última vez: " +  m.championPointsSinceLastLevel);
        html.find("#championPointsUntilNextLevel").text("Puntos hasta el siguiente nivel: " + m.championPointsUntilNextLevel);
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
        let champ = campeon(m.champion);
        if (!champ) {
          return;
        }

        html.find("#championImg").css('background-image', `url(\'http://ddragon.leagueoflegends.com/cdn/img/champion/splash/${champ.id}_0.jpg\')`);
        html.find("#season").text("Temporada: "+m.season);
        html.find("#champion").text(champ.name);
        html.find("#role").text("Rol: "+m.role);
        html.find("#timestamp").text("Partida jugada el: " + new Date(m.timestamp).toDateString());
        html.find("#lane").text("Línea: " + m.lane);
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
    })
    .then(res => {
      for (let i = 0; i < posiciones.length; i++) {
        let p = posiciones[i];
        let html = $(res);
        html.find("#leagueName").text("Nombre de liga: "+p.leagueName);
        html.find("#wins").text("Victorias: " + p.wins);
        html.find("#losses").text("Derrotas " + p.losses);
        html.find("#tier").text("Tier: "+p.tier);
        html.find("#rank").text("Rango: "+p.rank);
        html.find("#queueType").text("Tipo de cola: "+p.queueType);
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
          html.find("#leaguePoints").text("Puntos: "+ e.leaguePoints);
          html.find("#rank").text("Rango: "+e.rank);
          html.find("#wins").text("Victorias: "+e.wins);
          html.find("#losses").text("Derrotas: " + e.losses);
          $("#liga").append(html);
          $("#liga").append($("<br>"));
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

function campeon(key) {
  for (let campeon of Object.values(campeones.data)) {
    if (campeon.key == key) {
      return campeon;
    }
  }
  return null;
}

getNativo("/json/champion.json")
.then(res => {
  campeones = JSON.parse(res);
}).catch(err=>{
  console.error(err);
});
