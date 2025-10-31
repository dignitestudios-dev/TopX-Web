import { useState } from "react";
import LargeProfile from "../../components/app/profile/LargeProfile";
import MySubscription from "../../components/homepage/MySubscription";
import { BookOpen, Lightbulb } from "lucide-react";
import { FaPlus } from "react-icons/fa";
import { FiPlus } from "react-icons/fi";
import Card from "../../components/common/Card";
import SubcriptionCard from "../../components/onboarding/SubcriptionCard";
import { auth } from "../../assets/export";
import KnowledgePostCard from "../../components/app/profile/KnowledgePostCard";

export default function Profile() {
    const [selected, setSelected] = useState("Posts");
    const [activeTab, setActiveTab] = useState('topics');
    return (
        <div className="flex flex-col md:flex-row  min-h-screen max-w-7xl mx-auto pt-3 md:gap-6 gap-2 px-3">
            <div className="w-full md:w-1/4">

            <MySubscription />
            </div>
            <div className="w-full md:w-3/4 flex flex-col gap-3">
           <LargeProfile />
            <div className=" flex flex-col gap-3">
                {/* Tabs Container */}
                <div className="flex gap-2 border-b border-gray-200">
                    {/* My Topic Pages Tab */}
                    <button
                        onClick={() => setActiveTab('topics')}
                        className={`flex items-center gap-2 px-4 py-3 font-medium transition-all relative ${
                            activeTab === 'topics'
                                ? 'text-orange-600'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        <div className={`p-1.5 rounded ${
                            activeTab === 'topics' ? 'bg-orange-600' : 'bg-gray-400'
                        }`}>
                            <BookOpen className="text-white" size={16} />
                        </div>
                        <span>My Topic Pages</span>
                        
                        {/* Active Indicator */}
                        {activeTab === 'topics' && (
                            <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-orange-600"></div>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('knowledge')}
                        className={`flex items-center gap-2 px-4 py-3 font-medium transition-all relative ${
                            activeTab === 'knowledge'
                                ? 'text-orange-600'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        <div className={`p-1.5 rounded ${
                            activeTab === 'knowledge' ? 'bg-orange-600' : 'bg-gray-400'
                        }`}>
                            <Lightbulb className="text-white" size={16} />
                        </div>
                        <span>My Knowledge Post</span>
                        
                        {activeTab === 'knowledge' && (
                            <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-orange-600"></div>
                        )}
                    </button>
                </div>
<div className="w-full h-[40px] flex justify-between items-center bg-white rounded-[12px] border-[0.5px] border-[#B9B9B9] px-1 ">
    <p className="text-[14px] font-[500] text-[#18181899] pl-2">Create Post</p>
    <button className="bg-gradient-to-l from-[#DE4B12] to-[#E56F41] text-white w-[34px] h-[34px] rounded-[10px] flex items-center justify-center"><FiPlus size={24} className="text-white"  /></button>
          </div>

                <div className=" p-6 bg-white rounded-lg border border-gray-200">
                    {activeTab === 'topics' ? (
                        <div className="grid grid-cols-3 gap-3">
                            {Array.from({ length: 5 }).map((_, index) => (
                                <SubcriptionCard key={index} img={auth} title="Topic Page" description="Description" tags="Tags" Follows="Follows"/>
                            ))}
                        </div>
                        
                    ) : (
                       <KnowledgePostCard />
                    )}
                </div>
            </div>
            </div>
        </div>
    );
}