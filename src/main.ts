const GRID_SIZE = 32;
const BORDER_SIZE = 32;
const PIXEL_SIZE = 8;
const CANVAS_SIZE = GRID_SIZE * PIXEL_SIZE + BORDER_SIZE * 2;
const BACKGROUND_COLOUR = "#77EE33";
const FOREGROUND_COLOUR = "#000000";

enum Direction {
  Up = "up",
  Down = "down",
  Left = "left",
  Right = "right",
}

interface Position {
  x: number;
  y: number;
}

interface State {
  snake: Position[];
  food: Position;
  direction: Direction;
  nextDirection: Direction;
  paused: boolean;
  gameOver: boolean;
  score: number;
  speed: number; // milliseconds between moves
  lastMoveTime?: number; // timestamp of the last move
}

const INITIAL_STATE = {
  snake: [
    { x: GRID_SIZE / 2 + 2, y: GRID_SIZE / 2 - 1 },
    { x: GRID_SIZE / 2 + 1, y: GRID_SIZE / 2 - 1 },
    { x: GRID_SIZE / 2, y: GRID_SIZE / 2 - 1 },
    { x: GRID_SIZE / 2 - 1, y: GRID_SIZE / 2 - 1 },
  ],
  food: { x: 0, y: 0 },
  direction: Direction.Right,
  nextDirection: Direction.Right,
  paused: false,
  gameOver: true,
  score: 0,
  speed: 250,
};

document.addEventListener("DOMContentLoaded", () => {
  const canvasElement = document.getElementById("game") as HTMLCanvasElement;

  const canvas = canvasElement as HTMLCanvasElement;
  canvas.width = CANVAS_SIZE;
  canvas.height = CANVAS_SIZE;

  const ctx = canvas.getContext("2d");

  if (!ctx) {
    alert("Could not get canvas context!");
    return;
  }

  let state: State = { ...INITIAL_STATE };

  const tick = () => {
    moveSnake();
    draw();
    requestAnimationFrame(tick);
  };

  const draw = () => {
    drawFrame();

    if (state.gameOver) {
      drawGameOver();
    } else if (state.paused) {
      drawPaused();
    } else {
      drawGame();
    }
  };

  const fillPixelPosition = (position: Position) => {
    ctx.fillStyle = FOREGROUND_COLOUR;
    ctx.fillRect(
      position.x * PIXEL_SIZE + BORDER_SIZE,
      position.y * PIXEL_SIZE + BORDER_SIZE,
      PIXEL_SIZE,
      PIXEL_SIZE
    );
  };

  const drawFrame = () => {
    const size = Math.min(globalThis.innerWidth, globalThis.innerHeight);
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;

    // Clear the canvas
    ctx.fillStyle = BACKGROUND_COLOUR;
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    ctx.fillStyle = FOREGROUND_COLOUR;
    ctx.strokeStyle = FOREGROUND_COLOUR;

    // Draw the border
    ctx.strokeRect(
      BORDER_SIZE,
      BORDER_SIZE,
      CANVAS_SIZE - BORDER_SIZE * 2,
      CANVAS_SIZE - BORDER_SIZE * 2
    );

    // Display the title
    ctx.font = "12pt Monospace";
    ctx.textAlign = "left";
    ctx.fillText("SNAKE", BORDER_SIZE, BORDER_SIZE - 4);

    // Display the score
    ctx.fillText(`SCORE: ${state.score}`, BORDER_SIZE, CANVAS_SIZE - 16);
  };

  const drawGame = () => {
    // Draw the snake
    state.snake.forEach((segment) => {
      fillPixelPosition(segment);
    });

    // Draw the food
    fillPixelPosition(state.food);
  };

  const drawPaused = () => {
    ctx.font = "12pt Monospace";
    ctx.textAlign = "center";
    ctx.fillText("PAUSED", CANVAS_SIZE / 2, CANVAS_SIZE / 2);
  };

  const drawGameOver = () => {
    ctx.font = "12pt Monospace";
    ctx.textAlign = "center";
    ctx.fillText("PRESS SPACE TO START", CANVAS_SIZE / 2, CANVAS_SIZE / 2);
  };

  const getRandomPosition = (): Position => {
    console.log("GET RANDOM POSITION");
    const x = Math.floor(Math.random() * GRID_SIZE);
    const y = Math.floor(Math.random() * GRID_SIZE);
    const newPosition = { x, y };

    if (state.snake.some((s) => positionMatches(s, newPosition))) {
      return getRandomPosition();
    }

    return newPosition;
  };

  const positionMatches = (a: Position, b: Position) => {
    return a.x === b.x && a.y === b.y;
  };

  const moveSnake = () => {
    if (state.paused || state.gameOver) return;
    const now = Date.now();
    if (state.lastMoveTime && now - state.lastMoveTime < state.speed) {
      return; // Not enough time has passed to move the snake
    }
    state.lastMoveTime = now;
    state.direction = state.nextDirection;

    const newHead: Position = { ...state.snake[0] };
    switch (state.direction) {
      case Direction.Up:
        newHead.y = (newHead.y - 1 + GRID_SIZE) % GRID_SIZE;
        break;
      case Direction.Down:
        newHead.y = (newHead.y + 1) % GRID_SIZE;
        break;
      case Direction.Left:
        newHead.x = (newHead.x - 1 + GRID_SIZE) % GRID_SIZE;
        break;
      case Direction.Right:
        newHead.x = (newHead.x + 1) % GRID_SIZE;
        break;
    }

    if (state.snake.some((s) => positionMatches(s, newHead))) {
      state.gameOver = true;
    } else if (positionMatches(newHead, state.food)) {
      state.snake.unshift(newHead);
      state.score += 1;
      state.speed = Math.max(50, state.speed - 10);
      state.food = getRandomPosition();
    } else {
      state.snake.unshift(newHead);
      state.snake.pop();
    }
  };

  globalThis.addEventListener("keydown", (e) => {
    switch (e.code) {
      case "ArrowUp":
        if (
          state.direction === Direction.Down ||
          state.paused ||
          state.gameOver
        )
          return;
        state.nextDirection = Direction.Up;
        break;
      case "ArrowDown":
        if (state.direction === Direction.Up || state.paused || state.gameOver)
          return;
        state.nextDirection = Direction.Down;
        break;
      case "ArrowLeft":
        if (
          state.direction === Direction.Right ||
          state.paused ||
          state.gameOver
        )
          return;
        state.nextDirection = Direction.Left;
        break;
      case "ArrowRight":
        if (
          state.direction === Direction.Left ||
          state.paused ||
          state.gameOver
        )
          return;
        state.nextDirection = Direction.Right;
        break;
      case "Space":
        if (state.gameOver) {
          state = { ...INITIAL_STATE };
          state.food = getRandomPosition();
          state.gameOver = false;
        } else {
          state.paused = !state.paused;
        }
        break;
    }
  });

  tick();
});
