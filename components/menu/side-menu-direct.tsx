import { CollapseStateType } from "@/types";
import { ChevronDown, ChevronRight } from "lucide-react";

type SideMenuDirectProps = {
  toggleCollapse: (key: string) => void;
  collapseState: CollapseStateType;
};

export const SideMenuDirect = ({
  toggleCollapse,
  collapseState,
}: SideMenuDirectProps) => {
  return (
    <div className="border-b p-4 dark:border-zinc-700">
      <div
        className="flex cursor-pointer items-center justify-between"
        onClick={() => toggleCollapse("dm")}
      >
        <h2 className="font-semibold">Direct Messages</h2>
        <div className="mr-2">
          {collapseState.dm ? (
            <ChevronRight size={20} />
          ) : (
            <ChevronDown size={20} />
          )}
        </div>
      </div>
      {!collapseState.dm && (
        <ul className="mt-2 space-y-2">
          <li className="flex items-center space-x-2 rounded p-2 hover:bg-gray-100 hover:text-zinc-700">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500 text-sm font-bold text-white">
              AS
            </div>
            <span>Alice Smith</span>
          </li>
          <li className="flex items-center space-x-2 rounded p-2 hover:bg-gray-100 hover:text-zinc-700">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-500 text-sm font-bold text-white">
              BJ
            </div>
            <span>Bob Johnson</span>
          </li>
        </ul>
      )}
    </div>
  );
};
