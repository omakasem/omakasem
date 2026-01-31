import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/table'

export default function Loading() {
  return (
    <>
      <div className="flex items-end justify-between gap-4">
        <div className="h-8 w-24 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-9 w-32 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
      </div>
      <Table className="mt-8 [--gutter:--spacing(6)] lg:[--gutter:--spacing(10)]">
        <TableHead>
          <TableRow>
            <TableHeader>Order number</TableHeader>
            <TableHeader>Purchase date</TableHeader>
            <TableHeader>Customer</TableHeader>
            <TableHeader>Event</TableHeader>
            <TableHeader className="text-right">Amount</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <TableRow key={i}>
              <TableCell>
                <div className="h-5 w-16 animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-800" />
              </TableCell>
              <TableCell>
                <div className="h-5 w-24 animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-800" />
              </TableCell>
              <TableCell>
                <div className="h-5 w-32 animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-800" />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <div className="size-6 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-800" />
                  <div className="h-5 w-24 animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-800" />
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="ml-auto h-5 w-16 animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-800" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  )
}
