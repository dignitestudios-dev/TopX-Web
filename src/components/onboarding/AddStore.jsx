import { IoSearch } from "react-icons/io5";
import { auth } from "../../assets/export";
import Input from "../common/Input";
import { useState, useEffect } from "react";
import SubcriptionCard from "./SubcriptionCard";
import Button from "../common/Button";
import { useDispatch, useSelector } from "react-redux";
import { getRecommendations } from "../../redux/slices/onboarding.slice";
import SkeletonCard from "../global/SkeletonCard";
import CollectionModal from "../global/CollectionModal";
import { addPageToCollections, getMyCollections, removePageFromCollections } from "../../redux/slices/collection.slice";

export default function AddStore({ handleNext }) {
  const dispatch = useDispatch();

  const [searchQuery, setSearchQuery] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [selectedPage, setSelectedPage] = useState(null);

  const { user } = useSelector((state) => state.auth);

  console.log(user, "alluserdata")

  const handleSaveToCollection = ({ selectedCollections }) => {
    dispatch(addPageToCollections({
      collections: selectedCollections,
      page: selectedPage._id,
    })).then(() => {

      // Refresh collections
      dispatch(getMyCollections({ page: 1, limit: 100 }));

      // Refresh recommendations (IMPORTANT 🔥)
      dispatch(getRecommendations({ page: 1, limit: 20 }));

      setOpenModal(false);
    });
  };



  // Pagination
  const [page, setPage] = useState(1);
  const limit = 20;

  const {
    recommendations,
    recommendationPagination,
    isLoading,
    error,
  } = useSelector((state) => state.onboarding);

  // FIRST LOAD
  useEffect(() => {
    dispatch(getRecommendations({ page: 1, limit }));
  }, [dispatch]);

  // LOAD MORE
  const loadMore = () => {
    if (page < recommendationPagination?.totalPages) {
      const nextPage = page + 1;
      setPage(nextPage);
      dispatch(getRecommendations({ page: nextPage, limit }));
    }
  };

  // Search filter
  const filteredData = recommendations?.filter((item) =>
    item?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubscribeClick = (page) => {
    setSelectedPage(page);
    setOpenModal(true);
  };

  const hasAnySubscribed = recommendations?.some((item) => item.isSubscribed) || false;


  return (
    <div className="bg-white flex items-center justify-center rounded-[19px] w-full p-6">
      <div className="flex flex-col items-center justify-center md:w-[700px] w-full">

        {/* Header */}
        <div className="flex flex-col items-center justify-center gap-4">
          <h2 className="text-[32px] font-bold leading-[48px]">Recommendations</h2>

          <p className="text-[14px] text-center text-[#3C3C43D9]">
            Based on the topics you like, we think you’ll want to check out a few of these topic pages.
          </p>

          <Input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            iconLeft={<IoSearch className="text-gray-500" />}
            size="md"
          />
        </div>

        {/* Cards Section */}
        <div className="w-full grid grid-cols-12 gap-4 py-6 overflow-y-scroll h-[500px]">

          {/* Skeleton - only on first fetch */}
          {isLoading && page === 1 &&
            [...Array(6)].map((_, index) => (
              <div key={index} className="col-span-6">
                <SkeletonCard />
              </div>
            ))
          }

          {/* Error */}
          {!isLoading && error && (
            <p className="text-center col-span-12 text-red-500">{error}</p>
          )}

          {/* No Results */}
          {!isLoading && filteredData?.length === 0 && (
            <p className="text-center col-span-12 text-gray-500">No recommendations found.</p>
          )}

          {/* Data */}
          {!isLoading &&
            filteredData?.map((item) => (
              <div key={item._id} className="col-span-6">
                <SubcriptionCard
                  img={item.image || auth}
                  title={item.name}
                  description={item.about}
                  tags={item.keywords}
                  Follows={item.followersCount}
                  isSubscribed={item.isSubscribed}     //  FIXED 🔥
                  buttonText={item.isSubscribed ? "Unsubscribe" : "Subscribe"}
                  header={item.topic}
                  onSubscribe={() => handleSubscribeClick(item)}
                />

              </div>
            ))
          }

          {/* LOAD MORE BUTTON — Only if next page available */}
          {!isLoading &&
            page < recommendationPagination?.totalPages && (
              <div className="col-span-12 flex justify-center mt-4">
                <button
                  onClick={loadMore}
                  className="px-6 py-2 rounded-lg bg-orange-500 text-white"
                >
                  Load More
                </button>
              </div>
            )
          }

          {/* Modal */}
          {openModal && (
            <CollectionModal
              isOpen={openModal}
              onClose={() => setOpenModal(false)}
              page={selectedPage}
              onSave={handleSaveToCollection}
            />
          )}
        </div>

        {/* NEXT BUTTON */}
        <Button
          variant="orange"
          size="full"
          onClick={handleNext}
          disabled={!hasAnySubscribed}
          className={`w-full flex items-center justify-center
    ${!hasAnySubscribed ? "bg-gray-300 text-gray-500 cursor-not-allowed border-none" : ""}
  `}
        >
          Next
        </Button>

      </div>
    </div>
  );
}
