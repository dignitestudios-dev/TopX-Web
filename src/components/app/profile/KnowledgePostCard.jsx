import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import KnowledgeAllPostCard from "./KnowledgeAllPostCard";
import { ChevronRight, Plus, X } from "lucide-react";
import { fetchMyKnowledgePages } from "../../../redux/slices/knowledgepost.slice";
import { resetKnowledge } from "../../../redux/slices/knowledgepost.slice";
import KnowledgePostSkeleton from "../../global/KnowledgePostSkeleton";
import CreateKnowledgePageModal from "../../global/CreateKnowledgePageModal";
import CreateKnowledgePostModal from "../../global/CreateKnowledgePostModal";
import PageCategorySelector from "./PageCategorySelector";
import KnowledgePostPageDetail from "./KnowledgePostPageDetail";

export default function KnowledgePostCard({ userKnowledgePost }) {
  const dispatch = useDispatch();
  const [selectoption, setSelectoption] = useState(false);
  const [createpage, setCreatepage] = useState(false);
  const [openCreateKnowledgePostModal, setOpenCreateKnowledgePostModal] =
    useState(false);
  const [openPostModal, setOpenPostModal] = useState(false);
  const [selectedPageId, setSelectedPageId] = useState(null);
  const [selectedSubTopics, setSelectedSubTopics] = useState([]);
  const [isKnowledgePageOpen, setIsKnowledgePageOpen] = useState(false);
  const [selectedPage, setSelectedPage] = useState(null);

  const { knowledgePages, loading } = useSelector(
    (state) => state.knowledgepost
  );

  useEffect(() => {
    dispatch(fetchMyKnowledgePages({ page: 1, limit: 10 }));
  }, [dispatch]);

  const handleNextStep = (data) => {
    setSelectedPageId(data.pageId);
    setSelectedSubTopics(data.subTopics);
    setOpenPostModal(true);
  };

  return (
    <div className="py-4">
      <div className="space-y-6">
        {!isKnowledgePageOpen ? (
          <>
            {/* CREATE KNOWLEDGE POST (TOP INPUT) */}
            <div className="flex items-center justify-between bg-white border border-gray-200 rounded-2xl px-3 py-1">
              <input
                type="text"
                placeholder="Create Knowledge Page"
                className="flex-1 text-sm text-gray-600 focus:outline-none"
                onClick={() => {
                  dispatch(resetKnowledge());
                  setSelectoption(true);
                }}
              />
              <button
                className="bg-orange-500 text-white p-2 rounded-[10px] hover:bg-orange-600 transition"
                onClick={() => {
                  dispatch(resetKnowledge());
                  setSelectoption(true);
                }}
              >
                <Plus size={20} />
              </button>
            </div>

            {/* SKELETON */}
            {loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, index) => (
                  <KnowledgePostSkeleton key={index} />
                ))}
              </div>
            )}

            {/* DATA */}

            {!loading && knowledgePages?.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {knowledgePages?.map((item) => (
                  <div
                    key={item._id}
                    onClick={() => {
                      setSelectedPage(item._id);
                      setIsKnowledgePageOpen(true);
                    }}
                    className="cursor-pointer"
                  >
                    <KnowledgeAllPostCard item={item} />
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <KnowledgePostPageDetail
            pageId={selectedPage}
            setIsKnowledgePageOpen={setIsKnowledgePageOpen}
          />
        )}

        {/* EMPTY */}
        {!loading && knowledgePages?.length === 0 && (
          <p className="text-center text-gray-500">No knowledge pages found.</p>
        )}

        {/* MODAL */}
        {selectoption && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl w-[90%] max-w-md p-6 relative shadow-lg">
              {/* Close Button */}
              <button
                className="absolute top-4 right-4 text-orange-500"
                onClick={() => setSelectoption(false)}
              >
                <X size={24} />
              </button>

              {/* Heading */}
              <h2 className="text-[20px] font-[700] text-black mb-1">
                Select Type
              </h2>
              <p className="text-gray-500 text-sm mb-5">Choose an option</p>

              {/* OPTIONS */}
              <div className="space-y-4">
                {/* Create Knowledge Post */}
                <div
                  className="flex items-center justify-between bg-[#f7f7f7] rounded-xl p-4 cursor-pointer hover:bg-[#efefef] transition"
                  onClick={() => {
                    setSelectoption(false);
                    setOpenCreateKnowledgePostModal(true);
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                      <Plus className="text-orange-500" size={20} />
                    </div>
                    <p className="text-[15px] font-semibold text-black">
                      Create Knowledge Post
                    </p>
                  </div>
                  <ChevronRight className="text-orange-500" />
                </div>

                {/* Create Page */}
                <div
                  className="flex items-center justify-between bg-[#f7f7f7] rounded-xl p-4 cursor-pointer hover:bg-[#efefef] transition"
                  onClick={() => {
                    dispatch(resetKnowledge());
                    setSelectoption(false);
                    setCreatepage(true);
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                      <Plus className="text-orange-500" size={20} />
                    </div>
                    <p className="text-[15px] font-semibold text-black">
                      Create New Page
                    </p>
                  </div>
                  <ChevronRight className="text-orange-500" />
                </div>
              </div>
            </div>
          </div>
        )}

        {createpage && (
          <CreateKnowledgePageModal onClose={() => setCreatepage(false)} />
        )}

        {/* PAGE CATEGORY SELECTOR MODAL */}
        {openCreateKnowledgePostModal && !openPostModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white w-full max-w-[30em] rounded-2xl shadow-xl p-6 relative">
              <button
                className="absolute top-4 right-4 text-orange-500"
                onClick={() => setOpenCreateKnowledgePostModal(false)}
              >
                <X size={24} />
              </button>
              <PageCategorySelector
                onClose={() => setOpenCreateKnowledgePostModal(false)}
                onNext={handleNextStep}
              />
            </div>
          </div>
        )}

        {/* CREATE KNOWLEDGE POST MODAL */}
        {openPostModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white w-full max-w-[30em] rounded-2xl shadow-xl p-6 relative">
              <button
                className="absolute top-4 right-4 text-orange-500"
                onClick={() => {
                  setOpenPostModal(false);
                  setOpenCreateKnowledgePostModal(false);
                }}
              >
                <X size={24} />
              </button>
              <CreateKnowledgePostModal
                onClose={() => {
                  setOpenPostModal(false);
                  setOpenCreateKnowledgePostModal(false);
                }}
                selectedPageId={selectedPageId}
                selectedSubTopics={selectedSubTopics}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
