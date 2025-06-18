import { NeuralNetwork } from "./neural_network.js";

function decideAction(inputs, genome) {
    const [w1, w2, w3, b] = genome;
    const sum = inputs[0]*w1 + inputs[1]*w2 + inputs[2]*w3 + b;

    if (sum > 0.5) return "jump";
    if (sum < -0.5) return "duck";
    return "none";
}

const populationSize = 50;
let population = [];

for (let i = 0; i < populationSize; i++) {
    const genome = Array.from({ length: 4 }, () => Math.random() * 2 - 1);
    population.push({ genome, fitness: 0 });
}

population.sort((a, b) => b.fitness - a.fitness);
const topPerformers = population.slice(0, populationSize / 4);

function crossover(parent1, parent2) {
    const child = [];
    for (let i = 0; i < parent1.length; i++) {
        child.push(Math.random() < 0.5 ? parent1[i] : parent2[i]);
    }
    return child;
}

function mutate(genome, mutationRate = 0.1) {
    return genome.map(w => (Math.random() < mutationRate ? w + Math.random() * 0.2 - 0.1 : w));
}

const newPopulation = [];
while (newPopulation.length < populationSize) {
    const parent1 = randomChoice(topPerformers).genome;
    const parent2 = randomChoice(topPerformers).genome;
    const child = mutate(crossover(parent1, parent2));
    newPopulation.push({ genome: child, fitness: 0 });
}
population = newPopulation;
