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
import SubscriptionsCategory from "../pages/Others/SubscriptionsCategory";
import OtherProfile from "../pages/Others/OtherProfile";
import Suggestpage from "../pages/Others/Suggestpage";
import Searchitem from "../pages/Others/Searchitem";
import { useState } from "react";
import FloatingChatButton from '../components/global/ChatWidget';
import ProtectedRoute from "./ProtectedRoute";
import Trendingsuggestpage from "../pages/Others/Trendingsuggestpage";
import Trendingpagedetail from "../pages/Others/Trendingpagedetail";
import KnowledgePageDetail from "../pages/Others/KnowledgePageDetail";
import LiveStreampage from "../pages/Others/LiveStreampage";
import Livechat from "../pages/Others/Livechat";

const MainRoutes = () => {
    const [open, setOpen] = useState(false);

    return (
        <>
            <Header />
            <main style={{ minHeight: "80vh" }} className="bg-[#F2F2F2]">
                <Routes>
                    <Route
                        path="/home"
                        element={
                            <ProtectedRoute>
                                <Home />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/setting"
                        element={
                            <ProtectedRoute>
                                <Setting />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/subscriptions"
                        element={
                            <ProtectedRoute>
                                <Subscriptions />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/profile"
                        element={
                            <ProtectedRoute>
                                <Profile />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/trending-page-detail/:id"
                        element={
                            <ProtectedRoute>
                                <Trendingpagedetail />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/knowledge-page-detail/:id"
                        element={
                            <ProtectedRoute>
                                <KnowledgePageDetail />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/knowledge"
                        element={
                            <ProtectedRoute>
                                <Knowledge />
                            </ProtectedRoute>
                        }
                    />

                     <Route
                        path="/live-chat"
                        element={
                            <ProtectedRoute>
                                <Livechat />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/go-live"
                        element={
                            <ProtectedRoute>
                                <Golive />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/affiliates"
                        element={
                            <ProtectedRoute>
                                <Affiliates />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/trending"
                        element={
                            <ProtectedRoute>
                                <Trending />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/my-posts"
                        element={
                            <ProtectedRoute>
                                <Mypost />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/subscriptions-category"
                        element={
                            <ProtectedRoute>
                                <SubscriptionsCategory />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/other-profile"
                        element={
                            <ProtectedRoute>
                                <OtherProfile />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/suggested-pages"
                        element={
                            <ProtectedRoute>
                                <Suggestpage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/trendingsuggested-pages"
                        element={
                            <ProtectedRoute>
                                <Trendingsuggestpage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/search-items"
                        element={
                            <ProtectedRoute>
                                <Searchitem />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/live-stream/:pageId" 
                        element={
                            <ProtectedRoute>
                                <LiveStreampage />
                            </ProtectedRoute>
                        }
                    />
                </Routes>

                {open && <ChatWidget />}
                <FloatingChatButton onClick={() => setOpen(!open)} />

            </main>
        </>
    );
};

export default MainRoutes;
