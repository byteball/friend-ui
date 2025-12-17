import { FC } from "react";

import { ClaimForm } from "./claim-form";

interface ClaimWidgetProps { }

export const ClaimWidget: FC<ClaimWidgetProps> = ({ }) => (
  <div className="max-w-4xl gap-4 mx-auto mt-4">
    <div className="rounded-lg bg-card">
      <div className="w-full px-4 py-5 sm:p-6">
        <ClaimForm />
      </div>
    </div>
  </div>
)