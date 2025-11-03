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


const MainRoutes = () => {
    return (
        <>
            <Header />
            <main style={{ minHeight: "80vh" }} className="bg-[#F9FAFB]">
                <Routes>
                    <Route path="/home" element={<Home />} />
                    <Route path="/setting" element={<Setting />} />
                    <Route path="/subscriptions" element={<Subscriptions />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/knowledge" element={<Knowledge />} />
                    <Route path="/go-live" element={<Golive />} />
                    <Route path="/affiliates" element={<Affiliates />} />
                    <Route path="/trending" element={<Trending />} />
                </Routes>
            </main>
        </>
    );
};

export default MainRoutes;
