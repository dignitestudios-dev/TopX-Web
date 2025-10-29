import { changeDOBGenderSchema } from "../../../schema/authentication/dummyLoginSchema";
import Button from "../../common/Button";
import Input from "../../common/Input";
import { useFormik } from "formik";
import { useState } from "react";



export default function DOBGender() {
    const [openModal, setOpenModal] = useState(false);
    const { values, handleBlur, handleChange, handleSubmit, errors, touched } =
    useFormik({
      initialValues: {
        dob: "",
      },
      validationSchema: changeDOBGenderSchema,
      
      onSubmit: (values) => {
        setOpenModal(true);
        console.log(values);
      },
    });
    return (
        <div className="space-y-6">
            <h1 className="text-[28px] font-bold tracking-[-0.018em]">DOB & Gender</h1>
            <div className="w-[500px] flex flex-col gap-4">
                <Input
                    label="Date of Birth"
                    type="date"
                    placeholder="Enter your date of birth"
                    variant="default"
                    size="md"
                    id="dob"
                    name="dob"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values.dob}
                    error={errors.dob}
                    touched={touched.dob}
                />
                <Input
                    label="Gender"
                    type="radio"
                    placeholder="Enter your gender"
                    variant="default"
                    size="md"
                    id="gender"
                    name="gender"
                    options={[
                        { value: "male", label: "Male" },
                        { value: "female", label: "Female" },
                        { value: "other", label: "Other" },
                      ]}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values.gender}
                    error={errors.gender}
                    touched={touched.gender}
                />
            </div>
            <Button
                    type="submit"
                    size="full"
                    variant="orange"
                    className="w-full flex justify-center items-center"
                >
                    Save
                </Button>
        </div>
    )
}