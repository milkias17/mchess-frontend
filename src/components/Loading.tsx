function Loading() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-opacity-70 z-50">
      <div className="flex flex-col items-center text-white">
        <span className="loading loading-spinner loading-xl text-primary mb-4" />
        <p className="text-2xl font-bold  text-accent animate-pulse">
          Loading...
        </p>
      </div>
    </div>
  );
}

export default Loading;
