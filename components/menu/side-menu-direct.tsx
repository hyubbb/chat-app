import { CollapseStateType, dmListType, UserType } from "@/types";
import { ChevronDown, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

type SideMenuDirectProps = {
  toggleCollapse: (key: string) => void;
  collapseState: CollapseStateType;
  dmList: any;
  user: UserType | null;
};

export const SideMenuDirect = ({
  toggleCollapse,
  collapseState,
  dmList,
  user,
}: SideMenuDirectProps) => {
  const router = useRouter();
  const handleClick = (chatId: number) => {
    router.push(`/direct/${chatId}`);
  };

  return (
    <div className="border-b p-4 dark:border-zinc-700">
      <div
        className="flex cursor-pointer items-center justify-between"
        onClick={() => toggleCollapse("dm")}
      >
        <div className="flex w-full items-center gap-x-2">
          <h2 className="font-semibold">Direct Messages</h2>
          {dmList?.length > 0 && (
            <span className="m-0 p-0 text-xs text-gray-400">
              ({dmList?.length})
            </span>
          )}
        </div>
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
          {dmList?.map(
            ({ id, other_id, other_name, other_photo_url }: dmListType) => {
              return (
                <li
                  key={id}
                  onClick={() => handleClick(other_id)}
                  className="flex items-center space-x-3 rounded p-1 hover:bg-gray-200 hover:text-zinc-700"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-950 text-sm font-bold text-white">
                    {other_photo_url ? (
                      <div className="relative h-12 w-12 overflow-hidden rounded-full bg-white">
                        <Image
                          src={other_photo_url}
                          width={100}
                          height={100}
                          sizes="100vw"
                          priority
                          alt={other_name}
                        />
                      </div>
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-black"></div>
                    )}
                  </div>
                  <span>{other_name}</span>
                </li>
              );
            },
          )}
        </ul>
      )}
    </div>
  );
};
