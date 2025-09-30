"use client";

import { GovernanceList } from "./components/governance-list";

export default function GovernancePage() {
  return <div>
    <h1 className="text-4xl font-semibold tracking-tight text-gray-900 sm:text-6xl">Governance</h1>

    <div className="mt-10 max-w-4xl">
      <GovernanceList />
    </div>
  </div>
}
