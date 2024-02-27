type UnderConstructionProps = {
  title?: string;
};

function UnderConstruction(props: UnderConstructionProps) {
  return (
    <div className="absolute w-[100%] h-[100%] bg-indigo-300 items-center justify-center text-white text-[100px] font-mono font-[800] flex">
      <div className="text-center">
        "{props.title}" <br />
        Under construction
      </div>
    </div>
  );
}

export default UnderConstruction;
