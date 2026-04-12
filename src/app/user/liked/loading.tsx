import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className='grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7'>
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className='flex flex-col gap-3 p-3 border rounded-2xl bg-card shadow-sm'>
          <Skeleton className="aspect-square rounded-xl w-full" />
          <div className="space-y-2 mt-2 flex-1">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-4 w-2/3" />
          </div>
          <div className="mt-auto pt-2 flex gap-2 items-center">
              <Skeleton className="h-10 w-full rounded-xl sm:hidden" />
              <Skeleton className="h-10 w-12 sm:w-full rounded-xl shrink-0" />
          </div>
        </div>
      ))}
    </div>
  );
}
