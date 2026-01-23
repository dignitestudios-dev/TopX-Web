import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMyKnowledgePages } from "../../../redux/slices/knowledgepost.slice";
import { ErrorToast } from "../../global/Toaster";

export default function PageCategorySelector({ onNext, onClose, heading }) {
    const dispatch = useDispatch();
    const { knowledgePages } = useSelector((state) => state.knowledgepost);

    const [selectedPageId, setSelectedPageId] = useState(null);
    const [selectedSubTopics, setSelectedSubTopics] = useState([]);
    const [searchText, setSearchText] = useState("");

    useEffect(() => {
        dispatch(fetchMyKnowledgePages({ page: 1, limit: 10 }));
    }, [dispatch]);


    // FILTER SEARCH
    const filteredPages = knowledgePages?.filter((item) =>
        item.name.toLowerCase().includes(searchText.toLowerCase())
    );


    // MULTI SELECT WITH LIMIT 2
    const toggleSubTopic = (topic) => {
        if (selectedSubTopics.includes(topic)) {
            setSelectedSubTopics(selectedSubTopics.filter((t) => t !== topic));
            return;
        }

        if (selectedSubTopics.length >= 1) {
            ErrorToast("You can select maximum 1 sub-topics!");
            return;
        }

        setSelectedSubTopics([...selectedSubTopics, topic]);
    };

    // VALIDATION BEFORE NEXT
    const handleNext = () => {
        if (!selectedPageId) {
            ErrorToast("Please select a page!");
            return;
        }

        if (selectedSubTopics.length === 0) {
            ErrorToast("Please select at least 1 sub-topic!");
            return;
        }

        // Pass data to parent and let parent handle the modal opening
        onNext({ pageId: selectedPageId, subTopics: selectedSubTopics });

    };

    return (
        <div className="space-y-6">

            {/* Heading */}
            {heading && (
                <h2 className="text-center text-[20px] font-semibold mt-1">
                    {heading}
                </h2>
            )}

            {/* Search Field */}
            <div className="relative">
                <Search className="absolute top-2.5 left-4 text-gray-400 w-5 h-5" />
                <input
                    type="text"
                    placeholder="Search"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    className="w-full bg-[#f5f5f5] rounded-full pl-12 pr-4 py-2 outline-none text-[15px]"
                />
            </div>

            {/* Page List */}
            <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
                {filteredPages?.length === 0 ? (
                    <p className="text-center text-gray-500 py-6">
                        No pages available now
                    </p>
                ) : (
                    filteredPages.map((page) => (
                        <div key={page._id} className="space-y-2">

                            {/* ROW — Page */}
                            <div
                                className="flex justify-between items-center cursor-pointer"
                                onClick={() => {
                                    setSelectedPageId(page._id);
                                    setSelectedSubTopics([]);
                                }}
                            >
                                <div className="flex items-center gap-3">

                                    {/* IMAGE */}
                                    <img
                                        src={
                                            page.image
                                                ? page.image
                                                : "https://i.pinimg.com/736x/9d/1c/5f/9d1c5f14116e7ac62798f733847ac333.jpg"
                                        }
                                        className="w-10 h-10 rounded-full object-cover bg-gray-200"
                                    />

                                    <div>
                                        {/* NAME */}
                                        <p className="text-[16px] font-medium">{page.name}</p>

                                        {/* ABOUT */}
                                        <p className="text-gray-500 text-[13px] leading-tight">
                                            {page.about}
                                        </p>
                                    </div>
                                </div>

                                {/* RADIO BUTTON */}
                                <div
                                    className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${selectedPageId === page._id
                                        ? "border-orange-500"
                                        : "border-gray-400"
                                        }`}
                                >
                                    {selectedPageId === page._id && (
                                        <div className="h-3 w-3 bg-orange-500 rounded-full"></div>
                                    )}
                                </div>
                            </div>

                            {/* SUB TOPICS */}
                            {selectedPageId === page._id && page.subTopic?.length > 0 && (
                                <div className="flex gap-2 flex-wrap pl-1 mt-1">
                                    {page.subTopic.map((topic, idx) => (
                                        <span
                                            key={idx}
                                            onClick={() => toggleSubTopic(topic)}
                                            className={`px-4 py-1 text-sm rounded-full cursor-pointer transition ${selectedSubTopics.includes(topic)
                                                ? "bg-orange-500 text-white"
                                                : "bg-orange-100 text-orange-600"
                                                }`}
                                        >
                                            {topic}
                                        </span>
                                    ))}
                                </div>
                            )}

                        </div>
                    ))
                )}
            </div>

            {/* NEXT BUTTON */}
            <button
                className="w-full bg-orange-500 text-white py-3 rounded-xl text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={filteredPages.length === 0 || !selectedPageId || selectedSubTopics.length === 0}
                onClick={handleNext}
            >
                Next
            </button>

        </div>
    );
}