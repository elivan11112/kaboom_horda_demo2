// =========================================================
// KABOOM HORDA  -  DEMO 1.1  (sin crafteo ni materiales, arreglos)
// =========================================================

enum EstadoJuego {
    MenuPrincipal,
    SeleccionSkin,
    MisionesMenu,
    OpcionesMenu,
    CreditosMenu,
    TablaRecords,
    Jugando,
    MenuSubirNivel,
    ConfirmandoMejora,
    TiendaInteractiva,
    Inventario,
    DentroCasa,
    Crafteo,
    GameOver
}

namespace SpriteKind {
    export const ProyectilJugador = SpriteKind.create()
    export const SemillaXP = SpriteKind.create()
    export const PocionVida = SpriteKind.create()
    export const MonedaOro = SpriteKind.create()
    export const TiendaMercader = SpriteKind.create()
    export const ProyectilEnemigo = SpriteKind.create()
    export const EscudoProtector = SpriteKind.create()
    export const JefeEnemigo = SpriteKind.create()
    export const Orbe = SpriteKind.create()
    export const Recurso = SpriteKind.create()
    export const Casa = SpriteKind.create()
    export const Npc = SpriteKind.create()
    export const Bomba = SpriteKind.create()
}

interface MejoraProcedural {
    titulo: string
    descripcion: string
    tipoStat: number
    valorPotencia: number
    rarezaColor: number
}

interface TextoFlotante {
    x: number
    y: number
    txt: string
    color: number
    t0: number
    fin: number
}

interface Chunk {
    cx: number
    cy: number
    sprites: Sprite[]
}

interface Ciudad {
    cx: number
    cy: number
    x: number
    y: number
    nombre: string
}

// ---------------------------------------------------------
// DEMO: limites (cambia estos numeros si quieres ajustar la demo)
// ---------------------------------------------------------
const DEMO_OLEADAS = 5          // al vencer esta oleada (jefe) la demo termina
const DEMO_SKINS = 2            // personajes disponibles (RECLUTA y MIDAS)
let demoGanada: boolean = false

// Textos del titulo (cambialos a tu gusto)
const TITULO_A: string = "KABOOM"
const TITULO_B: string = "HORDA"
const AUTOR: string = "IVAN PERALTA"

// =========================================================
// ESTADO GLOBAL
// =========================================================

let estadoActual: EstadoJuego = EstadoJuego.MenuPrincipal

// Ajustes
let volumenAudio: number = 50
let nivelDificultad: number = 1
let skinSeleccionada: number = 0
let skinCursor: number = 0
const NOMBRES_DIFICULTAD: string[] = ["PRINCIPIANTE", "SUPERVIVIENTE"]

// Personajes (NO usar 10 ni 11 como colores, son marcadores de la plantilla)
const NOMBRES_SKINS: string[] = ["RECLUTA", "MIDAS", "BRASAS", "RASTRO", "DULCE", "GELIDO", "SANGRE", "SOMBRA"]
const SKIN_PRINCIPAL: number[] = [9, 5, 4, 7, 3, 1, 2, 12]
const SKIN_OSCURO: number[] = [8, 4, 2, 6, 12, 9, 12, 8]
const PERK_TXT: string[] = [
    "SIN BONUS",
    "+50% ORO",
    "+10 DANO",
    "+20 VELOC.",
    "+40 VIDA MAX",
    "EMPIEZA CON\nNOVA",
    "+15% CRITICO",
    "EMPIEZA CON\nDASH +10%\nESQUIVA"
]

// Misiones para desbloquear personajes (indice = personaje)
const META_MISION: number[] = [0, 100, 250, 8, 1, 10, 2000, 6]
const MISION_LARGA: string[] = [
    "",
    "RECOGE 100\nMONEDAS",
    "MATA 250\nENEMIGOS",
    "LLEGA A LA\nOLEADA 8",
    "DERROTA A\nUN JEFE",
    "ALCANZA EL\nNIVEL 10",
    "2000 PTS EN\nUNA PARTIDA",
    "OLEADA 6 EN\nPESADILLA"
]
const MISION_CORTA: string[] = [
    "",
    "RECOGE 100 MONEDAS (TOTAL)",
    "MATA 250 ENEMIGOS (TOTAL)",
    "LLEGA A LA OLEADA 8",
    "DERROTA A UN JEFE",
    "ALCANZA EL NIVEL 10",
    "2000 PUNTOS EN UNA PARTIDA",
    "OLEADA 6 EN PESADILLA"
]
let desbloqueado: boolean[] = []

// Estadisticas guardadas
let statKills: number = 0
let statMonedas: number = 0
let statJefes: number = 0
let statMaxOleada: number = 0
let statMaxNivel: number = 0
let statMaxPts: number = 0
let statNoche: number = 0
let statPartidas: number = 0

// Estadisticas de la partida actual
let killsPartida: number = 0
let monedasPartida: number = 0
let jefesPartida: number = 0
let tiempoPartidaMs: number = 0
let sumarPartida: number = 0
let ultimoTickMs: number = 0
let nuevosDesbloqueos: number[] = []

// Navegacion de menu
let opcionMenuSel: number = 0
const OPCIONES_MENU: string[] = ["JUGAR", "PERSONAJES", "MISIONES", "RECORDS", "OPCIONES", "CREDITOS"]
let opcionOpcionesSel: number = 0
const OPCIONES_SUBMENU: string[] = ["VOLUMEN", "DIFICULTAD", "VOLVER"]

// Stats de combate del jugador
let vidaActual: number = 100
let vidaMaxima: number = 100
let velMovimiento: number = 95
let nivelJugador: number = 1
let xpActual: number = 0
let xpSiguienteNivel: number = 100
let puntosPuntuacion: number = 0
let cantidadMonedas: number = 0
let acumMonedas: number = 0

// Invulnerabilidad corta
let invulnerableHasta: number = 0
const INVULNERABILIDAD_MS = 400

// V22: estado nuevo (biomas, mejoras de crafteo, caches de disparo y suelo)
let biomaActual: number = -1
let proxToastBioma: number = 0
let colSombra: number = 6
let mejorasCraft: number[] = [0, 0, 0, 0, 0]
let objetivoCache: Sprite = null
let proxBusqueda: number = 0
let balasVivas: number = 0
let ultimoSonidoDisparo: number = 0
let proxCheckOleada: number = 0
let cacheTx0: number = -99999
let cacheTy0: number = -99999
let cacheTiles: Image[] = []
let slashHacha: Image = null

// Arsenal y atributos
let danoAtaque: number = 25
let cadenciaDisparoMs: number = 150
let ultimoDisparoMs: number = 0
let numProyectiles: number = 1
let velProyectil: number = 240
let probabilidadCritico: number = 10
let multiplicadorCritico: number = 2.0
let radioAtraccionXP: number = 30
let multiplicadorXP: number = 1.0
let armaduraReduccion: number = 0
let multiplicadorMonedas: number = 1.0
let radioAtraccionMonedas: number = 40
let puntosEscudoActivo: number = 0

// Mejoras nuevas
let perforacion: number = 0
let vampirismo: number = 0
let regenPorSeg: number = 0
let proxRegen: number = 0
let espinas: number = 0
let dropMonedaExtra: number = 0
let nivelExplosivas: number = 0
let nivelOrbes: number = 0
let nivelRayo: number = 0
let proxRayo: number = 0
let nivelAura: number = 0
let proxAura: number = 0
let esquivaProb: number = 0
let nivelHielo: number = 0
let vidasExtra: number = 0

// Habilidades activas
let nivelHabilidadDash: number = 0
let nivelHabilidadNova: number = 0
let cooldownDashMs: number = 0
let cooldownNovaMs: number = 0

// Oleadas
let oleadaActual: number = 1
let bichosEnOleada: number = 12
let bichosRestantesPorSpawn: number = 0
let tiempoProximoSpawn: number = 0
let totalBichosOleadaInicial: number = 12
let tiposVistos: boolean[] = []

// Cartas de mejora
let opcionesCartasPresentadas: MejoraProcedural[] = []
let indiceCartaSeleccionada: number = 0
let cartaPendienteConfirmacion: MejoraProcedural = null

// Tienda
let opcionTiendaSel: number = 0
let tiempoInicioPermanenciaTienda: number = 0
let enZonaActivacionTienda: boolean = false
let tiendaActivaSprite: Sprite = null
let comprasTienda: number[] = [0, 0, 0, 0, 0, 0, 0, 0]
let mensajeTienda: string = ""
let mensajeTiendaColor: number = 1
let mensajeTiendaHasta: number = 0

// Game over
let tiempoMuerteMs: number = 0
let opcionGameOverSel: number = 0
let nuevoRecord: boolean = false
let ultimoAtacante: string = ""

// Avisos en pantalla
let bannerL1: string = ""
let bannerL2: string = ""
let bannerCol: number = 5
let bannerHasta: number = 0
let toastL1: string = ""
let toastL2: string = ""
let toastCol: number = 9
let toastHasta: number = 0
let textosFlotantes: TextoFlotante[] = []

// Sprites y punteria
let jugadorSprite: Sprite = null
let spriteEscudo: Sprite = null
let orbes: Sprite[] = []
let particulasFondo: Sprite[] = []
let ultimaDirX: number = 1
let ultimaDirY: number = 0

// =========================================================
// ARTE PIXEL ART
// =========================================================

// --- JUGADOR: plantilla (a = color principal, b = color oscuro) ---
const imgJugadorBase = img`
    .....ffffff.....
    ....faaaaaaf....
    ...faaaaaaaaf...
    ...fabbbbbbaf...
    ..ffddddddddff..
    ..fddffddffddf..
    ...fddddddddf...
    ....ffddddff....
    ..faaaaaaaaaaf..
    .fdfaaabbaaafdf.
    .fdfaaabbaaafdf.
    ..ffaaaaaaaaff..
    ...fbbbffbbbf...
    ...fbbf..fbbf...
    ...ffff..ffff...
    ................
`

// --- ENEMIGO 1: Slime rosa ---
const imgSlime = img`
    ................
    ................
    ................
    .....ffffff.....
    ...ff333333ff...
    ..f3333333333f..
    .f331333333333f.
    .f331133331133f.
    .f33ff3333ff33f.
    .f333333333333f.
    .faaaaaaaaaaaaf.
    ..faaaaaaaaaaf..
    ...ffffffffff...
    ................
    ................
    ................
`

// --- ENEMIGO 2: Escarabajo naranja ---
const imgEscarabajo = img`
    ................
    .....f....f.....
    ......f..f......
    .....ffffff.....
    ....f444444f....
    ...f41144114f...
    ..f4444ff4444f..
    f.f4444ff4444f.f
    .f44244ff44244f.
    f.f4444ff4444f.f
    .ff4444ff4444ff.
    ..f4444ff4444f..
    ...f44444444f...
    ....f444444f....
    .....ffffff.....
    ................
`

// --- ENEMIGO 3: Fantasma blanco ---
const imgFantasma = img`
    ................
    ................
    ....ffffffff....
    ...f11111111f...
    ..f1111111111f..
    ..f1881111881f..
    ..f1881111881f..
    ..f1311111131f..
    ..f1111ff1111f..
    ..f1111111111f..
    ..f1111111111f..
    ..f1111111111f..
    ..f1111111111f..
    ..fff.ffff.fff..
    ................
    ................
`

// --- ENEMIGO 4: Esqueleto arquero (dispara flechas) ---
const imgArquero = img`
    ................
    .....ffffff.....
    ....f111111f....
    ...f11111111f...
    ...f1ff11ff1f...
    ...f1ff11ff1f...
    ...f11111111f...
    ....f1f11f1f....
    .....ffffff.....
    ..e.ff1111ff.e..
    .e5.f1ffff1f.5e.
    .e..f111111f..e.
    .e5.f111111f.5e.
    ..e.ff1ff1ff.e..
    ....f11ff11f....
    ....ff.ff.ff....
`

// --- ENEMIGO 5: Brujo (lanza magia) ---
const imgBrujo = img`
    .......ff.......
    ......faaf......
    .....faaaaf.....
    ....faaa5aaf....
    ...faaaaaaaaf...
    ..ffffffffffff..
    ....fddddddf....
    ....fd1dd1df....
    ....fddddddf....
    .....f1111f.....
    ...ffaaaaaaff...
    ..faaaabbaaaaf..
    ..faaaabbaaaaf..
    ..faaaaaaaaaaf..
    ..ffffffffffff..
    ................
`

// --- ENEMIGO 6: Bombita kamikaze ---
const imgBombita = img`
    .........45.....
    ........e.......
    .......e........
    .....ffffff.....
    ...ff222222ff...
    ..f2212222222f..
    .f222122222222f.
    .f225522225522f.
    .f22ff2222ff22f.
    .f222222222222f.
    .f222222222222f.
    .f222222222222f.
    ..f2222222222f..
    ...ff222222ff...
    .....ff..ff.....
    ................
`

// --- ENEMIGO 7: Gelatina (se divide al morir) ---
const imgGelatina = img`
    ................
    ................
    ....ffffffff....
    ..ff77777777ff..
    .f777777777777f.
    .f771777777777f.
    f77117777777777f
    f77ff77777ff777f
    f77777777777777f
    f77777777777777f
    f77777ffff77777f
    .f777777777777f.
    ..ff77777777ff..
    ....ffffffff....
    ................
    ................
`

// --- ENEMIGO 8: Mini gelatina (8x8) ---
const imgMiniGel = img`
    ........
    ..ffff..
    .f7777f.
    f7f77f7f
    f777777f
    f777777f
    .f7777f.
    ..ffff..
`

// --- JEFE: se dibuja a 16x16 y se duplica a 32x32 ---
const imgJefeBase = img`
    .f............f.
    .f5f........f5f.
    .f5f.ffffff.f5f.
    ..f5faaaaaaf5f..
    ...faaaaaaaaf...
    ..faa22aa22aaf..
    ..faaffaaffaaf..
    ..faaaaaaaaaaf..
    ..fa1a1aa1a1af..
    .ffaaaaaaaaaaff.
    faafaaaaaaaafaaf
    faafaaabbaaafaaf
    .ffaaaaaaaaaaff.
    ..faaaaaaaaaaf..
    ..faaf....faaf..
    ..ffff....ffff..
`

// --- Logo: bomba ---
const imgBombaLogo = img`
    ...........45...
    ..........e.....
    .........e......
    ....ffffffff....
    ..ffbbccccccff..
    .fbbccccccccccf.
    .fbcccccccccccf.
    .fccccccccccccf.
    .fccccccccccccf.
    .fccccccccccccf.
    .fccccccccccccf.
    ..fccccccccccf..
    ...ffccccccff...
    .....ffffff.....
    ................
    ................
`

// --- Mercader ---
const imgMercader = img`
    ................
    .....ffffff.....
    ....faaaaaaf....
    ...faaaaaaaaf...
    ...fafddddfaf...
    ...faf5dd5faf...
    ...fafddddfaf...
    ...faaffffaaf...
    ..faaaaaaaaaaf..
    .faaaaa44aaaaaf.
    .faaaaaaaaaaaaf.
    .faaaaaaaaaaaaf.
    ..faaaaaaaaaaf..
    ..ffffffffffff..
    ................
    ................
`

// --- Balas, gemas y monedas (8x8) ---
const imgBala = img`
    ........
    ..4554..
    .451154.
    .511115.
    .511115.
    .451154.
    ..4554..
    ........
`

const imgBalaEnemiga = img`
    ........
    ..2222..
    .255552.
    .251152.
    .251152.
    .255552.
    ..2222..
    ........
`

const imgBalaMagica = img`
    ........
    ...bb...
    ..bbab..
    .bbaabb.
    .bbaabb.
    ..bbab..
    ...bb...
    ........
`

const imgGemaXP = img`
    ...88...
    ..8998..
    .891998.
    .899998.
    .899998.
    ..8998..
    ...88...
    ........
`

const imgGemaVida = img`
    ........
    .22..22.
    21222222
    22222222
    .222222.
    ..2222..
    ...22...
    ........
`

const imgMoneda = img`
    ..4444..
    .455554.
    45511554
    45515554
    45515554
    45555554
    .455554.
    ..4444..
`

const imgMoneda2 = img`
    ...44...
    ..4554..
    ..4514..
    ..4514..
    ..4514..
    ..4514..
    ..4554..
    ...44...
`

const imgMoneda3 = img`
    ....4...
    ...45...
    ...45...
    ...45...
    ...45...
    ...45...
    ...45...
    ....4...
`

// --- Iconos de la tienda (8x8) ---
const imgIconoEscudo = img`
    .888888.
    88999988
    89999998
    89999998
    .899998.
    .899998.
    ..8998..
    ...88...
`

const imgIconoDano = img`
    ...44...
    ...44...
    .444444.
    44455444
    44455444
    .444444.
    ...44...
    ...44...
`

const imgIconoRayo = img`
    ....55..
    ...55...
    ..55....
    .55555..
    ...55...
    ..55....
    ..5.....
    ........
`

const imgIconoSalir = img`
    ........
    ...2....
    ..22....
    .2222222
    ..22....
    ...2....
    ........
    ........
`

// =========================================================
// UTILIDADES DE IMAGEN
// =========================================================

function desplazarImagen(src: Image, dy: number): Image {
    let r = image.create(src.width, src.height)
    r.drawTransparentImage(src, 0, dy)
    return r
}

function recolorSkin(base: Image, principal: number, oscuro: number): Image {
    let r = base.clone()
    r.replace(11, oscuro)
    r.replace(10, principal)
    return r
}

function reemplazarColor(src: Image, de: number, a: number): Image {
    let r = src.clone()
    r.replace(de, a)
    return r
}

function crearSilueta(src: Image): Image {
    let r = src.clone()
    for (let c = 1; c <= 14; c++) r.replace(c, 12)
    return r
}

function crearFramesJefe(variante: number): Image[] {
    let base = imgJefeBase.clone()
    let col = COLORES_JEFE[variante % COLORES_JEFE.length]
    base.replace(10, col)
    let grande = base.doubled()
    return [grande, desplazarImagen(grande, 1)]
}

const COLORES_JEFE: number[] = [10, 7, 9, 4, 3]
const NOMBRES_JEFE: string[] = ["REY BOMBA", "COLOSO", "HIDRA", "TIRANO", "DEVORADOR"]

// Frames de animacion
const FRAMES_SLIME: Image[] = [imgSlime, desplazarImagen(imgSlime, 1)]
const FRAMES_ESCARABAJO: Image[] = [imgEscarabajo, desplazarImagen(imgEscarabajo, 1)]
const FRAMES_FANTASMA: Image[] = [imgFantasma, desplazarImagen(imgFantasma, -1)]
const FRAMES_ARQUERO: Image[] = [imgArquero, desplazarImagen(imgArquero, 1)]
const FRAMES_BRUJO: Image[] = [imgBrujo, desplazarImagen(imgBrujo, -1)]
const FRAMES_BOMBITA: Image[] = [imgBombita, desplazarImagen(imgBombita, 1)]
const FRAMES_GELATINA: Image[] = [imgGelatina, desplazarImagen(imgGelatina, 1)]
const FRAMES_MINI: Image[] = [imgMiniGel, desplazarImagen(imgMiniGel, 1)]
const FRAMES_TIPO: Image[][] = [FRAMES_SLIME, FRAMES_ESCARABAJO, FRAMES_FANTASMA, FRAMES_ARQUERO, FRAMES_BRUJO, FRAMES_BOMBITA, FRAMES_GELATINA, FRAMES_MINI]
const FRAMES_MONEDA: Image[] = [imgMoneda, imgMoneda2, imgMoneda3, imgMoneda2]

// Tipos de enemigo: 0 slime, 1 escarabajo, 2 fantasma, 3 arquero, 4 brujo, 5 bombita, 6 gelatina, 7 mini
const HP_TIPO: number[] = [1.0, 1.8, 0.7, 0.8, 1.2, 0.6, 1.6, 0.4]
const DANO_TIPO: number[] = [1.0, 1.3, 1.0, 1.0, 1.2, 2.0, 1.0, 0.8]
const VEL_TIPO: number[] = [1.0, 0.8, 1.3, 0.75, 0.6, 1.5, 0.7, 1.2]
const NOMBRE_TIPO: string[] = ["SLIME", "ESCARABAJO", "FANTASMA", "ARQUERO", "BRUJO", "BOMBITA", "GELATINA", "MINI GEL"]

// Skins y vistas previas
let jugadorFrameA: Image = recolorSkin(imgJugadorBase, SKIN_PRINCIPAL[0], SKIN_OSCURO[0])
let jugadorFrameB: Image = desplazarImagen(jugadorFrameA, 1)
let previewsSkins: Image[] = []
let previewsBloqueadas: Image[] = []
for (let i = 0; i < SKIN_PRINCIPAL.length; i++) {
    let pv = recolorSkin(imgJugadorBase, SKIN_PRINCIPAL[i], SKIN_OSCURO[i]).doubled().doubled()
    previewsSkins.push(pv)
    previewsBloqueadas.push(crearSilueta(pv))
}

// Iconos de tienda
const imgGemaVidaMax: Image = reemplazarColor(imgGemaVida, 2, 7)
const imgOrbe: Image = crearImgOrbe()
let ICONOS_TIENDA: Image[] = [imgGemaVida, imgIconoEscudo, imgIconoDano, imgBala, imgMoneda, imgGemaVidaMax, imgIconoRayo, imgIconoSalir]

function crearImgOrbe(): Image {
    let o = image.create(8, 8)
    o.fillCircle(4, 4, 3, 9)
    o.drawCircle(4, 4, 3, 8)
    o.setPixel(3, 3, 1)
    o.setPixel(4, 3, 1)
    return o
}

// Efecto de explosion / puff
function crearFramesPuff(): Image[] {
    let f: Image[] = []
    let a = image.create(16, 16)
    a.fillCircle(8, 8, 3, 1)
    f.push(a)
    let b = image.create(16, 16)
    b.fillCircle(8, 8, 6, 5)
    b.fillCircle(8, 8, 4, 1)
    f.push(b)
    let c = image.create(16, 16)
    c.drawCircle(8, 8, 7, 4)
    c.fillCircle(8, 8, 3, 5)
    f.push(c)
    let d = image.create(16, 16)
    for (let k = 0; k < 8; k++) {
        let ang = k * Math.PI / 4
        d.fillRect(7 + Math.round(Math.cos(ang) * 7), 7 + Math.round(Math.sin(ang) * 7), 2, 2, 4)
    }
    f.push(d)
    return f
}
const FRAMES_PUFF: Image[] = crearFramesPuff()

// Zona de la tienda: anillo punteado + mercader
function crearZonaTienda(): Image {
    let im = image.create(48, 48)
    let contador = 0
    for (let a = 0; a < 360; a += 6) {
        let r = a * Math.PI / 180
        let col = (contador % 2 == 0) ? 5 : 4
        im.fillRect(Math.round(24 + Math.cos(r) * 22), Math.round(24 + Math.sin(r) * 22), 2, 2, col)
        contador++
    }
    im.drawCircle(24, 24, 18, 12)
    im.drawTransparentImage(imgMercader, 16, 16)
    return im
}
const imgCirculoTienda: Image = crearZonaTienda()

// Burbuja del escudo
function crearImgEscudo(): Image {
    let e = image.create(24, 24)
    e.drawCircle(12, 12, 11, 9)
    e.drawCircle(12, 12, 10, 8)
    e.fillRect(5, 5, 3, 1, 1)
    e.fillRect(4, 6, 1, 3, 1)
    return e
}
const imgEscudo: Image = crearImgEscudo()

// =========================================================
// MAPA: SUELO INFINITO CON DECORACION
// =========================================================

function crearTilesSuelo(): Image[] {
    let tiles: Image[] = []
    for (let v = 0; v < 8; v++) {
        let t = image.create(16, 16)
        t.fill(7)
        if (v == 0 || v == 1) {
            for (let k = 0; k < 7; k++) t.setPixel(Math.randomRange(0, 15), Math.randomRange(0, 15), 6)
        } else if (v == 2 || v == 3) {
            for (let k = 0; k < 3; k++) {
                let gx = Math.randomRange(2, 13)
                let gy = Math.randomRange(3, 14)
                t.setPixel(gx, gy, 6)
                t.setPixel(gx, gy - 1, 6)
                t.setPixel(gx - 1, gy - 2, 6)
                t.setPixel(gx + 1, gy - 2, 6)
            }
        } else if (v == 4 || v == 5) {
            let petalo = (v == 4) ? 1 : 3
            t.setPixel(8, 10, 6)
            t.setPixel(8, 11, 6)
            t.setPixel(8, 12, 6)
            t.setPixel(7, 11, 6)
            t.setPixel(9, 10, 6)
            t.setPixel(7, 8, petalo)
            t.setPixel(9, 8, petalo)
            t.setPixel(8, 7, petalo)
            t.setPixel(8, 9, petalo)
            t.setPixel(8, 8, 5)
        } else if (v == 6) {
            t.fillRect(4, 9, 5, 3, 13)
            t.fillRect(4, 11, 5, 1, 14)
            t.setPixel(5, 9, 1)
            t.fillRect(10, 4, 3, 2, 13)
            t.fillRect(10, 5, 3, 1, 14)
            t.setPixel(4, 9, 7)
            t.setPixel(8, 9, 7)
        } else {
            t.fillCircle(8, 9, 6, 15)
            t.fillCircle(8, 9, 5, 6)
            t.fillCircle(6, 7, 2, 7)
            t.setPixel(10, 9, 2)
            t.setPixel(5, 11, 2)
            t.setPixel(9, 7, 7)
        }
        tiles.push(t)
    }
    return tiles
}
const tilesSuelo: Image[] = crearTilesSuelo()

// ---------------------------------------------------------
// V22: BIOMAS (0 pradera, 1 bosque, 2 desierto, 3 tundra, 4 pantano)
// ---------------------------------------------------------
const BIOMA_NOMBRE: string[] = ["PRADERA", "BOSQUE", "DESIERTO", "TUNDRA", "PANTANO"]
const BIOMA_TIP: string[] = ["TIERRAS VERDES", "MADERA Y HONGOS", "CACTUS Y HIERRO", "CRISTALES DE HIELO", "ESPORAS Y HONGOS"]
const BIOMA_COL: number[] = [7, 6, 5, 9, 11]
const SOMBRA_BIOMA: number[] = [6, 6, 14, 9, 12]
// Tamano de una region de bioma en tiles (120 tiles = 1920 px)
const REG_TILES = 120

const SUELO_BASE: number[] = [7, 7, 13, 1, 6]
const SUELO_PUNTO: number[] = [6, 6, 4, 9, 7]
const SUELO_ACENTO: number[] = [1, 2, 14, 8, 2]
const SUELO_ACENTO2: number[] = [3, 4, 4, 9, 11]
const SUELO_PIEDRA1: number[] = [13, 14, 14, 9, 12]
const SUELO_PIEDRA2: number[] = [14, 4, 4, 8, 8]
const SUELO_POZO: number[] = [6, 14, 14, 9, 8]

function crearTilesBioma(b: number): Image[] {
    let base = SUELO_BASE[b]
    let punto = SUELO_PUNTO[b]
    let tiles: Image[] = []
    for (let v = 0; v < 8; v++) {
        let t = image.create(16, 16)
        t.fill(base)
        if (v == 0 || v == 1) {
            let n = (b == 1) ? 11 : 7
            for (let k = 0; k < n; k++) t.setPixel(Math.randomRange(0, 15), Math.randomRange(0, 15), punto)
        } else if (v == 2 || v == 3) {
            for (let k = 0; k < 3; k++) {
                let gx = Math.randomRange(2, 13)
                let gy = Math.randomRange(3, 14)
                t.setPixel(gx, gy, punto)
                t.setPixel(gx, gy - 1, punto)
                t.setPixel(gx - 1, gy - 2, punto)
                t.setPixel(gx + 1, gy - 2, punto)
            }
        } else if (v == 4 || v == 5) {
            let petalo = (v == 4) ? SUELO_ACENTO[b] : SUELO_ACENTO2[b]
            t.setPixel(8, 10, punto)
            t.setPixel(8, 11, punto)
            t.setPixel(8, 12, punto)
            t.setPixel(7, 11, punto)
            t.setPixel(9, 10, punto)
            t.setPixel(7, 8, petalo)
            t.setPixel(9, 8, petalo)
            t.setPixel(8, 7, petalo)
            t.setPixel(8, 9, petalo)
            t.setPixel(8, 8, (b == 3) ? 1 : 5)
        } else if (v == 6) {
            t.fillRect(4, 9, 5, 3, SUELO_PIEDRA1[b])
            t.fillRect(4, 11, 5, 1, SUELO_PIEDRA2[b])
            t.setPixel(5, 9, 1)
            t.fillRect(10, 4, 3, 2, SUELO_PIEDRA1[b])
            t.fillRect(10, 5, 3, 1, SUELO_PIEDRA2[b])
            t.setPixel(4, 9, base)
            t.setPixel(8, 9, base)
        } else {
            t.fillCircle(8, 9, 6, 15)
            t.fillCircle(8, 9, 5, SUELO_POZO[b])
            t.fillCircle(6, 7, 2, base)
            t.setPixel(10, 9, SUELO_ACENTO[b])
            t.setPixel(5, 11, SUELO_ACENTO[b])
            t.setPixel(9, 7, base)
        }
        tiles.push(t)
    }
    return tiles
}

// La pradera (0) es el suelo original, sin tocar
const TILES_BIOMA: Image[][] = [tilesSuelo, crearTilesBioma(1), crearTilesBioma(2), crearTilesBioma(3), crearTilesBioma(4)]

// Hash para regiones grandes (biomas y celdas de ciudades). Reparte bien tambien con coordenadas
// negativas y todos los pasos intermedios caben en un entero de 32 bits.
function hashMacro(a: number, b: number, salt: number): number {
    let x = ((a % 4093) + 4093) % 4093
    let y = ((b % 4093) + 4093) % 4093
    let z = salt % 4093
    let h = (x * 1237 + y * 2341 + z * 3511 + 977) % 8191
    h = (h * h + x * 17 + y * 29 + 13) % 8191
    h = (h * 1103 + z * 77 + 5) % 8191
    return h % 4093
}

// Bioma de una region grande (la region de inicio siempre es pradera)
function biomaRegion(gx: number, gy: number): number {
    if (gx == 0 && gy == 0) return 0
    let h = hashMacro(gx, gy, 31)
    if (h < 2000) return 0
    return 1
}

// Bioma de un tile. El borde se "tiembla" con un hash para que no sea una recta
function biomaTile(tx: number, ty: number): number {
    let qx = Math.floor(tx / 2)
    let qy = Math.floor(ty / 2)
    let gx = Math.floor((tx + hashMacro(qx, qy, 41) % 9 - 4) / REG_TILES)
    let gy = Math.floor((ty + hashMacro(qx, qy, 42) % 9 - 4) / REG_TILES)
    return biomaRegion(gx, gy)
}

function biomaEn(x: number, y: number): number {
    return biomaTile(Math.floor(x / 16), Math.floor(y / 16))
}

function varianteTile(tx: number, ty: number): number {
    let h = Math.abs(((tx * 92821) ^ (ty * 68917)) % 29)
    let alt = (tx + ty) & 1
    if (h < 10) return alt
    if (h < 14) return 2 + alt
    if (h == 14) return 4
    if (h == 15) return 5
    if (h == 16) return 6
    if (h == 17) return 7
    return alt
}

function enPartida(): boolean {
    return estadoActual == EstadoJuego.Jugando || estadoActual == EstadoJuego.MenuSubirNivel ||
        estadoActual == EstadoJuego.ConfirmandoMejora || estadoActual == EstadoJuego.TiendaInteractiva ||
        estadoActual == EstadoJuego.Inventario || estadoActual == EstadoJuego.DentroCasa ||
        estadoActual == EstadoJuego.Crafteo || estadoActual == EstadoJuego.GameOver
}

// Suelo (capa mas profunda)
scene.createRenderable(-10, function (target: Image, camera: scene.Camera) {
    if (!enPartida()) return
    let ox = Math.floor(camera.drawOffsetX)
    let oy = Math.floor(camera.drawOffsetY)
    let tx0 = Math.floor(ox / 16)
    let ty0 = Math.floor(oy / 16)
    // Solo se recalculan los tiles al cruzar a otro tile (no en cada frame)
    if (tx0 != cacheTx0 || ty0 != cacheTy0) {
        cacheTx0 = tx0
        cacheTy0 = ty0
        cacheTiles = []
        for (let tx = tx0; tx <= tx0 + 10; tx++) {
            for (let ty = ty0; ty <= ty0 + 8; ty++) {
                cacheTiles.push(TILES_BIOMA[biomaTile(tx, ty)][varianteTile(tx, ty)])
            }
        }
    }
    let k = 0
    for (let tx = tx0; tx <= tx0 + 10; tx++) {
        for (let ty = ty0; ty <= ty0 + 8; ty++) {
            target.drawImage(cacheTiles[k], tx * 16 - ox, ty * 16 - oy)
            k++
        }
    }
})

// Sombras bajo los personajes
function dibujarSombra(target: Image, s: Sprite, camera: scene.Camera, mediaAncho: number, dy: number) {
    let cx = Math.floor(s.x - camera.drawOffsetX)
    let cy = Math.floor(s.y - camera.drawOffsetY) + dy
    if (cx < -mediaAncho || cx > 160 + mediaAncho || cy < -4 || cy > 124) return
    target.fillRect(cx - mediaAncho, cy, mediaAncho * 2, 2, colSombra)
    target.fillRect(cx - mediaAncho + 2, cy - 1, mediaAncho * 2 - 4, 1, colSombra)
    target.fillRect(cx - mediaAncho + 2, cy + 2, mediaAncho * 2 - 4, 1, colSombra)
}

scene.createRenderable(0.5, function (target: Image, camera: scene.Camera) {
    if (!enPartida() || !jugadorSprite) return
    // Aura de dano alrededor del jugador
    if (nivelAura > 0 && estadoActual != EstadoJuego.GameOver) {
        let ax = Math.floor(jugadorSprite.x - camera.drawOffsetX)
        let ay = Math.floor(jugadorSprite.y - camera.drawOffsetY)
        let colAura = (Math.floor(game.runtime() / 220) % 2 == 0) ? 9 : 8
        target.drawCircle(ax, ay, radioAura(), colAura)
    }
    dibujarSombra(target, jugadorSprite, camera, 5, 6)
    for (let b of sprites.allOfKind(SpriteKind.Enemy)) {
        let tipo = (b.data["tipo"] as number) || 0
        if (tipo != 7) dibujarSombra(target, b, camera, 5, 5)
    }
    for (let j of sprites.allOfKind(SpriteKind.JefeEnemigo)) dibujarSombra(target, j, camera, 12, 13)
})

// =========================================================
// EFECTOS VISUALES
// =========================================================

function crearEfectoMuerte(x: number, y: number) {
    let fx = sprites.create(FRAMES_PUFF[0], SpriteKind.Food)
    fx.setPosition(x, y)
    fx.z = 3
    fx.setFlag(SpriteFlag.Ghost, true)
    fx.lifespan = 240
    animation.runImageAnimation(fx, FRAMES_PUFF, 60, false)
}

function crearAnillo(x: number, y: number, r: number, col: number, vida: number) {
    let im = image.create(r * 2 + 4, r * 2 + 4)
    im.drawCircle(r + 2, r + 2, r, col)
    im.drawCircle(r + 2, r + 2, r - 1, 1)
    im.drawCircle(r + 2, r + 2, r - 2, col)
    let s = sprites.create(im, SpriteKind.Food)
    s.setPosition(x, y)
    s.z = 3
    s.setFlag(SpriteFlag.Ghost, true)
    s.lifespan = vida
}

function crearRayoVisual(x: number, y: number) {
    let im = image.create(5, 80)
    im.fillRect(1, 0, 3, 80, 5)
    im.fillRect(2, 0, 1, 80, 1)
    let s = sprites.create(im, SpriteKind.Food)
    s.setPosition(x, y - 40)
    s.z = 4
    s.setFlag(SpriteFlag.Ghost, true)
    s.lifespan = 150
}

function textoFlotante(x: number, y: number, txt: string, color: number) {
    let ahora = game.runtime()
    if (textosFlotantes.length > 22) textosFlotantes.removeAt(0)
    textosFlotantes.push({ x: x, y: y, txt: txt, color: color, t0: ahora, fin: ahora + 700 })
}

function mostrarBanner(l1: string, l2: string, col: number) {
    bannerL1 = l1
    bannerL2 = l2
    bannerCol = col
    bannerHasta = game.runtime() + 2200
}

function mostrarToast(l1: string, l2: string, col: number) {
    toastL1 = l1
    toastL2 = l2
    toastCol = col
    toastHasta = game.runtime() + 3200
}

// DEMO: imprime el aviso inferior con letra pequena si el texto es largo
function imprimirAviso(y: number, ancho5: number) {
    let f = mensajeTienda.length > 17 ? image.font5 : image.font8
    screen.printCenter(mensajeTienda, mensajeTienda.length > 17 ? y + 2 : y, mensajeTiendaColor, f)
}

function avisoTienda(txt: string, col: number) {
    mensajeTienda = txt
    mensajeTiendaColor = col
    mensajeTiendaHasta = game.runtime() + 1300
}

// =========================================================
// PROGRESO PERSISTENTE (Settings): records, estadisticas, personajes
// =========================================================

function leerNum(clave: string): number {
    let v = settings.readNumber("D_" + clave)
    if (v == null) return 0
    return v
}

function obtenerRecordDificultad(dif: number): number {
    return leerNum("HIGH_SCORE_DIF_" + dif)
}

function guardarRecordDificultad(dif: number, score: number) {
    if (score > obtenerRecordDificultad(dif)) {
        settings.writeNumber("D_HIGH_SCORE_DIF_" + dif, score)
    }
}

function cargarProgreso() {
    statKills = leerNum("ST_KILLS")
    statMonedas = leerNum("ST_MONEDAS")
    statJefes = leerNum("ST_JEFES")
    statMaxOleada = leerNum("ST_OLEADA")
    statMaxNivel = leerNum("ST_NIVEL")
    statMaxPts = leerNum("ST_PTS")
    statNoche = leerNum("ST_NOCHE")
    statPartidas = leerNum("ST_PARTIDAS")
    desbloqueado = []
    for (let i = 0; i < NOMBRES_SKINS.length; i++) {
        desbloqueado.push(i < DEMO_SKINS)
    }
    let s = leerNum("SKIN_SEL")
    if (s >= 0 && s < NOMBRES_SKINS.length && desbloqueado[s]) skinSeleccionada = s
    skinCursor = skinSeleccionada
}

function guardarProgreso() {
    settings.writeNumber("D_ST_KILLS", statKills)
    settings.writeNumber("D_ST_MONEDAS", statMonedas)
    settings.writeNumber("D_ST_JEFES", statJefes)
    settings.writeNumber("D_ST_OLEADA", statMaxOleada)
    settings.writeNumber("D_ST_NIVEL", statMaxNivel)
    settings.writeNumber("D_ST_PTS", statMaxPts)
    settings.writeNumber("D_ST_NOCHE", statNoche)
    settings.writeNumber("D_ST_PARTIDAS", statPartidas)
}

function personajeDesbloqueado(i: number): boolean {
    return i < DEMO_SKINS
}

function progresoMision(i: number): number {
    if (i == 1) return statMonedas + sumarPartida * monedasPartida
    if (i == 2) return statKills + sumarPartida * killsPartida
    if (i == 3) return Math.max(statMaxOleada, sumarPartida * oleadaActual)
    if (i == 4) return statJefes + sumarPartida * jefesPartida
    if (i == 5) return Math.max(statMaxNivel, sumarPartida * nivelJugador)
    if (i == 6) return Math.max(statMaxPts, sumarPartida * puntosPuntuacion)
    if (i == 7) return Math.max(statNoche, (nivelDificultad == 2) ? sumarPartida * oleadaActual : 0)
    return 0
}

function comprobarMisiones() {
    // DEMO: los personajes extra no se desbloquean
}

// =========================================================
// AUDIO Y FONDO DE MENU
// =========================================================

function sonarNavegacion() {
    music.setVolume(Math.map(volumenAudio, 0, 100, 0, 120))
    music.playTone(523, 30)
}

function sonarConfirmar() {
    music.setVolume(Math.map(volumenAudio, 0, 100, 0, 150))
    music.playTone(659, 50)
}

function sonarCancelar() {
    music.setVolume(Math.map(volumenAudio, 0, 100, 0, 100))
    music.playTone(330, 40)
}

function inicializarFondoParticulas() {
    scene.setBackgroundColor(15)
    let paleta = [6, 8, 9, 10, 11]
    for (let i = 0; i < 20; i++) {
        let p = sprites.create(image.create(2, 2), SpriteKind.Food)
        p.image.fill(paleta[Math.randomRange(0, paleta.length - 1)])
        p.setPosition(Math.randomRange(0, 160), Math.randomRange(0, 120))
        p.vx = Math.randomRange(-20, 20)
        p.vy = Math.randomRange(-20, 20)
        p.setBounceOnWall(true)
        p.z = -20
        particulasFondo.push(p)
    }
}

function limpiarFondoParticulas() {
    for (let p of particulasFondo) p.destroy()
    particulasFondo = []
}

// =========================================================
// UTILIDADES DE TEXTO Y BARRAS
// =========================================================

function anchoTexto(t: string, f: image.Font): number {
    return t.length * f.charWidth
}

// Titulo grande con contorno y sombra
function textoGrande(texto: string, y: number, col: number, sombra: number) {
    let x = Math.floor((160 - anchoTexto(texto, image.font8)) / 2)
    screen.print(texto, x - 1, y, 15, image.font8)
    screen.print(texto, x + 1, y, 15, image.font8)
    screen.print(texto, x, y - 1, 15, image.font8)
    screen.print(texto, x, y + 3, 15, image.font8)
    screen.print(texto, x, y + 2, sombra, image.font8)
    screen.print(texto, x, y, col, image.font8)
}

function dibujarLineas(texto: string, x: number, y: number, color: number, separacion: number) {
    let lineas = texto.split("\n")
    for (let k = 0; k < lineas.length; k++) {
        screen.print(lineas[k], x, y + k * separacion, color, image.font5)
    }
}

function dibujarLineasCentradas(texto: string, y: number, color: number, separacion: number) {
    let lineas = texto.split("\n")
    for (let k = 0; k < lineas.length; k++) {
        screen.printCenter(lineas[k], y + k * separacion, color, image.font5)
    }
}

function dibujarBarra(x: number, y: number, w: number, h: number, pct: number, colRelleno: number) {
    let p = Math.max(0, Math.min(1, pct))
    screen.fillRect(x, y, w, h, 12)
    screen.fillRect(x, y, Math.floor(w * p), h, colRelleno)
    screen.drawRect(x - 1, y - 1, w + 2, h + 2, 1)
}

function dibujarBarraHabilidad(x: number, y: number, nombre: string, pct: number, listo: boolean) {
    let p = Math.max(0, Math.min(1, pct))
    screen.fillRect(x, y, 40, 9, 15)
    screen.fillRect(x, y, Math.floor(40 * p), 9, listo ? 7 : 12)
    screen.drawRect(x - 1, y - 1, 42, 11, listo ? 5 : 1)
    screen.print(nombre, x + 3, y + 2, 1, image.font5)
}

function formatoTiempo(ms: number): string {
    let s = Math.floor(ms / 1000)
    let m = Math.floor(s / 60)
    let r = s % 60
    return (m < 10 ? "0" : "") + m + ":" + (r < 10 ? "0" : "") + r
}

function nombreRareza(col: number): string {
    if (col == 9) return "LEGEND."
    if (col == 2) return "EPICO"
    if (col == 5) return "RARO"
    return "COMUN"
}

// =========================================================
// PANTALLAS DE MENU
// =========================================================

function dibujarMenuPrincipal(t: number) {
    let bob = Math.floor(Math.sin(t) * 2)
    screen.drawTransparentImage(imgBombaLogo, 8, 8 + bob)
    screen.drawTransparentImage(imgBombaLogo, 136, 8 - bob)
    textoGrande(TITULO_A, 7, (Math.floor(t / 2) % 2 == 0) ? 5 : 4, 2)
    textoGrande(TITULO_B, 21, 9, 8)

    screen.fillRect(30, 37, 100, 78, 15)
    screen.drawRect(30, 37, 100, 78, 8)
    for (let i = 0; i < OPCIONES_MENU.length; i++) {
        let y = 41 + (i * 12)
        if (i == opcionMenuSel) {
            screen.fillRect(34, y - 2, 92, 11, 12)
            let colorParpadeo = (Math.floor(t) % 2 == 0) ? 5 : 4
            screen.printCenter("> " + OPCIONES_MENU[i] + " <", y, colorParpadeo, image.font8)
        } else {
            screen.printCenter(OPCIONES_MENU[i], y, 1, image.font8)
        }
    }
    screen.print("DEMO", 2, 113, (Math.floor(t / 2) % 2 == 0) ? 5 : 4, image.font5)
}

function dibujarSkins(t: number) {
    textoGrande("PERSONAJES", 2, 9, 8)
    let i = skinCursor
    let libre = personajeDesbloqueado(i)

    // Panel izquierdo: retrato
    screen.fillRect(4, 16, 70, 76, 12)
    screen.drawRect(4, 16, 70, 76, libre ? 5 : 2)
    let bob = Math.floor(Math.sin(t) * 2)
    screen.drawTransparentImage(libre ? previewsSkins[i] : previewsBloqueadas[i], 7, 21 + bob)
    if (!libre) {
        // candado
        screen.drawRect(33, 40, 8, 9, 1)
        screen.fillRect(30, 47, 14, 11, 5)
        screen.drawRect(30, 47, 14, 11, 4)
        screen.fillRect(36, 51, 2, 4, 15)
    }

    // Panel derecho: informacion
    screen.fillRect(78, 16, 78, 76, 12)
    screen.drawRect(78, 16, 78, 76, 5)
    screen.print(NOMBRES_SKINS[i], 82, 20, libre ? SKIN_PRINCIPAL[i] : 13, image.font8)
    if (!libre) {
        screen.print("DEMO", 82, 30, 2, image.font5)
    } else if (i == skinSeleccionada) {
        screen.print("EQUIPADO", 82, 30, 7, image.font5)
    } else {
        screen.print("LISTO", 82, 30, 9, image.font5)
    }
    screen.print("BONUS:", 82, 38, 5, image.font5)
    dibujarLineas(PERK_TXT[i], 82, 45, 1, 7)

    if (!libre) {
        screen.print("SOLO EN EL", 82, 66, 9, image.font5)
        screen.print("JUEGO", 82, 73, 9, image.font5)
        screen.print("COMPLETO", 82, 80, 9, image.font5)
    }

    // Indicadores
    for (let k = 0; k < NOMBRES_SKINS.length; k++) {
        let x = 28 + k * 13
        screen.fillRect(x, 97, 9, 9, personajeDesbloqueado(k) ? SKIN_PRINCIPAL[k] : 12)
        screen.drawRect(x, 97, 9, 9, k == skinCursor ? 5 : 8)
    }
    screen.printCenter("< > ELEGIR A:USAR B:ATRAS", 111, 3, image.font5)
}

function dibujarMisiones(t: number) {
    screen.fillRect(2, 2, 156, 116, 15)
    screen.drawRect(2, 2, 156, 116, 8)
    textoGrande("MISIONES", 4, 5, 2)
    screen.printCenter("NO DISPONIBLES", 40, 2, image.font8)
    screen.printCenter("EN LA DEMO", 52, 2, image.font8)
    screen.printCenter("DESBLOQUEA 6 PERSONAJES", 74, 1, image.font5)
    screen.printCenter("EN EL JUEGO COMPLETO", 84, 1, image.font5)
    screen.printCenter("A / B: VOLVER", 111, 3, image.font5)
}

function dibujarRecords(t: number) {
    screen.fillRect(10, 6, 140, 108, 15)
    screen.drawRect(10, 6, 140, 108, 8)
    screen.printCenter("== RECORDS ==", 12, 9, image.font8)
    for (let d = 0; d < NOMBRES_DIFICULTAD.length; d++) {
        let rec = obtenerRecordDificultad(d)
        screen.printCenter(NOMBRES_DIFICULTAD[d] + ": " + rec + " PTS", 30 + (d * 11), 5, image.font5)
    }
    screen.drawLine(20, 66, 140, 66, 8)
    screen.printCenter("BAJAS TOTALES: " + statKills, 72, 1, image.font5)
    screen.printCenter("PARTIDAS: " + statPartidas, 82, 1, image.font5)
    screen.printCenter("MEJOR OLEADA: " + statMaxOleada, 92, 1, image.font5)
    screen.printCenter("A O B PARA VOLVER", 104, 3, image.font5)
}

function dibujarOpciones(t: number) {
    screen.fillRect(10, 6, 140, 108, 15)
    screen.drawRect(10, 6, 140, 108, 8)
    screen.printCenter("--- OPCIONES ---", 15, 9, image.font8)
    let bloques = Math.floor(volumenAudio / 10)
    let barra = "["
    for (let b = 0; b < 10; b++) barra += (b < bloques) ? "=" : " "
    barra += "]"

    let txtVol = "VOL: " + volumenAudio + " " + barra
    let txtDif = "DIF: <" + NOMBRES_DIFICULTAD[nivelDificultad] + ">"

    screen.printCenter((opcionOpcionesSel == 0 ? "> " : "") + txtVol, 48, opcionOpcionesSel == 0 ? 5 : 1, image.font5)
    screen.printCenter((opcionOpcionesSel == 1 ? "> " : "") + txtDif, 68, opcionOpcionesSel == 1 ? 5 : 1, image.font5)
    screen.printCenter((opcionOpcionesSel == 2 ? "> VOLVER <" : "VOLVER"), 95, opcionOpcionesSel == 2 ? 5 : 1, image.font8)
}

function dibujarCreditos(t: number) {
    screen.fillRect(10, 6, 140, 108, 15)
    screen.drawRect(10, 6, 140, 108, 8)
    screen.printCenter("=== CREDITOS ===", 15, 9, image.font8)
    screen.printCenter(TITULO_A + " " + TITULO_B, 36, 5, image.font8)
    screen.printCenter("HECHO CON MAKECODE ARCADE", 52, 1, image.font5)
    screen.printCenter("POR " + AUTOR, 62, 7, image.font5)
    screen.printCenter("VERSION DEMO", 94, 5, image.font5)
    screen.drawTransparentImage(imgBombaLogo, 72, 76 + Math.floor(Math.sin(t) * 2))
    screen.printCenter("Pulsa A para Volver", 102, 3, image.font5)
}

// =========================================================
// PANTALLA DE JUEGO + HUD
// =========================================================

function dibujarJuego(t: number) {
    let ahora = game.runtime()
    let camX = scene.cameraProperty(CameraProperty.X) - 80
    let camY = scene.cameraProperty(CameraProperty.Y) - 60

    // Listas de este frame (se reutilizan en todo el HUD)
    let enemigosV = sprites.allOfKind(SpriteKind.Enemy)
    let jefes = sprites.allOfKind(SpriteKind.JefeEnemigo)

    // Barras de vida de enemigos danados
    for (let bicho of enemigosV) {
        let hpCurrent = (bicho.data["hp"] as number) || 1
        let hpMax = (bicho.data["maxHp"] as number) || 1
        let pct = Math.max(0, hpCurrent / hpMax)
        let scrX = bicho.x - camX - 7
        let scrY = bicho.y - camY - 12
        if (pct < 1 && scrX >= -10 && scrX <= 170 && scrY >= -10 && scrY <= 130) {
            screen.fillRect(scrX, scrY, 14, 3, 15)
            screen.fillRect(scrX, scrY, Math.floor(14 * pct), 3, 2)
            screen.drawRect(scrX - 1, scrY - 1, 16, 5, 1)
        }
    }

    // Flecha hacia la tienda cuando esta fuera de pantalla
    if (tiendaActivaSprite) {
        let sx = tiendaActivaSprite.x - camX
        let sy = tiendaActivaSprite.y - camY
        if (sx < 0 || sx > 160 || sy < 20 || sy > 120) {
            let dxI = sx - 80
            let dyI = sy - 68
            let ang = Math.atan2(dyI, dxI)
            let escX = (Math.abs(dxI) > 0) ? 68 / Math.abs(dxI) : 9999
            let escY = (Math.abs(dyI) > 0) ? 38 / Math.abs(dyI) : 9999
            let esc = Math.min(escX, escY)
            let ix = Math.floor(80 + dxI * esc)
            let iy = Math.floor(68 + dyI * esc)
            screen.fillCircle(ix, iy, 7, 15)
            screen.drawCircle(ix, iy, 7, (Math.floor(t) % 2 == 0) ? 5 : 4)
            screen.drawTransparentImage(imgMoneda, ix - 4, iy - 4)
            screen.fillCircle(Math.floor(ix + Math.cos(ang) * 11), Math.floor(iy + Math.sin(ang) * 11), 2, 5)
        }
    }

    dibujarExtrasMundo(t, camX, camY)

    // Numeros flotantes de dano
    for (let tf of textosFlotantes) {
        let edad = ahora - tf.t0
        let px = Math.floor(tf.x - camX - tf.txt.length * 3)
        let py = Math.floor(tf.y - camY - edad / 45)
        screen.print(tf.txt, px + 1, py + 1, 15, image.font5)
        screen.print(tf.txt, px, py, tf.color, image.font5)
    }

    // ---- HUD superior ----
    screen.fillRect(0, 0, 160, 14, 15)
    screen.drawLine(0, 14, 159, 14, 8)

    screen.drawTransparentImage(imgGemaVida, 1, 3)
    let pctVida = Math.max(0, Math.min(1, vidaActual / vidaMaxima))
    let colVida = pctVida > 0.5 ? 7 : (pctVida > 0.25 ? 5 : 2)
    screen.fillRect(10, 3, 54, 8, 12)
    screen.fillRect(10, 3, Math.floor(54 * pctVida), 8, colVida)
    screen.drawRect(9, 2, 56, 10, 1)
    screen.print("" + Math.ceil(Math.max(0, vidaActual)) + "/" + vidaMaxima, 13, 4, 1, image.font5)
    if (puntosEscudoActivo > 0) {
        screen.fillRect(10, 12, Math.min(54, Math.floor(puntosEscudoActivo * 54 / Math.max(1, vidaMaxima))), 2, 9)
    }

    screen.print("LV" + nivelJugador, 70, 4, 9, image.font5)
    screen.drawTransparentImage(imgMoneda, 97, 3)
    screen.print("" + cantidadMonedas, 107, 4, 5, image.font5)
    screen.print("K" + killsPartida, 132, 4, 2, image.font5)

    // Fila de oleada
    let totalEnemigosRestantes = enemigosV.length + jefes.length + bichosRestantesPorSpawn
    let totalInicial = Math.max(1, totalBichosOleadaInicial)
    let pctOleada = Math.min(1, Math.max(0, (totalInicial - totalEnemigosRestantes) / totalInicial))
    screen.print("OL" + oleadaActual + "/" + DEMO_OLEADAS, 2, 18, 4, image.font5)
    dibujarBarra(26, 18, 84, 4, pctOleada, 2)
    screen.print("x" + totalEnemigosRestantes, 114, 18, 1, image.font5)
    screen.print(formatoTiempo(tiempoPartidaMs), 132, 18, 3, image.font5)

    // Barra del jefe
    if (jefes.length > 0) {
        let jf = jefes[0]
        let hpJ = Math.max(0, ((jf.data["hp"] as number) || 1) / ((jf.data["maxHp"] as number) || 1))
        screen.fillRect(30, 26, 100, 9, 15)
        screen.fillRect(30, 26, Math.floor(100 * hpJ), 9, 2)
        screen.drawRect(29, 25, 102, 11, 1)
        screen.printCenter("" + jf.data["nombre"], 28, 1, image.font5)
    }

    // Barra de XP abajo del todo
    let pctXP = Math.min(1, xpActual / xpSiguienteNivel)
    screen.fillRect(0, 117, 160, 3, 15)
    screen.fillRect(0, 117, Math.floor(160 * pctXP), 3, 9)
    screen.drawLine(0, 116, 159, 116, 8)

    // Habilidades
    if (nivelHabilidadDash > 0) {
        let listoD = ahora >= cooldownDashMs
        dibujarBarraHabilidad(4, 104, "B-DASH", listoD ? 1 : 1 - (cooldownDashMs - ahora) / cdDash(), listoD)
    }
    if (nivelHabilidadNova > 0) {
        let listoN = ahora >= cooldownNovaMs
        dibujarBarraHabilidad(50, 104, "NOVA", listoN ? 1 : 1 - (cooldownNovaMs - ahora) / cdNova(), listoN)
    }

    // Indicador de permanencia en tienda
    if (enZonaActivacionTienda) {
        let transcurrido = (ahora - tiempoInicioPermanenciaTienda) / 3000
        screen.fillRect(25, 80, 110, 20, 12)
        screen.drawRect(24, 79, 112, 22, 5)
        screen.printCenter("ABRIENDO TIENDA...", 83, 1, image.font5)
        dibujarBarra(32, 92, 96, 4, transcurrido, 5)
    }

    // Banner de oleada
    if (ahora < bannerHasta) {
        let ancho = Math.max(100, anchoTexto(bannerL1, image.font8) + 16)
        let bx = Math.floor((160 - ancho) / 2)
        screen.fillRect(bx, 38, ancho, 28, 15)
        screen.drawRect(bx, 38, ancho, 28, bannerCol)
        screen.drawRect(bx + 2, 40, ancho - 4, 24, 8)
        screen.printCenter(bannerL1, 44, bannerCol, image.font8)
        screen.printCenter(bannerL2, 56, 1, image.font5)
    }

    // Aviso (personaje desbloqueado, enemigo nuevo...)
    if (ahora < toastHasta) {
        let anchoT = Math.max(100, anchoTexto(toastL1, image.font5) + 14)
        let tx = Math.floor((160 - anchoT) / 2)
        screen.fillRect(tx, 70, anchoT, 22, 15)
        screen.drawRect(tx, 70, anchoT, 22, toastCol)
        screen.printCenter(toastL1, 73, toastCol, image.font5)
        screen.printCenter(toastL2, 82, 1, image.font5)
    }
}

// =========================================================
// CARTAS DE MEJORA
// =========================================================

function dibujarSubirNivel(t: number) {
    screen.fillRect(0, 0, 160, 120, 15)
    screen.fillRect(2, 2, 156, 116, 12)
    screen.drawRect(2, 2, 156, 116, 5)
    screen.drawRect(4, 4, 152, 112, 8)

    textoGrande("NIVEL " + nivelJugador, 6, 5, 2)
    screen.printCenter("ELIGE UNA MEJORA", 20, 1, image.font5)

    for (let i = 0; i < opcionesCartasPresentadas.length; i++) {
        let sel = i == indiceCartaSeleccionada
        let posX = 3 + (i * 52)
        let posY = sel ? 28 : 34
        let carta = opcionesCartasPresentadas[i]
        let col = carta.rarezaColor

        screen.fillRect(posX, posY, 50, 62, sel ? 8 : 15)
        screen.fillRect(posX, posY, 50, 12, col)
        screen.drawRect(posX, posY, 50, 62, sel ? ((Math.floor(t) % 2 == 0) ? 1 : col) : col)
        if (sel) screen.drawRect(posX - 1, posY - 1, 52, 64, col)

        screen.print(carta.titulo, posX + 3, posY + 4, 15, image.font5)
        dibujarLineas(carta.descripcion, posX + 3, posY + 17, sel ? 1 : 11, 9)
        screen.print(nombreRareza(col), posX + 3, posY + 52, col, image.font5)
    }

    screen.printCenter("< > ELEGIR    A: OK", 104, 1, image.font5)

    if (estadoActual == EstadoJuego.ConfirmandoMejora && cartaPendienteConfirmacion) {
        screen.fillRect(15, 20, 130, 80, 15)
        screen.drawRect(13, 18, 134, 84, 5)
        screen.drawRect(14, 19, 132, 82, 1)
        screen.printCenter("CONFIRMAR", 28, 9, image.font8)
        screen.printCenter(cartaPendienteConfirmacion.titulo, 44, 2, image.font8)
        dibujarLineasCentradas(cartaPendienteConfirmacion.descripcion, 58, 1, 9)
        screen.printCenter("A: SI    B: VOLVER", 90, 7, image.font5)
    }
}

// =========================================================
// TIENDA (interfaz)
// =========================================================

const TIENDA_NOMBRES: string[] = ["CURA +30", "ESCUDO +50", "VENDA", "2 BOMBAS", "BLOQUEADO", "BLOQUEADO", "BLOQUEADO", "SALIR"]
const TIENDA_PRECIO: number[] = [15, 25, 30, 35, 25, 35, 15, 0]
const TIENDA_DESC: string[] = [
    "CURA 30 PUNTOS DE VIDA",
    "+50 PUNTOS DE ESCUDO",
    "UNA VENDA (CURA 40)",
    "2 BOMBAS PARA EL BOTON B",
    "SOLO EN EL JUEGO COMPLETO",
    "SOLO EN EL JUEGO COMPLETO",
    "SOLO EN EL JUEGO COMPLETO",
    "VOLVER A LA ACCION"
]

function precioTienda(i: number): number {
    return TIENDA_PRECIO[i] + comprasTienda[i] * Math.ceil(TIENDA_PRECIO[i] * 0.35)
}

function textoActualTienda(i: number): string {
    if (i == 0) return "VIDA " + Math.ceil(vidaActual) + "/" + vidaMaxima
    if (i == 1) return "ESCUDO " + puntosEscudoActivo
    if (i == 2) return "VENDAS " + vendas + "/9"
    if (i == 3) return "BOMBAS " + bombas + "/30"
    if (i >= 4 && i <= 6) return "NO DISPONIBLE"
    return ""
}

function articuloAgotado(i: number): boolean {
    if (i == 2) return vendas >= 9
    if (i == 3) return bombas >= 30
    return false
}

function dibujarTienda(t: number) {
    let ahora = game.runtime()
    screen.fillRect(0, 0, 160, 120, 15)

    // Cabecera
    screen.fillRect(0, 0, 160, 18, 8)
    screen.drawLine(0, 18, 159, 18, 5)
    screen.print("MERCADER", 6, 5, 5, image.font8)
    screen.drawTransparentImage(imgMoneda, 106, 5)
    screen.print("" + cantidadMonedas, 116, 6, 1, image.font8)

    // Lista de articulos
    screen.fillRect(2, 20, 104, 83, 12)
    screen.drawRect(2, 20, 104, 83, 8)
    for (let j = 0; j < TIENDA_NOMBRES.length; j++) {
        let y = 23 + j * 10
        let sel = j == opcionTiendaSel
        let agotado = articuloAgotado(j)
        let precio = precioTienda(j)
        let bloq = j >= 4 && j <= 6
        let puede = j == 7 || (!bloq && !agotado && cantidadMonedas >= precio)
        if (sel) {
            screen.fillRect(4, y - 1, 100, 10, 8)
            screen.drawRect(4, y - 1, 100, 10, 5)
        }
        screen.drawTransparentImage(ICONOS_TIENDA[j], 6, y)
        screen.print(TIENDA_NOMBRES[j], 17, y + 2, puede ? 1 : 11, image.font5)
        if (j != 7) {
            let txtPrecio = bloq ? "DEMO" : (agotado ? "MAX" : "$" + precio)
            screen.print(txtPrecio, 102 - txtPrecio.length * 6, y + 2, bloq ? 2 : (agotado ? 13 : (puede ? 7 : 2)), image.font5)
        }
    }

    // Retrato del mercader
    screen.fillRect(110, 22, 46, 44, 12)
    screen.drawRect(110, 22, 46, 44, 5)
    screen.drawTransparentImage(imgMercader.doubled(), 117, 26 + Math.floor(Math.sin(t) * 2))
    screen.print("A:COMPRAR", 108, 72, 3, image.font5)
    screen.print("B:SALIR", 112, 82, 3, image.font5)
    screen.print("LV " + nivelJugador, 116, 93, 9, image.font5)

    // Panel inferior: descripcion / mensaje
    screen.fillRect(0, 104, 160, 16, 15)
    screen.drawLine(0, 104, 159, 104, 5)
    if (ahora < mensajeTiendaHasta) {
        imprimirAviso(108, 0)
    } else {
        screen.print(TIENDA_DESC[opcionTiendaSel], 4, 107, 1, image.font5)
        if (opcionTiendaSel != 7 && (opcionTiendaSel < 4 || opcionTiendaSel > 6)) screen.print("ACTUAL: " + textoActualTienda(opcionTiendaSel), 4, 113, 9, image.font5)
    }
}

// =========================================================
// PANTALLA DE GAME OVER
// =========================================================

function dibujarGameOver(t: number) {
    let ahora = game.runtime()
    let transcurrido = ahora - tiempoMuerteMs

    // Fundido a negro (lineas alternas)
    if (transcurrido < 800) {
        for (let y = 0; y < 120; y += 2) screen.drawLine(0, y, 159, y, 15)
        return
    }
    screen.fillRect(0, 0, 160, 120, 15)
    screen.fillRect(4, 3, 152, 114, 12)
    screen.drawRect(4, 3, 152, 114, 2)
    screen.drawRect(6, 5, 148, 110, 8)

    let sacudida = (Math.floor(t) % 4 == 0) ? 1 : 0
    if (demoGanada) {
        textoGrande("DEMO SUPERADA", 9 + sacudida, 7, 8)
        screen.printCenter("GRACIAS POR JUGAR!", 24, 5, image.font5)
    } else {
        textoGrande("HAS CAIDO", 9 + sacudida, 2, 4)
        if (ultimoAtacante != "") {
            screen.printCenter("TE ELIMINO: " + ultimoAtacante, 24, 3, image.font5)
        }
    }

    // Estadisticas
    screen.print("PUNTOS", 14, 36, 13, image.font5)
    screen.print("" + puntosPuntuacion, 56, 36, 5, image.font5)
    screen.print("OLEADA", 86, 36, 13, image.font5)
    screen.print("" + oleadaActual, 128, 36, 5, image.font5)
    screen.print("NIVEL", 14, 46, 13, image.font5)
    screen.print("" + nivelJugador, 56, 46, 9, image.font5)
    screen.print("BAJAS", 86, 46, 13, image.font5)
    screen.print("" + killsPartida, 128, 46, 2, image.font5)
    screen.print("ORO", 14, 56, 13, image.font5)
    screen.print("" + monedasPartida, 56, 56, 5, image.font5)
    screen.print("TIEMPO", 86, 56, 13, image.font5)
    screen.print(formatoTiempo(tiempoPartidaMs), 122, 56, 1, image.font5)

    screen.drawLine(14, 65, 146, 65, 8)
    if (nuevoRecord) {
        screen.printCenter("NUEVO RECORD!", 69, (Math.floor(t) % 2 == 0) ? 5 : 4, image.font8)
    } else {
        screen.printCenter("RECORD: " + obtenerRecordDificultad(nivelDificultad), 71, 3, image.font5)
    }
    if (demoGanada) {
        screen.printCenter("MAS BIOMAS, ARMAS Y JEFES", 78, (Math.floor(t) % 2 == 0) ? 9 : 1, image.font5)
        screen.printCenter("EN EL JUEGO COMPLETO", 84, (Math.floor(t) % 2 == 0) ? 9 : 1, image.font5)
    }

    // Botones
    let textos = ["MENU PRINCIPAL", "REINTENTAR"]
    for (let i = 0; i < 2; i++) {
        let y = 90 + i * 12
        if (i == opcionGameOverSel) {
            screen.fillRect(30, y - 2, 100, 11, 8)
            screen.drawRect(30, y - 2, 100, 11, 5)
            screen.printCenter("> " + textos[i] + " <", y, 5, image.font5)
        } else {
            screen.printCenter(textos[i], y, 1, image.font5)
        }
    }
}

// =========================================================
// RENDER GENERAL
// =========================================================

game.onShade(function () {
    let t = game.runtime() / 150

    if (estadoActual == EstadoJuego.MenuPrincipal) {
        dibujarMenuPrincipal(t)
    } else if (estadoActual == EstadoJuego.TablaRecords) {
        dibujarRecords(t)
    } else if (estadoActual == EstadoJuego.SeleccionSkin) {
        dibujarSkins(t)
    } else if (estadoActual == EstadoJuego.MisionesMenu) {
        dibujarMisiones(t)
    } else if (estadoActual == EstadoJuego.OpcionesMenu) {
        dibujarOpciones(t)
    } else if (estadoActual == EstadoJuego.CreditosMenu) {
        dibujarCreditos(t)
    } else if (estadoActual == EstadoJuego.Jugando) {
        dibujarJuego(t)
    } else if (estadoActual == EstadoJuego.MenuSubirNivel || estadoActual == EstadoJuego.ConfirmandoMejora) {
        dibujarSubirNivel(t)
    } else if (estadoActual == EstadoJuego.TiendaInteractiva) {
        dibujarTienda(t)
    } else if (estadoActual == EstadoJuego.Inventario) {
        dibujarInventario(t)
    } else if (estadoActual == EstadoJuego.DentroCasa) {
        dibujarCasa(t)
    } else if (estadoActual == EstadoJuego.Crafteo) {
        dibujarCrafteo(t)
    } else if (estadoActual == EstadoJuego.GameOver) {
        dibujarJuego(t)
        dibujarGameOver(t)
    }
})

// =========================================================
// ENTRADAS DE CONTROL
// =========================================================

controller.A.onEvent(ControllerButtonEvent.Pressed, function () {
    interactuarBotonA()
})

function interactuarBotonA() {
    if (estadoActual == EstadoJuego.MenuPrincipal) {
        sonarConfirmar()
        if (opcionMenuSel == 0) {
            iniciarPartida()
        } else if (opcionMenuSel == 1) {
            skinCursor = skinSeleccionada
            estadoActual = EstadoJuego.SeleccionSkin
        } else if (opcionMenuSel == 2) {
            estadoActual = EstadoJuego.MisionesMenu
        } else if (opcionMenuSel == 3) {
            estadoActual = EstadoJuego.TablaRecords
        } else if (opcionMenuSel == 4) {
            estadoActual = EstadoJuego.OpcionesMenu
        } else if (opcionMenuSel == 5) {
            estadoActual = EstadoJuego.CreditosMenu
        }

    } else if (estadoActual == EstadoJuego.SeleccionSkin) {
        if (personajeDesbloqueado(skinCursor)) {
            skinSeleccionada = skinCursor
            settings.writeNumber("D_SKIN_SEL", skinSeleccionada)
            sonarConfirmar()
            estadoActual = EstadoJuego.MenuPrincipal
        } else {
            sonarCancelar()
        }

    } else if (estadoActual == EstadoJuego.CreditosMenu || estadoActual == EstadoJuego.TablaRecords || estadoActual == EstadoJuego.MisionesMenu) {
        sonarCancelar()
        estadoActual = EstadoJuego.MenuPrincipal

    } else if (estadoActual == EstadoJuego.OpcionesMenu) {
        if (opcionOpcionesSel == 2) {
            sonarCancelar()
            estadoActual = EstadoJuego.MenuPrincipal
        }

    } else if (estadoActual == EstadoJuego.Jugando) {
        if (npcCerca) entrarCasa(npcCerca)
        else ejecutarDisparoManual()

    } else if (estadoActual == EstadoJuego.MenuSubirNivel) {
        cartaPendienteConfirmacion = opcionesCartasPresentadas[indiceCartaSeleccionada]
        estadoActual = EstadoJuego.ConfirmandoMejora
        sonarConfirmar()

    } else if (estadoActual == EstadoJuego.ConfirmandoMejora) {
        aplicarMejoraProcedural(cartaPendienteConfirmacion)
        reanudarJuego()
        sonarConfirmar()

    } else if (estadoActual == EstadoJuego.TiendaInteractiva) {
        comprarArticuloTienda()

    } else if (estadoActual == EstadoJuego.Inventario) {
        usarFilaInventario()

    } else if (estadoActual == EstadoJuego.DentroCasa) {
        accionCasa()

    } else if (estadoActual == EstadoJuego.Crafteo) {
        craftear(craftSel)

    } else if (estadoActual == EstadoJuego.GameOver) {
        if (game.runtime() - tiempoMuerteMs < 1000) return
        sonarConfirmar()
        if (opcionGameOverSel == 0) volverAlMenu()
        else iniciarPartida()
    }
}

controller.B.onEvent(ControllerButtonEvent.Pressed, function () {
    if (estadoActual == EstadoJuego.Jugando) {
        accionBotonB()
    } else if (estadoActual == EstadoJuego.Inventario) {
        cerrarInventario()
    } else if (estadoActual == EstadoJuego.DentroCasa) {
        salirDeCasa()
    } else if (estadoActual == EstadoJuego.Crafteo) {
        estadoActual = EstadoJuego.DentroCasa
        sonarCancelar()
    } else if (estadoActual == EstadoJuego.ConfirmandoMejora) {
        estadoActual = EstadoJuego.MenuSubirNivel
        cartaPendienteConfirmacion = null
        sonarCancelar()
    } else if (estadoActual == EstadoJuego.TiendaInteractiva) {
        cerrarTienda()
        sonarCancelar()
    } else if (estadoActual == EstadoJuego.TablaRecords || estadoActual == EstadoJuego.SeleccionSkin ||
        estadoActual == EstadoJuego.OpcionesMenu || estadoActual == EstadoJuego.CreditosMenu ||
        estadoActual == EstadoJuego.MisionesMenu) {
        estadoActual = EstadoJuego.MenuPrincipal
        sonarCancelar()
    }
})

// El boton MENU abre / cierra el inventario
controller.menu.onEvent(ControllerButtonEvent.Pressed, function () {
    if (estadoActual == EstadoJuego.Jugando) abrirInventario()
    else if (estadoActual == EstadoJuego.Inventario) cerrarInventario()
})

controller.up.onEvent(ControllerButtonEvent.Pressed, function () {
    if (estadoActual == EstadoJuego.MenuPrincipal) {
        opcionMenuSel = (opcionMenuSel - 1 + OPCIONES_MENU.length) % OPCIONES_MENU.length
        sonarNavegacion()
    } else if (estadoActual == EstadoJuego.OpcionesMenu) {
        opcionOpcionesSel = (opcionOpcionesSel - 1 + OPCIONES_SUBMENU.length) % OPCIONES_SUBMENU.length
        sonarNavegacion()
    } else if (estadoActual == EstadoJuego.TiendaInteractiva) {
        opcionTiendaSel = (opcionTiendaSel - 1 + 8) % 8
        sonarNavegacion()
    } else if (estadoActual == EstadoJuego.Inventario) {
        invSel = (invSel - 1 + INV_FILAS) % INV_FILAS
        sonarNavegacion()
    } else if (estadoActual == EstadoJuego.DentroCasa) {
        casaSel = (casaSel - 1 + casaOpc.length) % casaOpc.length
        sonarNavegacion()
    } else if (estadoActual == EstadoJuego.Crafteo) {
        craftSel = (craftSel - 1 + REC_NOMBRE.length) % REC_NOMBRE.length
        sonarNavegacion()
    } else if (estadoActual == EstadoJuego.GameOver) {
        opcionGameOverSel = (opcionGameOverSel + 1) % 2
        sonarNavegacion()
    }
})

controller.down.onEvent(ControllerButtonEvent.Pressed, function () {
    if (estadoActual == EstadoJuego.MenuPrincipal) {
        opcionMenuSel = (opcionMenuSel + 1) % OPCIONES_MENU.length
        sonarNavegacion()
    } else if (estadoActual == EstadoJuego.OpcionesMenu) {
        opcionOpcionesSel = (opcionOpcionesSel + 1) % OPCIONES_SUBMENU.length
        sonarNavegacion()
    } else if (estadoActual == EstadoJuego.TiendaInteractiva) {
        opcionTiendaSel = (opcionTiendaSel + 1) % 8
        sonarNavegacion()
    } else if (estadoActual == EstadoJuego.Inventario) {
        invSel = (invSel + 1) % INV_FILAS
        sonarNavegacion()
    } else if (estadoActual == EstadoJuego.DentroCasa) {
        casaSel = (casaSel + 1) % casaOpc.length
        sonarNavegacion()
    } else if (estadoActual == EstadoJuego.Crafteo) {
        craftSel = (craftSel + 1) % REC_NOMBRE.length
        sonarNavegacion()
    } else if (estadoActual == EstadoJuego.GameOver) {
        opcionGameOverSel = (opcionGameOverSel + 1) % 2
        sonarNavegacion()
    }
})

controller.left.onEvent(ControllerButtonEvent.Pressed, function () {
    if (estadoActual == EstadoJuego.SeleccionSkin) {
        skinCursor = (skinCursor - 1 + NOMBRES_SKINS.length) % NOMBRES_SKINS.length
        sonarNavegacion()
    } else if (estadoActual == EstadoJuego.OpcionesMenu) {
        if (opcionOpcionesSel == 0) {
            volumenAudio = Math.max(0, volumenAudio - 10)
            sonarNavegacion()
        } else if (opcionOpcionesSel == 1) {
            nivelDificultad = (nivelDificultad - 1 + NOMBRES_DIFICULTAD.length) % NOMBRES_DIFICULTAD.length
            sonarNavegacion()
        }
    } else if (estadoActual == EstadoJuego.MenuSubirNivel) {
        indiceCartaSeleccionada = (indiceCartaSeleccionada - 1 + opcionesCartasPresentadas.length) % opcionesCartasPresentadas.length
        sonarNavegacion()
    }
})

controller.right.onEvent(ControllerButtonEvent.Pressed, function () {
    if (estadoActual == EstadoJuego.SeleccionSkin) {
        skinCursor = (skinCursor + 1) % NOMBRES_SKINS.length
        sonarNavegacion()
    } else if (estadoActual == EstadoJuego.OpcionesMenu) {
        if (opcionOpcionesSel == 0) {
            volumenAudio = Math.min(100, volumenAudio + 10)
            sonarNavegacion()
        } else if (opcionOpcionesSel == 1) {
            nivelDificultad = (nivelDificultad + 1) % NOMBRES_DIFICULTAD.length
            sonarNavegacion()
        }
    } else if (estadoActual == EstadoJuego.MenuSubirNivel) {
        indiceCartaSeleccionada = (indiceCartaSeleccionada + 1) % opcionesCartasPresentadas.length
        sonarNavegacion()
    }
})

// =========================================================
// DASH
// =========================================================

function cdDash(): number {
    return Math.max(1000, 3000 - 450 * (nivelHabilidadDash - 1))
}

function usarDash() {
    if (estadoActual != EstadoJuego.Jugando || nivelHabilidadDash <= 0 || !jugadorSprite) return
    let ahora = game.runtime()
    if (ahora < cooldownDashMs) return
    cooldownDashMs = ahora + cdDash()
    invulnerableHasta = ahora + 450
    sonarConfirmar()

    let dx = jugadorSprite.vx
    let dy = jugadorSprite.vy
    if (dx == 0 && dy == 0) {
        dx = ultimaDirX
        dy = ultimaDirY
    }
    let l = Math.sqrt(dx * dx + dy * dy)
    if (l == 0) {
        dx = 1
        dy = 0
        l = 1
    }
    crearEfectoMuerte(jugadorSprite.x, jugadorSprite.y)
    jugadorSprite.x += dx / l * 48
    jugadorSprite.y += dy / l * 48
    crearEfectoMuerte(jugadorSprite.x, jugadorSprite.y)
    jugadorSprite.sayText("DASH!", 400)
}

// =========================================================
// TIENDA IN-GAME (logica)
// =========================================================

function cerrarTienda() {
    enZonaActivacionTienda = false
    if (tiendaActivaSprite) {
        tiendaActivaSprite.destroy()
        tiendaActivaSprite = null
    }
    reanudarJuego()
}

function comprarArticuloTienda() {
    let i = opcionTiendaSel
    if (i == 7) {
        cerrarTienda()
        sonarCancelar()
        return
    }
    if (i >= 4 && i <= 6) {
        sonarCancelar()
        avisoTienda("SOLO EN EL JUEGO COMPLETO", 2)
        return
    }
    if (articuloAgotado(i)) {
        sonarCancelar()
        avisoTienda("YA ESTA AL MAXIMO", 4)
        return
    }
    let precio = precioTienda(i)
    if (cantidadMonedas < precio) {
        sonarCancelar()
        avisoTienda("TE FALTAN $" + (precio - cantidadMonedas), 2)
        return
    }
    cantidadMonedas -= precio
    comprasTienda[i] = comprasTienda[i] + 1
    sonarConfirmar()

    if (i == 0) {
        vidaActual = Math.min(vidaMaxima, vidaActual + 30)
        avisoTienda("+30 DE VIDA", 7)
    } else if (i == 1) {
        puntosEscudoActivo += 50
        actualizarGraficoEscudo()
        avisoTienda("+50 ESCUDO", 9)
    } else if (i == 2) {
        vendas += 1
        avisoTienda("+1 VENDA", 7)
    } else if (i == 3) {
        bombas += 2
        avisoTienda("+2 BOMBAS", 7)
    }
}

// =========================================================
// GENERADOR PROCEDURAL DE MEJORAS (30 tipos)
// titulos <= 7 letras y lineas <= 7 letras para que quepan
// =========================================================

function generarMejoraAleatoria(): MejoraProcedural {
    let tipoStat = Math.randomRange(1, 30)
    let rollRareza = Math.randomRange(1, 100)
    let m = 1.0
    let colorRareza = 1

    if (rollRareza > 90) {
        m = 2.5
        colorRareza = 9
    } else if (rollRareza > 70) {
        m = 1.8
        colorRareza = 2
    } else if (rollRareza > 40) {
        m = 1.3
        colorRareza = 5
    }

    let tituloGen = ""
    let descGen = ""
    let potencia = 0

    if (tipoStat == 1) {
        potencia = Math.floor(Math.randomRange(10, 30) * m)
        tituloGen = "DANO"
        descGen = "+" + potencia + "\nDANO\nDE BALA"
    } else if (tipoStat == 2) {
        potencia = Math.floor(Math.randomRange(15, 45) * m)
        tituloGen = "CADENC."
        descGen = "-" + potencia + "MS\nENTRE\nTIROS"
    } else if (tipoStat == 3) {
        potencia = Math.floor(Math.randomRange(25, 75) * m)
        tituloGen = "VIDA"
        descGen = "+" + potencia + "\nVIDA\nMAXIMA"
    } else if (tipoStat == 4) {
        potencia = Math.floor(Math.randomRange(15, 40) * m)
        tituloGen = "VELOC."
        descGen = "+" + potencia + "\nVEL.\nMOVIM."
    } else if (tipoStat == 5) {
        potencia = Math.floor(Math.randomRange(10, 30) * m)
        tituloGen = "CRITICO"
        descGen = "+" + potencia + "%\nPROB.\nCRITICA"
    } else if (tipoStat == 6) {
        potencia = 1
        tituloGen = "RAFAGA"
        descGen = "+1 BALA\nPOR\nDISPARO"
    } else if (tipoStat == 7) {
        potencia = Math.floor(Math.randomRange(20, 60) * m)
        tituloGen = "IMAN XP"
        descGen = "+" + potencia + "\nRADIO\nDE EXP"
    } else if (tipoStat == 8) {
        potencia = Math.floor(Math.randomRange(30, 100) * m)
        tituloGen = "CURAR"
        descGen = "CURA\n+" + potencia + "\nDE VIDA"
    } else if (tipoStat == 9) {
        potencia = Math.floor(Math.randomRange(25, 75) * m)
        tituloGen = "ESCUDO"
        descGen = "+" + potencia + "\nPTS DE\nESCUDO"
    } else if (tipoStat == 10) {
        potencia = Math.floor(Math.randomRange(20, 50) * m)
        tituloGen = "IMAN $"
        descGen = "+" + potencia + "\nRADIO\nMONEDAS"
    } else if (tipoStat == 11) {
        potencia = Math.floor(Math.randomRange(25, 80) * m)
        tituloGen = "ORO +"
        descGen = "+" + potencia + "%\nORO\nEXTRA"
    } else if (tipoStat == 12) {
        potencia = Math.max(1, Math.floor(Math.randomRange(10, 25) * m / 5))
        tituloGen = "DEFENSA"
        descGen = "-" + potencia + "\nDANO\nRECIBIDO"
    } else if (tipoStat == 13) {
        potencia = Math.floor(Math.randomRange(30, 90) * m)
        tituloGen = "BALAS"
        descGen = "+" + potencia + "\nVEL.\nBALAS"
    } else if (tipoStat == 14) {
        potencia = Math.floor(Math.randomRange(20, 80) * m)
        tituloGen = "EXP +"
        descGen = "+" + potencia + "%\nEXP.\nGANADA"
    } else if (tipoStat == 15) {
        potencia = 1
        colorRareza = 2
        if (nivelHabilidadDash > 0) {
            tituloGen = "DASH+"
            descGen = "MENOS\nESPERA\nEN DASH"
        } else {
            tituloGen = "DASH"
            descGen = "ESQUIVE\nCON\nBOTON B"
        }
    } else if (tipoStat == 16) {
        potencia = 1
        colorRareza = 9
        if (nivelHabilidadNova > 0) {
            tituloGen = "NOVA+"
            descGen = "MAS\nDANO Y\nRADIO"
        } else {
            tituloGen = "NOVA"
            descGen = "ATAQUE\nAREA\nCADA 5S"
        }
    } else if (tipoStat == 17) {
        potencia = 1
        colorRareza = 5
        tituloGen = "PERFORA"
        descGen = "BALAS\nPASAN\n+1 ENEM"
    } else if (tipoStat == 18) {
        potencia = 1
        colorRareza = 2
        tituloGen = "VAMPIRO"
        descGen = "+0.5HP\nPOR\nBAJA"
    } else if (tipoStat == 19) {
        potencia = Math.floor(Math.randomRange(4, 9) * m)
        tituloGen = "REGEN"
        descGen = "+" + (potencia / 10) + " HP\nCADA\nSEGUNDO"
    } else if (tipoStat == 20) {
        potencia = Math.floor(Math.randomRange(10, 25) * m)
        tituloGen = "ESPINAS"
        descGen = "REFLEJA\n" + potencia + "\nDANO"
    } else if (tipoStat == 21) {
        potencia = Math.floor(Math.randomRange(8, 20) * m)
        tituloGen = "CODICIA"
        descGen = "+" + potencia + "%\nDROP\nMONEDAS"
    } else if (tipoStat == 22) {
        potencia = 1
        colorRareza = 2
        tituloGen = "BOMBA"
        if (nivelExplosivas > 0) {
            descGen = "EXPLOS.\nMAS\nGRANDES"
        } else {
            descGen = "BALAS\nEXPLOS.\nEN AREA"
        }
    } else if (tipoStat == 23) {
        potencia = 1
        colorRareza = 2
        tituloGen = "ORBES"
        descGen = "+1 ORBE\nGIRA\nCONTIGO"
    } else if (tipoStat == 24) {
        potencia = 1
        colorRareza = 9
        if (nivelRayo > 0) {
            tituloGen = "RAYO+"
            descGen = "MAS\nRAPIDO\nY FUERTE"
        } else {
            tituloGen = "RAYO"
            descGen = "RAYO\nAL AZAR\nCADA 3S"
        }
    } else if (tipoStat == 25) {
        potencia = 1
        colorRareza = 2
        if (nivelAura > 0) {
            tituloGen = "AURA+"
            descGen = "MAS\nGRANDE\nY FUERTE"
        } else {
            tituloGen = "AURA"
            descGen = "ZONA DE\nDANO\nCERCANA"
        }
    } else if (tipoStat == 26) {
        potencia = 1
        colorRareza = 2
        tituloGen = "ATRAER"
        descGen = "ATRAE\nTODO\nAHORA"
    } else if (tipoStat == 27) {
        potencia = Math.floor(Math.randomRange(4, 9) * m)
        tituloGen = "ESQUIVA"
        descGen = "+" + potencia + "%\nDE\nEVADIR"
    } else if (tipoStat == 28) {
        potencia = 1
        colorRareza = 5
        tituloGen = "HIELO"
        if (nivelHielo > 0) {
            descGen = "FRENO\nMAYOR\nY MAS"
        } else {
            descGen = "BALAS\nFRENAN\nA TODOS"
        }
    } else if (tipoStat == 29) {
        potencia = Math.floor(Math.randomRange(20, 50) * m)
        tituloGen = "CRIT X"
        descGen = "+" + potencia + "%\nDANO\nCRITICO"
    } else {
        potencia = 1
        colorRareza = 9
        tituloGen = "REVIVIR"
        descGen = "REVIVES\nSI\nMUERES"
    }

    return {
        titulo: tituloGen,
        descripcion: descGen,
        tipoStat: tipoStat,
        valorPotencia: potencia,
        rarezaColor: colorRareza
    }
}

function presentarTresOpcionesMejora() {
    estadoActual = EstadoJuego.MenuSubirNivel
    indiceCartaSeleccionada = 0
    opcionesCartasPresentadas = []

    congelarEscena()

    let usados: number[] = []
    let intentos = 0
    while (opcionesCartasPresentadas.length < 3 && intentos < 60) {
        intentos++
        let c = generarMejoraAleatoria()
        let ty = c.tipoStat
        if (usados.indexOf(ty) >= 0) continue
        if (ty == 6 && numProyectiles >= 7) continue
        if (ty == 23 && nivelOrbes >= 6) continue
        if (ty == 27 && esquivaProb >= 45) continue
        if (ty == 30 && vidasExtra >= 2) continue
        if (ty == 22 || ty == 24 || ty == 28 || ty == 30) continue   // DEMO: solo en el juego completo
        if ((ty == 26 || ty == 30) && Math.randomRange(1, 100) > 40) continue
        usados.push(ty)
        opcionesCartasPresentadas.push(c)
    }
}

function aplicarMejoraProcedural(mejora: MejoraProcedural) {
    let t = mejora.tipoStat
    let v = mejora.valorPotencia

    if (t == 1) danoAtaque += v
    else if (t == 2) cadenciaDisparoMs = Math.max(30, cadenciaDisparoMs - v)
    else if (t == 3) { vidaMaxima += v; vidaActual += v }
    else if (t == 4) { velMovimiento += v; controller.moveSprite(jugadorSprite, velMovimiento, velMovimiento) }
    else if (t == 5) probabilidadCritico = Math.min(80, probabilidadCritico + v)
    else if (t == 6) numProyectiles += v
    else if (t == 7) radioAtraccionXP += v
    else if (t == 8) vidaActual = Math.min(vidaMaxima, vidaActual + v)
    else if (t == 9) { puntosEscudoActivo += v; actualizarGraficoEscudo() }
    else if (t == 10) radioAtraccionMonedas += v
    else if (t == 11) multiplicadorMonedas += (v / 100)
    else if (t == 12) armaduraReduccion += v
    else if (t == 13) velProyectil += v
    else if (t == 14) multiplicadorXP += (v / 100)
    else if (t == 15) { if (nivelHabilidadDash == 0) modoB = 0; nivelHabilidadDash += 1 }
    else if (t == 16) nivelHabilidadNova += 1
    else if (t == 17) perforacion += 1
    else if (t == 18) vampirismo += 1
    else if (t == 19) regenPorSeg += v / 10
    else if (t == 20) espinas += v
    else if (t == 21) dropMonedaExtra += v
    else if (t == 22) nivelExplosivas += 1
    else if (t == 23) nivelOrbes += 1
    else if (t == 24) nivelRayo += 1
    else if (t == 25) nivelAura += 1
    else if (t == 26) imantarTodo()
    else if (t == 27) esquivaProb = Math.min(45, esquivaProb + v)
    else if (t == 28) nivelHielo += 1
    else if (t == 29) multiplicadorCritico += v / 100
    else if (t == 30) vidasExtra += 1
}

function imantarTodo() {
    for (let g of sprites.allOfKind(SpriteKind.SemillaXP)) g.data["imantado"] = true
    for (let m of sprites.allOfKind(SpriteKind.MonedaOro)) m.data["imantado"] = true
    for (let p of sprites.allOfKind(SpriteKind.PocionVida)) p.data["imantado"] = true
}

function radioAura(): number {
    return 28 + 6 * nivelAura
}

function cdNova(): number {
    return Math.max(2500, 5000 - 500 * (nivelHabilidadNova - 1))
}

// =========================================================
// INICIO DE PARTIDA Y OLEADAS
// =========================================================

function limpiarTodo() {
    if (jugadorSprite) controller.moveSprite(jugadorSprite, 0, 0)
    sprites.destroyAllSpritesOfKind(SpriteKind.Player)
    sprites.destroyAllSpritesOfKind(SpriteKind.Enemy)
    sprites.destroyAllSpritesOfKind(SpriteKind.JefeEnemigo)
    sprites.destroyAllSpritesOfKind(SpriteKind.ProyectilJugador)
    sprites.destroyAllSpritesOfKind(SpriteKind.ProyectilEnemigo)
    sprites.destroyAllSpritesOfKind(SpriteKind.SemillaXP)
    sprites.destroyAllSpritesOfKind(SpriteKind.PocionVida)
    sprites.destroyAllSpritesOfKind(SpriteKind.MonedaOro)
    sprites.destroyAllSpritesOfKind(SpriteKind.TiendaMercader)
    sprites.destroyAllSpritesOfKind(SpriteKind.EscudoProtector)
    sprites.destroyAllSpritesOfKind(SpriteKind.Orbe)
    sprites.destroyAllSpritesOfKind(SpriteKind.Food)
    sprites.destroyAllSpritesOfKind(SpriteKind.Recurso)
    sprites.destroyAllSpritesOfKind(SpriteKind.Casa)
    sprites.destroyAllSpritesOfKind(SpriteKind.Npc)
    sprites.destroyAllSpritesOfKind(SpriteKind.Bomba)
    chunksCargados = []
    ciudadesActivas = []
    raidActiva = false
    npcCerca = null
    hayCiudadCerca = false
    ciudadActualNombre = ""
    jugadorSprite = null
    spriteEscudo = null
    tiendaActivaSprite = null
    orbes = []
    particulasFondo = []
    textosFlotantes = []
    enZonaActivacionTienda = false
}

function iniciarPartida() {
    limpiarTodo()
    demoGanada = false
    estadoActual = EstadoJuego.Jugando

    vidaMaxima = 100
    vidaActual = vidaMaxima
    velMovimiento = 95
    nivelJugador = 1
    xpActual = 0
    xpSiguienteNivel = 100
    puntosPuntuacion = 0
    cantidadMonedas = 0
    acumMonedas = 0
    invulnerableHasta = 0

    danoAtaque = 25
    cadenciaDisparoMs = 150
    numProyectiles = 1
    velProyectil = 240
    probabilidadCritico = 10
    multiplicadorCritico = 2.0
    radioAtraccionXP = 30
    multiplicadorXP = 1.0
    armaduraReduccion = 0
    multiplicadorMonedas = 1.0
    radioAtraccionMonedas = 40
    puntosEscudoActivo = 0

    perforacion = 0
    vampirismo = 0
    regenPorSeg = 0
    proxRegen = 0
    espinas = 0
    dropMonedaExtra = 0
    nivelExplosivas = 0
    nivelOrbes = 0
    nivelRayo = 0
    proxRayo = 0
    nivelAura = 0
    proxAura = 0
    esquivaProb = 0
    nivelHielo = 0
    vidasExtra = 0

    nivelHabilidadDash = 0
    nivelHabilidadNova = 0
    cooldownDashMs = 0
    cooldownNovaMs = 0

    // Bonus del personaje elegido
    if (skinSeleccionada == 1) multiplicadorMonedas += 0.5
    else if (skinSeleccionada == 2) danoAtaque += 10
    else if (skinSeleccionada == 3) velMovimiento += 20
    else if (skinSeleccionada == 4) { vidaMaxima += 40; vidaActual = vidaMaxima }
    else if (skinSeleccionada == 5) nivelHabilidadNova = 1
    else if (skinSeleccionada == 6) probabilidadCritico += 15
    else if (skinSeleccionada == 7) { nivelHabilidadDash = 1; esquivaProb = 10 }

    // V20: inventario y crafteo
    mats = [0, 0, 0, 0, 0, 0, 0, 0]
    mejorasCraft = [0, 0, 0, 0, 0]
    biomaActual = -1
    proxToastBioma = 0
    colSombra = 6
    objetivoCache = null
    proxBusqueda = 0
    balasVivas = 0
    proxCheckOleada = 0
    tengoArma = [true, false, false, false, false]
    armaEquipada = 0
    bombas = 0
    raidActiva = false
    regalos = [0, 0, 0]
    npcRegalo = null
    npcRegaloFase = 0
    tiempoEnCiudadMs = 0
    raidAvisado = false
    ultimoRaidTick = game.runtime()
    ciudadesRaid = []
    ciudadesArrasadas = []
    ciudadesAliadas = []
    escanCx = -99999
    escanCy = -99999
    escanArras = -1
    proxEscaneoCuerpo = 0
    casaOpc = ["SALIR"]
    casaAcc = [4]
    vendas = 0
    modoB = (nivelHabilidadDash > 0) ? 0 : 1
    proxBomba = 0
    descansoHasta = 0

    // Estadisticas de la partida
    killsPartida = 0
    monedasPartida = 0
    jefesPartida = 0
    tiempoPartidaMs = 0
    sumarPartida = 1
    ultimoTickMs = game.runtime()
    nuevosDesbloqueos = []
    nuevoRecord = false
    ultimoAtacante = ""
    tiposVistos = [false, false, false, false, false, false, false, false]
    comprasTienda = [0, 0, 0, 0, 0, 0, 0, 0]
    bannerHasta = 0
    toastHasta = 0
    mensajeTiendaHasta = 0

    oleadaActual = 1
    bichosEnOleada = 10 + (nivelDificultad * 6)
    totalBichosOleadaInicial = bichosEnOleada
    ultimaDirX = 1
    ultimaDirY = 0

    scene.setBackgroundColor(7)

    jugadorFrameA = recolorSkin(imgJugadorBase, SKIN_PRINCIPAL[skinSeleccionada], SKIN_OSCURO[skinSeleccionada])
    jugadorFrameB = desplazarImagen(jugadorFrameA, 1)

    jugadorSprite = sprites.create(jugadorFrameA, SpriteKind.Player)
    jugadorSprite.setPosition(80, 60)
    jugadorSprite.z = 1
    scene.cameraFollowSprite(jugadorSprite)
    controller.moveSprite(jugadorSprite, velMovimiento, velMovimiento)

    if (nivelHabilidadNova > 0) actualizarGraficoEscudo()
    proxMundo = 0
    actualizarMundo(game.runtime())
    prepararSiguienteOleada()
}

function volverAlMenu() {
    limpiarTodo()
    estadoActual = EstadoJuego.MenuPrincipal
    opcionMenuSel = 0
    scene.cameraFollowSprite(null)
    scene.centerCameraAt(80, 60)
    inicializarFondoParticulas()
}

function verificarYSpawnearTiendaAleatoria() {
    if (tiendaActivaSprite) {
        tiendaActivaSprite.destroy()
        tiendaActivaSprite = null
    }
    // Tienda lejos del spawn (180 a 300 pixeles): hay que explorar
    if (Math.randomRange(1, 100) <= 70) {
        tiendaActivaSprite = sprites.create(imgCirculoTienda, SpriteKind.TiendaMercader)
        let anguloTienda = Math.randomRange(0, 360) * (Math.PI / 180)
        let distanciaLejana = Math.randomRange(180, 300)
        tiendaActivaSprite.setPosition(
            jugadorSprite.x + Math.cos(anguloTienda) * distanciaLejana,
            jugadorSprite.y + Math.sin(anguloTienda) * distanciaLejana
        )
        tiendaActivaSprite.z = 0
        mostrarToast("HAY UNA TIENDA!", "BUSCA EL CIRCULO", 5)
    }
}

function prepararSiguienteOleada() {
    bichosRestantesPorSpawn = bichosEnOleada
    totalBichosOleadaInicial = bichosEnOleada
    tiempoProximoSpawn = game.runtime() + 800

    verificarYSpawnearTiendaAleatoria()
    comprobarMisiones()

    if (oleadaActual % 5 == 0) {
        spawnJefe()
    } else {
        mostrarBanner("OLEADA " + oleadaActual + "/" + DEMO_OLEADAS, NOMBRES_DIFICULTAD[nivelDificultad], 5)
    }
}

function spawnJefe() {
    let variante = Math.floor(oleadaActual / 5) - 1
    let frames = crearFramesJefe(variante)
    let jefe = sprites.create(frames[0], SpriteKind.JefeEnemigo)
    animation.runImageAnimation(jefe, frames, 350, true)
    jefe.setPosition(jugadorSprite.x + 140, jugadorSprite.y + 140)
    jefe.z = 2

    let multiplicadorHp = 1.0
    let multiplicadorDano = 1.0
    let velJefe = 25

    if (nivelDificultad == 0) {
        multiplicadorHp = 1.0; multiplicadorDano = 1.0; velJefe = 20
    } else if (nivelDificultad == 1) {
        multiplicadorHp = 2.5; multiplicadorDano = 2.0; velJefe = 32
    } else if (nivelDificultad == 2) {
        multiplicadorHp = 5.5; multiplicadorDano = 3.8; velJefe = 48
    }

    let hpBase = (500 + (oleadaActual * 180)) * multiplicadorHp
    jefe.data["hp"] = hpBase
    jefe.data["maxHp"] = hpBase
    jefe.data["dano"] = (30 + (oleadaActual * 6)) * multiplicadorDano
    jefe.data["velocidad"] = velJefe
    jefe.data["nombre"] = NOMBRES_JEFE[variante % NOMBRES_JEFE.length]
    jefe.data["patron"] = 0
    jefe.data["proxAtaque"] = game.runtime() + 2500
    totalBichosOleadaInicial += 1

    scene.cameraShake(4, 500)
    mostrarBanner("JEFE: " + NOMBRES_JEFE[variante % NOMBRES_JEFE.length], "OLEADA " + oleadaActual, 2)
}

// =========================================================
// ENEMIGOS
// =========================================================

function elegirTipoEnemigo(): number {
    let pool: number[] = [0, 0, 0]
    if (oleadaActual >= 2) { pool.push(1); pool.push(1) }
    if (oleadaActual >= 3) { pool.push(2); pool.push(3) }
    if (oleadaActual >= 4) pool.push(5)
    if (oleadaActual >= 5) pool.push(6)
    if (oleadaActual >= 6) { pool.push(4); pool.push(3) }
    return pool[Math.randomRange(0, pool.length - 1)]
}

function crearEnemigo(tipo: number, x: number, y: number): Sprite {
    let frames = FRAMES_TIPO[tipo]
    let bicho = sprites.create(frames[0], SpriteKind.Enemy)
    animation.runImageAnimation(bicho, frames, 280, true)
    bicho.z = 1
    bicho.setPosition(x, y)

    let multDifHp = (nivelDificultad == 2) ? 2.2 : (nivelDificultad == 1 ? 1.4 : 0.8)
    let multDifDano = (nivelDificultad == 2) ? 2.5 : (nivelDificultad == 1 ? 1.5 : 0.7)
    let multDifVel = (nivelDificultad == 2) ? 1.4 : (nivelDificultad == 1 ? 1.1 : 0.9)

    let hp = (25 + (oleadaActual * 15)) * multDifHp * HP_TIPO[tipo]
    let dano = (10 + (oleadaActual * 3)) * multDifDano * DANO_TIPO[tipo]
    let vel = Math.min(85, (32 + (oleadaActual * 2.5)) * multDifVel * VEL_TIPO[tipo])

    bicho.data["tipo"] = tipo
    bicho.data["hp"] = hp
    bicho.data["maxHp"] = hp
    bicho.data["dano"] = dano
    bicho.data["velocidad"] = vel
    bicho.data["proxDisparo"] = game.runtime() + Math.randomRange(1200, 2400)

    if (tipo >= 3 && tipo <= 6 && !tiposVistos[tipo]) {
        tiposVistos[tipo] = true
        let aviso = "CUIDADO!"
        if (tipo == 3) mostrarToast(aviso, "ARQUEROS DISPARAN", 2)
        else if (tipo == 4) mostrarToast(aviso, "BRUJOS: MAGIA x3", 2)
        else if (tipo == 5) mostrarToast(aviso, "BOMBITAS EXPLOTAN", 2)
        else mostrarToast(aviso, "GELATINA SE DIVIDE", 2)
    }
    return bicho
}

function disparoEnemigo(x: number, y: number, ang: number, vel: number, dano: number, magico: boolean) {
    let b = sprites.create(magico ? imgBalaMagica : imgBalaEnemiga, SpriteKind.ProyectilEnemigo)
    b.setPosition(x, y)
    b.z = 2
    b.vx = Math.cos(ang) * vel
    b.vy = Math.sin(ang) * vel
    b.lifespan = 3200
    b.setFlag(SpriteFlag.AutoDestroy, true)
    b.data["dano"] = dano
}

function explotarBombita(b: Sprite) {
    if (b.data["muerto"]) return
    b.data["muerto"] = true
    crearAnillo(b.x, b.y, 34, 4, 260)
    crearEfectoMuerte(b.x, b.y)
    scene.cameraShake(3, 200)
    let dx = jugadorSprite.x - b.x
    let dy = jugadorSprite.y - b.y
    if (dx * dx + dy * dy <= 34 * 34) {
        recibirDanoJugador(((b.data["dano"] as number) || 20) * 1.2, "BOMBITA")
    }
    b.destroy()
}

function actualizarEnemigos(ahora: number) {
    let lista = sprites.allOfKind(SpriteKind.Enemy)
    if (raidActiva) npcsCache = sprites.allOfKind(SpriteKind.Npc)
    // Con muchos enemigos, cada uno piensa un frame de cada dos (mantiene su velocidad entre medias)
    let escalonar = lista.length > 30
    frameIA++
    for (let b of lista) {
        if (escalonar && (b.id + frameIA) % 2 != 0) continue
        if (b.data["muerto"]) continue
        let tipo = (b.data["tipo"] as number) || 0
        let vel = (b.data["velocidad"] as number) || 30
        if (ahora < ((b.data["lentoHasta"] as number) || 0)) vel = vel * 0.5

        let objX = jugadorSprite.x
        let objY = jugadorSprite.y
        if (b.data["raider"]) {
            let nv = npcMasCercano(b.x, b.y)
            if (nv) {
                let ax = nv.x - b.x
                let ay = nv.y - b.y
                let px = jugadorSprite.x - b.x
                let py = jugadorSprite.y - b.y
                if (ax * ax + ay * ay < px * px + py * py + 1600) {
                    objX = nv.x
                    objY = nv.y
                }
            }
        }
        let dx = objX - b.x
        let dy = objY - b.y
        let d = Math.sqrt(dx * dx + dy * dy)
        if (d < 1) d = 1
        let ux = dx / d
        let uy = dy / d

        if (tipo == 3 || tipo == 4) {
            // A distancia: mantiene la posicion y dispara
            let ideal = (tipo == 3) ? 85 : 100
            if (d > ideal + 15) {
                b.vx = ux * vel
                b.vy = uy * vel
            } else if (d < ideal - 20) {
                b.vx = -ux * vel
                b.vy = -uy * vel
            } else {
                b.vx = -uy * vel * 0.5
                b.vy = ux * vel * 0.5
            }
            if (ahora >= ((b.data["proxDisparo"] as number) || 0) && d < 150) {
                let danoP = (b.data["dano"] as number) || 10
                let ang = Math.atan2(dy, dx)
                if (tipo == 3) {
                    disparoEnemigo(b.x, b.y, ang, 95, danoP, false)
                    b.data["proxDisparo"] = ahora + 1900
                } else {
                    disparoEnemigo(b.x, b.y, ang - 0.3, 70, danoP, true)
                    disparoEnemigo(b.x, b.y, ang, 70, danoP, true)
                    disparoEnemigo(b.x, b.y, ang + 0.3, 70, danoP, true)
                    b.data["proxDisparo"] = ahora + 2600
                }
            }
        } else if (tipo == 5) {
            // Bombita: corre y explota
            b.vx = ux * vel
            b.vy = uy * vel
            if (d < 24) {
                explotarBombita(b)
            }
        } else {
            b.vx = ux * vel
            b.vy = uy * vel
        }
        repelerDeCiudad(b, vel)
    }
}

function actualizarJefes(ahora: number) {
    for (let j of sprites.allOfKind(SpriteKind.JefeEnemigo)) {
        let vel = (j.data["velocidad"] as number) || 25
        if (ahora < ((j.data["lentoHasta"] as number) || 0)) vel = vel * 0.5
        let dx = jugadorSprite.x - j.x
        let dy = jugadorSprite.y - j.y
        let d = Math.sqrt(dx * dx + dy * dy)
        if (d < 1) d = 1
        j.vx = dx / d * vel
        j.vy = dy / d * vel
        repelerDeCiudad(j, vel)

        if (ahora >= ((j.data["proxAtaque"] as number) || 0)) {
            let patron = (j.data["patron"] as number) || 0
            j.data["patron"] = patron + 1
            j.data["proxAtaque"] = ahora + ((nivelDificultad == 2) ? 1700 : 2400)
            let danoB = ((j.data["dano"] as number) || 30) * 0.5
            let p = patron % 3
            j.sayText("!", 400)
            if (p == 0) {
                // Anillo de balas
                for (let k = 0; k < 12; k++) {
                    disparoEnemigo(j.x, j.y, k * Math.PI / 6, 65, danoB, false)
                }
            } else if (p == 1) {
                // Abanico dirigido
                let ang = Math.atan2(dy, dx)
                for (let k = -2; k <= 2; k++) {
                    disparoEnemigo(j.x, j.y, ang + k * 0.28, 90, danoB, true)
                }
            } else {
                // Invoca esbirros + anillo corto
                for (let k = 0; k < 3; k++) {
                    let a = Math.randomRange(0, 360) * (Math.PI / 180)
                    crearEnemigo(7, j.x + Math.cos(a) * 30, j.y + Math.sin(a) * 30)
                }
                totalBichosOleadaInicial += 3
                for (let k = 0; k < 6; k++) {
                    disparoEnemigo(j.x, j.y, k * Math.PI / 3, 60, danoB, false)
                }
            }
        }
    }
}

// =========================================================
// DISPARO
// =========================================================

// =========================================================
// BUCLE PRINCIPAL
// =========================================================

function congelarEscena() {
    controller.moveSprite(jugadorSprite, 0, 0)
    jugadorSprite.vx = 0
    jugadorSprite.vy = 0
    jugadorSprite.setFlag(SpriteFlag.Invisible, false)
    for (let b of sprites.allOfKind(SpriteKind.Enemy)) { b.vx = 0; b.vy = 0 }
    for (let j of sprites.allOfKind(SpriteKind.JefeEnemigo)) { j.vx = 0; j.vy = 0 }
    for (let n of sprites.allOfKind(SpriteKind.Npc)) { n.vx = 0; n.vy = 0 }
    sprites.destroyAllSpritesOfKind(SpriteKind.ProyectilJugador)
    sprites.destroyAllSpritesOfKind(SpriteKind.ProyectilEnemigo)
    textosFlotantes = []
    bombas += sprites.allOfKind(SpriteKind.Bomba).length
    sprites.destroyAllSpritesOfKind(SpriteKind.Bomba)
}

function reanudarJuego() {
    estadoActual = EstadoJuego.Jugando
    controller.moveSprite(jugadorSprite, velMovimiento, velMovimiento)
    let ahora = game.runtime()
    tiempoProximoSpawn = ahora + 500
    ultimoTickMs = ahora
    proxRayo = ahora + 1500
    for (let b of sprites.allOfKind(SpriteKind.Enemy)) {
        b.data["proxDisparo"] = ahora + Math.randomRange(900, 1800)
    }
}

function golpearRayo(ahora: number) {
    let candidatos: Sprite[] = []
    for (let b of sprites.allOfKind(SpriteKind.Enemy)) {
        let dx = b.x - jugadorSprite.x
        let dy = b.y - jugadorSprite.y
        if (dx * dx + dy * dy < 130 * 130) candidatos.push(b)
    }
    for (let j of sprites.allOfKind(SpriteKind.JefeEnemigo)) candidatos.push(j)
    if (candidatos.length == 0) return
    let objetivo = candidatos[Math.randomRange(0, candidatos.length - 1)]
    let ox = objetivo.x
    let oy = objetivo.y
    crearRayoVisual(ox, oy)
    crearEfectoMuerte(ox, oy)
    music.setVolume(Math.map(volumenAudio, 0, 100, 0, 90))
    music.playTone(1200, 40)
    procesarDanoAEnemigo(objetivo, danoAtaque * (1.8 + 0.4 * nivelRayo), true)
}

game.onUpdate(function () {
    if (estadoActual != EstadoJuego.Jugando || !jugadorSprite) return

    let tiempoAhora = game.runtime()

    // Tiempo de partida (ignora pausas)
    let dt = tiempoAhora - ultimoTickMs
    ultimoTickMs = tiempoAhora
    if (dt > 0 && dt < 100) tiempoPartidaMs += dt

    // Animacion del jugador y parpadeo al ser golpeado
    let moviendo = jugadorSprite.vx != 0 || jugadorSprite.vy != 0
    if (moviendo) {
        ultimaDirX = jugadorSprite.vx > 0 ? 1 : (jugadorSprite.vx < 0 ? -1 : 0)
        ultimaDirY = jugadorSprite.vy > 0 ? 1 : (jugadorSprite.vy < 0 ? -1 : 0)
    }
    jugadorSprite.setImage((moviendo && Math.floor(tiempoAhora / 140) % 2 == 1) ? jugadorFrameB : jugadorFrameA)
    let invulnerable = tiempoAhora < invulnerableHasta
    jugadorSprite.setFlag(SpriteFlag.Invisible, invulnerable && Math.floor(tiempoAhora / 50) % 2 == 0)

    // Mundo (ciudades y recursos), interaccion y bombas
    actualizarMundo(tiempoAhora)
    if ((frameIA & 1) == 0) actualizarInteraccion()
    actualizarRaid(tiempoAhora)
    actualizarRegaloNPC()
    actualizarRegalos(tiempoAhora)
    actualizarBombas(tiempoAhora)

    // Disparo continuo (junto a un vecino, A sirve para entrar)
    if (controller.A.isPressed() && !npcCerca) {
        ejecutarDisparoManual()
    }

    // Regeneracion
    if (regenPorSeg > 0 && tiempoAhora >= proxRegen) {
        proxRegen = tiempoAhora + 1000
        if (vidaActual < vidaMaxima) vidaActual = Math.min(vidaMaxima, vidaActual + regenPorSeg)
    }

    // Listas de este frame (se comparten entre nova, orbes y aura)
    let enemigos: Sprite[] = []
    let jefes: Sprite[] = []
    if (nivelHabilidadNova > 0 || nivelOrbes > 0 || nivelAura > 0) {
        enemigos = sprites.allOfKind(SpriteKind.Enemy)
        jefes = sprites.allOfKind(SpriteKind.JefeEnemigo)
    }

    // Nova automatica
    if (nivelHabilidadNova > 0 && tiempoAhora >= cooldownNovaMs) {
        cooldownNovaMs = tiempoAhora + cdNova()
        let radioNova = 56 + 8 * nivelHabilidadNova
        let multNova = 1.5 + 0.4 * (nivelHabilidadNova - 1)
        music.setVolume(Math.map(volumenAudio, 0, 100, 0, 120))
        music.playTone(300, 100)
        scene.cameraShake(3, 200)
        crearAnillo(jugadorSprite.x, jugadorSprite.y, radioNova, 9, 220)
        for (let bicho of enemigos) {
            let dx = bicho.x - jugadorSprite.x
            let dy = bicho.y - jugadorSprite.y
            if (dx * dx + dy * dy <= radioNova * radioNova) {
                procesarDanoAEnemigo(bicho, danoAtaque * multNova, true)
            }
        }
        for (let jefe of jefes) {
            let dx = jefe.x - jugadorSprite.x
            let dy = jefe.y - jugadorSprite.y
            if (dx * dx + dy * dy <= radioNova * radioNova) {
                procesarDanoAEnemigo(jefe, danoAtaque * (multNova - 0.5), true)
            }
        }
    }

    // Orbes giratorios
    if (nivelOrbes > 0) {
        while (orbes.length < nivelOrbes) {
            let o = sprites.create(imgOrbe, SpriteKind.Orbe)
            o.setFlag(SpriteFlag.Ghost, true)
            o.z = 2
            orbes.push(o)
        }
        let dmgOrbe = Math.max(4, danoAtaque * 0.6)
        let proyEnemigas = sprites.allOfKind(SpriteKind.ProyectilEnemigo)
        for (let i = 0; i < orbes.length; i++) {
            let ang = tiempoAhora / 380 + i * 6.2832 / orbes.length
            let ox = jugadorSprite.x + Math.cos(ang) * 26
            let oy = jugadorSprite.y + Math.sin(ang) * 26
            orbes[i].setPosition(ox, oy)
            for (let b of enemigos) {
                let dx = b.x - ox
                let dy = b.y - oy
                if (dx * dx + dy * dy < 12 * 12 && tiempoAhora >= ((b.data["orbCd"] as number) || 0)) {
                    b.data["orbCd"] = tiempoAhora + 400
                    procesarDanoAEnemigo(b, dmgOrbe, false)
                }
            }
            for (let j of jefes) {
                let dx = j.x - ox
                let dy = j.y - oy
                if (dx * dx + dy * dy < 18 * 18 && tiempoAhora >= ((j.data["orbCd"] as number) || 0)) {
                    j.data["orbCd"] = tiempoAhora + 400
                    procesarDanoAEnemigo(j, dmgOrbe, false)
                }
            }
            // Los orbes tambien bloquean proyectiles enemigos
            for (let pe of proyEnemigas) {
                let dx = pe.x - ox
                let dy = pe.y - oy
                if (dx * dx + dy * dy < 10 * 10) pe.destroy()
            }
        }
    }

    // Aura de dano
    if (nivelAura > 0 && tiempoAhora >= proxAura) {
        proxAura = tiempoAhora + 500
        let ra = radioAura()
        let dmgAura = Math.max(3, danoAtaque * (0.25 + 0.1 * nivelAura))
        for (let b of enemigos) {
            let dx = b.x - jugadorSprite.x
            let dy = b.y - jugadorSprite.y
            if (dx * dx + dy * dy <= ra * ra) procesarDanoAEnemigo(b, dmgAura, false)
        }
        for (let j of jefes) {
            let dx = j.x - jugadorSprite.x
            let dy = j.y - jugadorSprite.y
            if (dx * dx + dy * dy <= (ra + 12) * (ra + 12)) procesarDanoAEnemigo(j, dmgAura, false)
        }
    }

    // Rayos
    if (nivelRayo > 0 && tiempoAhora >= proxRayo) {
        proxRayo = tiempoAhora + Math.max(900, 3200 - 350 * nivelRayo)
        golpearRayo(tiempoAhora)
    }

    // Aparicion de enemigos
    if (bichosRestantesPorSpawn > 0 && tiempoAhora >= tiempoProximoSpawn) {
        if (sprites.allOfKind(SpriteKind.Enemy).length < 60) {
            let tipo = elegirTipoEnemigo()
            let anguloRandom = Math.randomRange(0, 360) * (Math.PI / 180)
            let radioDistancia = Math.randomRange(130, 180)
            crearEnemigo(tipo,
                jugadorSprite.x + Math.cos(anguloRandom) * radioDistancia,
                jugadorSprite.y + Math.sin(anguloRandom) * radioDistancia)
            bichosRestantesPorSpawn--
        }
        tiempoProximoSpawn = tiempoAhora + Math.max(90, 500 - (oleadaActual * 18))
    }

    actualizarEnemigos(tiempoAhora)
    actualizarJefes(tiempoAhora)

    if ((frameIA & 1) == 0) {
    // Atraccion de XP
    for (let gema of sprites.allOfKind(SpriteKind.SemillaXP)) {
        let dx = jugadorSprite.x - gema.x
        let dy = jugadorSprite.y - gema.y
        let dist2 = dx * dx + dy * dy
        if (gema.data["imantado"]) {
            let d = Math.max(1, Math.sqrt(dist2))
            gema.vx = dx / d * 170
            gema.vy = dy / d * 170
        } else if (dist2 < radioAtraccionXP * radioAtraccionXP) {
            gema.vx = dx * 3
            gema.vy = dy * 3
        }
    }

    // Atraccion de monedas
    for (let moneda of sprites.allOfKind(SpriteKind.MonedaOro)) {
        let dx = jugadorSprite.x - moneda.x
        let dy = jugadorSprite.y - moneda.y
        let dist2 = dx * dx + dy * dy
        if (moneda.data["imantado"]) {
            let d = Math.max(1, Math.sqrt(dist2))
            moneda.vx = dx / d * 170
            moneda.vy = dy / d * 170
        } else if (dist2 < radioAtraccionMonedas * radioAtraccionMonedas) {
            moneda.vx = dx * 3.5
            moneda.vy = dy * 3.5
        }
    }

    // Pociones imantadas
    for (let pv of sprites.allOfKind(SpriteKind.PocionVida)) {
        if (pv.data["imantado"]) {
            let dx = jugadorSprite.x - pv.x
            let dy = jugadorSprite.y - pv.y
            let d = Math.max(1, Math.sqrt(dx * dx + dy * dy))
            pv.vx = dx / d * 170
            pv.vy = dy / d * 170
        }
    }

    }

    // Permanencia en el circulo de la tienda (3 segundos)
    if (tiendaActivaSprite) {
        let dxT = jugadorSprite.x - tiendaActivaSprite.x
        let dyT = jugadorSprite.y - tiendaActivaSprite.y
        let distT = Math.sqrt(dxT * dxT + dyT * dyT)
        if (distT <= 22) {
            if (!enZonaActivacionTienda) {
                enZonaActivacionTienda = true
                tiempoInicioPermanenciaTienda = game.runtime()
            } else {
                let transcurrido = game.runtime() - tiempoInicioPermanenciaTienda
                if (transcurrido >= 3000) {
                    enZonaActivacionTienda = false
                    estadoActual = EstadoJuego.TiendaInteractiva
                    opcionTiendaSel = 0
                    mensajeTiendaHasta = 0
                    congelarEscena()
                    sonarConfirmar()
                }
            }
        } else {
            enZonaActivacionTienda = false
        }
    }

    if (puntosEscudoActivo > 0 && spriteEscudo) {
        spriteEscudo.setPosition(jugadorSprite.x, jugadorSprite.y)
    }

    // Limpieza de numeros flotantes caducados
    for (let i = textosFlotantes.length - 1; i >= 0; i--) {
        if (tiempoAhora > textosFlotantes[i].fin) textosFlotantes.removeAt(i)
    }

    // Fin de oleada
    if (bichosRestantesPorSpawn <= 0 && tiempoAhora >= proxCheckOleada) {
        proxCheckOleada = tiempoAhora + 250
        if (sprites.allOfKind(SpriteKind.Enemy).length == 0 && sprites.allOfKind(SpriteKind.JefeEnemigo).length == 0) {
            puntosPuntuacion += 100 * oleadaActual
            if (oleadaActual >= DEMO_OLEADAS) {
                finDemo()
                return
            }
            oleadaActual++
            bichosEnOleada += 5
            prepararSiguienteOleada()
        }
    }
})

function actualizarGraficoEscudo() {
    if (puntosEscudoActivo > 0 && !spriteEscudo) {
        spriteEscudo = sprites.create(imgEscudo, SpriteKind.EscudoProtector)
        spriteEscudo.setFlag(SpriteFlag.Ghost, true)
        spriteEscudo.z = 2
    } else if (puntosEscudoActivo <= 0 && spriteEscudo) {
        spriteEscudo.destroy()
        spriteEscudo = null
    }
}

// =========================================================
// DANO, BOTIN Y COLISIONES
// =========================================================

function crearMoneda(x: number, y: number) {
    let moneda = sprites.create(imgMoneda, SpriteKind.MonedaOro)
    moneda.setPosition(x, y)
    moneda.z = 1
    animation.runImageAnimation(moneda, FRAMES_MONEDA, 130, true)
}

function procesarDanoAEnemigo(enemigo: Sprite, dano: number, mostrar: boolean) {
    if (enemigo.data["muerto"]) return

    let esCritico = Math.randomRange(1, 100) <= probabilidadCritico
    let danoFinal = Math.floor(esCritico ? dano * multiplicadorCritico : dano)
    if (danoFinal < 1) danoFinal = 1

    let hpActual = ((enemigo.data["hp"] as number) || 10) - danoFinal
    enemigo.data["hp"] = hpActual

    if (mostrar) {
        if (esCritico) textoFlotante(enemigo.x, enemigo.y - 8, "" + danoFinal + "!", 5)
        else textoFlotante(enemigo.x, enemigo.y - 8, "" + danoFinal, 1)
    }

    if (hpActual <= 0) {
        enemigo.data["muerto"] = true
        let esJefe = enemigo.kind() == SpriteKind.JefeEnemigo
        let tipo = (enemigo.data["tipo"] as number) || 0
        let ex = enemigo.x
        let ey = enemigo.y

        puntosPuntuacion += esJefe ? 500 : 20
        killsPartida++
        if (vampirismo > 0) vidaActual = Math.min(vidaMaxima, vidaActual + 0.5 * vampirismo)

        crearEfectoMuerte(ex, ey)
        soltarMateriales(tipo, esJefe, ex, ey)

        let gemaXP = sprites.create(imgGemaXP, SpriteKind.SemillaXP)
        gemaXP.setPosition(ex, ey)
        gemaXP.z = 1
        if (esJefe) gemaXP.data["xp"] = 150

        if (esJefe) {
            jefesPartida++
            scene.cameraShake(6, 600)
            for (let k = 0; k < 10; k++) crearMoneda(ex + Math.randomRange(-18, 18), ey + Math.randomRange(-18, 18))
            let gemaVida = sprites.create(imgGemaVida, SpriteKind.PocionVida)
            gemaVida.setPosition(ex, ey + 10)
            gemaVida.z = 1
            mostrarToast("JEFE DERROTADO!", "+500 PUNTOS", 5)
        } else {
            if (Math.randomRange(1, 100) <= 5) {
                let gemaVida = sprites.create(imgGemaVida, SpriteKind.PocionVida)
                gemaVida.setPosition(ex + Math.randomRange(-6, 6), ey + Math.randomRange(-6, 6))
                gemaVida.z = 1
            }
            if (Math.randomRange(1, 100) <= Math.min(100, 60 + dropMonedaExtra)) {
                crearMoneda(ex + Math.randomRange(-8, 8), ey + Math.randomRange(-8, 8))
            }
            // La gelatina se divide en dos minis
            if (tipo == 6) {
                for (let k = 0; k < 2; k++) {
                    crearEnemigo(7, ex + Math.randomRange(-10, 10), ey + Math.randomRange(-10, 10))
                }
                totalBichosOleadaInicial += 2
            }
        }

        enemigo.destroy()
        comprobarMisiones()
    }
}

function explosionBala(x: number, y: number, excluir: Sprite) {
    let r = 18 + 6 * nivelExplosivas
    crearAnillo(x, y, r, 4, 160)
    for (let b of sprites.allOfKind(SpriteKind.Enemy)) {
        if (b == excluir) continue
        let dx = b.x - x
        let dy = b.y - y
        if (dx * dx + dy * dy <= r * r) procesarDanoAEnemigo(b, danoAtaque * 0.5, false)
    }
    for (let j of sprites.allOfKind(SpriteKind.JefeEnemigo)) {
        if (j == excluir) continue
        let dx = j.x - x
        let dy = j.y - y
        if (dx * dx + dy * dy <= (r + 10) * (r + 10)) procesarDanoAEnemigo(j, danoAtaque * 0.5, false)
    }
}

function manejarImpactoBala(bala: Sprite, objetivo: Sprite) {
    if (estadoActual != EstadoJuego.Jugando) return
    if (bala.data["gastada"]) return
    let perf = (bala.data["perf"] as number) || 0
    if (perf > 0) {
        if (yaGolpeada(bala, objetivo.id)) return
        bala.data["perf"] = perf - 1
    } else {
        bala.data["gastada"] = true
    }

    let ox = objetivo.x
    let oy = objetivo.y
    procesarDanoAEnemigo(objetivo, danoAtaque * ((bala.data["mult"] as number) || 1), true)
    if (nivelHielo > 0 && !objetivo.data["muerto"]) {
        objetivo.data["lentoHasta"] = game.runtime() + 1000 + 300 * nivelHielo
    }
    if (nivelExplosivas > 0) explosionBala(ox, oy, objetivo)

    if (perf <= 0) bala.destroy()
}

sprites.onOverlap(SpriteKind.ProyectilJugador, SpriteKind.Enemy, function (bala, bicho) {
    manejarImpactoBala(bala, bicho)
})

sprites.onOverlap(SpriteKind.ProyectilJugador, SpriteKind.JefeEnemigo, function (bala, jefe) {
    manejarImpactoBala(bala, jefe)
})

// Devuelve true si el golpe llego a hacer dano
function recibirDanoJugador(danoBase: number, origen: string): boolean {
    let ahora = game.runtime()
    if (estadoActual != EstadoJuego.Jugando) return false
    if (ahora < invulnerableHasta) return false
    if (zonaSegura(jugadorSprite.x, jugadorSprite.y)) return false

    if (esquivaProb > 0 && Math.randomRange(1, 100) <= esquivaProb) {
        invulnerableHasta = ahora + 250
        textoFlotante(jugadorSprite.x, jugadorSprite.y - 12, "ESQUIVA", 9)
        return false
    }

    invulnerableHasta = ahora + INVULNERABILIDAD_MS
    ultimoAtacante = origen

    let danoReal = Math.max(1, Math.floor(danoBase - armaduraReduccion))
    textoFlotante(jugadorSprite.x, jugadorSprite.y - 12, "-" + danoReal, 2)
    scene.cameraShake(2, 120)

    if (puntosEscudoActivo > 0) {
        puntosEscudoActivo -= danoReal
        if (puntosEscudoActivo < 0) {
            vidaActual += puntosEscudoActivo
            puntosEscudoActivo = 0
        }
        actualizarGraficoEscudo()
    } else {
        vidaActual -= danoReal
    }

    if (vidaActual <= 0) {
        if (vidasExtra > 0) {
            // Segunda vida: revives con la mitad y una explosion
            vidasExtra--
            vidaActual = Math.max(1, vidaMaxima * 0.5)
            invulnerableHasta = ahora + 2000
            scene.cameraShake(5, 400)
            crearAnillo(jugadorSprite.x, jugadorSprite.y, 70, 9, 300)
            for (let b of sprites.allOfKind(SpriteKind.Enemy)) {
                let dx = b.x - jugadorSprite.x
                let dy = b.y - jugadorSprite.y
                if (dx * dx + dy * dy <= 70 * 70) procesarDanoAEnemigo(b, danoAtaque * 3, true)
            }
            sprites.destroyAllSpritesOfKind(SpriteKind.ProyectilEnemigo)
            mostrarToast("HAS REVIVIDO!", "OTRA OPORTUNIDAD", 9)
        } else {
            morirJugador()
        }
    }
    return true
}

function morirJugador() {
    if (estadoActual == EstadoJuego.GameOver) return
    estadoActual = EstadoJuego.GameOver
    tiempoMuerteMs = game.runtime()
    opcionGameOverSel = 0

    controller.moveSprite(jugadorSprite, 0, 0)
    jugadorSprite.vx = 0
    jugadorSprite.vy = 0
    for (let b of sprites.allOfKind(SpriteKind.Enemy)) { b.vx = 0; b.vy = 0 }
    for (let j of sprites.allOfKind(SpriteKind.JefeEnemigo)) { j.vx = 0; j.vy = 0 }
    sprites.destroyAllSpritesOfKind(SpriteKind.ProyectilJugador)
    sprites.destroyAllSpritesOfKind(SpriteKind.ProyectilEnemigo)

    crearEfectoMuerte(jugadorSprite.x, jugadorSprite.y)
    crearAnillo(jugadorSprite.x, jugadorSprite.y, 30, 2, 400)
    jugadorSprite.setFlag(SpriteFlag.Invisible, true)
    scene.cameraShake(6, 600)
    music.setVolume(Math.map(volumenAudio, 0, 100, 0, 150))
    music.playTone(196, 300)

    finalizarPartida()
}

// DEMO: se llega aqui al vencer la ultima oleada (jefe final de la demo)
function finDemo() {
    if (estadoActual == EstadoJuego.GameOver) return
    demoGanada = true
    puntosPuntuacion += 500
    estadoActual = EstadoJuego.GameOver
    tiempoMuerteMs = game.runtime() - 600
    opcionGameOverSel = 0
    controller.moveSprite(jugadorSprite, 0, 0)
    jugadorSprite.vx = 0
    jugadorSprite.vy = 0
    for (let b of sprites.allOfKind(SpriteKind.Enemy)) { b.vx = 0; b.vy = 0 }
    sprites.destroyAllSpritesOfKind(SpriteKind.ProyectilJugador)
    sprites.destroyAllSpritesOfKind(SpriteKind.ProyectilEnemigo)
    crearAnillo(jugadorSprite.x, jugadorSprite.y, 40, 7, 500)
    music.setVolume(Math.map(volumenAudio, 0, 100, 0, 150))
    music.playTone(523, 120)
    music.playTone(659, 120)
    music.playTone(784, 120)
    music.playTone(1047, 300)
    finalizarPartida()
}

// Guarda estadisticas, records y comprueba misiones
function finalizarPartida() {
    comprobarMisiones()
    statKills += killsPartida
    statMonedas += monedasPartida
    statJefes += jefesPartida
    statMaxOleada = Math.max(statMaxOleada, oleadaActual)
    statMaxNivel = Math.max(statMaxNivel, nivelJugador)
    statMaxPts = Math.max(statMaxPts, puntosPuntuacion)
    if (nivelDificultad == 2) statNoche = Math.max(statNoche, oleadaActual)
    statPartidas++
    sumarPartida = 0
    guardarProgreso()

    nuevoRecord = puntosPuntuacion > obtenerRecordDificultad(nivelDificultad)
    guardarRecordDificultad(nivelDificultad, puntosPuntuacion)
}

sprites.onOverlap(SpriteKind.Player, SpriteKind.SemillaXP, function (jugador, gema) {
    // Solo se recoge si estamos jugando (evita perder XP o subir dos veces en el mismo frame)
    if (estadoActual != EstadoJuego.Jugando) return
    let base = (gema.data["xp"] as number) || 25
    gema.destroy()
    sonarNavegacion()

    xpActual += Math.floor(base * multiplicadorXP)
    if (xpActual >= xpSiguienteNivel) {
        nivelJugador++
        xpActual = xpActual - xpSiguienteNivel
        xpSiguienteNivel += 60
        comprobarMisiones()
        presentarTresOpcionesMejora()
    }
})

sprites.onOverlap(SpriteKind.Player, SpriteKind.PocionVida, function (jugador, gemaVida) {
    if (estadoActual != EstadoJuego.Jugando) return
    gemaVida.destroy()
    sonarConfirmar()
    vidaActual = Math.min(vidaMaxima, vidaActual + 25)
    textoFlotante(jugador.x, jugador.y - 12, "+25", 7)
})

sprites.onOverlap(SpriteKind.Player, SpriteKind.MonedaOro, function (jugador, moneda) {
    if (estadoActual != EstadoJuego.Jugando) return
    moneda.destroy()
    sonarNavegacion()
    // El multiplicador de oro acumula decimales (antes 1.5x no daba nada)
    acumMonedas += multiplicadorMonedas
    let ganadas = Math.floor(acumMonedas)
    acumMonedas -= ganadas
    cantidadMonedas += ganadas
    monedasPartida += ganadas
})

sprites.onOverlap(SpriteKind.Player, SpriteKind.Enemy, function (jugador, bicho) {
    if (estadoActual != EstadoJuego.Jugando) return
    let tipo = (bicho.data["tipo"] as number) || 0
    if (tipo == 5) {
        explotarBombita(bicho)
        return
    }
    let danoEnemigo = (bicho.data["dano"] as number) || 10
    let golpeo = recibirDanoJugador(danoEnemigo, NOMBRE_TIPO[tipo])
    if (golpeo && espinas > 0) procesarDanoAEnemigo(bicho, espinas, true)

    if (!bicho.data["muerto"]) {
        bicho.x += (bicho.x < jugador.x) ? -18 : 18
        bicho.y += (bicho.y < jugador.y) ? -18 : 18
    }
})

sprites.onOverlap(SpriteKind.Player, SpriteKind.JefeEnemigo, function (jugador, jefe) {
    if (estadoActual != EstadoJuego.Jugando) return
    let danoJefe = (jefe.data["dano"] as number) || 30
    recibirDanoJugador(danoJefe, "JEFE")

    // Empujon al jefe para alejarlo del jugador
    jefe.x += (jefe.x < jugador.x) ? -30 : 30
    jefe.y += (jefe.y < jugador.y) ? -30 : 30
})

sprites.onOverlap(SpriteKind.Player, SpriteKind.ProyectilEnemigo, function (jugador, bala) {
    if (estadoActual != EstadoJuego.Jugando) return
    let danoB = (bala.data["dano"] as number) || 10
    bala.destroy()
    recibirDanoJugador(danoB, "PROYECTIL")
})

// =========================================================
// V20: CIUDADES, RECURSOS, CRAFTEO, ARMAS, BOMBAS E INVENTARIO
// =========================================================

const CHUNK = 256
const RADIO_CIUDAD = 75
const NOMBRES_CIUDAD: string[] = ["VILLA ROBLE", "PUERTO SOL", "NIDO ALTO", "VALLE LUNA", "FUERTE PAZ", "ALDEA BRISA"]
const NOMBRES_NPC: string[] = ["MARTA", "BRUNO", "ELENA", "TOMAS", "LUCIA", "HUGO"]
const FRASES_NPC: string[] = [
    "PASA, AQUI\nESTAS A\nSALVO.",
    "DESCANSA Y\nPREPARATE\nPARA LA HORDA",
    "TE PREPARO\nLA CAMA Y\nLA MESA.",
    "CON MADERA\nY HIERRO SE\nHACEN ARMAS",
    "LAS BOMBAS\nNECESITAN\nPOLVORA.",
    "CUIDATE DE\nLOS JEFES,\nVIAJERO."
]
// Posicion de las casas respecto al centro de la ciudad (x, y por casa)
const CASA_OFF: number[] = [-44, -20, 34, -24, -4, 34]

// V23: todas las casas son iguales (craftear y descansar). Nadie vende nada.
const ROL_NOMBRE: string[] = ["VECINO", "VECINO", "VECINO"]
const ROL_FRASE: string[] = [
    "PASA, ESTA\nES TU CASA.",
    "DESCANSA Y\nPREPARATE\nPARA LA HORDA",
    "AQUI ESTAS\nA SALVO."
]
// Precio de descansar (las ciudades aliadas son gratis)
const PRECIO_DESCANSO = 8

// Materiales: 0 madera, 1 piedra, 2 fibra, 3 hierro, 4 polvora
// V22: 5 CACTUS (desierto), 6 CRISTAL (tundra), 7 ESPORAS (pantano / bosque)
const NUM_MATS = 8
const MAT_NOMBRE: string[] = ["MADERA", "PIEDRA", "FIBRA", "HIERRO", "POLVORA", "CACTUS", "CRISTAL", "ESPORAS"]
const MAT_ABR: string[] = ["MAD", "PIE", "FIB", "HIE", "POL", "CAC", "CRI", "ESP"]
const MAT_COL: number[] = [4, 1, 3, 9, 2, 7, 6, 11]
// Recursos del mapa: 0 arbol, 1 arbusto, 2 roca, 3 roca con hierro, 4 cactus, 5 cristal, 6 hongo
const HP_RECURSO: number[] = [5, 1, 6, 6, 4, 7, 1]

// Los arbustos y hongos se recogen al pasar por encima
function esRecolectable(rt: number): boolean {
    return rt == 1 || rt == 6
}

// Armas: 0 pistola, 1 espada, 2 arco, 3 escopeta, 4 hacha
const ARMA_NOMBRE: string[] = ["PISTOLA", "ESPADA", "ARCO", "ESCOPETA", "HACHA"]
const ARMA_DESC: string[] = [
    "DISPARO BASICO AUTOMATICO",
    "CERCA: CORTE EN ARCO",
    "FLECHAS QUE PERFORAN",
    "5 BALINES A CORTA DISTANCIA",
    "CERCA: GIRA EN 360 GRADOS"
]
const MULT_CAD: number[] = [1, 1.4, 1.7, 3.2, 2.8]
const SONIDO_ARMA: number[] = [880, 520, 660, 220, 330]
// Alcance de las armas cuerpo a cuerpo (0 = es un arma de disparo)
const ARMA_ALCANCE: number[] = [0, 36, 0, 0, 32]

// Recetas: 0 espada, 1 arco, 2 escopeta, 3 hacha, 4 bombas, 5 venda
// V22 (mejoras permanentes, max 3 cada una): 6 armadura, 7 botas, 8 amuleto, 9 hielo, 10 elixir
const REC_NOMBRE: string[] = ["ESPADA", "ARCO", "ESCOPETA", "HACHA", "2 BOMBAS", "VENDA", "ARMADURA", "BOTAS", "AMULETO", "HIELO", "ELIXIR"]
const REC_DESC: string[] = [
    "CERCA: CORTE EN ARCO",
    "FLECHAS QUE PERFORAN",
    "5 BALINES, CORTO ALCANCE",
    "CERCA: GIRA EN 360 GRADOS",
    "EXPLOTAN EN AREA (BOTON B)",
    "CURA 40 DE VIDA (MENU)",
    "-2 DANO RECIBIDO (MAX 3)",
    "+12 VELOCIDAD (MAX 3)",
    "+8% CRITICO (MAX 3)",
    "HIELO: RALENTIZA (MAX 3)",
    "+15 VIDA MAX (MAX 3)"
]
const MEJORA_MAX = 3
//                                        mad pie fib hie pol cac cri esp
const REC_COSTE: number[][] = [
    [2, 3, 0, 1, 0, 0, 0, 0],
    [4, 0, 4, 0, 0, 0, 0, 0],
    [3, 0, 0, 3, 2, 0, 0, 0],
    [3, 5, 2, 0, 0, 0, 0, 0],
    [0, 0, 1, 0, 2, 0, 0, 0],
    [0, 0, 4, 0, 0, 0, 0, 0],
    [0, 0, 3, 1, 0, 6, 0, 0],
    [2, 0, 3, 0, 0, 0, 0, 4],
    [0, 2, 0, 1, 0, 0, 4, 0],
    [0, 0, 0, 0, 2, 0, 5, 1],
    [0, 0, 0, 0, 0, 3, 2, 3]
]
const INV_FILAS = 8
const INV_DESC: string[] = [
    ARMA_DESC[0], ARMA_DESC[1], ARMA_DESC[2], ARMA_DESC[3], ARMA_DESC[4],
    "A: EL BOTON B LANZA BOMBAS",
    "A: EL BOTON B HACE DASH",
    "A: CURA 40 DE VIDA"
]

// Estado del mundo y del jugador (V20)
let chunksCargados: Chunk[] = []
let ciudadesActivas: Ciudad[] = []
let proxMundo: number = 0
let npcCerca: Sprite = null
let hayCiudadCerca: boolean = false
let ciudadCercanaX: number = 0
let ciudadCercanaY: number = 0
let ciudadActualNombre: string = ""
let mats: number[] = [0, 0, 0, 0, 0, 0, 0, 0]
let tengoArma: boolean[] = [true, false, false, false, false]
let armaEquipada: number = 0
let bombas: number = 0
let vendas: number = 0
let modoB: number = 1
let proxBomba: number = 0
let invSel: number = 0
let craftSel: number = 0
let casaSel: number = 0
let casaNombre: string = ""
let casaFrase: string = ""
let retratoNPC: Image = null
let descansoHasta: number = 0
let casaRol: number = 0
let casaAliada: boolean = false
let casaOpc: string[] = ["SALIR"]
let casaAcc: number[] = [4]
let ciudadesAliadas: string[] = []
let ciudadCercanaNombre: string = ""
let ciudadCercanaDist: number = 0
// Cache de ciudades candidatas para la flecha guia (solo se recalcula al cambiar de chunk)
let escanCx: number = -99999
let escanCy: number = -99999
let escanArras: number = -1
let candX: number[] = []
let candY: number[] = []
let candN: string[] = []
// Reparto de la IA enemiga entre frames y espera del escaneo cuerpo a cuerpo
let frameIA: number = 0
let proxEscaneoCuerpo: number = 0
let npcsCache: Sprite[] = []

// ---------------------------------------------------------
// Arte nuevo
// ---------------------------------------------------------

const imgIconoPistola = img`
    ........
    .bbbbbbb
    .bbbbbbb
    .eeb....
    .ee.....
    .ee.....
    ........
    ........
`
const imgIconoEspada = img`
    ......1f
    .....11f
    ....11f.
    .4.11f..
    ..411...
    ...4....
    ..e.4...
    .ee.....
`
const imgIconoArco = img`
    .ee.....
    e.e.....
    e..e....
    e...1111
    e..e....
    e.e.....
    .ee.....
    ........
`
const imgIconoEscopeta = img`
    ........
    .bbbbbbb
    bbbbbbbb
    eeee4...
    .eeee...
    ..ee....
    ........
    ........
`
const imgIconoHacha = img`
    .bbb....
    bbbbb.e.
    bbbb.e..
    .bb.e...
    ...e....
    ..e.....
    .e......
    e.......
`
const imgIconoBomba = img`
    .....45.
    ....e...
    ...fff..
    ..f232f.
    .f2222f.
    .f2222f.
    ..ffff..
    ........
`
const imgIconoVenda = img`
    .111111.
    11122111
    11122111
    12222221
    12222221
    11122111
    11122111
    .111111.
`
const imgIconoCasa = img`
    ...22...
    ..2222..
    .222222.
    22222222
    .dddddd.
    .ddeedd.
    .ddeedd.
    .dddddd.
`
const imgIconoArmadura = img`
    .77..77.
    77777777
    7f7777f7
    77777777
    .777777.
    .777777.
    .77ff77.
    ..7..7..
`
const imgIconoBotas = img`
    ........
    .44.....
    .44.....
    .44.....
    .444....
    .44444..
    .ffffff.
    ........
`
const imgIconoAmuleto = img`
    .5....5.
    ..5..5..
    ...55...
    ..9999..
    .991199.
    .999999.
    ..9999..
    ...99...
`
const imgIconoHielo = img`
    ...11...
    .1.11.1.
    ..1991..
    11999911
    ..1991..
    .1.11.1.
    ...11...
    ........
`
const imgIconoElixir = img`
    ..eeee..
    ...11...
    ...11...
    ..1771..
    .177771.
    .177771.
    .177771.
    ..1111..
`
const FRAMES_BOMBA: Image[] = [imgIconoBomba.doubled(), reemplazarColor(imgIconoBomba, 2, 5).doubled()]
const ICONOS_INV: Image[] = [imgIconoPistola, imgIconoEspada, imgIconoArco, imgIconoEscopeta, imgIconoHacha, imgIconoBomba, imgIconoRayo, imgIconoVenda]
ICONOS_TIENDA = [imgGemaVida, imgIconoEscudo, imgIconoVenda, imgIconoBomba, imgIconoBomba, imgIconoHacha, imgIconoArco, imgIconoSalir]
const ICONOS_REC: Image[] = [imgIconoEspada, imgIconoArco, imgIconoEscopeta, imgIconoHacha, imgIconoBomba, imgIconoVenda, imgIconoArmadura, imgIconoBotas, imgIconoAmuleto, imgIconoHielo, imgIconoElixir]

const imgBalaArco: Image = reemplazarColor(reemplazarColor(imgBala, 4, 8), 5, 9)
const imgPerdigon: Image = crearImgPerdigon()

function crearImgPerdigon(): Image {
    let p = image.create(4, 4)
    p.fill(4)
    p.setPixel(0, 0, 0)
    p.setPixel(3, 0, 0)
    p.setPixel(0, 3, 0)
    p.setPixel(3, 3, 0)
    p.setPixel(1, 1, 5)
    return p
}

function crearImgArbol(v: number): Image {
    let a = image.create(24, 30)
    a.fillRect(10, 18, 5, 12, 15)
    a.fillRect(11, 18, 3, 12, 14)
    if (v == 0) {
        a.fillCircle(12, 11, 11, 15)
        a.fillCircle(12, 11, 10, 7)
        a.fillCircle(16, 15, 5, 6)
        a.fillCircle(9, 7, 3, 6)
        a.setPixel(7, 5, 1)
        a.setPixel(8, 4, 1)
        a.fillRect(14, 8, 2, 2, 2)
        a.fillRect(7, 13, 2, 2, 2)
    } else {
        for (let i = 0; i < 4; i++) {
            let w = 5 + i * 4
            let x0 = 12 - Math.floor(w / 2)
            let y0 = 1 + i * 5
            a.fillRect(x0, y0, w, 7, 15)
            a.fillRect(x0 + 1, y0 + 1, w - 2, 5, 7)
            a.fillRect(x0 + Math.floor(w / 2), y0 + 1, Math.floor(w / 2) - 1, 5, 6)
        }
        a.fillRect(11, 20, 3, 10, 14)
    }
    return a
}

function crearImgArbusto(v: number): Image {
    let b = image.create(14, 10)
    b.fillCircle(4, 6, 4, 15)
    b.fillCircle(10, 6, 4, 15)
    b.fillCircle(7, 4, 4, 15)
    b.fillCircle(4, 6, 3, 7)
    b.fillCircle(10, 6, 3, 7)
    b.fillCircle(7, 4, 3, 7)
    b.fillRect(8, 6, 3, 2, 6)
    b.setPixel(5, 3, 6)
    if (v == 1) {
        b.setPixel(4, 6, 2)
        b.setPixel(10, 5, 2)
        b.setPixel(7, 3, 2)
        b.setPixel(6, 7, 2)
    }
    return b
}

function crearImgRoca(v: number): Image {
    let r = image.create(14, 12)
    r.fillCircle(7, 6, 6, 15)
    r.fillCircle(7, 6, 5, 11)
    r.fillRect(3, 3, 3, 2, 1)
    r.fillRect(8, 9, 4, 2, 12)
    if (v == 1) {
        r.fillRect(5, 6, 2, 2, 4)
        r.fillRect(9, 4, 2, 2, 4)
        r.fillRect(4, 9, 2, 1, 4)
    }
    return r
}

function crearImgCasa(techo: number): Image {
    let c = image.create(40, 36)
    c.fillRect(4, 14, 32, 21, 15)
    c.fillRect(5, 15, 30, 19, 13)
    for (let x = 9; x < 35; x += 6) c.fillRect(x, 15, 1, 19, 14)
    for (let r = 0; r < 14; r++) {
        let half = Math.min(20, 6 + Math.floor(r * 1.5))
        c.drawLine(20 - half, 1 + r, 20 + half, 1 + r, techo)
        c.setPixel(20 - half, 1 + r, 15)
        c.setPixel(20 + half, 1 + r, 15)
    }
    c.drawLine(0, 14, 39, 14, 15)
    c.fillRect(29, 0, 5, 7, 15)
    c.fillRect(30, 1, 3, 6, 14)
    c.fillRect(16, 22, 9, 12, 15)
    c.fillRect(17, 23, 7, 11, 14)
    c.setPixel(22, 28, 5)
    c.fillRect(8, 20, 6, 6, 15)
    c.fillRect(9, 21, 4, 4, 9)
    c.fillRect(10, 21, 1, 4, 14)
    c.fillRect(27, 20, 6, 6, 15)
    c.fillRect(28, 21, 4, 4, 9)
    c.fillRect(29, 21, 1, 4, 14)
    return c
}

function crearImgNPC(pri: number, osc: number, sombrero: number): Image {
    let im = recolorSkin(imgJugadorBase, pri, osc)
    im.fillRect(4, 0, 8, 3, sombrero)
    im.fillRect(3, 3, 10, 1, 15)
    return im
}

function recolor2(src: Image, de1: number, a1: number, de2: number, a2: number): Image {
    let r = src.clone()
    r.replace(de1, a1)
    r.replace(de2, a2)
    return r
}

function crearImgCactus(v: number): Image {
    let c = image.create(16, 24)
    // contornos
    c.fillRect(5, 1, 7, 23, 15)
    c.fillRect(0, 9, 7, 5, 15)
    c.fillRect(0, 3, 5, 8, 15)
    if (v == 0) {
        c.fillRect(10, 12, 6, 5, 15)
        c.fillRect(11, 6, 5, 8, 15)
    }
    // relleno
    c.fillRect(6, 2, 5, 21, 7)
    c.fillRect(1, 10, 6, 3, 7)
    c.fillRect(1, 4, 3, 7, 7)
    if (v == 0) {
        c.fillRect(10, 13, 5, 3, 7)
        c.fillRect(12, 7, 3, 7, 7)
    }
    // sombra y espinas
    c.fillRect(9, 2, 1, 21, 6)
    c.setPixel(7, 6, 1)
    c.setPixel(8, 12, 1)
    c.setPixel(7, 17, 1)
    c.setPixel(2, 6, 1)
    if (v == 0) c.setPixel(13, 9, 1)
    if (v == 1) {
        c.fillRect(7, 0, 3, 2, 2)
        c.setPixel(8, 0, 5)
    }
    return c
}

function dibujarCristal(im: Image, cx: number, base: number, alto: number, mitad: number) {
    let top = base - alto
    let corte = Math.floor(alto * 0.65)
    for (let i = 0; i <= alto; i++) {
        let h = (i < corte) ? Math.floor(mitad * i / corte) : mitad
        im.drawLine(cx - h - 1, top + i, cx + h + 1, top + i, 15)
    }
    for (let i = 1; i < alto; i++) {
        let h = (i < corte) ? Math.floor(mitad * i / corte) : mitad
        im.drawLine(cx - h, top + i, cx + h, top + i, 9)
        im.setPixel(cx + h, top + i, 8)
    }
    im.drawLine(cx - 1, top + 3, cx - 1, base - 3, 1)
}

function crearImgCristal(v: number): Image {
    let c = image.create(18, 20)
    if (v == 0) {
        dibujarCristal(c, 4, 19, 9, 2)
        dibujarCristal(c, 14, 19, 11, 2)
        dibujarCristal(c, 9, 19, 17, 4)
    } else {
        dibujarCristal(c, 5, 19, 12, 3)
        dibujarCristal(c, 12, 19, 16, 3)
    }
    return c
}

function crearImgHongo(v: number): Image {
    let h = image.create(12, 12)
    let capa = (v == 0) ? 2 : 11
    let punto = (v == 0) ? 1 : 9
    h.fillCircle(6, 5, 5, 15)
    h.fillCircle(6, 5, 4, capa)
    h.fillRect(0, 7, 12, 5, 0)
    h.fillRect(1, 6, 10, 2, 15)
    h.fillRect(2, 6, 8, 1, capa)
    h.fillRect(4, 8, 4, 4, 15)
    h.fillRect(5, 8, 2, 3, 1)
    h.setPixel(4, 3, punto)
    h.setPixel(7, 2, punto)
    h.setPixel(8, 5, punto)
    return h
}

const IMG_ARBOL: Image[] = [crearImgArbol(0), crearImgArbol(1)]
const IMG_ARBUSTO: Image[] = [crearImgArbusto(0), crearImgArbusto(1)]
const IMG_ARBOL_NIEVE: Image[] = [recolor2(IMG_ARBOL[0], 7, 1, 6, 9), recolor2(IMG_ARBOL[1], 7, 1, 6, 9)]
const IMG_ARBUSTO_SECO: Image[] = [recolor2(IMG_ARBUSTO[0], 7, 4, 6, 14), recolor2(IMG_ARBUSTO[1], 7, 4, 6, 14)]
const IMG_ARBUSTO_NIEVE: Image[] = [recolor2(IMG_ARBUSTO[0], 7, 9, 6, 1), recolor2(IMG_ARBUSTO[1], 7, 9, 6, 1)]
const IMG_CACTUS: Image[] = [crearImgCactus(0), crearImgCactus(1)]
const IMG_CRISTAL: Image[] = [crearImgCristal(0), crearImgCristal(1)]
const IMG_HONGO: Image[] = [crearImgHongo(0), crearImgHongo(1)]
const IMG_ROCA: Image[] = [crearImgRoca(0), crearImgRoca(1)]
const IMG_CASAS: Image[] = [crearImgCasa(2), crearImgCasa(8), crearImgCasa(4)]
const IMG_NPC: Image[] = [crearImgNPC(3, 2, 2), crearImgNPC(7, 6, 5), crearImgNPC(13, 14, 4)]

function crearImgPozo(): Image {
    let p = image.create(18, 18)
    p.fillCircle(9, 10, 8, 15)
    p.fillCircle(9, 10, 7, 13)
    p.fillCircle(9, 10, 5, 15)
    p.fillCircle(9, 10, 4, 8)
    p.fillRect(6, 9, 3, 1, 9)
    return p
}
const IMG_POZO: Image = crearImgPozo()

// ---------------------------------------------------------
// Mundo por chunks: ciudades y recursos (determinista)
// ---------------------------------------------------------

function hashChunk(cx: number, cy: number, salt: number): number {
    return Math.abs(((cx * 92821) ^ (cy * 68917) ^ (salt * 51787)) % 4093)
}

// V22: el mundo se divide en celdas de 10x10 chunks (2560 px). Cada celda tiene como mucho
// UNA ciudad, en un punto aleatorio lejos de los bordes. La celda (0,0) es la del inicio.
const CELDA = 10

function celdaCX(gx: number, gy: number): number {
    if (gx == 0 && gy == 0) return 1
    return gx * CELDA + 2 + hashMacro(gx, gy, 21) % 6
}

function celdaCY(gx: number, gy: number): number {
    if (gx == 0 && gy == 0) return 1
    return gy * CELDA + 2 + hashMacro(gx, gy, 22) % 6
}

function celdaTieneCiudad(gx: number, gy: number): boolean {
    if (gx == 0 && gy == 0) return true
    return hashMacro(gx, gy, 1) % 100 < 70
}

function esCiudad(cx: number, cy: number): boolean {
    let gx = Math.floor(cx / CELDA)
    let gy = Math.floor(cy / CELDA)
    if (celdaCX(gx, gy) != cx || celdaCY(gx, gy) != cy) return false
    return celdaTieneCiudad(gx, gy)
}

function ciudadX(cx: number, cy: number): number {
    return cx * CHUNK + 60 + hashChunk(cx, cy, 2) % 137
}

function ciudadY(cx: number, cy: number): number {
    return cy * CHUNK + 60 + hashChunk(cx, cy, 3) % 137
}

function chunkCargado(cx: number, cy: number): boolean {
    for (let ch of chunksCargados) {
        if (ch.cx == cx && ch.cy == cy) return true
    }
    return false
}

function ciudadEn(x: number, y: number): Ciudad {
    for (let c of ciudadesActivas) {
        let dx = x - c.x
        let dy = y - c.y
        if (dx * dx + dy * dy < RADIO_CIUDAD * RADIO_CIUDAD) return c
    }
    return null
}

function imagenRecurso(rt: number, v: number, b: number): Image {
    if (rt == 0) return (b == 3) ? IMG_ARBOL_NIEVE[v] : IMG_ARBOL[v]
    if (rt == 1) {
        if (b == 2) return IMG_ARBUSTO_SECO[v]
        if (b == 3) return IMG_ARBUSTO_NIEVE[v]
        return IMG_ARBUSTO[v]
    }
    if (rt == 2) return IMG_ROCA[0]
    if (rt == 3) return IMG_ROCA[1]
    if (rt == 4) return IMG_CACTUS[v]
    if (rt == 5) return IMG_CRISTAL[v]
    return IMG_HONGO[v]
}

function crearRecurso(ch: Chunk, rt: number, x: number, y: number, v: number, b: number) {
    let s = sprites.create(imagenRecurso(rt, v, b), SpriteKind.Recurso)
    s.setPosition(x, y)
    s.z = (rt == 0 || rt == 4) ? 0.7 : 0.6
    s.data["rt"] = rt
    s.data["hp"] = HP_RECURSO[rt]
    ch.sprites.push(s)
}

// Que recurso sale en cada bioma. roll: 0-99. r2: 0-99 (para elegir roca normal o con hierro)
function tipoRecursoBioma(b: number, roll: number, r2: number): number {
    if (b == 0) {
        if (roll < 30) return 0
        if (roll < 70) return 1
        if (roll < 84) return (r2 < 30) ? 3 : 2
        return -1
    }
    if (b == 1) {
        if (roll < 52) return 0
        if (roll < 74) return 1
        if (roll < 80) return (r2 < 30) ? 3 : 2
        if (roll < 86) return 6
        return -1
    }
    if (b == 2) {
        if (roll < 34) return 4
        if (roll < 54) return (r2 < 45) ? 3 : 2
        if (roll < 72) return 1
        return -1
    }
    if (b == 3) {
        if (roll < 26) return 0
        if (roll < 50) return 5
        if (roll < 64) return (r2 < 30) ? 3 : 2
        if (roll < 78) return 1
        return -1
    }
    if (roll < 24) return 0
    if (roll < 54) return 6
    if (roll < 74) return 1
    if (roll < 80) return (r2 < 30) ? 3 : 2
    return -1
}

// Hay alguna ciudad a menos de r pixeles? (mira las celdas vecinas, asi tambien evita el cruce de chunks)
function cercaDeCiudad(x: number, y: number, r: number): boolean {
    let gx0 = Math.floor(x / (CELDA * CHUNK))
    let gy0 = Math.floor(y / (CELDA * CHUNK))
    for (let gx = gx0 - 1; gx <= gx0 + 1; gx++) {
        for (let gy = gy0 - 1; gy <= gy0 + 1; gy++) {
            if (!celdaTieneCiudad(gx, gy)) continue
            let qx = celdaCX(gx, gy)
            let qy = celdaCY(gx, gy)
            let dx = x - ciudadX(qx, qy)
            let dy = y - ciudadY(qx, qy)
            if (dx * dx + dy * dy < r * r) return true
        }
    }
    return false
}

function sembrarRecursosBioma(ch: Chunk) {
    for (let i = 0; i < 18; i++) {
        let x = ch.cx * CHUNK + 10 + hashChunk(ch.cx, ch.cy, 100 + i) % (CHUNK - 20)
        let y = ch.cy * CHUNK + 10 + hashChunk(ch.cx, ch.cy, 130 + i) % (CHUNK - 20)
        if (ch.cx == 0 && ch.cy == 0) {
            let sx = x - 80
            let sy = y - 60
            if (sx * sx + sy * sy < 30 * 30) continue
        }
        if (cercaDeCiudad(x, y, 85)) continue
        let b = biomaEn(x, y)
        let roll = hashChunk(ch.cx, ch.cy, 160 + i) % 100
        let v = hashChunk(ch.cx, ch.cy, 190 + i) % 2
        let rt = tipoRecursoBioma(b, roll, hashChunk(ch.cx, ch.cy, 220 + i) % 100)
        if (rt < 0) continue
        crearRecurso(ch, rt, x, y, v, b)
    }
}

function cargarChunk(cx: number, cy: number) {
    let ch: Chunk = { cx: cx, cy: cy, sprites: [] }
    let hay = esCiudad(cx, cy)
    let arrasada = ciudadesArrasadas.indexOf(claveCiudad(cx, cy)) >= 0
    let tx = 0
    let ty = 0
    if (hay) {
        tx = ciudadX(cx, cy)
        ty = ciudadY(cx, cy)
        let nombre = NOMBRES_CIUDAD[hashChunk(cx, cy, 5) % NOMBRES_CIUDAD.length]
        ciudadesActivas.push({ cx: cx, cy: cy, x: tx, y: ty, nombre: nombre })
        let pozo = sprites.create(IMG_POZO, SpriteKind.Casa)
        pozo.setPosition(tx, ty)
        pozo.z = 0.25
        pozo.setFlag(SpriteFlag.Ghost, true)
        ch.sprites.push(pozo)
        let nCasas = 2 + hashChunk(cx, cy, 6) % 2
        for (let i = 0; i < nCasas; i++) {
            let hx = tx + CASA_OFF[i * 2]
            let hy = ty + CASA_OFF[i * 2 + 1]
            let casa = sprites.create(IMG_CASAS[(hashChunk(cx, cy, 7) + i) % 3], SpriteKind.Casa)
            casa.setPosition(hx, hy)
            casa.z = 0.3
            ch.sprites.push(casa)
            if (arrasada) continue
            let npc = sprites.create(IMG_NPC[(hashChunk(cx, cy, 8) + i) % 3], SpriteKind.Npc)
            npc.setPosition(hx, hy + 28)
            npc.z = 0.8
            npc.data["hp"] = 80
            npc.data["hpMax"] = 80
            npc.data["nombre"] = NOMBRES_NPC[(hashChunk(cx, cy, 9) + i * 2) % NOMBRES_NPC.length]
            npc.data["frase"] = (hashChunk(cx, cy, 9) + i) % FRASES_NPC.length
            npc.data["rol"] = i
            ch.sprites.push(npc)
        }
    }
    sembrarRecursosBioma(ch)
    chunksCargados.push(ch)
}

function actualizarMundo(ahora: number) {
    if (!jugadorSprite || ahora < proxMundo) return
    proxMundo = ahora + 350
    let pcx = Math.floor(jugadorSprite.x / CHUNK)
    let pcy = Math.floor(jugadorSprite.y / CHUNK)

    for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
            if (!chunkCargado(pcx + dx, pcy + dy)) cargarChunk(pcx + dx, pcy + dy)
        }
    }
    for (let i = chunksCargados.length - 1; i >= 0; i--) {
        let ch = chunksCargados[i]
        if (Math.abs(ch.cx - pcx) > 2 || Math.abs(ch.cy - pcy) > 2) {
            for (let s of ch.sprites) s.destroy()
            for (let k = ciudadesActivas.length - 1; k >= 0; k--) {
                if (ciudadesActivas[k].cx == ch.cx && ciudadesActivas[k].cy == ch.cy) ciudadesActivas.removeAt(k)
            }
            chunksCargados.removeAt(i)
        }
    }

    // Ciudad mas cercana (para la flecha guia)
    if (pcx != escanCx || pcy != escanCy || ciudadesArrasadas.length != escanArras) {
        escanCx = pcx
        escanCy = pcy
        escanArras = ciudadesArrasadas.length
        candX = []
        candY = []
        candN = []
        let pgx = Math.floor(pcx / CELDA)
        let pgy = Math.floor(pcy / CELDA)
        for (let gx = pgx - 2; gx <= pgx + 2; gx++) {
            for (let gy = pgy - 2; gy <= pgy + 2; gy++) {
                if (!celdaTieneCiudad(gx, gy)) continue
                let qx = celdaCX(gx, gy)
                let qy = celdaCY(gx, gy)
                if (ciudadesArrasadas.indexOf(claveCiudad(qx, qy)) < 0) {
                    candX.push(ciudadX(qx, qy))
                    candY.push(ciudadY(qx, qy))
                    candN.push(NOMBRES_CIUDAD[hashChunk(qx, qy, 5) % NOMBRES_CIUDAD.length])
                }
            }
        }
    }
    let mejor = 999999999
    hayCiudadCerca = false
    for (let i = 0; i < candX.length; i++) {
        let ddx = candX[i] - jugadorSprite.x
        let ddy = candY[i] - jugadorSprite.y
        let d2 = ddx * ddx + ddy * ddy
        if (d2 < mejor) {
            mejor = d2
            ciudadCercanaX = candX[i]
            ciudadCercanaY = candY[i]
            ciudadCercanaNombre = candN[i]
            hayCiudadCerca = true
        }
    }

    if (hayCiudadCerca) ciudadCercanaDist = Math.floor(Math.sqrt(mejor))

    // Aviso al entrar en una ciudad
    let c = ciudadEn(jugadorSprite.x, jugadorSprite.y)
    if (c) {
        if (ciudadActualNombre != c.nombre) {
            ciudadActualNombre = c.nombre
            mostrarToast(c.nombre, "NO TE QUEDES MUCHO", 9)
        }
    } else {
        ciudadActualNombre = ""
    }

    // Bioma actual: cambia el color de las sombras y avisa al entrar en uno nuevo
    let bi = biomaEn(jugadorSprite.x, jugadorSprite.y)
    if (bi != biomaActual) {
        if (biomaActual >= 0 && ahora > proxToastBioma && !c) {
            proxToastBioma = ahora + 6000
            mostrarToast(BIOMA_NOMBRE[bi], BIOMA_TIP[bi], BIOMA_COL[bi])
        }
        biomaActual = bi
        colSombra = SOMBRA_BIOMA[bi]
    }
}

function actualizarInteraccion() {
    npcCerca = null
    if (ciudadesActivas.length == 0 || raidActiva) return
    let mejor = 22 * 22
    for (let n of sprites.allOfKind(SpriteKind.Npc)) {
        let dx = n.x - jugadorSprite.x
        let dy = n.y - jugadorSprite.y
        let d2 = dx * dx + dy * dy
        if (d2 < mejor) {
            mejor = d2
            npcCerca = n
        }
    }
    // Durante una redada las casas estan cerradas
    if (raidActiva) npcCerca = null
}

// Los enemigos no pueden entrar en las ciudades
function repelerDeCiudad(s: Sprite, vel: number) {
    if (ciudadesActivas.length == 0 || s.data["muerto"]) return
    let c = ciudadEn(s.x, s.y)
    if (!c) return
    if (raidActiva && c.cx == raidCx && c.cy == raidCy) return
    let dx = s.x - c.x
    let dy = s.y - c.y
    let d = Math.max(1, Math.sqrt(dx * dx + dy * dy))
    s.vx = dx / d * vel * 1.3
    s.vy = dy / d * vel * 1.3
}

// Anillo de la zona segura
scene.createRenderable(0.4, function (target: Image, camera: scene.Camera) {
    if (!enPartida()) return
    for (let c of ciudadesActivas) {
        let cx = Math.floor(c.x - camera.drawOffsetX)
        let cy = Math.floor(c.y - camera.drawOffsetY)
        if (cx < -90 || cx > 250 || cy < -90 || cy > 210) continue
        let enRaid = raidActiva && c.cx == raidCx && c.cy == raidCy
        target.drawCircle(cx, cy, RADIO_CIUDAD, enRaid ? ((Math.floor(game.runtime() / 150) % 2 == 0) ? 2 : 4) : ((Math.floor(game.runtime() / 400) % 2 == 0) ? 9 : 8))
    }
})


// ---------------------------------------------------------
// Redadas: si te quedas mucho en una ciudad, los enemigos la atacan
// ---------------------------------------------------------

const RAID_AVISO_MS = 12000
const RAID_TIEMPO_MS = 20000
let raidActiva: boolean = false
let raidCx: number = 0
let raidCy: number = 0
let tiempoEnCiudadMs: number = 0
let raidAvisado: boolean = false
let ultimoRaidTick: number = 0
let ciudadesRaid: string[] = []
let ciudadesArrasadas: string[] = []

// V23: habilidades EXCLUSIVAS que regala un vecino al salvar la ciudad.
// No salen al subir de nivel ni se venden en la tienda.
const REGALO_NOMBRE: string[] = ["ESCUDO ALDEA", "TERREMOTO", "ARSENAL"]
const REGALO_DESC: string[] = ["ESCUDO SOLO", "ONDA CADA 10S", "BOMBA GRATIS"]
let regalos: number[] = [0, 0, 0]
let proxRegaloEscudo: number = 0
let proxTerremoto: number = 0
let proxArsenal: number = 0
let npcRegalo: Sprite = null
let npcRegaloFase: number = 0
let npcRegaloT0: number = 0
let npcCasaX: number = 0
let npcCasaY: number = 0

function elegirRegalo(): number {
    let libres: number[] = []
    // DEMO: el TERREMOTO (1) solo esta en el juego completo
    for (let i = 0; i < 3; i += 2) {
        if (regalos[i] == 0) libres.push(i)
    }
    if (libres.length > 0) return libres[Math.randomRange(0, libres.length - 1)]
    return Math.randomRange(0, 1) * 2
}

// El vecino mas cercano al jugador sale a buscarle para darle el regalo
function iniciarRegaloNPC(c: Ciudad) {
    let mejor: Sprite = null
    let md = 9999999
    for (let n of npcsDeCiudad(c)) {
        let dx = n.x - jugadorSprite.x
        let dy = n.y - jugadorSprite.y
        let d2 = dx * dx + dy * dy
        if (d2 < md) {
            md = d2
            mejor = n
        }
    }
    if (!mejor) return
    npcRegalo = mejor
    npcRegaloFase = 1
    npcRegaloT0 = game.runtime()
    npcCasaX = mejor.x
    npcCasaY = mejor.y
    textoFlotante(mejor.x, mejor.y - 14, "TE BUSCA!", 5)
}

function entregarRegalo() {
    let r = elegirRegalo()
    regalos[r] += 1
    let ahora = game.runtime()
    if (r == 0) proxRegaloEscudo = ahora + 4000
    else if (r == 1) proxTerremoto = ahora + 4000
    else proxArsenal = ahora + 4000
    let nombre = "" + npcRegalo.data["nombre"]
    mostrarBanner(nombre + " TE REGALA", "HABILIDAD ESPECIAL", 9)
    mostrarToast(REGALO_NOMBRE[r] + (regalos[r] > 1 ? " NIV " + regalos[r] : ""), REGALO_DESC[r], 9)
    crearAnillo(jugadorSprite.x, jugadorSprite.y, 30, 9, 400)
    music.setVolume(Math.map(volumenAudio, 0, 100, 0, 150))
    music.playTone(523, 100)
    music.playTone(659, 100)
    music.playTone(784, 220)
    npcRegaloFase = 2
}

function actualizarRegaloNPC() {
    if (npcRegaloFase == 0 || !npcRegalo) return
    if (sprites.allOfKind(SpriteKind.Npc).indexOf(npcRegalo) < 0) {
        npcRegalo = null
        npcRegaloFase = 0
        return
    }
    let tx = npcRegaloFase == 1 ? jugadorSprite.x : npcCasaX
    let ty = npcRegaloFase == 1 ? jugadorSprite.y : npcCasaY
    let dx = tx - npcRegalo.x
    let dy = ty - npcRegalo.y
    let d = Math.sqrt(dx * dx + dy * dy)
    if (npcRegaloFase == 1 && (d < 16 || game.runtime() - npcRegaloT0 > 9000)) {
        // si te alejas demasiado, el regalo llega igual a los 9 segundos
        npcRegalo.setVelocity(0, 0)
        entregarRegalo()
    } else if (d < 3 && npcRegaloFase == 2) {
        npcRegalo.setVelocity(0, 0)
        npcRegalo = null
        npcRegaloFase = 0
    } else {
        npcRegalo.setVelocity(dx / d * 75, dy / d * 75)
    }
}

// Efectos de las habilidades de regalo (se llama cada frame)
function actualizarRegalos(ahora: number) {
    if (regalos[0] > 0 && ahora >= proxRegaloEscudo) {
        proxRegaloEscudo = ahora + Math.max(5000, 11000 - 2000 * regalos[0])
        if (puntosEscudoActivo < 40 + 20 * regalos[0]) {
            puntosEscudoActivo += 20
            actualizarGraficoEscudo()
            textoFlotante(jugadorSprite.x, jugadorSprite.y - 14, "+20 ESCUDO", 9)
        }
    }
    if (regalos[1] > 0 && ahora >= proxTerremoto) {
        proxTerremoto = ahora + Math.max(5000, 10000 - 1500 * regalos[1])
        let rt = 60 + 10 * regalos[1]
        let dm = Math.max(20, danoAtaque * (1.2 + 0.3 * regalos[1]))
        crearAnillo(jugadorSprite.x, jugadorSprite.y, rt, 4, 350)
        scene.cameraShake(3, 250)
        for (let b of sprites.allOfKind(SpriteKind.Enemy)) {
            let dx = b.x - jugadorSprite.x
            let dy = b.y - jugadorSprite.y
            if (dx * dx + dy * dy <= rt * rt) procesarDanoAEnemigo(b, dm, false)
        }
        for (let j of sprites.allOfKind(SpriteKind.JefeEnemigo)) {
            let dx = j.x - jugadorSprite.x
            let dy = j.y - jugadorSprite.y
            if (dx * dx + dy * dy <= (rt + 12) * (rt + 12)) procesarDanoAEnemigo(j, dm, false)
        }
    }
    if (regalos[2] > 0 && ahora >= proxArsenal) {
        proxArsenal = ahora + Math.max(5000, 12000 - 2000 * regalos[2])
        if (bombas < 30) {
            bombas += 1
            textoFlotante(jugadorSprite.x, jugadorSprite.y - 14, "+1 BOMBA", 9)
        }
    }
}

function claveCiudad(cx: number, cy: number): string {
    return cx + "," + cy
}

function ciudadPorClave(cx: number, cy: number): Ciudad {
    for (let c of ciudadesActivas) {
        if (c.cx == cx && c.cy == cy) return c
    }
    return null
}

// La ciudad deja de ser segura solo mientras dura su redada
function zonaSegura(x: number, y: number): boolean {
    let c = ciudadEn(x, y)
    if (!c) return false
    if (raidActiva && c.cx == raidCx && c.cy == raidCy) return false
    return true
}

function npcsDeCiudad(c: Ciudad): Sprite[] {
    let lista: Sprite[] = []
    for (let n of sprites.allOfKind(SpriteKind.Npc)) {
        let dx = n.x - c.x
        let dy = n.y - c.y
        if (dx * dx + dy * dy < (RADIO_CIUDAD + 30) * (RADIO_CIUDAD + 30)) lista.push(n)
    }
    return lista
}

function npcMasCercano(x: number, y: number): Sprite {
    let mejor: Sprite = null
    let md = 9999999
    for (let n of npcsCache) {
        let dx = n.x - x
        let dy = n.y - y
        let d2 = dx * dx + dy * dy
        if (d2 < md) {
            md = d2
            mejor = n
        }
    }
    return mejor
}

function iniciarRaid(c: Ciudad) {
    raidActiva = true
    raidCx = c.cx
    raidCy = c.cy
    ciudadesRaid.push(claveCiudad(c.cx, c.cy))
    let n = Math.min(14, 6 + oleadaActual)
    for (let i = 0; i < n; i++) {
        let ang = Math.randomRange(0, 360) * (Math.PI / 180)
        let pool: number[] = [0, 0, 1, 2]
        if (oleadaActual >= 5) pool.push(6)
        let tipo = pool[Math.randomRange(0, pool.length - 1)]
        let e = crearEnemigo(tipo, c.x + Math.cos(ang) * (RADIO_CIUDAD + 55), c.y + Math.sin(ang) * (RADIO_CIUDAD + 55))
        e.data["raider"] = true
    }
    totalBichosOleadaInicial += n
    mostrarBanner("REDADA!", "PROTEGE A LA GENTE", 2)
    scene.cameraShake(4, 400)
    music.setVolume(Math.map(volumenAudio, 0, 100, 0, 140))
    music.playTone(165, 300)
}

function matarNPC(n: Sprite) {
    crearEfectoMuerte(n.x, n.y)
    textoFlotante(n.x, n.y - 14, "" + n.data["nombre"] + " HA CAIDO", 2)
    n.destroy()
}

function terminarRaid(exito: boolean, motivo: string) {
    raidActiva = false
    let clave = claveCiudad(raidCx, raidCy)
    for (let e of sprites.allOfKind(SpriteKind.Enemy)) e.data["raider"] = false
    if (exito) {
        let c = ciudadPorClave(raidCx, raidCy)
        let vivos = c ? npcsDeCiudad(c).length : 1
        let oro = 30 + 20 * vivos
        cantidadMonedas += oro
        monedasPartida += oro
        puntosPuntuacion += 300
        bombas += 2
        if (ciudadesAliadas.indexOf(clave) < 0) ciudadesAliadas.push(clave)
        ganarMaterial(3, 2, jugadorSprite.x, jugadorSprite.y - 12)
        ganarMaterial(4, 2, jugadorSprite.x, jugadorSprite.y - 20)
        ganarMaterial(0, 3, jugadorSprite.x, jugadorSprite.y - 28)
        mostrarBanner("CIUDAD SALVADA!", "+" + oro + " ORO +2 BOMBAS", 5)
        if (c) {
            mostrarToast(c.nombre, "AHORA ES ALIADA", 5)
            iniciarRegaloNPC(c)
        }
        music.setVolume(Math.map(volumenAudio, 0, 100, 0, 150))
        music.playTone(784, 120)
        music.playTone(988, 200)
    } else {
        ciudadesArrasadas.push(clave)
        mostrarBanner("CIUDAD ARRASADA", motivo, 2)
        music.setVolume(Math.map(volumenAudio, 0, 100, 0, 150))
        music.playTone(147, 400)
    }
}

function actualizarRaid(ahora: number) {
    let dt = ahora - ultimoRaidTick
    ultimoRaidTick = ahora
    if (dt > 100 || dt < 0) dt = 0

    if (!raidActiva) {
        let c = ciudadEn(jugadorSprite.x, jugadorSprite.y)
        if (c && ciudadesRaid.indexOf(claveCiudad(c.cx, c.cy)) < 0 && npcsDeCiudad(c).length > 0) {
            tiempoEnCiudadMs += dt
            if (tiempoEnCiudadMs >= RAID_AVISO_MS && !raidAvisado) {
                raidAvisado = true
                mostrarToast("SE OYEN RUIDOS...", "ALGO SE ACERCA", 2)
            }
            if (tiempoEnCiudadMs >= RAID_TIEMPO_MS) {
                tiempoEnCiudadMs = 0
                raidAvisado = false
                iniciarRaid(c)
            }
        } else {
            tiempoEnCiudadMs = Math.max(0, tiempoEnCiudadMs - dt)
            if (tiempoEnCiudadMs < RAID_AVISO_MS) raidAvisado = false
        }
        return
    }

    let ciudad = ciudadPorClave(raidCx, raidCy)
    if (!ciudad) {
        terminarRaid(false, "LA ABANDONASTE")
        return
    }
    let gente = npcsDeCiudad(ciudad)
    let enemigosRaid = sprites.allOfKind(SpriteKind.Enemy)
    for (let n of gente) {
        if (ahora < ((n.data["cd"] as number) || 0)) continue
        for (let e of enemigosRaid) {
            let dx = e.x - n.x
            let dy = e.y - n.y
            if (dx * dx + dy * dy < 14 * 14) {
                n.data["cd"] = ahora + 450
                n.data["hp"] = (n.data["hp"] as number) - 12
                textoFlotante(n.x, n.y - 10, "-12", 2)
                if ((n.data["hp"] as number) <= 0) matarNPC(n)
                break
            }
        }
    }
    let vivos = npcsDeCiudad(ciudad).length
    let raiders = 0
    for (let e of enemigosRaid) {
        if (e.data["raider"] && !e.data["muerto"]) raiders++
    }
    if (vivos == 0) terminarRaid(false, "NADIE SOBREVIVIO")
    else if (raiders == 0) terminarRaid(true, "")
}

// ---------------------------------------------------------
// Recursos: recoger materiales
// ---------------------------------------------------------

function ganarMaterial(m: number, n: number, x: number, y: number) {
    // DEMO: los materiales no existen (el crafteo es del juego completo)
}

function golpearRecurso(r: Sprite, golpes: number) {
    if (r.data["muerto"]) return
    let hp = (r.data["hp"] as number) - golpes
    r.data["hp"] = hp
    let rt = r.data["rt"] as number
    music.setVolume(Math.map(volumenAudio, 0, 100, 0, 70))
    music.playTone(esRecolectable(rt) ? 700 : 240, 25)
    if (hp > 0) {
        r.x += (hp % 2 == 0) ? 1 : -1
        return
    }
    r.data["muerto"] = true
    let x = r.x
    let y = r.y
    crearEfectoMuerte(x, y)
    if (rt == 0) {
        ganarMaterial(0, Math.randomRange(2, 3), x, y - 6)
        if (Math.randomRange(1, 100) <= 30) ganarMaterial(2, 1, x, y - 14)
    } else if (rt == 1) {
        ganarMaterial(2, Math.randomRange(1, 2), x, y - 6)
        if (Math.randomRange(1, 100) <= 20) ganarMaterial(0, 1, x, y - 14)
    } else if (rt == 2) {
        ganarMaterial(1, Math.randomRange(2, 3), x, y - 6)
    } else if (rt == 4) {
        ganarMaterial(5, Math.randomRange(2, 3), x, y - 6)
        if (Math.randomRange(1, 100) <= 25) ganarMaterial(2, 1, x, y - 14)
    } else if (rt == 5) {
        ganarMaterial(6, Math.randomRange(1, 2), x, y - 6)
        if (Math.randomRange(1, 100) <= 35) ganarMaterial(1, 1, x, y - 14)
    } else if (rt == 6) {
        ganarMaterial(7, Math.randomRange(1, 2), x, y - 6)
        if (Math.randomRange(1, 100) <= 20) ganarMaterial(2, 1, x, y - 14)
    } else {
        ganarMaterial(3, Math.randomRange(1, 2), x, y - 6)
        ganarMaterial(1, 1, x, y - 14)
    }
    r.destroy()
}

// Botin de materiales al matar enemigos
function soltarMateriales(tipo: number, esJefe: boolean, x: number, y: number) {
    if (esJefe) {
        ganarMaterial(3, 3, x, y - 6)
        ganarMaterial(4, 3, x, y - 14)
        ganarMaterial(0, 3, x, y - 22)
        return
    }
    if (tipo == 5) {
        ganarMaterial(4, Math.randomRange(1, 2), x, y - 6)
        return
    }
    if (Math.randomRange(1, 100) <= 7) ganarMaterial(4, 1, x, y - 6)
    let probHierro = (tipo == 1) ? 18 : 4
    if (Math.randomRange(1, 100) <= probHierro) ganarMaterial(3, 1, x, y - 14)
}

// Los arbustos se recogen al pasar por encima
sprites.onOverlap(SpriteKind.Player, SpriteKind.Recurso, function (jugador, r) {
    // DEMO: arbustos y hongos son solo decoracion
    return
})

// Arboles y rocas: se rompen a balazos (la bala los atraviesa)
sprites.onOverlap(SpriteKind.ProyectilJugador, SpriteKind.Recurso, function (bala, r) {
    // DEMO: arboles, rocas y cactus son solo decoracion
    return
})

// ---------------------------------------------------------
// Armas y bombas
// ---------------------------------------------------------

function cadenciaArma(): number {
    return Math.floor(cadenciaDisparoMs * MULT_CAD[armaEquipada])
}

function buscarObjetivo(): Sprite {
    let ahora = game.runtime()
    let camX = scene.cameraProperty(CameraProperty.X) - 80
    let camY = scene.cameraProperty(CameraProperty.Y) - 60
    // Mientras el objetivo siga vivo y en pantalla se reutiliza (evita recorrer todos los enemigos en cada disparo)
    if (objetivoCache && ahora < proxBusqueda && !objetivoCache.data["muerto"]) {
        let ox = objetivoCache.x - camX
        let oy = objetivoCache.y - camY
        if (ox >= -10 && ox <= 170 && oy >= -10 && oy <= 130) return objetivoCache
    }
    let objetivo: Sprite = null
    let menor = 9999999
    for (let bicho of sprites.allOfKind(SpriteKind.Enemy)) {
        if (bicho.data["muerto"]) continue
        let scrX = bicho.x - camX
        let scrY = bicho.y - camY
        if (scrX >= 0 && scrX <= 160 && scrY >= 0 && scrY <= 120) {
            let dx = bicho.x - jugadorSprite.x
            let dy = bicho.y - jugadorSprite.y
            let d2 = dx * dx + dy * dy
            if (d2 < menor) {
                menor = d2
                objetivo = bicho
            }
        }
    }
    for (let jefe of sprites.allOfKind(SpriteKind.JefeEnemigo)) {
        if (jefe.data["muerto"]) continue
        let scrX = jefe.x - camX
        let scrY = jefe.y - camY
        if (scrX >= -10 && scrX <= 170 && scrY >= -10 && scrY <= 130) {
            let dx = jefe.x - jugadorSprite.x
            let dy = jefe.y - jugadorSprite.y
            let d2 = dx * dx + dy * dy
            if (d2 < menor) {
                menor = d2
                objetivo = jefe
            }
        }
    }
    objetivoCache = objetivo
    proxBusqueda = ahora + 110
    return objetivo
}

// Cuenta de balas vivas (limite para que nunca se llene la pantalla de sprites)
sprites.onDestroyed(SpriteKind.ProyectilJugador, function (bala) {
    balasVivas = Math.max(0, balasVivas - 1)
})

// Lista de objetivos ya golpeados por una bala que perfora (se crea solo cuando hace falta)
function yaGolpeada(bala: Sprite, id: number): boolean {
    let hits: number[] = bala.data["hits"]
    if (!hits) {
        hits = []
        bala.data["hits"] = hits
    }
    if (hits.indexOf(id) >= 0) return true
    hits.push(id)
    return false
}

function crearBala(imagen: Image, ang: number, vel: number, vida: number, perf: number, mult: number) {
    if (balasVivas >= 90) return
    balasVivas++
    let bala = sprites.create(imagen, SpriteKind.ProyectilJugador)
    bala.setPosition(jugadorSprite.x, jugadorSprite.y)
    bala.z = 2
    bala.vx = Math.cos(ang) * vel
    bala.vy = Math.sin(ang) * vel
    bala.lifespan = vida
    bala.setFlag(SpriteFlag.AutoDestroy, true)
    bala.data["perf"] = perf
    bala.data["mult"] = mult
}

function crearSlash(x: number, y: number, ang: number, radio: number, cosMin: number) {
    let tam = radio * 2 + 6
    let completo = cosMin <= -0.99
    let im: Image = null
    if (completo && slashHacha && slashHacha.width == tam) {
        im = slashHacha
    } else {
        let c = Math.floor(tam / 2)
        im = image.create(tam, tam)
        let semi = completo ? Math.PI : Math.acos(Math.max(-1, Math.min(1, cosMin)))
        for (let a = ang - semi; a <= ang + semi; a += 0.1) {
            im.fillRect(c + Math.round(Math.cos(a) * (radio - 1)), c + Math.round(Math.sin(a) * (radio - 1)), 2, 2, 1)
            im.setPixel(c + Math.round(Math.cos(a) * (radio - 4)), c + Math.round(Math.sin(a) * (radio - 4)), 9)
        }
        if (completo) slashHacha = im
    }
    let s = sprites.create(im, SpriteKind.Food)
    s.setPosition(x, y)
    s.z = 3
    s.setFlag(SpriteFlag.Ghost, true)
    s.lifespan = 110
}

function golpeCuerpo(s: Sprite, radio: number, ux: number, uy: number, cosMin: number, mult: number) {
    let dx = s.x - jugadorSprite.x
    let dy = s.y - jugadorSprite.y
    let d2 = dx * dx + dy * dy
    if (d2 > radio * radio) return
    let d = Math.max(1, Math.sqrt(d2))
    if ((dx * ux + dy * uy) / d < cosMin) return
    let esJefe = s.kind() == SpriteKind.JefeEnemigo
    procesarDanoAEnemigo(s, danoAtaque * mult, true)
    if (s.data["muerto"]) return
    if (nivelHielo > 0) s.data["lentoHasta"] = game.runtime() + 1000 + 300 * nivelHielo
    if (!esJefe) {
        s.x += dx / d * 8
        s.y += dy / d * 8
    }
}

function ataqueCuerpo(ang: number, radio: number, cosMin: number, mult: number) {
    crearSlash(jugadorSprite.x, jugadorSprite.y, ang, radio, cosMin)
    let ux = Math.cos(ang)
    let uy = Math.sin(ang)
    for (let b of sprites.allOfKind(SpriteKind.Enemy)) golpeCuerpo(b, radio, ux, uy, cosMin, mult)
    for (let j of sprites.allOfKind(SpriteKind.JefeEnemigo)) golpeCuerpo(j, radio + 8, ux, uy, cosMin, mult)
    for (let r of sprites.allOfKind(SpriteKind.Recurso)) {
        if (esRecolectable(r.data["rt"] as number)) continue
        let dx = r.x - jugadorSprite.x
        let dy = r.y - jugadorSprite.y
        if (dx * dx + dy * dy <= (radio + 6) * (radio + 6)) golpearRecurso(r, 2)
    }
}

// Objetivo para armas cuerpo a cuerpo: enemigo, jefe o recurso DENTRO del alcance
function objetivoCuerpo(alcance: number): Sprite {
    let mejor: Sprite = null
    let md = 99999999
    for (let b of sprites.allOfKind(SpriteKind.Enemy)) {
        if (b.data["muerto"]) continue
        let dx = b.x - jugadorSprite.x
        let dy = b.y - jugadorSprite.y
        let d2 = dx * dx + dy * dy
        if (d2 <= alcance * alcance && d2 < md) {
            md = d2
            mejor = b
        }
    }
    for (let j of sprites.allOfKind(SpriteKind.JefeEnemigo)) {
        if (j.data["muerto"]) continue
        let dx = j.x - jugadorSprite.x
        let dy = j.y - jugadorSprite.y
        let d2 = dx * dx + dy * dy
        if (d2 <= (alcance + 8) * (alcance + 8) && d2 < md) {
            md = d2
            mejor = j
        }
    }
    if (mejor) return mejor
    for (let r of sprites.allOfKind(SpriteKind.Recurso)) {
        if (r.data["muerto"]) continue
        if (esRecolectable(r.data["rt"] as number)) continue
        let dx = r.x - jugadorSprite.x
        let dy = r.y - jugadorSprite.y
        let d2 = dx * dx + dy * dy
        if (d2 <= (alcance + 6) * (alcance + 6) && d2 < md) {
            md = d2
            mejor = r
        }
    }
    return mejor
}

function ejecutarDisparoManual() {
    let tiempoAhora = game.runtime()
    if (!jugadorSprite || tiempoAhora - ultimoDisparoMs < cadenciaArma()) return

    let arma = armaEquipada
    let objetivo: Sprite = null
    if (ARMA_ALCANCE[arma] > 0) {
        // Cuerpo a cuerpo: no dispara nada, solo golpea si hay algo cerca
        if (tiempoAhora < proxEscaneoCuerpo) return
        objetivo = objetivoCuerpo(ARMA_ALCANCE[arma])
        if (!objetivo) {
            proxEscaneoCuerpo = tiempoAhora + 70
            return
        }
    }
    ultimoDisparoMs = tiempoAhora

    if (jugadorSprite.vx != 0 || jugadorSprite.vy != 0) {
        ultimaDirX = jugadorSprite.vx > 0 ? 1 : (jugadorSprite.vx < 0 ? -1 : 0)
        ultimaDirY = jugadorSprite.vy > 0 ? 1 : (jugadorSprite.vy < 0 ? -1 : 0)
    }
    if (!objetivo) objetivo = buscarObjetivo()
    let ang = 0
    if (objetivo) {
        ang = Math.atan2(objetivo.y - jugadorSprite.y, objetivo.x - jugadorSprite.x)
    } else {
        if (ultimaDirX == 0 && ultimaDirY == 0) ultimaDirX = 1
        ang = Math.atan2(ultimaDirY, ultimaDirX)
    }

    if (tiempoAhora - ultimoSonidoDisparo >= 90) {
        ultimoSonidoDisparo = tiempoAhora
        music.setVolume(Math.map(volumenAudio, 0, 100, 0, 80))
        music.playTone(SONIDO_ARMA[arma], arma == 3 ? 50 : 25)
    }

    if (arma == 1) {
        ataqueCuerpo(ang, 36, 0.2, 2.2)
    } else if (arma == 4) {
        ataqueCuerpo(ang, 32, -1, 3.4)
    } else if (arma == 2) {
        for (let i = 0; i < numProyectiles; i++) {
            let a = ang + (i - (numProyectiles - 1) / 2) * 0.2
            crearBala(imgBalaArco, a, velProyectil * 1.3, 1800, perforacion + 2, 1.6)
        }
    } else if (arma == 3) {
        let n = 4 + numProyectiles
        for (let i = 0; i < n; i++) {
            let a = ang + (i - (n - 1) / 2) * 0.17 + Math.randomRange(-10, 10) * 0.01
            crearBala(imgPerdigon, a, velProyectil * 0.9, 420, perforacion, 0.7)
        }
    } else {
        for (let i = 0; i < numProyectiles; i++) {
            let a = ang
            if (numProyectiles > 1) a += (i - (numProyectiles - 1) / 2) * 0.25
            crearBala(imgBala, a, velProyectil, 1400, perforacion, 1)
        }
    }
}

function accionBotonB() {
    if (modoB == 1 || nivelHabilidadDash <= 0) lanzarBomba()
    else usarDash()
}

function lanzarBomba() {
    if (!jugadorSprite) return
    let ahora = game.runtime()
    if (ahora < proxBomba) return
    if (bombas <= 0) {
        proxBomba = ahora + 400
        textoFlotante(jugadorSprite.x, jugadorSprite.y - 12, "SIN BOMBAS", 2)
        sonarCancelar()
        return
    }
    bombas--
    proxBomba = ahora + 500
    let objetivo = buscarObjetivo()
    let ang = 0
    let dist = 55
    if (objetivo) {
        let dx = objetivo.x - jugadorSprite.x
        let dy = objetivo.y - jugadorSprite.y
        ang = Math.atan2(dy, dx)
        dist = Math.min(110, Math.sqrt(dx * dx + dy * dy))
    } else {
        if (ultimaDirX == 0 && ultimaDirY == 0) ultimaDirX = 1
        ang = Math.atan2(ultimaDirY, ultimaDirX)
    }
    let b = sprites.create(FRAMES_BOMBA[0], SpriteKind.Bomba)
    animation.runImageAnimation(b, FRAMES_BOMBA, 120, true)
    b.setPosition(jugadorSprite.x, jugadorSprite.y)
    b.z = 2
    b.vx = Math.cos(ang) * dist / 0.45
    b.vy = Math.sin(ang) * dist / 0.45
    b.data["fin"] = ahora + 450
    music.setVolume(Math.map(volumenAudio, 0, 100, 0, 90))
    music.playTone(400, 40)
}

function explotarBomba(b: Sprite) {
    let x = b.x
    let y = b.y
    b.destroy()
    let R = 46
    crearAnillo(x, y, R, 4, 260)
    crearEfectoMuerte(x, y)
    scene.cameraShake(4, 250)
    music.setVolume(Math.map(volumenAudio, 0, 100, 0, 130))
    music.playTone(150, 160)
    for (let e of sprites.allOfKind(SpriteKind.Enemy)) {
        let dx = e.x - x
        let dy = e.y - y
        if (dx * dx + dy * dy <= R * R) procesarDanoAEnemigo(e, danoAtaque * 4 + 20, true)
    }
    for (let j of sprites.allOfKind(SpriteKind.JefeEnemigo)) {
        let dx = j.x - x
        let dy = j.y - y
        if (dx * dx + dy * dy <= (R + 10) * (R + 10)) procesarDanoAEnemigo(j, danoAtaque * 3, true)
    }
    for (let r of sprites.allOfKind(SpriteKind.Recurso)) {
        let dx = r.x - x
        let dy = r.y - y
        if (dx * dx + dy * dy <= R * R) golpearRecurso(r, 3)
    }
}

function actualizarBombas(ahora: number) {
    for (let b of sprites.allOfKind(SpriteKind.Bomba)) {
        if (ahora >= (b.data["fin"] as number)) explotarBomba(b)
    }
}

// ---------------------------------------------------------
// Inventario (boton MENU)
// ---------------------------------------------------------

function abrirInventario() {
    estadoActual = EstadoJuego.Inventario
    invSel = armaEquipada
    mensajeTiendaHasta = 0
    congelarEscena()
    sonarConfirmar()
}

function cerrarInventario() {
    sonarCancelar()
    reanudarJuego()
}

function usarFilaInventario() {
    let i = invSel
    if (i < 5) {
        if (tengoArma[i]) {
            armaEquipada = i
            sonarConfirmar()
            avisoTienda("EQUIPADA: " + ARMA_NOMBRE[i], 7)
        } else {
            sonarCancelar()
            avisoTienda("SOLO EN EL JUEGO COMPLETO", 2)
        }
    } else if (i == 5) {
        modoB = 1
        sonarConfirmar()
        avisoTienda("B LANZA BOMBAS", 7)
    } else if (i == 6) {
        if (nivelHabilidadDash > 0) {
            modoB = 0
            sonarConfirmar()
            avisoTienda("B HACE DASH", 7)
        } else {
            sonarCancelar()
            avisoTienda("DASH BLOQUEADO", 2)
        }
    } else {
        if (vendas <= 0) {
            sonarCancelar()
            avisoTienda("NO TIENES VENDAS", 2)
        } else if (vidaActual >= vidaMaxima) {
            sonarCancelar()
            avisoTienda("VIDA YA LLENA", 4)
        } else {
            vendas--
            vidaActual = Math.min(vidaMaxima, vidaActual + 40)
            sonarConfirmar()
            avisoTienda("+40 DE VIDA", 7)
        }
    }
}

function dibujarInventario(t: number) {
    let ahora = game.runtime()
    screen.fillRect(0, 0, 160, 120, 15)
    screen.fillRect(0, 0, 160, 16, 8)
    screen.drawLine(0, 16, 159, 16, 5)
    screen.print("INVENTARIO", 6, 4, 5, image.font8)
    screen.print("LV" + nivelJugador, 134, 6, 9, image.font5)

    screen.fillRect(2, 19, 104, 82, 12)
    screen.drawRect(2, 19, 104, 82, 8)
    for (let j = 0; j < INV_FILAS; j++) {
        let y = 22 + j * 10
        let sel = j == invSel
        let nombre = ""
        let estado = ""
        let colN = 1
        let colE = 13
        if (j < 5) {
            nombre = ARMA_NOMBRE[j]
            if (!tengoArma[j]) {
                colN = 13
                estado = "---"
            } else if (armaEquipada == j) {
                estado = "EQUIP."
                colE = 7
            }
        } else if (j == 5) {
            nombre = "BOMBAS x" + bombas
            if (modoB == 1) {
                estado = "[B]"
                colE = 5
            }
        } else if (j == 6) {
            nombre = "DASH"
            if (nivelHabilidadDash <= 0) {
                colN = 13
                estado = "---"
            } else if (modoB == 0) {
                estado = "[B]"
                colE = 5
            }
        } else {
            nombre = "VENDA x" + vendas
        }
        if (sel) {
            screen.fillRect(4, y - 1, 100, 10, 8)
            screen.drawRect(4, y - 1, 100, 10, 5)
        }
        screen.drawTransparentImage(ICONOS_INV[j], 6, y)
        screen.print(nombre, 17, y + 2, colN, image.font5)
        screen.print(estado, 102 - estado.length * 6, y + 2, colE, image.font5)
    }

    // Materiales
    screen.fillRect(108, 19, 50, 82, 12)
    screen.drawRect(108, 19, 50, 82, 8)
    screen.print("CRAFTEO", 112, 26, 9, image.font5)
    screen.print("Y ARMAS:", 112, 34, 9, image.font5)
    screen.print("SOLO EN EL", 112, 52, 1, image.font5)
    screen.print("JUEGO", 112, 60, 1, image.font5)
    screen.print("COMPLETO", 112, 68, 1, image.font5)

    screen.fillRect(0, 103, 160, 17, 15)
    screen.drawLine(0, 103, 159, 103, 5)
    if (ahora < mensajeTiendaHasta) {
        imprimirAviso(108, 0)
    } else {
        screen.print(INV_DESC[invSel], 4, 106, 1, image.font5)
        let accionB = (modoB == 1 || nivelHabilidadDash <= 0) ? "BOMBA" : "DASH"
        screen.print("BOTON B: " + accionB + "   MENU: CERRAR", 4, 113, 9, image.font5)
    }
}

// ---------------------------------------------------------
// Casas, descanso y crafteo
// ---------------------------------------------------------

function entrarCasa(npc: Sprite) {
    casaNombre = npc.data["nombre"] as string
    casaRol = (npc.data["rol"] as number) || 0
    casaFrase = ROL_FRASE[casaRol]
    casaAliada = ciudadAliada(ciudadEn(npc.x, npc.y))
    prepararOpcionesCasa()
    retratoNPC = npc.image.doubled()
    casaSel = 0
    descansoHasta = 0
    mensajeTiendaHasta = 0
    congelarEscena()
    estadoActual = EstadoJuego.DentroCasa
    sonarConfirmar()
}

function salirDeCasa() {
    sonarCancelar()
    reanudarJuego()
}

function ciudadAliada(c: Ciudad): boolean {
    if (!c) return false
    return ciudadesAliadas.indexOf(claveCiudad(c.cx, c.cy)) >= 0
}

// Acciones: 0 dormir, 1 craftear, 4 salir
function precioCasa(accion: number): number {
    return casaAliada ? 0 : PRECIO_DESCANSO
}

function prepararOpcionesCasa() {
    casaAcc = [0, 1, 4]
    casaOpc = ["DORMIR " + precioCasa(0) + "$", "CRAFTEAR", "SALIR"]
}

function accionCasa() {
    let ahora = game.runtime()
    if (ahora < descansoHasta) return
    let acc = casaAcc[casaSel]
    if (acc == 0) {
        if (vidaActual >= vidaMaxima) {
            sonarCancelar()
            avisoTienda("VIDA YA LLENA", 4)
        } else if (cantidadMonedas < precioCasa(0)) {
            sonarCancelar()
            avisoTienda("SIN ORO", 2)
        } else {
            cantidadMonedas -= precioCasa(0)
            vidaActual = vidaMaxima
            descansoHasta = ahora + 1500
            music.setVolume(Math.map(volumenAudio, 0, 100, 0, 120))
            music.playTone(392, 200)
            music.playTone(523, 300)
            avisoTienda("VIDA MAXIMA!", 7)
            mensajeTiendaHasta = descansoHasta + 1300
        }
    } else if (acc == 1) {
        // DEMO: el crafteo solo existe en el juego completo
        sonarCancelar()
        avisoTienda("SOLO EN EL\nJUEGO\nCOMPLETO", 2)
    } else {
        salirDeCasa()
    }
}

// DEMO: escopeta (2), hacha (3) y mejoras de bioma (6+) solo en el juego completo
function recetaBloqueada(r: number): boolean {
    return true
}

function puedeCraftear(r: number): boolean {
    if (recetaBloqueada(r)) return false
    for (let i = 0; i < NUM_MATS; i++) {
        if (mats[i] < REC_COSTE[r][i]) return false
    }
    return true
}

function craftear(r: number) {
    if (recetaBloqueada(r)) {
        sonarCancelar()
        avisoTienda("SOLO EN EL JUEGO COMPLETO", 2)
        return
    }
    if (r < 4 && tengoArma[r + 1]) {
        sonarCancelar()
        avisoTienda("YA LA TIENES", 4)
        return
    }
    if (r == 4 && bombas >= 30) {
        sonarCancelar()
        avisoTienda("MAXIMO 30 BOMBAS", 4)
        return
    }
    if (r == 5 && vendas >= 9) {
        sonarCancelar()
        avisoTienda("MAXIMO 9 VENDAS", 4)
        return
    }
    if (r >= 6 && mejorasCraft[r - 6] >= MEJORA_MAX) {
        sonarCancelar()
        avisoTienda("YA AL MAXIMO", 4)
        return
    }
    for (let i = 0; i < NUM_MATS; i++) {
        if (mats[i] < REC_COSTE[r][i]) {
            sonarCancelar()
            avisoTienda("FALTA " + MAT_NOMBRE[i], 2)
            return
        }
    }
    for (let i = 0; i < NUM_MATS; i++) mats[i] -= REC_COSTE[r][i]
    if (r < 4) {
        tengoArma[r + 1] = true
        armaEquipada = r + 1
        avisoTienda("CREADA: " + ARMA_NOMBRE[r + 1], 7)
    } else if (r == 4) {
        bombas += 2
        avisoTienda("+2 BOMBAS", 7)
    } else if (r == 5) {
        vendas += 1
        avisoTienda("+1 VENDA", 7)
    } else {
        aplicarMejoraCraft(r - 6)
    }
    sonarConfirmar()
    music.playTone(784, 80)
}

// Mejoras permanentes de los materiales de bioma (la velocidad se aplica al volver al juego)
function aplicarMejoraCraft(k: number) {
    mejorasCraft[k] += 1
    if (k == 0) {
        armaduraReduccion += 2
        avisoTienda("ARMADURA +2", 7)
    } else if (k == 1) {
        velMovimiento += 12
        avisoTienda("VELOCIDAD +12", 7)
    } else if (k == 2) {
        probabilidadCritico = Math.min(80, probabilidadCritico + 8)
        avisoTienda("CRITICO +8%", 7)
    } else if (k == 3) {
        nivelHielo += 1
        avisoTienda("HIELO NIVEL " + nivelHielo, 7)
    } else {
        vidaMaxima += 15
        vidaActual += 15
        avisoTienda("VIDA MAX +15", 7)
    }
}

function dibujarCasa(t: number) {
    let ahora = game.runtime()
    // Pared
    screen.fillRect(0, 0, 160, 44, 13)
    for (let x = 8; x < 160; x += 16) screen.fillRect(x, 0, 1, 44, 14)
    screen.fillRect(0, 44, 160, 3, 14)
    screen.drawLine(0, 47, 159, 47, 15)
    // Suelo de tablones
    screen.fillRect(0, 48, 160, 72, 4)
    for (let r = 0; r < 8; r++) {
        let y = 48 + r * 9
        screen.fillRect(0, y, 160, 1, 14)
        screen.fillRect((r * 47 + 20) % 150, y, 1, 9, 14)
    }
    // Ventana con cortinas
    screen.fillRect(14, 8, 30, 24, 14)
    screen.fillRect(16, 10, 26, 20, 9)
    screen.fillRect(28, 10, 2, 20, 14)
    screen.fillRect(16, 19, 26, 2, 14)
    screen.fillRect(18, 12, 4, 1, 1)
    screen.fillRect(10, 6, 4, 28, 2)
    screen.fillRect(44, 6, 4, 28, 2)
    // Cama
    screen.fillRect(102, 14, 52, 31, 15)
    screen.fillRect(103, 15, 50, 29, 14)
    screen.fillRect(105, 17, 46, 25, 1)
    screen.fillRect(105, 28, 46, 14, 2)
    screen.fillRect(107, 19, 14, 8, 9)
    // Mesa con vela
    screen.fillRect(8, 56, 28, 4, 13)
    screen.fillRect(8, 60, 28, 1, 15)
    screen.fillRect(10, 61, 3, 12, 14)
    screen.fillRect(31, 61, 3, 12, 14)
    screen.fillRect(20, 49, 3, 7, 1)
    screen.fillRect(21, 46, 1, 3, (Math.floor(t) % 2 == 0) ? 5 : 4)
    // Alfombra y vecino
    screen.fillRect(50, 62, 60, 21, 5)
    screen.fillRect(52, 64, 56, 17, 2)
    screen.drawTransparentImage(retratoNPC, 64, 50 + Math.floor(Math.sin(t) * 1))

    screen.print("ORO " + cantidadMonedas, 2, 0, 5, image.font5)

    // Panel inferior
    screen.fillRect(0, 84, 160, 36, 15)
    screen.drawLine(0, 84, 159, 84, 5)
    for (let i = 0; i < casaOpc.length; i++) {
        let y = 89 + i * 10
        if (i == casaSel) {
            screen.fillRect(3, y - 2, 70, 10, 8)
            screen.drawRect(3, y - 2, 70, 10, 5)
            screen.print(">", 5, y, 5, image.font5)
            screen.print(casaOpc[i], 11, y, 5, image.font5)
        } else {
            screen.print(casaOpc[i], 11, y, 1, image.font5)
        }
    }
    screen.drawLine(76, 88, 76, 116, 8)
    if (ahora < mensajeTiendaHasta) {
        dibujarLineas(mensajeTienda, 80, 92, mensajeTiendaColor, 8)
    } else {
        screen.print(casaNombre, 80, 87, 9, image.font5)
        screen.print(ROL_NOMBRE[casaRol] + (casaAliada ? "*" : ""), 80, 94, casaAliada ? 7 : 5, image.font5)
        dibujarLineas(casaFrase, 80, 103, 1, 7)
    }

    // Dormir
    if (ahora < descansoHasta) {
        for (let y = 0; y < 120; y += 2) screen.drawLine(0, y, 159, y, 15)
        screen.printCenter("Z z z . . .", 50, 9, image.font8)
        screen.printCenter("DESCANSANDO", 66, 1, image.font5)
    }
}

function dibujarCrafteo(t: number) {
    let ahora = game.runtime()
    screen.fillRect(0, 0, 160, 120, 15)
    screen.fillRect(0, 0, 160, 16, 14)
    screen.drawLine(0, 16, 159, 16, 5)
    screen.print("CRAFTEO", 6, 4, 5, image.font8)
    screen.drawTransparentImage(imgIconoCasa, 146, 4)

    screen.fillRect(2, 19, 104, 82, 12)
    screen.drawRect(2, 19, 104, 82, 8)
    screen.print((craftSel + 1) + "/" + REC_NOMBRE.length, 112, 6, 9, image.font5)
    let top = Math.max(0, Math.min(REC_NOMBRE.length - 6, craftSel - 2))
    for (let jj = 0; jj < 6; jj++) {
        let j = top + jj
        let y = 23 + jj * 13
        let sel = j == craftSel
        let nivelMejora = (j >= 6) ? mejorasCraft[j - 6] : 0
        let ya = (j < 4 && tengoArma[j + 1]) || (j >= 6 && nivelMejora >= MEJORA_MAX)
        let ok = puedeCraftear(j)
        if (sel) {
            screen.fillRect(4, y - 2, 100, 12, 8)
            screen.drawRect(4, y - 2, 100, 12, 5)
        }
        screen.drawTransparentImage(ICONOS_REC[j], 6, y - 1)
        screen.print(REC_NOMBRE[j], 17, y + 1, (ok || ya) ? 1 : 13, image.font5)
        let est = recetaBloqueada(j) ? "DEMO" : (ya ? ((j >= 6) ? "MAX" : "TIENES") : (ok ? "LISTO" : ""))
        if (est == "" && nivelMejora > 0) est = nivelMejora + "/" + MEJORA_MAX
        screen.print(est, 102 - est.length * 6, y + 1, recetaBloqueada(j) ? 2 : (ya ? 13 : (ok ? 7 : 5)), image.font5)
    }

    screen.fillRect(108, 19, 50, 82, 12)
    screen.drawRect(108, 19, 50, 82, 8)
    screen.print("COSTE", 110, 22, 9, image.font5)
    for (let k = 0; k < NUM_MATS; k++) {
        let need = REC_COSTE[craftSel][k]
        let col = 13
        if (need > 0) col = (mats[k] >= need) ? 7 : 2
        let txt = MAT_ABR[k] + " " + mats[k]
        if (need > 0) txt += "/" + need
        screen.print(txt, 110, 32 + k * 8, col, image.font5)
    }

    screen.fillRect(0, 103, 160, 17, 15)
    screen.drawLine(0, 103, 159, 103, 5)
    if (ahora < mensajeTiendaHasta) {
        imprimirAviso(108, 0)
    } else {
        screen.print(REC_DESC[craftSel], 4, 106, 1, image.font5)
        screen.print("A: CREAR    B: VOLVER", 4, 113, 9, image.font5)
    }
}

// ---------------------------------------------------------
// HUD extra: flecha a la ciudad, aviso de entrada y arma
// ---------------------------------------------------------

function dibujarExtrasMundo(t: number, camX: number, camY: number) {
    // Flecha hacia la ciudad mas cercana
    if (hayCiudadCerca) {
        let sx = ciudadCercanaX - camX
        let sy = ciudadCercanaY - camY
        if (sx < 0 || sx > 160 || sy < 16 || sy > 118) {
            let dxI = sx - 80
            let dyI = sy - 68
            let ang = Math.atan2(dyI, dxI)
            let escX = (Math.abs(dxI) > 0) ? 66 / Math.abs(dxI) : 9999
            let escY = (Math.abs(dyI) > 0) ? 36 / Math.abs(dyI) : 9999
            let esc = Math.min(escX, escY)
            let ix = Math.floor(80 + dxI * esc)
            let iy = Math.floor(68 + dyI * esc)
            screen.fillCircle(ix, iy, 7, 15)
            screen.drawCircle(ix, iy, 7, 9)
            screen.drawTransparentImage(imgIconoCasa, ix - 4, iy - 4)
            screen.fillCircle(Math.floor(ix + Math.cos(ang) * 11), Math.floor(iy + Math.sin(ang) * 11), 2, 9)
            let txD = Math.floor(ciudadCercanaDist / 10) + "M"
            let tx = Math.max(1, Math.min(159 - txD.length * 6, ix - Math.floor(txD.length * 3)))
            let ty = Math.min(112, iy + 10)
            screen.fillRect(tx - 1, ty - 1, txD.length * 6 + 1, 7, 15)
            screen.print(txD, tx, ty, 9, image.font5)
        }
    }

    // Aviso para entrar en una casa
    if (npcCerca && estadoActual == EstadoJuego.Jugando) {
        let rolN = (npcCerca.data["rol"] as number) || 0
        let txtE = "A:" + ROL_NOMBRE[rolN]
        let wE = txtE.length * 6 + 6
        let px = Math.max(Math.floor(wE / 2) + 1, Math.min(159 - Math.floor(wE / 2), Math.floor(npcCerca.x - camX)))
        let py = Math.max(20, Math.floor(npcCerca.y - camY) - 20)
        screen.fillRect(px - Math.floor(wE / 2), py - 2, wE, 11, 15)
        screen.drawRect(px - Math.floor(wE / 2), py - 2, wE, 11, 9)
        screen.print(txtE, px - Math.floor(wE / 2) + 3, py + 1, 5, image.font5)
    }

    // Redada: barras de vida de los ciudadanos y contador
    if (raidActiva) {
        let vivosN = 0
        for (let n of sprites.allOfKind(SpriteKind.Npc)) {
            let hpN = Math.max(0, (n.data["hp"] as number) / (n.data["hpMax"] as number))
            let bx = Math.floor(n.x - camX) - 7
            let by = Math.floor(n.y - camY) - 12
            screen.fillRect(bx, by, 14, 3, 15)
            screen.fillRect(bx, by, Math.floor(14 * hpN), 3, 7)
            screen.drawRect(bx - 1, by - 1, 16, 5, 1)
            vivosN++
        }
        let raiders = 0
        for (let e of sprites.allOfKind(SpriteKind.Enemy)) {
            if (e.data["raider"]) raiders++
        }
        screen.print("REDADA! GENTE:" + vivosN + " ENEM:" + raiders, 2, 93, (Math.floor(t) % 2 == 0) ? 2 : 5, image.font5)
    }

    // Arma equipada y accion del boton B
    screen.drawTransparentImage(ICONOS_INV[armaEquipada], 99, 100)
    screen.print(ARMA_NOMBRE[armaEquipada], 109, 102, 5, image.font5)
    if (modoB == 1 || nivelHabilidadDash <= 0) {
        screen.print("B:BOMBA " + bombas, 98, 110, bombas > 0 ? 9 : 13, image.font5)
    } else {
        screen.print("B:DASH", 98, 110, 9, image.font5)
    }
}

// =========================================================
// ARRANQUE (siempre al final del archivo)
// =========================================================

cargarProgreso()
inicializarFondoParticulas()
