import { IoSearch } from "react-icons/io5";
import { auth } from "../../assets/export";
import Input from "../common/Input";
import { useState } from "react";
import SubcriptionCard from "./SubcriptionCard";
import Button from "../common/Button";
export default function AddStore({handleNext,handlePrevious}) {
  const [searchQuery, setSearchQuery] = useState("");
  const trending = [
    {
        title: "Justin’s Basketball",
        desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.",
        hashtags: ["#Loremipsum", "#Loremipsum", "#Loremipsum"],
    },
    {
        title: "Justin’s Basketball",
        desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.",
        hashtags: ["#Loremipsum", "#Loremipsum", "#Loremipsum"],
    },
    {
        title: "Justin’s Basketball",
        desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.",
        hashtags: ["#Loremipsum", "#Loremipsum", "#Loremipsum"],
    },
    {
        title: "Justin’s Basketball",
        desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.",
        hashtags: ["#Loremipsum", "#Loremipsum", "#Loremipsum"],
    },
    {
        title: "Justin’s Basketball",
        desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.",
        hashtags: ["#Loremipsum", "#Loremipsum", "#Loremipsum"],
    },
    {
        title: "Justin’s Basketball",
        desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.",
        hashtags: ["#Loremipsum", "#Loremipsum", "#Loremipsum"],
    },
];
  return (
    <div className="bg-white flex items-center justify-center rounded-[19px] w-full p-6">
      <div className="flex flex-col  items-center justify-center md:w-[700px] w-full">
        <div className="flex flex-col items-center justify-center gap-4">
          <h2 className="text-[32px] font-bold leading-[48px]">
            Recommendations
          </h2>
          <p className="text-[18px] font-normal text-center leading-[27px] text-[#3C3C43D9]">
            Based on the topics you like, we think you’ll want to check out a
            few of these topic pages.
          </p>
          <Input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            iconLeft={<IoSearch className="text-gray-500" />}
            size="md"
          />
        </div>
        <div className="w-full grid grid-cols-12 gap-4 py-6 overflow-y-scroll h-[500px] ">
         
          {trending.map((item) => (
            <div   key={item} className="col-span-6">
            <SubcriptionCard
            
              className=""
              img={auth}
              title={item.title}
              description={item.desc}
              tags={item.hashtags}
              Follows={item.follows}
              buttonText="Subscribe"
              headerbutton="View All"
              header="To"
            />
          </div>
          ))}
          {/* <div className="col-span-6">
            <SubcriptionCard
              className=""
              img={auth}
              title="Funny"
              description="Based on the topics you like, we think you’ll want to check out a few of these topic pages."
              tags="#Funny"
              Follows="2"
              buttonText="Subscribe"
              header="TopXSDS"
              headerbutton="View All"   
            />
          </div> */}
        </div>
        <Button variant="orange" size="full" onClick={handleNext} className="w-full flex items-center justify-center">
            Next
        </Button>
      </div>
    </div>
  );
}
