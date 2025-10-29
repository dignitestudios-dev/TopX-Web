
import { useState } from "react";
import VerificationModal from "../../authentication/VerificationModal";
import Button from "../../common/Button";
import Input from "../../common/Input";
import { useFormik } from "formik";
import * as Yup from "yup";
import { changeNumberSchema } from "../../../schema/authentication/dummyLoginSchema";
import SuccessModal from "../../common/Modal";

export default function ChangeContact() {
    const [openModal, setOpenModal] = useState(false);
    const [openSuccessModal, setOpenSuccessModal] = useState(false);
    const { values, handleBlur, handleChange, handleSubmit, errors, touched } =
    useFormik({
      initialValues: {
        phone: "",
      },
      validationSchema: changeNumberSchema,
      
      onSubmit: (values) => {
        setOpenModal(true);
        console.log(values);
      },
    });
    const handleVerificationClose = () => {
        setOpenModal(false);    // pehli modal band
        setOpenSuccessModal(true);    // dusri modal open
      };
    return (
        <div className="space-y-6">
            <h1 className="text-[28px] font-bold tracking-[-0.018em]">Change Contact</h1>
            <form onSubmit={handleSubmit} className="w-[500px] flex flex-col gap-2">
                <Input
                    label="Phone Number"
                    type="tel"
                    placeholder="Enter your phone number"
                    variant="default"
                    size="md"
                    id="phone"
                    name="phone"
                   onChange={(e) => {
    const onlyDigits = e.target.value.replace(/\D/g, "").slice(0, 10);
    handleChange({
      target: { name: "phone", value: onlyDigits }
    });  }}
                    onBlur={handleBlur}
                    value={values.phone}
                    error={errors.phone}
                    touched={touched.phone}
                 
                    showCountrySelector={true}
                />
                <Button
                    type="submit"
                    size="full"
                    variant="orange"
                    className="w-full flex justify-center items-center"
                >
                    Save
                </Button>
            </form>
            <VerificationModal
            mode="delete"
           type="button"
          
    
    
            isOpen={openModal}  
    onClose={handleVerificationClose}  
/>
<SuccessModal    isOpen={openSuccessModal} onClose={() => setOpenSuccessModal(!openSuccessModal)} heading="Password Changed" message="Your password has been updated successfully." autoCloseDuration={2000}/>
        </div>
    );
}