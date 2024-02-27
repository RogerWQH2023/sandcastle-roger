# 小飞机

## 来源

更改自 Cesium SandCastle 的 HeadingPitchPoll 案例
  - 地址：https://sandcastle.cesium.com/index.html?src=HeadingPitchRoll.html

## 想法

- [x] 完成小飞机页面的 React,TS 化
  - 注意 strict 模式下的析构，放在 useEffect 的 return 里
- [x] - 更改相机跟随的实现形式，实现 360°，headingPitchRoll 任意旋转。
  - 原先飞机 pitch 旋转超过 90° 相机就无法跟随了，应该是 LookAt 方法的限制。
  - [x] 使用 SetView 方法仿制 LookAt 的效果，实现 360° 旋转。
  - [x] 让相机的跟随延迟一段时间，营造出有惯性的感觉 （setTimeOut）
    - 缺点：Cesium实际帧数会波动，而计时器的缓冲时间固定。当发生帧数波动时会导致摄像机延迟的距离不稳定，产生比较严重的画面撕裂
      - [x] 考虑改为做一个数组的缓冲，只有当数组内相机变动操作超过一定值，才开始shift，否则就只push，这样就能按帧数进行操作了。
        - 这步做完之后，不再有飞机闪现情况，效果良好
- [x] - 加载城市场景和光影水体地形，使场景更丰富
  - 异步加载
- [ ] - 优化操作方式，使之更符合力学
  - [x] - 初步优化：按键按下后持续修正 headingPitchRoll，而非触发键盘连点器实现连续转向
    - 这一步的好处是，由于是逐帧计算，所以转向更加丝滑了
  - [ ] - 高级优化：模拟飞行的力学模型-需要先去了解一下游戏里一般怎样模拟飞机飞行的力学模型
- [ ] - 与模型的碰撞检测？
