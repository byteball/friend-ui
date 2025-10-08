"use client";

import { FC } from "react";

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
  choices: Record<string, AgentParams[keyof AgentParams]>;
}

export type SupportedValuesData = {
  id: string
  amount: number
  value: any;
}

export const GovernanceItemSupportsTable: FC<GovernanceItemSupportsTableProps> = ({ choices, supportsValues, name, frdToken }) => {
  const table = useReactTable({
    data: supportsValues ? Object.entries(supportsValues).map(([value, amount]) => ({
      id: value,
      value: value,
      amount: amount
    })) : [],
    columns: governanceItemSupportsColumns,
    meta: {
      name,
      frdToken,
      choices
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting: [
        {
          id: "amount",
          desc: true
        }
      ]
    },
  });

  return <div className="overflow-hidden rounded-md border">
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