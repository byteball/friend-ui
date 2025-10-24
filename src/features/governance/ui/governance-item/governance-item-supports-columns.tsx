import { ColumnDef } from "@tanstack/react-table";
import { invertBy } from "lodash";
import Link from "next/link";

import { Button } from "@/components/ui/button";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toLocalString } from "@/lib/to-local-string";

import { transformValue } from "../../domain/transform-value";
import { GovernanceModal } from "../governance-modal";
import { SupportedValuesData } from "./governance-item-supports-table";

interface TableMeta {
  frdToken: TokenMeta;
  name: keyof AgentParams;
  choices: Record<string, AgentParams[keyof AgentParams]>;
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

      const thisValueVoters = Object.entries(invertBy(meta.choices))
        .filter((v) => v[0] === String(value))
        .map(v => v[1])[0] || [];

      return <Dialog>
        <DialogTrigger asChild>
          <Button variant="link" className="p-0 m-0">
            {toLocalString(amount / 10 ** meta.frdToken.decimals)}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Supporters</DialogTitle>
          </DialogHeader>

          <div className="grid gap-2">
            {thisValueVoters.map(voter => <div key={voter}>
              <Link className="text-blue-700" href={`/user/${voter}`}>{voter}</Link>
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
          <Button variant="link" className="p-0 m-0">vote for this value</Button>
        </GovernanceModal>
      </div>
    },
  }
]