export type BlockState = "normal" | "snake" | "food" | "block" | "death";

type BlockProps = {
  state: BlockState;
};

function Block(props: BlockProps) {
  switch (props.state) {
    case "normal":
      return (
        <div className="bg-gray-300 w-[100%] h-[100%] rounded-[3px] shadow-inner"></div>
      );

    case "snake":
      return (
        <div className="bg-green-600 w-[100%] h-[100%] rounded-[3px]"></div>
      );
    case "food":
      return (
        <div className="bg-yellow-400 w-[100%] h-[100%] rounded-[3px] shadow-inner"></div>
      );
    case "block":
      return <div className="bg-black w-[100%] h-[100%] rounded-[3px]"></div>;
    case "death":
      return (
        <div className="bg-red-600 w-[100%] h-[100%] rounded-[3px]">
          <div className="bg-red-600 w-[100%] h-[100%] rounded-[3px] animate-ping"></div>
        </div>
      );
  }
}

export default Block;
