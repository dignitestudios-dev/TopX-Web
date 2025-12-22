import { combineReducers, configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/auth.slice";
import topicsReducer from "./slices/topics.slice";
import pagesReducer from "./slices/pages.slice";
import onboardingReducer from "./slices/onboarding.slice"
import collectionReducer from "./slices/collection.slice"
import postsReducer from "./slices/posts.slice";
import subscriptionsReducer from "./slices/Subscription.slice";
import affiliateReducer from "./slices/affiliate.slice"
import profileSettingsReducer from "./slices/profileSetting.slice"
import OtherProfileReducer from "./slices/otherprofile.slice"
import knowledgepostReducer from "./slices/knowledgepost.slice"
import notificationsReducer from "./slices/notifications.slice";
import chatReducer from "./slices/chat.slice";
import postsfeedReducer from "./slices/postfeed.slice";
import trendingReducer from "./slices/trending.slice"
import reportsReducder from "./slices/reports.slice";
import livestreamReducer from "./slices/livestream.slice";
import { persistStore, persistReducer } from "redux-persist";
import AsyncStorage from "@react-native-async-storage/async-storage";

const persistConfig = {
  key: "root",
  whitelist: ["auth"],
  storage: AsyncStorage,
};

const rootReducer = combineReducers({
  auth: authReducer,
  topics: topicsReducer,
  pages: pagesReducer,
  onboarding: onboardingReducer,
  collections: collectionReducer,
  posts: postsReducer,
  subscriptions: subscriptionsReducer,
  affiliate: affiliateReducer,
  profileSetting: profileSettingsReducer,
  otherProfile: OtherProfileReducer,
  knowledgepost: knowledgepostReducer,
  trending: trendingReducer,
  notifications: notificationsReducer,
  postsfeed: postsfeedReducer,
  reports: reportsReducder,
  livestream: livestreamReducer,
  chat: chatReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  devTools: true,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const persistor = persistStore(store);
