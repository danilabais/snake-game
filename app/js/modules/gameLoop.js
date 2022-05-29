import Config from "./config";

export default class gameLoop {
    constructor (update, draw) {
        this.update = update
        this.draw = draw 

        this.config = new Config()

        this.animate = this.animate.bind(this)
        this.animate()
    }
    animate() {
        requestAnimationFrame( this.animate );
        if ( ++config.step < config.maxStep) {
            return;
        }
        this.config.step = 0;

        this.update()
        this.draw()
    }
}