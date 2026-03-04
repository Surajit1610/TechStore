import { Skeleton } from "@/components/ui/skeleton";
import { IconHeart } from '@tabler/icons-react';

export default function Loading() {
  return (
    <div className="min-h-screen">
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 sm:gap-4 gap-2'>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className='relative flex flex-col justify-center gap-1 sm:p-3 p-1.5 border rounded-md shadow-md bg-card'>
              <Skeleton className='relative aspect-square rounded-md' />
              <div className='flex-1 mt-2'>
                <Skeleton className='h-5 w-full mb-2' />
                <Skeleton className='h-5 w-3/4' />
                <Skeleton className='h-6 w-1/2 mt-2' />
              </div>
              <div className='flex gap-2 mt-3'>
                <Skeleton className='h-10 flex-1 rounded-md' />
                <Skeleton className='h-10 w-12 rounded-md' />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}