import React, { useState } from "react";
import { X, Search, Check } from "lucide-react";

const CreateSubscriptionModal = ({ onClose, onAdd }) => {
  const [subscriptionName, setSubscriptionName] = useState("");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState([]);
  const [showSuccess, setShowSuccess] = useState(false);

  const pages = [
    { id: 1, name: "Mike’s Basketball", avatar: "https://randomuser.me/api/portraits/men/11.jpg" },
    { id: 2, name: "Mike’s Fitness", avatar: "https://randomuser.me/api/portraits/men/12.jpg" },
    { id: 3, name: "Mike’s Opinion", avatar: "https://randomuser.me/api/portraits/men/13.jpg" },
    { id: 4, name: "Mike’s Cooking", avatar: "https://randomuser.me/api/portraits/women/14.jpg" },
    { id: 5, name: "Mike’s Politics", avatar: "https://randomuser.me/api/portraits/men/15.jpg" },
  ];

  const toggleSelect = (id) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const filteredPages = pages.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = () => {
    if (!subscriptionName || selected.length === 0) return;
    onAdd({ subscriptionName, selectedPages: selected });
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      onClose();
    }, 2000);
  };

  return (
    <>
      {/* Main Create Modal */}
      <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
        <div className="bg-white w-[380px] rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between border-b px-5 py-3">
            <h2 className="text-[17px] font-semibold">Create New Subscription</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X size={22} />
            </button>
          </div>

          {/* Body */}
          <div className="p-5 max-h-[460px] overflow-y-auto">
            {/* Input */}
            <label className="block text-sm text-gray-700 mb-1">Subscription Name</label>
            <input
              type="text"
              placeholder="Enter name here"
              value={subscriptionName}
              onChange={(e) => setSubscriptionName(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-4 focus:ring-1 focus:ring-orange-500 outline-none"
            />

            <p className="text-sm font-medium text-gray-800 mb-2">Organize Your Interest!</p>
            <p className="text-xs text-gray-500 mb-3">
              Select Which Page You Want To Add In This Subscription.
            </p>

            {/* Search Bar */}
            <div className="relative mb-3">
              <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>

            {/* Page List */}
            <div className="space-y-3">
              {filteredPages.map((page) => (
                <div
                  key={page.id}
                  onClick={() => toggleSelect(page.id)}
                  className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={page.avatar}
                      alt={page.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <span className="text-sm text-gray-800 font-medium">{page.name}</span>
                  </div>

                  <div
                    className={`w-5 h-5 rounded-md border flex items-center justify-center ${
                      selected.includes(page.id)
                        ? "bg-orange-500 border-orange-500"
                        : "border-gray-300"
                    }`}
                  >
                    {selected.includes(page.id) && <Check size={14} className="text-white" />}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="border-t p-4">
            <button
              onClick={handleAdd}
              disabled={!subscriptionName || selected.length === 0}
              className={`w-full py-2 rounded-lg font-semibold transition-all ${
                !subscriptionName || selected.length === 0
                  ? "bg-orange-300 text-white cursor-not-allowed"
                  : "bg-orange-500 hover:bg-orange-600 text-white"
              }`}
            >
              Add
            </button>
          </div>
        </div>
      </div>

      {/* ✅ Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[60]">
          <div className="bg-white w-[340px] rounded-2xl shadow-xl p-6 text-center">
            <div className="flex justify-center mb-3">
              <div className="bg-orange-500 p-3 rounded-full">
                <Check className="text-white w-6 h-6" />
              </div>
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Subscription Created!</h2>
            <p className="text-sm text-gray-600 mt-1 mb-4">
              New Subscription has been successfully created.
            </p>
            <button
              onClick={() => {
                setShowSuccess(false);
                onClose();
              }}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg font-medium transition-all"
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default CreateSubscriptionModal;
