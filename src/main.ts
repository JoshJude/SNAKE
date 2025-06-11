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

  let state: State | null = null;

  const startGame = () => {
    state = {
      snake: [
        { x: 3, y: 0 },
        { x: 2, y: 0 },
        { x: 1, y: 0 },
        { x: 0, y: 0 },
      ],
      food: getRandomPosition(),
      direction: Direction.Right,
      nextDirection: Direction.Right,
      paused: false,
      gameOver: false,
      score: 0,
      speed: 200,
    };

    tick();
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

  const tick = () => {
    moveSnake();
    draw();
    requestAnimationFrame(tick);
  };

  const draw = () => {
    if (!state) {
      console.error("Game state is not initialized.");
      return;
    }

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
    ctx.fillText("SNAKE", BORDER_SIZE, BORDER_SIZE - 4);

    // Display the score
    ctx.font = "12pt Monospace";
    ctx.fillText(`SCORE: ${state.score}`, BORDER_SIZE, CANVAS_SIZE - 16);

    // Draw the snake
    state.snake.forEach((segment) => {
      fillPixelPosition(segment);
    });

    // Draw the food
    fillPixelPosition(state.food);
  };

  const getRandomPosition = (): Position => {
    const x = Math.floor(Math.random() * GRID_SIZE);
    const y = Math.floor(Math.random() * GRID_SIZE);
    return { x, y };
  };

  const moveSnake = () => {
    if (!state || state.paused || state.gameOver) return;
    const now = Date.now();
    if (state.lastMoveTime && now - state.lastMoveTime < state.speed) {
      return; // Not enough time has passed to move the snake
    }
    state.lastMoveTime = now;
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

    state.snake.unshift(newHead);
    state.snake.pop();

    // Check for collision with itself
  };

  globalThis.addEventListener("keydown", (e) => {
    if (!state || state.gameOver) return;
    console.log(e.code);

    if (!state.paused) {
      switch (e.code) {
        case "ArrowUp":
          state.direction = Direction.Up;
          break;
        case "ArrowDown":
          state.direction = Direction.Down;
          break;
        case "ArrowLeft":
          state.direction = Direction.Left;
          break;
        case "ArrowRight":
          state.direction = Direction.Right;
          break;
        case "Space":
          console.log("pause");
          state.paused = true;
          break;
      }
    } else {
      if (e.code === "Space") {
        state.paused = false;
      }
    }
  });

  startGame();
});
