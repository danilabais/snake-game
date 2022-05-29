const settingGame = {
  get fieldW() {
    return localStorage.getItem('fieldW')
  },
  setFieldW(fieldW) {
    localStorage.setItem('fieldW', fieldW);
    console.log('lol');
  },
  get fieldH() {
    return localStorage.getItem('fieldH')
  },
  setFieldH(fieldH) {
    localStorage.setItem('fieldH', fieldH);
    console.log('lol');
  },
  
}
const selectHeight = document.querySelector('#selectHeight')
const selectWidth = document.querySelector('#selectWidth')
selectWidth.addEventListener('change',((e)=>{
  game.reloadGame()
  
}))
selectHeight.addEventListener('change',((e)=>{
  settingGame.fieldH = e.target.value
}))
selectHeight.addEventListener('change',((e)=>console.log(e.target.value)))

class Config {
    constructor() {
      this.step = 0;
      this.maxStep = 6;
      this.sizeCell = 16;
      this.sizeBerry = 16 / 2.5;
      this.fieldW = settingGame.fieldW || 30
      this.fieldH = settingGame.fieldH || 30
    }
  }

class Canvas {
  constructor(container) {
    this.element = document.createElement("canvas");
    this.context = this.element.getContext("2d");
    this.config = new Config()
    this.element.width = this.config.fieldW*16;
    this.element.height = this.config.fieldH*16;
    container.appendChild(this.element);
  }
}




class GameLoop {
  constructor(update, draw) {
    this.update = update;
    this.draw = draw;

    this.config = new Config();

    this.animate = this.animate.bind(this);
    this.animate();
  }

  
  animate() {
    requestAnimationFrame(this.animate);
    if (++this.config.step < this.config.maxStep) {
      return;
    }
    this.config.step = 0;

    this.update();
    this.draw();
  }
}



function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

class Score {
  constructor(scoreBlock, score = 0) {
    this.scoreBlock = document.querySelector(scoreBlock);
    this.score = score;

    this.draw();
  }

  incScore() {
    this.score++;
    this.draw();
  }

  resetScore() {
    this.score = 0;
    this.draw();
  }

  draw() {
    this.scoreBlock.innerText = this.score;
  }
}

class Berry {
  constructor(canvas) {
    this.x = 0;
    this.y = 0;
    this.canvas = canvas;

    this.config = new Config();
    this.randomPosition();
  }

  draw(context) {
    context.beginPath();
    context.fillStyle = "red";
    context.arc(
      this.x + this.config.sizeCell / 2,
      this.y + this.config.sizeCell / 2,
      this.config.sizeBerry,
      0,
      2 * Math.PI
    );
    context.fill();
  }

  randomPosition() {
    this.x =
      getRandomInt(0, this.canvas.element.width / this.config.sizeCell) *
      this.config.sizeCell;
    this.y =
      getRandomInt(0, this.canvas.element.height / this.config.sizeCell) *
      this.config.sizeCell;
  }
}

class Snake {
  constructor() {
    this.config = new Config();
    this.x = 160;
    this.y = 160;
    this.dx = this.config.sizeCell;
    this.dy = 0;
    this.tails = [];
    this.maxTails = 2;
    this.directrion = "right";

    this.control();
  }

  update(berry, score, canvas) {
    this.x += this.dx;
    this.y += this.dy;

    if (this.x < 0) {
      this.x = canvas.element.width - this.config.sizeCell;
    } else if (this.x >= canvas.element.width) {
      this.x = 0;
    }

    if (this.y < 0) {
      this.y = canvas.element.height - this.config.sizeCell;
    } else if (this.y >= canvas.element.height) {
      this.y = 0;
    }

    this.tails.unshift({ x: this.x, y: this.y });

    if (this.tails.length > this.maxTails) {
      this.tails.pop();
    }

    this.tails.forEach((el, index) => {
      if (el.x === berry.x && el.y === berry.y) {
        this.maxTails++;
        score.incScore();
        berry.randomPosition();
      }

      for (let i = index + 1; i < this.tails.length; i++) {
        if (el.x == this.tails[i].x && el.y == this.tails[i].y) {
          this.death();
          score.resetScore();
          berry.randomPosition();
        }
      }
    });
  }

  draw(context) {
    this.tails.forEach((el, index) => {
      if (index == 0) {
        context.fillStyle = "#053800";
      } else if (index % 2 ==0) {
        context.fillStyle = "#00a738";
      } else context.fillStyle = "#00832c";
      context.fillRect(el.x, el.y, this.config.sizeCell, this.config.sizeCell);
    });
  }

  death() {
    this.x = 160;
    this.y = 160;
    this.dx = this.config.sizeCell;
    this.dy = 0;
    this.tails = [];
    this.maxTails = 2;
  }

  control() {
    const up = ["KeyW", "ArrowUp"];
    const left = ["KeyA", "ArrowLeft"];
    const right = ["KeyD", "ArrowRight"];
    const down = ["KeyS", "ArrowDown"];

    document.addEventListener("keydown", ({ code: PressedKey } = e) => {
      if (up.includes(PressedKey) && this.directrion !== "down") {
        this.dy = -this.config.sizeCell;
        this.dx = 0;
        this.directrion = "top";
      } else if (left.includes(PressedKey) && this.directrion !== "right") {
        this.dx = -this.config.sizeCell;
        this.dy = 0;
        this.directrion = "left";
      } else if (down.includes(PressedKey) && this.directrion !== "top") {
        this.dy = this.config.sizeCell;
        this.dx = 0;
        this.directrion = "down";
      } else if (right.includes(PressedKey) && this.directrion !== "left") {
        this.dx = this.config.sizeCell;
        this.dy = 0;
        this.directrion = "right";
      }
    });
  }
}

class Game {
  constructor(container) {
    this.canvas = new Canvas(container);
    this.snake = new Snake();
    this.berry = new Berry(this.canvas);
    this.score = new Score(".game__score", 0);
    new GameLoop(this.update.bind(this), this.draw.bind(this));
  }
  update() {
    this.snake.update(this.berry, this.score, this.canvas);
  }
  draw() {
    this.canvas.context.clearRect(
      0,
      0,
      this.canvas.element.width,
      this.canvas.element.height
    );
    this.snake.draw(this.canvas.context);
    this.berry.draw(this.canvas.context);
  }
  // reloadGame() {
  //   this.canvas = new Canvas(gameCanvas);
  //   this.snake = new Snake();
  //   this.berry = new Berry(this.canvas);
  //   this.score = new Score(".game__score", 0);
  //   new GameLoop(this.update.bind(this), this.draw.bind(this));
  // }
}

const gameCanvas = document.querySelector(".game__canvas") 
let game = new Game(gameCanvas);
