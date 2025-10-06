import { ColumnDef } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";

import { toLocalString } from "@/lib/toLocalString";
import { transformValue } from "../../domain/transform-value";
import { GovernanceModal } from "../governance-modal";
import { SupportedValuesData } from "./governance-item-supports-table";

interface TableMeta {
  frdToken: TokenMeta;
  name: keyof AgentParams;
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
      const meta = table.options.meta as TableMeta;

      return <div>{toLocalString(amount)} <small>{meta.frdToken.symbol}</small></div>
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