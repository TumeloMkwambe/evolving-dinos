export class Layer {
    constructor(num_nodes, activation) {
        this.num_nodes = num_nodes; // number of nodes (neurons) in layer
        this.nodes = Array.from({ length: 1 }, () => Array(num_nodes).fill(0)); // array of shape 1xN (N=number of nodes)
        this.activation = activation; // activation function associated with layer
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
        } else {
            throw new Error(`Unknown activation function: ${funcName}`);
        }
    }

}

export class Parameters {
    constructor(firstLayerNodes, secondLayerNodes) {
        this.weights = this.randomMatrix(firstLayerNodes, secondLayerNodes, -1, 1); // matrix of weights between two layers
        this.bias = [this.randomArray(secondLayerNodes, -1, 1)]; // array of bias values

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
        this.Layers = []; // array of layers in neural network
        this.Parameters = []; // parameters (weights of edges) between layers in neural networks
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

    matMul(A, B) {
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

    addMatrices(A, B) {
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

    feedforward(datapoint) {
        this.Layers[0].nodes = [datapoint];

        for (let i = 0; i < this.Layers.length - 1; i++) {
            const input = this.Layers[i].nodes;
            const weights = this.Parameters[i].weights;
            const bias = this.Parameters[i].bias;
            const z = this.addMatrices(this.matMul(input, weights), bias);
            console.log(`Z: ${z}`);
            this.Layers[i + 1].nodes = this.Layers[i + 1].applyActivation(z, this.Layers[i + 1].activation);
            console.log(`Output: ${this.Layers[i+1].nodes}`);
        }

        return this.Layers[this.Layers.length - 1].nodes;
    }
}
