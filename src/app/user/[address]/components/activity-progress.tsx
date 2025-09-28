"use client";

import { appConfig } from "@/appConfig";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PuzzleImage } from "@/components/ui/puzzle-image";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FC, useState } from "react";

interface IActivityProgressProps {
  user?: IUserData;
}

export const ActivityProgress: FC<IActivityProgressProps> = ({
  user
}) => {
  if (!user) return null;
  const [ghost, setGhost] = useState<string | null>(appConfig.ghosts[0]?.key ?? null);

  const { current_ghost_num, current_streak = 0 } = user;

  const requiredStreak = (current_ghost_num + 1) ** 2;

  return <Card className="col-span-2">
    <CardHeader>
      <CardTitle>Activity Progress</CardTitle>
    </CardHeader>

    <CardContent className="grid grid-cols-2 grid-4">
      <div>1</div>
      <div className="flex flex-col justify-center gap-4" >
        <PuzzleImage
          rows={current_ghost_num + 1}
          columns={current_ghost_num + 1}
          // src="/ghosts/tim-may.png"
          src={appConfig.ghosts.find(g => g.key === ghost)?.src || "/ghosts/tim-may.png"}
          width={400}
          height={400}
          filledCeils={Math.min(current_streak, requiredStreak)}
          // className=""
          alt={ghost ?? "Tim May"} />

        <Select
          onValueChange={(e) => setGhost(e)}
          value={ghost || undefined}
        >
          <SelectTrigger className="w-full">
            <SelectValue className="w-full" placeholder="Select a ghost" />
          </SelectTrigger>
          <SelectContent>
            {appConfig.ghosts.map((ghost) => (
              <SelectItem key={ghost.key} value={ghost.key}>
                {ghost.key}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Button>Be friends</Button>
      </div>
    </CardContent>
  </Card>
} 