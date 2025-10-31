import { TbFileText } from "react-icons/tb";
import { auth } from "../../../assets/export";




const TopicPageCard = ({img,title,description ,tags ,Follows,className,}) => {
   const baseClasses =
    `  rounded-[12px] border border-[0.8px] flex flex-col p-3 space-y-2 ${className}`;
    return (
      

        <div className={baseClasses} >
           

            <div className="flex items-center gap-2  ">
                <img src={img} alt={img} className="w-[40px] h-[40px] rounded-full" />
                <h2 className="text-[16px] font-medium text-[##000000]">{title}</h2>
                <TbFileText className="w-[16px] h-[16px] "/>
            </div>
            <p className="text-[14px] font-normal  text-[#000000]">{description}</p>  
            <p>{tags}</p>
          <div className="w-full flex items-center justify-between ">
            <div className="w-full flex items-center gap-[70px] relative">
                <div className=" flex items-center  ">
                    <img src={auth} alt={auth} className="w-[24px] h-[24px] rounded-full absolute top-0 left-0" />
                    <img src={auth} alt={auth} className="w-[24px] h-[24px] rounded-full absolute top-0 left-5" />
                    <img src={auth} alt={auth} className="w-[24px] h-[24px] rounded-full absolute top-0 left-10" />
                </div>
                <div className="flex items-center gap-1">
                    <p className="text-[14px] font-[600]  text-[#000000]">{Follows}+</p>
                    <p className="text-[14px] font-[500]  text-[#ADADAD]">Follows</p>
                </div>
            </div>
           
          </div>
        </div>  
    )
}
TopicPageCard.displayName = "TopicPageCard";
export default TopicPageCard