import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/16/solid";

interface MainDisclosureProps {
  heading: string;
  description: string;
  children?: React.ReactNode;
}
const MainDisclosure = ({
  heading,
  children,
  description,
}: MainDisclosureProps) => {
  return (
    <div className="sm:w-full w-[270px] bg-[#C9EABA4F] rounded-md  border border-green-200 ">
      <div className="mx-auto w-full max-w-md">
        <Disclosure as="div">
          {({ open }) => (
            <>
              <DisclosureButton className="group p-2 flex justify-between w-full items-center font-bold tracking-wider">
                {heading}
                <ChevronDownIcon
                  className={`h-5 w-5 transform transition-transform ${
                    open ? "rotate-180" : ""
                  } group-hover:fill-green-400`}
                />
              </DisclosureButton>
              <DisclosurePanel className="relative">
                <div className="absolute top-0 left-0 w-full border-t border-green-200" />
                <div className="px-2 py-3 text-black">
                  <span className="block text-left">{description}</span>
                  {children}
                </div>
              </DisclosurePanel>
            </>
          )}
        </Disclosure>
      </div>
    </div>
  );
};
export default MainDisclosure;
