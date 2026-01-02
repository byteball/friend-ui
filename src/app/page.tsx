import { Metadata } from "next";

import { HeroBlock } from "@/components/layouts/hero-block";
import { HowItWorksBlock } from "@/components/layouts/how-it-works";


import { MainActionTabs } from "@/components/layouts/main-action-tabs";
import { env } from "@/env";

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export const metadata: Metadata = {
  title: "Obyte Friends — make 1% a day by making friends every day",
  description: "Make 1% a day by making friends every day and spreading the word about Obyte’s unstoppable, censorship-resistant tech",
  openGraph: {
    images: [
      `/api/og/common/main`,
    ]
  },
  twitter: {
    card: 'summary_large_image',
    creator: '@ObyteOrg',
  },
  robots: {
    index: true,
    follow: true,
  },
  metadataBase: new URL(env.NEXT_PUBLIC_SITE_URL),
}


export default function Home() {


  return <div className="grid space-y-8">
    <HeroBlock />
    <HowItWorksBlock />
    <MainActionTabs />
  </div>
}
