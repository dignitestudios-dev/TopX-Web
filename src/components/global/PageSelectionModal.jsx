import { useState } from "react";

export default function PageSelectionModal({ open, onClose }) {
  const [selectedCategory, setSelectedCategory] = useState(null);

  const categories = [
    {
      title: "Cars",
      options: ["Ferrari", "Bugatti", "Lamborghini", "Porsche"]
    },
    { title: "Make Up", options: [] },
    { title: "Fitness", options: [] },
    { title: "Finance", options: [] },
    { title: "Cooking", options: [] }
  ];

  return (
    <CreatePostPageModal open={open} onClose={onClose}>
      <div className="space-y-6">

        <h2 className="text-center text-xl font-semibold">
          Select page you want to create post
        </h2>

        {/* SEARCH */}
        <input
          type="text"
          placeholder="Search"
          className="w-full bg-gray-100 rounded-full px-4 py-2 outline-none"
        />

        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
          {categories.map((cat, index) => (
            <div key={index} className="space-y-2">
              <div
                className="flex justify-between items-center cursor-pointer"
                onClick={() => setSelectedCategory(cat.title)}
              >
                <p className="text-lg">{cat.title}</p>

                <div
                  className={`h-5 w-5 rounded-full border-2 ${
                    selectedCategory === cat.title
                      ? "border-orange-500 bg-orange-500"
                      : "border-gray-400"
                  }`}
                ></div>
              </div>

              {/* SUB OPTIONS */}
              {selectedCategory === cat.title && cat.options.length > 0 && (
                <div className="flex gap-2 flex-wrap pl-1 mt-2">
                  {cat.options.map((opt, optIndex) => (
                    <span
                      key={optIndex}
                      className="bg-orange-500 text-white rounded-full px-4 py-1 text-sm"
                    >
                      {opt}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* NEXT BUTTON */}
        <button className="w-full bg-orange-500 text-white py-3 rounded-xl text-lg font-semibold">
          Next
        </button>

      </div>
    </CreatePostPageModal>
  );
}
