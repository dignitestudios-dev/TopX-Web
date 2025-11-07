// src/routes/MainRoutes.jsx
import { Routes, Route } from "react-router";
import Home from "../pages/Others/Home";
import Header from "../components/global/Header";
import Setting from "../pages/Others/Setting";
import Profile from "../pages/Others/Profile";
import Subscriptions from "../pages/Others/Subscriptions";
import Knowledge from "../pages/Others/knowledge";
import Golive from "../pages/Others/Golive";
import Affiliates from "../pages/Others/Affiliates";
import Trending from "../pages/Others/Trending";
import Mypost from "../pages/Others/Mypost";
import { useState } from "react";
import FloatingChatButton from '../components/global/ChatWidget';
import SubscriptionsCategory from "../pages/Others/SubscriptionsCategory";
import OtherProfile from "../pages/Others/OtherProfile";
import Suggestpage from "../pages/Others/Suggestpage";
import Searchitem from "../pages/Others/Searchitem";



const MainRoutes = () => {
        const [open, setOpen] = useState(false);
    
    return (
        <>
            <Header />
            <main style={{ minHeight: "80vh" }} className="bg-[#F2F2F2]">
                <Routes>
                    <Route path="/home" element={<Home />} />
                    <Route path="/setting" element={<Setting />} />
                    <Route path="/subscriptions" element={<Subscriptions />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/knowledge" element={<Knowledge />} />
                    <Route path="/go-live" element={<Golive />} />
                    <Route path="/affiliates" element={<Affiliates />} />
                    <Route path="/trending" element={<Trending />} />
                    <Route path="/my-posts" element={<Mypost />} />
                    <Route path="/subscriptions-category" element={<SubscriptionsCategory />} />
                    <Route path="/other-profile" element={<OtherProfile />} />
                    <Route path="/suggested-pages" element={<Suggestpage />} />
                    <Route path="/search-items" element={<Searchitem />} />
                </Routes>
                  {open && <ChatWidget />} {/* Your actual chat panel */}
                    <FloatingChatButton onClick={() => setOpen(!open)} />
            </main>
        </>
    );
};

export default MainRoutes;
