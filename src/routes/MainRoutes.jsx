// src/routes/MainRoutes.jsx
import { Routes, Route } from "react-router";
import Home from "../pages/Others/Home";
import Header from "../components/global/Header";
import Setting from "../pages/Others/Setting";
import Profile from "../pages/Others/Profile";


const MainRoutes = () => {
    return (
        <>
            <Header />
            <main style={{ minHeight: "80vh" }} className="bg-[#F9FAFB]">
                <Routes>
                    <Route path="/home" element={<Home />} />
                      <Route path="/setting" element={<Setting />} />
                      <Route path="/profile" element={<Profile />} />
                </Routes>
            </main>
        </>
    );
};

export default MainRoutes;
