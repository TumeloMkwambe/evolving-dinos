// Implementation of multilayer perceptron model building framework.

export class Layer {
    constructor(num_nodes, activation) {
        this.num_nodes = num_nodes;
        this.nodes = Array.from({ length: 1 }, () => Array(num_nodes).fill(0));
        this.activation = activation;
    }

    relu(matrix) {
        return matrix.map(row => row.map(value => Math.max(0, value)));
    }

    sigmoid(matrix) {
        return matrix.map(row => row.map(value => 1 / (1 + Math.exp(-value))));
    }

    applyActivation(matrix, funcName) {
        if (funcName === "relu") {
            return matrix.map(row => row.map(val => Math.max(0, val)));
        } else if (funcName === "sigmoid") {
            return matrix.map(row => row.map(val => 1 / (1 + Math.exp(-val))));
        } else if (funcName === "softmax") {
            return matrix.map(row => {
                const max = Math.max(...row);
                const exps = row.map(val => Math.exp(val - max));
                const sum = exps.reduce((a, b) => a + b, 0);
                return exps.map(exp => exp / sum);
            });
        } else {
            throw new Error(`Unknown activation function: ${funcName}`);
        }
    }
}

export class Parameters {
    constructor(firstLayerNodes, secondLayerNodes) {
        this.weights = this.randomMatrix(firstLayerNodes, secondLayerNodes, -1, 1);
        this.bias = [this.randomArray(secondLayerNodes, -1, 1)];

    }

    randomMatrix(rows, cols, min, max) {
        return Array.from({ length: rows }, () =>
            this.randomArray(cols, min, max)
        );
    }

    randomArray(length, min, max) {
        return Array.from({ length }, () => Math.random() * (max - min) + min);
    }
}

export class Network {
    constructor() {
        this.Layers = [];
        this.Parameters = [];
    }

    addLayer(numNodes, activationFunction) {
        const layer = new Layer(numNodes, activationFunction);
        this.Layers.push(layer);

        if (this.Layers.length > 1) {
            const prevLayer = this.Layers[this.Layers.length - 2];
            const currLayer = this.Layers[this.Layers.length - 1];
            const params = new Parameters(prevLayer.num_nodes, currLayer.num_nodes);
            this.Parameters.push(params);
        }
    }

    matrixMultiplication(A, B) {
        const rowsA = A.length;
        const colsA = A[0].length;
        const colsB = B[0].length;

        const result = Array.from({ length: rowsA }, () => Array(colsB).fill(0));

        for (let i = 0; i < rowsA; i++) {
            for (let j = 0; j < colsB; j++) {
                for (let k = 0; k < colsA; k++) {
                    result[i][j] += A[i][k] * B[k][j];
                }
            }
        }

        return result;
    }

    matrixAddition(A, B) {
        const rows = A.length;
        const cols = A[0].length;

        const result = Array.from({ length: rows }, () => Array(cols).fill(0));

        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                result[i][j] = A[i][j] + B[i][j];
            }
        }

        return result;
    }

    copy() {
        const new_network = new Network();
        for (const layer of this.Layers) {
            new_network.addLayer(layer.num_nodes, layer.activation);
        }

        for (let i = 0; i < this.Parameters.length; i++) {
            const original = this.Parameters[i];
            const clone = new Parameters(original.weights.length, original.weights[0].length);
            clone.weights = original.weights.map(row => row.slice());
            clone.bias = original.bias.map(row => row.slice());
            new_network.Parameters[i] = clone;
        }

        return new_network;
    }

    feedforward(datapoint) {
        this.Layers[0].nodes = [datapoint];

        for (let i = 0; i < this.Layers.length - 1; i++) {
            const input = this.Layers[i].nodes;
            const weights = this.Parameters[i].weights;
            const bias = this.Parameters[i].bias;
            const z = this.matrixAddition(this.matrixMultiplication(input, weights), bias);
            this.Layers[i + 1].nodes = this.Layers[i + 1].applyActivation(z, this.Layers[i + 1].activation);
        }

        return this.Layers[this.Layers.length - 1].nodes;
    }
}
