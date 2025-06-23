// Define game world and gameplay with evolution.

import { Ground, Obstacle, Dinosaur } from "./assets.js";
import { Actions } from "./actions.js";
import { GeneticAlgorithm } from "./evolution.js";

const canvas = document.querySelector("canvas");
const context = canvas.getContext("2d");

const prepareCanvas = () => {
    context.fillRect(0, 0, canvas.width, canvas.height);
    canvas.width = window.innerWidth - window.innerWidth / 64;
    canvas.height = window.innerHeight / 2;
}

prepareCanvas()
window.addEventListener('resize', prepareCanvas)

const population_size = 25;
const input_size = 3;
const output_size = 3;

let generation = 1;
let dino_objects = [];
let actions = [];
let obstacle_array = [];
let frame_counter = 0;
let highest_frame_counter = 0;
let game_speed = 5;
const genetic_algorithm = new GeneticAlgorithm(population_size, input_size, output_size);


let ground_array = [
    new Ground(canvas, context, 0, canvas.height / 1.62, canvas.width, 25, game_speed),
    new Ground(canvas, context, canvas.width, canvas.height / 1.62, canvas.width, 25, game_speed)
];

function initGeneration() {
    obstacle_array = [];
    frame_counter = 0;

    dino_objects = genetic_algorithm.population.map(genome => {
        const dino = new Dinosaur(canvas, context, canvas.width / 4, canvas.height / 2, 75, 75, game_speed);
        return { dino, network: genome.network, genome };
    });

    actions = dino_objects.map(({ dino, network }) => new Actions(dino, network));
}

function checkCollision(dino) {
    return obstacle_array.some(obstacle => {
        const distance_x = Math.abs(dino.asset_x - obstacle.asset_x);
        const distance_y = Math.abs(dino.asset_y - obstacle.asset_y);
        return distance_x < 50 && distance_y < 50;
    });
}

function addObstacle() {
    if (frame_counter % 100 !== 0) return;
    const min_spacing = 300;
    const last = obstacle_array[obstacle_array.length - 1];

    if (last && last.asset_x + last.asset_width > canvas.width - min_spacing) return;

    const random = Math.random();
    let new_obstacle;

    if (random < 0.5){
        new_obstacle = new Obstacle(canvas, context, canvas.width + Math.random() * 100, canvas.height / 2, 50, 75, game_speed, "one_cactus");
    }
    else if (random < 0.8){
        new_obstacle = new Obstacle(canvas, context, canvas.width + Math.random() * 100, canvas.height / 2, 100, 75, game_speed, "three_cactus");
    }
    else{
        new_obstacle = new Obstacle(canvas, context, canvas.width + Math.random() * 100, canvas.height * 0.3 + Math.random() * 20, 75, 50, game_speed, "pterodactyl");
    }

    // new_obstacle.prepareImages();
    obstacle_array.push(new_obstacle);
}

function update() {
    frame_counter++;
    if (frame_counter % 500 === 0){
        game_speed++;
    }
    
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

context.fillStyle = "white";
context.fillText(`SPACE ?`, canvas.width / 2, canvas.height / 2);

let gameTime = false;

window.addEventListener('keydown', (e) => {
    if (e.key === " " && !gameTime) {
        gameTime = true;
        initGeneration();
        requestAnimationFrame(gameLoop);
    }
});