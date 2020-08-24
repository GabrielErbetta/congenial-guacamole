const MAX_W = 1200;
const MAX_H = 800;

const PLACES = [
  { id: 0, name: 'Salvador', x: 424, y: 418 },
  { id: 1, name: 'Rio de Janeiro', x: 395, y: 460 },
];


let { init, Sprite, GameLoop, initKeys, keyPressed, initPointer, onPointerDown, track, Button, Grid, Text, load, imageAssets, clamp, keyMap } = kontra
let { canvas, context } = init();
let pointer = false;

initKeys();
initPointer();

keyMap['NumpadAdd'] = 'plus';
keyMap['NumpadSubtract'] = 'minus';

let sprite = Sprite({
  x: (MAX_W - 300) / 2,
  y: MAX_H / 2,
  radius: (MAX_H / 2) - 100,
  centerX: 0,
  centerY: 0,

  zoomIn: function() {
    if (this.scaleX == 2) return;

    this.scaleX = 2;
    this.scaleY = 2;

    btZoomOut.enable();
    btZoomIn.disable();
    btZoomIn.pressed = false;

    btRotateU.enable();
    btRotateD.enable();
  },

  zoomOut: function() {
    if (this.scaleX == 1) return;

    this.scaleX = 1;
    this.scaleY = 1;
    this.y = MAX_H / 2,

    btZoomOut.disable();
    btZoomIn.enable();
    btZoomOut.pressed = false;

    btRotateU.disable();
    btRotateD.disable();
  },

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
    this.y = clamp(MAX_H / 2 - 250, MAX_H / 2 + 250, this.y);

    if (this.centerX > this.radius * 4) {
      this.centerX -= this.radius * 4;
    }
    if (this.centerX < 0) {
      this.centerX += this.radius * 4;
    }
  },

  render: function () {
    if (!this.image) return;


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

    this.context.save();
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



let sidebar = Sprite({
  x: MAX_W - 300,
  y: 0,
  width: 300,
  height: MAX_H,
  color: 'darkslategrey'
});



// BUTTONS
let btRotateL, btRotateR, btRotateU, btRotateD, btZoomIn, btZoomOut;
load('./arrow.png', './arrow_small.png', './zoomin.png', './zoomout.png').then(() => {
  let buttonCommon = {
    anchor: {x: 0.5, y: 0.5},
    scaleX: 4,
    scaleY: 4,
    opacity: 0.9,
    render: function() {
      if (this.disabled) {
        this.opacity = 0.4;
        this.draw();
        return;
      }

      if (this.focused) {
        this.context.strokeStyle = 'yellow';
        this.context.strokeRect(0, 0, this.width, this.height);
      }

      if (this.hovered) {
        pointer = true;
      }

      if (this.pressed || keyPressed(this.key)) {
        this.y = this.initialY + 2;
        this.opacity = 1;
      } else {
        this.y = this.initialY;
        this.opacity = 0.9;
      }

      this.draw();
    }
  };

  btZoomIn = Button({
    x: 82,
    y: MAX_H - 228,
    initialY: MAX_H - 228,
    image: imageAssets['./zoomin'],
    key: "plus",
    ...buttonCommon,

    update: function() {
      if (!this.disabled && (this.pressed || keyPressed(this.key))) sprite.zoomIn();
    }
  });

  btZoomOut = Button({
    x: 218,
    y: MAX_H - 228,
    initialY: MAX_H - 228,
    disabled: true,
    image: imageAssets['./zoomout'],
    key: "minus",
    ...buttonCommon,

    update: function() {
      if (!this.disabled && (this.pressed || keyPressed(this.key))) sprite.zoomOut();
    }
  });

  btRotateL = Button({
    x: 60,
    y: MAX_H - 100,
    initialY: MAX_H - 100,
    image: imageAssets['./arrow'],
    key: "left",
    ...buttonCommon,

    update: function() {
      if (this.pressed || keyPressed(this.key)) sprite.centerX -= 4;
    }
  });

  btRotateR = Button({
    x: 240,
    y: MAX_H - 100,
    initialY: MAX_H - 100,
    image: imageAssets['./arrow'],
    rotation: Math.PI,
    key: "right",
    ...buttonCommon,

    update: function() {
      if (this.pressed || keyPressed(this.key)) sprite.centerX += 4;
    }
  });

  btRotateU = Button({
    x: 150,
    y: MAX_H - 142,
    initialY: MAX_H - 142,
    image: imageAssets['./arrow_small'],
    disabled: true,
    key: "up",
    ...buttonCommon,

    update: function() {
      if (!this.disabled && (this.pressed || keyPressed(this.key))) sprite.y += 4;
    }
  });

  btRotateD = Button({
    x: 150,
    y: MAX_H - 58,
    initialY: MAX_H - 58,
    image: imageAssets['./arrow_small'],
    rotation: Math.PI,
    disabled: true,
    key: "down",
    ...buttonCommon,

    update: function() {
      if (!this.disabled && (this.pressed || keyPressed(this.key))) sprite.y -= 4;
    }
  });

  sidebar.addChild(btZoomIn);
  sidebar.addChild(btZoomOut);
  sidebar.addChild(btRotateL);
  sidebar.addChild(btRotateU);
  sidebar.addChild(btRotateD);
  sidebar.addChild(btRotateR);
});


// old menu
/*
let button = Text({
  color: 'white',
  font: '20px Arial, sans-serif',
  text: 'Start'
});

let button2 = Text({
  color: 'white',
  font: '20px Arial, sans-serif',
  text: 'Options'
});

let button3 = Text({
  color: 'white',
  font: '20px Arial, sans-serif',
  text: 'Quit'
});



let menu = Grid({
  x: MAX_W - 150,
  y: MAX_H/2,
  anchor: {x: 0.5, y: 0.5},

  // height: MAX_H,
  // width: 300,

  // color: 'red',

  // add 15 pixels of space between each row
  rowGap: 15,

  // center the children
  justify: 'center',

  // align: 'center',

  children: [button, button2, button3]
});
*/




let image = new Image();
// image.src = "https://openclipart.org/image/2000px/svg_to_png/1733/molumen-world-map-1.png";
image.src = "./map_new.png";
image.onload = function() {
  sprite.image = image;
};



PLACES.forEach((p) => {
  p.sprite = Sprite({
    x: p.x - sprite.radius,
    y: p.y - sprite.radius,

    update: function() {
      this.x = p.x - sprite.radius - sprite.centerX;
      if (this.x < - sprite.radius) this.x += sprite.radius * 4;
    },

    render: function() {
      if (Math.sqrt((this.x)**2 + (this.y)**2) > sprite.radius + 20) {
        return;
      }

      this.context.save();
      this.context.fillStyle = 'red';
      this.context.beginPath();
      this.context.arc(0, 0, 10, 0, 2 * Math.PI);
      this.context.closePath();
      this.context.fill();
      this.context.restore();
    }
  });

  sprite.addChild(p.sprite);
});




let loop = GameLoop({
  // create the main game loop
  update: function () {
    // update the game state
    sprite.update();
    sidebar.update();

    PLACES.forEach((p) => {
      if (p.sprite) p.sprite.update();
    });
  },
  render: function () {
    // render the game state
    sprite.render();
    sidebar.render();

    if (pointer) {
      canvas.style.cursor = 'pointer';
      pointer = false;
    } else {
      canvas.style.cursor = 'initial';
    }

    // if (btRotateL) btRotateL.render();
    // if (btRotateR) btRotateR.render();
    // if (btRotateU) btRotateU.render();
    // if (btRotateD) btRotateD.render();
    // if (btZoomIn)  btZoomIn.render();
    // if (btZoomOut) btZoomOut.render();
  }
});

track(sprite);
loop.start(); // start the game
