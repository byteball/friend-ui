import { DialogClose, DialogFooter } from "@/components/ui/dialog"
import { QRButton } from "@/components/ui/qr-button"

export const GovernanceModalFooter = () => {
  return <DialogFooter>
    <DialogClose asChild>
      <QRButton href="#">Change</QRButton>
    </DialogClose>
  </DialogFooter>
}
