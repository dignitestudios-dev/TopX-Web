import * as Yup from "yup";

export const signupSchema = Yup.object().shape({
  name: Yup.string()
    .required("Please enter your name.")
    .min(3, "Name must be at least 3 characters long.")
    .max(50, "Name cannot exceed 50 characters.")
    .test("no-leading-trailing-space", "Name cannot start or end with a space.", (value) =>
      value ? value.trim() === value : false
    )
    .matches(
      /^[a-zA-Z\s'-]+$/,
      "Name can only contain letters, spaces, hyphens, and apostrophes without special characters or numbers."
    )
    .test("no-consecutive-spaces", "Name cannot contain multiple consecutive spaces.", (value) =>
      value ? !/\s{2,}/.test(value) : false
    ),

  email: Yup.string()
    .required("Email is required")
    .test("no-leading-space", "Email cannot start with a space.", (value) =>
      value ? value[0] !== " " : false
    )
    .test(
      "no-internal-or-trailing-space",
      "Email cannot contain spaces.",
      (value) => (value ? value.trim() === value && !/\s/.test(value) : false)
    )
    .matches(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, "Invalid email format."),

  phone: Yup.string()
    .required("Phone number is required")
    .matches(
      /^\(\d{3}\)\s\d{3}-\d{4}$/,
      "Please enter a valid phone number in (123) 456-7889 format"
    ),

  password: Yup.string()
    .required("Please enter your password")
    .matches(/^\S*$/, "Password should not contain spaces.")
    .min(8, "Password must be at least 8 characters long.")
    .max(50, "Password must not exceed 50 characters.")
    .matches(/[A-Z]/, "Password must contain at least one uppercase letter.")
    .matches(/\d/, "Password must contain at least one number.")
    .matches(
      /[!@#$%^&*(),.?":{}|<>]/,
      "Password must contain at least one @ special character."
    ),

  cPassword: Yup.string()
    .required("Confirm Password is required")
    .matches(/^\S*$/, "Password should not contain spaces.")
    .oneOf([Yup.ref("password")], "Passwords must match"),

  acceptTerms: Yup.boolean()
    .oneOf([true], "You must accept the Terms & Conditions and Privacy Policy")
    .required("You must accept the Terms & Conditions and Privacy Policy"),
});
