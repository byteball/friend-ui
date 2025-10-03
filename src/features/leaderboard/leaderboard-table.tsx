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

export function LeaderboardTable<TData>({
  leaderboardData,
  usernames
}: DataTableProps<TData>) {
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

  const table = useReactTable({
    data: leaderboardData as UserRank[],
    columns,
    meta,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting
    }
  })

  return (
    <div className="overflow-hidden border rounded-md">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
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
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
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