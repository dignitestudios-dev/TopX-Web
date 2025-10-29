export default function OnboardingStepper({ steps = [], currentStep = 0 }) {
  return (
    <div className="col-span-12 lg:col-span-4 flex i justify-center lg:justify-center h-full px-0 lg:px-10 bg-white rounded-[28px]">
      <div className="w-full mt-4 lg:mt-36">
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
                className="relative flex  flex-col items-center lg:items-start text-center lg:text-left flex-1"
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
                      : step.active ? "bg-white border-[1px] border-[#F85E00]" : "bg-white border-[1px] border-[#181818]/60"
                  }
                `}
                  >
                   
                    <Icon
                      
                      className={`lg:text-[22px] transition-all duration-300 ${step.completed ? "text-white" : step.active ? "text-[#F85E00]" : "text-[#181818]"}`}
                    />
                  </div>
                  <div
                    className={`
                text-[10px] hidden  lg:flex sm:text-[8px] lg:text-[14px] lg:font-medium transition-all duration-300
                ${
                  step.completed || step.active ? "text-[#181818]" : "text-[#181818]/60"
                }
              `}
                  >
                    {step.title}
                  </div>
                </div>
 
                {/* Step Title */}
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
    </div>
  );
}