import { Button } from "@/components/ui/button";
import { CardFooter } from "@/components/ui/card";
import { GovernanceModal } from "./governance-modal";

interface GovernanceItemFooterProps<K extends keyof AgentParams> {
  name: K;
}

export const GovernanceItemFooter = <K extends keyof AgentParams>({ name }: GovernanceItemFooterProps<K>) => {
  return (<CardFooter>
    <GovernanceModal name={name}>
      <Button variant="link" className="p-0 m-0">suggest another value</Button>
    </GovernanceModal>
  </CardFooter>)
}