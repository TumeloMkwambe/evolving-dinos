const canvas = document.querySelector("canvas");
const context = canvas.getContext("2d");

const prepareCanvas = () => {
    context.fillStyle = "#F7F7F7";
    context.fillRect(0, 0, canvas.width, canvas.height);
    canvas.width = window.innerWidth - window.innerWidth / 64;
    canvas.height = window.innerHeight / 2;
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
const ground = new Image();

right_run.src = "../Assets/right_run.webp";
left_run.src = "../Assets/left_run.webp";
cactus_1.src = "../Assets/1_cactus.webp";
cactus_3.src = "../Assets/3_cactus.webp";
right_duck.src = "../Assets/right_duck.webp";
left_duck.src = "../Assets/left_duck.webp";
dead.src = "../Assets/dead.webp";
pterodactyl.src = "../Assets/pterodactyl.png";
ground.src = "../Assets/ground.png";

class Asset {
    constructor(x, y, width, height, speed, images_array){
        this.ground_y = canvas.height / 2;
        this.asset_x = x;
        this.asset_y = y;
        this.asset_width = width;
        this.asset_height = height;
        this.speed = speed;
        this.images_array = images_array;
        this.images_loaded = false;
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

class Dinosaur extends Asset {
    constructor(x, y, width, height, speed, images_array){
        super(x, y, width, height, speed, images_array);
        this.isRunning = false;
        this.isJumping = false;
        this.isDucking = false;
        this.isDead = false;

        this.velocity_y = 0;
        this.gravity = 0.7;
        this.jumpStrength = -17;

        this.frameCounter = 0;
        this.currentFrame = 0;
    }
  
    jump(){
        if (!this.isJumping){
            this.isJumping = true;
            this.velocity_y = this.jumpStrength;
        }
    }

    duck(){
        if (!this.isDucking){
            this.isDucking = true;
            this.asset_y += 1;
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
            const animationRate = Math.max(2, Math.floor(50 / this.speed));
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

class Obstacle extends Asset {
    constructor(x, y, width, height, speed, images_array){
        super(x, y, width, height, speed, images_array);
        this.isMoving = true;
        this.isOutOfScreen = false;
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

class Ground extends Asset {
    constructor(x, y, width, height, speed, images_array){
        super(x, y, width, height, speed, images_array);
        this.isMoving = true;
        this.prepareImages();
    }

    update(){
        if (this.isMoving) {
            this.asset_x -= this.speed;

            if (this.asset_x + this.asset_width <= 0) {
                this.asset_x += this.asset_width * 2;
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
                this.dinosaur.duck();
            }
        });

        window.addEventListener('keyup', (e) => {
            if (e.key === "ArrowDown") { 
                this.dinosaur.isDucking = false;
            }
        });
    }
}

class Game {
    constructor(dinosaur){
        this.ground_array = [
            new Ground(0, canvas.height / 1.62, canvas.width, 25, 5, [ground]), 
            new Ground(canvas.width, canvas.height / 1.62, canvas.width, 25, 5, [ground])];
        this.dinosaur = dinosaur;
        this.obstacle_array = [];
        this.frameCounter = 0;
        this.gameSpeed = 5;
    }

    checkCollision = () => {
        this.obstacle_array.forEach( obstacle => {
            const distance_x = Math.abs(dinosaur.asset_x - obstacle.asset_x);
            const distance_y = Math.abs(dinosaur.asset_y - obstacle.asset_y);
            if (
                distance_x <= 50 && distance_y <= 50
            ) {
                this.dinosaur.isRunning = false;
                this.dinosaur.isDead = true;
            }
        });
    }

    getGameSpeed = () => {
        const total = this.obstacle_array.reduce((sum, c) => sum + c.speed, 0);
        return total / this.obstacle_array.length || 5;
    };

    addObstacle = () => {
        if (this.frameCounter % 100 !== 0) return;

        const minSpacing = 300;
        const lastObstacle = this.obstacle_array[this.obstacle_array.length - 1];

        if (lastObstacle && lastObstacle.asset_x + lastObstacle.asset_width > canvas.width - minSpacing) {
            return;
        }

        const rand = Math.random();
        let newObstacle;

        if (rand < 0.5) {
            newObstacle = new Obstacle(canvas.width + Math.random() * 100, canvas.height / 2, 50, 75, this.gameSpeed, [cactus_1]);
        } else if (rand < 0.8) {
            newObstacle = new Obstacle(canvas.width + Math.random() * 100, canvas.height / 2, 100, 75, this.gameSpeed, [cactus_3]);
        } else {
            newObstacle = new Obstacle(canvas.width + Math.random() * 100, canvas.height * 0.3 + Math.random() * 20, 75, 50, this.gameSpeed, [pterodactyl]);
        }

        newObstacle.speed = this.gameSpeed;
        newObstacle.prepareImages();
        this.obstacle_array.push(newObstacle);
    };

    gameLoop = () => {
        context.fillStyle = "#F7F7F7";
        context.fillRect(0, 0, canvas.width, canvas.height);

        if (this.dinosaur.isRunning){
            this.checkCollision();

            if (this.frameCounter % 500 === 0 && this.frameCounter !== 0) {
                this.gameSpeed += 1;
                this.obstacle_array.forEach( obstacle => {
                    obstacle.speed = this.gameSpeed;
                });
                this.dinosaur.speed = this.gameSpeed;
            }

            this.ground_array.forEach(ground => {
                ground.speed = this.gameSpeed;
                ground.update();
            });

            this.dinosaur.update();

            this.addObstacle();
            this.obstacle_array.forEach( obstacle => {
                obstacle.update();
            });
            this.obstacle_array = this.obstacle_array.filter(obstacle => !obstacle.isOutOfScreen);

            this.frameCounter++;
        }

        this.ground_array.forEach(ground => {
            ground.draw();
        });

        this.obstacle_array.forEach( obstacle => {
            obstacle.draw();
        });
        this.dinosaur.draw();
        requestAnimationFrame(this.gameLoop.bind(this)); 
    }
}


const dinosaur = new Dinosaur(canvas.width / 4, canvas.height / 2, 75, 75, 5, [left_duck, left_run, right_duck, right_run, dead]);
dinosaur.prepareImages();
const game = new Game(dinosaur);
new Controls(dinosaur);
game.gameLoop();
