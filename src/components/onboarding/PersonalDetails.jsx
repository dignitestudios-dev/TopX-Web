import { FiPlus } from "react-icons/fi";
import { auth } from "../../assets/export";
import { useState } from "react";
import { useFormik } from "formik";
import { PersonalValues, signupValues } from "../../init/onboarding/signupValues";
import { signupSchema } from "../../schema/onboarding/signupSchema";
import Button from "../common/Button";
import { BiArrowBack } from "react-icons/bi";
import Input from "../common/Input";
import { PersonalSchema } from "../../schema/onboarding/PersonalSchema";

export default function PersonalDetails({ handleNext, handlePrevious }) {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const {
    values,
    handleBlur,
    handleChange,
    handleSubmit,
    errors,
    touched,
  } = useFormik({
    initialValues: PersonalValues,
    validationSchema: PersonalSchema,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values) => {
      // fake loading (optional UX)
      
      
        handleNext(); // go to next step
      
    },
  });
  return (
    <div className="bg-white flex items-center justify-center rounded-[19px] w-full p-6 ">
      <div className="absolute left-4 top-8 transform -translate-y-1/2">
      <BiArrowBack onClick={handlePrevious} />
      </div>
      <div className="flex flex-col w-full items-center justify-center gap-4 lg:gap-4">
        <img src={auth} alt="orange_logo" className="w-[100px]" />
        <h2 className="text-[24px] md:text-[32px] font-bold ">
          Add Personal Details
        </h2>
        <form onSubmit={handleSubmit}>
          <div className=" flex flex-col  justify-center items-center text-center gap-3">
              <Input
                id="file"
                size="md"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                preview={image}
                name="profileImage"
                value={values.profileImage}
                onBlur={handleBlur}
                touched={touched.profileImage}
                error={errors.profileImage}
                fileClassName="w-[120px] h-[120px]"
              />
            
            <p className="text-[14px] font-[500] text-[#f85e00]">
              Upload Profile Photo
            </p>
          </div>
          <div className="w-full md:w-[500px] flex flex-col gap-3">
            <div className="flex flex-col">
              
              <Input
               label="Username"
              type="text"
              name="name"
              value={values.name}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Name"
              touched={touched.name}
              error={errors.name}
              size="md"
              />
           
            </div>
            <div className="flex flex-col">
              <Input
              label="Date Of Birth"
                type="date"
                name="dateOfBirth"
                value={values.dateOfBirth}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Date of Birth"
               error={errors.dateOfBirth}
               touched={touched.dateOfBirth}
               size="md"
                />
            </div>
            <div className="flex flex-col space-y-2">
              <Input
              label="Gender"
                type="radio"
                name="gender"
                value={values.gender}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Gender"
               error={errors.gender}
               touched={touched.gender}
               options={[
                { value: "male", label: "Male" },
                { value: "female", label: "Female" },
                { value: "other", label: "Other" },
              ]}
              size="md"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="" className="text-[14px] font-[500]">
                My Bio <span>(optional)</span>
              </label>
              <textarea
              placeholder="My Bio"
                name=""
                id=""
                cols="30"
                rows="20"
                maxLength={250}
                className="w-full h-[143px] border-[0.8px] bg-[#F8F8F899] outline-none rounded-[12px] p-2 text-[16px] resize-none"
              ></textarea>
            </div>
          </div>
          <Button type="submit" disabled={loading} size="full" onClick={handleNext} className="w-full flex items-center justify-center" variant="orange">
            Next
          </Button>
        </form>
      </div>
    </div>
  );
}
