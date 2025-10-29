import * as Yup from "yup";

export const signInSchema = Yup.object({
  email: Yup.string()
    .email("Please enter a valid email address.")
    .required("Please enter your email"),
  password: Yup.string()
    .matches(/^(?!\s)(?!.*\s$)/, "Password must not begin or end with spaces")
    .min(6, "Password must contain atleast 6 alphanumeric characters.")
    .required("Please enter your password"),
});

export const forgotPasswordSchema = Yup.object({
  email: Yup.string()
    .email("Please enter a valid email address.")
    .required("Please enter your email"),
});

export const updatePasswordSchema = Yup.object({
  password: Yup.string()
    .matches(/^(?!\s)(?!.*\s$)/, "Password must not begin or end with spaces")
    .min(6, "Password must contain atleast 6 alphanumeric characters.")
    .required("Please enter your password"),
  confirm_password: Yup.string()
    .oneOf([Yup.ref("password"), null], "Passwords must match")
    .required("Please confirm your password"),
});
export const changePasswordSchema = Yup.object({
  old_password: Yup.string()
    .matches(/^(?!.\s)(?!.*\s$)/, "Password must not begin or end with spaces")
    .min(6, "Password must contain atleast 6 alphanumeric characters.")
    .required("Please enter your password"),
  password: Yup.string()
    .matches(/^(?!.\s)(?!.*\s$)/, "Password must not begin or end with spaces")
    .min(6, "Password must contain atleast 6 alphanumeric characters.")
    .required("Please enter your password"),
  confirm_password: Yup.string()
    .oneOf([Yup.ref("password"), null], "Passwords must match")
    .required("Please confirm your password"),
});
export const changeEmailSchema = Yup.object({
  email: Yup.string()
    .email("Please enter a valid email address.")
    .required("Please enter your email"),
});

export const changeNumberSchema = Yup.object({
  phone: Yup.string()
    .matches(/^[0-9]*$/, "Only digits are allowed")
    .length(10, "Phone number must be exactly 10 digits")
    .required("Please enter your phone number"),
});

export const changeDOBGenderSchema = Yup.object({
  dateOfBirth: Yup.date()
    .required("Please select your date of birth.")
    .max(new Date(), "Future dates are not allowed."),
  gender: Yup.string().required("Please select your gender."),
});
