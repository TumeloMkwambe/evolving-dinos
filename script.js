const canvas = document.querySelector("canvas");
const context = canvas.getContext("2d");

context.fillStyle = "#F7F7F7";
context.fillRect(0, 0, canvas.width, canvas.height);

// *********************** PREPARE IMAGES ************************** //

const right_run = new Image();
right_run.src = "../Assets/right_run.webp";

const left_run = new Image();
left_run.src = "../Assets/left_run.webp";

const cactus_1 = new Image();
cactus_1.src = "../Assets/1_cactus.webp";

const cactus_3 = new Image()
cactus_3.src = "../Assets/3_cactus.webp";

const right_duck = new Image();
right_duck.src = "../Assets/right_duck.webp";

const left_duck = new Image();
left_duck.src = "../Assets/left_duck.webp";

const dead = new Image();
dead.src = "../Assets/dead.webp";

const pterodactyl = new Image();
pterodactyl.src = "../Assets/pterodactyl.png";


let imagesLoaded = 0;
[right_run, left_run, left_duck, right_duck, cactus_1, cactus_3, dead, pterodactyl].forEach(img => {
    img.onload = () => {
        imagesLoaded++;
        if (imagesLoaded === 8) startWalking();
    };
});

class Controls {
    constructor(){
        this.keys = {};

        window.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });
    }
}


// *********************** GAMEPLAY *************************** //

function startWalking(){
    let useRight = true;

    setInterval(function(){
        context.fillStyle = "#F7F7F7";
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.drawImage(useRight ? right_run : left_run, canvas.width / 4, canvas.height / 2, 75, 75);
        useRight = !useRight;
    }, 200);
}
