const SkeletonCard = () => {
  return (
    <div className="w-full bg-gray-200 animate-pulse rounded-xl p-4 h-[180px]">
      <div className="w-full h-10 bg-gray-300 rounded-md"></div>
      <div className="mt-3 w-3/4 h-4 bg-gray-300 rounded-md"></div>
      <div className="mt-2 w-1/2 h-4 bg-gray-300 rounded-md"></div>

      <div className="mt-4 flex gap-2">
        <div className="w-16 h-4 bg-gray-300 rounded-md"></div>
        <div className="w-16 h-4 bg-gray-300 rounded-md"></div>
      </div>
    </div>
  );
};

export default SkeletonCard;
