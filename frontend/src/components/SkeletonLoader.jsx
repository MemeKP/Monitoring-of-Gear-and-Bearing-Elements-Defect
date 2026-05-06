export function HeaderSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-pulse">
      <div className="flex items-center gap-4 mb-3">
        <div className="h-7 w-28 bg-gray-200 rounded-lg" />
        <div className="h-6 w-72 bg-gray-200 rounded" />
      </div>
      <div className="h-4 w-48 bg-gray-200 rounded mb-3" />
      <div className="flex gap-4 mb-5">
        {[1,2,3,4,5].map(i => <div key={i} className="h-4 w-20 bg-gray-200 rounded" />)}
      </div>
      <div className="flex gap-2">
        <div className="h-7 w-24 bg-gray-200 rounded-full" />
        <div className="h-7 w-20 bg-gray-200 rounded-full" />
      </div>
    </div>
  );
}

export function ErrorBox({ message }) {
  return (
    <div className="rounded-2xl p-6 bg-red-50 border border-red-200">
      <p className="text-sm text-red-600 font-medium">Failed to load measurement: {message}</p>
    </div>
  );
}

