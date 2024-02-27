import { useEffect, useRef, useState } from "react";
import Block, { BlockState } from "./components/Block";
import { PositionProperty } from "cesium";

//棋盘大小
const MAXX = 40;
const MAXY = 40;
//初速度
const DEFAULTSPEED = 20;

//定义方向类型
enum Direction {
  Up = 1, //让枚举类型从1开始计数，防止被当成false
  Down,
  Left,
  Right,
}

type Position = {
  //定义位置类型，存储x，y坐标
  x: number;
  y: number;
};

type SnakeReturnValue = {
  deletePos: Position | null;
  addPos: Position | null;
};

class Snake {
  length: number = 1; //存储蛇身长度
  body: Position[] = [{ x: 0, y: 0 }]; //存储蛇各截身体位置，第一截尾部，最后一节是头部（方便append）
  maxX: number = MAXX; //棋盘位置的最大值，用于到头后穿越。
  maxY: number = MAXY;
  heading: Direction = Direction.Right; //朝向

  constructor(length: number, body: Position[]) {
    this.length = length;
    this.body = body;
  }

  setHeading = (heading: Direction) => {
    //更改当前方向
    this.heading = heading;
    return;
  };

  getHeadPos = () => {
    //获得蛇头位置
    return this.body[this.body.length - 1];
  };

  //获得一个方块的上/下/左/右方块。（边界会从另一边出来）
  getUp = (pos: Position) => {
    let newX = pos.x - 1;
    let newY = pos.y;
    if (newX < 0) newX = MAXX - 1;
    const newPos: Position = { x: newX, y: newY };
    return newPos;
  };
  getDown = (pos: Position) => {
    let newX = pos.x + 1;
    let newY = pos.y;
    if (newX > MAXX - 1) newX = 0;
    const newPos: Position = { x: newX, y: newY };
    return newPos;
  };
  getRight = (pos: Position) => {
    let newX = pos.x;
    let newY = pos.y + 1;
    if (newY > MAXY - 1) newY = 0;
    const newPos: Position = { x: newX, y: newY };
    return newPos;
  };
  getLeft = (pos: Position) => {
    let newX = pos.x;
    let newY = pos.y - 1;
    if (newY < 0) newY = MAXY - 1;
    const newPos: Position = { x: newX, y: newY };
    return newPos;
  };

  //获得下一个方块的位置（根据朝向）
  getNext = (): Position => {
    switch (this.heading) {
      case Direction.Up:
        return this.getUp(this.getHeadPos());
        break;
      case Direction.Down:
        return this.getDown(this.getHeadPos());
        break;
      case Direction.Left:
        return this.getLeft(this.getHeadPos());
        break;
      case Direction.Right:
        return this.getRight(this.getHeadPos());
        break;
    }
  };

  update = (nState: BlockState) => {
    //更新蛇的位置
    if (nState === "normal") {
      let addPos = this.getNext();
      let deletePos = this.body.shift();
      this.body.push(addPos);
      let callBack: SnakeReturnValue = {
        addPos: addPos,
        deletePos: deletePos ? deletePos : null,
      };
      return callBack;
    }
    //更新蛇的位置
    if (nState === "food") {
      let addPos = this.getNext();
      this.body.push(addPos);
      this.length++;
      let callBack: SnakeReturnValue = {
        addPos: addPos,
        deletePos: null,
      };
      return callBack;
    }
    if (nState === "snake" || nState === "block") {
      //如果撞墙或自己，则返回空气
      let callBack: SnakeReturnValue = {
        addPos: null,
        deletePos: null,
      };
      return callBack;
    }
  };
}

function SlitheringSnake() {
  const [reStart, setReStart] = useState<Boolean>(false); //是否需要重启
  const [running, setRunning] = useState<Boolean>(false); //是否正在运行中
  const [timerReady, setTimerReady] = useState<Boolean>(false); //计时器是否就绪
  const [speed, setSpeed] = useState<number>(DEFAULTSPEED); //多少毫秒前进一格
  const [cBordData, setCBordData] = useState<BlockState[][]>([[]]); //棋盘

  const operations = useRef<Direction[]>([]); //用于存储用户的操作，最多存两步。（用于掉头）
  const timer = useRef<any>(null); //用于存储计时器
  const snake = useRef<Snake>(
    new Snake(10, [
      { x: 0, y: 0 },
      { x: 0, y: 1 },
      { x: 0, y: 2 },
      { x: 0, y: 3 },
      { x: 0, y: 4 },
      { x: 0, y: 5 },
      { x: 0, y: 6 },
      { x: 0, y: 7 },
      { x: 0, y: 8 },
      { x: 0, y: 9 },
    ])
  );
  const boardData = useRef<BlockState[][]>([[]]); //构建初始变量

  const updateSnake = () => {
    //根据操作缓存更新蛇的朝向：
    let newHeading = operations.current.shift();
    if (!!newHeading) {
      snake.current.setHeading(newHeading);
    }

    //更新蛇状态
    let nextPos = snake.current.getNext();
    let nextStatus: BlockState;
    if (
      //这里要处理一下蛇首尾相接时的问题，防止错误死亡。
      nextPos.x === snake.current.body[0].x &&
      nextPos.y === snake.current.body[0].y
    ) {
      nextStatus = "normal";
    } else {
      nextStatus = boardData.current[nextPos.x][nextPos.y];
    }
    let callBack: SnakeReturnValue | undefined;
    //根据下一个方块是啥而选择更新方式
    switch (nextStatus) {
      case "normal":
        callBack = snake.current.update("normal");
        break;
      case "food":
        callBack = snake.current.update("food");
        break;
      case "snake":
        callBack = snake.current.update("snake");
        //如果吃到自己或者障碍则游戏结束
        snake.current.body.map((item, index) => {
          boardData.current[item.x][item.y] = "death";
        });
        break;
      case "block":
        callBack = snake.current.update("block");
        //如果吃到自己或者障碍则游戏结束
        snake.current.body.map((item, index) => {
          boardData.current[item.x][item.y] = "death";
        });
        break;
    }

    //更新蛇在版上的位置
    if (callBack?.deletePos) {
      boardData.current[callBack.deletePos.x][callBack.deletePos.y] = "normal";
    }
    if (callBack?.addPos) {
      boardData.current[callBack.addPos.x][callBack.addPos.y] = "snake";
    }

    //更新渲染
    setCBordData([...boardData.current]);
    console.log();
  };

  useEffect(() => {
    //如果触发了游戏重来则初始化所有对象
    if (reStart === true) {
      setReStart(false);
      setRunning(false);
      snake.current = new Snake(10, [
        { x: 0, y: 0 },
        { x: 0, y: 1 },
        { x: 0, y: 2 },
        { x: 0, y: 3 },
        { x: 0, y: 4 },
        { x: 0, y: 5 },
        { x: 0, y: 6 },
        { x: 0, y: 7 },
        { x: 0, y: 8 },
        { x: 0, y: 9 },
      ]);
      boardData.current = new Array(MAXX);
      for (let i = 0; i < MAXY; i++) {
        boardData.current[i] = new Array(MAXY).fill("normal" as BlockState);
      }
      //初始化蛇的位置
      snake.current.body.map((item, index) => {
        boardData.current[item.x][item.y] = "snake";
      });

      //初始化砖块的位置
      const block: Position[] = [
        { x: 10, y: 8 },
        { x: 10, y: 9 },
        { x: 9, y: 8 },
        { x: 9, y: 9 },
        { x: 8, y: 8 },
        { x: 8, y: 9 },
        { x: 22, y: 8 },
        { x: 22, y: 9 },
        { x: 23, y: 8 },
        { x: 23, y: 9 },
        { x: 24, y: 8 },
        { x: 24, y: 9 },
        { x: 15, y: 20 },
        { x: 15, y: 21 },
        { x: 14, y: 20 },
        { x: 14, y: 21 },
        { x: 13, y: 20 },
        { x: 13, y: 21 },
        { x: 22, y: 33 },
        { x: 22, y: 32 },
        { x: 23, y: 33 },
        { x: 23, y: 32 },
        { x: 24, y: 33 },
        { x: 24, y: 32 },
        { x: 32, y: 23 },
        { x: 32, y: 22 },
        { x: 33, y: 23 },
        { x: 33, y: 22 },
        { x: 34, y: 23 },
        { x: 34, y: 22 },
      ];
      block.map((item, index) => {
        boardData.current[item.x][item.y] = "block";
      });

      //初始化食物的位置(临时)
      const food: Position[] = [];
      new Array(60).fill(0).map((item, index) => {
        food.push({
          x: Math.floor(Math.random() * 40),
          y: Math.floor(Math.random() * 40),
        });
      });
      food.map((item, index) => {
        if (
          boardData.current[item.x][item.y] !== "block" &&
          boardData.current[item.x][item.y] !== "snake"
        )
          boardData.current[item.x][item.y] = "food";
      });
    }
    setCBordData((old) => (old = [...boardData.current]));
  }, [reStart]);

  useEffect(() => {
    //游戏进行状态中，需要根据计时器不断更新
    if (running) {
      if (!timerReady) {
        setTimerReady(true);
        timer.current = setInterval(() => {
          //在棋盘上更新新蛇的位置
          updateSnake();
        }, speed);
      } else {
        if (timer.current) {
          clearInterval(timer.current);
          timer.current = null;
        }
        timer.current = setInterval(() => {
          updateSnake();
        }, speed);
      }
    } else {
      //running为false，需要停止计时器
      setTimerReady(false);
      if (timer.current) {
        clearInterval(timer.current);
        timer.current = null;
      }
    }
  }, [running, speed]);

  //当键盘按下时将操作存入缓存中，最多存储两步，在下一帧触发。
  function handleKeyDown(event: any) {
    if (event.key === "ArrowUp") {
      if (
        (operations.current.length === 0 &&
          snake.current.heading !== Direction.Up &&
          snake.current.heading !== Direction.Down) ||
        (operations.current.length === 1 &&
          operations.current[0] !== Direction.Up &&
          operations.current[0] !== Direction.Down)
      ) {
        //snake.current.setHeading(Direction.Up);
        operations.current.push(Direction.Up);
      }
    }
    if (event.key === "ArrowDown") {
      if (
        (operations.current.length === 0 &&
          snake.current.heading !== Direction.Up &&
          snake.current.heading !== Direction.Down) ||
        (operations.current.length === 1 &&
          operations.current[0] !== Direction.Up &&
          operations.current[0] !== Direction.Down)
      ) {
        operations.current.push(Direction.Down);
      }
    }
    if (event.key === "ArrowLeft") {
      if (
        (operations.current.length === 0 &&
          snake.current.heading !== Direction.Left &&
          snake.current.heading !== Direction.Right) ||
        (operations.current.length === 1 &&
          operations.current[0] !== Direction.Left &&
          operations.current[0] !== Direction.Right)
      ) {
        operations.current.push(Direction.Left);
      }
    }
    if (event.key === "ArrowRight") {
      if (
        (operations.current.length === 0 &&
          snake.current.heading !== Direction.Left &&
          snake.current.heading !== Direction.Right) ||
        (operations.current.length === 1 &&
          operations.current[0] !== Direction.Left &&
          operations.current[0] !== Direction.Right)
      ) {
        operations.current.push(Direction.Right);
      }
    }
  }

  return (
    <div
      className="absolute w-[100%] h-[100%] bg-white items-center justify-center text-white flex"
      onKeyDown={handleKeyDown}
    >
      <button
        className="absolute left-[5px] top-[5px] w-[60px] h-[30px] border-[1px] border-black bg-gray-400 text-white rounded-[3px]"
        onClick={() => {
          setReStart(true);
        }}
      >
        Restart
      </button>
      {running ? (
        <button
          className="absolute left-[5px] top-[45px] w-[60px] h-[30px] border-[1px] border-black bg-gray-400 text-white rounded-[3px]"
          onClick={() => {
            setRunning(false);
          }}
        >
          Stop
        </button>
      ) : (
        <button
          className="absolute left-[5px] top-[45px] w-[60px] h-[30px] border-[1px] border-black bg-gray-400 text-white rounded-[3px]"
          onClick={() => {
            setRunning(true);
          }}
        >
          Run
        </button>
      )}

      <table className="border-gray-300 border-[3px]">
        {cBordData.map((item, index1) => {
          return (
            <tr>
              {item.map((item, index2) => {
                return (
                  <td className="w-[16px] h-[16px]">
                    <Block
                      key={"block-" + index1 + "-" + index2}
                      state={item}
                    ></Block>
                  </td>
                );
              })}
            </tr>
          );
        })}
      </table>
    </div>
  );
}

export default SlitheringSnake;
