const canvas = document.getElementById("MyCanvas");
const context = canvas.getContext("2d");
let Score = document.getElementById("scoreValue");
let Mises = document.getElementById("missesValue");
//this is variables for same aniamtions
let ScoreCount = 0, i
let MissesCount = 3;
let Starscount = 3;
let changeArmor = 80
let drink = false
let rainPosY = 0;
const rainSpeed = 1;

let close = document.getElementsByClassName("closebtn");


const volumeSlider = document.getElementById("volumeSlider");

const BackgraundImg = document.createElement("img");
BackgraundImg.src = "Photos/backgraund.jpg";

const Shield = document.createElement("img");
Shield.src = "Photos/shield.png";

const BackGraundAudio = document.createElement("audio");
BackGraundAudio.src = "Song/forest.mp3";

const rainfoto = document.createElement("img");
rainfoto.src = "Photos/rain.png";

class GameObj {
  constructor(x, y, width, height) {
    this._x = x;
    this._y = y;
    this._width = width;
    this._height = height;

    this._speed = 1;
    this._xDelta = 0;
    this._yDelta = 0;

    this._img = document.createElement("img");
    this._img.src = "";

    this._img.onload = () => {
      context.drawImage(this._img, this._x, this._y, this._width, this._height);
    };
  }

  getBoundingBox() {
    return {
      x: this._x,
      y: this._y,
      width: this._width,
      height: this._height
    };
  }

  update() {
    this._x += this._xDelta;
    this._y += this._yDelta;
  }

  render() {
    context.drawImage(this._img, this._x, this._y, this._width, this._height);
  }

  goRight() {
    this._xDelta = this._speed;
  }

  goLeft() {
    this._xDelta = this._speed * -1;
  }

  stop() {
    this._xDelta = 0;
  }
}

class Bottle extends GameObj {
  constructor(x, y, width, height) {
    super(x, y, width, height);
    this._speed = 1;
    this._stabAudio = document.createElement("audio");
    this._stabAudio.src = "Song/open.mp3";
    this._stabAudio1 = document.createElement("audio");
    this._stabAudio1.src = "Song/drink.mp3";
    this._stabAudio2 = document.createElement("audio");
    this._stabAudio2.src = "Song/laught.mp3";

    this._img = document.createElement("img");
    this._img.src = "Photos/Elixir.png";

  }
  update() {
    super.update();

    const hero = data.objects.filter(obj => obj instanceof Hero);
    hero.forEach((hero) => {
      if (intersect(this.getBoundingBox(), hero.getBoundingBox())) {
        drink = true
        setTimeout(() => {
          this._stabAudio.currentTime = 1.3;
          this._stabAudio.play();
        }, 50);
        setTimeout(() => {
          this._stabAudio1.currentTime = 1;
          this._stabAudio1.play();
        }, 600);
        this.die();
        hero.changeImage("Photos/ninja/getl.png");
      }
    })
    const enemies = data.objects.filter(obj => obj instanceof Enemy);
    enemies.forEach((enemy) => {
      if (intersect(this.getBoundingBox(), enemy.getBoundingBox())) {
        this._stabAudio2.currentTime = 0;
        this._stabAudio2.play();
        this.deleteMe = true;
      }
    });
  }

  die() {
    this.deleteMe = true;
  }
}

class Jug extends GameObj {
  constructor(x, y, width, height) {
    super(x, y, width, height);
    this._speed = 1;
    this.time = 0;
    this.imageDuration = 500;
    this.currentImageIndex = 0;
    this.context = context;

    this._audio = document.createElement("audio");
    this._audio.src = "Song/jug.mp3";

    this._img1 = document.createElement("img");
    this._img1.src = "Photos/jug.png";

    this._img2 = document.createElement("img");
    this._img2.src = "Photos/jug1.png";

    this.images = [this._img1, this._img2];
  }

  render() {
    super.render();
    const currentImage = this.images[this.currentImageIndex];
    this.context.drawImage(currentImage, this._x, this._y, this._width, this._height);
    this.time += 16;
    if (this.time >= this.imageDuration) {
      this.currentImageIndex = (this.currentImageIndex + 1) % this.images.length;
      this.time = 0;
    }
  }

  update() {
    super.update();
    const hero = data.objects.filter(obj => obj instanceof Hero);
    hero.forEach((hero) => {
      if (intersect(this.getBoundingBox(), hero.getBoundingBox())) {
        this._audio.currentTime = 0;
        this._audio.play();
        Starscount += 3;
        this.die();
      }
    });
  }

  die() {
    this.deleteMe = true;
  }
}

class Bullet extends GameObj {
  constructor(x, y, width, height) {
    super(x, y, width, height);

    this._speed = 10;

    this._img = document.createElement("img");
    this._img.src = "Photos/Star.png";

    this._stabAudio = document.createElement("audio");
    this._stabAudio.src = "Song/Die.mp3";
  }

  update() {
    super.update();

    if ((this._xDelta < 0 && this._x + this._width < 0) ||
      (this._xDelta > 0 && this._x > canvas.width)) {
      this.deleteMe = true;
    }
    const enemies = data.objects.filter(obj => obj instanceof Enemy);
    enemies.forEach((enemy) => {
      if (intersect(this.getBoundingBox(), enemy.getBoundingBox())) {
        enemy.die();
        Score.innerHTML = ScoreCount += 1;
        this._stabAudio.currentTime = 0.1;
        this._stabAudio.play();
        this.deleteMe = true;
      }
    });
  }
}
class Hero extends GameObj {
  constructor(x, y, width, height) {
    super(x, y, width, height);
    this._speed = 5;
    this._shootInterval = 500;
    this._lastShootTime = 0;
    this.animationCounter = 0;
    this.animationDelay = 18;
    this.isJumpingDown = false;
    this.animationCounterT = 0;
    this.animationDelayT = 18;
    this._right = false
    this._left = false

    this._audioJumpDown = document.createElement("audio");
    this._audioJumpDown.src = "Song/JumpDown.mp3";

    this._audioJump = document.createElement("audio");
    this._audioJump.src = "Song/jump.mp3";

    this._imge = document.createElement("img");
    this._imge.src = "Photos/ninja/standl.png";

    this._imgel = document.createElement("img");
    this._imgel.src = "Photos/ninja/stand.png";

    this._imger = document.createElement("img");
    this._imger.src = "Photos/ninja/standl.png";

    this._img1 = document.createElement("img");
    this._img1.src = "Photos/ninja/walk1l.png";

    this._img2 = document.createElement("img");
    this._img2.src = "Photos/ninja/walk2l.png";

    this._img3 = document.createElement("img");
    this._img3.src = "Photos/ninja/walk3l.png";

    this._img4 = document.createElement("img");
    this._img4.src = "Photos/ninja/walk1.png";

    this._img5 = document.createElement("img");
    this._img5.src = "Photos/ninja/walk2.png";

    this._img6 = document.createElement("img");
    this._img6.src = "Photos/ninja/walk3.png";

    this._img7 = document.createElement("img");
    this._img7.src = "Photos/ninja/jumpupl.png";

    this._img8 = document.createElement("img");
    this._img8.src = "Photos/ninja/jumpup.png";

    this._audio = document.createElement("audio");
    this._audio.src = "Song/Knife.mp3";

    this.walkImagesLeft = [this._img4, this._img5, this._img6];
    this.walkImagesRight = [this._img1, this._img2, this._img3];
    this.currentAnimationFrame = 0;
    this.isWalking = false;
    this.isJumping = false;
  }

  changeImage(newImageSrc) {
    this._imger.src = newImageSrc;
    this._imgel.src = newImageSrc;
    setInterval(() => {
      this._imger.src = "Photos/ninja/standl.png";
      this._imgel.src = "Photos/ninja/stand.png";
    }, 1300);
  }

  render() {
    super.render();
    if (this.isWalking) {
      if (this.isJumping) {
        if (this._xDelta > 0) context.drawImage(this._img7, this._x, this._y, this._width, this._height);
        else if (this._xDelta < 0) context.drawImage(this._img8, this._x, this._y, this._width, this._height);
      } else if (this._xDelta < 0) { // If moving left
        context.drawImage(this.walkImagesLeft[this.currentAnimationFrame], this._x, this._y, this._width, this._height);
      } else if (this._xDelta > 0) { // If moving right
        context.drawImage(this.walkImagesRight[this.currentAnimationFrame], this._x, this._y, this._width, this._height);
      }
    }
    else if (this.isJumping) context.drawImage(this._img7, this._x, this._y, this._width, this._height);
    else {
      if (this._left) context.drawImage(this._imgel, this._x, this._y, this._width, this._height);
      else context.drawImage(this._imger, this._x, this._y, this._width, this._height);
    }
    if(this._y >= 262) this.isJumpingDown = true;

  }

  goRight() {
    super.goRight()
    this._right = true
    this._left = false
  }

  goLeft() {
    super.goLeft()
    this._right = false
    this._left = true
  }

  update() {
    super.update();
    if (this._xDelta !== 0) {
      this.isWalking = true;
      setInterval(() => {
        this.updateAnimation();
      }, 300);
    } else {
      this.isWalking = false;
    }

    if (this._yDelta !== 0) {
      this.isJumping = true;
    } else {
      this.isJumping = false;
    }

    if (this._x <= -45) this._x = -45;
    if (this._x >= canvas.width - 100) this._x = canvas.width - 100;


    if ((this._x >= 455 && this._x <= 460) || (this._x >= 670 && this._x <= 680)) {
      if (this._y >= 168 && this._y <= 174) this._yDelta = 7;
    }
    if (this._x <= 455 || this._x >= 680) {
      if (this._y < 90) {
        this._yDelta = 7;
      } else if (this._y >= 270) {
        this._yDelta = 0;
      }
    }
    else {
      if (this._y < 0) {
        this._yDelta = 7;
      } else if (this._y >= 168 && this._y <= 174) {
        this._yDelta = 0;
      } else if (this._y >= 270) {
        this._yDelta = 0;
      }
    }
    if (this._y >= 266.9 && this._y <= 269.9) {
      this._audioJumpDown.currentTime = 0.5;
      this._audioJumpDown.play();
      this.jumpDownAnimation(); 
    }
  }


  stopY() {
    if (this._y === 270) this._yDelta = 0;
  }

  jumpDownAnimation() {
    if (this.isJumpingDown) {
      this.isJumpingDown = false; 
      this.jumpDownImage();
      setTimeout(() => {
        this.standImage();
      }, 400);
    }
  }

    jumpDownImage() {
    if (this._right) {
      this._imger.src = "Photos/ninja/jumpdownl.png";
    } else {
      this._imgel.src = "Photos/ninja/jumpdown.png";
    }
  }
  standImage() {
    if (this._right) {
      this._imger.src = "Photos/ninja/standl.png";
      this._imgel.src = "Photos/ninja/stand.png";
    }
  }
  jump() {
    this._audioJump.currentTime = 0.05;
    this._audioJump.play();
    if (this._y > 20) this._yDelta = -10;

  }


  fire() {
    const now = Date.now()
    if (now - this._lastShootTime >= this._shootInterval && Starscount > 0) {
      removeStar()
      Starscount -= 1
      const x = this._x + this._width
      const y = this._y + this._height / 2
      const width = 20;
      const height = 20;

      const bullet = new Bullet(x, y, width, height);

      if (this._left) {
        bullet.goLeft()
      } else {
        bullet.goRight();
      }
      data.objects.push(bullet);

      this._audio.currentTime = 0;
      this._audio.play();
      this._lastShootTime = now;
    }
  }

  updateAnimation() {
    this.animationCounter++;
    if (this.animationCounter >= this.animationDelay) {
      if (this._xDelta > 0) {
        this.currentAnimationFrame = (this.currentAnimationFrame + 1) % this.walkImagesRight.length;
      } else if (this._xDelta < 0) {
        this.currentAnimationFrame = (this.currentAnimationFrame + 1) % this.walkImagesLeft.length;
      }
    }
  }
}

class Enemy extends GameObj {
  constructor(x, y, width, height) {
    super(x, y, width, height);
    this._speed = 3;
    this.currentAnimationFrame = 0;
    this.animationCounter = 0;
    this.animationDelay = 8;

    this._stabAudio = document.createElement("audio");
    this._stabAudio.src = "Song/Die.mp3";

    this._img1 = document.createElement("img");

    this._img2 = document.createElement("img");
    this._img2.src = "Photos/enemy/walk2.png";

    this._img3 = document.createElement("img");
    this._img3.src = "Photos/enemy/walk3.png";

    this._audio = document.createElement("audio");
    this._audio.src = "Song/Knife.mp3";

    this.walkImages = [this._img1, this._img2, this._img3];
  }

  update() {
    super.update();

    if ((this._xDelta < 0 && this._x + this._width < 0) ||
      (this._xDelta > 0 && this._x > canvas.width)) {
      this.deleteMe = true;
    }

    if (this._xDelta !== 0) {
      this.updateAnimation();
    }
    const hero = data.objects.filter(obj => obj instanceof Hero);
    hero.forEach((hero) => {
      if (intersect(this.getBoundingBox(), hero.getBoundingBox())) {
        if (changeArmor > 0) changeArmor -= 20
        else if (MissesCount > 0 && changeArmor === 0) {
          MissesCount -= 1;
          removHearth();
        }
        hero.changeImage("Photos/enemy/ninjadead.png");
        this._stabAudio.currentTime = 0.1;
        this._stabAudio.play();
        this.die();
      }
    })
  }
  render() {
    super.render()
    const hero = data.objects.filter(obj => obj instanceof Hero);
    hero.forEach((hero) => {//hero 270  250
      if ((this._x + 50 <= hero._x || this._x - 50 >= hero._x)) {
        this._img1.src = "Photos/enemy/walk1.png";
        context.drawImage(this.walkImages[this.currentAnimationFrame], this._x, this._y, this._width, this._height);
      }
      else {
        if (this._y <= hero._y) {
          this._img1.src = "Photos/enemy/atack.png";
          context.drawImage(this._img1, this._x, this._y, this._width, this._height);
        }
        else {
          this._img1.src = "Photos/enemy/walk1.png";
          context.drawImage(this.walkImages[this.currentAnimationFrame], this._x, this._y, this._width, this._height);

        }
      }

    })
  }
  die() {
    this.deleteMe = true;
  }
  updateAnimation() {
    this.animationCounter++;
    if (this.animationCounter >= this.animationDelay) {
      this.animationCounter = 0;
      this.currentAnimationFrame = (this.currentAnimationFrame + 1) % this.walkImages.length;
    }
  }

}



//main code
let data = {
  objects: [new Hero(0, 270, 100, 100), new Bottle(300, 325, 50, 50), new Jug(600, 190, 80, 80)],
  backgroundAudio: BackGraundAudio
};

function update() {
  if (ScoreCount === 5) {
    alert("you win");
    ScoreCount = 6;
    location.reload();
  } else if (MissesCount === 0) {
    alert("you Loose");
    MissesCount = 3;
    location.reload();
  }


  data.objects.forEach((obj) => obj.update());

  data.objects = data.objects.filter((obj) => obj.deleteMe !== true);

  const enemies = data.objects.filter(obj => obj instanceof Enemy);
  if (enemies.length === 0) {
    const enemie = new Enemy(canvas.width - 100, 250, 130, 130);
    enemie.goLeft();
    data.objects.push(enemie);
  }
}


function draw() {
  context.drawImage(BackgraundImg, 0, 0, canvas.width, canvas.height);
  rainPosY += rainSpeed;
  if (rainPosY >= canvas.height - 470) {
    rainPosY = 10;
  }
  context.drawImage(rainfoto, 0, rainPosY, canvas.width, canvas.height - 140);
  context.drawImage(Shield, 10, 10, 30, 30);

  context.fillStyle = "gray";
  context.fillRect(45, 15, 80, 20);
  if (changeArmor > 0) {
    if (changeArmor === 20) context.fillStyle = "#8B0000";
    else context.fillStyle = "#C0C0C0";
    context.fillRect(45, 15, changeArmor, 20);
  }
  data.objects.forEach(obj => obj.render());
}

function loop() {
  data.backgroundAudio.play();
  requestAnimationFrame(loop);
  update();
  draw();
  createStars(Starscount)
  createHearth(MissesCount)
}

document.addEventListener("keydown", (evt) => {
  const hero = data.objects.find(obj => obj instanceof Hero);
  if (evt.code === "ArrowRight") {
    hero.goRight();
    hero.updateAnimation(); // Call updateAnimation when moving right
  } else if (evt.code === "ArrowLeft") {
    hero.goLeft();
    hero.updateAnimation(); // Call updateAnimation when moving left
  } else if (evt.code === "ArrowUp") {
    if (drink === true) hero.jump();
  } else if (evt.code === "Space") {
    if (Starscount > 0) {
      hero.fire();
    }
  }
});

document.addEventListener("keyup", () => {
  const hero = data.objects.find(obj => obj instanceof Hero);
  hero.stop();
  hero.stopY();
});

////////////////////////////////////////////////////
//here are functions witch are used

function myFunction() {
  data.backgroundAudio.pause();
  location.reload();
}

//warning function
for (i = 0; i < close.length; i++) {
  close[i].onclick = function () {
    let div = this.parentElement;
    div.style.opacity = "0";
    setTimeout(function () { div.style.display = "none"; }, 600);
  };
}

let volume = 0.28;
BackGraundAudio.volume = volume;

volumeSlider.addEventListener("input", () => {
  volume = parseFloat(volumeSlider.value);
  BackGraundAudio.volume = volume;
});

//this function is creating stars and adding into html code
function createStars(count) {
  const starContainer = document.getElementById("starContainer");
  starContainer.innerHTML = "";
  for (let i = 0; i < count; i++) {
    const star = document.createElement("img");
    star.src = "Photos/Star.png";
    starContainer.appendChild(star);
  }
}
//when you call this function it delete one of stars
function removeStar() {
  const stars = starContainer.getElementsByTagName("img");
  if (stars.length > 0) {
    starContainer.removeChild(stars[0]);
  }
}
//this function is creating stars and adding into html code
function createHearth(count) {
  const hearthContainer = document.getElementById("missesValue");
  hearthContainer.innerHTML = "";
  for (let i = 0; i < count; i++) {
    const star = document.createElement("img");
    star.src = "Photos/heart.png";
    hearthContainer.appendChild(star);
  }
}
//when you call this function it delete one of stars
function removHearth() {
  const hearthContainer = document.getElementById("missesValue");
  const hearth = hearthContainer.getElementsByTagName("img");
  if (hearth.length > 0 && MissesCount >= 0) {
    hearthContainer.removeChild(hearth[hearth.length - 1]);
  }
}

//this function is to detect if objects hit each other
function intersect(rect1, rect2) {
  if (rect1.width > 90 && rect2.width > 90) {
    const x = Math.max(rect1.x, rect2.x),
      num1 = Math.min(rect1.x + rect1.width, rect2.x + rect2.width) - 80,
      y = Math.max(rect1.y, rect2.y),
      num2 = Math.min(rect1.y + rect1.height, rect2.y + rect2.height) - 50;
    return num1 >= x && num2 >= y;
  }
  else {
    const x = Math.max(rect1.x, rect2.x),
      num1 = Math.min(rect1.x + rect1.width, rect2.x + rect2.width),
      y = Math.max(rect1.y, rect2.y),
      num2 = Math.min(rect1.y + rect1.height, rect2.y + rect2.height);
    return num1 >= x && num2 >= y;
  }
}

//running program
loop();

