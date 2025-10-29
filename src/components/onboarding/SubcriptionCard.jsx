import { TbFileText } from "react-icons/tb";
import Button from "../common/Button";
import { auth } from "../../assets/export";



const SubcriptionCard = ({img,title,description ,tags ,Follows,className,buttonText,header,headerbutton, ...props}) => {
   const baseClasses =
    `bg-[#F8F8F8]  rounded-[12px] border border-[0.8px] flex flex-col p-3 space-y-2      ${className}`;
    return (
        <div>
<div className="w-full flex items-center justify-between p-2"  >
    <h2 className="text-[14px] font-[600] text-[##000000]">{header}</h2>
    <button className="text-[13px] font-[400] text-[#DE4B12]">{headerbutton}</button>
</div>
        <div className={baseClasses} {...props} >
           

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
            <Button className="w-full py-[6px] font-[600] text-[14px]" >
                {buttonText}
            </Button>
          </div>
        </div>  
        </div>
    )
}
SubcriptionCard.displayName = "SubcriptionCard";
export default SubcriptionCard