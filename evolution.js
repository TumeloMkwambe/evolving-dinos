import { Network } from "./neural_network.js";

export class Genome {
    constructor(network) {
        this.network = network;
        this.fitness = 0;
    }

    clone() {
        const new_network = this.network.copy();
        return new Genome(new_network);
    }
}

export class GeneticAlgorithm {
    constructor(population_size, input_size, output_size) {
        this.population_size = population_size;
        this.input_size = input_size;
        this.output_size = output_size;
        this.population = this.initializePopulation();
    }

    initializePopulation() {
        const population = [];
        for (let i = 0; i < this.population_size; i++) {
            const net = new Network();
            net.addLayer(this.input_size, "relu");
            net.addLayer(64, "relu");
            net.addLayer(32, "relu");
            net.addLayer(16, "relu");
            net.addLayer(this.output_size, "softmax");
            population.push(new Genome(net));
        }
        return population;
    }

    evolve() {
        this.population.sort((a, b) => b.fitness - a.fitness);
        const top = this.population.slice(0, Math.floor(this.population_size / 2));
        const children = [];

        while (children.length < this.population_size) {
            const parentA = this.selectParent(top);
            const parentB = this.selectParent(top);

            const child = this.crossover(parentA, parentB);
            this.mutate(child.network);
            children.push(child);
        }

        this.population = children;
    }

    selectParent(topGenomes) {
        return topGenomes[Math.floor(Math.random() * topGenomes.length)].clone();
    }

    crossover(parentA, parentB) {
        const child = parentA.clone();

        for (let i = 0; i < child.network.Parameters.length; i++) {
            const weight_A = parentA.network.Parameters[i].weights;
            const weight_B = parentB.network.Parameters[i].weights;
            const bias_A = parentA.network.Parameters[i].bias;
            const bias_B = parentB.network.Parameters[i].bias;

            const new_weights = weight_A.map((row, r) => row.map((val, c) =>
                Math.random() < 0.5 ? val : weight_B[r][c]
            ));
            const new_bias = bias_A.map((row, r) => row.map((val, c) =>
                Math.random() < 0.5 ? val : bias_B[r][c]
            ));

            child.network.Parameters[i].weights = new_weights;
            child.network.Parameters[i].bias = new_bias;
        }

        return child;
    }

    mutate(network, mutation_rate = 0.1) {
        for (const param of network.Parameters) {
            for (let i = 0; i < param.weights.length; i++) {
                for (let j = 0; j < param.weights[0].length; j++) {
                    if (Math.random() < mutation_rate) {
                        param.weights[i][j] += (Math.random() * 2 - 1) * 0.5;
                    }
                }
            }

            for (let j = 0; j < param.bias[0].length; j++) {
                if (Math.random() < mutation_rate) {
                    param.bias[0][j] += (Math.random() * 2 - 1) * 0.5;
                }
            }
        }
    }
}
