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
        this.isRunning = true;
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

const population_size = 25;
const input_size = 3;
const output_size = 3;

let generation = 0;
let dino_objects = [];
let actions = [];
let obstacle_array = [];
let frame_counter = 0;
let highest_frame_counter = 0;
let game_speed = 5;
const genetic_algorithm = new GeneticAlgorithm(population_size, input_size, output_size);


let ground_array = [
    new Ground(0, canvas.height / 1.62, canvas.width, 25, game_speed, [imageAssets.ground]),
    new Ground(canvas.width, canvas.height / 1.62, canvas.width, 25, game_speed, [imageAssets.ground])
];

function initGeneration() {
    dino_objects = genetic_algorithm.population.map(genome => {
        const dino = new Dinosaur(canvas.width / 4, canvas.height / 2, 75, 75, game_speed, [
            imageAssets.left_duck, imageAssets.left_run, imageAssets.right_duck, imageAssets.right_run, imageAssets.dead
        ]);
        dino.prepareImages();
        return { dino, network: genome.network, genome };
    });
    actions = dino_objects.map(({ dino, network }) => new Actions(dino, network));
    obstacle_array = [];
    frame_counter = 0;
}

function checkCollision(dino) {
    return obstacle_array.some(obstacle => {
        const dx = Math.abs(dino.asset_x - obstacle.asset_x);
        const dy = Math.abs(dino.asset_y - obstacle.asset_y);
        return dx < 50 && dy < 50;
    });
}

function addObstacle() {
    if (frame_counter % 100 !== 0) return;
    const min_spacing = 300;
    const last = obstacle_array[obstacle_array.length - 1];
    if (last && last.asset_x + last.asset_width > canvas.width - min_spacing) return;
    const rand = Math.random();
    let new_obstacle;
    if (rand < 0.5) new_obstacle = new Obstacle(canvas.width + Math.random() * 100, canvas.height / 2, 50, 75, game_speed, [imageAssets.cactus_1]);
    else if (rand < 0.8) new_obstacle = new Obstacle(canvas.width + Math.random() * 100, canvas.height / 2, 100, 75, game_speed, [imageAssets.cactus_3]);
    else new_obstacle = new Obstacle(canvas.width + Math.random() * 100, canvas.height * 0.3 + Math.random() * 20, 75, 50, game_speed, [imageAssets.pterodactyl]);
    new_obstacle.prepareImages();
    obstacle_array.push(new_obstacle);
}

function update() {
    frame_counter++;
    if (frame_counter % 500 === 0) game_speed++;
    ground_array.forEach(ground => { 
        ground.speed = game_speed;
        ground.update(); 
    });
    obstacle_array.forEach(obstacle => {
        obstacle.speed = game_speed;
        obstacle.update();
    });
    addObstacle();
    obstacle_array = obstacle_array.filter(obstacle => !obstacle.isOutOfScreen);

    dino_objects.forEach((dino_object, index) => {
        const dino = dino_object.dino;
        if (!dino.isDead) {
            dino.update();
            actions[index].select_action(canvas, obstacle_array, game_speed);
            if (checkCollision(dino)) {
                dino.isDead = true;
                dino_object.genome.fitness = frame_counter;
            }
        }
    });

    if (dino_objects.every(dino_object => dino_object.dino.isDead)) {
        if(frame_counter > highest_frame_counter){
            highest_frame_counter = frame_counter;
        }
        generation++;
        genetic_algorithm.evolve();
        initGeneration();
        game_speed = 5;
        frame_counter = 0;
    }
}

function draw() {
    context.fillStyle = "#F7F7F7";
    context.fillRect(0, 0, canvas.width, canvas.height);
    ground_array.forEach(ground => ground.draw());
    obstacle_array.forEach(obstacle => obstacle.draw());

    dino_objects.forEach(dino_object => {
        if (!dino_object.dino.isDead) {
            dino_object.dino.draw();
        }
    });


    context.fillStyle = "black";
    context.fillText(`Frame Count: ${frame_counter}`, 30, 20);
    context.fillText(`Generation: ${generation}`, 30, 40);
    context.fillText(`Alive: ${dino_objects.filter(dino_object => !dino_object.dino.isDead).length}`, 30, 60);
    context.fillText(`Dead: ${population_size - dino_objects.filter(dino_object => !dino_object.dino.isDead).length}`, 30, 80);
    context.fillText(`Highest Frame Count: ${highest_frame_counter}`, 30, 100);
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

initGeneration();
gameLoop();
