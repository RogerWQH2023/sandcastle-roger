import * as Cesium from "cesium";
import { useEffect, useRef } from "react";

function HelloWorld() {
  const viewer = useRef<Cesium.Viewer>();
  useEffect(() => {
    // 初始化Cesium
    const _viewer = new Cesium.Viewer("cesiumContainer", {
      animation: false, //是否创建动画小器件，左下角仪表
      baseLayerPicker: false, //是否显示图层选择器
      fullscreenButton: false, //是否显示全屏按钮
      geocoder: false, //是否显示geocoder小器件，右上角查询按钮
      homeButton: false, //是否显示Home按钮
      infoBox: false, //是否显示信息框
      sceneModePicker: false, //是否显示3D/2D选择器
      selectionIndicator: false, //是否显示选取指示器组件
      timeline: false, //是否显示时间轴
      sceneMode: Cesium.SceneMode.SCENE3D, //设定3维地图的默认场景模式:Cesium.SceneMode.SCENE2D、Cesium.SceneMode.SCENE3D、Cesium.SceneMode.MORPHING
      navigationHelpButton: false, //是否显示右上角的帮助按钮
      scene3DOnly: true, //如果设置为true，则所有几何图形以3D模式绘制以节约GPU资源
      navigationInstructionsInitiallyVisible: false,
      showRenderLoopErrors: false, //是否显示渲染错误
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
    /* _viewer.camera.lookAt(
      Cesium.Cartesian3.fromDegrees(123, 40, 5000),
      new Cesium.Cartesian3(0, 0, 50000)
    ); */

    //在StrictMode下，useEffect会运行两次，帮助你做好析构操作。所以对于Cesium需要做好回收工作
    return () => {
      if (viewer.current && !viewer.current.isDestroyed()) {
        viewer.current.destroy();
        console.log("Viewer状态：" + viewer.current.isDestroyed());
      }
    };
  }, [1]);
  return (
    <div className="absolute h-[100%] w-[100%]" id="cesiumContainer"></div>
  );
}

export default HelloWorld;
