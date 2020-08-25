const MAX_W = 1200;
const MAX_H = 800;

const PLACES = [
  { id: 0, name: 'Salvador', x: 124, y: 118 },
  { id: 1, name: 'Rio de Janeiro', x: 95, y: 160 },
  { id: 1, name: 'Paris', x: 271, y: -109 },
  { id: 1, name: 'Taj Mahal', x: 524, y: -24 },
  { id: 1, name: 'Rome', x: 304, y: -81 }, // 484
  { id: 1, name: 'Macchu Picchu', x: 18, y: 113 },
  { id: 1, name: 'New York', x: 14, y: -76 }, // 64
  { id: 1, name: 'Los Angeles', x: -125, y: -43 }, // 64
  { id: 1, name: 'Sidney', x: 765, y: 189 }, // 716
  { id: 1, name: 'London', x: 262, y: -122 }, // 184
  { id: 1, name: 'Stonehenge', x: 255, y: -121 }, // 184
  { id: 1, name: 'Athens', x: 342, y: -65 }, // 264
  { id: 1, name: 'Beijing', x: 650, y: -72 }, // 648
  { id: 1, name: 'Cairo', x: 364, y: -33 }, // 316
];


let { init, Sprite, GameLoop, initKeys, keyPressed, initPointer, onPointerDown, track, Button, Grid, Text, load, imageAssets, clamp, keyMap } = kontra
let { canvas, context } = init();
let isPointer = false;

initKeys();
initPointer();

keyMap['NumpadAdd'] = 'plus';
keyMap['NumpadSubtract'] = 'minus';

let sprite = Sprite({
  x: (MAX_W - 300) / 2,
  y: MAX_H / 2,
  initialY: MAX_H / 2,
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
    this.centerY = 0,

    btZoomOut.disable();
    btZoomIn.enable();
    btZoomOut.pressed = false;

    btRotateU.disable();
    btRotateD.disable();
  },

  collidesWithPointer: function(pointer) {
    return true;
    let dx = pointer.x - this.x;
    let dy = pointer.y - this.y;
    return Math.sqrt(dx * dx + dy * dy) < this.radius;
  },

  onDown: function(pointer) {
    // handle on down events on the sprite
    console.log(pointer.x, pointer.y)
    let x = pointer.x - this.x - canvas.offsetLeft;
    let y = pointer.y - this.y - canvas.offsetTop;

    x += this.centerX * this.scaleX;
    x /= this.scaleX;
    if (x > this.radius*4) x -= this.radius * 4;

    console.log(`{ id: 1, name: '', x: ${x}, y: ${y / this.scaleX} } // ${this.centerX}`);
  },

  update: function() {
    this.centerY = clamp(-250, 250, this.centerY);
    this.y = this.initialY + this.centerY;

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


    let centerX = this.centerX;
    if (centerX > this.radius * 3) centerX -= this.radius * 4;

    this.context.save();
    this.context.strokeStyle = 'yellow';
    this.context.beginPath();
    this.context.moveTo(-this.radius - 10000, 0);
    this.context.lineTo(this.radius + 10000, 0);
    this.context.closePath();
    this.context.stroke();
    this.context.beginPath();
    this.context.moveTo(-centerX, -this.radius - 1000);
    this.context.lineTo(-centerX, this.radius + 1000);
    this.context.closePath();
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
    onOut: function() {
      this.pressed = false;
      this.hovered = false;
    },
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
        isPointer = true;
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
    // disabled: true,
    key: "up",
    ...buttonCommon,

    update: function() {
      if (!this.disabled && (this.pressed || keyPressed(this.key))) sprite.centerY += 4;
    }
  });

  btRotateD = Button({
    x: 150,
    y: MAX_H - 58,
    initialY: MAX_H - 58,
    image: imageAssets['./arrow_small'],
    rotation: Math.PI,
    // disabled: true,
    key: "down",
    ...buttonCommon,

    update: function() {
      if (!this.disabled && (this.pressed || keyPressed(this.key))) sprite.centerY -= 4;
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
    x: p.x,
    y: p.y,

    update: function() {
      this.x = p.x - sprite.centerX;
      if (this.x < - sprite.radius) this.x += sprite.radius * 4;
    },

    render: function() {
      // if (Math.sqrt((this.x)**2 + (this.y)**2) > sprite.radius + 10) {
      //   return;
      // }

      this.context.save();
      this.context.fillStyle = 'red';
      this.context.beginPath();
      this.context.arc(0, 0, 5, 0, 2 * Math.PI);
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

    if (isPointer) {
      canvas.style.cursor = 'pointer';
      isPointer = false;
    } else {
      canvas.style.cursor = 'initial';
    }
  }
});

track(sprite);
loop.start(); // start the game
