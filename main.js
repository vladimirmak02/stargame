window.requestAnimFrame = (function (callback) {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
        function (callback) {
            window.setTimeout(callback, 1000 / 60);
        };
})();


let CANVASHEIGHT = 1080,
    STARL = 20,
    CANVASWIDTH = 1980,
    HEALTHBARHEIGHT = 128;

starsArr = [],
    bulletsArr = [],
    enemyBulletsArr = [];
enemyArr = [];

let currentLevel = [],
    isLoading = 0,
    loadingCounter = 0;
levelCounter = 0;

let bulletImg1 = new Image(),
    bulletImg2 = new Image(),
    bulletImg3 = new Image();
bulletImg1.src = "res/laser.png";
bulletImg2.src = "res/missile.png";
bulletImg3.src = "res/bullet.png";

let starImgsArr = [];
for (let i = 0; i < 7; i++){
    starImgsArr.push(new Image());
    starImgsArr[i].src = "res/star"+i+'.png';
}

/*

currentLvl = [
    {enemyTYpe - 1, timout - 1000},
    {enemyTYpe - 2, timout - 4000},
    {enemyTYpe - 1, timout - 4500},
    {enemyTYpe - 3, timout - 6000},
];

for (en in currlvl)
    setTimeout(drawEnemy(en), en.timeout)



 */

function createLevel() {
    // draw new background + stars TODO
    levelCounter++;
    ship.shipHealth = 999;
    context2.clearRect(0, 0, CANVASWIDTH, CANVASHEIGHT);
    context3.clearRect(0, 0, CANVASWIDTH, CANVASHEIGHT);
    // context4.clearRect(0, 0, CANVASWIDTH, CANVASHEIGHT);

    //generate some stars
    starsArr.length = 0
    for (let i = 0; i < 50; i++) {
        starsArr.push(new star(parseInt((Math.random() * (CANVASWIDTH - STARL / 2)) /*+ STARL*/), parseInt((Math.random() * (CANVASHEIGHT - STARL / 2)) /*+ STARL*/)))
    }
    context2.filter = 'opacity(40%) saturate(30%)';
    for (let starr of starsArr) {
        context2.drawImage(starr.img, starr.x, starr.y);
    }



    ship.shipY = CANVASHEIGHT / 2 - ship.shipImg.height / 2;
    ship.shipX = 0;
    ship.draw(0);
    // generate new level

    currentLevel = [];

    let enemyCount = Math.floor(Math.random() * 4 + levelCounter) + 2 + levelCounter;
    for (let i = 0; i < enemyCount; i++) {
        let enemyshiptype = Math.floor(Math.random() * 9) + 1;
        currentLevel.push({
            type: enemyshiptype,
            timeout: enemyshiptype * 1000 + i * 1000 + 1000
        })

    }
    console.table(currentLevel);

    for (let en of currentLevel) {
        setTimeout(_ => {
            enemyArr.push(new enemyShip1(en.type))
        }, en.timeout);
    }


}

// shipX = 20,
// shipY = 20;

class playerShip {
    constructor(src) {
        this.shipX = 0;
        this.shipY = 0;
        this.speed = 0;
        this.isHurt = 0;
        this.isInvincible = 0;
        this.maxSpeed = 10;
        this.shipHealth = 999;
        this.shipMaxHealth = this.shipHealth;
        this.rof = 5;
        this.canShoot = true;
        this.updateShootCounter = this.rof;
        this.shipImg = new Image();
        this.shipImg.src = "res/ship.png";
        this.shipImgHurt = new Image();
        this.shipImgHurt.src = "res/shiphurt.png";
        this.shipImg.onload = () => {
            context3.drawImage(this.shipImg, this.shipX, this.shipY);
            this.shipY = CANVASHEIGHT / 2 - this.shipImg.height / 2;
        };
        this.shooting = false;
        this.moving = {
            up: false,
            down: false,
            left: false,
            right: false,
        }
    }

    draw(hurt) {
        if (hurt) {

            context3.drawImage(ship.shipImgHurt, ship.shipX, ship.shipY);
        }
        else {
            context3.drawImage(ship.shipImg, ship.shipX, ship.shipY);
        }
    }
}

class enemyShip1 {
    constructor(type) {
        this.shipX = (CANVASWIDTH - 100);
        this.shipY = CANVASHEIGHT / 2;
        this.shipSpeed = ((-0.011 * type * type * type + 10) + 1.8);
        this.isAppearing = true;
        this.shootCounter = 0;
        this.currentShoot = 0;
        this.shipShootPattern = shootPatterns["normal" + type];
        this.shipShootPatternKey = "normal";
        this.bulletType = 1;
        // if (type >= 6 && type <= 7) {
        //     this.bulletType = 2;
        // }
        // else{
        //     this.bulletType = 1
        // }
        this.rof = parseInt(-0.5 * (type - 5) * (type - 5) + 30 * this.bulletType * this.bulletType);
        this.shipType = parseInt(type);
        this.shipDamage = 50 * type;
        this.dest = {
            x: 0,
            y: 0,
            wait: 0
        };
        this.currentMove = 0;
        this.shipMovePattern = movePatterns[type];
        this.shipHealth = (Math.pow(1.3, type) - 0.5) * 100;
        this.shipMaxHealth = this.shipHealth;
        this.isHurt = 0;
        this.shipImg = new Image();
        this.shipImg.src = "res/alien" + String(type) + ".png";
        this.shipImgHurt = new Image();
        this.shipImgHurt.src = "res/alien" + String(type) + "hurt" + ".png";
        this.shipImg.onload = () => {
            this.shipX = (CANVASWIDTH);
            this.shipY = CANVASHEIGHT / 2 - this.shipImg.height / 2;
        };
    }


    draw() {
        // context3.clearRect(0,0,CANVASWIDTH, CANVASHEIGHT);
        context3.drawImage(enemy.shipImg, enemy.shipX, enemy.shipY);
    }
}

class bullet {
    constructor(side, type, x, y) {
        this.side = side;
        this.bulletSpeed = 19;
        this.bulletX = 0;
        this.bulletY = -100;
        this.bulletDamage = 100;
        this.bulletImg;
        if (side == "player") {
            this.bulletImg = bulletImg1;
        }
        else {
            if (type === 1) {
                this.bulletImg = bulletImg3;
            }
            else {
                this.bulletImg = bulletImg2;
                this.bulletDamage = 200;
                this.bulletSpeed = 13;
            }
        }
        if (side === "player") {
            this.bulletX = ship.shipX + ship.shipImg.width;
            this.bulletY = ship.shipY + (ship.shipImg.height / 2 - this.bulletImg.height / 2);
        }
        else {
            this.bulletY = y - this.bulletImg.height / 2;
            this.bulletX = x;
        }
    }
}

class star {
    constructor(x, y) {
        this.starType = Math.floor(Math.random() * 6) + 1;
        this.img = starImgsArr[this.starType];
        this.y = y;
        this.x = x;

    }

    draw() {


    }
}

let canvas1 = document.getElementById("canvas1");
canvas1.width = CANVASWIDTH;
canvas1.height = CANVASHEIGHT;
let canvas2 = document.getElementById("canvas2");
canvas2.width = CANVASWIDTH;
canvas2.height = CANVASHEIGHT;
let canvas3 = document.getElementById("canvas3");
canvas3.width = CANVASWIDTH;
canvas3.height = CANVASHEIGHT;
let canvas4 = document.getElementById("canvas4");
canvas4.width = CANVASWIDTH;
canvas4.height = CANVASHEIGHT;
let context1 = canvas1.getContext('2d');
let context2 = canvas2.getContext('2d');
let context3 = canvas3.getContext('2d');
let context4 = canvas4.getContext('2d');

let hBarImg = new Image();
hBarImg.src = "res/healthbar.png";


// $("fullscreenBtn").click(function(){
//     $("canvas1").requestFullscreem();
// });

window.addEventListener('keydown', function (e) {
    if (ship.speed === 0) {
        ship.speed = 2;
    }
    if (e.keyCode === 40) {
        ship.moving.down = true;
    }
    else if (e.keyCode === 38) {
        ship.moving.up = true;
    }
    else if (e.keyCode === 37) {
        ship.moving.left = true;
    }
    else if (e.keyCode === 39) {
        ship.moving.right = true;
    }
    if (e.keyCode === 32) {
        ship.shooting = true;
    }
}, false);


window.addEventListener('keyup', function (e) {
    if (e.keyCode === 40) {
        ship.moving.down = false;
        ship.speed = 0;
    }
    else if (e.keyCode === 38) {
        ship.moving.up = false;
        ship.speed = 0;
    }
    else if (e.keyCode === 37) {
        ship.moving.left = false;
        ship.speed = 0;
    }
    else if (e.keyCode === 39) {
        ship.moving.right = false;
        ship.speed = 0;
    }
    if (e.keyCode === 32) {
        ship.shooting = false;
    }

}, false);


function update() {
    if (isLoading === 0) {
        if (ship.shipHealth < 0) {
            location.reload();
        }

        if (ship.speed < ship.maxSpeed) {
            ship.speed += 0.3
        }

        // if (ship.shooting === true){
        //     if (ship.updateShootCounter === ship.rof){
        //         bulletsArr.push(new bullet('player'));
        //         ship.updateShootCounter = 0;
        //     }
        //     ship.updateShootCounter++;
        // }

        if (ship.canShoot === true) {
            if (ship.shooting === true) {
                bulletsArr.push(new bullet('player'));
                ship.updateShootCounter = 0;
                ship.canShoot = false;
            }
        }
        if (ship.updateShootCounter === ship.rof) {
            ship.canShoot = true;
        }
        else {
            ship.updateShootCounter++;
        }

        for (let [i, bullett] of enemyBulletsArr.entries()) {
            let dot1 = {
                x: bullett.bulletX,
                y: bullett.bulletY + bullett.bulletImg.height / 4
            };
            let dot2 = {
                x: bullett.bulletX,
                y: bullett.bulletY + bullett.bulletImg.height / 4 * 3
            };
            let dot3 = {
                x: bullett.bulletX + bullett.bulletImg.width / 4 * 3,
                y: bullett.bulletY + bullett.bulletImg.height / 2
            }
            let ifhit = false;
            if ((dot1.x >= ship.shipX &&
                    dot1.x <= ship.shipX + ship.shipImg.width &&
                    dot1.y >= ship.shipY &&
                    dot1.y <= ship.shipY + ship.shipImg.height) ||
                (dot2.x >= ship.shipX &&
                    dot2.x <= ship.shipX + ship.shipImg.width &&
                    dot2.y >= ship.shipY &&
                    dot2.y <= ship.shipY + ship.shipImg.height) ||
                (dot3.x >= ship.shipX &&
                    dot3.x <= ship.shipX + ship.shipImg.width &&
                    dot3.y >= ship.shipY &&
                    dot3.y <= ship.shipY + ship.shipImg.height)
            ) {
                ifhit = true;
                ship.shipHealth -= bullett.bulletDamage;
                console.log(ship.shipHealth);
                ship.isHurt = 1;
                enemyBulletsArr.splice(i, 1);
            }
            if (ifhit)
                continue;
            bullett.bulletX -= bullett.bulletSpeed;
            if (bullett.bulletX + bullett.bulletImg.width < 0) {
                enemyBulletsArr.splice(i, 1);
            }
        }

        for (let [i, bullett] of bulletsArr.entries()) {
            let dot1 = {
                x: bullett.bulletX + bullett.bulletImg.width,
                y: bullett.bulletY + bullett.bulletImg.height / 4
            };
            let dot2 = {
                x: bullett.bulletX + bullett.bulletImg.width,
                y: bullett.bulletY + bullett.bulletImg.height / 4 * 3
            };
            let ifHitSmb = false;
            for (let enemyy of enemyArr) {
                if ((dot1.x >= enemyy.shipX &&
                        dot1.x <= enemyy.shipX + enemyy.shipImg.width &&
                        dot1.y >= enemyy.shipY &&
                        dot1.y <= enemyy.shipY + enemyy.shipImg.height) ||
                    (dot2.x >= enemyy.shipX &&
                        dot2.x <= enemyy.shipX + enemyy.shipImg.width &&
                        dot2.y >= enemyy.shipY &&
                        dot2.y <= enemyy.shipY + enemyy.shipImg.height)
                ) {
                    ifHitSmb = true;
                    enemyy.shipHealth -= bullett.bulletDamage;
                    enemyy.isHurt = 1;
                    bulletsArr.splice(i, 1);

                }
            }
            if (ifHitSmb)
                continue;
            bullett.bulletX += bullett.bulletSpeed;
            if (bullett.bulletX > CANVASWIDTH) {
                bulletsArr.splice(i, 1);
            }
        }


        for (let [i, enemyy] of enemyArr.entries()) {
            let calculatingDestination = 0;
            if (enemyy.isAppearing === true) {
                enemyy.shipX -= enemyy.shipSpeed;
                if (enemyy.shipX <= CANVASWIDTH - enemyy.shipImg.width) {
                    enemyy.isAppearing = false;
                    calculatingDestination = 1;
                }
            }


            if (enemyy.shipType > 9 && enemyy.shipHealth / enemyy.shipMaxHealth * 100 < 50 && enemyy.shipShootPatternKey === "normal") {
                enemyy.shipShootPattern = shootPatterns["super" + enemyy.shipType];
                enemyy.shipShootPatternKey = "super";
                enemyy.currentShoot = 0;
                enemyArr.push(new enemyShip1(enemyy.shipType - 7));
            }

            if (enemyy.shootCounter > enemyy.rof) {
                enemyy.shootCounter = 0;
                if (enemyy.shipShootPattern[enemyy.currentShoot] === "b") {
                    enemyy.bulletType = 1;
                    enemyBulletsArr.push(new bullet("enemy", enemyy.bulletType, enemyy.shipX, enemyy.shipY + enemyy.shipImg.height / 2));

                }
                else if (enemyy.shipShootPattern[enemyy.currentShoot] === "r") {
                    enemyy.bulletType = 2;
                    enemyBulletsArr.push(new bullet("enemy", enemyy.bulletType, enemyy.shipX, enemyy.shipY + enemyy.shipImg.height / 2));
                }
                else if (enemyy.shipShootPattern[enemyy.currentShoot] === " ") {

                }

                let tmpCurrentShoot = enemyy.shipShootPattern[enemyy.currentShoot]
                enemyy.currentShoot = (enemyy.currentShoot === enemyy.shipShootPattern.length - 1) ? 0 : enemyy.currentShoot + 1;
                if ((enemyy.shipShootPattern[enemyy.currentShoot] === "r" && tmpCurrentShoot === "b") ||
                    (enemyy.shipShootPattern[enemyy.currentShoot] === "r" && tmpCurrentShoot === " ")) {
                    enemyy.rof = enemyy.rof * 2;
                }
                else if ((enemyy.shipShootPattern[enemyy.currentShoot] === " " && tmpCurrentShoot === "r") ||
                    (enemyy.shipShootPattern[enemyy.currentShoot] === "b" && tmpCurrentShoot === "r")) {
                    enemyy.rof = parseInt(enemyy.rof / 2)
                }
            }
            else {
                enemyy.shootCounter++;
            }

            if (enemyy.shipMovePattern[enemyy.currentMove] === "4") {
                enemyy.shipX -= enemyy.shipSpeed;
                if (enemyy.shipX < enemyy.dest.x) {
                    enemyy.currentMove++;
                    calculatingDestination = 1;
                    if (enemyy.currentMove === enemyy.shipMovePattern.length) {
                        enemyy.currentMove = 0;
                    }
                }
            }
            else if (enemyy.shipMovePattern[enemyy.currentMove] === "8") {
                enemyy.shipY -= enemyy.shipSpeed;
                if (enemyy.shipY < enemyy.dest.y) {
                    enemyy.currentMove++;
                    calculatingDestination = 1;
                    if (enemyy.currentMove === enemyy.shipMovePattern.length) {
                        enemyy.currentMove = 0;
                    }
                }
            }
            else if (enemyy.shipMovePattern[enemyy.currentMove] === "2") {
                enemyy.shipY += enemyy.shipSpeed;
                if (enemyy.shipY > enemyy.dest.y) {
                    enemyy.currentMove++;
                    calculatingDestination = 1;
                    if (enemyy.currentMove === enemyy.shipMovePattern.length) {
                        enemyy.currentMove = 0;
                    }
                }
            }
            else if (enemyy.shipMovePattern[enemyy.currentMove] === "6") {
                enemyy.shipX += enemyy.shipSpeed;
                if (enemyy.shipX > enemyy.dest.x) {
                    enemyy.currentMove++;
                    calculatingDestination = 1;
                    if (enemyy.currentMove === enemyy.shipMovePattern.length) {
                        enemyy.currentMove = 0;
                    }
                }
            }
            else if (enemyy.shipMovePattern[enemyy.currentMove] === "5") {
                enemyy.dest.wait++;
                if (enemyy.dest.wait > 100) {
                    enemyy.dest.wait = 0;
                    enemyy.currentMove++;
                    calculatingDestination = 1;
                    if (enemyy.currentMove === enemyy.shipMovePattern.length) {
                        enemyy.currentMove = 0;
                    }
                }
            }


            if (calculatingDestination === 1) {

                if (enemyy.shipMovePattern[enemyy.currentMove] === "4") {
                    enemyy.dest.x = enemyy.shipX - 1000 / enemyy.shipType;
                    enemyy.dest.y = enemyy.shipY;
                }
                else if (enemyy.shipMovePattern[enemyy.currentMove] === "8") {
                    enemyy.dest.x = enemyy.shipX;
                    enemyy.dest.y = (enemyy.shipY - 1000 / enemyy.shipType > 0) ?
                        enemyy.shipY - 1000 / enemyy.shipType : 0;
                }
                else if (enemyy.shipMovePattern[enemyy.currentMove] === "2") {
                    enemyy.dest.x = enemyy.shipX;
                    enemyy.dest.y = (enemyy.shipY + 1000 / enemyy.shipType < CANVASHEIGHT - enemyy.shipImg.height - HEALTHBARHEIGHT) ?
                        enemyy.shipY + 1000 / enemyy.shipType : CANVASHEIGHT - enemyy.shipImg.height - HEALTHBARHEIGHT;
                }
                else if (enemyy.shipMovePattern[enemyy.currentMove] === "6") {
                    enemyy.dest.x = (enemyy.shipX + 1000 / enemyy.shipType < CANVASWIDTH - enemyy.shipImg.width) ?
                        enemyy.shipX + 1000 / enemyy.shipType : CANVASWIDTH - enemyy.shipImg.width;
                    enemyy.dest.y = enemyy.shipY;
                }

                calculatingDestination = 0;
            }


            let dot1 = {
                x: ship.shipX,
                y: ship.shipY
            }
            let dot2 = {
                x: ship.shipX + ship.shipImg.width,
                y: ship.shipY
            }
            let dot3 = {
                x: ship.shipX,
                y: ship.shipY + ship.shipImg.height
            }
            let dot4 = {
                x: ship.shipX + ship.shipImg.width,
                y: ship.shipY + ship.shipImg.height
            }
            if ((
                    dot1.x >= enemyy.shipX &&
                    dot1.x <= enemyy.shipX + enemyy.shipImg.width &&
                    dot1.y >= enemyy.shipY &&
                    dot1.y <= enemyy.shipY + enemyy.shipImg.height) ||
                (
                    dot2.x >= enemyy.shipX &&
                    dot2.x <= enemyy.shipX + enemyy.shipImg.width &&
                    dot2.y >= enemyy.shipY &&
                    dot2.y <= enemyy.shipY + enemyy.shipImg.height) ||
                (
                    dot3.x >= enemyy.shipX &&
                    dot3.x <= enemyy.shipX + enemyy.shipImg.width &&
                    dot3.y >= enemyy.shipY &&
                    dot3.y <= enemyy.shipY + enemyy.shipImg.height) ||
                (
                    dot4.x >= enemyy.shipX &&
                    dot4.x <= enemyy.shipX + enemyy.shipImg.width &&
                    dot4.y >= enemyy.shipY &&
                    dot4.y <= enemyy.shipY + enemyy.shipImg.height)
            ) {
                if (ship.isInvincible === 0) {
                    ship.isHurt = 1;
                    ship.isInvincible = 1;
                    ship.shipHealth -= enemyy.shipDamage;
                }
            }

            if (enemyy.shipHealth < 1 ||
                enemyy.shipX + enemyy.shipImg.width < 0
            ) {
                enemyArr.splice(i, 1);
            }
        }

//check collisions
        if (ship.moving.up) {
            if (ship.shipY > 0) {
                ship.shipY -= ship.speed;
                // if (!ship.isBlocked) {
                //     ship.shipY -= ship.speed;
                // }
                // else{
                //     ship.shipY += ship.speed;
                //     ship.isBlocked = false;
                // }
            }
        }
        if (ship.moving.down) {
            if (ship.shipY < (CANVASHEIGHT - ship.shipImg.height - HEALTHBARHEIGHT)) {
                ship.shipY += ship.speed;
            }
        }
        if (ship.moving.left) {
            if (ship.shipX > 0) {
                ship.shipX -= ship.speed;
            }
        }
        if (ship.moving.right) {
            if (enemyArr.length === 0 && ship.shipX > (CANVASWIDTH - ship.shipImg.width)) {
                //next level
                isLoading = 1;


            }
            else if (ship.shipX < (CANVASWIDTH - ship.shipImg.width)) {
                ship.shipX += ship.speed;
            }

        }


//check shots


//draw everything
        context3.clearRect(0, 0, CANVASWIDTH, CANVASHEIGHT);
        for (let bullett of bulletsArr) {
            context3.drawImage(bullett.bulletImg, bullett.bulletX, bullett.bulletY);
        }
        for (let bullett of enemyBulletsArr) {
            context3.drawImage(bullett.bulletImg, bullett.bulletX, bullett.bulletY);
        }

        if (ship.isHurt > 0) {

            ship.isHurt++;
            context3.drawImage(ship.shipImgHurt, ship.shipX, ship.shipY);
            if (ship.isHurt > 10) {
                ship.isHurt = 0;
                ship.isInvincible = 0;
            }
        }
        else {
            context3.drawImage(ship.shipImg, ship.shipX, ship.shipY);
        }

        for (let enemyy of enemyArr) {
            if (enemyy.isHurt === 0) {
                context3.drawImage(enemyy.shipImg, enemyy.shipX, enemyy.shipY)
            }
            else {
                if (enemyy.isHurt < 8) {
                    context3.drawImage(enemyy.shipImgHurt, enemyy.shipX, enemyy.shipY)
                    enemyy.isHurt++
                }
                // else if (enemyy.isHurt < 16){
                //     context3.drawImage(enemyy.shipImg, enemyy.shipX, enemyy.shipY)
                //     enemyy.isHurt++
                // }
                else {
                    enemyy.isHurt = 0
                }
            }
        }

        // draw health bar & points
        context4.clearRect(0, 0, CANVASWIDTH, CANVASHEIGHT);
        context4.fillStyle = "#3cad43";

        context4.fillRect(173, CANVASHEIGHT - HEALTHBARHEIGHT + 25, 355 * (ship.shipHealth / ship.shipMaxHealth), 72);
        context4.drawImage(hBarImg, 100, CANVASHEIGHT - HEALTHBARHEIGHT);

// draw all stars from stars arr
        /*context2.clearRect(0, 0, CANVASWIDTH, CANVASHEIGHT);
        for (let starr of starsArr) {
            context2.drawImage(starr.img, starr.x, starr.y);
        }

        context2.filter = 'opacity(40%) saturate(30%) ';
        */

    }
    else { //if loading !== 0 TODO
        if (isLoading === 1) {
            context4.clearRect(0, 0, CANVASWIDTH, CANVASHEIGHT);
            context4.fillStyle = "rgba(255, 255, 255, " + loadingCounter / 100 + ")";
            context4.fillRect(0, 0, CANVASWIDTH, CANVASHEIGHT);
            loadingCounter += 1;
            if (loadingCounter === 100) {
                createLevel();
                isLoading = 2;
            }
        }
        else if (isLoading === 2) {
            context4.clearRect(0, 0, CANVASWIDTH, CANVASHEIGHT);
            context4.fillStyle = "rgba(255, 255, 255, " + loadingCounter / 100 + ")";
            context4.fillRect(0, 0, CANVASWIDTH, CANVASHEIGHT);
            loadingCounter -= 2;
            if (loadingCounter === 0) {
                isLoading = 0;
            }
        }
    }
    requestAnimFrame(update);
}


context1.fillStyle = "#000000";
// context1.filter = 'hue-rotate(50deg)';
context1.fillRect(0, 0, CANVASWIDTH, CANVASHEIGHT);


let ship = new playerShip('res/ship');
setTimeout(update, 200);
setTimeout( createLevel, 100);

// TODO: check patterns for moving, enemies, bullets, points, levels