// Implementation of game world components.

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


export class Asset {
    constructor(ground_y, x, y, width, height, speed){
        this.ground_y = ground_y;
        this.asset_x = x;
        this.asset_y = y;
        this.asset_width = width;
        this.asset_height = height;
        this.speed = speed;
    }
}

export class Obstacle extends Asset {
    constructor(canvas, context, x, y, width, height, speed, obstacle){
        super(canvas.height / 2, x, y, width, height, speed);
        this.context = context;
        this.isMoving = true;
        this.isOutOfScreen = false;
        this.image = this.whatObstacle(obstacle);
    }

    whatObstacle(obstacle){
        if(obstacle == "one_cactus"){
            return imageAssets.cactus_1;
        }
        else if(obstacle == "three_cactus"){
            return imageAssets.cactus_3;
        }
        else{
            return imageAssets.pterodactyl;
        }
    }

    update(){
        if(this.isMoving){
            this.asset_x -= this.speed;
            this.isOutOfScreen = this.asset_x + this.asset_width < 0;

        }
    }

    draw(){
        this.context.drawImage(this.image, this.asset_x, this.asset_y, this.asset_width, this.asset_height);
    }
}

export class Ground extends Asset {
    constructor(canvas, context, x, y, width, height, speed, obstacle){
        super(canvas.height / 2, x, y, width, height, speed, obstacle);
        this.isMoving = true;
        this.context = context;
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
        this.context.drawImage(imageAssets.ground, this.asset_x, this.asset_y, this.asset_width, this.asset_height);
    }
}

export class Dinosaur extends Asset {
    constructor(canvas, context, x, y, width, height, speed){
        super(canvas.height / 2, x, y, width, height, speed);
        this.isRunning = true;
        this.isJumping = false;
        this.isDucking = false;
        this.isDead = false;

        this.velocity_y = 0;
        this.gravity = 0.7;
        this.jumpStrength = -17;

        this.frameCounter = 0;
        this.currentFrame = 0;
        this.context = context;
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
            this.context.drawImage(imageAssets.dead, this.asset_x, this.asset_y, this.asset_width, this.asset_height);
        }
        else if(this.isDucking){
            this.context.drawImage(this.currentFrame ? imageAssets.left_duck : imageAssets.right_duck, this.asset_x, this.asset_y, this.asset_width, this.asset_height);
        }
        else{
            this.context.drawImage(this.currentFrame ? imageAssets.left_run : imageAssets.right_run, this.asset_x, this.asset_y, this.asset_width, this.asset_height);
        }
    }
}