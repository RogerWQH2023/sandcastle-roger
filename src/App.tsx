import React, { Component, ReactComponentElement, useState } from "react";
import HelloWorld from "./pages/HelloWorld";
import PageCard from "./components/PageCard";
import HomePage from "./pages/HomePage";
import MineCleaner from "./pages/MineCleaner";
import SlitheringSnake from "./pages/SlitheringSnake";
import Plane from "./pages/Plane";

type Pages = {
  title: string; //标题
  iconUrl: string; //url
  page: any; //传入页面
};

const CURRENTPAGES: Pages[] = [
  { title: "Home Page", iconUrl: "/home-w.png", page: <HomePage /> },
  { title: "Cesium Test", iconUrl: "/home-w.png", page: <HelloWorld /> },
  { title: "Mine Cleaner", iconUrl: "/mine.png", page: <MineCleaner /> },
  {
    title: "Slithering Snake",
    iconUrl: "/snake.png",
    page: <SlitheringSnake />,
  },
  {
    title: "Plane Simulator",
    iconUrl: "/home-w.png",
    page: <Plane />,
  },
];

function App() {
  const [currentPage, setCurrentPage] = useState<any>(<HomePage />);

  const changePage = (page: any) => {
    setCurrentPage(page);
  };

  return (
    <div className="absolute w-[100%] h-[100%] bg-lime-400 bg-[url('/pinjie.png')] bg-[length:500px] bg-repeat">
      <div className="absolute w-[90%] h-[95%] top-[2.5%] left-[5%] rounded-[10px] overflow-hidden shadow-2xl">
        <div className="absolute bg-indigo-500 h-[64px] w-[100%] top-0 rounded-t-[10px] flex">
          <div className="relative left-[10px] flex items-center w-[calc(15%-5px)] min-w-[calc(200px-5px)] space-x-3">
            <a
              href="https://github.com/RogerWQH2023"
              target="_blank"
              title="My Github Page"
            >
              <img
                src="/wqh-logo.jpg"
                className="w-[48px] h-[48px] rounded-[24px] shadow-lg scale-[0.95] hover:scale-[1.0] active:scale-[0.85]"
              ></img>
            </a>
            <p className="font-extrabold text-gray-200 font-mono text-[20px] leading-[20px] hover:animate-wave">
              GAME COLLECTION
            </p>
          </div>
        </div>
        <div className="absolute bg-indigo-500 bottom-0 left-0 right-0 flex w-[100%] h-[calc(100%-64px)] rounded-b-[10px] ">
          <div className="absolute left-0 h-[100%] w-[15%] min-w-[200px] bg-indigo-500 rounded-b-[10px]">
            <div className="absolute top-[0px] left-[10px] right-[10px]">
              <a
                href="https://github.com/RogerWQH2023"
                target="_blank"
                title="Game Collection Github Page"
              >
                <div className="h-[33px] text-gray-200 bg-indigo-700 leading-[33px] rounded-[10px] hover:bg-indigo-800 shadow-inner flex items-center font-mono text-[13px]">
                  <img
                    src="/github-w.png"
                    className="w-[18px] h-[18px] ml-[10px]"
                  ></img>
                  <div className="ml-[10px]">Access Repository</div>
                </div>
              </a>
              <hr className="mt-[5px] mb-[10px]" />
              {CURRENTPAGES.map((element, index) => {
                return (
                  <PageCard
                    key={"pagecard-" + index + "-name-" + element.title}
                    pageInfo={{
                      title: element.title,
                      iconUrl: element.iconUrl,
                      page: element.page,
                    }}
                    pageChange={changePage}
                  />
                );
              })}
            </div>
          </div>
          <div className="absolute h-[calc(100%+32px)] w-[calc(85%-5px)] max-w-[calc(100%-200px-5px)] right-[5px] bottom-[5px] translate-y-[-32px]overflow-hidden bg-white rounded-[10px] shadow-lg border-indigo-600 border-[1px]">
            <div className="absolute w-[100%] h-[100%] rounded-[10px] shadow-inner overflow-hidden">
              {currentPage}
            </div>
          </div>
          0
        </div>
      </div>
    </div>
  );
}

export default App;
