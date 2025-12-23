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
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => column.toggleSorting(true)}
        >
          Total balance
          <ArrowDownWideNarrow className="w-4 h-4 ml-2" />
        </Button>
      )
    },
    cell: ({ row, table }: any) => {
      const meta = table.options.meta as ILeaderboardTableMeta;
      const amount = row.getValue("amount") as number;

      return <span>{toLocalString(amount / 10 ** meta.frdDecimals)} <small>{meta.frdSymbol}</small></span>
    }
  },
  {
    accessorKey: "friends",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => column.toggleSorting(true)}
        >
          Friends
          <ArrowDownWideNarrow className="w-4 h-4 ml-2" />
        </Button>
      )
    },
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
  }
]
