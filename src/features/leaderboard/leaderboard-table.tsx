"use client"

import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState } from "react";

import { useData } from "@/app/context";
import { DataTableProps, ILeaderboardTableMeta } from "./domain/types";
import { columns } from "./leaderboard-columns";

export function LeaderboardTable({
  leaderboardData,
  usernames
}: DataTableProps<UserRank>) {
  const data = useData();

  const { symbol: frdSymbol, decimals: frdDecimals } = data.getFrdToken();

  const [sorting, setSorting] = useState<SortingState>([
    { id: "amount", desc: true },
  ]);

  const meta: ILeaderboardTableMeta = {
    frdDecimals,
    frdSymbol,
    usernames
  }

  const table = useReactTable<UserRank>({
    data: leaderboardData,
    columns,
    meta,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    initialState: {
      pagination: { pageIndex: 0, pageSize: 100 }, // display 100 rows per page
    },
    state: {
      sorting
    }
  })

  return (
    <div className="border rounded-md overflow-x-auto">
      <Table className="table-fixed min-w-[640px] w-full">
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const columnMeta = header.column.columnDef.meta as { className?: string } | undefined;

                return (
                  <TableHead
                    key={header.id}
                    className={columnMeta?.className}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => {
                  const columnMeta = cell.column.columnDef.meta as { className?: string } | undefined;

                  return (
                    <TableCell
                      key={cell.id}
                      className={columnMeta?.className}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  )
                })}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No users
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}