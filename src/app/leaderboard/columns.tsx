"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"

import { Button } from "@/components/ui/button"

import { appConfig } from "@/appConfig"
import { toLocalString } from "@/lib/toLocalString"
import Link from "next/link"

export const columns: ColumnDef<UserRank>[] = [
  {
    accessorKey: "username",
    header: "User",
    cell: ({ row, table }: any) => {
      const meta = table.options.meta;
      const address = row.getValue("username") as string;

      const username = meta?.usernames?.find((u: any) => u.address === address)?.username;

      return <>
        <Link className="text-blue-700" href={`/user/${address}`}>{username ?? address}</Link>
        <Link className="ml-2 text-gray-400" href={`https://${appConfig.TESTNET ? 'testnet' : ''}explorer.obyte.org/address/${address}`} target="_blank" rel="noreferrer">(explorer)</Link>
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
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Amount
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row, table }: any) => {
      const meta = table.options.meta;
      const amount = row.getValue("amount") as number;

      return <span>{toLocalString(amount / 10 ** meta.decimals)} <small>{meta.symbols}</small></span>
    }
  },
  {
    accessorKey: "friends",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Friends
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  }
]