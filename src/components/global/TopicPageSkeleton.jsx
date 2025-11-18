export default function TopicPageSkeleton() {
  return (
    <div className="rounded-[12px] border border-[0.8px] p-3 bg-white animate-pulse space-y-3">

      {/* Image + Title Row */}
      <div className="flex items-center gap-2">
        <div className="w-[40px] h-[40px] bg-gray-300 rounded-full"></div>
        <div className="h-[14px] w-[60%] bg-gray-300 rounded"></div>
      </div>

      {/* Description */}
      <div className="h-[12px] w-full bg-gray-200 rounded"></div>
      <div className="h-[12px] w-[80%] bg-gray-200 rounded"></div>

      {/* Tags */}
      <div className="flex gap-2 flex-wrap">
        <div className="h-[10px] w-[50px] bg-gray-200 rounded-full"></div>
        <div className="h-[10px] w-[40px] bg-gray-200 rounded-full"></div>
        <div className="h-[10px] w-[60px] bg-gray-200 rounded-full"></div>
      </div>

      {/* Followers */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2 relative">
          <div className="w-[24px] h-[24px] bg-gray-300 rounded-full absolute top-0 left-0"></div>
          <div className="w-[24px] h-[24px] bg-gray-300 rounded-full absolute top-0 left-5"></div>
          <div className="w-[24px] h-[24px] bg-gray-300 rounded-full absolute top-0 left-10"></div>
        </div>
        <div className="h-[12px] w-[60px] bg-gray-300 rounded"></div>
      </div>
    </div>
  );
}
