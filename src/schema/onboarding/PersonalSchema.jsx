import * as Yup from "yup";
 
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const DISALLOWED_EXTENSIONS = [".svg", ".gif"];

export const PersonalSchema = Yup.object().shape({
  username: Yup.string()
    .required("Please enter your username.")
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
    .required("Please select your date of birth.")
    .max(new Date(), "Future dates are not allowed."),

  gender: Yup.string().required("Please select your gender."),

  profileImage: Yup.mixed().test(
    "fileType",
    "Only JPG, JPEG, PNG, or WEBP image formats are supported. SVG and GIF files are not allowed.",
    (value) => {
      if (!value) return true; // optional
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
  ),

  bio: Yup.string().max(250, "Bio cannot exceed 250 characters."),
});
