export class Asset {
    constructor(canvas, x, y, width, height, speed, images_array){
        this.ground_y = canvas.height / 2;
        this.asset_x = x;
        this.asset_y = y;
        this.asset_width = width;
        this.asset_height = height;
        this.speed = speed;
        this.images_array = images_array;
        this.images_loaded = false;
    }

    prepareImages(){
        let imagesLoaded = 0;
        this.images_array.forEach(img => {
            img.onload = () => {
                imagesLoaded++;
                if (imagesLoaded === this.images_array.length){
                    this.images_loaded = true;
                }
            };
        });
    }
}