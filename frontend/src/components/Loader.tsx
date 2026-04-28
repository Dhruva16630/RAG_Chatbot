

const Loader = () => {
  return (
    <div className="flex items-center justify-center space-x-2">
      <div className="w-2 h-2 bg-neutral-700 rounded-full animate-bounce [animation-delay:-0.3s]" />
      <div className="w-2 h-2 bg-neutral-700 rounded-full animate-bounce [animation-delay:-0.15s]" />
      <div className="w-2 h-2 bg-neutral-700 rounded-full animate-bounce" />
    </div>
  );
};

export default Loader;