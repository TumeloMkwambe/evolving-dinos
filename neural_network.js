class Layer {
    constructor(num_nodes, activation) {
        this.nodes = Array.from({ length: 1 }, () => Array(num_nodes).fill(0));
        this.nodes = [];
        this.activation = activation;
    }
}

class Parameters {
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

    feedforward(datapoint) {
        this.Layers[0].nodes = [datapoint];

        for (let i = 0; i < this.Layers.length - 1; i++) {
            const input = this.Layers[i].nodes;
            const weights = this.Parameters[i].weights;
            const bias = this.Parameters[i].bias;

            const z = addMatrices(matMul(input, weights), bias);
            this.Layers[i + 1].nodes = applyActivation(z, this.Layers[i + 1].activation);
        }

        return this.Layers[this.Layers.length - 1].nodes;
    }
}
