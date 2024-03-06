import {
  Cesium3DTileset,
  CesiumTerrainProvider,
  Ion,
  SceneMode,
  Viewer,
  createOsmBuildingsAsync,
} from "cesium";
import {
  Math as CesiumMath,
  Cartesian3,
  HeadingPitchRoll,
  HeadingPitchRange,
  Model,
  Transforms,
  Ellipsoid,
  ModelAnimationLoop,
  Matrix4,
} from "cesium";
import { useEffect, useRef } from "react";

Ion.defaultAccessToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI4MTIzMzM3ZS1lNWEyLTRmNTAtYmI2Zi1hNjBlZTA3YTAyN2UiLCJpZCI6MTM1ODMzLCJpYXQiOjE2ODI1ODIzNjl9.04HzJGnDmmXKRbSzdhvE7epR9ny1xibwFRIZ1ipOM6Y";

function Plane() {
  const viewer = useRef<Viewer>(); //viewer
  const keyDownListener = useRef<(e: KeyboardEvent) => void>(); //键盘按下的事件
  const keyUpListener = useRef<(e: KeyboardEvent) => void>(); //键盘弹起的事件
  const preUpdateListener = useRef<(e: KeyboardEvent) => void>(); //viewer每帧渲染前的操作
  const planeModel = useRef<any>(); //飞机模型
  const headingPlus = useRef<boolean>(); //标识，是否处于右转状态
  const headingMinus = useRef<boolean>(); //标识，是否处于左转状态
  const pitchPlus = useRef<boolean>(); //标识，是否处于抬头状态
  const pitchMinus = useRef<boolean>(); //标识，是否处于低头状态
  const rollPlus = useRef<boolean>(); //标识，是否处于右旋状态
  const rollMinus = useRef<boolean>(); //标识，是否处于左旋状态
  const cameraBuffer = useRef<
    Array<{ position: Cartesian3; hpRoll: HeadingPitchRoll }>
  >(new Array<{ position: Cartesian3; hpRoll: HeadingPitchRoll }>());

  useEffect(() => {
    // 初始化Cesium
    const _viewer = new Viewer("cesiumContainer", {
      //terrainProvider: await terrain,
      vrButton: true, //开启VR按钮
      animation: true, //是否创建动画小器件，左下角仪表
      shouldAnimate: true, //让动画一直运行，不用点一下
      baseLayerPicker: false, //是否显示图层选择器
      fullscreenButton: false, //是否显示全屏按钮
      geocoder: false, //是否显示geocoder小器件，右上角查询按钮
      homeButton: false, //是否显示Home按钮
      infoBox: false, //是否显示信息框
      sceneModePicker: false, //是否显示3D/2D选择器
      selectionIndicator: false, //是否显示选取指示器组件
      timeline: true, //是否显示时间轴
      sceneMode: SceneMode.SCENE3D, //设定3维地图的默认场景模式:Cesium.SceneMode.SCENE2D、Cesium.SceneMode.SCENE3D、Cesium.SceneMode.MORPHING
      navigationHelpButton: false, //是否显示右上角的帮助按钮
      scene3DOnly: true, //如果设置为true，则所有几何图形以3D模式绘制以节约GPU资源
      navigationInstructionsInitiallyVisible: true,
      //showRenderLoopErrors: false, //是否显示渲染错误
      //设置背景透明
      orderIndependentTranslucency: false,
      contextOptions: {
        webgl: {
          alpha: true,
        },
      },
      //infoBox: false,
    });
    viewer.current = _viewer;
    const initViewer = async () => {
      const terrain = await CesiumTerrainProvider.fromIonAssetId(1, {
        requestWaterMask: true, // 请求水体效果所需要的海岸线数据
        requestVertexNormals: true, // 请求地形照明数据
      });
      console.log("Terrain准备就绪");
      _viewer.scene.terrainProvider = terrain;

      //尝试加载房屋模型
      try {
        const buildingTileset = await createOsmBuildingsAsync();
        _viewer.scene.primitives.add(buildingTileset);
      } catch (error) {
        console.log(`Error loading tileset: ${error}`);
      }
      // Add Cesium OSM Buildings, a global 3D buildings layer.

      //初始化各参数
      console.log("飞机运行函数执行");

      let hpRoll = new HeadingPitchRoll();
      let hpRange = new HeadingPitchRange(0, 0, 0);
      //模型初始位置
      let position = Cartesian3.fromDegrees(
        -74.01881302800248,
        40.69114333714821,
        753
      );
      //局部变换坐标系
      let fixedFrameTransform = Transforms.localFrameToFixedFrameGenerator(
        "north",
        "west"
      );

      //方向变化响应的度数
      let deltaRadians = CesiumMath.toRadians(0.5);
      //加入房屋模型
      /* try {
        const tileset = await Cesium3DTileset.fromIonAssetId(75343);
        _viewer.scene.primitives.add(tileset);
      } catch (error) {
        console.log(`Error loading tileset: ${error}`);
      } */
      //使用primitive加载模型
      if (!planeModel.current) {
        planeModel.current = true;

        let airplaneModel = _viewer.scene.primitives.add(
          await Model.fromGltfAsync({
            url: "/Cesium_Air.glb", //模型地址
            scale: 1.0, //缩放倍数
            modelMatrix: Transforms.headingPitchRollToFixedFrame(
              position,
              hpRoll,
              Ellipsoid.WGS84,
              fixedFrameTransform
            ), //模型旋转矩阵，这个原理应该是把模型自己的局部坐标系的朝向的变化以旋转矩阵的形式映射到固定坐标系上
            minimumPixelSize: 1, //模型缩放最小像素
          })
        );
        airplaneModel.readyEvent.addEventListener(() => {
          //设置相机初始位置
          planeModel.current = airplaneModel;
          airplaneModel.activeAnimations.addAll({
            multiplier: 0.5,
            loop: ModelAnimationLoop.REPEAT,
          });
          let r =
            2.0 *
            Math.max(
              airplaneModel.boundingSphere.radius,
              _viewer.camera.frustum.near
            );
          const center = airplaneModel.boundingSphere.center;
          const heading = CesiumMath.toRadians(230.0);
          const pitch = CesiumMath.toRadians(-20.0);
          hpRange.heading = heading;
          hpRange.pitch = pitch;
          hpRange.range = r * 3.0;
          _viewer.camera.lookAt(center, hpRange);

          //速度
          let speed = 10;
          //速度向量
          let speedVector = new Cartesian3();

          console.log(airplaneModel);
          //添加键盘监听事件：
          //注：
          //heading是左右水平转头
          //pitch是抬头低头
          //roll是左右歪头
          keyDownListener.current = (e: KeyboardEvent) => {
            switch (e.key) {
              //抬头
              case "ArrowUp":
              case "w":
                pitchPlus.current = true;
                console.log("抬头:pitch增加，当前转速为" + deltaRadians);
                break;
              case "ArrowDown":
              case "s":
                pitchMinus.current = true;
                console.log("低头:pitch减小，当前转速为" + deltaRadians);
                break;
              case "ArrowRight":
              case "d":
                headingPlus.current = true;
                console.log("右转:heading增加，当前转速为" + deltaRadians);
                break;
              case "ArrowLeft":
              case "a":
                headingMinus.current = true;
                console.log("左转:heading减少，当前转速为" + deltaRadians);
                break;
              case "e":
                rollPlus.current = true;
                console.log("右旋:roll增加，当前转速为" + deltaRadians);
                break;
              case "q":
                rollMinus.current = true;
                console.log("左旋:roll减小，当前转速为" + deltaRadians);
                break;
              case "j":
                speed = 100000;
                break;
              case "b":
                speed = 100;
                break;
            }
          };
          keyUpListener.current = (e: KeyboardEvent) => {
            switch (e.key) {
              //抬头
              case "ArrowUp":
              case "w":
                pitchPlus.current = false;
                console.log("抬头结束:pitch当前为- " + hpRoll.pitch);
                break;
              case "ArrowDown":
              case "s":
                pitchMinus.current = false;
                console.log("低头结束:pitch当前为- " + hpRoll.pitch);
                break;
              case "ArrowRight":
              case "d":
                headingPlus.current = false;
                console.log("右转结束:heading当前为- " + hpRoll.heading);
                break;
              case "ArrowLeft":
              case "a":
                headingMinus.current = false;
                console.log("左转结束:heading当前为- " + hpRoll.heading);
                break;
              case "e":
                rollPlus.current = false;
                console.log("右旋结束:roll当前为" + hpRoll.roll);
                break;
              case "q":
                rollMinus.current = false;
                console.log("左旋结束:roll当前为" + hpRoll.roll);
                break;
            }
          };
          document.addEventListener("keydown", keyDownListener.current);
          document.addEventListener("keyup", keyUpListener.current);

          //飞行路径
          //之后补充

          //渲染更新前阶段添加监听

          preUpdateListener.current =
            viewer.current!.scene.preUpdate.addEventListener(() => {
              //处理飞机转向的事件：
              if (pitchPlus.current) {
                //抬头
                hpRoll.pitch += deltaRadians;
                //判断是否超过2Π
                if (hpRoll.pitch >= CesiumMath.TWO_PI) {
                  hpRoll.pitch -= CesiumMath.TWO_PI;
                }
              }
              if (pitchMinus.current) {
                hpRoll.pitch -= deltaRadians;
                //判断是否小于0
                if (hpRoll.pitch < 0) {
                  hpRoll.pitch += CesiumMath.TWO_PI;
                }
              }
              if (headingPlus.current) {
                hpRoll.heading += deltaRadians;
                //判断是否超过2Π
                if (hpRoll.heading >= CesiumMath.TWO_PI) {
                  hpRoll.heading -= CesiumMath.TWO_PI;
                }
                //能否根据飞机当前位置转向
                /* hpRoll.heading += deltaRadians * Math.cos(hpRoll.roll);
                hpRoll.pitch += deltaRadians * Math.sin(hpRoll.roll);
                if (hpRoll.pitch >= CesiumMath.TWO_PI) {
                  hpRoll.pitch -= CesiumMath.TWO_PI;
                }
                if (hpRoll.heading >= CesiumMath.TWO_PI) {
                  hpRoll.heading -= CesiumMath.TWO_PI;
                }
                if (hpRoll.pitch < 0) {
                  hpRoll.pitch += CesiumMath.TWO_PI;
                }
                if (hpRoll.heading < 0) {
                  hpRoll.heading += CesiumMath.TWO_PI;
                }*/
              }
              if (headingMinus.current) {
                hpRoll.heading -= deltaRadians;
                //判断是否小于0
                if (hpRoll.heading < 0) {
                  hpRoll.heading += CesiumMath.TWO_PI;
                }
              }
              if (rollPlus.current) {
                hpRoll.roll += deltaRadians;
                //判断是否超过2Π
                if (hpRoll.roll >= CesiumMath.TWO_PI) {
                  hpRoll.roll -= CesiumMath.TWO_PI;
                }
              }
              if (rollMinus.current) {
                hpRoll.roll -= deltaRadians;
                //判断是否小于0
                if (hpRoll.roll < 0) {
                  hpRoll.roll += CesiumMath.TWO_PI;
                }
              }
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
                hpRoll,
                Ellipsoid.WGS84,
                fixedFrameTransform,
                airplaneModel.modelMatrix
              );
              if (viewer.current) {
                //console.log("位置变化");
                //使用LookAt实现
                /* const center = airplaneModel.boundingSphere.center;
                //console.log(position);
                //构建一个新的对象，确保变动触发
                if (hpRoll.pitch < CesiumMath.PI / 2) {
                  hpRange.heading = hpRoll.heading;
                  hpRange.pitch = hpRoll.pitch;
                } else if (hpRoll.pitch > (CesiumMath.PI / 2) * 3) {
                  hpRange.heading = hpRoll.heading;
                  hpRange.pitch = hpRoll.pitch - CesiumMath.TWO_PI;
                }
                _viewer.scene.camera.lookAt(
                  center,
                  //new Cartesian3(0, 0, 1000)
                  hpRange
                ); */
                //使用setView实现
                let cameraVector = new Cartesian3();
                let cameraPosition = new Cartesian3();
                cameraVector = Cartesian3.multiplyByScalar(
                  Cartesian3.UNIT_X,
                  -100,
                  cameraVector
                );

                cameraPosition = Matrix4.multiplyByPoint(
                  airplaneModel.modelMatrix,
                  cameraVector,
                  cameraPosition
                );
                //使用计时器——容易造成卡顿
                /* let timer = setTimeout(() => {
                try {
                  _viewer.scene.camera.setView({
                    destination: cameraPosition,
                    orientation: hpRoll,
                  });
                } catch (e) {
                  console.log("定时器任务未执行");
                  clearTimeout(timer);
                }
                }, 50); */

                //使用buffer
                if (cameraBuffer.current.length < 12) {
                  cameraBuffer.current.push({
                    position: cameraPosition,
                    hpRoll: hpRoll,
                  });
                } else {
                  cameraBuffer.current.push({
                    position: cameraPosition,
                    hpRoll: hpRoll,
                  });
                  let cameraValue = cameraBuffer.current.shift();
                  _viewer.scene.camera.setView({
                    destination: cameraValue?.position,
                    orientation: cameraValue?.hpRoll,
                  });
                }
              }
            });
        });
      }
    };

    initViewer();

    //在StrictMode下，useEffect会运行两次，帮助你做好析构操作。所以对于Cesium需要做好回收工作
    return () => {
      console.log("回收阶段");
      if (planeModel.current && !planeModel.current.isDestroyed()) {
        console.log("模型回收");
        planeModel.current.destroy();
      }
      if (keyDownListener.current) {
        console.log("键盘监听器回收");
        document.removeEventListener("keydown", keyDownListener.current);
        keyDownListener.current = undefined;
      }
      if (keyUpListener.current) {
        console.log("键盘监听器回收");
        document.removeEventListener("keydown", keyUpListener.current);
        keyUpListener.current = undefined;
      }

      if (preUpdateListener.current) {
        console.log("预渲染监听器回收");
        document.removeEventListener("keydown", preUpdateListener.current);
        preUpdateListener.current = undefined;
      }
      if (viewer.current && !viewer.current.isDestroyed()) {
        console.log("viewer回收");
        try {
          viewer.current.destroy();
          console.log("Viewer是否摧毁：" + viewer.current.isDestroyed());
          viewer.current = undefined;
        } catch (e) {
          console.log(e);
        }
      }
    };
  }, [1]);

  return (
    <div
      key="cesiumContainer-plane"
      className="absolute h-[100%] w-[100%]"
      id="cesiumContainer"
    ></div>
  );
}

export default Plane;
