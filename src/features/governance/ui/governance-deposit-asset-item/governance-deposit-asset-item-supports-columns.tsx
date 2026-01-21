import { Dialog } from "@radix-ui/react-dialog";
import { ColumnDef } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";

import { DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { getExplorerUrl } from "@/lib/get-explorer-url";
import { toLocalString } from "@/lib/to-local-string";

import { QRButton } from "@/components/ui/qr-button";
import { getVPBySqrtBalance } from "@/lib/calculations/get-vp-by-sqrt-balance";
import { generateLink } from "@/lib/generate-link";
import Link from "next/link";
import { IAggregatedData } from "../../domain/get-aggregated-votes";

interface TableMeta {
  frdToken: TokenMeta;
  governanceAa: string;
  asset: string;
}

export const governanceDepositAssetItemSupportsColumns: ColumnDef<IAggregatedData>[] = [
  {
    accessorKey: "address",
    header: "Price AA",
    cell: ({ row }) => {
      const address = row.getValue("address") as string;

      if (!address || address === "no") return <span>against this asset</span>

      return <a target="_blank" rel="noopener" className="link-style" href={getExplorerUrl(address, "address")}>{address}</a>;
    },
  },
  {
    accessorKey: "total_sqrt_support_amount",
    header: () => "Support",
    cell: ({ row, table }) => {
      const meta = table.options.meta as TableMeta;
      const totalSupportAmountByValue = parseFloat(row.getValue("total_sqrt_support_amount"));

      return <Dialog>
        <DialogTrigger asChild>
          <Button variant="link" className="p-0 m-0 link-style">
            {toLocalString(getVPBySqrtBalance(totalSupportAmountByValue, meta.frdToken.decimals))}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Supporters</DialogTitle>
          </DialogHeader>

          <div className="grid gap-2">
            {row.original.votes?.map(voter => <div key={voter.voter_address}>
              <Link href={`/${voter.voter_address}`}>{voter.voter_address}</Link>
              <div className="text-muted-foreground">{toLocalString(getVPBySqrtBalance(voter.sqrt_amount, meta.frdToken.decimals))}</div>
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
      const { governanceAa, asset } = table.options.meta as TableMeta;
      const address = row.getValue("address") as string;

      const url = generateLink({
        amount: 10000,
        aa: governanceAa,
        data: {
          deposit_asset: asset,
          name: 'deposit_asset',
          value: address
        }
      });

      return <QRButton href={url} variant="link" className="p-0 m-0 link-style">vote for this value</QRButton>
    },
  }
]