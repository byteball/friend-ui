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
}

export const GovernanceDepositAssetItemSupportsTable: FC<GovernanceItemSupportsTableProps> = ({
  votes,
  frdToken,
  asset,
  governanceAa
}) => {
  const aggregatedData = useMemo(() => getAggregatedVotes(votes), [votes]);

  const table = useReactTable({
    data: aggregatedData,
    columns: governanceDepositAssetItemSupportsColumns,
    meta: {
      frdToken,
      governanceAa,
      asset
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting: [
        {
          id: "sqrt_amount",
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