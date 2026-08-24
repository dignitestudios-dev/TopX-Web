import * as Yup from "yup";
import { hasMaliciousInput } from "../../lib/helpers";
 
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const DISALLOWED_EXTENSIONS = [".svg", ".gif"];

export const PersonalSchema = Yup.object().shape({
  username: Yup.string()
    .required("Please enter your username.")
    .test(
      "no-malicious-input",
      "Malicious characters or script patterns are not allowed in username.",
      (val) => !val || !hasMaliciousInput(val)
    )
    .min(3, "Username must be at least 3 characters long.")
    .max(50, "Username cannot exceed 50 characters.")
    .matches(/^\S*$/, "Username cannot contain spaces.")
    .matches(
      /^[a-zA-Z0-9_.]+$/,
      "Username can only contain letters, numbers, underscores, and dots."
    )
    .test(
      "no-leading-trailing-special",
      "Username cannot start or end with a dot or underscore.",
      (val) => !val || (!/^[._]/.test(val) && !/[._]$/.test(val))
    )
    .test(
      "no-consecutive-special",
      "Username cannot contain consecutive dots or underscores.",
      (val) => !val || !/[_.]{2,}/.test(val)
    ),


  dateOfBirth: Yup.date()
    .nullable()
    .transform((curr, orig) => (orig === "" || orig === null || orig === undefined ? null : curr))
    .typeError("Please select a valid date of birth.")
    .required("Please select your date of birth.")
    .max(new Date(), "Future dates are not allowed."),

  gender: Yup.string().required("Please select your gender."),

  genderOther: Yup.string().when("gender", {
    is: "other",
    then: (schema) => schema.required("Please specify your gender.").max(50, "Gender cannot exceed 50 characters."),
    otherwise: (schema) => schema.notRequired(),
  }),

  profileImage: Yup.mixed()
    .test(
      "required",
      "Please upload a profile picture.",
      (value) => {
        if (!value) return false;
        if (typeof value === "string") return value.trim().length > 0;
        if (value instanceof File) return true;
        return false;
      }
    )
    .test(
      "fileType",
      "Only JPG, JPEG, PNG, or WEBP image formats are supported. SVG and GIF files are not allowed.",
      (value) => {
        if (!value) return false;
        if (typeof value === "string") return true; // emoji URL
        if (value instanceof File) {
          const fileName = (value.name || "").toLowerCase();
          const fileType = (value.type || "").toLowerCase();

          if (
            DISALLOWED_EXTENSIONS.some((ext) => fileName.endsWith(ext)) ||
            fileType.includes("svg") ||
            fileType.includes("gif")
          ) {
            return false;
          }

          return ALLOWED_MIME_TYPES.includes(fileType);
        }
        return false;
      }
    )
    .test(
      "fileSize",
      "Profile picture size must not exceed 5MB.",
      (value) => {
        if (!value || typeof value === "string") return true;
        if (value instanceof File) {
          return value.size <= 5 * 1024 * 1024;
        }
        return true;
      }
    ),

  bio: Yup.string().max(250, "Bio cannot exceed 250 characters."),

  link: Yup.string()
    .trim()
    .test(
      "is-valid-url",
      "Please enter a valid URL (e.g., https://example.com)",
      (value) => {
        if (!value || value.trim() === "") return true;
        try {
          const urlToTest =
            value.startsWith("http://") || value.startsWith("https://")
              ? value
              : `https://${value}`;
          new URL(urlToTest);
          return true;
        } catch {
          return false;
        }
      }
    )
    .max(200, "Link cannot exceed 200 characters."),
});
