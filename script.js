import { Asset } from "./asset.js";
import { Actions } from "./actions.js";
import { GeneticAlgorithm } from "./evolution.js";

// -------------------------
// CANVAS INITIALIZATION
// -------------------------

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

// -------------------------
// IMAGE PROCESSING
// -------------------------

const imageAssets = {
    dead: new Image(),
    cactus_3: new Image(),
    left_run: new Image(),
    cactus_1: new Image(),
    right_run: new Image(),
    left_duck: new Image(),
    right_duck: new Image(),
    pterodactyl: new Image(),
    ground: new Image()
};

imageAssets.dead.src = "../Assets/dead.webp";
imageAssets.cactus_3.src = "../Assets/3_cactus.webp";
imageAssets.left_run.src = "../Assets/left_run.webp";
imageAssets.cactus_1.src = "../Assets/1_cactus.webp";
imageAssets.right_run.src = "../Assets/right_run.webp";
imageAssets.left_duck.src = "../Assets/left_duck.webp";
imageAssets.right_duck.src = "../Assets/right_duck.webp";
imageAssets.pterodactyl.src = "../Assets/pterodactyl.png";
imageAssets.ground.src = "../Assets/ground.png";

// -------------------------
// GAME CLASSES
// -------------------------

class Dinosaur extends Asset {
    constructor(x, y, width, height, speed, images_array){
        super(canvas, x, y, width, height, speed, images_array);
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
            context.drawImage(imageAssets.dead, this.asset_x, this.asset_y, this.asset_width, this.asset_height);
        }
        else if(this.isDucking){
            context.drawImage(this.currentFrame ? imageAssets.left_duck : imageAssets.right_duck, this.asset_x, this.asset_y, this.asset_width, this.asset_height);
        }
        else{
            context.drawImage(this.currentFrame ? imageAssets.left_run : imageAssets.right_run, this.asset_x, this.asset_y, this.asset_width, this.asset_height);
        }
    }
}

class Obstacle extends Asset {
    constructor(x, y, width, height, speed, images_array){
        super(canvas, x, y, width, height, speed, images_array);
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
        super(canvas, x, y, width, height, speed, images_array);
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

// -------------------------
// GENETIC ALGORITHM LOGIC
// -------------------------

const populationSize = 25;
const inputSize = 3;
const hiddenSize = 6;
const outputSize = 3;
const ga = new GeneticAlgorithm(populationSize, inputSize, hiddenSize, outputSize);

let generation = 0;
let dinos = [];
let actions = [];
let obstacle_array = [];
let frameCounter = 0;
let highest_frameCounter = 0;
let gameSpeed = 5;

let ground_array = [
    new Ground(0, canvas.height / 1.62, canvas.width, 25, gameSpeed, [imageAssets.ground]),
    new Ground(canvas.width, canvas.height / 1.62, canvas.width, 25, gameSpeed, [imageAssets.ground])
];

function initGeneration() {
    dinos = ga.population.map(genome => {
        const dino = new Dinosaur(canvas.width / 4, canvas.height / 2, 75, 75, gameSpeed, [
            imageAssets.left_duck, imageAssets.left_run, imageAssets.right_duck, imageAssets.right_run, imageAssets.dead
        ]);
        dino.prepareImages();
        return { dino, network: genome.network, genome };
    });
    actions = dinos.map(({ dino, network }) => new Actions(dino, network));
    obstacle_array = [];
    frameCounter = 0;
}

function checkCollision(dino) {
    return obstacle_array.some(ob => {
        const dx = Math.abs(dino.asset_x - ob.asset_x);
        const dy = Math.abs(dino.asset_y - ob.asset_y);
        return dx < 50 && dy < 50;
    });
}

function addObstacle() {
    if (frameCounter % 100 !== 0) return;
    const minSpacing = 300;
    const last = obstacle_array[obstacle_array.length - 1];
    if (last && last.asset_x + last.asset_width > canvas.width - minSpacing) return;
    const rand = Math.random();
    let newObstacle;
    if (rand < 0.5) newObstacle = new Obstacle(canvas.width + Math.random() * 100, canvas.height / 2, 50, 75, gameSpeed, [imageAssets.cactus_1]);
    else if (rand < 0.8) newObstacle = new Obstacle(canvas.width + Math.random() * 100, canvas.height / 2, 100, 75, gameSpeed, [imageAssets.cactus_3]);
    else newObstacle = new Obstacle(canvas.width + Math.random() * 100, canvas.height * 0.3 + Math.random() * 20, 75, 50, gameSpeed, [imageAssets.pterodactyl]);
    newObstacle.prepareImages();
    obstacle_array.push(newObstacle);
}

function update() {
    frameCounter++;
    ground_array.forEach(g => { g.speed = gameSpeed; g.update(); });
    addObstacle();
    obstacle_array.forEach(o => o.update());
    obstacle_array = obstacle_array.filter(obstacle => !obstacle.isOutOfScreen);

    dinos.forEach((dinoObj, index) => {
        const dino = dinoObj.dino;
        if (!dino.isDead) {
            dino.update();
            actions[index].select_action(canvas, obstacle_array, gameSpeed);
            if (checkCollision(dino)) {
                dino.isDead = true;
                dinoObj.genome.fitness = frameCounter;
            }
        }
    });

    if (frameCounter % 500 === 0) gameSpeed++;
    if (dinos.every(d => d.dino.isDead)) {
        if(frameCounter > highest_frameCounter){
            highest_frameCounter = frameCounter;
        }
        generation++;
        ga.evolve();
        initGeneration();
        gameSpeed = 5;
        frameCounter = 0;
    }
}

function draw() {
    context.fillStyle = "#F7F7F7";
    context.fillRect(0, 0, canvas.width, canvas.height);
    ground_array.forEach(g => g.draw());
    obstacle_array.forEach(o => o.draw());
    dinos.forEach(d => d.dino.draw());
    context.fillStyle = "black";
    context.fillText(`Frame Count: ${frameCounter}`, 30, 20);
    context.fillText(`Generation: ${generation}`, 30, 40);
    context.fillText(`Alive: ${dinos.filter(d => !d.dino.isDead).length}`, 30, 60);
    context.fillText(`Dead: ${populationSize - dinos.filter(d => !d.dino.isDead).length}`, 30, 80);
    context.fillText(`Highest Frame Count: ${highest_frameCounter}`, 30, 100);
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

initGeneration();
gameLoop();
