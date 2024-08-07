export const Loading = () => {
  return (
    <div className="fixed left-0 top-0 h-full w-full bg-zinc-400/10">
      <div className="flex h-full items-center justify-center">
        <div className="h-4 w-4 animate-bounce rounded-full bg-blue-700 [animation-delay:.7s]"></div>
        <div className="h-4 w-4 animate-bounce rounded-full bg-blue-700 [animation-delay:.3s]"></div>
        <div className="h-4 w-4 animate-bounce rounded-full bg-blue-700 [animation-delay:.7s]"></div>
      </div>
    </div>
  );
};
