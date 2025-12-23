"use client"

import { ColumnDef } from "@tanstack/react-table";
import { ArrowDownWideNarrow } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

import { toLocalString } from "@/lib/to-local-string";
import { ILeaderboardTableMeta } from "./domain/types";


export const columns: ColumnDef<UserRank>[] = [
  {
    accessorKey: "address",
    header: "User",
    meta: { className: "w-[220px] min-w-[200px]" },
    cell: ({ row, table }: any) => {
      const meta = table.options.meta as ILeaderboardTableMeta;
      const address = row.getValue("address") as string;

      const username = meta?.usernames?.find((u: any) => u.address === address)?.username;

      return <>
        <Link href={`/${address}`}>{username ?? address}</Link>
      </>
    }
  },
  {
    accessorKey: "amount",
    header: ({ column }) => (<Button
      variant="ghost"
      size="sm"
      onClick={() => column.toggleSorting(true)}
    >
      Total balance
      <ArrowDownWideNarrow className="w-4 h-4 ml-2" />
    </Button>),
    meta: { className: "w-[160px] min-w-[140px]" },
    cell: ({ row, table }: any) => {
      const meta = table.options.meta as ILeaderboardTableMeta;
      const amount = row.getValue("amount") as number;

      return <span><span className="fixed-numbers">{Number(toLocalString(amount / 10 ** meta.frdDecimals)).toPrecision(meta.frdDecimals)}</span> <small>{meta.frdSymbol}</small></span>
    }
  },
  {
    accessorKey: "friends",
    header: ({ column }) => (<Button
      variant="ghost"
      size="sm"
      onClick={() => column.toggleSorting(true)}
    >
      Friends
      <ArrowDownWideNarrow className="w-4 h-4 ml-2" />
    </Button>),
    meta: { className: "w-[120px] min-w-[110px] text-center" },
  },
  {
    accessorKey: "new_users",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => column.toggleSorting(true)}
        >
          New users
          <ArrowDownWideNarrow className="w-4 h-4 ml-2" />
        </Button>
      )
    },
    meta: { className: "w-[120px] min-w-[110px] text-center" },
    cell: ({ row }) => {
      const newUsers = row.getValue("new_users") as number;

      return <span className="">{newUsers}</span>
    }
  }
]
