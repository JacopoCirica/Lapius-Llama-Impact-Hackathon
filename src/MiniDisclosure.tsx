import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/16/solid";

interface MiniDisclosureProps {
  heading: string;
  children?: React.ReactNode;
}
const MiniDisclosure = ({ heading, children }: MiniDisclosureProps) => {
  return (
    <Disclosure as="div" className="space-x-4 p-2">
      <DisclosureButton className="group flex w-full text-[#4B8F2C] items-center hover:text-green-500">
        <ChevronDownIcon className="size-5 fill-green-700 group-data-[hover]:fill-green-400 group-data-[open]:rotate-180" />
        {heading}
      </DisclosureButton>
      <DisclosurePanel className="text-gray-500 bg-white border-green-200 border rounded-md p-2 text-left mt-1.5">
        {children}
      </DisclosurePanel>
    </Disclosure>
  );
};
export default MiniDisclosure;
