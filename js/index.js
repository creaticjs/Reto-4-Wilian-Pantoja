
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
    /*var xhttp = new XMLHttpRequest();
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
    xhttp.send(null);*/
    resolve(recursos[url]);
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

var recursos = {
  "/rotaciones.html": `<div class="max-w rounded overflow-hidden shadow-lg">
  <div id="championImg" class="w-full" style="padding: 10px; text-align: center;"></div>
  <div class="px-6 py-4" style="text-align: center;">
    <div id="championId" class="font-bold text-xl mb-2"></div>
  </div>
</div>`,
  "/juegos-destacados.html": `<div class="max-w-md w-full lg:flex">
  <div id="mapId" class="h-48 lg:h-20 lg:w-auto flex-none bg-cover rounded-t lg:rounded-t-none lg:rounded-l text-center overflow-hidden" title="Woman holding a mug">
  </div>
  <div class="border-r border-b border-l border-grey-light lg:border-l-0 lg:border-t lg:border-grey-light bg-white rounded-b lg:rounded-b-none lg:rounded-r p-4 flex flex-col justify-between leading-normal">
    <div class="mb-8">
      <p id="gameMode" class="text-sm text-grey-dark flex items-center"></p>
      <div class="text-black font-bold text-xl mb-2">Participantes</div>
      <p id="gameStartTime" class="text-sm text-grey-dark flex items-center"></p>
      <p id="comando" class="text-sm text-grey-dark flex items-center"></p>
    </div>

    <div class="flex mb-4">
        <div id="equipo1" class="w-1/2 mr-5"></div>
        <div id="equipo2" class="w-1/2 ml-5"></div>
    </div>      
  </div>
</div>`,
  "/maestrias.html":`<div>
  <div class="max-w-sm rounded overflow-hidden shadow-lg">
    <div id="championImg" class="w-full"></div>
    <div class="px-6 py-4">
      <div id="championId" class="font-bold text-xl mb-2"></div>
      <p id="championPoints" class="text-grey-darker text-base">
      </p>
    </div>
    <div class="px-6 py-4">
      <span id="championLevel"
        class="inline-block bg-grey-lighter rounded-full px-3 py-1 text-sm font-semibold text-grey-darker mr-2"></span>
      <span id="lastPlayTime"
        class="inline-block bg-grey-lighter rounded-full px-3 py-1 text-sm font-semibold text-grey-darker mr-2"></span>
      <span id="chestGranted"
        class="inline-block bg-grey-lighter rounded-full px-3 py-1 text-sm font-semibold text-grey-darker"></span>
      <span id="championPointsUntilNextLevel"
        class="inline-block bg-grey-lighter rounded-full px-3 py-1 text-sm font-semibold text-grey-darker"></span>
    </div>
  </div>
</div>`,
"/matches.html": `<div>
<div class="max-w-md w-full lg:flex">
  <div id="championImg"
    class="h-48 lg:h-auto lg:w-48 flex-none bg-cover rounded-t lg:rounded-t-none lg:rounded-l text-center overflow-hidden"
     title="Woman holding a mug">
  </div>
  <div
    class="border-r border-b border-l border-grey-light lg:border-l-0 lg:border-t lg:border-grey-light bg-white rounded-b lg:rounded-b-none lg:rounded-r p-4 flex flex-col justify-between leading-normal">
    <div class="mb-8">
      <p class="text-sm text-grey-dark flex items-center">
        <svg class="fill-current text-grey w-3 h-3 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
          <path
            d="M4 8V6a6 6 0 1 1 12 0v2h1a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-8c0-1.1.9-2 2-2h1zm5 6.73V17h2v-2.27a2 2 0 1 0-2 0zM7 6v2h6V6a3 3 0 0 0-6 0z" />
        </svg>
        <div id="season"></div>
      </p>
      <div id="champion" class="text-black font-bold text-xl mb-2"></div>
      <p id="role" class="text-grey-darker text-base"></p>
      <p id="lane" class="text-grey-darker text-base"></p>
      <p id="timestamp" class="text-grey-darker text-base"></p>
    </div>
  </div>
</div>
</div>`,
"/posiciones.html": `<div>
<div class="max-w-sm rounded overflow-hidden shadow-lg">
  <div class="px-6 py-4">
    <div id="leagueName" class="font-bold text-xl mb-2"></div>
    <p id="wins" class="text-grey-darker text-base"></p>
    <p id="losses" class="text-grey-darker text-base"></p>
    <button id="btnVerLiga"
      class="bg-blue hover:bg-blue-light text-white font-bold py-2 px-4 border-b-4 border-blue-dark hover:border-blue rounded">Ver
      liga</button>
  </div>
  <div class="px-6 py-4">
    <span id="tier"
      class="inline-block bg-grey-lighter rounded-full px-3 py-1 text-sm font-semibold text-grey-darker mr-2">#photography</span>
    <span id="rank"
      class="inline-block bg-grey-lighter rounded-full px-3 py-1 text-sm font-semibold text-grey-darker mr-2">#travel</span>
    <span id="queueType"
      class="inline-block bg-grey-lighter rounded-full px-3 py-1 text-sm font-semibold text-grey-darker">#winter</span>
  </div>
</div>
</div>
`,
"/liga.html": `<div>
<div class="max-w-md w-full lg:flex">
  <!-- <div
    class="h-48 lg:h-auto lg:w-48 flex-none bg-cover rounded-t lg:rounded-t-none lg:rounded-l text-center overflow-hidden"
    style="background-image: url('https://tailwindcss.com/img/card-left.jpg')" title="Woman holding a mug">
  </div>-->
  <div
    class="border-r border-b border-l border-grey-light lg:border-l-0 lg:border-t lg:border-grey-light bg-white rounded-b lg:rounded-b-none lg:rounded-r p-4 flex flex-col justify-between leading-normal">
    <div class="mb-8">
      <div id="summonerName" class="text-black font-bold text-xl mb-2"></div>
      <p id="leaguePoints" class="text-grey-darker text-base"></p>
      <p id="rank" class="text-grey-darker text-base"></p>
      <p id="wins" class="text-grey-darker text-base"></p>
      <p id="losses" class="text-grey-darker text-base"></p>
    </div>
  </div>
</div>
</div>`,
  "/json/champion.json" : {
    "type": "champion",
    "format": "standAloneComplex",
    "version": "6.24.1",
    "data": {
      "Aatrox": {
        "version": "6.24.1",
        "id": "Aatrox",
        "key": "266",
        "name": "Aatrox",
        "title": "La Espada de los Oscuros",
        "blurb": "Aatrox es un guerrero legendario, uno de los únicos cinco que quedan de una raza antigua conocida como 'Los Oscuros'. Porta su enorme espada con gracia y serenidad, y la desliza entre sus enemigos con un estilo hipnótico y terrible. Tras derribar a ...",
        "info": {
          "attack": 8,
          "defense": 4,
          "magic": 3,
          "difficulty": 4
        },
        "image": {
          "full": "Aatrox.png",
          "sprite": "champion0.png",
          "group": "champion",
          "x": 0,
          "y": 0,
          "w": 48,
          "h": 48
        },
        "tags": ["Fighter", "Tank"],
        "partype": "BloodWell",
        "stats": {
          "hp": 537.8,
          "hpperlevel": 85.0,
          "mp": 105.6,
          "mpperlevel": 45.0,
          "movespeed": 345.0,
          "armor": 24.384,
          "armorperlevel": 3.8,
          "spellblock": 32.1,
          "spellblockperlevel": 1.25,
          "attackrange": 150.0,
          "hpregen": 6.59,
          "hpregenperlevel": 0.5,
          "mpregen": 0.0,
          "mpregenperlevel": 0.0,
          "crit": 0.0,
          "critperlevel": 0.0,
          "attackdamage": 60.376,
          "attackdamageperlevel": 3.2,
          "attackspeedoffset": -0.04,
          "attackspeedperlevel": 3.0
        }
      },
      "Ahri": {
        "version": "6.24.1",
        "id": "Ahri",
        "key": "103",
        "name": "Ahri",
        "title": "La Mujer Zorro de nueve Colas",
        "blurb": "A diferencia de otros zorros que habitan en los bosques al sur de Jonia, Ahri siempre sintió una extraña conexión con el mundo mágico que la rodeaba. Una conexión que, de algún modo, le parecía que estaba incompleta. En lo más profundo de su interior, ...",
        "info": {
          "attack": 3,
          "defense": 4,
          "magic": 8,
          "difficulty": 5
        },
        "image": {
          "full": "Ahri.png",
          "sprite": "champion0.png",
          "group": "champion",
          "x": 48,
          "y": 0,
          "w": 48,
          "h": 48
        },
        "tags": ["Mage", "Assassin"],
        "partype": "MP",
        "stats": {
          "hp": 514.4,
          "hpperlevel": 80.0,
          "mp": 334.0,
          "mpperlevel": 50.0,
          "movespeed": 330.0,
          "armor": 20.88,
          "armorperlevel": 3.5,
          "spellblock": 30.0,
          "spellblockperlevel": 0.0,
          "attackrange": 550.0,
          "hpregen": 6.505,
          "hpregenperlevel": 0.6,
          "mpregen": 6.0,
          "mpregenperlevel": 0.8,
          "crit": 0.0,
          "critperlevel": 0.0,
          "attackdamage": 53.04,
          "attackdamageperlevel": 3.0,
          "attackspeedoffset": -0.065,
          "attackspeedperlevel": 2.0
        }
      },
      "Akali": {
        "version": "6.24.1",
        "id": "Akali",
        "key": "84",
        "name": "Akali",
        "title": "El Puño de la Sombra",
        "blurb": "Existe una antigua orden que tiene su origen en las Islas Jonias y que se dedica a preservar el equilibrio en el mundo. Orden, caos, luz, oscuridad… todas las cosas deben existir en perfecta armonía, ya que así es como funciona el universo. Esta orden ...",
        "info": {
          "attack": 5,
          "defense": 3,
          "magic": 8,
          "difficulty": 7
        },
        "image": {
          "full": "Akali.png",
          "sprite": "champion0.png",
          "group": "champion",
          "x": 96,
          "y": 0,
          "w": 48,
          "h": 48
        },
        "tags": ["Assassin"],
        "partype": "Energy",
        "stats": {
          "hp": 587.8,
          "hpperlevel": 85.0,
          "mp": 200.0,
          "mpperlevel": 0.0,
          "movespeed": 350.0,
          "armor": 26.38,
          "armorperlevel": 3.5,
          "spellblock": 32.1,
          "spellblockperlevel": 1.25,
          "attackrange": 125.0,
          "hpregen": 8.34,
          "hpregenperlevel": 0.65,
          "mpregen": 50.0,
          "mpregenperlevel": 0.0,
          "crit": 0.0,
          "critperlevel": 0.0,
          "attackdamage": 58.376,
          "attackdamageperlevel": 3.2,
          "attackspeedoffset": -0.1,
          "attackspeedperlevel": 3.1
        }
      },
      "Alistar": {
        "version": "6.24.1",
        "id": "Alistar",
        "key": "12",
        "name": "Alistar",
        "title": "El Minotauro",
        "blurb": "Alistar es el guerrero más poderoso que haya emergido nunca de entre las tribus de minotauros de la Gran Barrera. Defendió su tribu de los numerosos peligros de Valoran... hasta la llegada del ejército noxiano. Fue tentado a abandonar su pueblo por ...",
        "info": {
          "attack": 6,
          "defense": 9,
          "magic": 5,
          "difficulty": 7
        },
        "image": {
          "full": "Alistar.png",
          "sprite": "champion0.png",
          "group": "champion",
          "x": 144,
          "y": 0,
          "w": 48,
          "h": 48
        },
        "tags": ["Tank", "Support"],
        "partype": "MP",
        "stats": {
          "hp": 613.36,
          "hpperlevel": 106.0,
          "mp": 278.84,
          "mpperlevel": 38.0,
          "movespeed": 330.0,
          "armor": 24.38,
          "armorperlevel": 3.5,
          "spellblock": 32.1,
          "spellblockperlevel": 1.25,
          "attackrange": 125.0,
          "hpregen": 8.675,
          "hpregenperlevel": 0.85,
          "mpregen": 8.5,
          "mpregenperlevel": 0.8,
          "crit": 0.0,
          "critperlevel": 0.0,
          "attackdamage": 61.1116,
          "attackdamageperlevel": 3.62,
          "attackspeedoffset": 0.0,
          "attackspeedperlevel": 2.125
        }
      },
      "Amumu": {
        "version": "6.24.1",
        "id": "Amumu",
        "key": "32",
        "name": "Amumu",
        "title": "La Momia Triste",
        "blurb": "''La soledad puede ser más solitaria que la muerte''.<br><br>Amumu es un alma solitaria y melancólica de la vieja Shurima que vaga por el mundo en busca de un amigo. Maldito por un hechizo ancestral, está condenado a permanecer solo para siempre, pues ...",
        "info": {
          "attack": 2,
          "defense": 6,
          "magic": 8,
          "difficulty": 3
        },
        "image": {
          "full": "Amumu.png",
          "sprite": "champion0.png",
          "group": "champion",
          "x": 192,
          "y": 0,
          "w": 48,
          "h": 48
        },
        "tags": ["Tank", "Mage"],
        "partype": "MP",
        "stats": {
          "hp": 613.12,
          "hpperlevel": 84.0,
          "mp": 287.2,
          "mpperlevel": 40.0,
          "movespeed": 335.0,
          "armor": 23.544,
          "armorperlevel": 3.8,
          "spellblock": 32.1,
          "spellblockperlevel": 1.25,
          "attackrange": 125.0,
          "hpregen": 8.875,
          "hpregenperlevel": 0.85,
          "mpregen": 7.38,
          "mpregenperlevel": 0.525,
          "crit": 0.0,
          "critperlevel": 0.0,
          "attackdamage": 53.384,
          "attackdamageperlevel": 3.8,
          "attackspeedoffset": -0.02,
          "attackspeedperlevel": 2.18
        }
      },
      "Anivia": {
        "version": "6.24.1",
        "id": "Anivia",
        "key": "34",
        "name": "Anivia",
        "title": "La Criofénix",
        "blurb": "Anivia es una criatura del más frío invierno, una encarnación mística del hielo mágico y una antigua protectora de Freljord. Controla todo el poder y la furia de la tierra, llama a la nieve y a los fuertes vientos para defender su hogar de aquellos ...",
        "info": {
          "attack": 1,
          "defense": 4,
          "magic": 10,
          "difficulty": 10
        },
        "image": {
          "full": "Anivia.png",
          "sprite": "champion0.png",
          "group": "champion",
          "x": 240,
          "y": 0,
          "w": 48,
          "h": 48
        },
        "tags": ["Mage", "Support"],
        "partype": "MP",
        "stats": {
          "hp": 467.6,
          "hpperlevel": 70.0,
          "mp": 396.04,
          "mpperlevel": 50.0,
          "movespeed": 325.0,
          "armor": 21.22,
          "armorperlevel": 4.0,
          "spellblock": 30.0,
          "spellblockperlevel": 0.0,
          "attackrange": 600.0,
          "hpregen": 5.57,
          "hpregenperlevel": 0.55,
          "mpregen": 6.0,
          "mpregenperlevel": 0.8,
          "crit": 0.0,
          "critperlevel": 0.0,
          "attackdamage": 51.376,
          "attackdamageperlevel": 3.2,
          "attackspeedoffset": 0.0,
          "attackspeedperlevel": 1.68
        }
      },
      "Annie": {
        "version": "6.24.1",
        "id": "Annie",
        "key": "1",
        "name": "Annie",
        "title": "La Hija de la Oscuridad",
        "blurb": "Siempre ha habido en Noxus quien no aceptaba las maldades perpetradas por el Alto Mando. Este acababa de sofocar un intento de golpe de estado por parte del autoproclamado príncipe heredero Raschallion y se habían empezado a aplicar medidas severas ...",
        "info": {
          "attack": 2,
          "defense": 3,
          "magic": 10,
          "difficulty": 6
        },
        "image": {
          "full": "Annie.png",
          "sprite": "champion0.png",
          "group": "champion",
          "x": 288,
          "y": 0,
          "w": 48,
          "h": 48
        },
        "tags": ["Mage"],
        "partype": "MP",
        "stats": {
          "hp": 511.68,
          "hpperlevel": 76.0,
          "mp": 334.0,
          "mpperlevel": 50.0,
          "movespeed": 335.0,
          "armor": 19.22,
          "armorperlevel": 4.0,
          "spellblock": 30.0,
          "spellblockperlevel": 0.0,
          "attackrange": 575.0,
          "hpregen": 5.42,
          "hpregenperlevel": 0.55,
          "mpregen": 6.0,
          "mpregenperlevel": 0.8,
          "crit": 0.0,
          "critperlevel": 0.0,
          "attackdamage": 50.41,
          "attackdamageperlevel": 2.625,
          "attackspeedoffset": 0.08,
          "attackspeedperlevel": 1.36
        }
      },
      "Ashe": {
        "version": "6.24.1",
        "id": "Ashe",
        "key": "22",
        "name": "Ashe",
        "title": "La Arquera de Hielo",
        "blurb": "Con cada flecha que parte de su arco encantado con hielo milenario, Ashe demuestra que es una arquera maestra. Elige a su objetivo con extremo cuidado, espera el momento justo y entonces, ataca con poder y precisión. Con esta misma perspectiva y ...",
        "info": {
          "attack": 7,
          "defense": 3,
          "magic": 2,
          "difficulty": 4
        },
        "image": {
          "full": "Ashe.png",
          "sprite": "champion0.png",
          "group": "champion",
          "x": 336,
          "y": 0,
          "w": 48,
          "h": 48
        },
        "tags": ["Marksman", "Support"],
        "partype": "MP",
        "stats": {
          "hp": 527.72,
          "hpperlevel": 79.0,
          "mp": 280.0,
          "mpperlevel": 32.0,
          "movespeed": 325.0,
          "armor": 21.212,
          "armorperlevel": 3.4,
          "spellblock": 30.0,
          "spellblockperlevel": 0.0,
          "attackrange": 600.0,
          "hpregen": 5.42,
          "hpregenperlevel": 0.55,
          "mpregen": 6.97,
          "mpregenperlevel": 0.4,
          "crit": 0.0,
          "critperlevel": 0.0,
          "attackdamage": 56.508,
          "attackdamageperlevel": 2.26,
          "attackspeedoffset": -0.05,
          "attackspeedperlevel": 3.33
        }
      },
      "AurelionSol": {
        "version": "6.24.1",
        "id": "AurelionSol",
        "key": "136",
        "name": "Aurelion Sol",
        "title": "El Forjador de Estrellas",
        "blurb": "Aurelion Sol solía agraciar al vasto vacío del cosmos con las maravillas celestiales que él mismo ideaba. Ahora se ve forzado a hacer uso de su increíble poder para satisfacer los deseos de un imperio espacial que lo ha engañado para convertirlo en su ...",
        "info": {
          "attack": 2,
          "defense": 3,
          "magic": 8,
          "difficulty": 7
        },
        "image": {
          "full": "AurelionSol.png",
          "sprite": "champion0.png",
          "group": "champion",
          "x": 384,
          "y": 0,
          "w": 48,
          "h": 48
        },
        "tags": ["Mage", "Fighter"],
        "partype": "MP",
        "stats": {
          "hp": 550.0,
          "hpperlevel": 80.0,
          "mp": 350.0,
          "mpperlevel": 50.0,
          "movespeed": 325.0,
          "armor": 19.0,
          "armorperlevel": 3.6,
          "spellblock": 30.0,
          "spellblockperlevel": 0.0,
          "attackrange": 550.0,
          "hpregen": 6.5,
          "hpregenperlevel": 0.6,
          "mpregen": 6.0,
          "mpregenperlevel": 0.8,
          "crit": 0.0,
          "critperlevel": 0.0,
          "attackdamage": 57.0,
          "attackdamageperlevel": 3.2,
          "attackspeedoffset": 0.0,
          "attackspeedperlevel": 1.36
        }
      },
      "Azir": {
        "version": "6.24.1",
        "id": "Azir",
        "key": "268",
        "name": "Azir",
        "title": "El Emperador de las Arenas",
        "blurb": "''Shurima fue antaño la joya de Runaterra. Gracias a mí, volverá a serlo''.<br><br>Azir, emperador de Shurima en un pasado remoto, fue un hombre orgulloso que estuvo a punto de alcanzar la inmortalidad. Su arrogancia provocó que fuera traicionado y ...",
        "info": {
          "attack": 6,
          "defense": 3,
          "magic": 8,
          "difficulty": 9
        },
        "image": {
          "full": "Azir.png",
          "sprite": "champion0.png",
          "group": "champion",
          "x": 432,
          "y": 0,
          "w": 48,
          "h": 48
        },
        "tags": ["Mage", "Marksman"],
        "partype": "MP",
        "stats": {
          "hp": 524.4,
          "hpperlevel": 80.0,
          "mp": 350.56,
          "mpperlevel": 42.0,
          "movespeed": 325.0,
          "armor": 19.04,
          "armorperlevel": 3.0,
          "spellblock": 30.0,
          "spellblockperlevel": 0.0,
          "attackrange": 525.0,
          "hpregen": 6.92,
          "hpregenperlevel": 0.55,
          "mpregen": 6.0,
          "mpregenperlevel": 0.8,
          "crit": 0.0,
          "critperlevel": 0.0,
          "attackdamage": 52.0,
          "attackdamageperlevel": 2.8,
          "attackspeedoffset": -0.02,
          "attackspeedperlevel": 1.5
        }
      },
      "Bard": {
        "version": "6.24.1",
        "id": "Bard",
        "key": "432",
        "name": "Bardo",
        "title": "El Guardián Errante",
        "blurb": "Bardo viaja por reinos situados más allá de la imaginación de los mortales. Algunos de los mayores eruditos de Valoran han dedicado la vida a tratar de comprender los misterios que encarna. Este enigmático espíritu ha recibido muchos nombres a lo ...",
        "info": {
          "attack": 4,
          "defense": 4,
          "magic": 5,
          "difficulty": 9
        },
        "image": {
          "full": "Bard.png",
          "sprite": "champion0.png",
          "group": "champion",
          "x": 0,
          "y": 48,
          "w": 48,
          "h": 48
        },
        "tags": ["Support", "Mage"],
        "partype": "MP",
        "stats": {
          "hp": 535.0,
          "hpperlevel": 89.0,
          "mp": 350.0,
          "mpperlevel": 50.0,
          "movespeed": 330.0,
          "armor": 25.0,
          "armorperlevel": 4.0,
          "spellblock": 30.0,
          "spellblockperlevel": 0.0,
          "attackrange": 500.0,
          "hpregen": 5.4,
          "hpregenperlevel": 0.55,
          "mpregen": 6.0,
          "mpregenperlevel": 0.45,
          "crit": 0.0,
          "critperlevel": 0.0,
          "attackdamage": 52.0,
          "attackdamageperlevel": 3.0,
          "attackspeedoffset": 0.0,
          "attackspeedperlevel": 2.0
        }
      },
      "Blitzcrank": {
        "version": "6.24.1",
        "id": "Blitzcrank",
        "key": "53",
        "name": "Blitzcrank",
        "title": "El Gran Gólem de Vapor",
        "blurb": "Zaun es un lugar en el que tanto la magia como la ciencia están fuera de control y el carácter desenfrenado de la experimentación ha pasado factura. Así y todo, las indulgentes restricciones de sus fueros dan libertad de acción a los investigadores y ...",
        "info": {
          "attack": 4,
          "defense": 8,
          "magic": 5,
          "difficulty": 4
        },
        "image": {
          "full": "Blitzcrank.png",
          "sprite": "champion0.png",
          "group": "champion",
          "x": 48,
          "y": 48,
          "w": 48,
          "h": 48
        },
        "tags": ["Tank", "Fighter"],
        "partype": "MP",
        "stats": {
          "hp": 582.6,
          "hpperlevel": 95.0,
          "mp": 267.2,
          "mpperlevel": 40.0,
          "movespeed": 325.0,
          "armor": 24.38,
          "armorperlevel": 4.0,
          "spellblock": 32.1,
          "spellblockperlevel": 1.25,
          "attackrange": 125.0,
          "hpregen": 8.51,
          "hpregenperlevel": 0.75,
          "mpregen": 8.5,
          "mpregenperlevel": 0.8,
          "crit": 0.0,
          "critperlevel": 0.0,
          "attackdamage": 61.54,
          "attackdamageperlevel": 3.5,
          "attackspeedoffset": 0.0,
          "attackspeedperlevel": 1.13
        }
      },
      "Brand": {
        "version": "6.24.1",
        "id": "Brand",
        "key": "63",
        "name": "Brand",
        "title": "La Venganza Ardiente",
        "blurb": "En un lugar muy lejano llamado Lokfar, vivía un maleante marino llamado Kegan Rodhe. Siguiendo la tradición de su gente, Kegan navegaba por lo largo y ancho de los mares con sus compañeros, robando tesoros a aquellos lo bastante desafortunados como ...",
        "info": {
          "attack": 2,
          "defense": 2,
          "magic": 9,
          "difficulty": 4
        },
        "image": {
          "full": "Brand.png",
          "sprite": "champion0.png",
          "group": "champion",
          "x": 96,
          "y": 48,
          "w": 48,
          "h": 48
        },
        "tags": ["Mage"],
        "partype": "MP",
        "stats": {
          "hp": 507.68,
          "hpperlevel": 76.0,
          "mp": 375.6,
          "mpperlevel": 42.0,
          "movespeed": 340.0,
          "armor": 21.88,
          "armorperlevel": 3.5,
          "spellblock": 30.0,
          "spellblockperlevel": 0.0,
          "attackrange": 550.0,
          "hpregen": 5.42,
          "hpregenperlevel": 0.55,
          "mpregen": 8.005,
          "mpregenperlevel": 0.6,
          "crit": 0.0,
          "critperlevel": 0.0,
          "attackdamage": 57.04,
          "attackdamageperlevel": 3.0,
          "attackspeedoffset": 0.0,
          "attackspeedperlevel": 1.36
        }
      },
      "Braum": {
        "version": "6.24.1",
        "id": "Braum",
        "key": "201",
        "name": "Braum",
        "title": "El Corazón de Freljord",
        "blurb": "''¿Qué tal un cuento antes de dormir?''<br><br>''Abuela, ya soy mayor para eso.''<br><br>''Nunca se es demasiado mayor para que te cuenten una historia.''<br><br>La muchacha se mete en la cama de mala gana y espera, sabiendo que esta batalla no la ...",
        "info": {
          "attack": 3,
          "defense": 9,
          "magic": 4,
          "difficulty": 3
        },
        "image": {
          "full": "Braum.png",
          "sprite": "champion0.png",
          "group": "champion",
          "x": 144,
          "y": 48,
          "w": 48,
          "h": 48
        },
        "tags": ["Support", "Tank"],
        "partype": "MP",
        "stats": {
          "hp": 576.16,
          "hpperlevel": 87.0,
          "mp": 310.6,
          "mpperlevel": 45.0,
          "movespeed": 335.0,
          "armor": 26.72,
          "armorperlevel": 4.5,
          "spellblock": 32.1,
          "spellblockperlevel": 1.25,
          "attackrange": 125.0,
          "hpregen": 8.18,
          "hpregenperlevel": 1.0,
          "mpregen": 6.0,
          "mpregenperlevel": 0.8,
          "crit": 0.0,
          "critperlevel": 0.0,
          "attackdamage": 55.376,
          "attackdamageperlevel": 3.2,
          "attackspeedoffset": -0.03,
          "attackspeedperlevel": 3.5
        }
      },
      "Caitlyn": {
        "version": "6.24.1",
        "id": "Caitlyn",
        "key": "51",
        "name": "Caitlyn",
        "title": "La Sheriff de Piltover",
        "blurb": "''Vamos, corre. Te daré cinco minutos de ventaja''.<br><br>Uno de los motivos por los que Piltover es conocida como la Ciudad del Progreso es porque posee una tasa de criminalidad extraordinariamente baja. Esto no siempre ha sido así. Bribones y ...",
        "info": {
          "attack": 8,
          "defense": 2,
          "magic": 2,
          "difficulty": 6
        },
        "image": {
          "full": "Caitlyn.png",
          "sprite": "champion0.png",
          "group": "champion",
          "x": 192,
          "y": 48,
          "w": 48,
          "h": 48
        },
        "tags": ["Marksman"],
        "partype": "MP",
        "stats": {
          "hp": 524.4,
          "hpperlevel": 80.0,
          "mp": 313.7,
          "mpperlevel": 35.0,
          "movespeed": 325.0,
          "armor": 22.88,
          "armorperlevel": 3.5,
          "spellblock": 30.0,
          "spellblockperlevel": 0.0,
          "attackrange": 650.0,
          "hpregen": 5.67,
          "hpregenperlevel": 0.55,
          "mpregen": 7.4,
          "mpregenperlevel": 0.55,
          "crit": 0.0,
          "critperlevel": 0.0,
          "attackdamage": 53.66,
          "attackdamageperlevel": 2.18,
          "attackspeedoffset": 0.1,
          "attackspeedperlevel": 4.0
        }
      },
      "Camille": {
        "version": "6.24.1",
        "id": "Camille",
        "key": "164",
        "name": "Camille",
        "title": "la Sombra de Acero",
        "blurb": "Convertida en un arma viviente diseñada para operar fuera de la ley, Camille Ferros es una elegante agente de élite que se asegura de que nada amenace el comercio entre la máquina de Piltover y su entresijo zaunita. Criada en un mundo de riqueza y ...",
        "info": {
          "attack": 8,
          "defense": 6,
          "magic": 3,
          "difficulty": 4
        },
        "image": {
          "full": "Camille.png",
          "sprite": "champion4.png",
          "group": "champion",
          "x": 144,
          "y": 48,
          "w": 48,
          "h": 48
        },
        "tags": ["Fighter", "Tank"],
        "partype": "MP",
        "stats": {
          "hp": 575.6,
          "hpperlevel": 95.0,
          "mp": 338.8,
          "mpperlevel": 32.0,
          "movespeed": 340.0,
          "armor": 26.0,
          "armorperlevel": 3.8,
          "spellblock": 32.1,
          "spellblockperlevel": 1.25,
          "attackrange": 125.0,
          "hpregen": 8.5,
          "hpregenperlevel": 0.8,
          "mpregen": 8.15,
          "mpregenperlevel": 0.75,
          "crit": 0.0,
          "critperlevel": 0.0,
          "attackdamage": 62.0,
          "attackdamageperlevel": 3.5,
          "attackspeedoffset": 0.0,
          "attackspeedperlevel": 2.5
        }
      },
      "Cassiopeia": {
        "version": "6.24.1",
        "id": "Cassiopeia",
        "key": "69",
        "name": "Cassiopeia",
        "title": "El Abrazo de la Serpiente",
        "blurb": "Cassiopeia es una criatura aterradora, medio mujer, medio serpiente, capaz de matar con la más fugaz de las miradas. Última hija de una de las familias más influyentes de Noxus, era una mujer astuta y bellísima, capaz de manipular a su antojo el ...",
        "info": {
          "attack": 2,
          "defense": 3,
          "magic": 9,
          "difficulty": 10
        },
        "image": {
          "full": "Cassiopeia.png",
          "sprite": "champion0.png",
          "group": "champion",
          "x": 240,
          "y": 48,
          "w": 48,
          "h": 48
        },
        "tags": ["Mage"],
        "partype": "MP",
        "stats": {
          "hp": 525.0,
          "hpperlevel": 75.0,
          "mp": 375.0,
          "mpperlevel": 60.0,
          "movespeed": 328.0,
          "armor": 25.0,
          "armorperlevel": 3.5,
          "spellblock": 30.0,
          "spellblockperlevel": 0.0,
          "attackrange": 550.0,
          "hpregen": 5.5,
          "hpregenperlevel": 0.5,
          "mpregen": 6.0,
          "mpregenperlevel": 0.8,
          "crit": 0.0,
          "critperlevel": 0.0,
          "attackdamage": 53.0,
          "attackdamageperlevel": 3.0,
          "attackspeedoffset": -0.034,
          "attackspeedperlevel": 1.5
        }
      },
      "Chogath": {
        "version": "6.24.1",
        "id": "Chogath",
        "key": "31",
        "name": "Cho'Gath",
        "title": "El Terror del Vacío",
        "blurb": "Hay un lugar entre dimensiones, entre mundos. Para algunos es el exterior, para otros es lo desconocido. Para los verdaderamente entendidos, sin embargo, se trata del Vacío. Pese a su nombre, no se trata de un lugar vacuo, sino del hogar de cosas ...",
        "info": {
          "attack": 3,
          "defense": 7,
          "magic": 7,
          "difficulty": 5
        },
        "image": {
          "full": "Chogath.png",
          "sprite": "champion0.png",
          "group": "champion",
          "x": 288,
          "y": 48,
          "w": 48,
          "h": 48
        },
        "tags": ["Tank", "Mage"],
        "partype": "MP",
        "stats": {
          "hp": 574.4,
          "hpperlevel": 80.0,
          "mp": 272.2,
          "mpperlevel": 40.0,
          "movespeed": 345.0,
          "armor": 28.88,
          "armorperlevel": 3.5,
          "spellblock": 32.1,
          "spellblockperlevel": 1.25,
          "attackrange": 125.0,
          "hpregen": 8.925,
          "hpregenperlevel": 0.85,
          "mpregen": 7.205,
          "mpregenperlevel": 0.45,
          "crit": 0.0,
          "critperlevel": 0.0,
          "attackdamage": 61.156,
          "attackdamageperlevel": 4.2,
          "attackspeedoffset": 0.0,
          "attackspeedperlevel": 1.44
        }
      },
      "Corki": {
        "version": "6.24.1",
        "id": "Corki",
        "key": "42",
        "name": "Corki",
        "title": "El Bombardero Osado",
        "blurb": "Cuando Heimerdinger y sus colegas yordles emigraron a Piltover, optaron por la ciencia como estilo de vida; así, no tardaron en aportar distintos avances revolucionarios a la comunidad tecmatúrgica. Lo que a los Yordles les falta de estatura, les ...",
        "info": {
          "attack": 8,
          "defense": 3,
          "magic": 6,
          "difficulty": 6
        },
        "image": {
          "full": "Corki.png",
          "sprite": "champion0.png",
          "group": "champion",
          "x": 336,
          "y": 48,
          "w": 48,
          "h": 48
        },
        "tags": ["Marksman"],
        "partype": "MP",
        "stats": {
          "hp": 512.76,
          "hpperlevel": 82.0,
          "mp": 350.16,
          "mpperlevel": 34.0,
          "movespeed": 325.0,
          "armor": 23.38,
          "armorperlevel": 3.5,
          "spellblock": 30.0,
          "spellblockperlevel": 0.0,
          "attackrange": 550.0,
          "hpregen": 5.42,
          "hpregenperlevel": 0.55,
          "mpregen": 7.42,
          "mpregenperlevel": 0.55,
          "crit": 0.0,
          "critperlevel": 0.0,
          "attackdamage": 56.0,
          "attackdamageperlevel": 3.5,
          "attackspeedoffset": 0.0,
          "attackspeedperlevel": 2.3
        }
      },
      "Darius": {
        "version": "6.24.1",
        "id": "Darius",
        "key": "122",
        "name": "Darius",
        "title": "La Mano de Noxus",
        "blurb": "No hay mayor símbolo del poder de Noxus que Darius, el guerrero más temido y más curtido en batallas de toda la nación. Tras quedarse huérfano cuando era pequeño, Darius tuvo que luchar para sobrevivir. Lo hacía no sólo por él, sino también por su ...",
        "info": {
          "attack": 9,
          "defense": 5,
          "magic": 1,
          "difficulty": 2
        },
        "image": {
          "full": "Darius.png",
          "sprite": "champion0.png",
          "group": "champion",
          "x": 384,
          "y": 48,
          "w": 48,
          "h": 48
        },
        "tags": ["Fighter", "Tank"],
        "partype": "MP",
        "stats": {
          "hp": 582.24,
          "hpperlevel": 100.0,
          "mp": 263.0,
          "mpperlevel": 37.5,
          "movespeed": 340.0,
          "armor": 30.0,
          "armorperlevel": 4.0,
          "spellblock": 32.1,
          "spellblockperlevel": 1.25,
          "attackrange": 175.0,
          "hpregen": 9.845,
          "hpregenperlevel": 0.95,
          "mpregen": 6.585,
          "mpregenperlevel": 0.35,
          "crit": 0.0,
          "critperlevel": 0.0,
          "attackdamage": 56.0,
          "attackdamageperlevel": 5.0,
          "attackspeedoffset": 0.0,
          "attackspeedperlevel": 1.0
        }
      },
      "Diana": {
        "version": "6.24.1",
        "id": "Diana",
        "key": "131",
        "name": "Diana",
        "title": "El Desdén de la Luna",
        "blurb": "''Soy la luz que emana del alma de la luna.''<br><br>Portadora de una espada en forma de media luna, Diana es una guerrera de los Lunari, una fe repudiada en todas las tierras a los pies del monte Targon. Ataviada con una armadura reluciente del color ...",
        "info": {
          "attack": 7,
          "defense": 6,
          "magic": 8,
          "difficulty": 4
        },
        "image": {
          "full": "Diana.png",
          "sprite": "champion0.png",
          "group": "champion",
          "x": 432,
          "y": 48,
          "w": 48,
          "h": 48
        },
        "tags": ["Fighter", "Mage"],
        "partype": "MP",
        "stats": {
          "hp": 589.2,
          "hpperlevel": 90.0,
          "mp": 297.2,
          "mpperlevel": 40.0,
          "movespeed": 345.0,
          "armor": 26.048,
          "armorperlevel": 3.6,
          "spellblock": 32.1,
          "spellblockperlevel": 1.25,
          "attackrange": 150.0,
          "hpregen": 7.425,
          "hpregenperlevel": 0.85,
          "mpregen": 6.0,
          "mpregenperlevel": 0.8,
          "crit": 0.0,
          "critperlevel": 0.0,
          "attackdamage": 53.04,
          "attackdamageperlevel": 3.0,
          "attackspeedoffset": 0.0,
          "attackspeedperlevel": 2.25
        }
      },
      "Draven": {
        "version": "6.24.1",
        "id": "Draven",
        "key": "119",
        "name": "Draven",
        "title": "El Ejecutor Glorioso",
        "blurb": "A diferencia de su hermano Darius, la victoria en combate nunca era suficiente para Draven. Ansiaba el reconocimiento, la fama y la gloria. Primero buscó la grandeza en el ejército noxiano, pero allí no apreciaron en absoluto su pasión por el drama. ...",
        "info": {
          "attack": 9,
          "defense": 3,
          "magic": 1,
          "difficulty": 8
        },
        "image": {
          "full": "Draven.png",
          "sprite": "champion0.png",
          "group": "champion",
          "x": 0,
          "y": 96,
          "w": 48,
          "h": 48
        },
        "tags": ["Marksman"],
        "partype": "MP",
        "stats": {
          "hp": 557.76,
          "hpperlevel": 82.0,
          "mp": 360.56,
          "mpperlevel": 39.0,
          "movespeed": 330.0,
          "armor": 25.544,
          "armorperlevel": 3.3,
          "spellblock": 30.0,
          "spellblockperlevel": 0.0,
          "attackrange": 550.0,
          "hpregen": 6.175,
          "hpregenperlevel": 0.7,
          "mpregen": 8.04,
          "mpregenperlevel": 0.65,
          "crit": 0.0,
          "critperlevel": 0.0,
          "attackdamage": 55.8,
          "attackdamageperlevel": 2.91,
          "attackspeedoffset": -0.08,
          "attackspeedperlevel": 2.7
        }
      },
      "DrMundo": {
        "version": "6.24.1",
        "id": "DrMundo",
        "key": "36",
        "name": "Dr. Mundo",
        "title": "El Loco de Zaun",
        "blurb": "''Cuidado con el Loco de Zaun. A sus ojos... ya estás muerto''.<br><br>Cuentan que el hombre ahora conocido como Dr. Mundo nació sin ningún tipo de conciencia. Tenía, a cambio, un deseo insaciable de infligir dolor a través de la experimentación. ...",
        "info": {
          "attack": 5,
          "defense": 7,
          "magic": 6,
          "difficulty": 5
        },
        "image": {
          "full": "DrMundo.png",
          "sprite": "champion0.png",
          "group": "champion",
          "x": 48,
          "y": 96,
          "w": 48,
          "h": 48
        },
        "tags": ["Fighter", "Tank"],
        "partype": "None",
        "stats": {
          "hp": 582.52,
          "hpperlevel": 89.0,
          "mp": 0.0,
          "mpperlevel": 0.0,
          "movespeed": 345.0,
          "armor": 26.88,
          "armorperlevel": 3.5,
          "spellblock": 32.1,
          "spellblockperlevel": 1.25,
          "attackrange": 125.0,
          "hpregen": 7.76,
          "hpregenperlevel": 0.75,
          "mpregen": 0.0,
          "mpregenperlevel": 0.0,
          "crit": 0.0,
          "critperlevel": 0.0,
          "attackdamage": 61.27,
          "attackdamageperlevel": 3.0,
          "attackspeedoffset": 0.0,
          "attackspeedperlevel": 2.8
        }
      },
      "Ekko": {
        "version": "6.24.1",
        "id": "Ekko",
        "key": "245",
        "name": "Ekko",
        "title": "El Chico que Quebró el Tiempo",
        "blurb": "Ekko, un prodigio surgido de las duras calles de Zaun, es capaz de manipular el tiempo en su propio beneficio. Usando una máquina de su invención llamada Dispositivo Z, explora las distintas posibilidades de la realidad. Cuando no está experimentando ...",
        "info": {
          "attack": 5,
          "defense": 3,
          "magic": 7,
          "difficulty": 8
        },
        "image": {
          "full": "Ekko.png",
          "sprite": "champion0.png",
          "group": "champion",
          "x": 96,
          "y": 96,
          "w": 48,
          "h": 48
        },
        "tags": ["Assassin", "Fighter"],
        "partype": "MP",
        "stats": {
          "hp": 580.0,
          "hpperlevel": 80.0,
          "mp": 280.0,
          "mpperlevel": 50.0,
          "movespeed": 340.0,
          "armor": 27.0,
          "armorperlevel": 3.0,
          "spellblock": 32.0,
          "spellblockperlevel": 1.25,
          "attackrange": 125.0,
          "hpregen": 9.0,
          "hpregenperlevel": 0.9,
          "mpregen": 7.0,
          "mpregenperlevel": 0.8,
          "crit": 0.0,
          "critperlevel": 0.0,
          "attackdamage": 55.0,
          "attackdamageperlevel": 3.0,
          "attackspeedoffset": 0.0,
          "attackspeedperlevel": 3.3
        }
      },
      "Elise": {
        "version": "6.24.1",
        "id": "Elise",
        "key": "60",
        "name": "Elise",
        "title": "La Reina de las Arañas",
        "blurb": "''La belleza es otra forma de poder, capaz de golpear más fuerte que cualquier espada''.<br><br>Elise es una letal depredadora que mora en un palacio sin luz ni ventanas, en lo más hondo del Bastión Inmortal de Noxus. En su día fue una mujer mortal, ...",
        "info": {
          "attack": 6,
          "defense": 5,
          "magic": 7,
          "difficulty": 9
        },
        "image": {
          "full": "Elise.png",
          "sprite": "champion0.png",
          "group": "champion",
          "x": 144,
          "y": 96,
          "w": 48,
          "h": 48
        },
        "tags": ["Mage", "Fighter"],
        "partype": "MP",
        "stats": {
          "hp": 529.4,
          "hpperlevel": 80.0,
          "mp": 324.0,
          "mpperlevel": 50.0,
          "movespeed": 325.0,
          "armor": 22.128,
          "armorperlevel": 3.35,
          "spellblock": 30.0,
          "spellblockperlevel": 0.0,
          "attackrange": 550.0,
          "hpregen": 5.705,
          "hpregenperlevel": 0.6,
          "mpregen": 6.0,
          "mpregenperlevel": 0.8,
          "crit": 0.0,
          "critperlevel": 0.0,
          "attackdamage": 50.54,
          "attackdamageperlevel": 3.0,
          "attackspeedoffset": 0.0,
          "attackspeedperlevel": 1.75
        }
      },
      "Evelynn": {
        "version": "6.24.1",
        "id": "Evelynn",
        "key": "28",
        "name": "Evelynn",
        "title": "La Hacedora de Viudas",
        "blurb": "Tan veloz como letal, Evelynn es una de las asesinas más eficientes —y caras— de toda Runaterra. Capaz de fundirse con las sombras a voluntad, acecha paciente a su presa, esperando el momento preciso para atacar. Es evidente que no es del todo humana ...",
        "info": {
          "attack": 4,
          "defense": 2,
          "magic": 7,
          "difficulty": 10
        },
        "image": {
          "full": "Evelynn.png",
          "sprite": "champion0.png",
          "group": "champion",
          "x": 192,
          "y": 96,
          "w": 48,
          "h": 48
        },
        "tags": ["Assassin", "Mage"],
        "partype": "MP",
        "stats": {
          "hp": 531.2,
          "hpperlevel": 90.0,
          "mp": 315.6,
          "mpperlevel": 42.0,
          "movespeed": 340.0,
          "armor": 26.5,
          "armorperlevel": 3.8,
          "spellblock": 32.1,
          "spellblockperlevel": 1.25,
          "attackrange": 125.0,
          "hpregen": 9.82,
          "hpregenperlevel": 0.55,
          "mpregen": 8.105,
          "mpregenperlevel": 0.6,
          "crit": 0.0,
          "critperlevel": 0.0,
          "attackdamage": 53.88,
          "attackdamageperlevel": 3.5,
          "attackspeedoffset": 0.0,
          "attackspeedperlevel": 3.6
        }
      },
      "Ezreal": {
        "version": "6.24.1",
        "id": "Ezreal",
        "key": "81",
        "name": "Ezreal",
        "title": "El Explorador Pródigo",
        "blurb": "El joven e intrépido aventurero Ezreal ha explorado algunos de los lugares más remotos y desiertos de Runaterra. En el transcurso de una expedición a las ruinas enterradas del antiquísimo desierto de Shurima, recuperó un amuleto de increíble poder ...",
        "info": {
          "attack": 7,
          "defense": 2,
          "magic": 6,
          "difficulty": 7
        },
        "image": {
          "full": "Ezreal.png",
          "sprite": "champion0.png",
          "group": "champion",
          "x": 240,
          "y": 96,
          "w": 48,
          "h": 48
        },
        "tags": ["Marksman", "Mage"],
        "partype": "MP",
        "stats": {
          "hp": 484.4,
          "hpperlevel": 80.0,
          "mp": 360.6,
          "mpperlevel": 42.0,
          "movespeed": 325.0,
          "armor": 21.88,
          "armorperlevel": 3.5,
          "spellblock": 30.0,
          "spellblockperlevel": 0.0,
          "attackrange": 550.0,
          "hpregen": 6.42,
          "hpregenperlevel": 0.55,
          "mpregen": 8.09,
          "mpregenperlevel": 0.65,
          "crit": 0.0,
          "critperlevel": 0.0,
          "attackdamage": 55.66,
          "attackdamageperlevel": 2.41,
          "attackspeedoffset": 0.0,
          "attackspeedperlevel": 2.8
        }
      },
      "FiddleSticks": {
        "version": "6.24.1",
        "id": "FiddleSticks",
        "key": "9",
        "name": "Fiddlesticks",
        "title": "El Mensajero de la Muerte",
        "blurb": "A lo largo de casi veinte años, Fiddlesticks ha estado solo en la cámara de invocación más oriental de la Academia de la Guerra. Solo la refulgente luz esmeralda de su mirada sobrenatural horada la húmeda oscuridad de su morada, cubierta por el polvo. ...",
        "info": {
          "attack": 2,
          "defense": 3,
          "magic": 9,
          "difficulty": 9
        },
        "image": {
          "full": "FiddleSticks.png",
          "sprite": "champion0.png",
          "group": "champion",
          "x": 288,
          "y": 96,
          "w": 48,
          "h": 48
        },
        "tags": ["Mage", "Support"],
        "partype": "MP",
        "stats": {
          "hp": 524.4,
          "hpperlevel": 80.0,
          "mp": 400.12,
          "mpperlevel": 56.0,
          "movespeed": 335.0,
          "armor": 20.88,
          "armorperlevel": 3.5,
          "spellblock": 30.0,
          "spellblockperlevel": 0.0,
          "attackrange": 480.0,
          "hpregen": 5.605,
          "hpregenperlevel": 0.6,
          "mpregen": 6.0,
          "mpregenperlevel": 0.8,
          "crit": 0.0,
          "critperlevel": 0.0,
          "attackdamage": 48.36,
          "attackdamageperlevel": 2.625,
          "attackspeedoffset": 0.0,
          "attackspeedperlevel": 2.11
        }
      },
      "Fiora": {
        "version": "6.24.1",
        "id": "Fiora",
        "key": "114",
        "name": "Fiora",
        "title": "La Estocada Excelsa",
        "blurb": "''He venido a mataros por cuestión de honor. Y aunque carecéis de él, moriréis igualmente''.<br>Fiora, la duelista más temida de Valoran, ha alcanzado tanto renombre por sus bruscas maneras y su mente despierta como por la velocidad de su estoque. ...",
        "info": {
          "attack": 10,
          "defense": 4,
          "magic": 2,
          "difficulty": 3
        },
        "image": {
          "full": "Fiora.png",
          "sprite": "champion0.png",
          "group": "champion",
          "x": 336,
          "y": 96,
          "w": 48,
          "h": 48
        },
        "tags": ["Fighter", "Assassin"],
        "partype": "MP",
        "stats": {
          "hp": 550.0,
          "hpperlevel": 85.0,
          "mp": 300.0,
          "mpperlevel": 40.0,
          "movespeed": 345.0,
          "armor": 24.0,
          "armorperlevel": 3.5,
          "spellblock": 32.1,
          "spellblockperlevel": 1.25,
          "attackrange": 150.0,
          "hpregen": 8.25,
          "hpregenperlevel": 0.55,
          "mpregen": 8.0,
          "mpregenperlevel": 0.7,
          "crit": 0.0,
          "critperlevel": 0.0,
          "attackdamage": 60.0,
          "attackdamageperlevel": 3.3,
          "attackspeedoffset": 0.0,
          "attackspeedperlevel": 3.2
        }
      },
      "Fizz": {
        "version": "6.24.1",
        "id": "Fizz",
        "key": "105",
        "name": "Fizz",
        "title": "El Gamberro de las Mareas",
        "blurb": "Hace siglos, una antigua raza que vivía bajo el agua construyó una ciudad oculta bajo una montaña en el mar. Aunque estas criaturas tenían sus enemigos, la ciudad era una fortaleza impenetrable y estaban satisfechos de sí mismos dentro de la seguridad ...",
        "info": {
          "attack": 6,
          "defense": 4,
          "magic": 7,
          "difficulty": 6
        },
        "image": {
          "full": "Fizz.png",
          "sprite": "champion0.png",
          "group": "champion",
          "x": 384,
          "y": 96,
          "w": 48,
          "h": 48
        },
        "tags": ["Assassin", "Fighter"],
        "partype": "MP",
        "stats": {
          "hp": 558.48,
          "hpperlevel": 86.0,
          "mp": 317.2,
          "mpperlevel": 37.0,
          "movespeed": 335.0,
          "armor": 22.412,
          "armorperlevel": 3.4,
          "spellblock": 32.1,
          "spellblockperlevel": 1.25,
          "attackrange": 175.0,
          "hpregen": 8.175,
          "hpregenperlevel": 0.7,
          "mpregen": 6.0,
          "mpregenperlevel": 0.8,
          "crit": 0.0,
          "critperlevel": 0.0,
          "attackdamage": 58.04,
          "attackdamageperlevel": 3.0,
          "attackspeedoffset": -0.05,
          "attackspeedperlevel": 3.1
        }
      },
      "Galio": {
        "version": "6.24.1",
        "id": "Galio",
        "key": "3",
        "name": "Galio",
        "title": "La Tristeza del Guardián",
        "blurb": "''La redención no existe. Solo existe la penitencia''.<br><br>Mucho antes de que la Liga regulara esta magia, los magos experimentaban con la creación de vida artificial. Aunque ahora es algo prohibido, la inculcación de la razón a los golems era una ...",
        "info": {
          "attack": 3,
          "defense": 7,
          "magic": 6,
          "difficulty": 3
        },
        "image": {
          "full": "Galio.png",
          "sprite": "champion0.png",
          "group": "champion",
          "x": 432,
          "y": 96,
          "w": 48,
          "h": 48
        },
        "tags": ["Tank", "Mage"],
        "partype": "MP",
        "stats": {
          "hp": 577.8,
          "hpperlevel": 85.0,
          "mp": 369.0,
          "mpperlevel": 47.0,
          "movespeed": 335.0,
          "armor": 26.88,
          "armorperlevel": 3.5,
          "spellblock": 32.1,
          "spellblockperlevel": 1.25,
          "attackrange": 125.0,
          "hpregen": 8.71,
          "hpregenperlevel": 0.75,
          "mpregen": 6.0,
          "mpregenperlevel": 0.8,
          "crit": 0.0,
          "critperlevel": 0.0,
          "attackdamage": 61.97,
          "attackdamageperlevel": 3.375,
          "attackspeedoffset": -0.02,
          "attackspeedperlevel": 1.2
        }
      },
      "Gangplank": {
        "version": "6.24.1",
        "id": "Gangplank",
        "key": "41",
        "name": "Gangplank",
        "title": "El Azote de los Mares",
        "blurb": "''Yo ya estaba rebanando gargantas y hundiendo galeras de guerra noxianas mucho antes de que tú empezases a mearte en los calzones, muchacho. No te conviene provocarme''.<br><br>Tan impredecible como brutal, el destronado rey de los piratas conocido ...",
        "info": {
          "attack": 7,
          "defense": 6,
          "magic": 4,
          "difficulty": 9
        },
        "image": {
          "full": "Gangplank.png",
          "sprite": "champion1.png",
          "group": "champion",
          "x": 0,
          "y": 0,
          "w": 48,
          "h": 48
        },
        "tags": ["Fighter"],
        "partype": "MP",
        "stats": {
          "hp": 540.0,
          "hpperlevel": 82.0,
          "mp": 282.0,
          "mpperlevel": 40.0,
          "movespeed": 345.0,
          "armor": 26.0,
          "armorperlevel": 3.0,
          "spellblock": 32.1,
          "spellblockperlevel": 1.25,
          "attackrange": 125.0,
          "hpregen": 6.0,
          "hpregenperlevel": 0.6,
          "mpregen": 7.5,
          "mpregenperlevel": 0.7,
          "crit": 0.0,
          "critperlevel": 0.0,
          "attackdamage": 56.0,
          "attackdamageperlevel": 3.0,
          "attackspeedoffset": 0.0,
          "attackspeedperlevel": 3.2
        }
      },
      "Garen": {
        "version": "6.24.1",
        "id": "Garen",
        "key": "86",
        "name": "Garen",
        "title": "El Poder de Demacia",
        "blurb": "Por todo Valoran, la determinación de los soldados de Demacia se celebra o se desprecia, pero siempre se respeta. Su código moral de ''tolerancia cero'' es defendido de forma estricta tanto por soldados como por civiles. En el combate, esto significa ...",
        "info": {
          "attack": 7,
          "defense": 7,
          "magic": 1,
          "difficulty": 5
        },
        "image": {
          "full": "Garen.png",
          "sprite": "champion1.png",
          "group": "champion",
          "x": 48,
          "y": 0,
          "w": 48,
          "h": 48
        },
        "tags": ["Fighter", "Tank"],
        "partype": "None",
        "stats": {
          "hp": 616.28,
          "hpperlevel": 84.25,
          "mp": 0.0,
          "mpperlevel": 0.0,
          "movespeed": 340.0,
          "armor": 27.536,
          "armorperlevel": 3.0,
          "spellblock": 32.1,
          "spellblockperlevel": 1.25,
          "attackrange": 175.0,
          "hpregen": 7.84,
          "hpregenperlevel": 0.5,
          "mpregen": 0.0,
          "mpregenperlevel": 0.0,
          "crit": 0.0,
          "critperlevel": 0.0,
          "attackdamage": 57.88,
          "attackdamageperlevel": 4.5,
          "attackspeedoffset": 0.0,
          "attackspeedperlevel": 2.9
        }
      },
      "Gnar": {
        "version": "6.24.1",
        "id": "Gnar",
        "key": "150",
        "name": "Gnar",
        "title": "El Eslabón Perdido",
        "blurb": "La jungla no perdona la ceguera. Cada rama rota cuenta una historia.<br><br>He cazado cada criatura que habita en esta. Tenía la certeza de que ya no albergaba más retos, pero ha aparecido algo nuevo. Cada una de sus huellas es tan grande como un ...",
        "info": {
          "attack": 6,
          "defense": 5,
          "magic": 5,
          "difficulty": 8
        },
        "image": {
          "full": "Gnar.png",
          "sprite": "champion1.png",
          "group": "champion",
          "x": 96,
          "y": 0,
          "w": 48,
          "h": 48
        },
        "tags": ["Fighter", "Tank"],
        "partype": "Gnarfury",
        "stats": {
          "hp": 540.0,
          "hpperlevel": 65.0,
          "mp": 100.0,
          "mpperlevel": 0.0,
          "movespeed": 325.0,
          "armor": 23.0,
          "armorperlevel": 2.5,
          "spellblock": 30.0,
          "spellblockperlevel": 0.0,
          "attackrange": 175.0,
          "hpregen": 2.5,
          "hpregenperlevel": 0.5,
          "mpregen": 0.0,
          "mpregenperlevel": 0.0,
          "crit": 0.0,
          "critperlevel": 0.0,
          "attackdamage": 51.0,
          "attackdamageperlevel": 3.0,
          "attackspeedoffset": 0.0,
          "attackspeedperlevel": 6.0
        }
      },
      "Gragas": {
        "version": "6.24.1",
        "id": "Gragas",
        "key": "79",
        "name": "Gragas",
        "title": "El Camorrista",
        "blurb": "Para Gragas, lo único más importante que pelear es beber. Su sed insaciable por una cerveza más fuerte le ha llevado a buscar el ingrediente más potente y extraño que pueda echar a su alambique. A este juerguista empedernido le gusta tanto chocar ...",
        "info": {
          "attack": 4,
          "defense": 7,
          "magic": 6,
          "difficulty": 5
        },
        "image": {
          "full": "Gragas.png",
          "sprite": "champion1.png",
          "group": "champion",
          "x": 144,
          "y": 0,
          "w": 48,
          "h": 48
        },
        "tags": ["Fighter", "Mage"],
        "partype": "MP",
        "stats": {
          "hp": 583.52,
          "hpperlevel": 89.0,
          "mp": 400.0,
          "mpperlevel": 47.0,
          "movespeed": 330.0,
          "armor": 26.048,
          "armorperlevel": 3.6,
          "spellblock": 32.1,
          "spellblockperlevel": 1.25,
          "attackrange": 125.0,
          "hpregen": 5.5,
          "hpregenperlevel": 0.5,
          "mpregen": 6.0,
          "mpregenperlevel": 0.8,
          "crit": 0.0,
          "critperlevel": 0.0,
          "attackdamage": 61.38,
          "attackdamageperlevel": 3.5,
          "attackspeedoffset": -0.04,
          "attackspeedperlevel": 2.05
        }
      },
      "Graves": {
        "version": "6.24.1",
        "id": "Graves",
        "key": "104",
        "name": "Graves",
        "title": "El Forajido",
        "blurb": "A Malcolm Graves se le busca en todos los reinos, ciudades e imperios que ha visitado. Es un hombre duro, resuelto y, por encima de todo, temerario, cuya vida de delincuencia le ha permitido amasar varias veces una pequeña fortuna... y perderla otras ...",
        "info": {
          "attack": 8,
          "defense": 5,
          "magic": 3,
          "difficulty": 3
        },
        "image": {
          "full": "Graves.png",
          "sprite": "champion1.png",
          "group": "champion",
          "x": 192,
          "y": 0,
          "w": 48,
          "h": 48
        },
        "tags": ["Marksman"],
        "partype": "MP",
        "stats": {
          "hp": 551.12,
          "hpperlevel": 84.0,
          "mp": 322.2,
          "mpperlevel": 40.0,
          "movespeed": 340.0,
          "armor": 24.376,
          "armorperlevel": 3.4,
          "spellblock": 30.0,
          "spellblockperlevel": 0.0,
          "attackrange": 425.0,
          "hpregen": 6.675,
          "hpregenperlevel": 0.7,
          "mpregen": 7.9,
          "mpregenperlevel": 0.7,
          "crit": 0.0,
          "critperlevel": 0.0,
          "attackdamage": 60.83,
          "attackdamageperlevel": 2.41,
          "attackspeedoffset": 0.3,
          "attackspeedperlevel": 2.6
        }
      },
      "Hecarim": {
        "version": "6.24.1",
        "id": "Hecarim",
        "key": "120",
        "name": "Hecarim",
        "title": "La Sombra de la Guerra",
        "blurb": "''Atravesad sus filas y pisoteadlos sin piedad. Aplastad a los vivos y solazaos en su terror.''<br><br>Hecarim es un coloso blindado que cabalga desde las Islas de la Sombra a la cabeza de una hueste de jinetes espectrales para dar caza a los vivos. ...",
        "info": {
          "attack": 8,
          "defense": 6,
          "magic": 4,
          "difficulty": 6
        },
        "image": {
          "full": "Hecarim.png",
          "sprite": "champion1.png",
          "group": "champion",
          "x": 240,
          "y": 0,
          "w": 48,
          "h": 48
        },
        "tags": ["Fighter", "Tank"],
        "partype": "MP",
        "stats": {
          "hp": 580.0,
          "hpperlevel": 90.0,
          "mp": 277.2,
          "mpperlevel": 40.0,
          "movespeed": 345.0,
          "armor": 26.72,
          "armorperlevel": 4.0,
          "spellblock": 32.1,
          "spellblockperlevel": 1.25,
          "attackrange": 175.0,
          "hpregen": 7.0,
          "hpregenperlevel": 0.75,
          "mpregen": 6.5,
          "mpregenperlevel": 0.6,
          "crit": 0.0,
          "critperlevel": 0.0,
          "attackdamage": 58.0,
          "attackdamageperlevel": 3.2,
          "attackspeedoffset": -0.0672,
          "attackspeedperlevel": 2.5
        }
      },
      "Heimerdinger": {
        "version": "6.24.1",
        "id": "Heimerdinger",
        "key": "74",
        "name": "Heimerdinger",
        "title": "El Inventor Venerado",
        "blurb": "Del diario del profesor Cecil B. Heimerdinger<br><br>14.10<br><br>09:15<br><br>Las condiciones meteorológicas actuales en Ciudad de Bandle parecen óptimas. ¡La presión atmosférica es ideal para los experimentos de hoy!<br><br>Esta tarde toca la quinta ...",
        "info": {
          "attack": 2,
          "defense": 6,
          "magic": 8,
          "difficulty": 8
        },
        "image": {
          "full": "Heimerdinger.png",
          "sprite": "champion1.png",
          "group": "champion",
          "x": 288,
          "y": 0,
          "w": 48,
          "h": 48
        },
        "tags": ["Mage", "Support"],
        "partype": "MP",
        "stats": {
          "hp": 476.0,
          "hpperlevel": 75.0,
          "mp": 307.2,
          "mpperlevel": 40.0,
          "movespeed": 340.0,
          "armor": 19.04,
          "armorperlevel": 3.0,
          "spellblock": 30.0,
          "spellblockperlevel": 0.0,
          "attackrange": 550.0,
          "hpregen": 11.005,
          "hpregenperlevel": 1.75,
          "mpregen": 6.0,
          "mpregenperlevel": 0.8,
          "crit": 0.0,
          "critperlevel": 0.0,
          "attackdamage": 55.536,
          "attackdamageperlevel": 2.7,
          "attackspeedoffset": 0.0,
          "attackspeedperlevel": 1.36
        }
      },
      "Illaoi": {
        "version": "6.24.1",
        "id": "Illaoi",
        "key": "420",
        "name": "Illaoi",
        "title": "La Sacerdotisa del Kraken",
        "blurb": "''Los sermones no son lo mío. No hay mejor profesor que un hueso roto.''<br><br>El portentoso físico de Illaoi solo es superado por su fe indómita. Como profeta del Gran Kraken, hace uso de un gran ídolo dorado para arrancar el espíritu del cuerpo de ...",
        "info": {
          "attack": 8,
          "defense": 6,
          "magic": 3,
          "difficulty": 4
        },
        "image": {
          "full": "Illaoi.png",
          "sprite": "champion1.png",
          "group": "champion",
          "x": 336,
          "y": 0,
          "w": 48,
          "h": 48
        },
        "tags": ["Fighter", "Tank"],
        "partype": "MP",
        "stats": {
          "hp": 585.6,
          "hpperlevel": 95.0,
          "mp": 300.0,
          "mpperlevel": 40.0,
          "movespeed": 340.0,
          "armor": 26.0,
          "armorperlevel": 3.8,
          "spellblock": 32.1,
          "spellblockperlevel": 1.25,
          "attackrange": 125.0,
          "hpregen": 9.5,
          "hpregenperlevel": 0.8,
          "mpregen": 7.5,
          "mpregenperlevel": 0.75,
          "crit": 0.0,
          "critperlevel": 0.0,
          "attackdamage": 60.0,
          "attackdamageperlevel": 5.0,
          "attackspeedoffset": 0.0,
          "attackspeedperlevel": 2.5
        }
      },
      "Irelia": {
        "version": "6.24.1",
        "id": "Irelia",
        "key": "39",
        "name": "Irelia",
        "title": "La Voluntad de las Cuchillas",
        "blurb": "''La espada baila, entonando su melodía de sangre.''<br><br>Los jonios, en su continua búsqueda de la iluminación, desarrollaron algunas de las artes marciales más prodigiosas y letales de toda Runaterra. Sin embargo, el estilo de lucha más destacado ...",
        "info": {
          "attack": 7,
          "defense": 4,
          "magic": 5,
          "difficulty": 5
        },
        "image": {
          "full": "Irelia.png",
          "sprite": "champion1.png",
          "group": "champion",
          "x": 384,
          "y": 0,
          "w": 48,
          "h": 48
        },
        "tags": ["Fighter", "Assassin"],
        "partype": "MP",
        "stats": {
          "hp": 607.2,
          "hpperlevel": 90.0,
          "mp": 338.8,
          "mpperlevel": 32.0,
          "movespeed": 345.0,
          "armor": 25.3,
          "armorperlevel": 3.75,
          "spellblock": 32.1,
          "spellblockperlevel": 1.25,
          "attackrange": 125.0,
          "hpregen": 8.59,
          "hpregenperlevel": 0.65,
          "mpregen": 8.1,
          "mpregenperlevel": 0.65,
          "crit": 0.0,
          "critperlevel": 0.0,
          "attackdamage": 61.544,
          "attackdamageperlevel": 3.3,
          "attackspeedoffset": -0.06,
          "attackspeedperlevel": 3.2
        }
      },
      "Ivern": {
        "version": "6.24.1",
        "id": "Ivern",
        "key": "427",
        "name": "Ivern",
        "title": "El Padre Arborescente",
        "blurb": "Ivern Bósquez, conocido por muchos como el Padre Arborescente, es un ser peculiar, mitad humano y mitad árbol, que deambula por los bosques de Runaterra y cultiva la vida allá donde va. Conoce los secretos del mundo natural y es buen amigo de todo lo ...",
        "info": {
          "attack": 3,
          "defense": 5,
          "magic": 7,
          "difficulty": 7
        },
        "image": {
          "full": "Ivern.png",
          "sprite": "champion4.png",
          "group": "champion",
          "x": 96,
          "y": 48,
          "w": 48,
          "h": 48
        },
        "tags": ["Support", "Mage"],
        "partype": "MP",
        "stats": {
          "hp": 580.0,
          "hpperlevel": 90.0,
          "mp": 450.0,
          "mpperlevel": 60.0,
          "movespeed": 330.0,
          "armor": 22.0,
          "armorperlevel": 3.5,
          "spellblock": 32.1,
          "spellblockperlevel": 1.25,
          "attackrange": 125.0,
          "hpregen": 6.9,
          "hpregenperlevel": 0.85,
          "mpregen": 6.0,
          "mpregenperlevel": 0.75,
          "crit": 0.0,
          "critperlevel": 0.0,
          "attackdamage": 50.0,
          "attackdamageperlevel": 3.0,
          "attackspeedoffset": -0.03,
          "attackspeedperlevel": 3.4
        }
      },
      "Janna": {
        "version": "6.24.1",
        "id": "Janna",
        "key": "40",
        "name": "Janna",
        "title": "La Furia de la Tormenta",
        "blurb": "Hay hechiceros que se entregan a los poderes primordiales de la naturaleza, renunciando a todo cuanto hayan aprendido de la magia. Janna es una de esas hechiceras, que aprendió magia como huérfana cuando crecía en medio del caos de la ciudad estado de ...",
        "info": {
          "attack": 3,
          "defense": 5,
          "magic": 7,
          "difficulty": 7
        },
        "image": {
          "full": "Janna.png",
          "sprite": "champion1.png",
          "group": "champion",
          "x": 432,
          "y": 0,
          "w": 48,
          "h": 48
        },
        "tags": ["Support", "Mage"],
        "partype": "MP",
        "stats": {
          "hp": 487.04,
          "hpperlevel": 78.0,
          "mp": 409.52,
          "mpperlevel": 64.0,
          "movespeed": 335.0,
          "armor": 19.384,
          "armorperlevel": 3.8,
          "spellblock": 30.0,
          "spellblockperlevel": 0.0,
          "attackrange": 475.0,
          "hpregen": 5.42,
          "hpregenperlevel": 0.55,
          "mpregen": 11.5,
          "mpregenperlevel": 0.4,
          "crit": 0.0,
          "critperlevel": 0.0,
          "attackdamage": 51.956,
          "attackdamageperlevel": 2.95,
          "attackspeedoffset": 0.0,
          "attackspeedperlevel": 2.61
        }
      },
      "JarvanIV": {
        "version": "6.24.1",
        "id": "JarvanIV",
        "key": "59",
        "name": "Jarvan IV",
        "title": "El Ejemplo de Demacia",
        "blurb": "''Solo hay una verdad, y la descubriréis en la punta de mi lanza.''<br><br>Los miembros de la estirpe de los Escudos de Luz han pertenecido a la familia real de Demacia durante siglos, dedicando sus vidas a combatir contra todo aquel que se opusiese a ...",
        "info": {
          "attack": 6,
          "defense": 8,
          "magic": 3,
          "difficulty": 5
        },
        "image": {
          "full": "JarvanIV.png",
          "sprite": "champion1.png",
          "group": "champion",
          "x": 0,
          "y": 48,
          "w": 48,
          "h": 48
        },
        "tags": ["Tank", "Fighter"],
        "partype": "MP",
        "stats": {
          "hp": 571.2,
          "hpperlevel": 90.0,
          "mp": 302.2,
          "mpperlevel": 40.0,
          "movespeed": 340.0,
          "armor": 29.0,
          "armorperlevel": 3.6,
          "spellblock": 32.1,
          "spellblockperlevel": 1.25,
          "attackrange": 175.0,
          "hpregen": 8.175,
          "hpregenperlevel": 0.7,
          "mpregen": 6.755,
          "mpregenperlevel": 0.45,
          "crit": 0.0,
          "critperlevel": 0.0,
          "attackdamage": 55.712,
          "attackdamageperlevel": 3.4,
          "attackspeedoffset": -0.05,
          "attackspeedperlevel": 2.5
        }
      },
      "Jax": {
        "version": "6.24.1",
        "id": "Jax",
        "key": "24",
        "name": "Jax",
        "title": "El Maestro de Armas",
        "blurb": "Son raros los casos en que un campeón se define por sus actos después de unirse a la Liga de Leyendas y no antes. Es lo que ocurre con Jax, quizá debido a que se trata del luchador de torneos más prolífico de la Academia de la Guerra. Antes de unirse ...",
        "info": {
          "attack": 7,
          "defense": 5,
          "magic": 7,
          "difficulty": 5
        },
        "image": {
          "full": "Jax.png",
          "sprite": "champion1.png",
          "group": "champion",
          "x": 48,
          "y": 48,
          "w": 48,
          "h": 48
        },
        "tags": ["Fighter", "Assassin"],
        "partype": "MP",
        "stats": {
          "hp": 592.8,
          "hpperlevel": 85.0,
          "mp": 338.8,
          "mpperlevel": 32.0,
          "movespeed": 350.0,
          "armor": 27.04,
          "armorperlevel": 3.0,
          "spellblock": 32.1,
          "spellblockperlevel": 1.25,
          "attackrange": 125.0,
          "hpregen": 8.37,
          "hpregenperlevel": 0.55,
          "mpregen": 7.575,
          "mpregenperlevel": 0.7,
          "crit": 0.0,
          "critperlevel": 0.0,
          "attackdamage": 61.97,
          "attackdamageperlevel": 3.375,
          "attackspeedoffset": -0.02,
          "attackspeedperlevel": 3.4
        }
      },
      "Jayce": {
        "version": "6.24.1",
        "id": "Jayce",
        "key": "126",
        "name": "Jayce",
        "title": "El Defensor del Mañana",
        "blurb": "Armado con su ingenio, su encanto y su martillo que se transforma, Jayce vive únicamente para proteger a su Piltover natal. Sin embargo, mucho antes de que su nación lo llamase héroe, fue un prometedor y joven inventor. Cuando Piltover le encargó ...",
        "info": {
          "attack": 8,
          "defense": 4,
          "magic": 3,
          "difficulty": 7
        },
        "image": {
          "full": "Jayce.png",
          "sprite": "champion1.png",
          "group": "champion",
          "x": 96,
          "y": 48,
          "w": 48,
          "h": 48
        },
        "tags": ["Fighter", "Marksman"],
        "partype": "MP",
        "stats": {
          "hp": 571.2,
          "hpperlevel": 90.0,
          "mp": 357.2,
          "mpperlevel": 37.0,
          "movespeed": 335.0,
          "armor": 22.38,
          "armorperlevel": 3.5,
          "spellblock": 30.0,
          "spellblockperlevel": 0.0,
          "attackrange": 125.0,
          "hpregen": 7.34,
          "hpregenperlevel": 0.8,
          "mpregen": 6.0,
          "mpregenperlevel": 0.8,
          "crit": 0.0,
          "critperlevel": 0.0,
          "attackdamage": 50.38,
          "attackdamageperlevel": 3.5,
          "attackspeedoffset": -0.05,
          "attackspeedperlevel": 3.0
        }
      },
      "Jhin": {
        "version": "6.24.1",
        "id": "Jhin",
        "key": "202",
        "name": "Jhin",
        "title": "El Virtuoso",
        "blurb": "''El arte requiere de una cierta... crueldad''.<br><br>Jhin es un meticuloso criminal psicópata que ve el asesinato como arte. Otrora prisionero jonio, fue liberado gracias a la influencia del sector más sombrío del consejo de Jonia. Ahora, el artista ...",
        "info": {
          "attack": 10,
          "defense": 2,
          "magic": 6,
          "difficulty": 6
        },
        "image": {
          "full": "Jhin.png",
          "sprite": "champion1.png",
          "group": "champion",
          "x": 144,
          "y": 48,
          "w": 48,
          "h": 48
        },
        "tags": ["Marksman", "Assassin"],
        "partype": "MP",
        "stats": {
          "hp": 540.0,
          "hpperlevel": 85.0,
          "mp": 300.0,
          "mpperlevel": 50.0,
          "movespeed": 330.0,
          "armor": 20.0,
          "armorperlevel": 3.5,
          "spellblock": 30.0,
          "spellblockperlevel": 0.0,
          "attackrange": 550.0,
          "hpregen": 6.0,
          "hpregenperlevel": 0.55,
          "mpregen": 6.0,
          "mpregenperlevel": 0.8,
          "crit": 0.0,
          "critperlevel": 0.0,
          "attackdamage": 53.0,
          "attackdamageperlevel": 4.0,
          "attackspeedoffset": 0.0,
          "attackspeedperlevel": 0.0
        }
      },
      "Jinx": {
        "version": "6.24.1",
        "id": "Jinx",
        "key": "222",
        "name": "Jinx",
        "title": "La Bala Perdida",
        "blurb": "Jinx vive para provocar el caos sin pararse a pensar en las consecuencias; siempre deja un rastro de pánico y destrucción tras de sí. Delincuente impulsiva y maniática, el aburrimiento es lo que más odia en esta vida, y libera a su antojo todo el caos ...",
        "info": {
          "attack": 9,
          "defense": 2,
          "magic": 4,
          "difficulty": 6
        },
        "image": {
          "full": "Jinx.png",
          "sprite": "champion1.png",
          "group": "champion",
          "x": 192,
          "y": 48,
          "w": 48,
          "h": 48
        },
        "tags": ["Marksman"],
        "partype": "MP",
        "stats": {
          "hp": 517.76,
          "hpperlevel": 82.0,
          "mp": 245.6,
          "mpperlevel": 45.0,
          "movespeed": 325.0,
          "armor": 22.88,
          "armorperlevel": 3.5,
          "spellblock": 30.0,
          "spellblockperlevel": 0.0,
          "attackrange": 525.0,
          "hpregen": 5.84,
          "hpregenperlevel": 0.5,
          "mpregen": 6.68,
          "mpregenperlevel": 1.0,
          "crit": 0.0,
          "critperlevel": 0.0,
          "attackdamage": 58.46,
          "attackdamageperlevel": 2.41,
          "attackspeedoffset": 0.0,
          "attackspeedperlevel": 1.0
        }
      },
      "Kalista": {
        "version": "6.24.1",
        "id": "Kalista",
        "key": "429",
        "name": "Kalista",
        "title": "El Espíritu de la Venganza",
        "blurb": "''Cuando nos ofenden, buscamos justicia. Cuando nos hieren, respondemos. ¡Y cuando nos traicionan, el Espíritu de la Venganza golpea!''<br><br>Kalista, un espectro de cólera y castigo, es el inmortal espíritu de la venganza, una pesadilla acorazada ...",
        "info": {
          "attack": 8,
          "defense": 2,
          "magic": 4,
          "difficulty": 7
        },
        "image": {
          "full": "Kalista.png",
          "sprite": "champion1.png",
          "group": "champion",
          "x": 240,
          "y": 48,
          "w": 48,
          "h": 48
        },
        "tags": ["Marksman"],
        "partype": "MP",
        "stats": {
          "hp": 517.76,
          "hpperlevel": 83.0,
          "mp": 231.8,
          "mpperlevel": 35.0,
          "movespeed": 325.0,
          "armor": 19.012,
          "armorperlevel": 3.5,
          "spellblock": 30.0,
          "spellblockperlevel": 0.0,
          "attackrange": 550.0,
          "hpregen": 6.0,
          "hpregenperlevel": 0.55,
          "mpregen": 6.3,
          "mpregenperlevel": 0.4,
          "crit": 0.0,
          "critperlevel": 0.0,
          "attackdamage": 63.0,
          "attackdamageperlevel": 2.9,
          "attackspeedoffset": -0.03,
          "attackspeedperlevel": 2.5
        }
      },
      "Karma": {
        "version": "6.24.1",
        "id": "Karma",
        "key": "43",
        "name": "Karma",
        "title": "La Iluminada",
        "blurb": "Karma es una mujer con una voluntad indomable y un poder espiritual sin ataduras. Es el alma de Jonia y una presencia inspiradora en el campo de batalla, dedicada a proteger a sus aliados y a repeler a sus enemigos. Una poderosa líder dividida entre ...",
        "info": {
          "attack": 1,
          "defense": 7,
          "magic": 8,
          "difficulty": 5
        },
        "image": {
          "full": "Karma.png",
          "sprite": "champion1.png",
          "group": "champion",
          "x": 288,
          "y": 48,
          "w": 48,
          "h": 48
        },
        "tags": ["Mage", "Support"],
        "partype": "MP",
        "stats": {
          "hp": 522.44,
          "hpperlevel": 83.0,
          "mp": 374.0,
          "mpperlevel": 50.0,
          "movespeed": 335.0,
          "armor": 20.384,
          "armorperlevel": 3.8,
          "spellblock": 30.0,
          "spellblockperlevel": 0.0,
          "attackrange": 525.0,
          "hpregen": 5.62,
          "hpregenperlevel": 0.55,
          "mpregen": 8.5,
          "mpregenperlevel": 0.8,
          "crit": 0.0,
          "critperlevel": 0.0,
          "attackdamage": 53.544,
          "attackdamageperlevel": 3.3,
          "attackspeedoffset": 0.0,
          "attackspeedperlevel": 2.3
        }
      },
      "Karthus": {
        "version": "6.24.1",
        "id": "Karthus",
        "key": "30",
        "name": "Karthus",
        "title": "La Voz de la Muerte",
        "blurb": "''La muerte no es el final del camino, solo el principio...''<br><br>Karthus, heraldo del olvido, es un espíritu inmortal cuyos pavorosos cantos preceden el horror de su dantesca aparición. Los vivos temen la eternidad de la no muerte, pero Karthus ...",
        "info": {
          "attack": 2,
          "defense": 2,
          "magic": 10,
          "difficulty": 7
        },
        "image": {
          "full": "Karthus.png",
          "sprite": "champion1.png",
          "group": "champion",
          "x": 336,
          "y": 48,
          "w": 48,
          "h": 48
        },
        "tags": ["Mage"],
        "partype": "MP",
        "stats": {
          "hp": 516.0,
          "hpperlevel": 75.0,
          "mp": 372.48,
          "mpperlevel": 61.0,
          "movespeed": 335.0,
          "armor": 20.88,
          "armorperlevel": 3.5,
          "spellblock": 30.0,
          "spellblockperlevel": 0.0,
          "attackrange": 450.0,
          "hpregen": 6.42,
          "hpregenperlevel": 0.55,
          "mpregen": 6.0,
          "mpregenperlevel": 0.8,
          "crit": 0.0,
          "critperlevel": 0.0,
          "attackdamage": 45.66,
          "attackdamageperlevel": 3.25,
          "attackspeedoffset": 0.0,
          "attackspeedperlevel": 2.11
        }
      },
      "Kassadin": {
        "version": "6.24.1",
        "id": "Kassadin",
        "key": "38",
        "name": "Kassadin",
        "title": "El Caminante del Vacío",
        "blurb": "Hay un lugar entre dimensiones, entre mundos. Para algunos es el exterior, para otros es lo desconocido. Para la mayoría, sin embargo, es el Vacío. Pese a su nombre, no se trata de un lugar vacuo, sino del hogar de cosas innombrables, horrores ...",
        "info": {
          "attack": 3,
          "defense": 5,
          "magic": 8,
          "difficulty": 8
        },
        "image": {
          "full": "Kassadin.png",
          "sprite": "champion1.png",
          "group": "champion",
          "x": 384,
          "y": 48,
          "w": 48,
          "h": 48
        },
        "tags": ["Assassin", "Mage"],
        "partype": "MP",
        "stats": {
          "hp": 564.04,
          "hpperlevel": 78.0,
          "mp": 397.6,
          "mpperlevel": 67.0,
          "movespeed": 340.0,
          "armor": 23.376,
          "armorperlevel": 3.2,
          "spellblock": 30.0,
          "spellblockperlevel": 0.0,
          "attackrange": 150.0,
          "hpregen": 7.79,
          "hpregenperlevel": 0.5,
          "mpregen": 6.0,
          "mpregenperlevel": 0.8,
          "crit": 0.0,
          "critperlevel": 0.0,
          "attackdamage": 58.852,
          "attackdamageperlevel": 3.9,
          "attackspeedoffset": -0.023,
          "attackspeedperlevel": 3.7
        }
      },
      "Katarina": {
        "version": "6.24.1",
        "id": "Katarina",
        "key": "55",
        "name": "Katarina",
        "title": "La Cuchilla Siniestra",
        "blurb": "Movida por un intenso instinto asesino, Katarina usa sus talentos como asesina en beneficio de la gloria de Noxus y de la continua elevación de su familia. Aunque su fervor la suele impulsar a realizar hazañas cada vez mayores, en ocasiones puede ser ...",
        "info": {
          "attack": 4,
          "defense": 3,
          "magic": 9,
          "difficulty": 8
        },
        "image": {
          "full": "Katarina.png",
          "sprite": "champion1.png",
          "group": "champion",
          "x": 432,
          "y": 48,
          "w": 48,
          "h": 48
        },
        "tags": ["Assassin", "Mage"],
        "partype": "None",
        "stats": {
          "hp": 590.0,
          "hpperlevel": 82.0,
          "mp": 0.0,
          "mpperlevel": 0.0,
          "movespeed": 340.0,
          "armor": 27.88,
          "armorperlevel": 3.5,
          "spellblock": 34.1,
          "spellblockperlevel": 1.25,
          "attackrange": 125.0,
          "hpregen": 7.5,
          "hpregenperlevel": 0.7,
          "mpregen": 0.0,
          "mpregenperlevel": 0.0,
          "crit": 0.0,
          "critperlevel": 0.0,
          "attackdamage": 58.0,
          "attackdamageperlevel": 3.2,
          "attackspeedoffset": -0.05,
          "attackspeedperlevel": 2.74
        }
      },
      "Kayle": {
        "version": "6.24.1",
        "id": "Kayle",
        "key": "10",
        "name": "Kayle",
        "title": "La Justiciera",
        "blurb": "En un mundo lejano, donde aún hoy se sigue librando una guerra milenaria, vivía una gran heroína, Kayle, la más fuerte de una raza inmortal entregada a combatir el mal allá donde éste surja. Kayle lleva diez mil años luchando incansablemente por su ...",
        "info": {
          "attack": 6,
          "defense": 6,
          "magic": 7,
          "difficulty": 7
        },
        "image": {
          "full": "Kayle.png",
          "sprite": "champion1.png",
          "group": "champion",
          "x": 0,
          "y": 96,
          "w": 48,
          "h": 48
        },
        "tags": ["Fighter", "Support"],
        "partype": "MP",
        "stats": {
          "hp": 574.24,
          "hpperlevel": 93.0,
          "mp": 322.2,
          "mpperlevel": 40.0,
          "movespeed": 335.0,
          "armor": 26.88,
          "armorperlevel": 3.5,
          "spellblock": 30.0,
          "spellblockperlevel": 0.0,
          "attackrange": 125.0,
          "hpregen": 8.26,
          "hpregenperlevel": 0.75,
          "mpregen": 6.0,
          "mpregenperlevel": 0.8,
          "crit": 0.0,
          "critperlevel": 0.0,
          "attackdamage": 51.0,
          "attackdamageperlevel": 2.8,
          "attackspeedoffset": -0.02,
          "attackspeedperlevel": 2.2
        }
      },
      "Kennen": {
        "version": "6.24.1",
        "id": "Kennen",
        "key": "85",
        "name": "Kennen",
        "title": "El Corazón de la Tempestad",
        "blurb": "Existe una antigua orden que tiene su origen en las Islas Jonias y que se dedica a preservar el equilibrio en el mundo. Orden, caos, luz, oscuridad… todas las cosas deben existir en perfecta armonía, ya que así es como funciona el universo. Esta orden ...",
        "info": {
          "attack": 6,
          "defense": 4,
          "magic": 7,
          "difficulty": 4
        },
        "image": {
          "full": "Kennen.png",
          "sprite": "champion1.png",
          "group": "champion",
          "x": 48,
          "y": 96,
          "w": 48,
          "h": 48
        },
        "tags": ["Mage", "Marksman"],
        "partype": "Energy",
        "stats": {
          "hp": 535.72,
          "hpperlevel": 79.0,
          "mp": 200.0,
          "mpperlevel": 0.0,
          "movespeed": 335.0,
          "armor": 24.3,
          "armorperlevel": 3.75,
          "spellblock": 30.0,
          "spellblockperlevel": 0.0,
          "attackrange": 550.0,
          "hpregen": 5.59,
          "hpregenperlevel": 0.65,
          "mpregen": 50.0,
          "mpregenperlevel": 0.0,
          "crit": 0.0,
          "critperlevel": 0.0,
          "attackdamage": 50.544,
          "attackdamageperlevel": 3.3,
          "attackspeedoffset": -0.0947,
          "attackspeedperlevel": 3.4
        }
      },
      "Khazix": {
        "version": "6.24.1",
        "id": "Khazix",
        "key": "121",
        "name": "Kha'Zix",
        "title": "El Saqueador del Vacío",
        "blurb": "Kha'Zix es un despiadado depredador de Vacío que se infiltró en Valoran para poder devorar a sus criaturas más prometedoras. Absorbe la fuerza de todas sus víctimas y evoluciona para hacerse cada vez más poderoso. Ansía devorar a Rengar, la única ...",
        "info": {
          "attack": 9,
          "defense": 4,
          "magic": 3,
          "difficulty": 6
        },
        "image": {
          "full": "Khazix.png",
          "sprite": "champion1.png",
          "group": "champion",
          "x": 96,
          "y": 96,
          "w": 48,
          "h": 48
        },
        "tags": ["Assassin", "Fighter"],
        "partype": "MP",
        "stats": {
          "hp": 572.8,
          "hpperlevel": 85.0,
          "mp": 327.2,
          "mpperlevel": 40.0,
          "movespeed": 350.0,
          "armor": 27.0,
          "armorperlevel": 3.0,
          "spellblock": 32.1,
          "spellblockperlevel": 1.25,
          "attackrange": 125.0,
          "hpregen": 7.51,
          "hpregenperlevel": 0.75,
          "mpregen": 7.59,
          "mpregenperlevel": 0.5,
          "crit": 0.0,
          "critperlevel": 0.0,
          "attackdamage": 55.21,
          "attackdamageperlevel": 3.1,
          "attackspeedoffset": -0.065,
          "attackspeedperlevel": 2.7
        }
      },
      "Kindred": {
        "version": "6.24.1",
        "id": "Kindred",
        "key": "203",
        "name": "Kindred",
        "title": "Los Cazadores Eternos",
        "blurb": "''Dime otra vez, Corderita, ¿qué cosas podemos tomar para nosotros?''<br>''Todas, querido Lobo.''<br>Separadas, pero nunca divididas, Kindred representa las esencias hermanas de la muerte. La flecha de Cordera ofrece una vía de escape rápida para ...",
        "info": {
          "attack": 8,
          "defense": 2,
          "magic": 2,
          "difficulty": 4
        },
        "image": {
          "full": "Kindred.png",
          "sprite": "champion1.png",
          "group": "champion",
          "x": 144,
          "y": 96,
          "w": 48,
          "h": 48
        },
        "tags": ["Marksman"],
        "partype": "MP",
        "stats": {
          "hp": 540.0,
          "hpperlevel": 85.0,
          "mp": 300.0,
          "mpperlevel": 35.0,
          "movespeed": 325.0,
          "armor": 20.0,
          "armorperlevel": 3.5,
          "spellblock": 30.0,
          "spellblockperlevel": 0.0,
          "attackrange": 500.0,
          "hpregen": 7.0,
          "hpregenperlevel": 0.55,
          "mpregen": 6.97,
          "mpregenperlevel": 0.4,
          "crit": 0.0,
          "critperlevel": 0.0,
          "attackdamage": 54.0,
          "attackdamageperlevel": 1.7,
          "attackspeedoffset": 0.0,
          "attackspeedperlevel": 2.5
        }
      },
      "Kled": {
        "version": "6.24.1",
        "id": "Kled",
        "key": "240",
        "name": "Kled",
        "title": "El Jinete Cascarrabias",
        "blurb": "''Un hombre cuerdo correría... ¡pero yo no soy de esos!''.<br><br>Kled, un guerrero tan intrépido como irascible, es un héroe popular en Noxus. Es la encarnación de la bravuconería de su pueblo y, por tanto, para los soldados del imperio es un icono, ...",
        "info": {
          "attack": 8,
          "defense": 2,
          "magic": 2,
          "difficulty": 7
        },
        "image": {
          "full": "Kled.png",
          "sprite": "champion4.png",
          "group": "champion",
          "x": 48,
          "y": 48,
          "w": 48,
          "h": 48
        },
        "tags": ["Fighter", "Tank"],
        "partype": "Gnarfury",
        "stats": {
          "hp": 340.0,
          "hpperlevel": 70.0,
          "mp": 100.0,
          "mpperlevel": 0.0,
          "movespeed": 345.0,
          "armor": 26.0,
          "armorperlevel": 4.0,
          "spellblock": 32.1,
          "spellblockperlevel": 1.25,
          "attackrange": 125.0,
          "hpregen": 6.0,
          "hpregenperlevel": 0.75,
          "mpregen": 0.0,
          "mpregenperlevel": 0.0,
          "crit": 0.0,
          "critperlevel": 0.0,
          "attackdamage": 55.0,
          "attackdamageperlevel": 3.0,
          "attackspeedoffset": 0.0,
          "attackspeedperlevel": 3.5
        }
      },
      "KogMaw": {
        "version": "6.24.1",
        "id": "KogMaw",
        "key": "96",
        "name": "Kog'Maw",
        "title": "La Boca del Abismo",
        "blurb": "''Si está así cuando simplemente tiene hambre, no quisiera ser yo quien lo viera enfadado.''<br><br>Cuando el profeta Malzahar renació en Icathia, había sido conducido allí por una voz ominosa que se aferró a su psique desde entonces. En su interior, ...",
        "info": {
          "attack": 8,
          "defense": 2,
          "magic": 5,
          "difficulty": 6
        },
        "image": {
          "full": "KogMaw.png",
          "sprite": "champion1.png",
          "group": "champion",
          "x": 192,
          "y": 96,
          "w": 48,
          "h": 48
        },
        "tags": ["Marksman", "Mage"],
        "partype": "MP",
        "stats": {
          "hp": 517.76,
          "hpperlevel": 82.0,
          "mp": 322.2,
          "mpperlevel": 40.0,
          "movespeed": 325.0,
          "armor": 19.88,
          "armorperlevel": 3.5,
          "spellblock": 30.0,
          "spellblockperlevel": 0.0,
          "attackrange": 500.0,
          "hpregen": 5.92,
          "hpregenperlevel": 0.55,
          "mpregen": 8.675,
          "mpregenperlevel": 0.7,
          "crit": 0.0,
          "critperlevel": 0.0,
          "attackdamage": 57.46,
          "attackdamageperlevel": 2.41,
          "attackspeedoffset": -0.06,
          "attackspeedperlevel": 2.65
        }
      },
      "Leblanc": {
        "version": "6.24.1",
        "id": "Leblanc",
        "key": "7",
        "name": "LeBlanc",
        "title": "La Embaucadora",
        "blurb": "Toda ciudad tiene su lado oscuro, incluso aquellas de dudosa reputación. Noxus, aunque su nombre se pronuncie con una mezcla de admiración y repugnancia, no es ninguna excepción a esta sencilla regla. En las entrañas de las tortuosas mazmorras que se ...",
        "info": {
          "attack": 1,
          "defense": 4,
          "magic": 10,
          "difficulty": 9
        },
        "image": {
          "full": "Leblanc.png",
          "sprite": "champion1.png",
          "group": "champion",
          "x": 240,
          "y": 96,
          "w": 48,
          "h": 48
        },
        "tags": ["Assassin", "Mage"],
        "partype": "MP",
        "stats": {
          "hp": 516.0,
          "hpperlevel": 80.0,
          "mp": 334.0,
          "mpperlevel": 50.0,
          "movespeed": 340.0,
          "armor": 21.88,
          "armorperlevel": 3.5,
          "spellblock": 30.0,
          "spellblockperlevel": 0.0,
          "attackrange": 525.0,
          "hpregen": 7.4,
          "hpregenperlevel": 0.55,
          "mpregen": 6.0,
          "mpregenperlevel": 0.8,
          "crit": 0.0,
          "critperlevel": 0.0,
          "attackdamage": 54.88,
          "attackdamageperlevel": 3.5,
          "attackspeedoffset": 0.0,
          "attackspeedperlevel": 1.4
        }
      },
      "LeeSin": {
        "version": "6.24.1",
        "id": "LeeSin",
        "key": "64",
        "name": "Lee Sin",
        "title": "El Monje Ciego",
        "blurb": "Desde adolescente, Lee Sin estaba decidido a convertirse en invocador. Su voluntad y dedicación no tenían parangón y su habilidad atrajo la atención de Reginald Ashram, el Alto Consejero de la Liga por ese entonces. Mientras estudiaba en el Arcanum ...",
        "info": {
          "attack": 8,
          "defense": 5,
          "magic": 3,
          "difficulty": 6
        },
        "image": {
          "full": "LeeSin.png",
          "sprite": "champion1.png",
          "group": "champion",
          "x": 288,
          "y": 96,
          "w": 48,
          "h": 48
        },
        "tags": ["Fighter", "Assassin"],
        "partype": "Energy",
        "stats": {
          "hp": 570.8,
          "hpperlevel": 85.0,
          "mp": 200.0,
          "mpperlevel": 0.0,
          "movespeed": 350.0,
          "armor": 24.216,
          "armorperlevel": 3.7,
          "spellblock": 32.1,
          "spellblockperlevel": 1.25,
          "attackrange": 125.0,
          "hpregen": 7.425,
          "hpregenperlevel": 0.7,
          "mpregen": 50.0,
          "mpregenperlevel": 0.0,
          "crit": 0.0,
          "critperlevel": 0.0,
          "attackdamage": 61.176,
          "attackdamageperlevel": 3.2,
          "attackspeedoffset": -0.04,
          "attackspeedperlevel": 3.0
        }
      },
      "Leona": {
        "version": "6.24.1",
        "id": "Leona",
        "key": "89",
        "name": "Leona",
        "title": "El Amanecer Radiante",
        "blurb": "''Para brillar como un sol, primero debes arder como uno.''<br><br>Imbuida del fuego del sol, Leona es una guerrera templaria de los Solari que defiende el monte Targon con su Hoja del cénit y su Escudo del amanecer. Su piel brilla como las estrellas ...",
        "info": {
          "attack": 4,
          "defense": 8,
          "magic": 3,
          "difficulty": 4
        },
        "image": {
          "full": "Leona.png",
          "sprite": "champion1.png",
          "group": "champion",
          "x": 336,
          "y": 96,
          "w": 48,
          "h": 48
        },
        "tags": ["Tank", "Support"],
        "partype": "MP",
        "stats": {
          "hp": 576.16,
          "hpperlevel": 87.0,
          "mp": 302.2,
          "mpperlevel": 40.0,
          "movespeed": 335.0,
          "armor": 27.208,
          "armorperlevel": 3.6,
          "spellblock": 32.1,
          "spellblockperlevel": 1.25,
          "attackrange": 125.0,
          "hpregen": 8.425,
          "hpregenperlevel": 0.85,
          "mpregen": 6.0,
          "mpregenperlevel": 0.8,
          "crit": 0.0,
          "critperlevel": 0.0,
          "attackdamage": 60.04,
          "attackdamageperlevel": 3.0,
          "attackspeedoffset": 0.0,
          "attackspeedperlevel": 2.9
        }
      },
      "Lissandra": {
        "version": "6.24.1",
        "id": "Lissandra",
        "key": "127",
        "name": "Lissandra",
        "title": "La Bruja de Hielo",
        "blurb": "La magia de Lissandra convierte el poder del hielo en algo oscuro y terrible. Con la fuerza de su hielo negro, además de congelar a aquellos que se le oponen, los empala y los destruye sin mostrar piedad. Se la conoce como ''la Bruja de Hielo'' entre ...",
        "info": {
          "attack": 2,
          "defense": 5,
          "magic": 8,
          "difficulty": 6
        },
        "image": {
          "full": "Lissandra.png",
          "sprite": "champion1.png",
          "group": "champion",
          "x": 384,
          "y": 96,
          "w": 48,
          "h": 48
        },
        "tags": ["Mage"],
        "partype": "MP",
        "stats": {
          "hp": 506.12,
          "hpperlevel": 75.0,
          "mp": 304.0,
          "mpperlevel": 50.0,
          "movespeed": 325.0,
          "armor": 20.216,
          "armorperlevel": 3.7,
          "spellblock": 30.0,
          "spellblockperlevel": 0.0,
          "attackrange": 550.0,
          "hpregen": 6.92,
          "hpregenperlevel": 0.55,
          "mpregen": 5.67,
          "mpregenperlevel": 0.4,
          "crit": 0.0,
          "critperlevel": 0.0,
          "attackdamage": 50.536,
          "attackdamageperlevel": 2.7,
          "attackspeedoffset": 0.0,
          "attackspeedperlevel": 1.36
        }
      },
      "Lucian": {
        "version": "6.24.1",
        "id": "Lucian",
        "key": "236",
        "name": "Lucian",
        "title": "El Destello Purificador",
        "blurb": "Gracias a sus armas imbuidas con poder arcano, Lucian se mantiene firme como guardián ante los no muertos. Su sangre fría nunca flaquea, incluso ante el rostro de los exasperantes horrores que destruye con su llama de fuego purificador. Lucian es un ...",
        "info": {
          "attack": 8,
          "defense": 5,
          "magic": 3,
          "difficulty": 6
        },
        "image": {
          "full": "Lucian.png",
          "sprite": "champion1.png",
          "group": "champion",
          "x": 432,
          "y": 96,
          "w": 48,
          "h": 48
        },
        "tags": ["Marksman"],
        "partype": "MP",
        "stats": {
          "hp": 554.4,
          "hpperlevel": 80.0,
          "mp": 348.88,
          "mpperlevel": 38.0,
          "movespeed": 335.0,
          "armor": 24.04,
          "armorperlevel": 3.0,
          "spellblock": 30.0,
          "spellblockperlevel": 0.0,
          "attackrange": 500.0,
          "hpregen": 6.19,
          "hpregenperlevel": 0.65,
          "mpregen": 8.175,
          "mpregenperlevel": 0.7,
          "crit": 0.0,
          "critperlevel": 0.0,
          "attackdamage": 57.46,
          "attackdamageperlevel": 2.41,
          "attackspeedoffset": -0.02,
          "attackspeedperlevel": 3.3
        }
      },
      "Lulu": {
        "version": "6.24.1",
        "id": "Lulu",
        "key": "117",
        "name": "Lulu",
        "title": "El Hada Hechicera",
        "blurb": "Lulu marcha al ritmo de su propio tambor, casi más que cualquier otro campeón de la Liga de Leyendas. Durante su juventud en Ciudad de Bandle, pasó la mayor parte del tiempo deambulando sola por el bosque o perdida en sus fantasías. No es que fuera ...",
        "info": {
          "attack": 4,
          "defense": 5,
          "magic": 7,
          "difficulty": 5
        },
        "image": {
          "full": "Lulu.png",
          "sprite": "champion2.png",
          "group": "champion",
          "x": 0,
          "y": 0,
          "w": 48,
          "h": 48
        },
        "tags": ["Support", "Mage"],
        "partype": "MP",
        "stats": {
          "hp": 552.76,
          "hpperlevel": 74.0,
          "mp": 350.0,
          "mpperlevel": 55.0,
          "movespeed": 330.0,
          "armor": 19.216,
          "armorperlevel": 3.7,
          "spellblock": 30.0,
          "spellblockperlevel": 0.0,
          "attackrange": 550.0,
          "hpregen": 6.005,
          "hpregenperlevel": 0.6,
          "mpregen": 11.0,
          "mpregenperlevel": 0.6,
          "crit": 0.0,
          "critperlevel": 0.0,
          "attackdamage": 46.368,
          "attackdamageperlevel": 2.6,
          "attackspeedoffset": 0.0,
          "attackspeedperlevel": 2.25
        }
      },
      "Lux": {
        "version": "6.24.1",
        "id": "Lux",
        "key": "99",
        "name": "Lux",
        "title": "La Dama Luminosa",
        "blurb": "Luxanna, nacida en el seno de la prestigiosa familia Crownguard, un linaje ejemplar al servicio de Demacia, estaba destinada a hacer grandes cosas. Única hija del clan, disfrutó de una educación superior y de las suntuosas fiestas que acostumbraban a ...",
        "info": {
          "attack": 2,
          "defense": 4,
          "magic": 9,
          "difficulty": 5
        },
        "image": {
          "full": "Lux.png",
          "sprite": "champion2.png",
          "group": "champion",
          "x": 48,
          "y": 0,
          "w": 48,
          "h": 48
        },
        "tags": ["Mage", "Support"],
        "partype": "MP",
        "stats": {
          "hp": 477.72,
          "hpperlevel": 79.0,
          "mp": 384.0,
          "mpperlevel": 47.0,
          "movespeed": 330.0,
          "armor": 18.72,
          "armorperlevel": 4.0,
          "spellblock": 30.0,
          "spellblockperlevel": 0.0,
          "attackrange": 550.0,
          "hpregen": 5.42,
          "hpregenperlevel": 0.55,
          "mpregen": 6.0,
          "mpregenperlevel": 0.8,
          "crit": 0.0,
          "critperlevel": 0.0,
          "attackdamage": 53.544,
          "attackdamageperlevel": 3.3,
          "attackspeedoffset": 0.0,
          "attackspeedperlevel": 1.36
        }
      },
      "Malphite": {
        "version": "6.24.1",
        "id": "Malphite",
        "key": "54",
        "name": "Malphite",
        "title": "El Fragmento del Monolito",
        "blurb": "Existe un mundo en perfecta armonía, donde todas las cosas forman parte de un todo. El Monolito es la esencia de toda la creación y sus moradores no son más que fragmentos singulares del conjunto. Es bello en su simetría y en su ausencia casi total de ...",
        "info": {
          "attack": 5,
          "defense": 9,
          "magic": 7,
          "difficulty": 2
        },
        "image": {
          "full": "Malphite.png",
          "sprite": "champion2.png",
          "group": "champion",
          "x": 96,
          "y": 0,
          "w": 48,
          "h": 48
        },
        "tags": ["Tank", "Fighter"],
        "partype": "MP",
        "stats": {
          "hp": 574.2,
          "hpperlevel": 90.0,
          "mp": 282.2,
          "mpperlevel": 40.0,
          "movespeed": 335.0,
          "armor": 28.3,
          "armorperlevel": 3.75,
          "spellblock": 32.1,
          "spellblockperlevel": 1.25,
          "attackrange": 125.0,
          "hpregen": 7.0,
          "hpregenperlevel": 0.55,
          "mpregen": 7.32,
          "mpregenperlevel": 0.55,
          "crit": 0.0,
          "critperlevel": 0.0,
          "attackdamage": 61.97,
          "attackdamageperlevel": 3.375,
          "attackspeedoffset": -0.02,
          "attackspeedperlevel": 3.4
        }
      },
      "Malzahar": {
        "version": "6.24.1",
        "id": "Malzahar",
        "key": "90",
        "name": "Malzahar",
        "title": "El Profeta del Vacío",
        "blurb": "Son muchos los hombres que han perdido la razón bajo el inclemente sol de Shurima; sin embargo, fue el helador abrazo de la noche el que le robó la cordura a Malzahar, un vidente nacido con el don de la profecía. Su talento, pese a no haberlo refinado ...",
        "info": {
          "attack": 2,
          "defense": 2,
          "magic": 9,
          "difficulty": 6
        },
        "image": {
          "full": "Malzahar.png",
          "sprite": "champion2.png",
          "group": "champion",
          "x": 144,
          "y": 0,
          "w": 48,
          "h": 48
        },
        "tags": ["Mage", "Assassin"],
        "partype": "MP",
        "stats": {
          "hp": 525.0,
          "hpperlevel": 75.0,
          "mp": 300.0,
          "mpperlevel": 55.0,
          "movespeed": 335.0,
          "armor": 20.0,
          "armorperlevel": 3.5,
          "spellblock": 30.0,
          "spellblockperlevel": 0.0,
          "attackrange": 500.0,
          "hpregen": 6.0,
          "hpregenperlevel": 0.6,
          "mpregen": 6.0,
          "mpregenperlevel": 0.8,
          "crit": 0.0,
          "critperlevel": 0.0,
          "attackdamage": 55.0,
          "attackdamageperlevel": 3.0,
          "attackspeedoffset": 0.0,
          "attackspeedperlevel": 1.5
        }
      },
      "Maokai": {
        "version": "6.24.1",
        "id": "Maokai",
        "key": "57",
        "name": "Maokai",
        "title": "El Treant Retorcido",
        "blurb": "''Me rodean carcasas vacías, sin alma e impasibles... pero yo haré que teman''.<br><br>Maokai es un imponente y feroz treant que lucha contra los horrores antinaturales de las Islas de la Sombra. Las ansias de venganza le inundaron después de que un ...",
        "info": {
          "attack": 3,
          "defense": 8,
          "magic": 6,
          "difficulty": 3
        },
        "image": {
          "full": "Maokai.png",
          "sprite": "champion2.png",
          "group": "champion",
          "x": 192,
          "y": 0,
          "w": 48,
          "h": 48
        },
        "tags": ["Tank", "Mage"],
        "partype": "MP",
        "stats": {
          "hp": 572.2,
          "hpperlevel": 90.0,
          "mp": 377.28,
          "mpperlevel": 43.0,
          "movespeed": 335.0,
          "armor": 28.72,
          "armorperlevel": 4.0,
          "spellblock": 32.1,
          "spellblockperlevel": 1.25,
          "attackrange": 125.0,
          "hpregen": 7.0,
          "hpregenperlevel": 0.75,
          "mpregen": 7.205,
          "mpregenperlevel": 0.45,
          "crit": 0.0,
          "critperlevel": 0.0,
          "attackdamage": 63.544,
          "attackdamageperlevel": 3.3,
          "attackspeedoffset": -0.1,
          "attackspeedperlevel": 2.125
        }
      },
      "MasterYi": {
        "version": "6.24.1",
        "id": "MasterYi",
        "key": "11",
        "name": "Maestro Yi",
        "title": "El Espadachín Wuju",
        "blurb": "A través del ancestral arte marcial del Wuju, el Maestro Yi ha moldeado su cuerpo y aguzado sus sentidos hasta que pensamiento y acción se volvieron la misma cosa. Aunque solo recurre a la violencia como último recurso, la gracia y la velocidad con ...",
        "info": {
          "attack": 10,
          "defense": 4,
          "magic": 2,
          "difficulty": 4
        },
        "image": {
          "full": "MasterYi.png",
          "sprite": "champion2.png",
          "group": "champion",
          "x": 240,
          "y": 0,
          "w": 48,
          "h": 48
        },
        "tags": ["Assassin", "Fighter"],
        "partype": "MP",
        "stats": {
          "hp": 598.56,
          "hpperlevel": 92.0,
          "mp": 250.56,
          "mpperlevel": 42.0,
          "movespeed": 355.0,
          "armor": 24.04,
          "armorperlevel": 3.0,
          "spellblock": 32.1,
          "spellblockperlevel": 1.25,
          "attackrange": 125.0,
          "hpregen": 7.59,
          "hpregenperlevel": 0.65,
          "mpregen": 7.255,
          "mpregenperlevel": 0.45,
          "crit": 0.0,
          "critperlevel": 0.0,
          "attackdamage": 60.04,
          "attackdamageperlevel": 3.0,
          "attackspeedoffset": -0.08,
          "attackspeedperlevel": 2.0
        }
      },
      "MissFortune": {
        "version": "6.24.1",
        "id": "MissFortune",
        "key": "21",
        "name": "Miss Fortune",
        "title": "La Cazarrecompensas",
        "blurb": "''Cuanto mayor sea el riesgo, mayor es la recompensa.''<br><br>Belleza y peligro: pocos hay que puedan compararse a Miss Fortune en ambos. Esta cazarrecompensas, una de las más famosas de Aguas Estancadas, ha erigido su leyenda sobre un reguero de ...",
        "info": {
          "attack": 8,
          "defense": 2,
          "magic": 5,
          "difficulty": 1
        },
        "image": {
          "full": "MissFortune.png",
          "sprite": "champion2.png",
          "group": "champion",
          "x": 288,
          "y": 0,
          "w": 48,
          "h": 48
        },
        "tags": ["Marksman"],
        "partype": "MP",
        "stats": {
          "hp": 530.0,
          "hpperlevel": 85.0,
          "mp": 325.84,
          "mpperlevel": 35.0,
          "movespeed": 325.0,
          "armor": 24.04,
          "armorperlevel": 3.0,
          "spellblock": 30.0,
          "spellblockperlevel": 0.0,
          "attackrange": 550.0,
          "hpregen": 6.19,
          "hpregenperlevel": 0.65,
          "mpregen": 8.04,
          "mpregenperlevel": 0.65,
          "crit": 0.0,
          "critperlevel": 0.0,
          "attackdamage": 46.0,
          "attackdamageperlevel": 1.0,
          "attackspeedoffset": -0.04734,
          "attackspeedperlevel": 3.0
        }
      },
      "MonkeyKing": {
        "version": "6.24.1",
        "id": "MonkeyKing",
        "key": "62",
        "name": "Wukong",
        "title": "El Rey Mono",
        "blurb": "Durante el caos de las Guerras Rúnicas, una enorme piedra rúnica se perdió en el corazón de las Selvas de la Peste. Durante siglos permaneció allí, intacta, emanando una poderosa magia que infundía inteligencia y vitalidad a las criaturas que moraban ...",
        "info": {
          "attack": 8,
          "defense": 5,
          "magic": 2,
          "difficulty": 3
        },
        "image": {
          "full": "MonkeyKing.png",
          "sprite": "champion2.png",
          "group": "champion",
          "x": 336,
          "y": 0,
          "w": 48,
          "h": 48
        },
        "tags": ["Fighter", "Tank"],
        "partype": "MP",
        "stats": {
          "hp": 577.8,
          "hpperlevel": 85.0,
          "mp": 265.84,
          "mpperlevel": 38.0,
          "movespeed": 345.0,
          "armor": 24.88,
          "armorperlevel": 3.5,
          "spellblock": 32.1,
          "spellblockperlevel": 1.25,
          "attackrange": 175.0,
          "hpregen": 6.19,
          "hpregenperlevel": 0.65,
          "mpregen": 8.04,
          "mpregenperlevel": 0.65,
          "crit": 0.0,
          "critperlevel": 0.0,
          "attackdamage": 59.876,
          "attackdamageperlevel": 3.2,
          "attackspeedoffset": -0.05,
          "attackspeedperlevel": 3.0
        }
      },
      "Mordekaiser": {
        "version": "6.24.1",
        "id": "Mordekaiser",
        "key": "82",
        "name": "Mordekaiser",
        "title": "La Pesadilla de Hierro",
        "blurb": "''Todas las cosas deben morir... mas yo sigo con vida.''<br><br>El luctuoso muerto viviente conocido como Mordekaiser es uno de los más aterradores y odiosos espíritus de las Islas de la Sombra. Lleva incontables siglos en el mundo, protegido frente a ...",
        "info": {
          "attack": 4,
          "defense": 6,
          "magic": 7,
          "difficulty": 4
        },
        "image": {
          "full": "Mordekaiser.png",
          "sprite": "champion2.png",
          "group": "champion",
          "x": 384,
          "y": 0,
          "w": 48,
          "h": 48
        },
        "tags": ["Fighter"],
        "partype": "None",
        "stats": {
          "hp": 525.0,
          "hpperlevel": 73.0,
          "mp": 0.0,
          "mpperlevel": 0.0,
          "movespeed": 325.0,
          "armor": 20.0,
          "armorperlevel": 3.75,
          "spellblock": 32.1,
          "spellblockperlevel": 1.25,
          "attackrange": 175.0,
          "hpregen": 4.0,
          "hpregenperlevel": 0.3,
          "mpregen": 0.0,
          "mpregenperlevel": 0.0,
          "crit": 0.0,
          "critperlevel": 0.0,
          "attackdamage": 61.0,
          "attackdamageperlevel": 5.0,
          "attackspeedoffset": 0.04,
          "attackspeedperlevel": 2.2
        }
      },
      "Morgana": {
        "version": "6.24.1",
        "id": "Morgana",
        "key": "25",
        "name": "Morgana",
        "title": "El Ángel Caído",
        "blurb": "Muy lejos de aquí existe un mundo habitado por bellas y elegantes criaturas aladas con el don de la inmortalidad en el que continúa vivo un conflicto ancestral. Como sucede en tantos conflictos, éste ha dividido familias. En uno de los bandos se ...",
        "info": {
          "attack": 1,
          "defense": 6,
          "magic": 8,
          "difficulty": 1
        },
        "image": {
          "full": "Morgana.png",
          "sprite": "champion2.png",
          "group": "champion",
          "x": 432,
          "y": 0,
          "w": 48,
          "h": 48
        },
        "tags": ["Mage", "Support"],
        "partype": "MP",
        "stats": {
          "hp": 547.48,
          "hpperlevel": 86.0,
          "mp": 340.8,
          "mpperlevel": 60.0,
          "movespeed": 335.0,
          "armor": 25.384,
          "armorperlevel": 3.8,
          "spellblock": 30.0,
          "spellblockperlevel": 0.0,
          "attackrange": 450.0,
          "hpregen": 5.705,
          "hpregenperlevel": 0.6,
          "mpregen": 8.5,
          "mpregenperlevel": 0.8,
          "crit": 0.0,
          "critperlevel": 0.0,
          "attackdamage": 55.46,
          "attackdamageperlevel": 3.5,
          "attackspeedoffset": 0.0,
          "attackspeedperlevel": 1.53
        }
      },
      "Nami": {
        "version": "6.24.1",
        "id": "Nami",
        "key": "267",
        "name": "Nami",
        "title": "La Invocadora de Mareas",
        "blurb": "Nami concentra las energías del océano, abrazando las propiedades reconstituyentes místicas del agua y controlando el poder de las mismísimas mareas. Aunque muchos dudaban de ella, Nami tuvo el valor y la determinación para afrontar una difícil misión ...",
        "info": {
          "attack": 4,
          "defense": 3,
          "magic": 7,
          "difficulty": 5
        },
        "image": {
          "full": "Nami.png",
          "sprite": "champion2.png",
          "group": "champion",
          "x": 0,
          "y": 48,
          "w": 48,
          "h": 48
        },
        "tags": ["Support", "Mage"],
        "partype": "MP",
        "stats": {
          "hp": 489.32,
          "hpperlevel": 74.0,
          "mp": 377.24,
          "mpperlevel": 43.0,
          "movespeed": 335.0,
          "armor": 19.72,
          "armorperlevel": 4.0,
          "spellblock": 30.0,
          "spellblockperlevel": 0.0,
          "attackrange": 550.0,
          "hpregen": 5.42,
          "hpregenperlevel": 0.55,
          "mpregen": 11.5,
          "mpregenperlevel": 0.4,
          "crit": 0.0,
          "critperlevel": 0.0,
          "attackdamage": 51.208,
          "attackdamageperlevel": 3.1,
          "attackspeedoffset": -0.03,
          "attackspeedperlevel": 2.61
        }
      },
      "Nasus": {
        "version": "6.24.1",
        "id": "Nasus",
        "key": "75",
        "name": "Nasus",
        "title": "El Guardián de las Arenas",
        "blurb": "''Lo que se hundió será grande de nuevo.''<br><br>Nasus es un imponente ser Ascendido con cabeza de chacal procedente de la antigua Shurima; una figura heroica a la que las gentes del desierto han encumbrado al nivel de semidiós. Poseedor de una ...",
        "info": {
          "attack": 7,
          "defense": 5,
          "magic": 6,
          "difficulty": 6
        },
        "image": {
          "full": "Nasus.png",
          "sprite": "champion2.png",
          "group": "champion",
          "x": 48,
          "y": 48,
          "w": 48,
          "h": 48
        },
        "tags": ["Fighter", "Tank"],
        "partype": "MP",
        "stats": {
          "hp": 561.2,
          "hpperlevel": 90.0,
          "mp": 325.6,
          "mpperlevel": 42.0,
          "movespeed": 350.0,
          "armor": 24.88,
          "armorperlevel": 3.5,
          "spellblock": 32.1,
          "spellblockperlevel": 1.25,
          "attackrange": 125.0,
          "hpregen": 9.01,
          "hpregenperlevel": 0.9,
          "mpregen": 7.44,
          "mpregenperlevel": 0.5,
          "crit": 0.0,
          "critperlevel": 0.0,
          "attackdamage": 59.18,
          "attackdamageperlevel": 3.5,
          "attackspeedoffset": -0.02,
          "attackspeedperlevel": 3.48
        }
      },
      "Nautilus": {
        "version": "6.24.1",
        "id": "Nautilus",
        "key": "111",
        "name": "Nautilus",
        "title": "El Titán Abisal",
        "blurb": "Nautilus era marinero y la Academia de la Guerra le encargó explorar las remotas profundidades del Mar del Guardián. Esta expedición lo arrojó hacia aguas desconocidas donde él y su tripulación encontraron una vasta sección de un oscuro líquido ...",
        "info": {
          "attack": 4,
          "defense": 6,
          "magic": 6,
          "difficulty": 6
        },
        "image": {
          "full": "Nautilus.png",
          "sprite": "champion2.png",
          "group": "champion",
          "x": 96,
          "y": 48,
          "w": 48,
          "h": 48
        },
        "tags": ["Tank", "Fighter"],
        "partype": "MP",
        "stats": {
          "hp": 576.48,
          "hpperlevel": 86.0,
          "mp": 334.0,
          "mpperlevel": 47.0,
          "movespeed": 325.0,
          "armor": 26.46,
          "armorperlevel": 3.75,
          "spellblock": 32.1,
          "spellblockperlevel": 1.25,
          "attackrange": 175.0,
          "hpregen": 8.37,
          "hpregenperlevel": 0.55,
          "mpregen": 8.625,
          "mpregenperlevel": 0.7,
          "crit": 0.0,
          "critperlevel": 0.0,
          "attackdamage": 57.544,
          "attackdamageperlevel": 3.3,
          "attackspeedoffset": 0.02,
          "attackspeedperlevel": 1.0
        }
      },
      "Nidalee": {
        "version": "6.24.1",
        "id": "Nidalee",
        "key": "76",
        "name": "Nidalee",
        "title": "La Cazadora Bestial",
        "blurb": "Muy pocos residen en las peligrosas y malditas tierras al sur de la Gran Barrera, y mucho menos campeones. Gran parte de ese mundo aún lleva las cicatrices de las pasadas Guerras Rúnicas, en especial la misteriosa selva de Kumungu. En estos extraños ...",
        "info": {
          "attack": 5,
          "defense": 4,
          "magic": 7,
          "difficulty": 8
        },
        "image": {
          "full": "Nidalee.png",
          "sprite": "champion2.png",
          "group": "champion",
          "x": 144,
          "y": 48,
          "w": 48,
          "h": 48
        },
        "tags": ["Assassin", "Fighter"],
        "partype": "MP",
        "stats": {
          "hp": 511.2,
          "hpperlevel": 80.0,
          "mp": 295.6,
          "mpperlevel": 45.0,
          "movespeed": 335.0,
          "armor": 22.88,
          "armorperlevel": 3.5,
          "spellblock": 30.0,
          "spellblockperlevel": 0.0,
          "attackrange": 525.0,
          "hpregen": 6.005,
          "hpregenperlevel": 0.6,
          "mpregen": 6.0,
          "mpregenperlevel": 0.8,
          "crit": 0.0,
          "critperlevel": 0.0,
          "attackdamage": 53.0,
          "attackdamageperlevel": 3.5,
          "attackspeedoffset": -0.02,
          "attackspeedperlevel": 3.22
        }
      },
      "Nocturne": {
        "version": "6.24.1",
        "id": "Nocturne",
        "key": "56",
        "name": "Nocturne",
        "title": "La Pesadilla Eterna",
        "blurb": "Antes de Nocturne, la gente creía que los sueños eran un producto de su imaginación, imágenes sin sentido que destellaban en la mente mientras uno dormía. Se empezó a dudar de esta creencia cuando tuvo lugar una serie de incidentes relacionados con el ...",
        "info": {
          "attack": 9,
          "defense": 5,
          "magic": 2,
          "difficulty": 4
        },
        "image": {
          "full": "Nocturne.png",
          "sprite": "champion2.png",
          "group": "champion",
          "x": 192,
          "y": 48,
          "w": 48,
          "h": 48
        },
        "tags": ["Assassin", "Fighter"],
        "partype": "MP",
        "stats": {
          "hp": 582.8,
          "hpperlevel": 85.0,
          "mp": 273.8,
          "mpperlevel": 35.0,
          "movespeed": 345.0,
          "armor": 26.88,
          "armorperlevel": 3.5,
          "spellblock": 32.1,
          "spellblockperlevel": 1.25,
          "attackrange": 125.0,
          "hpregen": 8.26,
          "hpregenperlevel": 0.75,
          "mpregen": 6.755,
          "mpregenperlevel": 0.45,
          "crit": 0.0,
          "critperlevel": 0.0,
          "attackdamage": 59.208,
          "attackdamageperlevel": 3.1,
          "attackspeedoffset": -0.065,
          "attackspeedperlevel": 2.7
        }
      },
      "Nunu": {
        "version": "6.24.1",
        "id": "Nunu",
        "key": "20",
        "name": "Nunu",
        "title": "El Jinete de Yetis",
        "blurb": "A veces ocurre que los lazos de la amistad son más fuertes que los de la sangre. Cuando esos lazos atan a un niño temerario con un Yeti temible, el vínculo se convierte en una fuerza que no se puede ignorar. Al recibir la responsabilidad de domar a ...",
        "info": {
          "attack": 4,
          "defense": 6,
          "magic": 7,
          "difficulty": 4
        },
        "image": {
          "full": "Nunu.png",
          "sprite": "champion2.png",
          "group": "champion",
          "x": 240,
          "y": 48,
          "w": 48,
          "h": 48
        },
        "tags": ["Support", "Fighter"],
        "partype": "MP",
        "stats": {
          "hp": 598.28,
          "hpperlevel": 90.0,
          "mp": 283.56,
          "mpperlevel": 42.0,
          "movespeed": 350.0,
          "armor": 26.38,
          "armorperlevel": 3.5,
          "spellblock": 32.1,
          "spellblockperlevel": 1.25,
          "attackrange": 125.0,
          "hpregen": 8.39,
          "hpregenperlevel": 0.8,
          "mpregen": 7.44,
          "mpregenperlevel": 0.5,
          "crit": 0.0,
          "critperlevel": 0.0,
          "attackdamage": 59.0,
          "attackdamageperlevel": 4.0,
          "attackspeedoffset": 0.0,
          "attackspeedperlevel": 2.25
        }
      },
      "Olaf": {
        "version": "6.24.1",
        "id": "Olaf",
        "key": "2",
        "name": "Olaf",
        "title": "El Berserker",
        "blurb": "La mayoría de los hombres diría que la muerte es temible, pero ninguno de ellos sería Olaf. El Berserker vive sólo para el rugido del grito de batalla y el choque del acero. Empujado por sus ansias de gloria y por el temor a ser olvidado al morir, ...",
        "info": {
          "attack": 9,
          "defense": 5,
          "magic": 3,
          "difficulty": 3
        },
        "image": {
          "full": "Olaf.png",
          "sprite": "champion2.png",
          "group": "champion",
          "x": 288,
          "y": 48,
          "w": 48,
          "h": 48
        },
        "tags": ["Fighter", "Tank"],
        "partype": "MP",
        "stats": {
          "hp": 597.24,
          "hpperlevel": 93.0,
          "mp": 315.6,
          "mpperlevel": 42.0,
          "movespeed": 350.0,
          "armor": 26.04,
          "armorperlevel": 3.0,
          "spellblock": 32.1,
          "spellblockperlevel": 1.25,
          "attackrange": 125.0,
          "hpregen": 8.51,
          "hpregenperlevel": 0.9,
          "mpregen": 7.465,
          "mpregenperlevel": 0.575,
          "crit": 0.0,
          "critperlevel": 0.0,
          "attackdamage": 59.98,
          "attackdamageperlevel": 3.5,
          "attackspeedoffset": -0.1,
          "attackspeedperlevel": 2.7
        }
      },
      "Orianna": {
        "version": "6.24.1",
        "id": "Orianna",
        "key": "61",
        "name": "Orianna",
        "title": "La Dama Mecánica",
        "blurb": "Había una vez un hombre de Piltover llamado Corin Reveck, que tenía una hija de nombre Orianna a la que quería más que a nada en el mundo. Pese a que Orianna poseía un talento increíble para el baile, se sentía fascinada por los campeones de la Liga ...",
        "info": {
          "attack": 4,
          "defense": 3,
          "magic": 9,
          "difficulty": 7
        },
        "image": {
          "full": "Orianna.png",
          "sprite": "champion2.png",
          "group": "champion",
          "x": 336,
          "y": 48,
          "w": 48,
          "h": 48
        },
        "tags": ["Mage", "Support"],
        "partype": "MP",
        "stats": {
          "hp": 517.72,
          "hpperlevel": 79.0,
          "mp": 334.0,
          "mpperlevel": 50.0,
          "movespeed": 325.0,
          "armor": 17.04,
          "armorperlevel": 3.0,
          "spellblock": 30.0,
          "spellblockperlevel": 0.0,
          "attackrange": 525.0,
          "hpregen": 6.87,
          "hpregenperlevel": 0.55,
          "mpregen": 6.0,
          "mpregenperlevel": 0.8,
          "crit": 0.0,
          "critperlevel": 0.0,
          "attackdamage": 40.368,
          "attackdamageperlevel": 2.6,
          "attackspeedoffset": -0.05,
          "attackspeedperlevel": 3.5
        }
      },
      "Pantheon": {
        "version": "6.24.1",
        "id": "Pantheon",
        "key": "80",
        "name": "Pantheon",
        "title": "El Artesano de la Guerra",
        "blurb": "''Tráeme a un campeón de verdad o a cien más como tú, y se hablará de nuestra batalla hasta el fin de los tiempos.''<br><br>El guerrero sin par conocido como Pantheon es un batallador modélico y prácticamente imparable. Nació entre los rakkor, una ...",
        "info": {
          "attack": 9,
          "defense": 4,
          "magic": 3,
          "difficulty": 4
        },
        "image": {
          "full": "Pantheon.png",
          "sprite": "champion2.png",
          "group": "champion",
          "x": 384,
          "y": 48,
          "w": 48,
          "h": 48
        },
        "tags": ["Fighter", "Assassin"],
        "partype": "MP",
        "stats": {
          "hp": 579.16,
          "hpperlevel": 87.0,
          "mp": 317.12,
          "mpperlevel": 31.0,
          "movespeed": 355.0,
          "armor": 27.652,
          "armorperlevel": 3.9,
          "spellblock": 32.1,
          "spellblockperlevel": 1.25,
          "attackrange": 150.0,
          "hpregen": 7.84,
          "hpregenperlevel": 0.65,
          "mpregen": 7.355,
          "mpregenperlevel": 0.45,
          "crit": 0.0,
          "critperlevel": 0.0,
          "attackdamage": 55.572,
          "attackdamageperlevel": 2.9,
          "attackspeedoffset": -0.03,
          "attackspeedperlevel": 2.95
        }
      },
      "Poppy": {
        "version": "6.24.1",
        "id": "Poppy",
        "key": "78",
        "name": "Poppy",
        "title": "La Guardiana del Martillo",
        "blurb": "''No soy ninguna heroína. Solo una yordle con un martillo.''<br><br>En Runaterra hay un gran número de campeones valerosos, pero muy pocos son tan tenaces como Poppy. Esta yordle tan obstinada porta un martillo del doble de su tamaño y se ha pasado ...",
        "info": {
          "attack": 6,
          "defense": 7,
          "magic": 2,
          "difficulty": 6
        },
        "image": {
          "full": "Poppy.png",
          "sprite": "champion2.png",
          "group": "champion",
          "x": 432,
          "y": 48,
          "w": 48,
          "h": 48
        },
        "tags": ["Tank", "Fighter"],
        "partype": "MP",
        "stats": {
          "hp": 540.0,
          "hpperlevel": 90.0,
          "mp": 280.0,
          "mpperlevel": 40.0,
          "movespeed": 345.0,
          "armor": 29.0,
          "armorperlevel": 3.5,
          "spellblock": 32.0,
          "spellblockperlevel": 1.25,
          "attackrange": 125.0,
          "hpregen": 8.0,
          "hpregenperlevel": 0.8,
          "mpregen": 7.0,
          "mpregenperlevel": 0.7,
          "crit": 0.0,
          "critperlevel": 0.0,
          "attackdamage": 56.0,
          "attackdamageperlevel": 4.0,
          "attackspeedoffset": 0.0,
          "attackspeedperlevel": 2.5
        }
      },
      "Quinn": {
        "version": "6.24.1",
        "id": "Quinn",
        "key": "133",
        "name": "Quinn",
        "title": "Las Alas de Demacia",
        "blurb": "Quinn y Valor son un equipo de combate del más alto nivel. Con su ballesta y su garra, aceptan las misiones más peligrosas de su nación, adentrándose en lo más profundo del territorio enemigo para realizar pequeños reconocimientos o llevar a cabo ...",
        "info": {
          "attack": 9,
          "defense": 4,
          "magic": 2,
          "difficulty": 5
        },
        "image": {
          "full": "Quinn.png",
          "sprite": "champion2.png",
          "group": "champion",
          "x": 0,
          "y": 96,
          "w": 48,
          "h": 48
        },
        "tags": ["Marksman", "Fighter"],
        "partype": "MP",
        "stats": {
          "hp": 532.8,
          "hpperlevel": 85.0,
          "mp": 268.8,
          "mpperlevel": 35.0,
          "movespeed": 335.0,
          "armor": 23.38,
          "armorperlevel": 3.5,
          "spellblock": 30.0,
          "spellblockperlevel": 0.0,
          "attackrange": 525.0,
          "hpregen": 5.42,
          "hpregenperlevel": 0.55,
          "mpregen": 6.97,
          "mpregenperlevel": 0.4,
          "crit": 0.0,
          "critperlevel": 0.0,
          "attackdamage": 54.46,
          "attackdamageperlevel": 2.41,
          "attackspeedoffset": -0.065,
          "attackspeedperlevel": 3.1
        }
      },
      "Rammus": {
        "version": "6.24.1",
        "id": "Rammus",
        "key": "33",
        "name": "Rammus",
        "title": "El Armadurillo",
        "blurb": "''Vale.''<br><br>Idealizado por muchos, ignorado por otros, inexplicable para todos, Rammus, el extraño ser, es todo un enigma. Protegido por un armazón de pinchos, Rammus inspira teorías cada vez más absurdas sobre sus orígenes allá donde va. Estas ...",
        "info": {
          "attack": 4,
          "defense": 10,
          "magic": 5,
          "difficulty": 5
        },
        "image": {
          "full": "Rammus.png",
          "sprite": "champion2.png",
          "group": "champion",
          "x": 48,
          "y": 96,
          "w": 48,
          "h": 48
        },
        "tags": ["Tank", "Fighter"],
        "partype": "MP",
        "stats": {
          "hp": 564.48,
          "hpperlevel": 86.0,
          "mp": 310.44,
          "mpperlevel": 33.0,
          "movespeed": 335.0,
          "armor": 31.384,
          "armorperlevel": 4.3,
          "spellblock": 32.1,
          "spellblockperlevel": 1.25,
          "attackrange": 125.0,
          "hpregen": 7.92,
          "hpregenperlevel": 0.55,
          "mpregen": 7.84,
          "mpregenperlevel": 0.5,
          "crit": 0.0,
          "critperlevel": 0.0,
          "attackdamage": 55.88,
          "attackdamageperlevel": 3.5,
          "attackspeedoffset": 0.0,
          "attackspeedperlevel": 2.215
        }
      },
      "RekSai": {
        "version": "6.24.1",
        "id": "RekSai",
        "key": "421",
        "name": "Rek'Sai",
        "title": "La Amenaza Subterránea",
        "blurb": "La más grande y feroz de su especie, Rek'Sai es una cruel predadora que crea túneles por la tierra para emboscar y devorar a sus presas. Su insaciable hambre ha sembrado la destrucción en regiones enteras del antiguo imperio de Shurima. Mercaderes y ...",
        "info": {
          "attack": 8,
          "defense": 5,
          "magic": 2,
          "difficulty": 3
        },
        "image": {
          "full": "RekSai.png",
          "sprite": "champion2.png",
          "group": "champion",
          "x": 96,
          "y": 96,
          "w": 48,
          "h": 48
        },
        "tags": ["Fighter"],
        "partype": "Battlefury",
        "stats": {
          "hp": 570.0,
          "hpperlevel": 90.0,
          "mp": 100.0,
          "mpperlevel": 0.0,
          "movespeed": 335.0,
          "armor": 24.0,
          "armorperlevel": 3.4,
          "spellblock": 32.1,
          "spellblockperlevel": 1.25,
          "attackrange": 175.0,
          "hpregen": 7.34,
          "hpregenperlevel": 0.65,
          "mpregen": 0.0,
          "mpregenperlevel": 0.0,
          "crit": 0.0,
          "critperlevel": 0.0,
          "attackdamage": 55.628,
          "attackdamageperlevel": 3.35,
          "attackspeedoffset": 0.0,
          "attackspeedperlevel": 2.0
        }
      },
      "Renekton": {
        "version": "6.24.1",
        "id": "Renekton",
        "key": "58",
        "name": "Renekton",
        "title": "El Carnicero de las Arenas",
        "blurb": "''Sangre y venganza.''<br><br>Renekton es una terrorífica criatura Ascendida movida por la ira y procedente de los desiertos abrasadores de Shurima. En su día fue el guerrero más admirado del imperio, un líder que condujo a los ejércitos shurimanos a ...",
        "info": {
          "attack": 8,
          "defense": 5,
          "magic": 2,
          "difficulty": 3
        },
        "image": {
          "full": "Renekton.png",
          "sprite": "champion2.png",
          "group": "champion",
          "x": 144,
          "y": 96,
          "w": 48,
          "h": 48
        },
        "tags": ["Fighter", "Tank"],
        "partype": "Rage",
        "stats": {
          "hp": 572.16,
          "hpperlevel": 87.0,
          "mp": 100.0,
          "mpperlevel": 0.0,
          "movespeed": 345.0,
          "armor": 25.584,
          "armorperlevel": 3.8,
          "spellblock": 32.1,
          "spellblockperlevel": 1.25,
          "attackrange": 125.0,
          "hpregen": 7.96,
          "hpregenperlevel": 0.75,
          "mpregen": 0.0,
          "mpregenperlevel": 0.0,
          "crit": 0.0,
          "critperlevel": 0.0,
          "attackdamage": 58.328,
          "attackdamageperlevel": 3.1,
          "attackspeedoffset": -0.06,
          "attackspeedperlevel": 2.65
        }
      },
      "Rengar": {
        "version": "6.24.1",
        "id": "Rengar",
        "key": "107",
        "name": "Rengar",
        "title": "El Acechador Orgulloso",
        "blurb": "Distribuidos por todas las paredes de su guarida, el cazador de trofeos Rengar tiene los cuernos, garras, cabezas y colmillos de las criaturas más letales de Valoran. Aunque su colección es enorme, Rengar no está satisfecho y sigue buscando ...",
        "info": {
          "attack": 7,
          "defense": 4,
          "magic": 2,
          "difficulty": 8
        },
        "image": {
          "full": "Rengar.png",
          "sprite": "champion2.png",
          "group": "champion",
          "x": 192,
          "y": 96,
          "w": 48,
          "h": 48
        },
        "tags": ["Assassin", "Fighter"],
        "partype": "Ferocity",
        "stats": {
          "hp": 586.2,
          "hpperlevel": 90.0,
          "mp": 4.0,
          "mpperlevel": 0.0,
          "movespeed": 345.0,
          "armor": 25.88,
          "armorperlevel": 3.0,
          "spellblock": 32.1,
          "spellblockperlevel": 1.25,
          "attackrange": 125.0,
          "hpregen": 7.0,
          "hpregenperlevel": 0.5,
          "mpregen": 0.0,
          "mpregenperlevel": 0.0,
          "crit": 0.0,
          "critperlevel": 0.0,
          "attackdamage": 60.0,
          "attackdamageperlevel": 1.5,
          "attackspeedoffset": 0.0,
          "attackspeedperlevel": 3.5
        }
      },
      "Riven": {
        "version": "6.24.1",
        "id": "Riven",
        "key": "92",
        "name": "Riven",
        "title": "La Exiliada",
        "blurb": "''Hay un lugar entre la guerra y el asesinato en el que acechan nuestros demonios.''<br><br>En Noxus cualquier ciudadano puede adquirir cierta cuota de poder independientemente de su raza, sexo o estatus social; tan solo importa su fuerza. Con una fe ...",
        "info": {
          "attack": 8,
          "defense": 5,
          "magic": 1,
          "difficulty": 8
        },
        "image": {
          "full": "Riven.png",
          "sprite": "champion2.png",
          "group": "champion",
          "x": 240,
          "y": 96,
          "w": 48,
          "h": 48
        },
        "tags": ["Fighter", "Assassin"],
        "partype": "None",
        "stats": {
          "hp": 558.48,
          "hpperlevel": 86.0,
          "mp": 0.0,
          "mpperlevel": 0.0,
          "movespeed": 340.0,
          "armor": 24.376,
          "armorperlevel": 3.2,
          "spellblock": 32.1,
          "spellblockperlevel": 1.25,
          "attackrange": 125.0,
          "hpregen": 5.34,
          "hpregenperlevel": 0.5,
          "mpregen": 0.0,
          "mpregenperlevel": 0.0,
          "crit": 0.0,
          "critperlevel": 0.0,
          "attackdamage": 56.04,
          "attackdamageperlevel": 3.0,
          "attackspeedoffset": 0.0,
          "attackspeedperlevel": 3.5
        }
      },
      "Rumble": {
        "version": "6.24.1",
        "id": "Rumble",
        "key": "68",
        "name": "Rumble",
        "title": "La Amenaza Mecánica",
        "blurb": "''¡Vaya, me va a llevar siglos limpiar los restos de tu cara de mi armadura!''<br><br>Incluso entre los yordles, Rumble era el más pequeño de todos. Como tal, siempre sufría el acoso de los demás. Para sobrevivir tenía que ser más ingenioso y astuto ...",
        "info": {
          "attack": 3,
          "defense": 6,
          "magic": 8,
          "difficulty": 10
        },
        "image": {
          "full": "Rumble.png",
          "sprite": "champion2.png",
          "group": "champion",
          "x": 288,
          "y": 96,
          "w": 48,
          "h": 48
        },
        "tags": ["Fighter", "Mage"],
        "partype": "Heat",
        "stats": {
          "hp": 584.4,
          "hpperlevel": 80.0,
          "mp": 100.0,
          "mpperlevel": 0.0,
          "movespeed": 345.0,
          "armor": 25.88,
          "armorperlevel": 3.5,
          "spellblock": 32.1,
          "spellblockperlevel": 1.25,
          "attackrange": 125.0,
          "hpregen": 8.005,
          "hpregenperlevel": 0.6,
          "mpregen": 0.0,
          "mpregenperlevel": 0.0,
          "crit": 0.0,
          "critperlevel": 0.0,
          "attackdamage": 61.036,
          "attackdamageperlevel": 3.2,
          "attackspeedoffset": -0.03,
          "attackspeedperlevel": 1.85
        }
      },
      "Ryze": {
        "version": "6.24.1",
        "id": "Ryze",
        "key": "13",
        "name": "Ryze",
        "title": "El Hechicero Rúnico",
        "blurb": "''Tened cuidado con este mundo. Lo que está hecho se puede deshacer''.<br><br>Ryze es considerado uno de los hechiceros más versados de Runaterra. Este irascible archimago ancestral lleva sobre sus hombros una pesada carga. Armado con una constitución ...",
        "info": {
          "attack": 2,
          "defense": 2,
          "magic": 10,
          "difficulty": 7
        },
        "image": {
          "full": "Ryze.png",
          "sprite": "champion2.png",
          "group": "champion",
          "x": 336,
          "y": 96,
          "w": 48,
          "h": 48
        },
        "tags": ["Mage", "Fighter"],
        "partype": "MP",
        "stats": {
          "hp": 558.48,
          "hpperlevel": 86.0,
          "mp": 400.0,
          "mpperlevel": 50.0,
          "movespeed": 340.0,
          "armor": 21.552,
          "armorperlevel": 3.0,
          "spellblock": 30.0,
          "spellblockperlevel": 0.0,
          "attackrange": 550.0,
          "hpregen": 7.0,
          "hpregenperlevel": 0.55,
          "mpregen": 6.0,
          "mpregenperlevel": 0.8,
          "crit": 0.0,
          "critperlevel": 0.0,
          "attackdamage": 55.04,
          "attackdamageperlevel": 3.0,
          "attackspeedoffset": 0.0,
          "attackspeedperlevel": 2.112
        }
      },
      "Sejuani": {
        "version": "6.24.1",
        "id": "Sejuani",
        "key": "113",
        "name": "Sejuani",
        "title": "La Cólera del Invierno",
        "blurb": "Sejuani fue criada en la adversidad y creció entre los bárbaros. Donde otros sucumbieron a la dureza de Freljord, ella se curtió con fiereza, hasta que el dolor se convirtió en poder, el hambre en coraje y el congelar a un compañero en un acto de ...",
        "info": {
          "attack": 5,
          "defense": 7,
          "magic": 6,
          "difficulty": 4
        },
        "image": {
          "full": "Sejuani.png",
          "sprite": "champion2.png",
          "group": "champion",
          "x": 384,
          "y": 96,
          "w": 48,
          "h": 48
        },
        "tags": ["Tank", "Fighter"],
        "partype": "MP",
        "stats": {
          "hp": 600.0,
          "hpperlevel": 95.0,
          "mp": 400.0,
          "mpperlevel": 40.0,
          "movespeed": 340.0,
          "armor": 29.54,
          "armorperlevel": 3.0,
          "spellblock": 32.1,
          "spellblockperlevel": 1.25,
          "attackrange": 125.0,
          "hpregen": 8.675,
          "hpregenperlevel": 0.85,
          "mpregen": 7.205,
          "mpregenperlevel": 0.45,
          "crit": 0.0,
          "critperlevel": 0.0,
          "attackdamage": 57.544,
          "attackdamageperlevel": 3.3,
          "attackspeedoffset": -0.0672,
          "attackspeedperlevel": 1.44
        }
      },
      "Shaco": {
        "version": "6.24.1",
        "id": "Shaco",
        "key": "35",
        "name": "Shaco",
        "title": "El Bufón Siniestro",
        "blurb": "Muchos dirían que la muerte no es divertida. Y no lo es... a menos que seas Shaco, en cuyo caso es desternillante. Es el primer cómico homicida perfectamente funcional de Valoran: bromea hasta que alguien muere y luego ríe. Ha llegado a ser conocido ...",
        "info": {
          "attack": 8,
          "defense": 4,
          "magic": 6,
          "difficulty": 9
        },
        "image": {
          "full": "Shaco.png",
          "sprite": "champion2.png",
          "group": "champion",
          "x": 432,
          "y": 96,
          "w": 48,
          "h": 48
        },
        "tags": ["Assassin"],
        "partype": "MP",
        "stats": {
          "hp": 582.12,
          "hpperlevel": 84.0,
          "mp": 297.2,
          "mpperlevel": 40.0,
          "movespeed": 350.0,
          "armor": 24.88,
          "armorperlevel": 3.5,
          "spellblock": 32.1,
          "spellblockperlevel": 1.25,
          "attackrange": 125.0,
          "hpregen": 8.37,
          "hpregenperlevel": 0.55,
          "mpregen": 7.155,
          "mpregenperlevel": 0.45,
          "crit": 0.0,
          "critperlevel": 0.0,
          "attackdamage": 57.58,
          "attackdamageperlevel": 3.5,
          "attackspeedoffset": -0.1,
          "attackspeedperlevel": 3.0
        }
      },
      "Shen": {
        "version": "6.24.1",
        "id": "Shen",
        "key": "98",
        "name": "Shen",
        "title": "El Ojo del Crepúsculo",
        "blurb": "''El Ojo del Crepúsculo no ve el miedo, el odio, el amor... No ve nada que pueda alterar el equilibrio.''<br><br>Shen es el líder de un clan secreto de guerreros místicos. Es el Ojo del Crepúsculo, quien debe encargarse de mantener el equilibrio en el ...",
        "info": {
          "attack": 3,
          "defense": 9,
          "magic": 3,
          "difficulty": 4
        },
        "image": {
          "full": "Shen.png",
          "sprite": "champion3.png",
          "group": "champion",
          "x": 0,
          "y": 0,
          "w": 48,
          "h": 48
        },
        "tags": ["Tank", "Melee"],
        "partype": "Energy",
        "stats": {
          "hp": 540.0,
          "hpperlevel": 85.0,
          "mp": 400.0,
          "mpperlevel": 0.0,
          "movespeed": 340.0,
          "armor": 25.0,
          "armorperlevel": 3.0,
          "spellblock": 32.1,
          "spellblockperlevel": 1.25,
          "attackrange": 125.0,
          "hpregen": 8.5,
          "hpregenperlevel": 0.75,
          "mpregen": 50.0,
          "mpregenperlevel": 0.0,
          "crit": 0.0,
          "critperlevel": 0.0,
          "attackdamage": 60.0,
          "attackdamageperlevel": 3.0,
          "attackspeedoffset": 0.0,
          "attackspeedperlevel": 2.0
        }
      },
      "Shyvana": {
        "version": "6.24.1",
        "id": "Shyvana",
        "key": "102",
        "name": "Shyvana",
        "title": "La Medio Dragón",
        "blurb": "Una mestiza nacida de la unión entre un dragón y un humano, Shyvana ha buscado su lugar durante toda la vida. La persecución la ha convertido en una guerrera brutal, y aquellos que osan hacer frente a Shyvana se enfrentan a la feroz bestia que acecha ...",
        "info": {
          "attack": 8,
          "defense": 6,
          "magic": 3,
          "difficulty": 4
        },
        "image": {
          "full": "Shyvana.png",
          "sprite": "champion3.png",
          "group": "champion",
          "x": 48,
          "y": 0,
          "w": 48,
          "h": 48
        },
        "tags": ["Fighter", "Tank"],
        "partype": "Dragonfury",
        "stats": {
          "hp": 595.0,
          "hpperlevel": 95.0,
          "mp": 100.0,
          "mpperlevel": 0.0,
          "movespeed": 350.0,
          "armor": 27.628,
          "armorperlevel": 3.35,
          "spellblock": 32.1,
          "spellblockperlevel": 1.25,
          "attackrange": 125.0,
          "hpregen": 8.6,
          "hpregenperlevel": 0.8,
          "mpregen": 0.0,
          "mpregenperlevel": 0.0,
          "crit": 0.0,
          "critperlevel": 0.0,
          "attackdamage": 60.712,
          "attackdamageperlevel": 3.4,
          "attackspeedoffset": -0.05,
          "attackspeedperlevel": 2.5
        }
      },
      "Singed": {
        "version": "6.24.1",
        "id": "Singed",
        "key": "27",
        "name": "Singed",
        "title": "El Químico Loco",
        "blurb": "Singed desciende de un milenario linaje de respetados químicos de Zaun. Ya de joven su talento para elaborar pócimas era muy superior al de sus compañeros, por lo que no tardó en destacar entre estos. Nadie se sorprendió cuando fue seleccionado para ...",
        "info": {
          "attack": 4,
          "defense": 8,
          "magic": 7,
          "difficulty": 5
        },
        "image": {
          "full": "Singed.png",
          "sprite": "champion3.png",
          "group": "champion",
          "x": 96,
          "y": 0,
          "w": 48,
          "h": 48
        },
        "tags": ["Tank", "Fighter"],
        "partype": "MP",
        "stats": {
          "hp": 542.76,
          "hpperlevel": 82.0,
          "mp": 290.6,
          "mpperlevel": 45.0,
          "movespeed": 345.0,
          "armor": 27.88,
          "armorperlevel": 3.5,
          "spellblock": 32.1,
          "spellblockperlevel": 1.25,
          "attackrange": 125.0,
          "hpregen": 8.02,
          "hpregenperlevel": 0.55,
          "mpregen": 7.52,
          "mpregenperlevel": 0.55,
          "crit": 0.0,
          "critperlevel": 0.0,
          "attackdamage": 62.32,
          "attackdamageperlevel": 3.375,
          "attackspeedoffset": 0.02,
          "attackspeedperlevel": 1.81
        }
      },
      "Sion": {
        "version": "6.24.1",
        "id": "Sion",
        "key": "14",
        "name": "Sion",
        "title": "El Coloso no Muerto",
        "blurb": "SANGRE.<br><br>LA HUELO.<br><br>LA DESEO. LA ANHELO. ¡LA NECESITO!<br><br>QUEDA POCO. AHÍ VIENEN.<br><br>¿SIN CADENAS? ¡LIBRE! ¡MATAR!<br><br>A MI ALCANCE. ¡SÍ! ¡MUERE! ¡MUERE!<br><br>Se acabó. Demasiado pronto. Sin luchar. Más. Quiero... más....",
        "info": {
          "attack": 5,
          "defense": 9,
          "magic": 3,
          "difficulty": 5
        },
        "image": {
          "full": "Sion.png",
          "sprite": "champion3.png",
          "group": "champion",
          "x": 144,
          "y": 0,
          "w": 48,
          "h": 48
        },
        "tags": ["Tank", "Fighter"],
        "partype": "MP",
        "stats": {
          "hp": 542.64,
          "hpperlevel": 73.0,
          "mp": 325.6,
          "mpperlevel": 42.0,
          "movespeed": 345.0,
          "armor": 23.04,
          "armorperlevel": 3.0,
          "spellblock": 32.1,
          "spellblockperlevel": 1.25,
          "attackrange": 175.0,
          "hpregen": 10.18,
          "hpregenperlevel": 0.8,
          "mpregen": 8.005,
          "mpregenperlevel": 0.6,
          "crit": 0.0,
          "critperlevel": 0.0,
          "attackdamage": 59.72,
          "attackdamageperlevel": 4.0,
          "attackspeedoffset": -0.08,
          "attackspeedperlevel": 1.3
        }
      },
      "Sivir": {
        "version": "6.24.1",
        "id": "Sivir",
        "key": "15",
        "name": "Sivir",
        "title": "La Señora de la Batalla",
        "blurb": "''Me da igual qué cara aparezca en tu moneda siempre que sirva como pago.''<br><br>Sivir es una cazafortunas y mercenaria de renombre que desempeña su labor en los desiertos de Shurima. Provista de un arma legendaria en forma de cruz engastada con ...",
        "info": {
          "attack": 9,
          "defense": 3,
          "magic": 1,
          "difficulty": 4
        },
        "image": {
          "full": "Sivir.png",
          "sprite": "champion3.png",
          "group": "champion",
          "x": 192,
          "y": 0,
          "w": 48,
          "h": 48
        },
        "tags": ["Marksman"],
        "partype": "MP",
        "stats": {
          "hp": 515.76,
          "hpperlevel": 82.0,
          "mp": 284.0,
          "mpperlevel": 50.0,
          "movespeed": 335.0,
          "armor": 22.21,
          "armorperlevel": 3.25,
          "spellblock": 30.0,
          "spellblockperlevel": 0.0,
          "attackrange": 500.0,
          "hpregen": 5.17,
          "hpregenperlevel": 0.55,
          "mpregen": 8.01,
          "mpregenperlevel": 0.9,
          "crit": 0.0,
          "critperlevel": 0.0,
          "attackdamage": 57.46,
          "attackdamageperlevel": 2.41,
          "attackspeedoffset": 0.0,
          "attackspeedperlevel": 1.6
        }
      },
      "Skarner": {
        "version": "6.24.1",
        "id": "Skarner",
        "key": "72",
        "name": "Skarner",
        "title": "La Vanguardia de Cristal",
        "blurb": "''Somos uno. Nada puede fragmentarnos.''<br><br>Skarner es un inmenso escorpión cristalino de un valle oculto de Shurima. La antigua raza a la que pertenece, los Brackern, es famosa por su sabiduría y su profunda conexión con la tierra, pues sus almas ...",
        "info": {
          "attack": 7,
          "defense": 6,
          "magic": 5,
          "difficulty": 5
        },
        "image": {
          "full": "Skarner.png",
          "sprite": "champion3.png",
          "group": "champion",
          "x": 240,
          "y": 0,
          "w": 48,
          "h": 48
        },
        "tags": ["Fighter", "Tank"],
        "partype": "MP",
        "stats": {
          "hp": 601.28,
          "hpperlevel": 90.0,
          "mp": 272.2,
          "mpperlevel": 40.0,
          "movespeed": 335.0,
          "armor": 29.384,
          "armorperlevel": 3.8,
          "spellblock": 32.1,
          "spellblockperlevel": 1.25,
          "attackrange": 125.0,
          "hpregen": 8.925,
          "hpregenperlevel": 0.85,
          "mpregen": 7.205,
          "mpregenperlevel": 0.45,
          "crit": 0.0,
          "critperlevel": 0.0,
          "attackdamage": 57.156,
          "attackdamageperlevel": 4.5,
          "attackspeedoffset": 0.0,
          "attackspeedperlevel": 2.1
        }
      },
      "Sona": {
        "version": "6.24.1",
        "id": "Sona",
        "key": "37",
        "name": "Sona",
        "title": "La Virtuosa de las Cuerdas",
        "blurb": "Sona no conserva ningún recuerdo de sus verdaderos padres. Recién nacida, la encontraron abandonada a las puertas de un hogar de adopción jonio, acurrucada sobre un antiguo instrumento dentro de un exquisito estuche de origen desconocido. Su ...",
        "info": {
          "attack": 5,
          "defense": 2,
          "magic": 8,
          "difficulty": 4
        },
        "image": {
          "full": "Sona.png",
          "sprite": "champion3.png",
          "group": "champion",
          "x": 288,
          "y": 0,
          "w": 48,
          "h": 48
        },
        "tags": ["Support", "Mage"],
        "partype": "MP",
        "stats": {
          "hp": 482.36,
          "hpperlevel": 77.0,
          "mp": 340.6,
          "mpperlevel": 45.0,
          "movespeed": 325.0,
          "armor": 20.544,
          "armorperlevel": 3.3,
          "spellblock": 30.0,
          "spellblockperlevel": 0.0,
          "attackrange": 550.0,
          "hpregen": 5.42,
          "hpregenperlevel": 0.55,
          "mpregen": 11.5,
          "mpregenperlevel": 0.4,
          "crit": 0.0,
          "critperlevel": 0.0,
          "attackdamage": 50.04,
          "attackdamageperlevel": 3.0,
          "attackspeedoffset": -0.03,
          "attackspeedperlevel": 2.3
        }
      },
      "Soraka": {
        "version": "6.24.1",
        "id": "Soraka",
        "key": "16",
        "name": "Soraka",
        "title": "La Hija de las Estrellas",
        "blurb": "Soraka, que es una sanadora bendecida con la magia de las estrellas, ama a todas las criaturas vivientes por igual. Antaño fue una criatura celestial, pero sacrificó su inmortalidad para descender al reino de los mortales. Mientras el mal siga ...",
        "info": {
          "attack": 2,
          "defense": 5,
          "magic": 7,
          "difficulty": 3
        },
        "image": {
          "full": "Soraka.png",
          "sprite": "champion3.png",
          "group": "champion",
          "x": 336,
          "y": 0,
          "w": 48,
          "h": 48
        },
        "tags": ["Support", "Mage"],
        "partype": "MP",
        "stats": {
          "hp": 529.04,
          "hpperlevel": 78.0,
          "mp": 350.8,
          "mpperlevel": 60.0,
          "movespeed": 325.0,
          "armor": 23.384,
          "armorperlevel": 3.8,
          "spellblock": 30.0,
          "spellblockperlevel": 0.0,
          "attackrange": 550.0,
          "hpregen": 2.5,
          "hpregenperlevel": 0.5,
          "mpregen": 11.5,
          "mpregenperlevel": 0.4,
          "crit": 0.0,
          "critperlevel": 0.0,
          "attackdamage": 50.04,
          "attackdamageperlevel": 3.0,
          "attackspeedoffset": 0.0,
          "attackspeedperlevel": 2.14
        }
      },
      "Swain": {
        "version": "6.24.1",
        "id": "Swain",
        "key": "50",
        "name": "Swain",
        "title": "El Maestro Estratega",
        "blurb": "Los primeros datos de la existencia de Swain se remontan a las anotaciones de un médico de un hospital noxiano. Según las mismas, Swain entró cojeando en el pabellón sin llorar ni quejarse; tenía la pierna derecha partida en dos, con el hueso por ...",
        "info": {
          "attack": 2,
          "defense": 6,
          "magic": 9,
          "difficulty": 8
        },
        "image": {
          "full": "Swain.png",
          "sprite": "champion3.png",
          "group": "champion",
          "x": 384,
          "y": 0,
          "w": 48,
          "h": 48
        },
        "tags": ["Mage", "Fighter"],
        "partype": "MP",
        "stats": {
          "hp": 516.04,
          "hpperlevel": 90.0,
          "mp": 374.0,
          "mpperlevel": 47.0,
          "movespeed": 335.0,
          "armor": 22.72,
          "armorperlevel": 4.0,
          "spellblock": 30.0,
          "spellblockperlevel": 0.0,
          "attackrange": 500.0,
          "hpregen": 7.84,
          "hpregenperlevel": 0.65,
          "mpregen": 6.0,
          "mpregenperlevel": 0.8,
          "crit": 0.0,
          "critperlevel": 0.0,
          "attackdamage": 52.04,
          "attackdamageperlevel": 3.0,
          "attackspeedoffset": 0.0,
          "attackspeedperlevel": 2.11
        }
      },
      "Syndra": {
        "version": "6.24.1",
        "id": "Syndra",
        "key": "134",
        "name": "Syndra",
        "title": "La Soberana Oscura",
        "blurb": "Syndra nació con un inmenso potencial mágico y nada le gusta más que poner en práctica su increíble poder. Con cada día que pasa, su maestría de las fuerzas mágicas se torna más potente y devastadora. Syndra rehúsa cualquier noción de equilibro o ...",
        "info": {
          "attack": 2,
          "defense": 3,
          "magic": 9,
          "difficulty": 8
        },
        "image": {
          "full": "Syndra.png",
          "sprite": "champion3.png",
          "group": "champion",
          "x": 432,
          "y": 0,
          "w": 48,
          "h": 48
        },
        "tags": ["Mage", "Support"],
        "partype": "MP",
        "stats": {
          "hp": 511.04,
          "hpperlevel": 78.0,
          "mp": 384.0,
          "mpperlevel": 60.0,
          "movespeed": 330.0,
          "armor": 24.712,
          "armorperlevel": 3.4,
          "spellblock": 30.0,
          "spellblockperlevel": 0.0,
          "attackrange": 550.0,
          "hpregen": 6.505,
          "hpregenperlevel": 0.6,
          "mpregen": 6.0,
          "mpregenperlevel": 0.8,
          "crit": 0.0,
          "critperlevel": 0.0,
          "attackdamage": 53.872,
          "attackdamageperlevel": 2.9,
          "attackspeedoffset": 0.0,
          "attackspeedperlevel": 2.0
        }
      },
      "TahmKench": {
        "version": "6.24.1",
        "id": "TahmKench",
        "key": "223",
        "name": "Tahm Kench",
        "title": "El Rey del Río",
        "blurb": "''El mundo entero es un río y yo soy su rey.''<br><br>Tahm Kench viaja por los cursos fluviales de Runaterra, tratando de colmar un apetito insaciable con la miseria de los incautos. Este singular y encantador <em>gourmet</em> saborea cada segundo del ...",
        "info": {
          "attack": 3,
          "defense": 9,
          "magic": 6,
          "difficulty": 5
        },
        "image": {
          "full": "TahmKench.png",
          "sprite": "champion3.png",
          "group": "champion",
          "x": 0,
          "y": 48,
          "w": 48,
          "h": 48
        },
        "tags": ["Support", "Tank"],
        "partype": "MP",
        "stats": {
          "hp": 610.0,
          "hpperlevel": 95.0,
          "mp": 325.0,
          "mpperlevel": 40.0,
          "movespeed": 335.0,
          "armor": 27.0,
          "armorperlevel": 3.5,
          "spellblock": 32.1,
          "spellblockperlevel": 1.25,
          "attackrange": 175.0,
          "hpregen": 6.5,
          "hpregenperlevel": 0.55,
          "mpregen": 8.0,
          "mpregenperlevel": 1.0,
          "crit": 0.0,
          "critperlevel": 0.0,
          "attackdamage": 56.0,
          "attackdamageperlevel": 3.2,
          "attackspeedoffset": 0.0,
          "attackspeedperlevel": 2.5
        }
      },
      "Taliyah": {
        "version": "6.24.1",
        "id": "Taliyah",
        "key": "163",
        "name": "Taliyah",
        "title": "La Tejedora de Piedra",
        "blurb": "Taliyah es una hechicera nómada de Shurima que teje su magia con enérgico entusiasmo y cruda determinación. Dividida entre una curiosidad adolescente y un sentido adulto de la responsabilidad, ha atravesado Valoran de un lado a otro para descubrir la ...",
        "info": {
          "attack": 1,
          "defense": 7,
          "magic": 8,
          "difficulty": 5
        },
        "image": {
          "full": "Taliyah.png",
          "sprite": "champion3.png",
          "group": "champion",
          "x": 48,
          "y": 48,
          "w": 48,
          "h": 48
        },
        "tags": ["Mage", "Support"],
        "partype": "MP",
        "stats": {
          "hp": 520.0,
          "hpperlevel": 75.0,
          "mp": 340.0,
          "mpperlevel": 60.0,
          "movespeed": 325.0,
          "armor": 20.0,
          "armorperlevel": 3.0,
          "spellblock": 30.0,
          "spellblockperlevel": 0.0,
          "attackrange": 525.0,
          "hpregen": 7.0,
          "hpregenperlevel": 0.7,
          "mpregen": 7.0,
          "mpregenperlevel": 0.85,
          "crit": 0.0,
          "critperlevel": 0.0,
          "attackdamage": 56.0,
          "attackdamageperlevel": 3.3,
          "attackspeedoffset": 0.0,
          "attackspeedperlevel": 1.36
        }
      },
      "Talon": {
        "version": "6.24.1",
        "id": "Talon",
        "key": "91",
        "name": "Talon",
        "title": "La Sombra de la Espada",
        "blurb": "''Los tres espadachines más temibles de Valoran están vinculados a la casa de Du Couteau: mi padre, Talon y yo. Que nos rete quien se atreva.''<br>-- Katarina Du Couteau<br><br>Los recuerdos más tempranos de Talon son los oscuros pasillos subterráneos ...",
        "info": {
          "attack": 9,
          "defense": 3,
          "magic": 1,
          "difficulty": 7
        },
        "image": {
          "full": "Talon.png",
          "sprite": "champion3.png",
          "group": "champion",
          "x": 96,
          "y": 48,
          "w": 48,
          "h": 48
        },
        "tags": ["Assassin", "Fighter"],
        "partype": "MP",
        "stats": {
          "hp": 583.0,
          "hpperlevel": 90.0,
          "mp": 377.2,
          "mpperlevel": 37.0,
          "movespeed": 335.0,
          "armor": 26.88,
          "armorperlevel": 3.5,
          "spellblock": 32.1,
          "spellblockperlevel": 1.25,
          "attackrange": 125.0,
          "hpregen": 8.51,
          "hpregenperlevel": 0.75,
          "mpregen": 7.59,
          "mpregenperlevel": 0.5,
          "crit": 0.0,
          "critperlevel": 0.0,
          "attackdamage": 60.0,
          "attackdamageperlevel": 3.1,
          "attackspeedoffset": 0.0,
          "attackspeedperlevel": 2.9
        }
      },
      "Taric": {
        "version": "6.24.1",
        "id": "Taric",
        "key": "44",
        "name": "Taric",
        "title": "El Escudo de Valoran",
        "blurb": "“Las mejores armas también son hermosas.”<br><br>Taric es el Aspecto del Protector, y gracias a su increíble poder es el guardián de la vida, el amor y la belleza en Runaterra. Caído en desgracia debido a la negligencia de su deber y exiliado de su ...",
        "info": {
          "attack": 4,
          "defense": 8,
          "magic": 5,
          "difficulty": 3
        },
        "image": {
          "full": "Taric.png",
          "sprite": "champion3.png",
          "group": "champion",
          "x": 144,
          "y": 48,
          "w": 48,
          "h": 48
        },
        "tags": ["Support", "Fighter"],
        "partype": "MP",
        "stats": {
          "hp": 575.0,
          "hpperlevel": 90.0,
          "mp": 300.0,
          "mpperlevel": 60.0,
          "movespeed": 340.0,
          "armor": 25.0,
          "armorperlevel": 3.4,
          "spellblock": 32.1,
          "spellblockperlevel": 1.25,
          "attackrange": 150.0,
          "hpregen": 6.0,
          "hpregenperlevel": 0.5,
          "mpregen": 5.0,
          "mpregenperlevel": 1.0,
          "crit": 0.0,
          "critperlevel": 0.0,
          "attackdamage": 55.0,
          "attackdamageperlevel": 3.5,
          "attackspeedoffset": 0.0,
          "attackspeedperlevel": 2.0
        }
      },
      "Teemo": {
        "version": "6.24.1",
        "id": "Teemo",
        "key": "17",
        "name": "Teemo",
        "title": "El Explorador Veloz",
        "blurb": "Teemo es una leyenda entre sus hermanos y hermanas yordle de la ciudad de Bandle. Aunque como tal, hay algo que no encaja. Si bien disfruta de la compañía de otros yordles, se obstina en realizar misiones en solitario para la defensa de la ciudad de ...",
        "info": {
          "attack": 5,
          "defense": 3,
          "magic": 7,
          "difficulty": 6
        },
        "image": {
          "full": "Teemo.png",
          "sprite": "champion3.png",
          "group": "champion",
          "x": 192,
          "y": 48,
          "w": 48,
          "h": 48
        },
        "tags": ["Marksman", "Assassin"],
        "partype": "MP",
        "stats": {
          "hp": 515.76,
          "hpperlevel": 82.0,
          "mp": 267.2,
          "mpperlevel": 40.0,
          "movespeed": 330.0,
          "armor": 24.3,
          "armorperlevel": 3.75,
          "spellblock": 30.0,
          "spellblockperlevel": 0.0,
          "attackrange": 500.0,
          "hpregen": 5.74,
          "hpregenperlevel": 0.65,
          "mpregen": 7.205,
          "mpregenperlevel": 0.45,
          "crit": 0.0,
          "critperlevel": 0.0,
          "attackdamage": 49.54,
          "attackdamageperlevel": 3.0,
          "attackspeedoffset": -0.0947,
          "attackspeedperlevel": 3.38
        }
      },
      "Thresh": {
        "version": "6.24.1",
        "id": "Thresh",
        "key": "412",
        "name": "Thresh",
        "title": "El Carcelero Implacable",
        "blurb": "''La mente es un juguete maravilloso... y es maravilloso hacerla trizas.''<br><br>Sádico y astuto, Thresh es un espíritu insomne que se enorgullece de su capacidad de atormentar a los mortales y quebrarlos con parsimoniosa y agónica inventiva. El ...",
        "info": {
          "attack": 5,
          "defense": 6,
          "magic": 6,
          "difficulty": 7
        },
        "image": {
          "full": "Thresh.png",
          "sprite": "champion3.png",
          "group": "champion",
          "x": 240,
          "y": 48,
          "w": 48,
          "h": 48
        },
        "tags": ["Support", "Fighter"],
        "partype": "MP",
        "stats": {
          "hp": 560.52,
          "hpperlevel": 93.0,
          "mp": 273.92,
          "mpperlevel": 44.0,
          "movespeed": 335.0,
          "armor": 16.0,
          "armorperlevel": 0.0,
          "spellblock": 30.0,
          "spellblockperlevel": 0.0,
          "attackrange": 450.0,
          "hpregen": 6.92,
          "hpregenperlevel": 0.55,
          "mpregen": 6.0,
          "mpregenperlevel": 0.8,
          "crit": 0.0,
          "critperlevel": 0.0,
          "attackdamage": 47.696,
          "attackdamageperlevel": 2.2,
          "attackspeedoffset": 0.0,
          "attackspeedperlevel": 3.5
        }
      },
      "Tristana": {
        "version": "6.24.1",
        "id": "Tristana",
        "key": "18",
        "name": "Tristana",
        "title": "La Artillera Yordle",
        "blurb": "La grandeza viene a veces en frascos pequeños, como demuestra esta diminuta artillera yordle. En medio de un mundo hostil, Tristana no da la espalda a reto alguno y ha conseguido convertirse en un arquetipo de habilidad marcial, valor a toda prueba y ...",
        "info": {
          "attack": 9,
          "defense": 3,
          "magic": 5,
          "difficulty": 4
        },
        "image": {
          "full": "Tristana.png",
          "sprite": "champion3.png",
          "group": "champion",
          "x": 288,
          "y": 48,
          "w": 48,
          "h": 48
        },
        "tags": ["Marksman", "Assassin"],
        "partype": "MP",
        "stats": {
          "hp": 542.76,
          "hpperlevel": 82.0,
          "mp": 246.76,
          "mpperlevel": 32.0,
          "movespeed": 325.0,
          "armor": 22.0,
          "armorperlevel": 3.0,
          "spellblock": 30.0,
          "spellblockperlevel": 0.0,
          "attackrange": 550.0,
          "hpregen": 6.19,
          "hpregenperlevel": 0.65,
          "mpregen": 7.205,
          "mpregenperlevel": 0.45,
          "crit": 0.0,
          "critperlevel": 0.0,
          "attackdamage": 56.96,
          "attackdamageperlevel": 2.41,
          "attackspeedoffset": -0.04734,
          "attackspeedperlevel": 1.5
        }
      },
      "Trundle": {
        "version": "6.24.1",
        "id": "Trundle",
        "key": "48",
        "name": "Trundle",
        "title": "El Rey Trol",
        "blurb": "Trundle es un trol astuto y poderoso con tendencia a crear problemas. No hay nada que no pueda doblegar y torcer a voluntad, ni siquiera el hielo mismo. Con su garrote helado gigante, hiela la sangre de sus enemigos y los abate con sus cortantes ...",
        "info": {
          "attack": 7,
          "defense": 6,
          "magic": 2,
          "difficulty": 5
        },
        "image": {
          "full": "Trundle.png",
          "sprite": "champion3.png",
          "group": "champion",
          "x": 336,
          "y": 48,
          "w": 48,
          "h": 48
        },
        "tags": ["Fighter", "Tank"],
        "partype": "MP",
        "stats": {
          "hp": 616.28,
          "hpperlevel": 96.0,
          "mp": 281.6,
          "mpperlevel": 45.0,
          "movespeed": 350.0,
          "armor": 27.536,
          "armorperlevel": 2.7,
          "spellblock": 32.1,
          "spellblockperlevel": 1.25,
          "attackrange": 175.0,
          "hpregen": 6.0,
          "hpregenperlevel": 0.75,
          "mpregen": 7.505,
          "mpregenperlevel": 0.6,
          "crit": 0.0,
          "critperlevel": 0.0,
          "attackdamage": 60.04,
          "attackdamageperlevel": 3.0,
          "attackspeedoffset": -0.0672,
          "attackspeedperlevel": 2.9
        }
      },
      "Tryndamere": {
        "version": "6.24.1",
        "id": "Tryndamere",
        "key": "23",
        "name": "Tryndamere",
        "title": "El Rey Bárbaro",
        "blurb": "Tryndamere avanza por la tundra empujado por su furia y rabia desatadas, domina el arte de la batalla y desafía a los más grandes guerreros de Freljord. Este bárbaro iracundo busca desesperadamente a quien diezmara a su clan, y acaba con todo aquel ...",
        "info": {
          "attack": 10,
          "defense": 5,
          "magic": 2,
          "difficulty": 5
        },
        "image": {
          "full": "Tryndamere.png",
          "sprite": "champion3.png",
          "group": "champion",
          "x": 384,
          "y": 48,
          "w": 48,
          "h": 48
        },
        "tags": ["Fighter", "Assassin"],
        "partype": "Battlefury",
        "stats": {
          "hp": 625.64,
          "hpperlevel": 98.0,
          "mp": 100.0,
          "mpperlevel": 0.0,
          "movespeed": 345.0,
          "armor": 24.108,
          "armorperlevel": 3.1,
          "spellblock": 32.1,
          "spellblockperlevel": 1.25,
          "attackrange": 125.0,
          "hpregen": 8.51,
          "hpregenperlevel": 0.9,
          "mpregen": 0.0,
          "mpregenperlevel": 0.0,
          "crit": 0.0,
          "critperlevel": 0.0,
          "attackdamage": 61.376,
          "attackdamageperlevel": 3.2,
          "attackspeedoffset": -0.0672,
          "attackspeedperlevel": 2.9
        }
      },
      "TwistedFate": {
        "version": "6.24.1",
        "id": "TwistedFate",
        "key": "4",
        "name": "Twisted Fate",
        "title": "El Maestro de las Cartas",
        "blurb": "Twisted Fate es un tahúr y timador de mala reputación. Ha viajado por buena parte del mundo conocido granjeándose la admiración y la enemistad de ricos y necios por igual gracias a su habilidad con los naipes. Raras veces se toma las cosas con ...",
        "info": {
          "attack": 6,
          "defense": 2,
          "magic": 6,
          "difficulty": 9
        },
        "image": {
          "full": "TwistedFate.png",
          "sprite": "champion3.png",
          "group": "champion",
          "x": 432,
          "y": 48,
          "w": 48,
          "h": 48
        },
        "tags": ["Mage"],
        "partype": "MP",
        "stats": {
          "hp": 521.76,
          "hpperlevel": 82.0,
          "mp": 265.84,
          "mpperlevel": 38.0,
          "movespeed": 330.0,
          "armor": 20.542,
          "armorperlevel": 3.15,
          "spellblock": 30.0,
          "spellblockperlevel": 0.0,
          "attackrange": 525.0,
          "hpregen": 5.505,
          "hpregenperlevel": 0.6,
          "mpregen": 6.0,
          "mpregenperlevel": 0.8,
          "crit": 0.0,
          "critperlevel": 0.0,
          "attackdamage": 49.954,
          "attackdamageperlevel": 3.3,
          "attackspeedoffset": -0.04,
          "attackspeedperlevel": 3.22
        }
      },
      "Twitch": {
        "version": "6.24.1",
        "id": "Twitch",
        "key": "29",
        "name": "Twitch",
        "title": "La Rata Apestada",
        "blurb": "Informe de incidentes de H.I.V.E.<br>Código de infracción: Homicidio industrial<br>Estado del caso: Sin resolver<br>Agente investigador: Rol, P.<br><br>El equipo respondió a una información acerca de la presencia de un personaje sospechoso y una ...",
        "info": {
          "attack": 9,
          "defense": 2,
          "magic": 3,
          "difficulty": 6
        },
        "image": {
          "full": "Twitch.png",
          "sprite": "champion3.png",
          "group": "champion",
          "x": 0,
          "y": 96,
          "w": 48,
          "h": 48
        },
        "tags": ["Marksman", "Assassin"],
        "partype": "MP",
        "stats": {
          "hp": 525.08,
          "hpperlevel": 81.0,
          "mp": 287.2,
          "mpperlevel": 40.0,
          "movespeed": 330.0,
          "armor": 23.04,
          "armorperlevel": 3.0,
          "spellblock": 30.0,
          "spellblockperlevel": 0.0,
          "attackrange": 550.0,
          "hpregen": 6.005,
          "hpregenperlevel": 0.6,
          "mpregen": 7.255,
          "mpregenperlevel": 0.45,
          "crit": 0.0,
          "critperlevel": 0.0,
          "attackdamage": 55.46,
          "attackdamageperlevel": 2.41,
          "attackspeedoffset": -0.08,
          "attackspeedperlevel": 3.38
        }
      },
      "Udyr": {
        "version": "6.24.1",
        "id": "Udyr",
        "key": "77",
        "name": "Udyr",
        "title": "El Caminante Espiritual",
        "blurb": "Udyr es más que un hombre, es un recipiente para el poder indomable de cuatro espíritus de animales primigenios. Al explotar las naturalezas animales de los espíritus, Udyr puede emplear su fuerza única: el tigre le proporciona velocidad y ferocidad, ...",
        "info": {
          "attack": 8,
          "defense": 7,
          "magic": 4,
          "difficulty": 7
        },
        "image": {
          "full": "Udyr.png",
          "sprite": "champion3.png",
          "group": "champion",
          "x": 48,
          "y": 96,
          "w": 48,
          "h": 48
        },
        "tags": ["Fighter", "Tank"],
        "partype": "MP",
        "stats": {
          "hp": 593.32,
          "hpperlevel": 99.0,
          "mp": 270.4,
          "mpperlevel": 30.0,
          "movespeed": 345.0,
          "armor": 25.47,
          "armorperlevel": 4.0,
          "spellblock": 32.1,
          "spellblockperlevel": 1.25,
          "attackrange": 125.0,
          "hpregen": 6.0,
          "hpregenperlevel": 0.75,
          "mpregen": 7.505,
          "mpregenperlevel": 0.45,
          "crit": 0.0,
          "critperlevel": 0.0,
          "attackdamage": 58.286,
          "attackdamageperlevel": 3.2,
          "attackspeedoffset": -0.05,
          "attackspeedperlevel": 2.67
        }
      },
      "Urgot": {
        "version": "6.24.1",
        "id": "Urgot",
        "key": "6",
        "name": "Urgot",
        "title": "El Orgullo del Verdugo",
        "blurb": "Hay guerreros que se hacen legendarios por su fuerza, su astucia o su destreza con las armas. Otros simplemente porque rehúsan morir. Es posible que Urgot, otrora un gran soldado de Noxus, se enmarque dentro del último grupo. Con una cierta tendencia ...",
        "info": {
          "attack": 8,
          "defense": 5,
          "magic": 3,
          "difficulty": 8
        },
        "image": {
          "full": "Urgot.png",
          "sprite": "champion3.png",
          "group": "champion",
          "x": 96,
          "y": 96,
          "w": 48,
          "h": 48
        },
        "tags": ["Marksman", "Fighter"],
        "partype": "MP",
        "stats": {
          "hp": 586.52,
          "hpperlevel": 89.0,
          "mp": 312.4,
          "mpperlevel": 55.0,
          "movespeed": 335.0,
          "armor": 24.544,
          "armorperlevel": 3.3,
          "spellblock": 30.0,
          "spellblockperlevel": 0.0,
          "attackrange": 425.0,
          "hpregen": 6.505,
          "hpregenperlevel": 0.6,
          "mpregen": 8.59,
          "mpregenperlevel": 0.65,
          "crit": 0.0,
          "critperlevel": 0.0,
          "attackdamage": 54.05,
          "attackdamageperlevel": 3.6,
          "attackspeedoffset": -0.03,
          "attackspeedperlevel": 2.9
        }
      },
      "Varus": {
        "version": "6.24.1",
        "id": "Varus",
        "key": "110",
        "name": "Varus",
        "title": "La Flecha del Castigo",
        "blurb": "''La vida de una flecha es fugaz, y su único sentido es seguir una dirección y alcanzar un objetivo''.<br><br>Gracias a su incomparable habilidad con el arco y a su incuestionable sentido del honor, Varus fue nombrado guardián de un templo sagrado de ...",
        "info": {
          "attack": 7,
          "defense": 3,
          "magic": 4,
          "difficulty": 2
        },
        "image": {
          "full": "Varus.png",
          "sprite": "champion3.png",
          "group": "champion",
          "x": 144,
          "y": 96,
          "w": 48,
          "h": 48
        },
        "tags": ["Marksman", "Mage"],
        "partype": "MP",
        "stats": {
          "hp": 537.76,
          "hpperlevel": 82.0,
          "mp": 360.48,
          "mpperlevel": 33.0,
          "movespeed": 330.0,
          "armor": 23.212,
          "armorperlevel": 3.4,
          "spellblock": 30.0,
          "spellblockperlevel": 0.0,
          "attackrange": 575.0,
          "hpregen": 5.42,
          "hpregenperlevel": 0.55,
          "mpregen": 7.34,
          "mpregenperlevel": 0.8,
          "crit": 0.0,
          "critperlevel": 0.0,
          "attackdamage": 54.66,
          "attackdamageperlevel": 2.41,
          "attackspeedoffset": -0.05,
          "attackspeedperlevel": 3.0
        }
      },
      "Vayne": {
        "version": "6.24.1",
        "id": "Vayne",
        "key": "67",
        "name": "Vayne",
        "title": "La Cazadora Noctívaga",
        "blurb": "El mundo nunca es tan civilizado como la gente piensa. Aún hay algunos que siguen las sendas más negras de la magia y son corrompidos por los poderes más oscuros que fluyen en Runaterra. Shauna Vayne lo sabe bien. Creció en el corazón privilegiado de ...",
        "info": {
          "attack": 10,
          "defense": 1,
          "magic": 1,
          "difficulty": 8
        },
        "image": {
          "full": "Vayne.png",
          "sprite": "champion3.png",
          "group": "champion",
          "x": 192,
          "y": 96,
          "w": 48,
          "h": 48
        },
        "tags": ["Marksman", "Assassin"],
        "partype": "MP",
        "stats": {
          "hp": 498.44,
          "hpperlevel": 83.0,
          "mp": 231.8,
          "mpperlevel": 35.0,
          "movespeed": 330.0,
          "armor": 19.012,
          "armorperlevel": 3.4,
          "spellblock": 30.0,
          "spellblockperlevel": 0.0,
          "attackrange": 550.0,
          "hpregen": 5.42,
          "hpregenperlevel": 0.55,
          "mpregen": 6.97,
          "mpregenperlevel": 0.4,
          "crit": 0.0,
          "critperlevel": 0.0,
          "attackdamage": 55.88,
          "attackdamageperlevel": 1.66,
          "attackspeedoffset": -0.05,
          "attackspeedperlevel": 4.0
        }
      },
      "Veigar": {
        "version": "6.24.1",
        "id": "Veigar",
        "key": "45",
        "name": "Veigar",
        "title": "El Pequeño Maestro del Mal",
        "blurb": "Para la mayoría, la imagen de los yordles no inspira temor alguno; ven a esta raza, tranquila y diminuta a pesar de su fiereza, con un poco de jovialidad. Las voces agudas y su aspecto entrañable por naturaleza inspiran un instinto de protección en ...",
        "info": {
          "attack": 2,
          "defense": 2,
          "magic": 10,
          "difficulty": 7
        },
        "image": {
          "full": "Veigar.png",
          "sprite": "champion3.png",
          "group": "champion",
          "x": 240,
          "y": 96,
          "w": 48,
          "h": 48
        },
        "tags": ["Mage"],
        "partype": "MP",
        "stats": {
          "hp": 492.76,
          "hpperlevel": 82.0,
          "mp": 392.4,
          "mpperlevel": 52.0,
          "movespeed": 340.0,
          "armor": 22.55,
          "armorperlevel": 3.75,
          "spellblock": 30.0,
          "spellblockperlevel": 0.0,
          "attackrange": 525.0,
          "hpregen": 5.42,
          "hpregenperlevel": 0.55,
          "mpregen": 6.0,
          "mpregenperlevel": 0.8,
          "crit": 0.0,
          "critperlevel": 0.0,
          "attackdamage": 50.71,
          "attackdamageperlevel": 2.625,
          "attackspeedoffset": 0.0,
          "attackspeedperlevel": 2.24
        }
      },
      "Velkoz": {
        "version": "6.24.1",
        "id": "Velkoz",
        "key": "161",
        "name": "Vel'Koz",
        "title": "El Ojo del Vacío",
        "blurb": "Me adentro en una luminosidad repentina. Pestañeo. Pestañeo, pestañeo, pestañeo. Mis ojos se adaptan a la claridad y oteo el horizonte que se extiende ante mí.<br><br>Oigo que algo corretea. Bajo la vista y me encuentro a una pequeña criatura de color ...",
        "info": {
          "attack": 2,
          "defense": 2,
          "magic": 10,
          "difficulty": 8
        },
        "image": {
          "full": "Velkoz.png",
          "sprite": "champion3.png",
          "group": "champion",
          "x": 288,
          "y": 96,
          "w": 48,
          "h": 48
        },
        "tags": ["Mage"],
        "partype": "MP",
        "stats": {
          "hp": 507.68,
          "hpperlevel": 76.0,
          "mp": 375.6,
          "mpperlevel": 42.0,
          "movespeed": 340.0,
          "armor": 21.88,
          "armorperlevel": 3.5,
          "spellblock": 30.0,
          "spellblockperlevel": 0.0,
          "attackrange": 525.0,
          "hpregen": 5.42,
          "hpregenperlevel": 0.55,
          "mpregen": 6.0,
          "mpregenperlevel": 0.8,
          "crit": 0.0,
          "critperlevel": 0.0,
          "attackdamage": 54.9379,
          "attackdamageperlevel": 3.14159,
          "attackspeedoffset": 0.0,
          "attackspeedperlevel": 1.36
        }
      },
      "Vi": {
        "version": "6.24.1",
        "id": "Vi",
        "key": "254",
        "name": "Vi",
        "title": "La Agente de Piltover",
        "blurb": "Para Vi, todo problema es sólo otra pared de ladrillo que atravesar con sus guanteletes hextech gigantes. Aunque creció en el lado incorrecto de la ley, Vi ahora usa su sabiduría criminal para servir a la fuerza policial de Piltover. La actitud ...",
        "info": {
          "attack": 8,
          "defense": 5,
          "magic": 3,
          "difficulty": 4
        },
        "image": {
          "full": "Vi.png",
          "sprite": "champion3.png",
          "group": "champion",
          "x": 336,
          "y": 96,
          "w": 48,
          "h": 48
        },
        "tags": ["Fighter", "Assassin"],
        "partype": "MP",
        "stats": {
          "hp": 582.8,
          "hpperlevel": 85.0,
          "mp": 295.6,
          "mpperlevel": 45.0,
          "movespeed": 345.0,
          "armor": 25.88,
          "armorperlevel": 3.5,
          "spellblock": 32.1,
          "spellblockperlevel": 1.25,
          "attackrange": 125.0,
          "hpregen": 9.01,
          "hpregenperlevel": 0.9,
          "mpregen": 8.09,
          "mpregenperlevel": 0.65,
          "crit": 0.0,
          "critperlevel": 0.0,
          "attackdamage": 55.88,
          "attackdamageperlevel": 3.5,
          "attackspeedoffset": -0.03,
          "attackspeedperlevel": 2.5
        }
      },
      "Viktor": {
        "version": "6.24.1",
        "id": "Viktor",
        "key": "112",
        "name": "Viktor",
        "title": "El Heraldo de las Máquinas",
        "blurb": "Al principio de su vida, Viktor descubrió su pasión por la ciencia y los inventos, sobre todo en el mundo de la automatización mecánica. Estudió en la prestigiosa Facultad de Tecmaturgia de Zaun y dirigió al equipo que creó a Blitzcrank, un gran éxito ...",
        "info": {
          "attack": 2,
          "defense": 4,
          "magic": 10,
          "difficulty": 9
        },
        "image": {
          "full": "Viktor.png",
          "sprite": "champion3.png",
          "group": "champion",
          "x": 384,
          "y": 96,
          "w": 48,
          "h": 48
        },
        "tags": ["Mage"],
        "partype": "MP",
        "stats": {
          "hp": 516.04,
          "hpperlevel": 78.0,
          "mp": 324.0,
          "mpperlevel": 50.0,
          "movespeed": 335.0,
          "armor": 22.72,
          "armorperlevel": 4.0,
          "spellblock": 30.0,
          "spellblockperlevel": 0.0,
          "attackrange": 525.0,
          "hpregen": 7.84,
          "hpregenperlevel": 0.65,
          "mpregen": 6.0,
          "mpregenperlevel": 0.8,
          "crit": 0.0,
          "critperlevel": 0.0,
          "attackdamage": 52.04,
          "attackdamageperlevel": 3.0,
          "attackspeedoffset": -0.05,
          "attackspeedperlevel": 2.11
        }
      },
      "Vladimir": {
        "version": "6.24.1",
        "id": "Vladimir",
        "key": "8",
        "name": "Vladimir",
        "title": "El Segador Carmesí",
        "blurb": "Hay un templo escondido en las montañas que separan Noxus y las Llanuras de la Tempestad, donde se guardan los secretos de una brujería tan antigua como aterradora. El área que lo rodea está cubierta de los cadáveres desangrados de quienes han ...",
        "info": {
          "attack": 2,
          "defense": 6,
          "magic": 8,
          "difficulty": 7
        },
        "image": {
          "full": "Vladimir.png",
          "sprite": "champion3.png",
          "group": "champion",
          "x": 432,
          "y": 96,
          "w": 48,
          "h": 48
        },
        "tags": ["Mage", "Tank"],
        "partype": "Gnarfury",
        "stats": {
          "hp": 525.0,
          "hpperlevel": 84.0,
          "mp": 2.0,
          "mpperlevel": 0.0,
          "movespeed": 330.0,
          "armor": 23.0,
          "armorperlevel": 3.3,
          "spellblock": 30.0,
          "spellblockperlevel": 0.0,
          "attackrange": 450.0,
          "hpregen": 7.005,
          "hpregenperlevel": 0.6,
          "mpregen": 0.0,
          "mpregenperlevel": 0.0,
          "crit": 0.0,
          "critperlevel": 0.0,
          "attackdamage": 52.0,
          "attackdamageperlevel": 3.0,
          "attackspeedoffset": 0.0,
          "attackspeedperlevel": 2.0
        }
      },
      "Volibear": {
        "version": "6.24.1",
        "id": "Volibear",
        "key": "106",
        "name": "Volibear",
        "title": "El Rugir del Trueno",
        "blurb": "Las inhóspitas regiones al norte de Freljord son el hogar de los Ursine, una feroz raza de guerreros que ha sobrevivido en la tundra durante miles de años. Su líder es un feroz adversario que posee la fuerza del rayo para sembrar el pánico entre sus ...",
        "info": {
          "attack": 7,
          "defense": 7,
          "magic": 4,
          "difficulty": 3
        },
        "image": {
          "full": "Volibear.png",
          "sprite": "champion4.png",
          "group": "champion",
          "x": 0,
          "y": 0,
          "w": 48,
          "h": 48
        },
        "tags": ["Fighter", "Tank"],
        "partype": "MP",
        "stats": {
          "hp": 584.48,
          "hpperlevel": 86.0,
          "mp": 270.4,
          "mpperlevel": 30.0,
          "movespeed": 345.0,
          "armor": 26.38,
          "armorperlevel": 3.5,
          "spellblock": 32.1,
          "spellblockperlevel": 1.25,
          "attackrange": 125.0,
          "hpregen": 8.09,
          "hpregenperlevel": 0.65,
          "mpregen": 8.09,
          "mpregenperlevel": 0.65,
          "crit": 0.0,
          "critperlevel": 0.0,
          "attackdamage": 59.544,
          "attackdamageperlevel": 3.3,
          "attackspeedoffset": -0.05,
          "attackspeedperlevel": 2.67
        }
      },
      "Warwick": {
        "version": "6.24.1",
        "id": "Warwick",
        "key": "19",
        "name": "Warwick",
        "title": "El Cazador Sanguinario",
        "blurb": "Otrora Warwick fue un hombre destacado por su capacidad de encontrar especímenes humanos para las más oscuras investigaciones científicas. Cuando sus ambiciones superaron los límites de su cuerpo, bebió de un peligroso elixir que lo transformó en un ...",
        "info": {
          "attack": 7,
          "defense": 4,
          "magic": 4,
          "difficulty": 3
        },
        "image": {
          "full": "Warwick.png",
          "sprite": "champion4.png",
          "group": "champion",
          "x": 48,
          "y": 0,
          "w": 48,
          "h": 48
        },
        "tags": ["Fighter", "Tank"],
        "partype": "MP",
        "stats": {
          "hp": 592.64,
          "hpperlevel": 98.0,
          "mp": 240.4,
          "mpperlevel": 30.0,
          "movespeed": 345.0,
          "armor": 25.88,
          "armorperlevel": 3.5,
          "spellblock": 32.1,
          "spellblockperlevel": 1.25,
          "attackrange": 125.0,
          "hpregen": 8.39,
          "hpregenperlevel": 0.8,
          "mpregen": 8.105,
          "mpregenperlevel": 0.6,
          "crit": 0.0,
          "critperlevel": 0.0,
          "attackdamage": 62.43,
          "attackdamageperlevel": 3.375,
          "attackspeedoffset": -0.08,
          "attackspeedperlevel": 2.88
        }
      },
      "Xerath": {
        "version": "6.24.1",
        "id": "Xerath",
        "key": "101",
        "name": "Xerath",
        "title": "El Mago Ascendente",
        "blurb": "''Una vida como esclavo me ha preparado para una eternidad como amo''.<br><br>Xerath es un mago Ascendido de la vieja Shurima, un ser con energía arcana retorciéndose en los quebrados fragmentos de un sarcófago mágico. Durante milenios estuvo atrapado ...",
        "info": {
          "attack": 1,
          "defense": 3,
          "magic": 10,
          "difficulty": 8
        },
        "image": {
          "full": "Xerath.png",
          "sprite": "champion4.png",
          "group": "champion",
          "x": 96,
          "y": 0,
          "w": 48,
          "h": 48
        },
        "tags": ["Mage", "Assassin"],
        "partype": "MP",
        "stats": {
          "hp": 514.4,
          "hpperlevel": 80.0,
          "mp": 366.96,
          "mpperlevel": 44.0,
          "movespeed": 340.0,
          "armor": 21.88,
          "armorperlevel": 3.5,
          "spellblock": 30.0,
          "spellblockperlevel": 0.0,
          "attackrange": 525.0,
          "hpregen": 5.42,
          "hpregenperlevel": 0.55,
          "mpregen": 6.0,
          "mpregenperlevel": 0.8,
          "crit": 0.0,
          "critperlevel": 0.0,
          "attackdamage": 54.7,
          "attackdamageperlevel": 3.0,
          "attackspeedoffset": 0.0,
          "attackspeedperlevel": 1.36
        }
      },
      "XinZhao": {
        "version": "6.24.1",
        "id": "XinZhao",
        "key": "5",
        "name": "Xin Zhao",
        "title": "El Senescal de Demacia",
        "blurb": "''La muerte es inevitable; solo es posible evitar la derrota''.<br><br>Cuando Jarvan III, rey de Demacia, pronuncia una de sus arengas desde el reluciente balcón de mármol del Palacio Real, Xin Zhao aparece siempre junto a él. Nombrado Senescal de ...",
        "info": {
          "attack": 8,
          "defense": 6,
          "magic": 3,
          "difficulty": 2
        },
        "image": {
          "full": "XinZhao.png",
          "sprite": "champion4.png",
          "group": "champion",
          "x": 144,
          "y": 0,
          "w": 48,
          "h": 48
        },
        "tags": ["Fighter", "Assassin"],
        "partype": "MP",
        "stats": {
          "hp": 600.0,
          "hpperlevel": 92.0,
          "mp": 273.8,
          "mpperlevel": 35.0,
          "movespeed": 345.0,
          "armor": 25.88,
          "armorperlevel": 3.5,
          "spellblock": 32.1,
          "spellblockperlevel": 1.25,
          "attackrange": 175.0,
          "hpregen": 8.175,
          "hpregenperlevel": 0.7,
          "mpregen": 7.255,
          "mpregenperlevel": 0.45,
          "crit": 0.0,
          "critperlevel": 0.0,
          "attackdamage": 57.544,
          "attackdamageperlevel": 3.3,
          "attackspeedoffset": 0.0,
          "attackspeedperlevel": 2.6
        }
      },
      "Yasuo": {
        "version": "6.24.1",
        "id": "Yasuo",
        "key": "157",
        "name": "Yasuo",
        "title": "La Espada sin Honor",
        "blurb": "Yasuo es un hombre resuelto, un espadachín ágil que utiliza el mismísimo viento para eliminar a sus enemigos. Pero el que había sido un guerrero orgulloso ha caído en desgracia debido a una acusación falsa, y se ha visto forzado a luchar ...",
        "info": {
          "attack": 8,
          "defense": 4,
          "magic": 4,
          "difficulty": 10
        },
        "image": {
          "full": "Yasuo.png",
          "sprite": "champion4.png",
          "group": "champion",
          "x": 192,
          "y": 0,
          "w": 48,
          "h": 48
        },
        "tags": ["Fighter", "Assassin"],
        "partype": "Wind",
        "stats": {
          "hp": 517.76,
          "hpperlevel": 82.0,
          "mp": 100.0,
          "mpperlevel": 0.0,
          "movespeed": 345.0,
          "armor": 24.712,
          "armorperlevel": 3.4,
          "spellblock": 30.0,
          "spellblockperlevel": 0.0,
          "attackrange": 175.0,
          "hpregen": 6.51,
          "hpregenperlevel": 0.9,
          "mpregen": 0.0,
          "mpregenperlevel": 0.0,
          "crit": 0.0,
          "critperlevel": 0.0,
          "attackdamage": 55.376,
          "attackdamageperlevel": 3.2,
          "attackspeedoffset": -0.067,
          "attackspeedperlevel": 2.5
        }
      },
      "Yorick": {
        "version": "6.24.1",
        "id": "Yorick",
        "key": "83",
        "name": "Yorick",
        "title": "El Pastor de las Almas Perdidas",
        "blurb": "''Estas islas... ¡cómo gritan!''.<br>Yorick, último superviviente de una orden religiosa olvidada hace tiempo, carga con la bendición y la maldición de su poder sobre los muertos. Atrapado en las Islas de la Sombra, sus únicos compañeros son los ...",
        "info": {
          "attack": 6,
          "defense": 6,
          "magic": 4,
          "difficulty": 6
        },
        "image": {
          "full": "Yorick.png",
          "sprite": "champion4.png",
          "group": "champion",
          "x": 240,
          "y": 0,
          "w": 48,
          "h": 48
        },
        "tags": ["Fighter", "Tank"],
        "partype": "MP",
        "stats": {
          "hp": 580.0,
          "hpperlevel": 100.0,
          "mp": 300.0,
          "mpperlevel": 40.0,
          "movespeed": 340.0,
          "armor": 30.0,
          "armorperlevel": 4.0,
          "spellblock": 32.0,
          "spellblockperlevel": 1.25,
          "attackrange": 175.0,
          "hpregen": 8.0,
          "hpregenperlevel": 0.8,
          "mpregen": 7.5,
          "mpregenperlevel": 0.75,
          "crit": 0.0,
          "critperlevel": 0.0,
          "attackdamage": 57.0,
          "attackdamageperlevel": 5.0,
          "attackspeedoffset": 0.0,
          "attackspeedperlevel": 2.0
        }
      },
      "Zac": {
        "version": "6.24.1",
        "id": "Zac",
        "key": "154",
        "name": "Zac",
        "title": "El Arma Secreta",
        "blurb": "Zac es el producto de un experimento de Zaun que consistía en fabricar un supersoldado con ingeniería hexquímica. El Combatiente Amorfo de Zaun. Combina la fuerza bruta con una flexibilidad sin límites, es una bestia de derribo muy versátil: un ...",
        "info": {
          "attack": 3,
          "defense": 7,
          "magic": 7,
          "difficulty": 8
        },
        "image": {
          "full": "Zac.png",
          "sprite": "champion4.png",
          "group": "champion",
          "x": 288,
          "y": 0,
          "w": 48,
          "h": 48
        },
        "tags": ["Tank", "Fighter"],
        "partype": "None",
        "stats": {
          "hp": 614.6,
          "hpperlevel": 95.0,
          "mp": 0.0,
          "mpperlevel": 0.0,
          "movespeed": 340.0,
          "armor": 23.88,
          "armorperlevel": 3.5,
          "spellblock": 32.1,
          "spellblockperlevel": 1.25,
          "attackrange": 175.0,
          "hpregen": 7.92,
          "hpregenperlevel": 0.55,
          "mpregen": 0.0,
          "mpregenperlevel": 0.0,
          "crit": 0.0,
          "critperlevel": 0.0,
          "attackdamage": 59.67,
          "attackdamageperlevel": 3.375,
          "attackspeedoffset": -0.02,
          "attackspeedperlevel": 1.6
        }
      },
      "Zed": {
        "version": "6.24.1",
        "id": "Zed",
        "key": "238",
        "name": "Zed",
        "title": "El Maestro de las Sombras",
        "blurb": "Zed es el primer ninja en 200 años que ha desbloqueado las antiguas artes prohibidas. Desafió a su clan y a su maestro, rompiendo con el equilibrio y la disciplina que lo habían encadenado durante toda su vida. Ahora, Zed ofrece poder a quienes ...",
        "info": {
          "attack": 9,
          "defense": 2,
          "magic": 1,
          "difficulty": 7
        },
        "image": {
          "full": "Zed.png",
          "sprite": "champion4.png",
          "group": "champion",
          "x": 336,
          "y": 0,
          "w": 48,
          "h": 48
        },
        "tags": ["Assassin", "Fighter"],
        "partype": "Energy",
        "stats": {
          "hp": 579.4,
          "hpperlevel": 80.0,
          "mp": 200.0,
          "mpperlevel": 0.0,
          "movespeed": 345.0,
          "armor": 26.88,
          "armorperlevel": 3.5,
          "spellblock": 32.1,
          "spellblockperlevel": 1.25,
          "attackrange": 125.0,
          "hpregen": 7.09,
          "hpregenperlevel": 0.65,
          "mpregen": 50.0,
          "mpregenperlevel": 0.0,
          "crit": 0.0,
          "critperlevel": 0.0,
          "attackdamage": 54.712,
          "attackdamageperlevel": 3.4,
          "attackspeedoffset": -0.03,
          "attackspeedperlevel": 2.1
        }
      },
      "Ziggs": {
        "version": "6.24.1",
        "id": "Ziggs",
        "key": "115",
        "name": "Ziggs",
        "title": "El Experto en Hexplosivos",
        "blurb": "Ziggs nació con un talento especial para trastear con aparatos, aunque su naturaleza hiperactiva y caótica era inusual entre los científicos yordles. Como su mayor aspiración era convertirse en un inventor venerado como Heimerdinger, trabajó incesante ...",
        "info": {
          "attack": 2,
          "defense": 4,
          "magic": 9,
          "difficulty": 4
        },
        "image": {
          "full": "Ziggs.png",
          "sprite": "champion4.png",
          "group": "champion",
          "x": 384,
          "y": 0,
          "w": 48,
          "h": 48
        },
        "tags": ["Mage"],
        "partype": "MP",
        "stats": {
          "hp": 524.4,
          "hpperlevel": 80.0,
          "mp": 384.0,
          "mpperlevel": 47.0,
          "movespeed": 325.0,
          "armor": 21.544,
          "armorperlevel": 3.3,
          "spellblock": 30.0,
          "spellblockperlevel": 0.0,
          "attackrange": 550.0,
          "hpregen": 6.255,
          "hpregenperlevel": 0.6,
          "mpregen": 6.0,
          "mpregenperlevel": 0.8,
          "crit": 0.0,
          "critperlevel": 0.0,
          "attackdamage": 54.208,
          "attackdamageperlevel": 3.1,
          "attackspeedoffset": -0.04734,
          "attackspeedperlevel": 2.0
        }
      },
      "Zilean": {
        "version": "6.24.1",
        "id": "Zilean",
        "key": "26",
        "name": "Zilean",
        "title": "El Guardián del Tiempo",
        "blurb": "En los páramos de Urtistán existió una vez una gran ciudad. Sucumbió hace tiempo en una terrible Guerra Rúnica, como muchas de las tierras al otro lado de la Gran Barrera. Sin embargo, hubo un superviviente: un hechicero llamado Zilean. Obsesionado ...",
        "info": {
          "attack": 2,
          "defense": 5,
          "magic": 8,
          "difficulty": 6
        },
        "image": {
          "full": "Zilean.png",
          "sprite": "champion4.png",
          "group": "champion",
          "x": 432,
          "y": 0,
          "w": 48,
          "h": 48
        },
        "tags": ["Support", "Mage"],
        "partype": "MP",
        "stats": {
          "hp": 499.28,
          "hpperlevel": 77.0,
          "mp": 360.8,
          "mpperlevel": 60.0,
          "movespeed": 335.0,
          "armor": 19.134,
          "armorperlevel": 3.8,
          "spellblock": 30.0,
          "spellblockperlevel": 0.0,
          "attackrange": 550.0,
          "hpregen": 5.44,
          "hpregenperlevel": 0.5,
          "mpregen": 8.5,
          "mpregenperlevel": 0.8,
          "crit": 0.0,
          "critperlevel": 0.0,
          "attackdamage": 51.64,
          "attackdamageperlevel": 3.0,
          "attackspeedoffset": 0.0,
          "attackspeedperlevel": 2.13
        }
      },
      "Zyra": {
        "version": "6.24.1",
        "id": "Zyra",
        "key": "143",
        "name": "Zyra",
        "title": "La Dama de Espinas",
        "blurb": "Deseando tomar las riendas de su propio destino, Zyra, la antigua planta moribunda, transfirió su consciencia a un cuerpo humano con el objetivo de conseguir una segunda oportunidad. Siglos atrás, su raza había dominado la selva de Kumungu, valiéndose ...",
        "info": {
          "attack": 4,
          "defense": 3,
          "magic": 8,
          "difficulty": 7
        },
        "image": {
          "full": "Zyra.png",
          "sprite": "champion4.png",
          "group": "champion",
          "x": 0,
          "y": 48,
          "w": 48,
          "h": 48
        },
        "tags": ["Mage", "Support"],
        "partype": "MP",
        "stats": {
          "hp": 499.32,
          "hpperlevel": 74.0,
          "mp": 334.0,
          "mpperlevel": 50.0,
          "movespeed": 340.0,
          "armor": 20.04,
          "armorperlevel": 3.0,
          "spellblock": 30.0,
          "spellblockperlevel": 0.0,
          "attackrange": 575.0,
          "hpregen": 5.69,
          "hpregenperlevel": 0.5,
          "mpregen": 8.5,
          "mpregenperlevel": 0.8,
          "crit": 0.0,
          "critperlevel": 0.0,
          "attackdamage": 53.376,
          "attackdamageperlevel": 3.2,
          "attackspeedoffset": 0.0,
          "attackspeedperlevel": 2.11
        }
      }
    }
  }
};