let dom_replay = document.querySelector("#replay");
let dom_score = document.querySelector("#score");
let dom_canvas = document.querySelector("#canvas");
let canvasElement = document.createElement("canvas");
dom_canvas.appendChild(canvasElement);
let CTX = canvasElement.getContext("2d");
const W = (canvasElement.width = 400);
const H = (canvasElement.height = 400);


let snake,
food,
currentHue,
cells=20,
isGameOver = false,
trails = [],
score = 0,
maxScore = window.localStorage.getItem("maxScore") || undefined,
particles = [],
splashingParticleCount = 20,
cellsCount,
requestID;

let helpers ={
    Vec: class{
        constructor(x,y){
            this.x = x;
            this.y = y;
        }
        add(v){
            this.x += v.x;
            this.y += v.y;
            return this;
        }
        mult(v){
            if(v instanceof helpers.Vec){
                this.x *= v.x;
                this.y *= v.y;
                return this;
            }
            else{
                this.x *= v;
                this.y *= v;
            }
        }
    },
    isCollision(v1,v2){
        return v1.x == v2.x && v1.y == v2.y;
    },
    garbageCollector(){
        for(let i=0;i<particles.length;i++){
            if(particles[i].size < 0){
                particles.splice(i,1);
            }
        }
    },
    drawGrid(){
        CTX.lineWidth = 1.1;
        CTX.strokeStyle = "#232332";
        CTX.shadowBlur = 0;
        for(let i = 1;i<cells;i++){
            let f = (W/cells * i );
            CTX.beginPath();
            CTX.moveTo(f,0);
            CTX.lineTo(f,H);
            CTX.stroke();
            CTX.beginPath();
            CTX.beginPath();
            CTX.moveTo(0,f);
            CTX.lineTo(W,f);
            CTX.stroke();
            CTX.closePath();

        }
    },
    randHue(){
        return ~~(Math.random()*360);
    },
    hsl2rgb(hue,saturation,lightness){
        if(hue == undefined){
            return [0,0,0];

        }
        var chroma = (1 -Math.abs(2 * lightness - 1))* saturation;
        var huePrime = hue / 60;
        var secondComponent = chroma * (1 - Math.abs((huePrime % 2) - 1))
        huePrime = ~~huePrime;
        var red;
        var green;
        var blue;
        if(huePrime===0){
            red = chroma;
            green = secondComponent
            blue=0;
        }else if(huePrime ===1){
            red = secondComponent;
            green = chroma;
            blue = 0;

        }else if (huePrime === 2){
            red= 0;
            green = chroma;
            blue= secondComponent;

        }else if (huePrime === 3){
            red= 0;
            green = secondComponent;
            blue= chroma;

        }else if (huePrime === 4){
            red= secondComponent;
            green = 0;
            blue= chroma;

        }else if (huePrime === 4){
            red= chroma;
            green = 0;
            blue= secondComponent;

        }
        var lightnessAdjestment = lightness - chroma / 2;
        red += lightnessAdjestment;
        green += lightnessAdjestment;
        blue += lightnessAdjestment;
        return[
            Math.round(red * 255),
            Math.round(green * 255),
            Math.round(blue * 255),

        ];
          
    },
    lerp(start,end,){
        return start * (1 - t) + end * t;
    },
};
let KEY = {
    ArrowUp: false,
    ArrowRight: false,
    ArrowDown: false,
    ArrowLeft: false,
    resetState() {
      this.ArrowUp = false;
      this.ArrowRight = false;
      this.ArrowLeft = false;
      this.ArrowDown = false;
    },
    listen() {
      document.addEventListener("keydown", (e) => {
        switch (e.key) {
          case "ArrowUp":
            if (!this.ArrowDown) {
              this.ArrowUp = true;
              this.ArrowRight = false;
              this.ArrowLeft = false;
              this.ArrowDown = false;
            }
            break;
          case "ArrowDown":
            if (!this.ArrowUp) {
              this.ArrowUp = false;
              this.ArrowRight = false;
              this.ArrowLeft = false;
              this.ArrowDown = true;
            }
            break;
          case "ArrowLeft":
            if (!this.ArrowRight) {
              this.ArrowUp = false;
              this.ArrowRight = false;
              this.ArrowLeft = true;
              this.ArrowDown = false;
            }
            break;
          case "ArrowRight":
            if (!this.ArrowLeft) {
              this.ArrowUp = false;
              this.ArrowRight = true;
              this.ArrowLeft = false;
              this.ArrowDown = false;
            }
            break;
        }
      });
    },
  };
  
class Snake{
    constructor(i,type){
        this.pos = new helpers.Vec(W / 2, H/ 2);
        this.dir =  new helpers.Vec(0,0);
        this.type = type;
        this.index = i;
        this.delay = 5;
        this.size = W / cells;
        this.color = "white"
        this.history = [];
        this.total = 1;

    }
    draw() {
        const { x, y } = this.pos;
        CTX.fillStyle = this.color;
        CTX.shadowBlur = 20;
        CTX.shadowColor = "rgba(255, 255, 255, 0.3)";
        CTX.fillRect(x, y, this.size, this.size);
      
        if (this.total >= 2) {
          for (let i = 0; i < this.history.length - 1; i++) {
            const { x, y } = this.history[i];
            CTX.lineWidth = 1;
            CTX.fillStyle = "rgba(255, 255, 255, 0.1)";
            CTX.fillRect(x, y, this.size, this.size);
          }
        }
      }
      
walls(){
    let {x,y} = this.pos;
    if(x + cellSize > W){
        this.pos.x = 0;

    }
    if(y + cellSize > W){
        this.pos.y = 0;

    }
    if(y<0){
        this.pos.y = H -cellSize;

    }
    if(y<0){
        this.pos.y = W -cellSize;

    }
}
controlls() {
    if (KEY.ArrowUp) {
      this.dir = new helpers.Vec(0, -this.size);
    }
    if (KEY.ArrowDown) {
      this.dir = new helpers.Vec(0, this.size);
    }
    if (KEY.ArrowLeft) {
      this.dir = new helpers.Vec(-this.size, 0);
    }
    if (KEY.ArrowRight) {
      this.dir = new helpers.Vec(this.size, 0);
    }
  }
  



  selfCollision() {
    for (let i = 0; i < this.history.length; i++) {
      const p = this.history[i];
      if (helpers.isCollision(this.pos, p)) {
        isGameOver = true;
        CTX.fillStyle = "#4cffd7";
        CTX.textAlign = "center";
        CTX.font = "bold 30px poppins, sans-serif";
        CTX.fillText("GAME OVER", W / 2, H / 2);
        break;
      }
    }
  }
  update(){
    this.walls();
     this.draw();
     this.controlls();
     if(!this.delay--){
        if(helpers.isCollision(this.pos,food.pos)){
            incerementScore();
            particleSplash();
            food.spawn();
            this.total++;

        }
        this.history[this.total - 1] = new helpers.Vec(this.pos.x,this.pos.y);
        for(let i=0; i < this.total - 1; i++){
            this.history[i] = this.history[i +1];
        }
        this.pos.add(this.dir);
        this.delay = 5;
        this.total > 3 ? this.selfCollision() : null;
        

     }
}
  

}

class Food{
    constructor(){
        this.pos = new helpers.Vec(
            ~~(Math.random() * cells) * cellSize,
            ~~(Math.random() * cells) * cellSize
        );
        this.color = currentHue = `hsl(${~~(Math.random()* 360)}, 100%,50%)`;
        this.size = cellSize;

    }
    draw(){
        let {x,y} = this.pos;
        CTX.globalCompositeOperation = "lightner";
        CTX.shadowBlur = 20;
        CTX.shadowColor = this.color;
        CTX.fillStyle = this.color;
        CTX.fillRect(x,y, this.size,this.size);
        CTX.globalCompositeOperation = "source-over";
        CTX.shadowBlur = 0;
        }

        spawn(){
            let randX = ~~(Math.random() * cells) * this.size;
            let randY = ~~(Math.random() * cells) * this.size;
            for(let path of snake.history){
                if(helpers.isCollision(new helpers.Vec(randX, randY), path)){
                    return this.spawn;

                }

            }
            this.color = currentHue = `hsl(${helpers.randHue()},100%,50%)`;
            this.pos = new helpers.Vec(randX,randY);
        }
}
class particle {
    constructor(pos, color, size, vel) {
      this.pos = pos;
      this.color = color;
      this.size = Math.abs(size / 2);
      this.ttl = 0;
      this.gravity = -0.2;
      this.vel = vel;
    }
  
    draw() {
      let { x, y } = this.pos;
      let hsl = this.color
        .split(',')
        .filter((l) => l.trim() !== '')
        .join(',')
        .split(',')
        .map((n) => +n);
      let [r, g, b] = helpers.hsl2rgb(hsl[0], hsl[1] / 100, hsl[2] / 100);
      CTX.shadowColor = `rgb(${r}, ${g}, ${b}, 1)`;
      CTX.shadowBlur = 0;
      CTX.globalCompositeOperation = "lighter";
      CTX.fillStyle = `rgb(${r}, ${g}, ${b})`;
      CTX.fillRect(x, y, this.size, this.size);
      CTX.globalCompositeOperation = "source-over";
    }
  
    update() {
      this.draw();
      this.size -= 0.3;
      this.ttl += 1;
      this.pos.add(this.vel);
      this.vel.y -= this.gravity;
    }
  }
  
  function incerementScore() {
    score++;
    dom_score.innerText = score.toString().padStart(2, "0");
  }
  
  function particleSplash() {
    for (let i = 0; i < splashingParticleCount; i++) {
      let vel = new helpers.Vec(Math.random() * 6 - 3, Math.random() * 6 - 3);
      let position = new helpers.Vec(food.pos.x, food.pos.y);
      particles.push(new particle(position, currentHue, food.size, vel));
    }
  }
  
  function clear() {
    CTX.clearRect(0, 0, W, H);
  }
  
  function initialize() {
    CTX.imageSmoothingEnabled = false;
    KEY.listen();
    cellsCount = cells * cells;
    cellSize = W / cells;
    snake = new Snake();
    food = new Food();
    dom_replay.addEventListener("click", reset, false);
    loop();
  }
  
  function loop() {
    clear();
    if (!isGameOver) {
      requestID = setTimeout(loop, 1000 / 60);
      helpers.drawGrid();
      snake.update();
      food.draw();
      for (let p of particles) {
        p.update();
      }
      helpers.garbageCollector();
    } else {
      clearTimeout(requestID);
      gameOver();
    }
  }
  
  function gameOver() {
    maxScore ? null : (maxScore = score);
    score > maxScore ? (maxScore = score) : null;
    window.localStorage.setItem("maxScore", maxScore);
    CTX.fillStyle = "#4cffd7";
    CTX.textAlign = "center";
    CTX.font = "bold 30px poppins, sans-serif";
    CTX.fillText("GAME OVER", W / 2, H / 2);
    CTX.fillText(`SCORE ${score}`, W / 2, H / 2 + 40);
    CTX.fillText(`MAXSCORE ${maxScore}`, W / 2, H / 2 + 70);
  }
  
  function reset() {
    dom_score.innerText = "00";
    score = 0;
    snake = new Snake();
    food.spawn();
    KEY.resetState();
    isGameOver = false;
    clearTimeout(requestID);
    loop();
  }
  
  initialize();
  
  