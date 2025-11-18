import { useState } from "react";
import { useNavigate } from "react-router";
import GenerateLink from "../../components/global/GenerateLink";
import { bg, Mask, topxlogout } from "../../assets/export";
import Navbarlandingpage from "../../components/global/Navbarlandingpage";

const Referrals = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = () => {
    console.log("Name:", name, "Email:", email);
    setModalOpen(true);
  };

  return (
    <div className="overflow-hidden bg-gradient-to-br from-orange-50 via-white to-orange-50 min-h-screen relative">
      <Navbarlandingpage />
      <div className="absolute top-0 left-0">
        <img src={bg} alt="" className="w-[320px] h-[320px]" />
      </div>

      <div className="relative max-w-2xl mx-auto px-6 py-20 text-center">

        {/* Logo */}
        <div className="flex justify-center mb-12">
          <img src={topxlogout} alt="logo" className="w-[160px] h-[160px]" />
        </div>

        {/* Heading */}
        <h1 className="text-5xl font-bold text-gray-900 mb-3">Invite Your Friends.</h1>
        <h2 className="text-5xl font-bold text-gray-900 mb-8">Grow Our Community.</h2>

        {/* Description */}
        <p className="text-gray-600 mb-12 max-w-xl mx-auto leading-relaxed">
          Enter your name and email to get your personalized invite link.
          When others visit using your link, they'll see that you invited them.
        </p>

        {/* Form */}
        <div className="max-w-md mx-auto">

          {/* Name */}
          <div className="mb-6 text-left">
            <label className="block text-gray-700 font-medium mb-2">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter name here"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg 
              focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          {/* Email */}
          <div className="mb-8 text-left">
            <label className="block text-gray-700 font-medium mb-2">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email address"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg 
              focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          {/* Button */}
          <button
            onClick={handleSubmit}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-4 px-6 
            rounded-lg transition duration-200 shadow-lg hover:shadow-xl"
          >
            Generate Link
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="px-20">
        <p className="mt-20 text-gray-500 text-sm text-center py-6 border-t border-gray-300">
          Copyright © 2025 Top X
        </p>
      </div>

      <div className="absolute bottom-0 right-0">
        <img src={Mask} alt="" className="w-[260px] h-[260px]" />
      </div>

      <GenerateLink isOpen={modalOpen} onRequestClose={() => setModalOpen(false)} />
    </div>
  );
};

export default Referrals;
