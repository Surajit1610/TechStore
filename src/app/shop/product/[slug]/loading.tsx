import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingProduct() {
  return (
    <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left: Gallery */}
        <div className="lg:col-span-7">
          <div className="bg-card rounded-3xl p-4 md:p-6 shadow-sm border border-gray-100 dark:border-gray-800">
            <div className="relative w-full overflow-hidden rounded-2xl">
              <Skeleton className="w-full aspect-square" />
            </div>
            {/* Thumbnails */}
            <div className="mt-4 flex gap-3 p-1 overflow-x-auto pb-2">
              <Skeleton className="h-24 w-24 shrink-0 rounded-2xl" />
              <Skeleton className="h-24 w-24 shrink-0 rounded-2xl" />
              <Skeleton className="h-24 w-24 shrink-0 rounded-2xl" />
              <Skeleton className="h-24 w-24 shrink-0 rounded-2xl" />
            </div>
          </div>
        </div>

        {/* Right: Details */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-card rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 dark:border-gray-800">
            <div className="flex justify-between items-start gap-4 mb-4">
                <Skeleton className="h-10 w-3/4" />
                <div className="flex gap-2 shrink-0">
                    <Skeleton className="h-10 w-10 rounded-xl" />
                    <Skeleton className="h-10 w-10 rounded-xl" />
                </div>
            </div>

            <div className="flex items-end gap-3 mb-8">
              <Skeleton className="h-12 w-32" />
              <Skeleton className="h-8 w-20" />
            </div>

            <div className="space-y-4 pt-6 border-t border-gray-100 dark:border-gray-800 mb-8">
                <Skeleton className="h-6 w-64" />
                <Skeleton className="h-6 w-48" />
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                  <Skeleton className="h-12 w-32 rounded-xl shrink-0" />
                  <Skeleton className="h-12 flex-1 rounded-xl" />
              </div>
              <Skeleton className="h-14 w-full rounded-xl" />
            </div>
          </div>

          <div className="bg-card rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 dark:border-gray-800">
            <Skeleton className="h-8 w-48 mb-6" />
            <Skeleton className="h-4 w-full mb-3" />
            <Skeleton className="h-4 w-full mb-3" />
            <Skeleton className="h-4 w-3/4 mb-3" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </div>
      </div>
    </div>
  );
}
