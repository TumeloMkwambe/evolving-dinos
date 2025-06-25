// Genetic Algorithm Implementation

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
            net.addLayer(10, "relu");
            net.addLayer(10, "relu");
            net.addLayer(16, "relu")
            net.addLayer(this.output_size, "softmax");
            population.push(new Genome(net));
        }
        return population;
    }

    evolve() {
        this.population.sort((a, b) => b.fitness - a.fitness);
        const top = this.population.slice(0, Math.floor(this.population_size / 4));
        const children = [];

        while (children.length < this.population_size - 1) {
            const parentA = this.selectParent(top);
            const parentB = this.selectParent(top);

            const child = this.crossover(parentA, parentB);
            this.mutate(child.network);
            children.push(child);
        }
        children.push(top[0]);

        this.population = children;
    }

    selectParent(topGenomes) {
        const fitness_sum = topGenomes.reduce((sum, genome) => sum + genome.fitness, 0);
        const threshold = Math.random() * fitness_sum;
        let runningSum = 0;

        for (let genome of topGenomes) {
            runningSum += genome.fitness;
            if (runningSum >= threshold) {
                return genome.clone();
            }
        }

        return topGenomes[topGenomes.length - 1].clone();
    }

    crossover(parentA, parentB) {
        const child = parentA.clone();

        for (let i = 0; i < child.network.Parameters.length; i++) {
            const weight_A = parentA.network.Parameters[i].weights;
            const weight_B = parentB.network.Parameters[i].weights;
            const bias_A = parentA.network.Parameters[i].bias;
            const bias_B = parentB.network.Parameters[i].bias;

            const new_weights = weight_A.map((row, row_index) => row.map((value, col_index) =>
                Math.random() < 0.5 ? value : weight_B[row_index][col_index]
            ));
            const new_bias = bias_A.map((row, row_index) => row.map((value, col_index) =>
                Math.random() < 0.5 ? value : bias_B[row_index][col_index]
            ));

            child.network.Parameters[i].weights = new_weights;
            child.network.Parameters[i].bias = new_bias;
        }

        return child;
    }

    mutate(network, mutation_rate = 0.2) {
        for (const parameters of network.Parameters) {
            for (let i = 0; i < parameters.weights.length; i++) {
                for (let j = 0; j < parameters.weights[0].length; j++) {
                    if (Math.random() < mutation_rate) {
                        parameters.weights[i][j] += (Math.random() * 2 - 1) * 0.5;
                    }
                }
            }

            for (let j = 0; j < parameters.bias[0].length; j++) {
                if (Math.random() < mutation_rate) {
                    parameters.bias[0][j] += (Math.random() * 2 - 1) * 0.5;
                }
            }
        }
    }
}
