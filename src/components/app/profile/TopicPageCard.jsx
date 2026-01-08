import { TbFileText } from "react-icons/tb";
import { auth } from "../../../assets/export";




const TopicPageCard = ({ img, title, description, tags, Follows, className, onClick,pagetype }) => {
  const baseClasses =
    `  rounded-[12px] border border-[0.8px] flex flex-col pt-5 pb-5 pl-3 pr-3 space-y-2  ${className}`;


  // Create an array of users based on the number of followers
  const userImages = [
    "https://randomuser.me/api/portraits/women/3.jpg",
    "https://randomuser.me/api/portraits/men/2.jpg",
    "https://randomuser.me/api/portraits/women/1.jpg",
    // Add more images if needed
  ];

  // If there are more than 3 followers, show only 3 images
  const imagesToShow = Follows > 3 ? userImages.slice(0, 3) : userImages.slice(0, Follows);

  return (
    <div className={baseClasses} onClick={onClick} >
      <div className="w-full flex items-center gap-2 overflow-hidden ">
        <img src={img} alt={img} className="w-[40px] h-[40px] rounded-full" />
        <div className="flex justify-between items-center gap-3">
          <h2 className="text-[16px] font-medium text-[##000000] cursor-pointer">{title}</h2>
          <TbFileText className="w-[16px] h-[16px] " />
        </div>
      </div>
      <p className="text-[14px] font-normal  text-[#000000]">{description.slice(0, 60)}...</p>
      <div className="flex flex-wrap">
        {tags?.map((tag, i) => (
          <span
            key={i}
            className="text-[14px] text-[#6D6D6D] rounded-full mr-2"
          >
            {tag}
          </span>
        ))}
      </div>
      {/* <div className="w-full flex items-center justify-between ">
        {Follows > 0 && (
          <div className="w-full flex items-center gap-[70px] relative">
            <div className="flex items-center relative">
              <div className="flex items-center">
                {imagesToShow.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Follower ${index + 1}`}
                    className="w-[24px] h-[24px] rounded-full absolute"
                    style={{ left: `${index * 12}px` }}
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center gap-1">
              <p className="text-[14px] font-[600] text-[#000000]">
                {Follows}+
              </p>
              <p className="text-[14px] font-[500] text-[#ADADAD]">
                Follows
              </p>
            </div>
          </div>
        )}

      </div> */}
    </div>
  )
}
TopicPageCard.displayName = "TopicPageCard";
export default TopicPageCard