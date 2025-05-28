"use client"

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[],
  loading: boolean
  emptyStateMessage?: string;
  emptyStateSubMessage?: string;
}

// Mobile Loading Skeleton Card
const MobileSkeletonCard = () => (
  <div className="bg-white border rounded-xl p-3 shadow-sm space-y-2.5 mx-2 mb-3">
    <div className="flex items-center gap-3">
      <Skeleton className="w-14 h-14 rounded-xl" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      </div>
    </div>
    <div className="bg-gray-50 rounded-lg px-3 py-2.5">
      <div className="flex justify-between">
        <div className="space-y-1">
          <Skeleton className="h-3 w-8" />
          <Skeleton className="h-4 w-12" />
        </div>
        <div className="space-y-1">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-4 w-10" />
        </div>
      </div>
    </div>
    <div className="flex gap-2.5 pt-1">
      <Skeleton className="flex-1 h-9 rounded" />
      <Skeleton className="flex-1 h-9 rounded" />
    </div>
  </div>
);

// Mobile Empty State
const MobileEmptyState = ({ message, subMessage }: { message?: string; subMessage?: string; }) => (
  <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
      <svg
        className="w-8 h-8 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10"
        />
      </svg>
    </div>
    <h3 className="text-lg font-medium text-gray-900 mb-2">{message || "No data found"}</h3>
    <p className="text-gray-500 text-sm">
      {subMessage || "Get started by adding your first item."}
    </p>
  </div>
);

export function DataTable<TData, TValue>({
  columns,
  data,
  loading,
  emptyStateMessage,
  emptyStateSubMessage
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  // Filter out mobile-only column for desktop table
  const desktopColumns = columns.filter(col => col.id !== 'mobile-card');
  
  const desktopTable = useReactTable({
    data,
    columns: desktopColumns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="mt-7">
      {/* Mobile View */}
      <div className="md:hidden">
        {loading ? (
          <div className="space-y-0">
            {Array.from({ length: 5 }).map((_, index) => (
              <MobileSkeletonCard key={`mobile-skeleton-${index}`} />
            ))}
          </div>
        ) : data?.length ? (
          <div className="space-y-0 flex flex-col">
            {table.getRowModel().rows.map((row) => {
              // Find the mobile card cell
              const mobileCell = row.getVisibleCells().find(cell => cell.column.id === 'mobile-card');
              return mobileCell ? (
                <div key={row.id}>
                  {flexRender(mobileCell.column.columnDef.cell, mobileCell.getContext())}
                </div>
              ) : null;
            })}
          </div>
        ) : (
          <MobileEmptyState message={emptyStateMessage} subMessage={emptyStateSubMessage} />
        )}
      </div>

      {/* Desktop View */}
      <div className="hidden md:block overflow-x-auto rounded-lg shadow-xl bg-white p-2">
        <div className="min-w-full inline-block align-middle">
          <Table className="min-w-[800px] w-full">
            <TableHeader>
              {desktopTable.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className="font-medium text-gray-600">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, rowIndex) => (
                  <TableRow key={`desktop-skeleton-row-${rowIndex}`}>
                    {desktopColumns.map((_, colIndex) => (
                      <TableCell key={`desktop-skeleton-cell-${colIndex}`}>
                        <Skeleton className="h-4 w-full bg-gray-200 rounded-md" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : desktopTable.getRowModel().rows?.length ? (
                desktopTable.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-3">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell 
                    colSpan={desktopColumns.length} 
                    className="h-32 text-center"
                  >
                    <div className="flex flex-col items-center justify-center py-8">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                        <svg
                          className="w-6 h-6 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10"
                          />
                        </svg>
                      </div>
                      <p className="text-gray-500 font-medium">{emptyStateMessage || "No data found"}</p>
                      <p className="text-gray-400 text-sm mt-1">
                        {emptyStateSubMessage || "Get started by adding your first item."}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}