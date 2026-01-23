import { TbFileText } from "react-icons/tb";
import Button from "../common/Button";
import { topics } from "../../assets/export";


const SubcriptionCard = ({
  img,
  title,
  description,
  tags,
  Follows,
  className,
  buttonText,
  header,
  headerbutton,
  isSubscribed,
  onSubscribe,
  Followers,
}) => {

  const baseClasses =
    `rounded-[12px] border border-[0.8px] flex flex-col p-3 space-y-2 ${className}`;

    console.log(Followers,"Followers")

  return (
    <div>
      <div className="w-full flex items-center justify-between p-2">
        <h2 className="text-[14px] font-[600] text-[#000000] capitalize">{header}</h2>
        <button className="text-[13px] font-[400] text-[#DE4B12]">{headerbutton}</button>
      </div>

      <div className={baseClasses}>

        <div className="flex items-center gap-2">
          <img src={img} className="w-[40px] h-[40px] rounded-full" />
          <h2 className="text-[16px] font-medium text-[#000000]">{title}</h2>
        </div>

        <p className="text-[14px] font-normal text-[#000000]">{description}</p>
        <p className="text-[13px] font-[400] text-[#ADADAD]">{tags}</p>

        <div className="w-full flex items-center justify-between">
          <div className="w-full flex items-center gap-[70px] relative">
             {/* Display real follower images dynamically */}
            {Followers && Followers.length > 0 && (
              <div className="flex items-center">
                {Followers.slice(0, 3).map((follower, index) => (
                  <img
                    key={index}
                    src={follower}
                    className={`w-[24px] h-[24px] rounded-full absolute top-0 left-${index * 5}`}
                    alt={`follower-${index}`}
                  />
                ))}
              </div>
            )}

            {/* <div className="flex items-center gap-1">
              <p className="text-[14px] font-[600] text-[#000000]">{Follows}+</p>
              <p className="text-[14px] font-[500] text-[#ADADAD]">Follows</p>
            </div> */}
          </div>

          {/* BUTTON */}
          <Button
            disabled={isSubscribed}                 // 🔥 disables button
            className={`w-full py-[6px] font-[600] text-[14px] flex items-center justify-center 
              ${isSubscribed ? "bg-gray-400 cursor-not-allowed" : ""}`}
            variant={isSubscribed ? "none" : "orange"}   // 🔥 grey if subscribed
            onClick={() => !isSubscribed && onSubscribe?.()} // 🔥 Only open modal if not subscribed
          >
            {isSubscribed ? "Subscribed" : "Subscribe"}
          </Button>

        </div>
      </div>
    </div>
  );
};

SubcriptionCard.displayName = "SubcriptionCard";
export default SubcriptionCard 