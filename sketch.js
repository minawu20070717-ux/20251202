let spriteSheet;
let leftSprite; // 來自資料夾 2/all.png 的精靈表
let rightImg; // 來自資料夾 1 的 999.png
let bgImage; // 背景圖片
const RIGHT_TOTAL_FRAMES = 3; // 999.png 共3幀
// 單一幀寬度為 整張圖寬 255 / 5 幀 = 51
const FRAME_W = 51;
const FRAME_H = 47;
const TOTAL_FRAMES = 5;
// 左向精靈（2/all.png）參數：每格 35x44，共 3 幀
const LEFT_FRAME_W = 45;
const LEFT_FRAME_H = 45;
const LEFT_TOTAL_FRAMES = 3;

// 角色座標與速度
let playerX;
let playerY;
const MOVE_SPEED = 4;

const FRAME_DELAY = 7; // 切換間隔（以 draw() 的 frame 計數為單位）

// 跳躍相關
let vy = 0;
const GRAVITY = 0.8;
const JUMP_STRENGTH = 20;
let onGround = false;

function preload() {
  // index.html 與 sketch.js 在資料夾 1118，圖片在上層的 1/ 與 2/
  spriteSheet = loadImage('../1/all.png', 
    () => console.log('spriteSheet loaded'),
    (err) => console.error('spriteSheet load error', err)
  );
  // 載入位於資料夾 ../2 的 all.png（按左鍵時使用）
  leftSprite = loadImage('../2/all.png',
    () => console.log('leftSprite loaded'),
    (err) => console.error('leftSprite load error', err)
  );
  // 載入右向專用圖片 999.png
  rightImg = loadImage('../1/999.png',
    () => console.log('rightImg (999.png) loaded'),
    (err) => console.error('rightImg load error', err)
  );
  // 載入背景圖片
  bgImage = loadImage('../背景/1.jpg',
    () => console.log('bgImage loaded'),
    (err) => console.error('bgImage load error', err)
  );
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  noSmooth();
  // 初始位置置中
  playerX = width / 2;
  // 初始 Y 放在地面附近（使用 FRAME_H 與放大倍率估算）
  const SCALE = 5;
  playerY = height - (FRAME_H * SCALE) / 2 - 10;
  vy = 0;
  onGround = true;
}
function draw() {
  // 繪製背景圖片或預設背景色
  if (bgImage) {
    image(bgImage, 0, 0, width, height);
  } else {
    background('#f5c9eaff');
  }
  // 先處理按鍵：若按右鍵或左鍵，使用 rightImg 的三幀精靈表
  const SCALE = 5;
  let flipped = false;
  let img = spriteSheet;
  let fw = FRAME_W;
  let fh = FRAME_H;
  let tf = TOTAL_FRAMES;

  if ((keyIsDown(RIGHT_ARROW) || keyIsDown(LEFT_ARROW)) && rightImg) {
    img = rightImg;
    // 999.png: 寬151, 高47, 共3幀 → 每格寬度 151/3
    fw = img.width / RIGHT_TOTAL_FRAMES;
    fh = img.height;
    tf = RIGHT_TOTAL_FRAMES;
    if (keyIsDown(RIGHT_ARROW)) {
      playerX += MOVE_SPEED;
      flipped = false;
    } else if (keyIsDown(LEFT_ARROW)) {
      playerX -= MOVE_SPEED;
      flipped = true;
    }
  } else {
    // 預設使用精靈表（或 leftSprite 當按左時切換）
    if (keyIsDown(LEFT_ARROW) && leftSprite) {
      img = leftSprite;
      fw = LEFT_FRAME_W;
      fh = LEFT_FRAME_H;
      tf = LEFT_TOTAL_FRAMES;
    }
  }

  // 計算目前幀
  const idx = floor(frameCount / FRAME_DELAY) % tf;
  const sx = idx * fw;
  const sy = 0;

  // 放大三倍
  const drawW = fw * SCALE;
  const drawH = fh * SCALE;

  // 邊界限制（確保不會移出畫面）
  playerX = constrain(playerX, drawW / 2, width - drawW / 2);

  // 跳躍物理：根據當前 drawH 計算地面高度，更新垂直速度與位置
  const groundY = height - drawH / 2 - 10;
  playerY += vy;
  vy += GRAVITY;
  if (playerY >= groundY) {
    playerY = groundY;
    vy = 0;
    onGround = true;
  } else {
    onGround = false;
  }

  // 繪製在 playerX/playerY（置中對齊），若需要鏡像則用 transform
  const dx = playerX - drawW / 2;
  const dy = playerY - drawH / 2;
  if (flipped) {
    push();
    translate(dx + drawW, dy);
    scale(-1, 1);
    image(img, 0, 0, drawW, drawH, sx, sy, fw, fh);
    pop();
  } else {
    image(img, dx, dy, drawW, drawH, sx, sy, fw, fh);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function keyPressed() {
  // 按上鍵跳躍（僅當站在地面時）
  if (keyCode === UP_ARROW && onGround) {
    vy = -JUMP_STRENGTH;
    onGround = false;
  }
}