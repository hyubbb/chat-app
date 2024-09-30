import { Loader2 } from "lucide-react";

export const Loading = () => {
  return (
    <div className="flex flex-1 flex-col items-center justify-center">
      <Loader2 className="my-4 h-7 w-7 animate-spin text-zinc-500" />
      <p className="text-xs text-zinc-500 dark:text-zinc-400">Loading...</p>
    </div>
  );
};
