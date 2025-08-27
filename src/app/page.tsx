import { Deposit } from "@/components/layouts/deposit";
import { HeroBlock } from "@/components/layouts/hero-block";
import { HowItWorksBlock } from "@/components/layouts/how-it-works";

export default function Home() {
  return <div className="grid space-y-8">
    <HeroBlock />
    <HowItWorksBlock />
    <Deposit />
  </div>
}
