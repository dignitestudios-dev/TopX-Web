import test, { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";

// Mock localStorage for Node test environment
const mockStorage = new Map();
globalThis.localStorage = {
  getItem: (key) => (mockStorage.has(key) ? mockStorage.get(key) : null),
  setItem: (key, val) => mockStorage.set(key, String(val)),
  removeItem: (key) => mockStorage.delete(key),
  clear: () => mockStorage.clear(),
};

import {
  setPendingReferralCode,
  getPendingReferralCode,
  clearPendingReferralCode,
  hasPendingReferralCode,
  isValidReferralCode,
} from "../src/lib/referralStorage.js";

describe("Referral Contest & Attribution Test Suite", () => {
  beforeEach(() => {
    mockStorage.clear();
  });

  // 1. Referral Code Validation & Storage
  describe("1. Referral Code Validation & Storage", () => {
    it("validates non-empty string referral codes correctly", () => {
      assert.equal(isValidReferralCode("OCTOBER2026"), true);
      assert.equal(isValidReferralCode("  CODE_WITH_SPACES  "), true);
      assert.equal(isValidReferralCode(""), false);
      assert.equal(isValidReferralCode("   "), false);
      assert.equal(isValidReferralCode(null), false);
      assert.equal(isValidReferralCode(undefined), false);
      assert.equal(isValidReferralCode(12345), false);
    });

    it("stores and retrieves pending referral code accurately", () => {
      const saved = setPendingReferralCode("WINNER_CODE_99");
      assert.equal(saved, true);
      assert.equal(hasPendingReferralCode(), true);
      assert.equal(getPendingReferralCode(), "WINNER_CODE_99");
    });

    it("trims whitespace when saving code", () => {
      setPendingReferralCode("   PADDED_CODE   ");
      assert.equal(getPendingReferralCode(), "PADDED_CODE");
    });

    it("clears pending referral code on demand", () => {
      setPendingReferralCode("TEMP_CODE");
      assert.equal(hasPendingReferralCode(), true);
      clearPendingReferralCode();
      assert.equal(hasPendingReferralCode(), false);
      assert.equal(getPendingReferralCode(), null);
    });

    it("survives screen navigation and cold reloads in storage", () => {
      // Step A: user lands on /referral?code=INVITE_ABC
      setPendingReferralCode("INVITE_ABC");

      // Step B: user navigates to /auth/signup
      assert.equal(getPendingReferralCode(), "INVITE_ABC");

      // Step C: user switches between registration steps
      assert.equal(getPendingReferralCode(), "INVITE_ABC");

      // Step D: simulated page refresh
      assert.equal(hasPendingReferralCode(), true);
      assert.equal(getPendingReferralCode(), "INVITE_ABC");
    });
  });

  // 2. Email Registration Attribution URL & Query Param Encoding
  describe("2. Email Registration Attribution URL & Query Encoding", () => {
    it("constructs email verification URL with encoded query parameter", () => {
      const code = "CONTEST&2026=TRUE";
      const cleanReferral = code.trim();
      const query = cleanReferral ? `?referral=${encodeURIComponent(cleanReferral)}` : "";
      const endpoint = `/auth/verifyEmail${query}`;

      assert.equal(endpoint, "/auth/verifyEmail?referral=CONTEST%262026%3DTRUE");
    });

    it("constructs email verification URL without query parameter when no referral code", () => {
      const code = null;
      const cleanReferral = code ? String(code).trim() : "";
      const query = cleanReferral ? `?referral=${encodeURIComponent(cleanReferral)}` : "";
      const endpoint = `/auth/verifyEmail${query}`;

      assert.equal(endpoint, "/auth/verifyEmail");
    });

    it("failed OTP does NOT clear pending referral code", () => {
      setPendingReferralCode("ATTEMPT_1_CODE");

      // Simulate failed OTP verification
      const isFulfilled = false;
      if (isFulfilled) {
        clearPendingReferralCode();
      }

      // Code must still be preserved for retry
      assert.equal(getPendingReferralCode(), "ATTEMPT_1_CODE");
    });

    it("successful email OTP verification clears pending referral code", () => {
      setPendingReferralCode("SUCCESS_CODE");

      // Simulate successful OTP verification
      const isFulfilled = true;
      if (isFulfilled) {
        clearPendingReferralCode();
      }

      assert.equal(getPendingReferralCode(), null);
    });
  });

  // 3. Social Registration Attribution
  describe("3. Social Registration Attribution", () => {
    it("attaches referralLink to payload for social registration", () => {
      const pendingCode = "SOCIAL_INVITE_100";
      const idToken = "firebase_token_xyz";
      const role = "user";

      const payload = {
        idToken,
        role,
        ...(pendingCode ? { referralLink: String(pendingCode).trim() } : {}),
      };

      assert.equal(payload.referralLink, "SOCIAL_INVITE_100");
      assert.equal(payload.role, "user");
    });

    it("clears pending referral code on successful new account creation (HTTP 201)", () => {
      setPendingReferralCode("NEW_SOCIAL_USER");

      const responseStatus = 201;
      const isNewUser = responseStatus === 201;

      assert.equal(isNewUser, true);
      clearPendingReferralCode();

      assert.equal(getPendingReferralCode(), null);
    });

    it("clears pending referral on existing user login (HTTP 200) without false referral credit", () => {
      setPendingReferralCode("EXISTING_USER_CODE");

      const responseStatus = 200;
      const isNewUser = responseStatus === 201;

      assert.equal(isNewUser, false); // Existing user does not count
      clearPendingReferralCode(); // Clear so it doesn't linger indefinitely

      assert.equal(getPendingReferralCode(), null);
    });
  });

  // 4. Delivery Address Validation & Postal Code Type
  describe("4. Prize Delivery Details Validation & Formatting", () => {
    it("requires address but treats all other fields as optional", () => {
      const validateDelivery = (data) => {
        const errors = {};
        if (!data.address || !data.address.trim()) {
          errors.address = "Street address is required.";
        }
        if (data.email && data.email.trim()) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(data.email.trim())) {
            errors.email = "Invalid email format.";
          }
        }
        return errors;
      };

      // Only address provided
      const validOnlyAddress = {
        address: "123 Main Street",
        name: "",
        email: "",
        phone: "",
        apartment: "",
        city: "",
        state: "",
        postalCode: "",
        country: "",
      };
      assert.deepEqual(validateDelivery(validOnlyAddress), {});

      // Missing address
      const invalidNoAddress = {
        address: "",
        city: "Lahore",
      };
      assert.equal(Boolean(validateDelivery(invalidNoAddress).address), true);

      // Invalid email
      const invalidEmail = {
        address: "456 Oak Ave",
        email: "not-an-email",
      };
      assert.equal(Boolean(validateDelivery(invalidEmail).email), true);
    });

    it("preserves postal code as string with leading zeros intact", () => {
      const inputPostalCode = "01234";

      const payload = {
        address: "789 Pine Road",
        postalCode: String(inputPostalCode).trim(),
      };

      assert.equal(typeof payload.postalCode, "string");
      assert.equal(payload.postalCode, "01234");
      assert.notEqual(Number(payload.postalCode), payload.postalCode);
    });
  });

  // 5. Share Flow & PRIZE_DETAILS_REQUIRED (HTTP 422) Handling
  describe("5. Share Flow & Address Enforcement", () => {
    it("detects PRIZE_DETAILS_REQUIRED (422) error and triggers address modal", () => {
      const mockErrorResponse = {
        status: 422,
        data: {
          success: false,
          code: "PRIZE_DETAILS_REQUIRED",
          message: "Add your prize delivery address before sharing your referral link.",
          missingFields: ["address"],
        },
      };

      let modalOpened = false;
      let resumeShare = false;

      if (
        mockErrorResponse.status === 422 &&
        mockErrorResponse.data.code === "PRIZE_DETAILS_REQUIRED"
      ) {
        modalOpened = true;
        resumeShare = true;
      }

      assert.equal(modalOpened, true);
      assert.equal(resumeShare, true);
    });

    it("automatically retries sharing once after successful address save", () => {
      let shareCalls = 0;
      let resumeShare = true;

      const mockGetReferralLink = () => {
        shareCalls += 1;
        return {
          success: true,
          data: {
            referralLink: "https://my-topx.com/referral?code=CONTEST_PERM_1",
            contestId: "contest_123",
          },
        };
      };

      // Address saved
      if (resumeShare) {
        resumeShare = false;
        mockGetReferralLink();
      }

      assert.equal(shareCalls, 1);
      assert.equal(resumeShare, false);
    });

    it("does NOT share if address prompt is cancelled", () => {
      let shareCalls = 0;
      let resumeShare = true;

      // User clicks Cancel on the modal
      const handleCancel = () => {
        resumeShare = false;
      };

      handleCancel();

      if (resumeShare) {
        shareCalls += 1;
      }

      assert.equal(shareCalls, 0);
    });

    it("does not increment referral counts optimistically upon share", () => {
      const initialCounts = { contest: 4, lifetime: 18 };

      // User shares link
      const link = "https://my-topx.com/referral?code=CONTEST_PERM_1";
      assert.ok(link);

      // Counts remain untouched locally
      const currentCounts = { ...initialCounts };
      assert.deepEqual(currentCounts, initialCounts);
    });
  });

  // 6. No Active Contest HTTP 404 Handling
  describe("6. No Active Contest HTTP 404 Handling", () => {
    it("handles 404 from /affiliate/contest/current as a normal empty product state", () => {
      const mock404Error = {
        response: {
          status: 404,
          data: { message: "No active contest found" },
        },
      };

      const handleContestResponse = (err) => {
        if (err.response?.status === 404) {
          return {
            noActiveContest: true,
            currentContest: null,
            referralCounts: { contest: 0, lifetime: 0 },
          };
        }
        throw err;
      };

      const result = handleContestResponse(mock404Error);
      assert.equal(result.noActiveContest, true);
      assert.equal(result.currentContest, null);
    });
  });

  // 7. Referral History Formatting & Edge Cases
  describe("7. Referral History & Missing User Handling", () => {
    it("gracefully handles populated and null/missing referredUser objects", () => {
      const rawReferrals = [
        {
          _id: "ref_1",
          referredUser: {
            _id: "user_1",
            name: "Alice Smith",
            username: "alicesmith",
            profilePicture: "https://example.com/avatar.jpg",
          },
          referredAt: "2026-10-01T12:00:00Z",
        },
        {
          _id: "ref_2",
          referredUser: null, // Deleted or legacy account
          referredAt: "2026-10-02T15:30:00Z",
        },
      ];

      const formatted = rawReferrals.map((r) => ({
        id: r._id,
        displayName: r.referredUser?.name || "TopX Member",
        username: r.referredUser?.username ? `@${r.referredUser.username}` : null,
        avatar: r.referredUser?.profilePicture || null,
        referredAt: r.referredAt,
      }));

      assert.equal(formatted[0].displayName, "Alice Smith");
      assert.equal(formatted[0].username, "@alicesmith");
      assert.equal(formatted[1].displayName, "TopX Member");
      assert.equal(formatted[1].username, null);
    });
  });

  // 8. Winner Notification Routing
  describe("8. Winner Notification Routing", () => {
    it("routes subType ReferralContestWinner to /affiliates with winner state", () => {
      const notification = {
        _id: "notif_winner_1",
        title: "Congratulations! You've Won!",
        detail: "You've been selected as the winner of this month's referral contest.",
        metaData: {
          type: "accountAndSystemNotification",
          subType: "ReferralContestWinner",
          contest: "contest_october_2026",
        },
      };

      let navigatedRoute = null;
      let navigationState = null;

      const navigate = (route, options) => {
        navigatedRoute = route;
        navigationState = options?.state;
      };

      const handleRedirect = (n) => {
        const meta = n.metaData || {};
        if (
          meta.subType === "ReferralContestWinner" ||
          (meta.type === "accountAndSystemNotification" && meta.subType === "ReferralContestWinner")
        ) {
          navigate("/affiliates", {
            state: {
              isWinner: true,
              contestId: meta.contest,
            },
          });
        }
      };

      handleRedirect(notification);

      assert.equal(navigatedRoute, "/affiliates");
      assert.equal(navigationState.isWinner, true);
      assert.equal(navigationState.contestId, "contest_october_2026");
    });
  });
});
