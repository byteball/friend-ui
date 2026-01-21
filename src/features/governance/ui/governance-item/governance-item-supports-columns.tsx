import { ColumnDef } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toLocalString } from "@/lib/to-local-string";

import { getVPBySqrtBalance } from "@/lib/calculations/get-vp-by-sqrt-balance";
import Link from "next/link";
import { transformValue } from "../../domain/transform-value";
import { GovernanceModal } from "../governance-modal";
import { SupportedValuesData } from "./governance-item-supports-table";

interface TableMeta {
  frdToken: TokenMeta;
  name: keyof AgentParams;
  choices: Record<string, UserChoice<AgentParams[keyof AgentParams]> | undefined>;
}

export const governanceItemSupportsColumns: ColumnDef<SupportedValuesData>[] = [
  {
    accessorKey: "value",
    header: "Value",
    cell: ({ row, table }) => {
      const value = row.getValue("value");

      const meta = table.options.meta as TableMeta;
      const { frdToken, name } = meta;

      // @ts-expect-error IDK
      return <div>{transformValue(name, value, frdToken)}</div>;
    },
  },
  {
    accessorKey: "amount",
    header: () => "Support",
    cell: ({ row, table }) => {
      const amount = parseFloat(row.getValue("amount"))
      const value = row.getValue("value");

      const meta = table.options.meta as TableMeta;

      const votesByValue = Object.entries(meta.choices)
        .filter((v) => String(v[1]?.value) === String(value));

      return <Dialog>
        <DialogTrigger asChild>
          <Button variant="link" className="p-0 m-0 link-style">
            {toLocalString(getVPBySqrtBalance(amount, meta.frdToken.decimals))}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Supporters</DialogTitle>
          </DialogHeader>

          <div className="grid gap-2">
            {votesByValue.map(vote => <div key={vote[0]}>
              <Link href={`/${vote[0]}`}>{vote[0]}</Link>
              <div className="text-muted-foreground">{getVPBySqrtBalance(vote[1]?.sqrt_balance || 0, meta.frdToken.decimals)}</div>
            </div>)}
          </div>
        </DialogContent>
      </Dialog>
    },
  },
  {
    id: "action",
    header: "",
    cell: ({ row, table }) => {
      const { name } = table.options.meta as TableMeta;
      const value = row.getValue("value") as string | number | undefined;

      return <div>
        <GovernanceModal isNew={false} name={name} defaultValue={value}>
          <Button variant="link" className="p-0 m-0 link-style">vote for this value</Button>
        </GovernanceModal>
      </div>
    },
  }
]