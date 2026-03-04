import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingProduct() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 lg:py-8 sm:py-6 py-4">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left: Gallery */}
        <div className="md:col-span-7">
          <div className="bg-card rounded-lg p-3 md:p-6 shadow-sm border">
            <div className="relative w-full overflow-hidden rounded-md">
              <Skeleton className="w-full aspect-square" />
            </div>
            {/* Thumbnails */}
            <div className="mt-3 flex gap-2 p-1 overflow-x-auto">
              <Skeleton className="h-20 w-20 shrink-0 rounded-md" />
              <Skeleton className="h-20 w-20 shrink-0 rounded-md" />
              <Skeleton className="h-20 w-20 shrink-0 rounded-md" />
            </div>
          </div>
        </div>

        {/* Right: Details */}
        <div className="md:col-span-5">
          <div className="bg-card rounded-lg p-4 md:p-6 shadow-sm border">
            <Skeleton className="h-8 w-3/4 mb-4" />
            <Skeleton className="h-10 w-1/2 mb-4" />
            <div className="flex items-center gap-3 mb-4">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-10 rounded-md" />
            </div>
          </div>

          <div className="mt-4 bg-card p-4 rounded-md shadow-sm border">
            <Skeleton className="h-6 w-1/4 mb-4" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </div>
      </div>
    </div>
  );
}