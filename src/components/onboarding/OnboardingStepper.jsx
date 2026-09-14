import React from "react";
import { LogOut } from "lucide-react";

export default function OnboardingStepper({
  steps = [],
  currentStep = 0,
  onLogout,
}) {
  return (
    <div className="col-span-12 lg:col-span-4 flex flex-col justify-between h-full px-4 lg:px-10 bg-white rounded-[28px] py-4 lg:py-10">
      <div className="w-full mt-2 lg:mt-24">
        <div
          className="
          hidden-scrollbar
          py-4
          overflow-auto
          flex flex-row lg:flex-col
          items-center lg:items-start
          justify-between lg:justify-normal
          w-full
          gap-0 lg:gap-0
          relative
        "
        >
          {steps?.map((step, index) => {
            const Icon = step.icon;
            const isLast = index === steps?.length - 1;

            return (
              <div
                key={index}
                className="relative flex flex-col items-center lg:items-start text-center lg:text-left flex-1"
              >
                {/* Icon */}
                <div className="flex items-center gap-4 mb-1 lg:mb-12">
                  <div
                    className={`
                  w-10 h-10 lg:w-14 lg:h-14 rounded-xl flex items-center justify-center
                  transition-all duration-300 z-10 
                  ${
                    step.completed
                      ? "bg-[#F85E00] border-[1px] border-[#F85E00]"
                      : step.active
                      ? "bg-white border-[1px] border-[#F85E00]"
                      : "bg-white border-[1px] border-[#181818]/60"
                  }
                `}
                  >
                    <Icon
                      className={`lg:text-[22px] transition-all duration-300 ${
                        step.completed
                          ? "text-white"
                          : step.active
                          ? "text-[#F85E00]"
                          : "text-[#181818]"
                      }`}
                    />
                  </div>
                  <div
                    className={`
                text-[10px] hidden lg:flex sm:text-[8px] lg:text-[14px] lg:font-medium transition-all duration-300
                ${
                  step.completed || step.active
                    ? "text-[#181818]"
                    : "text-[#181818]/60"
                }
              `}
                  >
                    {step.title}
                  </div>
                </div>

                {/* Step Title (mobile) */}
                <div
                  className={`
                text-[10px] ml-4 text-nowrap lg:hidden sm:text-[8px] lg:text-lg lg:font-medium transition-all duration-300
                ${
                  step.completed || step.active ? "text-white" : "text-white/60"
                }
              `}
                >
                  {step.title}
                </div>

                {/* Connector Line */}
                {!isLast && (
                  <div
                    className={`
                  absolute transition-all duration-500
                  ${index < currentStep ? "bg-[#F85E00]" : "bg-black/20"}
                  /* Horizontal line (mobile) */
                  top-[35%] w-full h-px left-20
                  /* Vertical line (desktop) */
                  lg:w-px lg:h-16 lg:left-6 lg:top-12
                `}
                  ></div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Logout Option in sidebar (Desktop) */}
      {onLogout && (
        <div className="pt-6 border-t border-gray-100 hidden lg:block">
          <button
            type="button"
            onClick={onLogout}
            className="flex items-center gap-2.5 text-sm font-medium text-gray-500 hover:text-red-600 transition-colors py-2 px-3 rounded-xl hover:bg-red-50/70 w-full cursor-pointer group"
          >
            <LogOut
              size={18}
              className="text-gray-400 group-hover:text-red-500 transition-colors"
            />
            <span>Log Out</span>
          </button>
        </div>
      )}
    </div>
  );
}