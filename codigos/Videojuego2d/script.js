"use strict";
 
/* =====================================================================
   CUARZO CLASH - Videojuego de pelea 2D para dos jugadores
   Universidad de Caldas | Programación Web Creativa II | Taller extra 25
   Tecnologías: HTML5, CSS3 y JavaScript puro (Canvas API)
 
   Organización del código:
     1. CONFIG y CONTROLS ....... constantes del juego
     2. CHARACTERS .............. datos de los dos luchadores
     3. Utilidades .............. funciones matemáticas pequeñas
     4. InputManager ............ lectura del teclado
     5. Effects ................. partículas, anillos y textos flotantes
     6. Projectile .............. proyectiles (bolas de fuego)
     7. Fighter ................. clase del luchador (estado y reglas)
     8. Renderer ................ todo el dibujo en el Canvas
     9. Game .................... rondas, combate, HUD y pantallas
    10. Arranque ................ crear el juego
   ===================================================================== */
 
 
/* =====================================================================
   1. CONFIGURACIÓN Y CONTROLES
   ===================================================================== */
 
const CONFIG = Object.freeze({
    WIDTH: 1280,             // resolución interna del canvas
    HEIGHT: 720,
    GROUND_Y: 620,           // altura del piso (donde apoyan los pies)
    ARENA_LEFT: 60,          // límite izquierdo de la arena
    ARENA_RIGHT: 1220,       // límite derecho de la arena
    GRAVITY: 2600,           // píxeles por segundo al cuadrado
    JUMP_SPEED: 1000,        // velocidad inicial del salto (hacia arriba)
    ROUND_TIME: 60,          // segundos por ronda
    ROUNDS_TO_WIN: 2,        // rondas necesarias para ganar el combate
    MAX_ROUNDS: 3,           // máximo de rondas
    FIGHTER_W: 70,           // ancho del cuerpo (caja de daño)
    FIGHTER_H: 150,          // alto del cuerpo
    HURT_TIME: 0.30,         // segundos de aturdimiento al recibir un golpe
    BLOCK_DAMAGE_FACTOR: 0.2,// la defensa deja pasar solo el 20% del daño
    GUARD_MAX: 100,          // resistencia máxima de la guardia
    GUARD_REGEN: 22,         // guardia recuperada por segundo
    GUARD_RECOVER_AT: 35,    // guardia mínima para volver a defender tras romperse
    GUARD_BREAK_STUN: 0.9,   // aturdimiento si se rompe la guardia
    HIT_STOP: 0.06,          // pausa breve al impactar (sensación de golpe)
    INTRO_TIME: 2.4,         // duración de la cuenta inicial de cada ronda
    ROUND_END_TIME: 3.2,     // duración del cartel al terminar la ronda
    DEBUG_HITBOXES: false    // F2 muestra u oculta las cajas de colisión
});
 
const CONTROLS = Object.freeze({
    1: Object.freeze({
        left: "KeyA", right: "KeyD", jump: "KeyW",
        attack: "KeyF", special: "KeyG", block: "KeyH"
    }),
    2: Object.freeze({
        left: "ArrowLeft", right: "ArrowRight", jump: "ArrowUp",
        attack: "KeyK", special: "KeyL", block: "KeyJ"
    })
});
 
// Teclas cuyo comportamiento normal del navegador (scroll, etc.) se bloquea
const BLOCKED_KEYS = new Set(["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Space", "F2"]);
 
 
/* =====================================================================
   2. PERSONAJES
   Cada ataque se describe con datos. Los tiempos están en segundos:
     startup  = preparación (todavía no hace daño)
     active   = ventana en la que el golpe puede dañar
     recovery = recuperación (el luchador queda vulnerable)
   ===================================================================== */
 
const CHARACTERS = {
    ember: {
        id: "ember",
        name: "EMBER",
        title: "La chispa veloz",
        look: "flame",
        colors: { main: "#ff5a36", dark: "#a8251a", accent: "#ffd166", skin: "#f1c27d" },
        altColors: { main: "#b66dff", dark: "#5a2a9a", accent: "#7dffea", skin: "#f1c27d" },
        maxHp: 100,
        speed: 380,
        rating: { velocidad: 92, fuerza: 60, especial: 70, alcance: 55 },
        basic: {
            type: "melee", damage: 7, startup: 0.07, active: 0.10, recovery: 0.18,
            range: 78, height: 54, offsetY: -128, knockback: 260
        },
        special: {
            type: "projectile", damage: 14, startup: 0.24, active: 0.04, recovery: 0.30,
            range: 60, cooldown: 5, knockback: 430, projectileSpeed: 720, projectileLife: 1.2
        }
    },
    tundra: {
        id: "tundra",
        name: "TUNDRA",
        title: "El muro de hielo",
        look: "crystal",
        colors: { main: "#3fc2ff", dark: "#1a5f9a", accent: "#e6fbff", skin: "#d9a066" },
        altColors: { main: "#3be08f", dark: "#146b45", accent: "#fff6b0", skin: "#d9a066" },
        maxHp: 100,
        speed: 315,
        rating: { velocidad: 70, fuerza: 80, especial: 90, alcance: 75 },
        basic: {
            type: "melee", damage: 9, startup: 0.11, active: 0.12, recovery: 0.26,
            range: 92, height: 58, offsetY: -130, knockback: 300
        },
        special: {
            type: "melee", damage: 20, startup: 0.32, active: 0.16, recovery: 0.45,
            range: 165, height: 70, offsetY: -75, cooldown: 6.5, knockback: 520
        }
    }
};
 
 
/* =====================================================================
   3. UTILIDADES
   ===================================================================== */
 
function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}
 
// Colisión entre dos rectángulos {x, y, w, h} (método AABB)
function rectsOverlap(a, b) {
    return a.x < b.x + b.w &&
           a.x + a.w > b.x &&
           a.y < b.y + b.h &&
           a.y + a.h > b.y;
}
 
function roundRectPath(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
}
 
// Generador pseudoaleatorio con semilla: el fondo siempre se dibuja igual
function makeRandom(seed) {
    let s = seed >>> 0;
    return function () {
        s = (s + 0x6D2B79F5) >>> 0;
        let t = s;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}
 
 
/* =====================================================================
   4. ENTRADA DE TECLADO
   - down:    teclas que están sostenidas ahora mismo (movimiento, defensa)
   - pressed: teclas que se acaban de presionar (saltar, atacar)
   Separar ambas evita ataques "permanentes" al mantener una tecla.
   ===================================================================== */
 
class InputManager {
    constructor() {
        this.down = new Set();
        this.pressed = new Set();
 
        window.addEventListener("keydown", (event) => {
            if (BLOCKED_KEYS.has(event.code)) {
                event.preventDefault();
            }
            if (!event.repeat) {
                this.pressed.add(event.code);
            }
            this.down.add(event.code);
        });
 
        window.addEventListener("keyup", (event) => {
            this.down.delete(event.code);
        });
 
        // Si la ventana pierde el foco, se sueltan todas las teclas
        window.addEventListener("blur", () => this.clear());
    }
 
    isDown(code) {
        return this.down.has(code);
    }
 
    // Devuelve true una sola vez por cada pulsación
    consume(code) {
        const wasPressed = this.pressed.has(code);
        this.pressed.delete(code);
        return wasPressed;
    }
 
    endFrame() {
        this.pressed.clear();
    }
 
    clear() {
        this.down.clear();
        this.pressed.clear();
    }
 
    // Convierte las teclas físicas en acciones del jugador
    actionsFor(playerId) {
        const keys = CONTROLS[playerId];
        return {
            left: this.isDown(keys.left),
            right: this.isDown(keys.right),
            block: this.isDown(keys.block),
            jump: this.consume(keys.jump),
            attack: this.consume(keys.attack),
            special: this.consume(keys.special)
        };
    }
}
 
 
/* =====================================================================
   5. EFECTOS VISUALES
   ===================================================================== */
 
class Effects {
    constructor() {
        this.particles = [];
        this.rings = [];
        this.texts = [];
    }
 
    clear() {
        this.particles.length = 0;
        this.rings.length = 0;
        this.texts.length = 0;
    }
 
    burst(x, y, color, count = 14, speed = 420) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const velocity = speed * (0.3 + Math.random() * 0.7);
            this.particles.push({
                x, y,
                vx: Math.cos(angle) * velocity,
                vy: Math.sin(angle) * velocity - 80,
                life: 0,
                max: 0.35 + Math.random() * 0.3,
                size: 3 + Math.random() * 5,
                color
            });
        }
    }
 
    ring(x, y, color, maxRadius = 90) {
        this.rings.push({ x, y, r: 8, maxR: maxRadius, life: 0, max: 0.3, color });
    }
 
    text(x, y, content, color) {
        this.texts.push({ x, y, content, color, life: 0, max: 0.85 });
    }
 
    update(dt) {
        for (const p of this.particles) {
            p.life += dt;
            p.vy += 900 * dt;
            p.x += p.vx * dt;
            p.y += p.vy * dt;
        }
        for (const r of this.rings) {
            r.life += dt;
            r.r = 8 + (r.maxR - 8) * (r.life / r.max);
        }
        for (const t of this.texts) {
            t.life += dt;
            t.y -= 60 * dt;
        }
        this.particles = this.particles.filter((p) => p.life < p.max);
        this.rings = this.rings.filter((r) => r.life < r.max);
        this.texts = this.texts.filter((t) => t.life < t.max);
    }
 
    draw(ctx) {
        for (const p of this.particles) {
            ctx.globalAlpha = 1 - p.life / p.max;
            ctx.fillStyle = p.color;
            ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
        }
        for (const r of this.rings) {
            ctx.globalAlpha = 1 - r.life / r.max;
            ctx.strokeStyle = r.color;
            ctx.lineWidth = 6;
            ctx.beginPath();
            ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2);
            ctx.stroke();
        }
        ctx.textAlign = "center";
        ctx.font = "bold 30px 'Trebuchet MS', Arial, sans-serif";
        ctx.lineWidth = 5;
        ctx.strokeStyle = "#000";
        for (const t of this.texts) {
            ctx.globalAlpha = 1 - (t.life / t.max) * (t.life / t.max);
            ctx.strokeText(t.content, t.x, t.y);
            ctx.fillStyle = t.color;
            ctx.fillText(t.content, t.x, t.y);
        }
        ctx.globalAlpha = 1;
    }
}
 
 
/* =====================================================================
   6. PROYECTILES
   ===================================================================== */
 
class Projectile {
    constructor(owner, def, x, y, dir) {
        this.owner = owner;
        this.def = def;
        this.x = x;
        this.y = y;
        this.dir = dir;
        this.vx = dir * def.projectileSpeed;
        this.size = 38;
        this.life = def.projectileLife;
        this.age = 0;
        this.dead = false;
    }
 
    update(dt) {
        this.x += this.vx * dt;
        this.age += dt;
        if (this.age >= this.life ||
            this.x < CONFIG.ARENA_LEFT - 80 ||
            this.x > CONFIG.ARENA_RIGHT + 80) {
            this.dead = true;
        }
    }
 
    get box() {
        return { x: this.x - this.size / 2, y: this.y - this.size / 2, w: this.size, h: this.size };
    }
}
 
 
/* =====================================================================
   7. LUCHADOR
   Cada luchador guarda su posición, velocidad, energía, estado y el
   ataque que está ejecutando. No dibuja nada: solo contiene las reglas.
   ===================================================================== */
 
class Fighter {
    constructor(playerId, def, useAlternateColors) {
        this.playerId = playerId;
        this.def = def;
        this.name = def.name;
        this.label = def.name + " (J" + playerId + ")";
        this.colors = useAlternateColors ? def.altColors : def.colors;
        this.width = CONFIG.FIGHTER_W;
        this.height = CONFIG.FIGHTER_H;
        this.wins = 0;
        this.time = 0;
        this.reset(playerId === 1 ? 380 : 900, playerId === 1 ? 1 : -1);
    }
 
    // Deja al luchador listo para iniciar una ronda
    reset(x, facing) {
        this.x = x;
        this.y = CONFIG.GROUND_Y;
        this.vx = 0;
        this.vy = 0;
        this.facing = facing;          // 1 = mira a la derecha, -1 = a la izquierda
        this.onGround = true;
        this.hp = this.def.maxHp;
        this.ghostHp = this.hp;        // barra roja que baja con retraso
        this.guard = CONFIG.GUARD_MAX;
        this.guardBroken = false;
        this.blocking = false;
        this.attack = null;            // ataque en curso o null
        this.specialCooldown = 0;
        this.hurtTimer = 0;
        this.flash = 0;
        this.ko = false;
        this.victory = false;
        this.state = "idle";
    }
 
    // Caja de daño: la zona del cuerpo que puede ser golpeada
    get hurtbox() {
        return { x: this.x - this.width / 2, y: this.y - this.height, w: this.width, h: this.height };
    }
 
    // Fase actual del ataque: "startup", "active", "recovery" o null
    get attackPhase() {
        if (!this.attack) return null;
        const d = this.attack.def;
        if (this.attack.t < d.startup) return "startup";
        if (this.attack.t < d.startup + d.active) return "active";
        return "recovery";
    }
 
    // Caja del ataque cuerpo a cuerpo. Solo existe durante la fase activa.
    get attackBox() {
        if (!this.attack || this.attack.def.type !== "melee" || this.attackPhase !== "active") {
            return null;
        }
        const d = this.attack.def;
        const edge = this.width / 2;
        const x = this.facing > 0 ? this.x + edge - 10 : this.x - edge - d.range + 10;
        return { x: x, y: this.y + d.offsetY, w: d.range, h: d.height };
    }
 
    startAttack(kind) {
        const def = this.def[kind];
        this.attack = { kind: kind, def: def, t: 0, hit: false, spawned: false };
        if (kind === "special") {
            this.specialCooldown = def.cooldown;   // el especial queda en recarga
        }
    }
 
    // Procesa un cuadro del juego. "world" indica si se permite actuar.
    update(dt, actions, rival, world) {
        this.time += dt;
        this.specialCooldown = Math.max(0, this.specialCooldown - dt);
        this.hurtTimer = Math.max(0, this.hurtTimer - dt);
        this.flash = Math.max(0, this.flash - dt);
        if (this.hp < this.ghostHp) {
            this.ghostHp = Math.max(this.hp, this.ghostHp - 40 * dt);
        }
 
        const canAct = !this.ko && this.hurtTimer <= 0 && world.canAct;
 
        // Mirar hacia el rival cuando no se está atacando ni en el aire
        if (rival && this.onGround && !this.attack && !this.ko && this.hurtTimer <= 0) {
            this.facing = rival.x >= this.x ? 1 : -1;
        }
 
        // Defensa: solo en el suelo, sin atacar y con la guardia sana
        this.blocking = canAct && actions.block && this.onGround && !this.attack && !this.guardBroken;
 
        // La guardia se recupera cuando no se está defendiendo
        if (!this.blocking) {
            this.guard = Math.min(CONFIG.GUARD_MAX, this.guard + CONFIG.GUARD_REGEN * dt);
            if (this.guardBroken && this.guard >= CONFIG.GUARD_RECOVER_AT) {
                this.guardBroken = false;
            }
        }
 
        // Movimiento horizontal
        let direction = 0;
        const planted = this.blocking || (this.attack && this.onGround);
        if (canAct && !planted) {
            direction = (actions.right ? 1 : 0) - (actions.left ? 1 : 0);
        }
        if (direction !== 0) {
            this.vx = direction * this.def.speed;
        } else if (this.onGround) {
            this.vx *= Math.exp(-12 * dt);      // fricción: frena el empuje de un golpe
            if (Math.abs(this.vx) < 5) this.vx = 0;
        }
 
        // Salto
        if (canAct && actions.jump && this.onGround && !this.blocking && !this.attack) {
            this.vy = -CONFIG.JUMP_SPEED;
            this.onGround = false;
        }
 
        // Ataques (con tiempos de espera)
        if (canAct && !this.attack && !this.blocking) {
            if (actions.special && this.specialCooldown <= 0) {
                this.startAttack("special");
            } else if (actions.attack) {
                this.startAttack("basic");
            }
        }
 
        this.updateAttack(dt, world);
 
        // Gravedad y movimiento
        this.vy += CONFIG.GRAVITY * dt;
        this.y += this.vy * dt;
        if (this.y >= CONFIG.GROUND_Y) {
            this.y = CONFIG.GROUND_Y;
            this.vy = 0;
            this.onGround = true;
        }
        this.x += this.vx * dt;
 
        // Límites de la arena
        const half = this.width / 2;
        this.x = clamp(this.x, CONFIG.ARENA_LEFT + half, CONFIG.ARENA_RIGHT - half);
 
        this.updateState();
    }
 
    updateAttack(dt, world) {
        if (!this.attack) return;
        const a = this.attack;
        a.t += dt;
 
        // El ataque especial de proyectil nace al terminar la preparación
        if (a.def.type === "projectile" && !a.spawned && a.t >= a.def.startup) {
            a.spawned = true;
            world.spawnProjectile(this, a.def);
        }
 
        if (a.t >= a.def.startup + a.def.active + a.def.recovery) {
            this.attack = null;
        }
    }
 
    updateState() {
        if (this.ko) this.state = "ko";
        else if (this.hurtTimer > 0) this.state = "hurt";
        else if (this.attack) this.state = this.attack.kind === "special" ? "special" : "attack";
        else if (this.blocking) this.state = "block";
        else if (!this.onGround) this.state = "jump";
        else if (Math.abs(this.vx) > 40) this.state = "walk";
        else this.state = "idle";
    }
 
    // Recibe un golpe. "dir" es la dirección en la que sale empujado (+1 o -1).
    // Devuelve un objeto con el resultado o null si el golpe se ignora.
    receiveHit(def, dir) {
        if (this.ko) return null;
 
        const facesAttacker = this.facing === -dir;
        let damage = def.damage;
        let type = "hit";
 
        if (this.blocking && facesAttacker) {
            // Defensa: reduce el daño, gasta guardia y no aturde
            damage = Math.max(1, Math.round(def.damage * CONFIG.BLOCK_DAMAGE_FACTOR));
            this.guard -= def.damage * 2.5;
            this.vx = dir * def.knockback * 0.35;
            type = "blocked";
            if (this.guard <= 0) {
                this.guard = 0;
                this.guardBroken = true;
                this.blocking = false;
                this.hurtTimer = CONFIG.GUARD_BREAK_STUN;
                type = "guardbreak";
            }
        } else {
            this.attack = null;
            this.hurtTimer = def.damage >= 14 ? CONFIG.HURT_TIME + 0.15 : CONFIG.HURT_TIME;
            this.vx = dir * def.knockback;
            if (def.damage >= 14) {
                this.vy = -260;
                this.onGround = false;
            }
        }
 
        this.hp = Math.max(0, this.hp - damage);
        this.flash = 0.25;
 
        if (this.hp <= 0) {
            this.ko = true;
            this.attack = null;
            this.vx = dir * 380;
            this.vy = -420;
            this.onGround = false;
        }
        return { type: type, damage: damage };
    }
}
 
 
/* =====================================================================
   8. RENDERER - Todo el dibujo con Canvas API
   ===================================================================== */
 
const Renderer = {
    background: null,
    stars: [],
 
    init() {
        this.background = this.buildBackground();
        const random = makeRandom(7);
        for (let i = 0; i < 70; i++) {
            this.stars.push({
                x: random() * CONFIG.WIDTH,
                y: random() * 300,
                speed: 1 + random() * 3,
                size: 1 + random() * 2
            });
        }
    },
 
    // El fondo no cambia, así que se dibuja una vez en un canvas oculto
    buildBackground() {
        const W = CONFIG.WIDTH;
        const H = CONFIG.HEIGHT;
        const G = CONFIG.GROUND_Y;
        const canvas = document.createElement("canvas");
        canvas.width = W;
        canvas.height = H;
        const g = canvas.getContext("2d");
        const random = makeRandom(2026);
 
        // Cielo
        const sky = g.createLinearGradient(0, 0, 0, G);
        sky.addColorStop(0, "#12062e");
        sky.addColorStop(0.45, "#3a0f5c");
        sky.addColorStop(0.78, "#a8246f");
        sky.addColorStop(1, "#ff7a59");
        g.fillStyle = sky;
        g.fillRect(0, 0, W, H);
 
        // Sol con franjas (se recorta en un canvas auxiliar)
        const sun = document.createElement("canvas");
        sun.width = 340;
        sun.height = 340;
        const s = sun.getContext("2d");
        const sunGradient = s.createLinearGradient(0, 0, 0, 340);
        sunGradient.addColorStop(0, "#ffe27a");
        sunGradient.addColorStop(1, "#ff3fa4");
        s.fillStyle = sunGradient;
        s.beginPath();
        s.arc(170, 170, 165, 0, Math.PI * 2);
        s.fill();
        s.globalCompositeOperation = "destination-out";
        for (let i = 0; i < 6; i++) {
            s.fillRect(0, 190 + i * 24, 340, 4 + i * 2);
        }
        g.drawImage(sun, W / 2 - 170, 230);
 
        // Edificios en dos capas
        const layers = [
            { color: "#2b0b48", minH: 120, maxH: 260, win: 0.25 },
            { color: "#170530", minH: 80, maxH: 190, win: 0.45 }
        ];
        for (const layer of layers) {
            let x = -20;
            while (x < W) {
                const w = 50 + random() * 70;
                const h = layer.minH + random() * (layer.maxH - layer.minH);
                g.fillStyle = layer.color;
                g.fillRect(x, G - h, w, h);
                for (let wy = G - h + 12; wy < G - 14; wy += 18) {
                    for (let wx = x + 8; wx < x + w - 10; wx += 16) {
                        if (random() < layer.win) {
                            g.fillStyle = random() < 0.5 ? "#ffd166" : "#22e6ff";
                            g.globalAlpha = 0.55;
                            g.fillRect(wx, wy, 6, 8);
                            g.globalAlpha = 1;
                        }
                    }
                }
                x += w + 4 + random() * 10;
            }
        }
 
        // Piso y cuadrícula en perspectiva
        const floor = g.createLinearGradient(0, G, 0, H);
        floor.addColorStop(0, "#2a0a4d");
        floor.addColorStop(1, "#08021a");
        g.fillStyle = floor;
        g.fillRect(0, G, W, H - G);
 
        g.strokeStyle = "rgba(34, 230, 255, 0.35)";
        g.lineWidth = 2;
        for (let i = -12; i <= 12; i++) {
            g.beginPath();
            g.moveTo(W / 2 + i * 60, G + 42);
            g.lineTo(W / 2 + i * 190, H);
            g.stroke();
        }
        for (let y = G + 52, step = 8; y < H; y += step, step += 4) {
            g.beginPath();
            g.moveTo(0, y);
            g.lineTo(W, y);
            g.stroke();
        }
 
        // Plataforma de combate con bordes de neón
        const slab = g.createLinearGradient(0, G, 0, G + 42);
        slab.addColorStop(0, "#5b2a9a");
        slab.addColorStop(1, "#1b0a3d");
        g.fillStyle = slab;
        g.fillRect(30, G, W - 60, 42);
        g.fillStyle = "#22e6ff";
        g.shadowColor = "#22e6ff";
        g.shadowBlur = 18;
        g.fillRect(30, G - 3, W - 60, 5);
        g.shadowColor = "#ff3fa4";
        g.fillStyle = "#ff3fa4";
        g.fillRect(30, G + 38, W - 60, 4);
        g.shadowBlur = 0;
 
        // Viñeta para dar profundidad
        const vignette = g.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, H * 0.95);
        vignette.addColorStop(0, "rgba(0, 0, 0, 0)");
        vignette.addColorStop(1, "rgba(0, 0, 0, 0.55)");
        g.fillStyle = vignette;
        g.fillRect(0, 0, W, H);
 
        return canvas;
    },
 
    drawBackground(ctx, clock) {
        ctx.drawImage(this.background, 0, 0);
        ctx.fillStyle = "#ffffff";
        for (const star of this.stars) {
            ctx.globalAlpha = 0.35 + 0.35 * Math.sin(clock * star.speed + star.x);
            ctx.fillRect(star.x, star.y, star.size, star.size);
        }
        ctx.globalAlpha = 1;
    },
 
    drawShadow(ctx, f) {
        const lift = clamp((CONFIG.GROUND_Y - f.y) / 260, 0, 1);
        ctx.save();
        ctx.globalAlpha = 0.45 * (1 - lift * 0.7);
        ctx.fillStyle = "#000";
        ctx.beginPath();
        ctx.ellipse(f.x, CONFIG.GROUND_Y + 6, 46 * (1 - lift * 0.4), 9, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    },
 
    // Dibuja un luchador con formas geométricas. El origen (0,0) son sus pies.
    drawFighter(ctx, f) {
        const white = { main: "#fff", dark: "#ddd", accent: "#fff", skin: "#fff" };
        const C = (f.flash > 0 && Math.floor(f.flash * 40) % 2 === 0) ? white : f.colors;
        const st = f.state;
        const t = f.time;
        const att = f.attack;
 
        ctx.save();
        ctx.scale(f.facing, 1);
 
        if (st === "ko") {
            ctx.translate(-10, -26);
            ctx.rotate(-1.5);
        } else if (st === "hurt") {
            ctx.rotate(-0.18);
        }
 
        const bob = st === "idle" ? Math.sin(t * 6) * 2.5 : 0;
        const hipY = -78 + bob;
        const shoulderY = hipY - 64;
 
        // ---- Piernas (ángulo y largo según el estado) ----
        let backA = -0.25, frontA = 0.25, backL = 78, frontL = 78;
        if (st === "walk") {
            const swing = Math.sin(t * 16) * 0.65;
            backA = -swing;
            frontA = swing;
        } else if (st === "jump") {
            frontA = 0.9; frontL = 58; backA = -0.35;
        } else if (st === "block") {
            backA = -0.45; frontA = 0.45;
        } else if (st === "attack" || st === "special") {
            backA = -0.5; frontA = 0.55;
        } else if (st === "hurt") {
            backA = -0.1; frontA = 0.5;
        }
        this.drawLeg(ctx, -10, hipY, backA, backL, C.dark, C.accent);
 
        // ---- Posición de los puños ----
        let front = { x: 38, y: shoulderY + 8 };
        let back = { x: 22, y: shoulderY + 20 };
        let chargeGlow = 0;
 
        if (st === "idle") {
            front.x += Math.sin(t * 6) * 2;
            front.y += Math.sin(t * 6 + 1) * 2;
        } else if (st === "walk") {
            front.x = 30 + Math.sin(t * 16) * 10;
            back.x = 18 - Math.sin(t * 16) * 10;
        } else if (st === "jump") {
            front = { x: 34, y: shoulderY - 14 };
            back = { x: 16, y: shoulderY + 4 };
        } else if (st === "block") {
            front = { x: 34, y: shoulderY - 22 };
            back = { x: 28, y: shoulderY };
        } else if (st === "hurt") {
            front = { x: -16, y: shoulderY + 24 };
            back = { x: -28, y: shoulderY + 36 };
        } else if (st === "ko") {
            front = { x: -6, y: shoulderY + 34 };
            back = { x: -22, y: shoulderY + 30 };
        } else if ((st === "attack" || st === "special") && att) {
            const e = this.attackExtension(att);
            const reach = att.def.range;
            if (st === "attack") {
                front = { x: 20 + e * (reach - 6), y: shoulderY + 6 };
                back = { x: 10, y: shoulderY + 22 };
            } else {
                front = { x: 22 + e * (reach * 0.6), y: shoulderY + 2 };
                back = { x: 14 + e * (reach * 0.5), y: shoulderY + 10 };
                if (att.t < att.def.startup) chargeGlow = att.t / att.def.startup;
            }
        }
        if (f.victory && st !== "ko") {
            front = { x: 22, y: shoulderY - 74 };
            back = { x: -8, y: shoulderY - 64 };
        }
 
        this.drawArm(ctx, -14, shoulderY, back.x, back.y, C.dark, C.accent);
 
        // ---- Torso ----
        ctx.fillStyle = C.main;
        roundRectPath(ctx, -25, hipY - 74, 50, 82, 14);
        ctx.fill();
        ctx.fillStyle = C.dark;
        ctx.fillRect(-25, hipY - 8, 50, 9);
        ctx.fillStyle = C.accent;
        ctx.beginPath();
        ctx.moveTo(8, hipY - 58);
        ctx.lineTo(16, hipY - 46);
        ctx.lineTo(8, hipY - 34);
        ctx.lineTo(0, hipY - 46);
        ctx.closePath();
        ctx.fill();
 
        this.drawLeg(ctx, 10, hipY, frontA, frontL, C.main, C.accent);
 
        // ---- Cabeza ----
        const headX = 6;
        const headY = hipY - 98;
        if (f.def.look === "flame") {
            this.drawFlameHair(ctx, headX, headY, t, C);
        } else {
            this.drawCrystalHair(ctx, headX, headY, C);
        }
        ctx.fillStyle = C.skin;
        ctx.beginPath();
        ctx.arc(headX, headY, 21, 0, Math.PI * 2);
        ctx.fill();
        if (f.def.look === "crystal") {
            ctx.fillStyle = C.accent;
            ctx.fillRect(headX - 22, headY - 12, 44, 8);
        }
        this.drawFace(ctx, headX, headY, st, C);
 
        // ---- Brazo delantero ----
        this.drawArm(ctx, 14, shoulderY, front.x, front.y, C.main, C.accent);
 
        // ---- Efectos propios del estado ----
        if (chargeGlow > 0) {
            this.drawGlow(ctx, front.x + 6, front.y, 8 + chargeGlow * 26, C.accent);
        }
        if (st === "block") {
            const power = clamp(f.guard / CONFIG.GUARD_MAX, 0, 1);
            ctx.globalAlpha = 0.25 + 0.5 * power;
            ctx.strokeStyle = "#22e6ff";
            ctx.fillStyle = "#22e6ff";
            ctx.lineWidth = 8;
            ctx.beginPath();
            ctx.arc(10, hipY - 46, 84, -1.1, 1.1);
            ctx.stroke();
            ctx.globalAlpha = 0.12;
            ctx.beginPath();
            ctx.moveTo(10, hipY - 46);
            ctx.arc(10, hipY - 46, 84, -1.1, 1.1);
            ctx.closePath();
            ctx.fill();
            ctx.globalAlpha = 1;
        }
        if (att && f.attackPhase === "active") {
            this.drawAttackEffect(ctx, f, att, front, C);
        }
 
        ctx.restore();
    },
 
    // Qué tan extendido está el brazo: negativo = se prepara, 1 = golpe completo
    attackExtension(att) {
        const d = att.def;
        if (att.t < d.startup) return -0.35 * (att.t / d.startup);
        if (att.t < d.startup + d.active) return 1;
        const r = (att.t - d.startup - d.active) / d.recovery;
        return Math.max(0, 1 - r);
    },
 
    drawLeg(ctx, hipX, hipY, angle, length, color, shoeColor) {
        const footX = hipX + Math.sin(angle) * length;
        const footY = hipY + Math.cos(angle) * length;
        ctx.strokeStyle = color;
        ctx.lineCap = "round";
        ctx.lineWidth = 19;
        ctx.beginPath();
        ctx.moveTo(hipX, hipY);
        ctx.lineTo(footX, footY);
        ctx.stroke();
        ctx.fillStyle = shoeColor;
        roundRectPath(ctx, footX - 12, footY - 7, 30, 14, 6);
        ctx.fill();
    },
 
    drawArm(ctx, shoulderX, shoulderY, fistX, fistY, color, gloveColor) {
        const elbowX = (shoulderX + fistX) / 2;
        const elbowY = (shoulderY + fistY) / 2 + 10;
        ctx.strokeStyle = color;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.lineWidth = 15;
        ctx.beginPath();
        ctx.moveTo(shoulderX, shoulderY);
        ctx.lineTo(elbowX, elbowY);
        ctx.lineTo(fistX, fistY);
        ctx.stroke();
        ctx.fillStyle = gloveColor;
        ctx.beginPath();
        ctx.arc(fistX, fistY, 11, 0, Math.PI * 2);
        ctx.fill();
    },
 
    drawFlameHair(ctx, x, y, t, C) {
        const tips = [
            { dx: -16, h: 34 }, { dx: -4, h: 48 }, { dx: 10, h: 40 }, { dx: 20, h: 28 }
        ];
        for (let layer = 0; layer < 2; layer++) {
            ctx.fillStyle = layer === 0 ? C.dark : C.accent;
            const scale = layer === 0 ? 1 : 0.62;
            tips.forEach((tip, i) => {
                const sway = Math.sin(t * 9 + i * 1.7) * 4;
                ctx.beginPath();
                ctx.moveTo(x + tip.dx - 10, y - 12);
                ctx.lineTo(x + tip.dx - 14 + sway, y - 12 - tip.h * scale);
                ctx.lineTo(x + tip.dx + 8, y - 12);
                ctx.closePath();
                ctx.fill();
            });
        }
    },
 
    drawCrystalHair(ctx, x, y, C) {
        ctx.fillStyle = C.accent;
        ctx.strokeStyle = C.dark;
        ctx.lineWidth = 3;
        const spikes = [
            { dx: -18, tx: -34, ty: -34 }, { dx: -4, tx: -14, ty: -50 }, { dx: 10, tx: 6, ty: -44 }
        ];
        for (const s of spikes) {
            ctx.beginPath();
            ctx.moveTo(x + s.dx - 9, y - 10);
            ctx.lineTo(x + s.tx, y + s.ty);
            ctx.lineTo(x + s.dx + 9, y - 10);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        }
    },
 
    drawFace(ctx, x, y, state, C) {
        ctx.strokeStyle = "#1a1030";
        ctx.fillStyle = "#1a1030";
        ctx.lineWidth = 3;
        ctx.lineCap = "round";
        if (state === "hurt" || state === "ko") {
            ctx.beginPath();
            ctx.moveTo(x + 6, y - 8); ctx.lineTo(x + 16, y);
            ctx.moveTo(x + 16, y - 8); ctx.lineTo(x + 6, y);
            ctx.stroke();
        } else {
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(x + 6, y - 9, 12, 9);
            ctx.fillStyle = "#1a1030";
            ctx.fillRect(x + 12, y - 8, 5, 7);
            ctx.beginPath();
            ctx.moveTo(x + 4, y - 12);
            ctx.lineTo(x + 19, y - 9);
            ctx.stroke();
        }
        ctx.beginPath();
        if (state === "attack" || state === "special") {
            ctx.arc(x + 12, y + 10, 4, 0, Math.PI * 2);
            ctx.fill();
        } else {
            ctx.moveTo(x + 7, y + 10);
            ctx.lineTo(x + 16, y + 10);
            ctx.stroke();
        }
    },
 
    drawGlow(ctx, x, y, radius, color) {
        const gradient = ctx.createRadialGradient(x, y, 1, x, y, radius);
        gradient.addColorStop(0, "#ffffff");
        gradient.addColorStop(0.4, color);
        gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
    },
 
    // Indicador visual del ataque (se dibuja en el espacio del luchador)
    drawAttackEffect(ctx, f, att, fist, C) {
        const d = att.def;
        if (d.type !== "melee") {
            this.drawGlow(ctx, fist.x + 10, fist.y, 30, C.accent);
            return;
        }
        if (att.kind === "basic") {
            ctx.strokeStyle = C.accent;
            ctx.globalAlpha = 0.85;
            ctx.lineWidth = 9;
            ctx.lineCap = "round";
            ctx.beginPath();
            ctx.arc(24, fist.y, d.range - 8, -0.75, 0.75);
            ctx.stroke();
            ctx.globalAlpha = 1;
        } else {
            // Ataque especial cuerpo a cuerpo: picos de hielo que salen del piso
            const spikes = 6;
            ctx.fillStyle = C.accent;
            ctx.strokeStyle = C.main;
            ctx.lineWidth = 4;
            for (let i = 0; i < spikes; i++) {
                const px = 46 + i * ((d.range - 50) / (spikes - 1));
                const h = 40 + Math.sin((i / (spikes - 1)) * Math.PI) * 55;
                ctx.beginPath();
                ctx.moveTo(px - 14, 0);
                ctx.lineTo(px, -h);
                ctx.lineTo(px + 14, 0);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
            }
        }
    },
 
    drawProjectile(ctx, p) {
        const colors = p.owner.colors;
        for (let i = 3; i >= 1; i--) {
            ctx.globalAlpha = 0.18 * (4 - i);
            this.drawGlow(ctx, p.x - p.dir * i * 22, p.y, p.size * (0.55 - i * 0.08), colors.main);
        }
        ctx.globalAlpha = 1;
        const flicker = 1 + Math.sin(p.age * 40) * 0.08;
        this.drawGlow(ctx, p.x, p.y, p.size * flicker, colors.accent);
        ctx.fillStyle = colors.main;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 0.32, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 0.16, 0, Math.PI * 2);
        ctx.fill();
    },
 
    // Rectángulos de depuración (tecla F2)
    drawDebug(ctx, fighters, projectiles) {
        ctx.lineWidth = 2;
        for (const f of fighters) {
            ctx.strokeStyle = "#00ff66";
            const h = f.hurtbox;
            ctx.strokeRect(h.x, h.y, h.w, h.h);
            const a = f.attackBox;
            if (a) {
                ctx.strokeStyle = "#ff2222";
                ctx.strokeRect(a.x, a.y, a.w, a.h);
            }
        }
        ctx.strokeStyle = "#ffaa00";
        for (const p of projectiles) {
            const b = p.box;
            ctx.strokeRect(b.x, b.y, b.w, b.h);
        }
    },
 
    // Vista previa de un personaje (tarjetas de selección)
    drawPreview(canvas, def) {
        const ctx = canvas.getContext("2d");
        const f = new Fighter(1, def, false);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.translate(canvas.width / 2 - 6, canvas.height - 18);
        ctx.scale(0.95, 0.95);
        this.drawFighter(ctx, f);
        ctx.restore();
    }
};
 
 
/* =====================================================================
   9. JUEGO: rondas, combate, HUD y pantallas
   ===================================================================== */
 
class Game {
    constructor() {
        this.canvas = document.getElementById("game");
        this.ctx = this.canvas.getContext("2d");
        this.input = new InputManager();
        this.effects = new Effects();
 
        this.mode = "menu";            // menu | select | match | result
        this.phase = "intro";          // intro | fight | roundEnd (dentro de match)
        this.phaseTimer = 0;
        this.timeLeft = CONFIG.ROUND_TIME;
        this.round = 1;
        this.roundResults = [];
        this.selection = { 1: "ember", 2: "tundra" };
        this.p1 = null;
        this.p2 = null;
        this.projectiles = [];
        this.hitStop = 0;
        this.shake = 0;
        this.paused = false;
        this.frozen = false;
        this.clock = 0;
        this.lastTime = 0;
        this.introGoShown = false;
 
        this.cacheDom();
        Renderer.init();
        this.buildSelectCards();
        this.bindUi();
        this.showScreen("start");
 
        this.loop = this.loop.bind(this);
        requestAnimationFrame(this.loop);
    }
 
    /* ---------- Referencias al DOM ---------- */
 
    cacheDom() {
        const $ = (id) => document.getElementById(id);
        this.dom = {
            hud: $("hud"),
            timer: $("timer"),
            roundLabel: $("roundLabel"),
            banner: $("banner"),
            bannerMain: $("bannerMain"),
            bannerSub: $("bannerSub"),
            pause: $("pauseLayer"),
            screens: {
                start: $("screen-start"),
                select: $("screen-select"),
                result: $("screen-result")
            },
            resultTitle: $("resultTitle"),
            resultScore: $("resultScore"),
            roundLog: $("roundLog"),
            cards: { 1: $("cardsP1"), 2: $("cardsP2") },
            players: {
                1: {
                    name: $("p1Name"), pips: $("p1Pips"), bar: $("p1Bar"), hp: $("p1Hp"),
                    ghost: $("p1Ghost"), guard: $("p1Guard"),
                    special: $("p1Special"), specialBox: $("p1SpecialBox")
                },
                2: {
                    name: $("p2Name"), pips: $("p2Pips"), bar: $("p2Bar"), hp: $("p2Hp"),
                    ghost: $("p2Ghost"), guard: $("p2Guard"),
                    special: $("p2Special"), specialBox: $("p2SpecialBox")
                }
            }
        };
    }
 
    bindUi() {
        const click = (id, handler) => {
            const button = document.getElementById(id);
            button.addEventListener("click", () => {
                button.blur();             // evita que Enter/Espacio vuelvan a pulsarlo
                handler();
            });
        };
        click("btnStart", () => this.goToSelect());
        click("btnBack", () => this.goToMenu());
        click("btnFight", () => this.startMatch());
        click("btnRematch", () => this.startMatch());
        click("btnChange", () => this.goToSelect());
        click("btnMenu", () => this.goToMenu());
 
        window.addEventListener("keydown", (event) => {
            if (event.code === "F2") {
                CONFIG_DEBUG.show = !CONFIG_DEBUG.show;
            }
        });
 
        // Si el jugador cambia de pestaña, el combate se pausa
        document.addEventListener("visibilitychange", () => {
            if (document.hidden && this.mode === "match" && this.phase !== "roundEnd") {
                this.setPaused(true);
            }
        });
        window.addEventListener("blur", () => {
            if (this.mode === "match" && this.phase !== "roundEnd") {
                this.setPaused(true);
            }
        });
    }
 
    /* ---------- Pantallas y selección de personajes ---------- */
 
    showScreen(name) {
        for (const key of Object.keys(this.dom.screens)) {
            this.dom.screens[key].classList.toggle("active", key === name);
        }
        this.dom.hud.classList.toggle("active", name === null);
    }
 
    goToMenu() {
        this.mode = "menu";
        this.p1 = null;
        this.p2 = null;
        this.projectiles = [];
        this.effects.clear();
        this.showScreen("start");
    }
 
    goToSelect() {
        this.mode = "select";
        this.p1 = null;
        this.p2 = null;
        this.effects.clear();
        this.refreshCards();
        this.showScreen("select");
    }
 
    buildSelectCards() {
        for (const player of [1, 2]) {
            const container = this.dom.cards[player];
            container.innerHTML = "";
            for (const id of Object.keys(CHARACTERS)) {
                const def = CHARACTERS[id];
                const card = document.createElement("div");
                card.className = "card";
                card.dataset.player = String(player);
                card.dataset.char = id;
 
                const preview = document.createElement("canvas");
                preview.width = 200;
                preview.height = 230;
                Renderer.drawPreview(preview, def);
                card.appendChild(preview);
 
                const name = document.createElement("div");
                name.className = "card-name";
                name.textContent = def.name;
                card.appendChild(name);
 
                const title = document.createElement("div");
                title.className = "card-title";
                title.textContent = def.title;
                card.appendChild(title);
 
                for (const stat of Object.keys(def.rating)) {
                    const row = document.createElement("div");
                    row.className = "stat";
                    row.innerHTML = "<span>" + stat + "</span>" +
                        "<div><b style='width:" + def.rating[stat] + "%'></b></div>";
                    card.appendChild(row);
                }
 
                card.addEventListener("click", () => {
                    this.selection[player] = id;
                    this.refreshCards();
                });
                container.appendChild(card);
            }
        }
        this.refreshCards();
    }
 
    refreshCards() {
        for (const player of [1, 2]) {
            for (const card of this.dom.cards[player].children) {
                card.classList.toggle("selected", card.dataset.char === this.selection[player]);
            }
        }
    }
 
    cycleSelection(player, step) {
        const ids = Object.keys(CHARACTERS);
        const index = ids.indexOf(this.selection[player]);
        this.selection[player] = ids[(index + step + ids.length) % ids.length];
        this.refreshCards();
    }
 
    /* ---------- Inicio de combate y rondas ---------- */
 
    startMatch() {
        const sameCharacter = this.selection[1] === this.selection[2];
        this.p1 = new Fighter(1, CHARACTERS[this.selection[1]], false);
        this.p2 = new Fighter(2, CHARACTERS[this.selection[2]], sameCharacter);
        this.round = 1;
        this.roundResults = [];
        this.mode = "match";
        this.dom.players[1].name.textContent = this.p1.name;
        this.dom.players[2].name.textContent = this.p2.name;
        this.input.clear();
        this.showScreen(null);
        this.beginRound();
    }
 
    beginRound() {
        this.p1.reset(380, 1);
        this.p2.reset(900, -1);
        this.projectiles = [];
        this.effects.clear();
        this.timeLeft = CONFIG.ROUND_TIME;
        this.phase = "intro";
        this.phaseTimer = CONFIG.INTRO_TIME;
        this.introGoShown = false;
        this.hitStop = 0;
        this.shake = 0;
        this.setPaused(false);
        this.dom.roundLabel.textContent = "RONDA " + this.round;
        this.showBanner("RONDA " + this.round, "PREPÁRENSE");
        this.refreshPips();
    }
 
    endRound(reason) {
        const a = this.p1;
        const b = this.p2;
        let winner = null;
 
        if (reason === "ko") {
            if (a.ko && !b.ko) winner = b;
            else if (b.ko && !a.ko) winner = a;
        } else if (a.hp > b.hp) {
            winner = a;
        } else if (b.hp > a.hp) {
            winner = b;
        }
 
        if (winner) {
            winner.wins += 1;
            winner.victory = true;
        }
        this.roundResults.push({
            round: this.round,
            winner: winner,
            reason: reason
        });
 
        this.projectiles = [];
        this.phase = "roundEnd";
        this.phaseTimer = CONFIG.ROUND_END_TIME;
        this.refreshPips();
        this.showBanner(
            reason === "ko" ? "¡K.O.!" : "¡TIEMPO!",
            winner ? "GANA " + winner.label : "EMPATE"
        );
    }
 
    afterRoundEnd() {
        const matchOver =
            this.p1.wins >= CONFIG.ROUNDS_TO_WIN ||
            this.p2.wins >= CONFIG.ROUNDS_TO_WIN ||
            this.round >= CONFIG.MAX_ROUNDS;
 
        if (matchOver) {
            this.finishMatch();
        } else {
            this.round += 1;
            this.beginRound();
        }
    }
 
    finishMatch() {
        let winner = null;
        if (this.p1.wins > this.p2.wins) winner = this.p1;
        else if (this.p2.wins > this.p1.wins) winner = this.p2;
 
        this.hideBanner();
        this.mode = "result";
 
        if (winner) {
            this.dom.resultTitle.textContent = "¡GANA " + winner.label + "!";
            this.dom.resultTitle.style.color = winner.colors.main;
        } else {
            this.dom.resultTitle.textContent = "¡EMPATE!";
            this.dom.resultTitle.style.color = "#ffd166";
        }
        this.dom.resultScore.textContent = this.p1.wins + " — " + this.p2.wins;
 
        this.dom.roundLog.innerHTML = "";
        for (const r of this.roundResults) {
            const item = document.createElement("li");
            const how = r.reason === "ko" ? "por K.O." : "por tiempo";
            item.textContent = r.winner
                ? "Ronda " + r.round + ": gana " + r.winner.label + " " + how
                : "Ronda " + r.round + ": empate";
            this.dom.roundLog.appendChild(item);
        }
        this.showScreen("result");
    }
 
    /* ---------- Cartel central ---------- */
 
    showBanner(main, sub) {
        const banner = this.dom.banner;
        this.dom.bannerMain.textContent = main;
        this.dom.bannerSub.textContent = sub || "";
        banner.classList.remove("show");
        void banner.offsetWidth;           // reinicia la animación CSS
        banner.classList.add("show");
    }
 
    hideBanner() {
        this.dom.banner.classList.remove("show");
    }
 
    setPaused(value) {
        this.paused = value;
        this.dom.pause.classList.toggle("show", value);
    }
 
    /* ---------- Ciclo principal ---------- */
 
    loop(timestamp) {
        const dt = Math.min((timestamp - this.lastTime) / 1000, 0.05) || 0;
        this.lastTime = timestamp;
        this.update(dt);
        this.render();
        requestAnimationFrame(this.loop);
    }
 
    update(dt) {
        this.clock += dt;
        this.frozen = false;
 
        if (this.mode === "select") {
            this.updateSelect();
        } else if (this.mode === "match") {
            this.updateMatch(dt);
        }
 
        // Las pulsaciones se descartan al final de cada cuadro simulado
        if (!this.frozen) {
            this.input.endFrame();
        }
    }
 
    updateSelect() {
        if (this.input.consume("KeyA")) this.cycleSelection(1, -1);
        if (this.input.consume("KeyD")) this.cycleSelection(1, 1);
        if (this.input.consume("ArrowLeft")) this.cycleSelection(2, -1);
        if (this.input.consume("ArrowRight")) this.cycleSelection(2, 1);
        if (this.input.consume("Escape")) this.goToMenu();
    }
 
    updateMatch(dt) {
        // Pausa
        const pausePressed = this.input.consume("KeyP") || this.input.consume("Escape");
        if (pausePressed && this.phase !== "roundEnd") {
            this.setPaused(!this.paused);
        }
        if (this.paused) return;
 
        // Pausa breve por impacto: se congela la simulación unos milisegundos
        if (this.hitStop > 0) {
            this.hitStop -= dt;
            this.frozen = true;
            this.effects.update(dt * 0.3);
            return;
        }
 
        this.shake = Math.max(0, this.shake - 40 * dt);
 
        const world = {
            canAct: this.phase === "fight",
            spawnProjectile: (owner, def) => this.spawnProjectile(owner, def)
        };
 
        this.p1.update(dt, this.input.actionsFor(1), this.p2, world);
        this.p2.update(dt, this.input.actionsFor(2), this.p1, world);
        this.separateFighters();
        this.updateProjectiles(dt);
        this.resolveMeleeHits();
        this.effects.update(dt);
 
        if (this.phase === "intro") {
            this.phaseTimer -= dt;
            if (!this.introGoShown && this.phaseTimer <= 0.9) {
                this.introGoShown = true;
                this.showBanner("¡LUCHA!", "");
            }
            if (this.phaseTimer <= 0) {
                this.phase = "fight";
                this.hideBanner();
            }
        } else if (this.phase === "fight") {
            this.timeLeft = Math.max(0, this.timeLeft - dt);
            if (this.p1.ko || this.p2.ko) {
                this.endRound("ko");
            } else if (this.timeLeft <= 0) {
                this.endRound("time");
            }
        } else if (this.phase === "roundEnd") {
            this.phaseTimer -= dt;
            if (this.phaseTimer <= 0) {
                this.afterRoundEnd();
            }
        }
 
        this.updateHud();
    }
 
    /* ---------- Reglas de combate ---------- */
 
    spawnProjectile(owner, def) {
        const x = owner.x + owner.facing * (owner.width / 2 + 16);
        const y = owner.y - 100;
        this.projectiles.push(new Projectile(owner, def, x, y, owner.facing));
    }
 
    // Evita que los luchadores se atraviesen: los separa si sus cajas se solapan
    separateFighters() {
        const a = this.p1.hurtbox;
        const b = this.p2.hurtbox;
        if (!rectsOverlap(a, b)) return;
 
        const overlap = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
        const push = overlap / 2 + 0.5;
        const half = CONFIG.FIGHTER_W / 2;
        if (this.p1.x <= this.p2.x) {
            this.p1.x -= push;
            this.p2.x += push;
        } else {
            this.p1.x += push;
            this.p2.x -= push;
        }
        for (const f of [this.p1, this.p2]) {
            f.x = clamp(f.x, CONFIG.ARENA_LEFT + half, CONFIG.ARENA_RIGHT - half);
        }
    }
 
    updateProjectiles(dt) {
        for (const p of this.projectiles) {
            p.update(dt);
            if (p.dead) continue;
            const target = p.owner === this.p1 ? this.p2 : this.p1;
            if (!target.ko && rectsOverlap(p.box, target.hurtbox)) {
                this.applyHit(p.owner, target, p.def, p.dir);
                p.dead = true;
            }
        }
        this.projectiles = this.projectiles.filter((p) => !p.dead);
    }
 
    // Revisa los golpes cuerpo a cuerpo: un ataque solo puede golpear una vez
    resolveMeleeHits() {
        const pairs = [[this.p1, this.p2], [this.p2, this.p1]];
        for (const [attacker, defender] of pairs) {
            const box = attacker.attackBox;
            if (!box || attacker.attack.hit) continue;
            if (rectsOverlap(box, defender.hurtbox)) {
                attacker.attack.hit = true;
                this.applyHit(attacker, defender, attacker.attack.def, attacker.facing);
            }
        }
    }
 
    applyHit(attacker, defender, def, dir) {
        const result = defender.receiveHit(def, dir);
        if (!result) return;
 
        const hx = defender.x - dir * 14;
        const hy = defender.y - 100;
        const strong = def.damage >= 14;
 
        if (result.type === "hit") {
            this.effects.burst(hx, hy, attacker.colors.accent, strong ? 26 : 16, strong ? 560 : 420);
            this.effects.ring(hx, hy, "#ffffff", strong ? 130 : 85);
            this.effects.text(defender.x, defender.y - 175, "-" + result.damage, "#ffd166");
            this.shake = strong ? 14 : 7;
            this.hitStop = strong ? 0.1 : CONFIG.HIT_STOP;
        } else if (result.type === "blocked") {
            this.effects.burst(hx, hy, "#22e6ff", 9, 300);
            this.effects.ring(hx, hy, "#22e6ff", 60);
            this.effects.text(defender.x, defender.y - 175, "BLOQUEO", "#22e6ff");
            this.shake = 3;
            this.hitStop = 0.03;
        } else {
            this.effects.burst(hx, hy, "#ff3fa4", 28, 600);
            this.effects.ring(hx, hy, "#ff3fa4", 140);
            this.effects.text(defender.x, defender.y - 175, "¡GUARDIA ROTA!", "#ff3fa4");
            this.shake = 12;
            this.hitStop = 0.09;
        }
    }
 
    /* ---------- HUD ---------- */
 
    refreshPips() {
        const fighters = { 1: this.p1, 2: this.p2 };
        for (const player of [1, 2]) {
            const pips = this.dom.players[player].pips.children;
            for (let i = 0; i < pips.length; i++) {
                pips[i].classList.toggle("on", fighters[player].wins > i);
            }
        }
    }
 
    updateHud() {
        const fighters = { 1: this.p1, 2: this.p2 };
        for (const player of [1, 2]) {
            const f = fighters[player];
            const ui = this.dom.players[player];
            ui.hp.style.width = (f.hp / f.def.maxHp * 100) + "%";
            ui.ghost.style.width = (f.ghostHp / f.def.maxHp * 100) + "%";
            ui.bar.classList.toggle("low", f.hp / f.def.maxHp < 0.25 && !f.ko);
            ui.guard.style.width = (f.guard / CONFIG.GUARD_MAX * 100) + "%";
            const cooldownTotal = f.def.special.cooldown;
            const ready = f.specialCooldown <= 0;
            ui.special.style.width = ((1 - f.specialCooldown / cooldownTotal) * 100) + "%";
            ui.specialBox.classList.toggle("ready", ready);
        }
        this.dom.timer.textContent = String(Math.ceil(this.timeLeft));
        this.dom.timer.classList.toggle("urgent", this.timeLeft <= 10 && this.phase === "fight");
    }
 
    /* ---------- Dibujo de cada cuadro ---------- */
 
    render() {
        const ctx = this.ctx;
        ctx.save();
        ctx.clearRect(0, 0, CONFIG.WIDTH, CONFIG.HEIGHT);
 
        if (this.shake > 0) {
            ctx.translate((Math.random() - 0.5) * this.shake, (Math.random() - 0.5) * this.shake);
        }
 
        Renderer.drawBackground(ctx, this.clock);
 
        if (this.p1 && this.p2 && (this.mode === "match" || this.mode === "result")) {
            const fighters = [this.p1, this.p2];
            for (const f of fighters) {
                Renderer.drawShadow(ctx, f);
            }
            for (const f of fighters) {
                ctx.save();
                ctx.translate(f.x, f.y);
                Renderer.drawFighter(ctx, f);
                ctx.restore();
            }
            for (const p of this.projectiles) {
                Renderer.drawProjectile(ctx, p);
            }
            this.effects.draw(ctx);
            if (CONFIG_DEBUG.show) {
                Renderer.drawDebug(ctx, fighters, this.projectiles);
            }
        }
        ctx.restore();
    }
}
 
 
/* =====================================================================
   10. ARRANQUE
   ===================================================================== */
 
// Estado mutable de depuración (CONFIG está congelado, por eso va aparte)
const CONFIG_DEBUG = { show: CONFIG.DEBUG_HITBOXES };
 
const game = new Game();