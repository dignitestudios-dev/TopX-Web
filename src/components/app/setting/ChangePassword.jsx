import Input from "../../common/Input";
import { useFormik } from "formik";

import { changePasswordSchema } from "../../../schema/authentication/dummyLoginSchema";
import { changePasswordValues } from "../../../init/authentication/dummyLoginValues";
import { use, useState } from "react";
import { HiEye, HiEyeOff } from "react-icons/hi";
import Button from "../../common/Button";
import Modal from "../../common/Modal";
import SuccessModal from "../../common/Modal";
import { useDispatch, useSelector } from "react-redux";
import { changePassword } from "../../../redux/slices/profileSetting.slice";

export default function ChangePassword() {
  const [openModal, setOpenModal] = useState(false);
  const [isOldPasswordVisible, setIsOldPasswordVisible] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false);
  const dispatch = useDispatch();
  const { isLoading } = useSelector((state) => state.profileSetting);
  const {
    values,
    handleBlur,
    handleChange,
    handleSubmit,
    errors,
    touched,
    resetForm,
  } = useFormik({
    initialValues: changePasswordValues,
    validationSchema: changePasswordSchema,
    onSubmit: async (values) => {
      console.log(values);
      const data = {
        password: values.old_password,
        newPassword: values.confirm_password,
      };
      await dispatch(changePassword(data)).unwrap();
      resetForm();
      setOpenModal(true);
    },
  });
  console.log(openModal);
  return (
    <div className="w-full space-y-6">
      <h1 className="text-[28px] font-bold tracking-[-0.018em]">
        Change Password
      </h1>
      <form onSubmit={handleSubmit}>
        <div className="w-[500px] flex flex-col gap-2 ">
          <Input
            label="Current Password"
            type={isOldPasswordVisible ? "text" : "password"}
            placeholder="Enter your old password"
            variant="default"
            size="md"
            id="old_password"
            name="old_password"
            onChange={handleChange}
            onBlur={handleBlur}
            iconRight={
              isOldPasswordVisible ? (
                <HiEye
                  onClick={() => setIsOldPasswordVisible(false)}
                  className="cursor-pointer "
                />
              ) : (
                <HiEyeOff
                  onClick={() => setIsOldPasswordVisible(true)}
                  className="cursor-pointer "
                />
              )
            }
            error={errors.old_password}
            touched={touched.old_password}
            value={values.old_password}
          />
          <p className="text-[14px] font-[500] text-[#0E1014]">
            You must enter current password in order to change password.
          </p>

          <div className="py-4 space-y-6">
            <Input
              label="New Password"
              type={isPasswordVisible ? "text" : "password"}
              placeholder="Enter your new password"
              variant="default"
              size="md"
              id="password"
              name="password"
              onChange={handleChange}
              onBlur={handleBlur}
              iconRight={
                isPasswordVisible ? (
                  <HiEye
                    onClick={() => setIsPasswordVisible(false)}
                    className="cursor-pointer "
                  />
                ) : (
                  <HiEyeOff
                    onClick={() => setIsPasswordVisible(true)}
                    className="cursor-pointer "
                  />
                )
              }
              error={errors.password}
              touched={touched.password}
              value={values.password}
            />

            <Input
              label="Confirm Password"
              type={isConfirmPasswordVisible ? "text" : "password"}
              placeholder="Enter your confirm password"
              variant="default"
              size="md"
              id="confirm_password"
              name="confirm_password"
              onChange={handleChange}
              onBlur={handleBlur}
              iconRight={
                isConfirmPasswordVisible ? (
                  <HiEye
                    onClick={() => setIsConfirmPasswordVisible(false)}
                    className="cursor-pointer "
                  />
                ) : (
                  <HiEyeOff
                    onClick={() => setIsConfirmPasswordVisible(true)}
                    className="cursor-pointer "
                  />
                )
              }
              error={errors.confirm_password}
              touched={touched.confirm_password}
              value={values.confirm_password}
            />
          </div>
        </div>

        <Button
          type="submit"
          size="full"
          variant="orange"
          loading={isLoading}
          className="w-full flex justify-center items-center"
        >
          Save
        </Button>
      </form>
      <SuccessModal
        isOpen={openModal}
        onClose={() => setOpenModal(!openModal)}
        heading="Password Changed"
        message="Your password has been updated successfully."
        autoCloseDuration={2000}
      />
    </div>
  );
}
