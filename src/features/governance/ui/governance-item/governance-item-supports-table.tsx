"use client";

import { FC, useMemo } from "react";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable
} from "@tanstack/react-table";
import { governanceItemSupportsColumns } from "./governance-item-supports-columns";


interface GovernanceItemSupportsTableProps {
  supportsValues: Record<string, number>; // supporter value -> amount
  name: keyof AgentParams;
  frdToken: TokenMeta;
  choices: Record<string, { value: AgentParams[keyof AgentParams], sqrt_balance?: number } | undefined>;
}

export type SupportedValuesData = {
  id: string
  amount: number
  value: any;
}

export const GovernanceItemSupportsTable: FC<GovernanceItemSupportsTableProps> = ({ choices, supportsValues, name, frdToken }) => {
  const data = useMemo(() => (
    supportsValues
      ? Object.entries(supportsValues).map(([value, amount]) => ({
        id: value,
        value: value,
        amount: amount
      })).filter(item => item.amount > 0)
      : []
  ), [supportsValues]);

  const sortingState = useMemo(() => ([
    {
      id: "amount",
      desc: true
    }
  ]), []);

  const table = useReactTable({
    data,
    columns: governanceItemSupportsColumns,
    meta: {
      name,
      frdToken,
      choices
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting: sortingState
    },
  });

  return <div className="overflow-hidden border rounded-md">
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
                  {flexRender(
                    cell.column.columnDef.cell,
                    cell.getContext()
                  )}
                </TableCell>
              ))}
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell
              colSpan={governanceItemSupportsColumns.length}
              className="h-24 text-center"
            >
              No supported values
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  </div>
}