import { Button } from "@/components/ui/button";
import { CardFooter } from "@/components/ui/card";
import { GovernanceModal } from "../governance-modal";

interface GovernanceItemFooterProps<K extends keyof AgentParams> {
  name: K;
}

export const GovernanceItemFooter = <K extends keyof AgentParams>({ name }: GovernanceItemFooterProps<K>) => ((<CardFooter>
  <GovernanceModal name={name} defaultValue={undefined}>
    <Button variant="link" className="p-0 m-0 link-style">suggest another value</Button>
  </GovernanceModal>
</CardFooter>))