import { appConfig } from "@/app-config";
import { useData } from "@/app/context";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PuzzleImage } from "@/components/ui/puzzle-image";
import { QRButton } from "@/components/ui/qr-button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { FC, ReactElement, useState } from "react";
import { getRequiredStreak } from "../domain/get-required-streak";
import { useUserGhost } from "../domain/use-user-ghost";

interface ISelectGhostModalProps {
  children: ReactElement;
  address: string;
}

export const SelectGhostModal: FC<ISelectGhostModalProps> = ({ children, address }) => {
  const { data: {
    ghostName,
    ghostFriendIds,
    allGhosts
  }, isLoading } = useUserGhost(address);
  const [selectedGhostIndex, setSelectedGhostIndex] = useState<number | null>(null);

  const { getUserData } = useData();
  const userData = getUserData(address);

  const requiredStreak = getRequiredStreak(userData?.current_ghost_num);
  const currentStreak = userData?.current_streak || 0;
  const currentGhostId = allGhosts.findIndex(g => g.name === ghostName);
  const selectedGhostId = selectedGhostIndex !== null ? selectedGhostIndex : currentGhostId;

  const selectedGhost = selectedGhostId >= 0 ? allGhosts[selectedGhostId] : null;

  const ghostImageFilename = selectedGhost?.image || "/ghosts/default.png";

  const url = `obyte${appConfig.TESTNET ? "-tn" : ""}:${appConfig.NOTIFY_PAIRING_URL}#${(selectedGhost?.name || "") + "_"}${address}`

  return <Dialog>
    <DialogTrigger asChild>
      {isLoading ? <Skeleton className="w-10 h-10 rounded-full" /> : children}
    </DialogTrigger>
    <DialogContent className="sm:max-w-[640px]">
      <DialogHeader>
        <DialogTitle>Change the next ghost</DialogTitle>
      </DialogHeader>

      <div className="grid grid-cols-2 gap-8">
        <div className="md:col-span-1 col-span-2 flex flex-col gap-y-4">
          <div>Current selection: {ghostName}</div>
          <div>
            <Select
              value={selectedGhostIndex ? String(selectedGhostIndex) : String(currentGhostId)}
              onValueChange={(v) => setSelectedGhostIndex(+v)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select ghost" />
                <SelectContent>
                  {allGhosts.map((g, index) => (
                    <SelectItem key={g.name} value={String(index)} disabled={ghostFriendIds.includes(index)}>
                      {g.name} {ghostFriendIds.includes(index) ? "(already a friend)" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </SelectTrigger>
            </Select>
          </div>

          <div>
            <QRButton
              href={url}
              disabled={
                selectedGhostIndex === null
                || ghostFriendIds.includes(selectedGhostIndex)
                || selectedGhostId === currentGhostId
                || !selectedGhost
              }
            >
              Change
            </QRButton>
            <p className="text-muted-foreground text-xs mt-2">
              By clicking the button or scanning the QR code, the Obyte wallet will open, where you’ll need to confirm the action.
            </p>
          </div>
        </div>

        <div className="md:col-span-1 col-span-2">
          <PuzzleImage
            src={ghostImageFilename}
            width={300}
            height={300}
            rows={Math.sqrt(requiredStreak)}
            columns={Math.sqrt(requiredStreak)}
            alt={ghostName}
            className="w-full"
            filledCells={requiredStreak - currentStreak}
            loading="eager"
          />

          <div className="text-center">
            {selectedGhost?.name}
          </div>
        </div>
      </div>
    </DialogContent>
  </Dialog>
};