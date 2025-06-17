const canvas = document.querySelector("canvas");
const context = canvas.getContext("2d");

const prepareCanvas = () => {
    context.fillStyle = "#F7F7F7";
    context.fillRect(0, 0, canvas.width, canvas.height);
    canvas.width = window.innerWidth - window.innerWidth / 64;
    canvas.height = window.innerHeight / 4;
}

prepareCanvas()
window.addEventListener('resize', prepareCanvas)

const dead = new Image();
const cactus_3 = new Image()
const left_run = new Image();
const cactus_1 = new Image();
const right_run = new Image();
const left_duck = new Image();
const right_duck = new Image();
const pterodactyl = new Image();

right_run.src = "../Assets/right_run.webp";
left_run.src = "../Assets/left_run.webp";
cactus_1.src = "../Assets/1_cactus.webp";
cactus_3.src = "../Assets/3_cactus.webp";
right_duck.src = "../Assets/right_duck.webp";
left_duck.src = "../Assets/left_duck.webp";
dead.src = "../Assets/dead.webp";
pterodactyl.src = "../Assets/pterodactyl.png";

class Asset {
    constructor(x, images_array){
        this.ground_y = canvas.height / 2; // y coordinate of the world ground
        this.asset_x = x; // x coordinate of the asset
        this.asset_y = this.ground_y; // y coordinate of the asset
        this.asset_width = 75; // width of world asset (dinosaur, cactus, ...)
        this.asset_height = 75; // height of world asset
        this.images_array = images_array; // array of images of asset
        this.images_loaded = false; // checks if asset images are loaded
    }

    prepareImages(){
        let imagesLoaded = 0;
        this.images_array.forEach(img => {
            img.onload = () => {
                imagesLoaded++;
                if (imagesLoaded === this.images_array.length){
                    this.images_loaded = true;
                }
            };
        });
    }
}

class Dinosaur extends Asset{
    constructor(){
        super(canvas.width / 4, [right_run, left_run, left_duck, right_duck, dead]);
        this.isRunning = false; // checks if dinosaur is still running
        this.isJumping = false; // checks if the dinosaur is jumping
        this.isDucking = false; // checks if the dinosaur is ducking
        this.isDead = false;
        this.velocity_y = 0; // vertical veolcity of dinosaur
        this.gravity = 0.3; // amount added to velocity_y at each frame
        this.jumpStrength = -10; // initial velocity when dinosaur starts jump (canvas renders top to bottom hence initial velocity is negative)
        this.frameCounter = 0;
        this.currentFrame = 0;
        this.averageCactusSpeed = 5;
    }
  
    jump(){
        if (!this.isJumping){
            this.isJumping = true;
            this.velocity_y = this.jumpStrength;
        }
    }
  
    update(){
        if(this.isJumping){
            this.velocity_y += this.gravity;
            this.asset_y += this.velocity_y;

            if(this.asset_y >= this.ground_y){
                this.asset_y = this.ground_y;
                this.isJumping = false;
                this.velocity_y = 0;
            }
        }
    }
  
    draw(){
        if(this.isRunning){
            this.frameCounter++;
            const averageCactusSpeed = this.averageCactusSpeed || 5;
            const animationRate = Math.max(2, Math.floor(50 / averageCactusSpeed));
            if(this.frameCounter % (animationRate + 10) === 0){
                this.currentFrame = 1 - this.currentFrame;
            }
        }
        if(this.isDead){
            context.drawImage(dead, this.asset_x, this.asset_y, this.asset_width, this.asset_height);
        }
        else if(this.isDucking){
            context.drawImage(this.currentFrame ? left_duck : right_duck, this.asset_x, this.asset_y, this.asset_width, this.asset_height);
        }
        else{
            context.drawImage(this.currentFrame ? left_run : right_run, this.asset_x, this.asset_y, this.asset_width, this.asset_height);
        }
    }
}

class Cactus extends Asset {
    constructor(cactus, x, width){
        super(x, [cactus]);
        this.isMoving = true;
        this.speed = 5;
        this.asset_height = 75;
        this.asset_width = width;
    }
  
    update(){
        if(this.isMoving){
            this.asset_x -= this.speed;
            this.isOutOfScreen = this.asset_x + this.asset_width < 0;

        }
    }
  
    draw(){
        context.drawImage(this.images_array[0], this.asset_x, this.asset_y, this.asset_width, this.asset_height);
    }
}


class Pterodactyl extends Asset {
    constructor(cactus, x, y, width){
        super(x, [cactus]);
        this.isMoving = true;
        this.speed = 5;
        this.asset_height = 75;
        this.asset_width = width;
        this.asset_y = y;
    }
  
    update(){
        if(this.isMoving){
            this.asset_x -= this.speed;
            if(this.asset_x + this.asset_width < 0){
                this.asset_x = canvas.width;
            }
        }
    }
  
    draw(){
        context.drawImage(this.images_array[0], this.asset_x, this.asset_y, this.asset_width, this.asset_height);
    }
}

class Controls {
    constructor(dinosaur){
        this.dinosaur = dinosaur;

        window.addEventListener('keydown', (e) => {
            if (e.key === " ") {
                if (this.dinosaur.isDead) {
                    location.reload();
                } 
                else if (!this.dinosaur.isRunning) {
                    this.dinosaur.isRunning = true;
                }
                else if (this.dinosaur.isRunning && !this.dinosaur.isJumping) {
                    this.dinosaur.jump();
                }
            }
            if (e.key === "ArrowDown") { 
                this.dinosaur.isDucking = true;
            }
        });

        window.addEventListener('keyup', (e) => {
            if (e.key === "ArrowDown") { 
                this.dinosaur.isDucking = false;
            }
        });
    }
}

class Game{
    constructor(dinosaur){
        this.dinosaur = dinosaur;
        this.cacti = [];
        this.frameCounter = 0;
    }

    checkCollision = () => {
        this.cacti.forEach( cactus => {
            const distance_x = Math.abs(dinosaur.asset_x - cactus.asset_x);
            const distance_y = Math.abs(dinosaur.asset_y - cactus.asset_y);
            if (
                distance_x <= 50 && distance_y <= 50
            ) {
                this.dinosaur.isRunning = false;
                this.dinosaur.isDead = true;
            }
        });
    }

    getAverageCactusSpeed = () => {
        const total = this.cacti.reduce((sum, c) => sum + c.speed, 0);
        return total / this.cacti.length || 5;
    };

    addCacti = () => {
        if (this.frameCounter % 100 === 0 && this.frameCounter !== 0) {
            if (Math.random() < 0.5) {
                console.log("Add Cactus!");
                const newCactus = new Cactus(
                    cactus_1, 
                    canvas.width * (1 + Math.random()), 
                    50
                );
                newCactus.speed = this.getAverageCactusSpeed();
                newCactus.prepareImages();
                this.cacti.push(newCactus);
            }
        }
        console.log(`Cacti: ${this.cacti}`);
    }

    gameLoop = () => {
        context.fillStyle = "#F7F7F7";
        context.fillRect(0, 0, canvas.width, canvas.height);

        if (this.dinosaur.isRunning){
            this.checkCollision();

            console.log(`Frame Counter: ${this.frameCounter}.`);
            if (this.frameCounter % 500 === 0 && this.frameCounter !== 0) {
                this.cacti.forEach((cactus) => {
                    cactus.speed += 1;
                    this.dinosaur.averageCactusSpeed = this.getAverageCactusSpeed();
                });
            }

            this.addCacti();

            this.dinosaur.update();
            this.cacti.forEach( cactus => {
                cactus.update();
            });
            this.cacti = this.cacti.filter(cactus => !cactus.isOutOfScreen);

            this.frameCounter++;
        }

        this.cacti.forEach( cactus => {
            cactus.draw();
        });
        this.dinosaur.draw();
        requestAnimationFrame(this.gameLoop.bind(this)); 
    }
}

const dinosaur = new Dinosaur();
//const cacti_1 = new Cactus(cactus_1, canvas.width / 2, 50);
//const cacti_3 = new Cactus(cactus_3, canvas.width * 0.75, 100);
//const ptero = new Pterodactyl(pterodactyl, canvas.width, canvas.height * 0.3, 75);

//const cacti = [cacti_1];
dinosaur.prepareImages();
//cacti.forEach( cactus => {
//    cactus.prepareImages();
//});


const game = new Game(dinosaur);
new Controls(dinosaur);
game.gameLoop();