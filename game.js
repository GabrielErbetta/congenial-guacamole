const MAX_W = 1200;
const MAX_H = 800;

const PLACES = [
  { id: 0, name: 'Salvador', x: 424, y: 418 },
  { id: 1, name: 'Rio de Janeiro', x: 395, y: 460 },
];


let { init, Sprite, GameLoop, initKeys, keyPressed, initPointer, onPointerDown, track } = kontra
let { canvas, context } = init();

initKeys();
initPointer();


let sprite = Sprite({
  x: (MAX_W - 300) / 2,
  y: MAX_H / 2,
  // custom properties
  radius: (MAX_H / 2) - 100,
  centerX: 0,
  rotationX: 0,

  collidesWithPointer: function(pointer) {
    let dx = pointer.x - this.x;
    let dy = pointer.y - this.y;
    return Math.sqrt(dx * dx + dy * dy) < this.radius;
  },

  onDown: function(pointer) {
    // handle on down events on the sprite
    let x = pointer.x - 150 - canvas.offsetLeft;
    let y = pointer.y - 100 - canvas.offsetTop;

    x += this.centerX;
    if (x > this.radius*4) x -= this.radius * 4;

    console.log(this.centerX, '-', x, y);
  },

  update: function() {
    if (keyPressed('left') && !keyPressed('right')) {
      this.rotationX = -4;
    } else if (keyPressed('right') && !keyPressed('left')) {
      this.rotationX = 4;
    } else {
      this.rotationX = 0;
      return;
    }

    this.centerX += this.rotationX;

    if (this.centerX > this.radius * 4) {
      this.centerX -= this.radius * 4;
    }
    if (this.centerX < 0) {
      this.centerX += this.radius * 4;
    }
  },

  render: function () {
    if (!this.image) return;

    this.context.save();

    this.context.beginPath();
    this.context.arc(0, 0, this.radius, 0, 2 * Math.PI);
    this.context.closePath();
    this.context.clip();


    let scale = (this.radius * 2) / this.image.height;
    this.context.drawImage(this.image,
      0, 0,
      this.image.width, this.image.height,
      0 - this.radius - this.centerX, 0 - this.radius,
      this.radius * 4, this.radius * 2
    );

    if (this.centerX > this.radius * 2) {
      this.context.drawImage(this.image,
        0, 0,
        this.image.width, this.image.height,
        this.radius * 4 - this.radius - this.centerX, 0 - this.radius,
        this.radius * 4, this.radius * 2
      );
    }

    this.context.beginPath();
    this.context.arc(0, 0, this.radius + 10, 0, 2 * Math.PI);
    this.context.closePath();
    this.context.lineWidth = 20;
    this.context.shadowOffsetX = -10;
    this.context.shadowOffsetY = 0;
    this.context.shadowBlur = 30;
    this.context.shadowColor = "#000";
    this.context.stroke();

    this.context.restore();
  }
});




let menu = Sprite({
  x: MAX_W - 300,
  y: 0,

  // required for a rectangle sprite
  width: 300,
  height: MAX_H,
  color: 'red',
});





let image = new Image();
// image.src = "https://openclipart.org/image/2000px/svg_to_png/1733/molumen-world-map-1.png";
image.src = "./map_new.png";
image.onload = function() {
  sprite.image = image;
};



PLACES.forEach((p) => {
  p.sprite = Sprite({
    x: p.x + 150,
    y: p.y + 100,
    anchor: {x: 0.5, y: 0.5},

    // required for a rectangle sprite
    width: 20,
    height: 20,
    color: 'red',

    update: function() {
      this.x = p.x + 150 - sprite.centerX;
      if (this.x < 0) this.x += sprite.radius * 4;
    },

    render: function() {
      if (Math.sqrt((sprite.x - this.x)**2 + (sprite.y - this.y)**2) > sprite.radius - 20) {
        return;
      }

      this.context.save();
      this.context.fillStyle = 'pink';
      this.context.fillRect(0, 0, 20, 20);
      this.context.restore();
    }
  });
});




let loop = GameLoop({
  // create the main game loop
  update: function () {
    // update the game state
    sprite.update();

    PLACES.forEach((p) => {
      if (p.sprite) p.sprite.update();
    });
  },
  render: function () {
    // render the game state
    sprite.render();
    menu.render();

    PLACES.forEach((p) => {
      if (p.sprite) p.sprite.render();
    });
  }
});

track(sprite);
loop.start(); // start the game
