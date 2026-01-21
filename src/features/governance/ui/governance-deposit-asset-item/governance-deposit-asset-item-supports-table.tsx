"use client";

import { FC, useMemo } from "react";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable
} from "@tanstack/react-table";

import { getAggregatedVotes } from "../../domain/get-aggregated-votes";
import { DepositAssetVote } from "../../domain/get-deposit-assets-data";
import { governanceDepositAssetItemSupportsColumns } from "./governance-deposit-asset-item-supports-columns";

interface GovernanceItemSupportsTableProps {
  votes: DepositAssetVote[];
  frdToken: TokenMeta;
  governanceAa: string;
  asset: string;
  supportedValues?: Record<string, number>; // pool address -> total support amount
}

export const GovernanceDepositAssetItemSupportsTable: FC<GovernanceItemSupportsTableProps> = ({
  votes,
  frdToken,
  asset,
  governanceAa,
  supportedValues
}) => {
  const data = useMemo(() => getAggregatedVotes(votes, supportedValues), [votes, supportedValues]);

  const sortingState = useMemo(() => ([
    {
      id: "total_sqrt_support_amount",
      desc: true
    }
  ]), []);

  const table = useReactTable({
    data,
    columns: governanceDepositAssetItemSupportsColumns,
    meta: {
      frdToken,
      governanceAa,
      asset,
      supportedValues
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
        {table.getRowModel()?.rows?.length ? (
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
              colSpan={governanceDepositAssetItemSupportsColumns.length}
              className="h-24 text-center"
            >
              No supported addresses yet
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  </div>
}