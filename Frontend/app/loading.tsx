// app/loading.tsx
export default function Loading() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-gray-900 text-white">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-500"></div>
      <p className="mt-4 text-lg">Loading Eunoia...</p>
    </div>
  );
}