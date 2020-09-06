const MAX_W = 1200;
const MAX_H = 800;

const LIGHT_BLUE = "#228fe3";
const PURPLE = "#3d51ab";
const AQUAMARINE = "#3ddc97";
const BURGUNDY = "#6c0e23";
const GRULLO = "#A69888";
const DARK_GREY = "#1c1b1b";
const GREY = "#666";

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


let { init, Sprite, GameLoop, initKeys, keyPressed, initPointer, onPointerDown, track, Button, Grid, Text, load, imageAssets, clamp, keyMap, Scene, randInt } = kontra
let { canvas, context } = init();
let isPointer = false;

initKeys();
initPointer();

keyMap['NumpadAdd'] = 'plus';
keyMap['NumpadSubtract'] = 'minus';


// MAP
let map = Sprite({
  x: (MAX_W - 300) / 2,
  y: MAX_H / 2,
  initialY: MAX_H / 2,
  radius: (MAX_H / 2) - 100,
  centerX: 0,
  centerY: 0,
  // interactive: true,

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
    //return true;
    let dx = pointer.x - this.x;
    let dy = pointer.y - this.y;
    return Math.sqrt(dx * dx + dy * dy) < this.radius;
  },

  onDown: function(pointer) {
    // handle on down events on the sprite
    console.log(pointer.x, pointer.y)
    console.log('raio',this.radius)
    let x = pointer.x - this.x - canvas.offsetLeft;
    let y = pointer.y - this.y - canvas.offsetTop;

    x += this.centerX * this.scaleX;
    x /= this.scaleX;
    if (x > this.radius*4) x -= this.radius * 4;

    y = y / this.scaleX;

    console.log(`{ id: 1, name: '', x: ${x}, y: ${y} } // ${this.centerX}`);

    // if (this.interactive) createJump(x, y);
    createJump(x, y);
  },

  move: function(x, y) {
    this.centerX += x;
    this.centerY += y;

    this.centerY = clamp(-250, 250, this.centerY);
    this.y = this.initialY + this.centerY;

    if (this.centerX > this.radius * 4) {
      this.centerX -= this.radius * 4;
    }
    if (this.centerX < 0) {
      this.centerX += this.radius * 4;
    }

    this.children.forEach((c) => {
      c.update();
    });
  },

  update: function() {
    return;
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

    // selectedJumps.forEach((e, i) => {
    //   if (i == 0 || i == currentJump) return;
    //
    //   let x0 = selectedJumps[i - 1].x;
    //   let y0 = selectedJumps[i - 1].y;
    //
    //   let x1, y1;
    //   if (!this.interactive) {
    //     x1 = x0 + (e.x - x0) * (e.progress / 100);
    //     y1 = y0 + (e.y - y0) * (e.progress / 100);
    //   } else {
    //     x1 = e.x;
    //     y1 = e.y;
    //   }
    //
    //   this.context.beginPath();
    //   this.context.moveTo(x0, y0);
    //   this.context.setLineDash([5, 10]);
    //   this.context.lineWidth = 2;
    //   this.context.lineTo(x1, y1);
    //   this.context.closePath();
    //   this.context.stroke();
    // });
  }
});


// JUMPS GRID
let jumpsGrid = Grid({
  x: 12,
  y: 12,
  anchor: {x: 0, y: 0},
  rowGap: 20,
});


// BUTTONS
let btRotateL, btRotateR, btRotateU, btRotateD, btZoomIn, btZoomOut;
load('./arrow.png', './arrow_small.png', './zoomin.png', './zoomout.png').then(() => {
  let buttonCommon = {
    text: { font: '0px' },
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
      if (!this.disabled && (this.pressed || keyPressed(this.key))) map.zoomIn();
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
      if (!this.disabled && (this.pressed || keyPressed(this.key))) map.zoomOut();
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
      if (this.pressed || keyPressed(this.key)) map.move(-4, 0);
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
      if (this.pressed || keyPressed(this.key)) map.move(4, 0);
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
      if (!this.disabled && (this.pressed || keyPressed(this.key))) map.move(0, 4);
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
      if (!this.disabled && (this.pressed || keyPressed(this.key))) map.move(0, -4);
    }
  });

  sidebar.addChild(btZoomIn);
  sidebar.addChild(btZoomOut);
  sidebar.addChild(btRotateL);
  sidebar.addChild(btRotateU);
  sidebar.addChild(btRotateD);
  sidebar.addChild(btRotateR);
});

// SIDEBAR
let sidebar = Sprite({
  x: MAX_W - 300,
  y: 0,
  width: 300,
  height: MAX_H,
  color: DARK_GREY,
  children: [jumpsGrid],
  render: function() {
    this.context.strokeStyle = GREY;
    this.context.lineWidth = 4;
    this.draw();
    this.context.strokeRect(2, 2, this.width - 4, this.height - 4);
  }
});

// NEXT JUMP
let nextBt = Button({
  x: MAX_W - 300 - 120,
  y: MAX_H - 50,
  padX: 20,
  padY: 20,
  disabled: true,
  anchor: {x: 0.5, y: 0.5},
  text: {
    text: 'NEXT JUMP',
    color: PURPLE,
    font: 'bold 30px monospace',
    anchor: {x: 0.5, y: 0.5}
  },
  update: function() {
    this.disabled = selectedJumps.length <= currentJump;
  },
  render: function() {
    if (this.disabled) {
      this.textNode.text = '';
      return;
    } else {
      this.textNode.text = 'NEXT JUMP';
    }

    if (this.hovered) {
      isPointer = true;
    }

    this.context.lineWidth = 8;
    this.context.strokeStyle = PURPLE;
    this.context.fillStyle = LIGHT_BLUE;
    this.context.strokeRect(0, 0, this.width, this.height);
    this.context.fillRect(0, 0, this.width, this.height);
  },
  onDown: function() {
    nextJump();
  }
});

// POINTS
let pointsCounter = Sprite({
  anchor: {x: 0, y: 1},
  x: 0,
  y: MAX_H,
  width: 200,
  height: 40,
  color: 'darkslategrey'
});



// MENU
let title = Text({
  text: 'AQUI VAI O NOME DO JOGO',
  font: '42px monospace',
  color: 'purple',
  x: MAX_W / 2,
  y: (MAX_H / 4) * 1,
  anchor: {x: 0.5, y: 0.5},
});
let menuButtonCommon = {
  anchor: {x: 0.5, y: 0.5},
  render: function() {
    if (this.hovered) {
      isPointer = true;
      this.textNode.color = '#ff0';
    } else {
      this.textNode.color = '#ddd';
    }

    this.draw();
  }
};
let startBt = Button({
  text: {
    text: 'Start',
    color: '#ddd',
    font: '30px Arial, sans-serif',
    anchor: {x: 0.5, y: 0.5},
  },
  ...menuButtonCommon,
  onDown: function() {
    generateJumps();
    menuScene.hide();
    gameScene.show();
  },
});
let instructionBt = Button({
  text: {
    text: 'Instructions',
    color: '#ddd',
    font: '30px Arial, sans-serif',
    anchor: {x: 0.5, y: 0.5},
  },
  disabled: true,
  ...menuButtonCommon,
});
let menu = Grid({
  x: MAX_W / 2,
  y: (MAX_H / 4) * 3,
  anchor: {x: 0.5, y: 0.5},
  rowGap: 20,
  justify: 'center',
  children: [startBt, instructionBt]
});
let menuScene = Scene({
  id: 'menu',
  children: [title, menu]
});



// MAIN GAME
let gameScene = Scene({
  id: 'game',
  children: [map, sidebar, pointsCounter, nextBt]
});




let image = new Image();
// image.src = "https://openclipart.org/image/2000px/svg_to_png/1733/molumen-world-map-1.png";
image.src = "./map_new.png";
image.onload = function() {
  map.image = image;
};


// PLACES
PLACES.forEach((p) => {
  p.sprite = Sprite({
    x: p.x,
    y: p.y,

    update: function() {
      this.x = p.x - map.centerX;
      if (this.x < - map.radius) this.x += map.radius * 4;
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

  map.addChild(p.sprite);
});


// JUMPS
let jumps, selectedJumps, currentJump;
function generateJumps() {
  jumps = [];
  selectedJumps = [];
  currentJump = 0;

  while (jumps.length < 5) {
    let selected = randInt(0, PLACES.length - 1);
    if (!jumps.find(e => e == PLACES[selected])) jumps.push(PLACES[selected]);
  }

  jumps.forEach(function(j, i) {
    jumpsGrid.addChild(Text({
      text: j.name,
      font: '26px Arial',
      color: 'white',
      width: 300,
      jumpNumber: i,
      render: function() {
        if (currentJump > this.jumpNumber) {
          this.color = AQUAMARINE;
        } else if (currentJump == this.jumpNumber) {
          this.color = PURPLE;
        } else {
          this.color = 'white';
        }
        this.draw();
      }
    }));
  });
}

function createJump(x, y) {
  if (selectedJumps.length > currentJump) {
    let j = selectedJumps.pop();
    map.removeChild(j);
  }

  let s = Sprite({
    jumpNumber: currentJump,
    initialX: x,
    initialY: y,
    x: x,
    y: y,
    color: AQUAMARINE,
    // progress: currentJump == 0 ? 100 : 0,

    update: function() {
      this.x = x - map.centerX;
      if (this.x < - map.radius) this.x += map.radius * 4;

      this.color = this.jumpNumber == currentJump ? PURPLE : AQUAMARINE;

      // if (this.jumpNumber != currentJump - 1) return;
      // if (this.progress != 100) {
      //   this.progress++;
      // } else {
      //   checkJump();
      // }
    },

    render: function() {
      this.context.save();

      this.context.fillStyle = this.color;
      this.context.strokeStyle = DARK_GREY;
      this.context.lineWidth = 1;

      this.context.beginPath();
      this.context.arc(0, 0, 3, 0, 2 * Math.PI);
      this.context.closePath();
      this.context.fill();
      this.context.stroke();

      this.context.beginPath();
      this.context.moveTo(0,0);
      this.context.bezierCurveTo(2,-10,-20,-25,0,-30);
      this.context.bezierCurveTo(20,-25,-2,-10,0,0);
      this.context.closePath();
      this.context.fill();
      this.context.stroke();

      this.context.beginPath();
      this.context.arc(0,-21,3,0,Math.PI*2);
      this.context.closePath();
      this.context.fillStyle = 'white';
      this.context.fill();

      this.context.restore();
    }
  });

  selectedJumps.push(s);
  map.addChild(s);
}

function nextJump() {
  let i = currentJump;
  let jump = selectedJumps[i];
  let distance = Math.sqrt((jump.initialX - jumps[i].x)**2 + (jump.initialY - jumps[i].y)**2);
  if (distance > 1200) distance -= 1200;
  if (distance > 10) {
    alert(` 404 \n YOU LOSE \n DISTANCE ${distance} `);
    location.reload();
    return;
  }

  // map.interactive = true
  currentJump++;
  if (currentJump == 5) return finishGame();
}

function finishGame() {
  let message = 'YOU WIN!\n';

  selectedJumps.forEach((j, i) => {
    let distance = Math.sqrt((j.initialX - jumps[i].x)**2 + (j.initialY - jumps[i].y)**2);
    if (distance > 1200) distance -= 1200;
    message += `${jumps[i].name} WITH DISTANCE ${distance}\n`;
  });

  alert(message);
  location.reload();
}


let loop = GameLoop({
  // create the main game loop
  update: function () {
    // update the game state
    menuScene.update();
    gameScene.update();

    PLACES.forEach((p) => {
      if (p.sprite) p.sprite.update();
    });
  },
  render: function () {
    // render the game state
    menuScene.render();
    gameScene.render();

    // Change mouse to pointer
    if (isPointer) {
      canvas.style.cursor = 'pointer';
      isPointer = false;
    } else {
      canvas.style.cursor = 'initial';
    }
  }
});

track(map);

// OPEN MENU
//gameScene.hide();
//menuScene.show();

// STRAIGHT TO GAME
generateJumps();
menuScene.hide();
gameScene.show();

loop.start(); // start the game
