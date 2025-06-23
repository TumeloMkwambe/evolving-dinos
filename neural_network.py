import numpy as np
import math

class Layer:
    def __init__(self, num_nodes, activation):
        self.num_nodes = num_nodes
        self.nodes = np.zeros((1, num_nodes))
        self.deltas = np.zeros((1, num_nodes))
        self.activation = self.setActivation(activation)

    def setActivation(self, activation):
        if activation == "sigmoid":
            return np.vectorize(lambda z: 1 if z > 24 else 0 if z < -24 else 1 / (1 + math.exp(-z)))
        elif activation == "softmax":
            return lambda z: np.exp(z) / np.sum(np.exp(z))
        elif activation == "hyperbolic":
            return np.vectorize(lambda z: (math.exp(z) - math.exp(-z)) / (math.exp(z) + math.exp(-z)))
        elif activation == "relu":
            return np.vectorize(lambda z: z if z > 0 else 0)
        elif activation == "threshold":
            return np.vectorize(lambda z: 1 if z > 0 else 0)
        elif activation == "linear":
            return np.vectorize(lambda z: z)

class Parameters:
    def __init__(self, first_layer_nodes, second_layer_nodes):
        self.weights = np.random.uniform(-1, 1, (first_layer_nodes, second_layer_nodes))
        self.bias = np.random.uniform(-1, 1, second_layer_nodes).reshape(1, second_layer_nodes)
        self.weight_gradients = np.zeros((first_layer_nodes, second_layer_nodes))
        self.bias_gradients = np.zeros(second_layer_nodes).reshape(1, second_layer_nodes)

class Network:
    def __init__(self, gd_method):
        self.Layers = np.empty(0, dtype=object)
        self.Parameters = np.empty(0, dtype=object)
        self.gd_method = gd_method

    def addLayer(self, num_nodes, activation):
        layer = Layer(num_nodes, activation)
        self.Layers = np.append(self.Layers, layer)
        if(len(self.Layers) > 1):
            parameters = Parameters(self.Layers[len(self.Layers) - 2].num_nodes, self.Layers[len(self.Layers) - 1].num_nodes)
            self.Parameters = np.append(self.Parameters, parameters)

    def feedforward(self, datapoint):
        self.Layers[0].nodes = datapoint.reshape(1, len(datapoint))
        for i in range(len(self.Layers) - 1):
            self.Layers[i+1].nodes = self.Layers[i].nodes @ self.Parameters[i].weights + self.Parameters[i].bias
            self.Layers[i+1].nodes = self.Layers[i+1].activation(self.Layers[i+1].nodes)
        return self.Layers[len(self.Layers) - 1].nodes

    # modify backpropagation to include relu, tanh, softmax
    def backpropagation(self, learning_rate, datapoint, target):
        a = self.feedforward(datapoint)
        output_layer = self.Layers[len(self.Layers) - 1]
        output_layer.deltas = (output_layer.nodes - target) * output_layer.nodes * (1 - output_layer.nodes) # delta values for output layer nodes
        for i in range(len(self.Layers) - 2, 0, -1):
            self.Layers[i].deltas = (self.Layers[i+1].deltas @ self.Parameters[i].weights.T) * self.Layers[i].nodes * (1 - self.Layers[i].nodes)
            self.Parameters[i].weights -= learning_rate * self.Layers[i].nodes.T @ self.Layers[i+1].deltas
            self.Parameters[i].bias -= learning_rate * self.Layers[i+1].deltas
        self.Parameters[0].weights -= learning_rate * self.Layers[0].nodes.T @ self.Layers[1].deltas
        self.Parameters[0].bias -= learning_rate * self.Layers[1].deltas

    def learning(self, dataset, targets, learning_rate, max_epoch):
        epoch = 0
        while epoch < max_epoch:
            for i in range(len(dataset)):
                self.backpropagation(learning_rate, dataset[i], targets[i])
            epoch += 1
    
    def predictions(self, dataset, targets):
        predictions = np.zeros((targets.shape[0], targets.shape[1]))
        for i in range(len(targets)):
            output = self.feedforward(dataset[i]).reshape(targets.shape[1],)
            index = output.argmax()
            output = np.zeros_like(output)
            output[index] = 1
            predictions[i] = output
        return predictions
