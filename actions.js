// Interface for executing actions guided by the neural network AFK.

export class Actions{
    constructor(dino, network){
        this.dino = dino;
        this.network = network;
        this.input = [];
    }

    get_obstacle_positions(array){
        let positions = [];
        for (let i = 0; i < array.length; i++){
            positions.push([array[i].asset_x, array[i].asset_y]);
        }
        return positions;
    }

    argmax (array){
        let index = 0;
        let max = 0;
        for (let i = 1; i < array.length; i++){
            if(array[index] > max){
                max = array[max];
                index = i;
            }
        }
        return index;
    }

    construct_input(canvas, obstacle_array, speed){
        let obstacle_positions = this.get_obstacle_positions(obstacle_array);
        const dino_x = this.dino.asset_x;
        const dino_y = this.dino.asset_y;

        let nearest_obstacle = [1000, 1000];
        if(obstacle_positions.length > 0){
            for (let obstacle of obstacle_positions){
                if (obstacle[0] > dino_x) {
                    nearest_obstacle = obstacle;
                    break;
                }
            }
        }

        const distance_x = nearest_obstacle[0] - dino_x;
        const distance_y = nearest_obstacle[1] - dino_y;

        this.input = [distance_x / canvas.width, distance_y / canvas.width, speed];
    }

    select_action(canvas, obstacle_array, speed){
        this.construct_input(canvas, obstacle_array, speed);
        const output = this.network.feedforward(this.input)[0];
        const action = this.argmax(output);

        if (action === 0) {
            // do nothing
        } else if (action === 1) {
            this.dino.duck();
        } else {
            this.dino.jump();
        }
    }
}