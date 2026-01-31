import { DescriptionDetails, DescriptionList, DescriptionTerm } from '@/components/description-list'
import { Divider } from '@/components/divider'
import { Subheading } from '@/components/heading'
import { ChevronLeftIcon } from '@heroicons/react/16/solid'

export default function Loading() {
  return (
    <>
      <div className="max-lg:hidden">
        <div className="inline-flex items-center gap-2 text-sm/6 text-zinc-500 dark:text-zinc-400">
          <ChevronLeftIcon className="size-4 fill-zinc-400 dark:fill-zinc-500" />
          Orders
        </div>
      </div>
      <div className="mt-4 lg:mt-8">
        <div className="flex items-center gap-4">
          <div className="h-8 w-32 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-6 w-24 animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-800" />
        </div>
        <div className="isolate mt-2.5 flex flex-wrap justify-between gap-x-6 gap-y-4">
          <div className="flex flex-wrap gap-x-10 gap-y-4 py-1.5">
            <div className="flex items-center gap-3">
              <div className="size-4 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-800" />
              <div className="h-5 w-16 animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-800" />
            </div>
            <div className="flex items-center gap-3">
              <div className="size-4 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-800" />
              <div className="h-5 w-32 animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-800" />
            </div>
            <div className="flex items-center gap-3">
              <div className="size-4 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-800" />
              <div className="h-5 w-24 animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-800" />
            </div>
          </div>
          <div className="flex gap-4">
            <div className="h-9 w-20 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-9 w-32 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
          </div>
        </div>
      </div>
      <div className="mt-12">
        <Subheading>Summary</Subheading>
        <Divider className="mt-4" />
        <DescriptionList>
          <DescriptionTerm>Customer</DescriptionTerm>
          <DescriptionDetails>
            <div className="h-5 w-32 animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-800" />
          </DescriptionDetails>
          <DescriptionTerm>Event</DescriptionTerm>
          <DescriptionDetails>
            <div className="flex items-center gap-2">
              <div className="size-6 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-800" />
              <div className="h-5 w-48 animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-800" />
            </div>
          </DescriptionDetails>
          <DescriptionTerm>Amount</DescriptionTerm>
          <DescriptionDetails>
            <div className="h-5 w-24 animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-800" />
          </DescriptionDetails>
          <DescriptionTerm>Amount after exchange rate</DescriptionTerm>
          <DescriptionDetails>
            <div className="h-5 w-40 animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-800" />
          </DescriptionDetails>
          <DescriptionTerm>Fee</DescriptionTerm>
          <DescriptionDetails>
            <div className="h-5 w-16 animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-800" />
          </DescriptionDetails>
          <DescriptionTerm>Net</DescriptionTerm>
          <DescriptionDetails>
            <div className="h-5 w-16 animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-800" />
          </DescriptionDetails>
        </DescriptionList>
      </div>
      <div className="mt-12">
        <Subheading>Payment method</Subheading>
        <Divider className="mt-4" />
        <DescriptionList>
          <DescriptionTerm>Transaction ID</DescriptionTerm>
          <DescriptionDetails>
            <div className="h-5 w-32 animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-800" />
          </DescriptionDetails>
          <DescriptionTerm>Card number</DescriptionTerm>
          <DescriptionDetails>
            <div className="h-5 w-32 animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-800" />
          </DescriptionDetails>
          <DescriptionTerm>Card type</DescriptionTerm>
          <DescriptionDetails>
            <div className="h-5 w-16 animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-800" />
          </DescriptionDetails>
          <DescriptionTerm>Card expiry</DescriptionTerm>
          <DescriptionDetails>
            <div className="h-5 w-16 animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-800" />
          </DescriptionDetails>
          <DescriptionTerm>Owner</DescriptionTerm>
          <DescriptionDetails>
            <div className="h-5 w-32 animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-800" />
          </DescriptionDetails>
          <DescriptionTerm>Email address</DescriptionTerm>
          <DescriptionDetails>
            <div className="h-5 w-48 animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-800" />
          </DescriptionDetails>
          <DescriptionTerm>Address</DescriptionTerm>
          <DescriptionDetails>
            <div className="h-5 w-64 animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-800" />
          </DescriptionDetails>
          <DescriptionTerm>Country</DescriptionTerm>
          <DescriptionDetails>
            <div className="flex items-center gap-3">
              <div className="h-5 w-6 animate-pulse rounded-sm bg-zinc-200 dark:bg-zinc-800" />
              <div className="h-5 w-24 animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-800" />
            </div>
          </DescriptionDetails>
          <DescriptionTerm>CVC</DescriptionTerm>
          <DescriptionDetails>
            <div className="h-6 w-32 animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-800" />
          </DescriptionDetails>
        </DescriptionList>
      </div>
    </>
  )
}
