import { Alert, AlertDescription, AlertTitle } from "../ui/alert";

import { generateLink } from "@/lib/generate-link";

import { appConfig } from "@/app-config";
import { CircleX } from "lucide-react";

export const NoDefineAsset = () => {
  const url = generateLink({
    amount: 10000,
    aa: appConfig.AA_ADDRESS,
    data: {
      define: 1
    }
  });

  return <div className="flex  justify-center items-center h-screen">
    <div className="max-w-sm w-full">
      <Alert variant="destructive" className="space-y-2">
        <AlertTitle className="flex items-center space-x-2">
          <CircleX className="size-10" />
          <div>No defined asset found</div>
        </AlertTitle>
        <AlertDescription>
          <div>Please <a href={url} className="inline">define an asset</a> to continue</div>
        </AlertDescription>
      </Alert>
    </div>
  </div>
};
