/* =========================================================
   GOAT FIGHT
   Complete Game Logic
========================================================= */

"use strict";


/* =========================================================
   DOM HELPER
========================================================= */

const $ = (id) => document.getElementById(id);


/* =========================================================
   DOM
========================================================= */

const setupScreen = $("setupScreen");
const gameScreen = $("gameScreen");
const resultScreen = $("resultScreen");

const setupLevel = $("setupLevel");
const battleLevel = $("battleLevel");
const resultLevel = $("resultLevel");

const enemyImageInput = $("enemyImageInput");

const cropSection = $("cropSection");
const cropArea = $("cropArea");
const cropImage = $("cropImage");
const zoomSlider = $("zoomSlider");
const confirmFaceButton = $("confirmFaceButton");

const weaponList = $("weaponList");
const startGameButton = $("startGameButton");

const arena = $("arena");

const player = $("player");
const enemy = $("enemy");

const playerWeapon = $("playerWeapon");

const enemyFace = $("enemyFace");
const enemyFacePlaceholder = $("enemyFacePlaceholder");

const playerHpBar = $("playerHpBar");
const enemyHpBar = $("enemyHpBar");

const playerHpText = $("playerHpText");
const enemyHpText = $("enemyHpText");

const battleStatus = $("battleStatus");

const hitEffect = $("hitEffect");
const damageNumber = $("damageNumber");
const weaponTrail = $("weaponTrail");

const leftButton = $("leftButton");
const rightButton = $("rightButton");
const jumpButton = $("jumpButton");
const attackButton = $("attackButton");

const resultIcon = $("resultIcon");
const resultTitle = $("resultTitle");
const resultMessage = $("resultMessage");

const nextBattleButton = $("nextBattleButton");
const backToMenuButton = $("backToMenuButton");


/* =========================================================
   WEAPONS
========================================================= */

const weapons = {

    fist: {
        name: "Găng Đấm",
        icon: "🥊",
        damage: 9,
        range: 105,
        cooldown: 360,
        knockback: 18,
        hitStop: 45,
        combo: true
    },


    stick: {
        name: "Gậy Gỗ",
        icon: "🪵",
        damage: 17,
        range: 130,
        cooldown: 650,
        knockback: 45,
        hitStop: 65,
        shake: true
    },


    sword: {
        name: "Kiếm",
        icon: "⚔️",
        damage: 16,
        range: 155,
        cooldown: 590,
        knockback: 30,
        hitStop: 55,
        shake: true,
        slash: true
    },


    hammer: {
        name: "Búa",
        icon: "🔨",
        damage: 27,
        range: 120,
        cooldown: 1000,
        knockback: 85,
        hitStop: 110,
        shake: true,
        stun: 800,
        heavy: true
    },


    fire: {
        name: "Găng Lửa",
        icon: "🔥",
        damage: 10,
        range: 115,
        cooldown: 430,
        knockback: 22,
        hitStop: 45,
        burn: true
    }

};


/* =========================================================
   GAME STATE
========================================================= */

const game = {

    level:
        Number(localStorage.getItem("goatFightLevel")) || 0,

    selectedWeapon:
        "fist",

    faceImage:
        null,

    faceConfirmed:
        false,

    crop: {

        zoom: 1,

        x: 0,

        y: 0,

        dragging: false,

        startX: 0,

        startY: 0,

        originalX: 0,

        originalY: 0

    },


    player: {

        x: 14,

        hp: 100,

        maxHp: 100,

        velocityY: 0,

        jumping: false,

        attacking: false,

        lastAttack: 0,

        direction: 1

    },


    enemy: {

        x: 70,

        hp: 100,

        maxHp: 100,

        velocityY: 0,

        attacking: false,

        lastAttack: 0,

        stunnedUntil: 0,

        direction: -1

    },


    keys: {

        left: false,

        right: false

    },


    running:
        false,

    raf:
        null,

    aiTimer:
        null,

    lastTime:
        0,

    hitStopUntil:
        0

};


/* =========================================================
   INITIALIZATION
========================================================= */

document.addEventListener("DOMContentLoaded", init);


function init() {

    updateLevelUI();

    setupWeapons();

    setupUpload();

    setupCrop();

    setupControls();

    setupKeyboard();

    setupResultButtons();

    updateWeaponVisual();

}


/* =========================================================
   LEVEL
========================================================= */

function updateLevelUI() {

    setupLevel.textContent =
        game.level;

    battleLevel.textContent =
        game.level;

    if (resultLevel) {

        resultLevel.textContent =
            game.level;

    }

}


function saveLevel() {

    localStorage.setItem(
        "goatFightLevel",
        String(game.level)
    );

}


/* =========================================================
   WEAPON SELECT
========================================================= */

function setupWeapons() {

    const buttons =
        weaponList.querySelectorAll(
            ".weapon-card"
        );


    buttons.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                buttons.forEach(
                    b =>
                        b.classList.remove(
                            "selected"
                        )
                );


                button.classList.add(
                    "selected"
                );


                game.selectedWeapon =
                    button.dataset.weapon;


                updateWeaponVisual();

            }
        );

    });

}


function updateWeaponVisual() {

    const weapon =
        weapons[game.selectedWeapon];


    if (!weapon) return;


    playerWeapon.textContent =
        weapon.icon;


    playerWeapon.dataset.weapon =
        game.selectedWeapon;


    if (
        game.selectedWeapon === "sword"
    ) {

        playerWeapon.style.fontSize =
            "34px";

    } else if (
        game.selectedWeapon === "hammer"
    ) {

        playerWeapon.style.fontSize =
            "31px";

    } else {

        playerWeapon.style.fontSize =
            "28px";

    }

}


/* =========================================================
   IMAGE UPLOAD
========================================================= */

function setupUpload() {

    enemyImageInput.addEventListener(
        "change",
        handleImageUpload
    );

}


function handleImageUpload(event) {

    const file =
        event.target.files?.[0];


    if (!file) return;


    if (!file.type.startsWith("image/")) {

        alert(
            "Vui lòng chọn một file ảnh."
        );

        return;

    }


    const reader =
        new FileReader();


    reader.onload = () => {

        game.faceImage =
            reader.result;

        game.faceConfirmed =
            false;


        cropImage.onload = () => {

            cropSection.classList.add(
                "visible"
            );


            game.crop.zoom =
                1;

            game.crop.x =
                0;

            game.crop.y =
                0;


            zoomSlider.value =
                "1";


            updateCropImage();

        };


        cropImage.src =
            game.faceImage;

    };


    reader.readAsDataURL(file);

}


/* =========================================================
   CROP
========================================================= */

function setupCrop() {

    zoomSlider.addEventListener(
        "input",
        () => {

            game.crop.zoom =
                Number(
                    zoomSlider.value
                );

            updateCropImage();

        }
    );


    cropArea.addEventListener(
        "pointerdown",
        cropPointerDown
    );


    window.addEventListener(
        "pointermove",
        cropPointerMove
    );


    window.addEventListener(
        "pointerup",
        cropPointerUp
    );


    confirmFaceButton.addEventListener(
        "click",
        confirmFace
    );

}


function cropPointerDown(event) {

    if (!game.faceImage) return;


    game.crop.dragging =
        true;


    game.crop.startX =
        event.clientX;

    game.crop.startY =
        event.clientY;

    game.crop.originalX =
        game.crop.x;

    game.crop.originalY =
        game.crop.y;


    cropArea.setPointerCapture?.(
        event.pointerId
    );

}


function cropPointerMove(event) {

    if (!game.crop.dragging) return;


    game.crop.x =
        game.crop.originalX +
        (
            event.clientX -
            game.crop.startX
        );


    game.crop.y =
        game.crop.originalY +
        (
            event.clientY -
            game.crop.startY
        );


    updateCropImage();

}


function cropPointerUp() {

    game.crop.dragging =
        false;

}


function updateCropImage() {

    if (!cropImage.naturalWidth) {
        return;
    }


    const areaSize =
        cropArea.clientWidth;


    const imageRatio =
        cropImage.naturalWidth /
        cropImage.naturalHeight;


    let width;
    let height;


    if (imageRatio >= 1) {

        height =
            areaSize;

        width =
            height * imageRatio;

    } else {

        width =
            areaSize;

        height =
            width / imageRatio;

    }


    width *=
        game.crop.zoom;

    height *=
        game.crop.zoom;


    cropImage.style.width =
        `${width}px`;

    cropImage.style.height =
        `${height}px`;


    cropImage.style.left =
        `calc(50% + ${game.crop.x}px)`;


    cropImage.style.top =
        `calc(50% + ${game.crop.y}px)`;


    cropImage.style.transform =
        "translate(-50%, -50%)";
}


/* =========================================================
   CREATE CROPPED FACE
========================================================= */

function createFaceImage() {

    if (!game.faceImage) {
        return null;
    }


    const size = 500;


    const canvas =
        document.createElement("canvas");


    canvas.width =
        size;

    canvas.height =
        size;


    const ctx =
        canvas.getContext("2d");


    const image =
        new Image();


    image.src =
        game.faceImage;


    const areaRect =
        cropArea.getBoundingClientRect();


    const imageRect =
        cropImage.getBoundingClientRect();


    const scale =
        imageRect.width /
        image.naturalWidth;


    const centerX =
        areaRect.left +
        areaRect.width / 2;


    const centerY =
        areaRect.top +
        areaRect.height / 2;


    const sourceX =
        (
            centerX -
            imageRect.left
        ) / scale;


    const sourceY =
        (
            centerY -
            imageRect.top
        ) / scale;


    const sourceSize =
        areaRect.width /
        scale;


    ctx.drawImage(
        image,

        sourceX -
            sourceSize / 2,

        sourceY -
            sourceSize / 2,

        sourceSize,

        sourceSize,

        0,
        0,

        size,
        size
    );


    return canvas.toDataURL(
        "image/jpeg",
        .92
    );

}


/* =========================================================
   CONFIRM FACE
========================================================= */

function confirmFace() {

    if (!game.faceImage) {

        alert(
            "Bạn chưa chọn ảnh đối thủ."
        );

        return;

    }


    const cropped =
        createFaceImage();


    if (!cropped) {

        alert(
            "Không thể xử lý ảnh."
        );

        return;

    }


    game.faceImage =
        cropped;

    game.faceConfirmed =
        true;


    enemyFace.innerHTML = "";


    const image =
        document.createElement("img");


    image.src =
        game.faceImage;

    image.alt =
        "Đối thủ";


    enemyFace.appendChild(
        image
    );


    enemyFacePlaceholder.style.display =
        "none";


    battleStatus.textContent =
        "SẴN SÀNG!";


    confirmFaceButton.textContent =
        "✓ ĐÃ XÁC NHẬN";

    confirmFaceButton.style.color =
        "#50e58d";

}


/* =========================================================
   START GAME
========================================================= */

startGameButton.addEventListener(
    "click",
    startGame
);


function startGame() {

    if (!game.faceImage) {

        alert(
            "Hãy chọn ảnh đối thủ trước."
        );

        return;

    }


    if (!game.faceConfirmed) {

        confirmFace();

    }


    hideAllScreens();


    gameScreen.classList.add(
        "active"
    );


    resetBattle();

}


/* =========================================================
   SCREEN
========================================================= */

function hideAllScreens() {

    setupScreen.classList.remove(
        "active"
    );

    gameScreen.classList.remove(
        "active"
    );

    resultScreen.classList.remove(
        "active"
    );

}


/* =========================================================
   RESET BATTLE
========================================================= */

function resetBattle() {

    game.player.hp =
        100;

    game.enemy.hp =
        100;


    game.player.x =
        14;

    game.enemy.x =
        70;


    game.player.velocityY =
        0;

    game.player.jumping =
        false;


    game.player.attacking =
        false;

    game.enemy.attacking =
        false;


    game.enemy.stunnedUntil =
        0;


    updatePositions();

    updateHP();


    battleStatus.textContent =
        "FIGHT!";


    game.running =
        true;


    game.lastTime =
        performance.now();


    clearInterval(
        game.aiTimer
    );


    game.aiTimer =
        setInterval(
            enemyAI,
            220
        );


    cancelAnimationFrame(
        game.raf
    );


    game.raf =
        requestAnimationFrame(
            gameLoop
        );

}


/* =========================================================
   GAME LOOP
========================================================= */

function gameLoop(time) {

    if (!game.running) {
        return;
    }


    const delta =
        Math.min(
            40,
            time - game.lastTime
        );


    game.lastTime =
        time;


    if (
        time >=
        game.hitStopUntil
    ) {

        updatePlayer(delta);

        updateEnemy(delta);

    }


    updatePositions();


    game.raf =
        requestAnimationFrame(
            gameLoop
        );

}


/* =========================================================
   PLAYER UPDATE
========================================================= */

function updatePlayer(delta) {

    const speed =
        0.045 * delta;


    let moving =
        false;


    if (game.keys.left) {

        game.player.x -=
            speed;

        game.player.direction =
            -1;

        moving =
            true;

    }


    if (game.keys.right) {

        game.player.x +=
            speed;

        game.player.direction =
            1;

        moving =
            true;

    }


    game.player.x =
        clamp(
            game.player.x,
            3,
            82
        );


    if (game.player.jumping) {

        game.player.velocityY +=
            0.0024 * delta;

    }


    if (
        game.player.jumping &&
        game.player.velocityY >= 0
    ) {

        game.player.jumping =
            false;

        game.player.velocityY =
            0;

    }


    player.classList.toggle(
        "walking",
        moving && !game.player.jumping
    );


    player.classList.toggle(
        "jumping",
        game.player.jumping
    );

}


/* =========================================================
   ENEMY UPDATE
========================================================= */

function updateEnemy() {

    if (
        Date.now() <
        game.enemy.stunnedUntil
    ) {

        enemy.classList.add(
            "stunned"
        );

        return;

    }


    enemy.classList.remove(
        "stunned"
    );

}


/* =========================================================
   POSITIONS
========================================================= */

function updatePositions() {

    player.style.left =
        `${game.player.x}%`;


    enemy.style.left =
        `${game.enemy.x}%`;


    if (
        game.player.direction < 0
    ) {

        player.style.transform =
            "scaleX(-1)";

    } else {

        player.style.transform =
            "scaleX(1)";

    }


    if (
        game.enemy.direction < 0
    ) {

        enemy.style.transform =
            "scaleX(-1)";

    } else {

        enemy.style.transform =
            "scaleX(1)";

    }

}


/* =========================================================
   HP
========================================================= */

function updateHP() {

    const playerPercent =
        Math.max(
            0,
            game.player.hp
        );

    const enemyPercent =
        Math.max(
            0,
            game.enemy.hp
        );


    playerHpBar.style.width =
        `${playerPercent}%`;


    enemyHpBar.style.width =
        `${enemyPercent}%`;


    playerHpText.textContent =
        `${Math.ceil(game.player.hp)} / 100`;


    enemyHpText.textContent =
        `${Math.ceil(game.enemy.hp)} / 100`;

}


/* =========================================================
   CONTROLS
========================================================= */

function setupControls() {

    holdButton(
        leftButton,

        () => {
            game.keys.left =
                true;

            leftButton.classList.add(
                "pressed"
            );
        },

        () => {
            game.keys.left =
                false;

            leftButton.classList.remove(
                "pressed"
            );
        }
    );


    holdButton(
        rightButton,

        () => {
            game.keys.right =
                true;

            rightButton.classList.add(
                "pressed"
            );
        },

        () => {
            game.keys.right =
                false;

            rightButton.classList.remove(
                "pressed"
            );
        }
    );


    jumpButton.addEventListener(
        "pointerdown",
        event => {

            event.preventDefault();

            jump();

        }
    );


    attackButton.addEventListener(
        "pointerdown",
        event => {

            event.preventDefault();

            attack();

        }
    );

}


function holdButton(
    button,
    start,
    end
) {

    button.addEventListener(
        "pointerdown",
        event => {

            event.preventDefault();

            button.setPointerCapture?.(
                event.pointerId
            );

            start();

        }
    );


    button.addEventListener(
        "pointerup",
        event => {

            event.preventDefault();

            end();

        }
    );


    button.addEventListener(
        "pointercancel",
        end
    );


    button.addEventListener(
        "pointerleave",
        event => {

            if (
                event.buttons === 0
            ) {

                end();

            }

        }
    );

}


/* =========================================================
   KEYBOARD
========================================================= */

function setupKeyboard() {

    window.addEventListener(
        "keydown",
        event => {

            if (
                !game.running
            ) {
                return;
            }


            if (
                event.code ===
                "ArrowLeft" ||
                event.code === "KeyA"
            ) {

                game.keys.left =
                    true;

                event.preventDefault();

            }


            if (
                event.code ===
                "ArrowRight" ||
                event.code === "KeyD"
            ) {

                game.keys.right =
                    true;

                event.preventDefault();

            }


            if (
                event.code ===
                "Space" ||
                event.code === "ArrowUp" ||
                event.code === "KeyW"
            ) {

                if (
                    !event.repeat
                ) {

                    jump();

                }

                event.preventDefault();

            }


            if (
                event.code ===
                "KeyJ" ||
                event.code ===
                "Enter"
            ) {

                if (
                    !event.repeat
                ) {

                    attack();

                }

                event.preventDefault();

            }

        }
    );


    window.addEventListener(
        "keyup",
        event => {

            if (
                event.code ===
                "ArrowLeft" ||
                event.code === "KeyA"
            ) {

                game.keys.left =
                    false;

            }


            if (
                event.code ===
                "ArrowRight" ||
                event.code === "KeyD"
            ) {

                game.keys.right =
                    false;

            }

        }
    );

}


/* =========================================================
   JUMP
========================================================= */

function jump() {

    if (
        !game.running ||
        game.player.jumping
    ) {
        return;
    }


    game.player.jumping =
        true;


    game.player.velocityY =
        -0.55;

}


/* =========================================================
   ATTACK
========================================================= */

function attack() {

    if (!game.running) {
        return;
    }


    const weapon =
        weapons[
            game.selectedWeapon
        ];


    const now =
        performance.now();


    if (
        now -
        game.player.lastAttack <
        weapon.cooldown
    ) {

        return;

    }


    game.player.lastAttack =
        now;


    player.classList.remove(
        "attacking"
    );


    void player.offsetWidth;


    player.classList.add(
        "attacking"
    );


    setTimeout(
        () => {

            player.classList.remove(
                "attacking"
            );

        },
        300
    );


    checkPlayerHit(
        weapon
    );

}


/* =========================================================
   PLAYER HIT
========================================================= */

function checkPlayerHit(
    weapon
) {

    const distance =
        Math.abs(
            game.player.x -
            game.enemy.x
        );


    if (
        distance >
        weapon.range / 8
    ) {

        showBattleStatus(
            "MISS!"
        );

        return;

    }


    damageEnemy(
        weapon
    );

}


/* =========================================================
   DAMAGE ENEMY
========================================================= */

function damageEnemy(
    weapon
) {

    let damage =
        weapon.damage;


    /* level scaling */

    damage +=
        Math.floor(
            game.level * 0.8
        );


    game.enemy.hp -=
        damage;


    game.enemy.hp =
        Math.max(
            0,
            game.enemy.hp
        );


    /* knockback */

    const direction =
        game.player.x <
        game.enemy.x
            ? 1
            : -1;


    game.enemy.x +=
        direction *
        (
            weapon.knockback / 10
        );


    game.enemy.x =
        clamp(
            game.enemy.x,
            3,
            87
        );


    /* stun */

    if (weapon.stun) {

        game.enemy.stunnedUntil =
            Date.now() +
            weapon.stun;

    }


    /* visuals */

    enemy.classList.remove(
        "damage-flash"
    );

    void enemy.offsetWidth;

    enemy.classList.add(
        "damage-flash"
    );


    showHitEffect();

    showDamage(
        damage
    );


    if (
        weapon.shake
    ) {

        shakeArena();

    }


    if (
        weapon.slash
    ) {

        showWeaponTrail();

    }


    game.hitStopUntil =
        performance.now() +
        weapon.hitStop;


    updateHP();


    if (
        game.enemy.hp <= 0
    ) {

        setTimeout(
            winBattle,
            450
        );

    }

}


/* =========================================================
   ENEMY AI
========================================================= */

function enemyAI() {

    if (
        !game.running
    ) {
        return;
    }


    if (
        game.enemy.hp <= 0 ||
        game.player.hp <= 0
    ) {
        return;
    }


    if (
        Date.now() <
        game.enemy.stunnedUntil
    ) {
        return;
    }


    const distance =
        game.player.x -
        game.enemy.x;


    const absDistance =
        Math.abs(distance);


    /* approach */

    if (
        absDistance > 13
    ) {

        const direction =
            distance > 0
                ? 1
                : -1;


        game.enemy.x +=
            direction * 2;


        game.enemy.direction =
            direction;

        return;

    }


    /* random retreat */

    if (
        Math.random() < .14
    ) {

        const retreat =
            distance > 0
                ? -1
                : 1;


        game.enemy.x +=
            retreat * 5;


        return;

    }


    /* attack */

    if (
        Date.now() -
        game.enemy.lastAttack >
        850
    ) {

        enemyAttack();

    }

}


/* =========================================================
   ENEMY ATTACK
========================================================= */

function enemyAttack() {

    game.enemy.lastAttack =
        Date.now();


    enemy.classList.remove(
        "attacking"
    );


    void enemy.offsetWidth;


    enemy.classList.add(
        "attacking"
    );


    setTimeout(
        () => {

            enemy.classList.remove(
                "attacking"
            );

        },
        300
    );


    const distance =
        Math.abs(
            game.player.x -
            game.enemy.x
        );


    if (
        distance > 15
    ) {

        return;

    }


    const damage =
        6 +
        Math.floor(
            game.level * .5
        );


    game.player.hp -=
        damage;


    game.player.hp =
        Math.max(
            0,
            game.player.hp
        );


    player.classList.remove(
        "damage-flash"
    );

    void player.offsetWidth;

    player.classList.add(
        "damage-flash"
    );


    showDamage(
        damage
    );


    showHitEffect();


    updateHP();


    if (
        game.player.hp <= 0
    ) {

        setTimeout(
            loseBattle,
            450
        );

    }

}


/* =========================================================
   VISUAL EFFECTS
========================================================= */

function showHitEffect() {

    hitEffect.classList.remove(
        "show"
    );


    void hitEffect.offsetWidth;


    hitEffect.classList.add(
        "show"
    );

}


function showDamage(
    damage
) {

    damageNumber.textContent =
        `-${damage}`;


    damageNumber.classList.remove(
        "show"
    );


    void damageNumber.offsetWidth;


    damageNumber.classList.add(
        "show"
    );

}


function showWeaponTrail() {

    weaponTrail.textContent =
        "〰";


    weaponTrail.classList.add(
        "show"
    );


    setTimeout(
        () => {

            weaponTrail.classList.remove(
                "show"
            );

        },
        250
    );

}


function shakeArena() {

    arena.classList.remove(
        "shake"
    );


    void arena.offsetWidth;


    arena.classList.add(
        "shake"
    );

}


/* =========================================================
   STATUS
========================================================= */

function showBattleStatus(
    text
) {

    battleStatus.textContent =
        text;


    clearTimeout(
        showBattleStatus.timer
    );


    showBattleStatus.timer =
        setTimeout(
            () => {

                if (game.running) {

                    battleStatus.textContent =
                        "FIGHT!";

                }

            },
            500
        );

}


/* =========================================================
   WIN
========================================================= */

function winBattle() {

    if (!game.running) {
        return;
    }


    game.running =
        false;


    clearInterval(
        game.aiTimer
    );


    cancelAnimationFrame(
        game.raf
    );


    game.level++;


    saveLevel();

    updateLevelUI();


    resultIcon.textContent =
        "🏆";


    resultTitle.textContent =
        "CHIẾN THẮNG!";


    resultMessage.textContent =
        `Bạn đã thắng Level ${game.level - 1}. Level tiếp theo là ${game.level}.`;


    hideAllScreens();


    resultScreen.classList.add(
        "active"
    );

}


/* =========================================================
   LOSE
========================================================= */

function loseBattle() {

    if (!game.running) {
        return;
    }


    game.running =
        false;


    clearInterval(
        game.aiTimer
    );


    cancelAnimationFrame(
        game.raf
    );


    resultIcon.textContent =
        "💥";


    resultTitle.textContent =
        "THẤT BẠI";


    resultMessage.textContent =
        "Không sao! Thử lại trận này nhé.";


    hideAllScreens();


    resultScreen.classList.add(
        "active"
    );

}


/* =========================================================
   RESULT BUTTONS
========================================================= */

function setupResultButtons() {

    nextBattleButton.addEventListener(
        "click",
        () => {

            hideAllScreens();

            gameScreen.classList.add(
                "active"
            );

            resetBattle();

        }
    );


    backToMenuButton.addEventListener(
        "click",
        () => {

            game.running =
                false;


            clearInterval(
                game.aiTimer
            );


            cancelAnimationFrame(
                game.raf
            );


            hideAllScreens();


            setupScreen.classList.add(
                "active"
            );

        }
    );

}


/* =========================================================
   TOUCH / SCROLL PROTECTION
========================================================= */

gameScreen.addEventListener(
    "touchmove",
    event => {

        event.preventDefault();

    },
    {
        passive: false
    }
);


/* =========================================================
   RESIZE
========================================================= */

window.addEventListener(
    "resize",
    () => {

        if (
            game.faceImage &&
            cropSection.classList.contains(
                "visible"
            )
        ) {

            updateCropImage();

        }

    }
);


/* =========================================================
   HELPERS
========================================================= */

function clamp(
    value,
    min,
    max
) {

    return Math.max(
        min,
        Math.min(
            max,
            value
        )
    );

}


/* =========================================================
   DEBUG ACCESS
========================================================= */

window.goatFight =
    game;