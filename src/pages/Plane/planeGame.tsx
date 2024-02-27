import {
  Viewer,
  Math as CesiumMath,
  Cartesian3,
  HeadingPitchRoll,
  Model,
  Transforms,
  Ellipsoid,
  Matrix4,
} from "cesium";
import { MutableRefObject, useEffect, useRef } from "react";

function PlaneGame(props: { viewer: MutableRefObject<Viewer | undefined> }) {
  const flag = useRef(false);
  const keyListener = useRef<(e: KeyboardEvent) => void>();
  const preUpdateListener = useRef<(e: KeyboardEvent) => void>();
  const planeModel = useRef<any>();
  const modelLoaded = useRef(false);

  const planeGameInit = async () => {
    if (!flag.current && props.viewer?.current) {
      //初始化各参数
      console.log("飞机运行函数执行");
      flag.current = true;
      const viewer = props.viewer.current;

      let headingPitchRoll = new HeadingPitchRoll();
      //模型初始位置
      let position = Cartesian3.fromDegrees(120, 30, 5000);
      //局部变换坐标系
      let fixedFrameTransform = Transforms.localFrameToFixedFrameGenerator(
        "north",
        "west"
      );

      //方向变化响应的度数
      let deltaRadians = CesiumMath.toRadians(5.0);

      //使用primitive加载模型
      if (!modelLoaded.current) {
        modelLoaded.current = true;
        let airplaneModel = viewer.scene.primitives.add(
          await Model.fromGltfAsync({
            url: "/Cesium_Air.glb", //模型地址
            scale: 100.0, //缩放倍数
            modelMatrix: Transforms.headingPitchRollToFixedFrame(
              position,
              headingPitchRoll,
              Ellipsoid.WGS84,
              fixedFrameTransform
            ), //模型旋转矩阵，这个原理应该是把模型自己的局部坐标系的朝向的变化以旋转矩阵的形式映射到固定坐标系上
            minimumPixelSize: 256, //模型缩放最小像素
          })
        );
        airplaneModel.readyEvent.addEventListener(() => {
          //设置相机初始位置
          viewer.camera.setView({
            destination: new Cartesian3(
              -2769293.799109788,
              4796599.883886506,
              3171113.878101777
            ),
            orientation: new HeadingPitchRoll(
              6.283185307179586,
              -0.7854060155492881,
              6.283185307179586
            ),
          });
          console.log(airplaneModel);
          //添加键盘监听事件：
          //注：
          //heading是左右水平转头
          //pitch是抬头低头
          //roll是左右歪头
          planeModel.current = airplaneModel;
          if (!keyListener.current) {
            keyListener.current = (e: KeyboardEvent) => {
              switch (e.key) {
                //抬头
                case "ArrowUp":
                case "w":
                  headingPitchRoll.pitch += deltaRadians;
                  //判断是否超过2Π
                  if (headingPitchRoll.pitch >= CesiumMath.TWO_PI) {
                    headingPitchRoll.pitch -= CesiumMath.TWO_PI;
                  }
                  console.log("抬头:pitch当前为- " + headingPitchRoll.pitch);
                  viewer.camera.setView({
                    destination: new Cartesian3(
                      -2769293.799109788,
                      4796599.883886506,
                      3171113.878101777
                    ),
                    orientation: new HeadingPitchRoll(
                      6.283185307179586,
                      -0.7854060155492881,
                      6.283185307179586
                    ),
                  });
                  props.viewer.current = viewer;
                  console.log("VIEWER");
                  console.log(viewer.isDestroyed());
                  break;
                case "ArrowDown":
                case "s":
                  headingPitchRoll.pitch -= deltaRadians;
                  //判断是否小于0
                  if (headingPitchRoll.pitch < 0) {
                    headingPitchRoll.pitch += CesiumMath.TWO_PI;
                  }
                  console.log("低头:pitch当前为- " + headingPitchRoll.pitch);
                  break;
                case "ArrowRight":
                case "d":
                  headingPitchRoll.heading += deltaRadians;
                  //判断是否超过2Π
                  if (headingPitchRoll.heading >= CesiumMath.TWO_PI) {
                    headingPitchRoll.heading -= CesiumMath.TWO_PI;
                  }
                  console.log("左转:pitch当前为- " + headingPitchRoll.heading);
                  break;
                case "ArrowLeft":
                case "a":
                  headingPitchRoll.heading -= deltaRadians;
                  //判断是否小于0
                  if (headingPitchRoll.heading < 0) {
                    headingPitchRoll.heading += CesiumMath.TWO_PI;
                  }
                  console.log(
                    "右转:heading当前为- " + headingPitchRoll.heading
                  );
                  break;
              }
            };
            document.addEventListener("keydown", keyListener.current);
          }

          //速度
          let speed = 100;
          //速度向量
          let speedVector = new Cartesian3();

          //飞行路径
          //之后补充

          //渲染更新前阶段添加监听
          preUpdateListener.current = viewer.scene.preUpdate.addEventListener(
            () => {
              speedVector = Cartesian3.multiplyByScalar(
                Cartesian3.UNIT_X,
                speed / 10,
                speedVector
              );
              position = Matrix4.multiplyByPoint(
                airplaneModel.modelMatrix,
                speedVector,
                position
              );
              //将点添加到路径
              //之后补充

              //更新模型姿态与位置
              Transforms.headingPitchRollToFixedFrame(
                position,
                headingPitchRoll,
                Ellipsoid.WGS84,
                fixedFrameTransform,
                airplaneModel.modelMatrix
              );
            }
          );
        });
      }
    }
  };

  useEffect(() => {
    console.log("useEffect触发");
    if (flag.current == false) {
      planeGameInit();
    }

    return () => {
      console.log("Plane回收阶段");
      if (planeModel.current && !planeModel.current.isDestroyed()) {
        console.log("模型回收");
        planeModel.current.destroy();
        modelLoaded.current = false;
      }
      if (keyListener.current) {
        console.log("键盘监听器回收");
        document.removeEventListener("keydown", keyListener.current);
        keyListener.current = undefined;
      }
      if (preUpdateListener.current) {
        console.log("预渲染监听器回收");
        document.removeEventListener("keydown", preUpdateListener.current);
        preUpdateListener.current = undefined;
      }
      flag.current = false; //由于StrictMode会把useEffect加载两次，所以回收的时候注意要让他重新加载
    };
  });

  return <></>;
}
export default PlaneGame;
