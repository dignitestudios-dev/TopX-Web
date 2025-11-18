import * as Yup from "yup";

export const PersonalSchema = Yup.object().shape({
  username: Yup.string()
    .min(3, "Username must be at least 3 characters long.")
    .max(50, "Username cannot exceed 50 characters.")
    .required("Please enter your username."),
  name: Yup.string()
    .min(3, "Name must be at least 3 characters long.")
    .required("Please enter your name."),
  dateOfBirth: Yup.date()
    .required("Please select your date of birth.")
    .max(new Date(), "Future dates are not allowed."),
  gender: Yup.string()
    .required("Please select your gender."),
  profileImage: Yup.mixed()
    .required("Please upload your profile photo.")
    .test(
      "fileType",
      "Only image files are allowed.",
      (value) => value && value.type && value.type.startsWith("image/")
    ),
  bio: Yup.string().max(250, "Bio cannot exceed 250 characters.")
});
