import { ColumnDef } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";

import { toLocalString } from "@/lib/toLocalString";
import { transformValue } from "../utils/transform-value";
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
    header: () => "Amount",
    cell: ({ row, table }) => {
      const meta = table.options.meta as TableMeta;
      const { frdToken } = meta;
      const amount = parseFloat(row.getValue("amount"))

      return <div>{toLocalString(amount)} {frdToken?.symbol}</div>
    },
  },
  {
    id: "select",
    header: "",
    cell: () => (
      <div>
        <Button variant="link" className="p-0 m-0">vote for this value</Button>
      </div>
    ),
  }
]