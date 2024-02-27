import UnderConstruction from "@/pages/UnderConstruction";

export type PageInfo = {
  iconUrl?: string; //图标的url
  title?: string; //文字内容
  page?: Object; //加载的页面
};

type PageCardProps = {
  pageInfo?: PageInfo; //当前页面信息
  pageChange?: (page: Object) => void; //点击后的效果
};

function PageCard(props: PageCardProps) {
  const pageInfo = props.pageInfo;
  return (
    <div
      className="h-[33px] mt-[3px] font-[600] font-mono text-[16px] text-gray-200 leading-[33px] rounded-[10px] hover:bg-indigo-400 flex items-center"
      onClick={() => {
        if (props.pageChange && pageInfo?.page) {
          props.pageChange(pageInfo.page);
        }
        /*else if (props.pageChange) {
          props.pageChange(<UnderConstruction title={pageInfo?.title} />);
        }*/
      }}
    >
      <img
        src={pageInfo?.iconUrl}
        className="w-[18px] h-[18px] ml-[10px]"
      ></img>
      <div className="ml-[10px]">{pageInfo?.title}</div>
    </div>
  );
}

export default PageCard;
