"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BadgeCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ReactNode } from "react";

interface TweetCardProps {
  displayName?: string;
  username?: string;
  timeAgo?: string;
  verified?: boolean;
  avatarUrl?: string;
  ogImageUrl?: string;
  ogTitle?: string;
  ogSource?: string;
  tweetText?: ReactNode;
}

export const TweetCard = ({
  displayName = "Friends name",
  username = "friendOfObyte",
  timeAgo = "Just now",
  verified = false,
  avatarUrl = "",
  ogImageUrl = "",
  ogTitle = "Obyte friends — taump",
  ogSource = "friends.obyte.org",
  tweetText = "Help me complete my streak by becoming my next friend. And start making 1% a day by making friends every day.",
}: TweetCardProps) => {
  return (
    <div className="w-full max-w-[598px] bg-muted rounded-md mt-2 px-4 p-3 transition-colors ">
      <div className="flex gap-3">

        <Avatar className="h-10 w-10 flex-shrink-0">
          <AvatarImage src={avatarUrl} alt={displayName} />
          <AvatarFallback className="bg-muted-foreground/20 text-foreground text-sm">
            {displayName.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-[15px]">
              <span className="font-bold text-foreground hover:underline ">
                {displayName}
              </span>
              {verified && (
                <BadgeCheck className="h-[18px] w-[18px] text-primary fill-primary" />
              )}
              <span className="text-muted-foreground">@{username}</span>
              <span className="text-muted-foreground">·</span>
              <span className="text-muted-foreground hover:underline ">
                {timeAgo}
              </span>
            </div>
            <Link href="https://x.com" target="_blank" rel="noopener nofollow" className="h-[18.75px] w-[18.75px]">
              <Image src="/x-logo.svg" alt="X Logo" width={18.75} height={18.75} />
            </Link>
          </div>
          {/* OG Card Preview */}
          {(ogImageUrl || ogTitle) && (
            <div className="mt-3">
              <div className="text-sm text-foreground mb-2">{tweetText}</div>
              <div className="border border-border rounded-2xl overflow-hidden hover:bg-accent/10 transition-colors">
                {ogImageUrl && (
                  <div className="relative">
                    <div className="aspect-[1.91/1] w-full bg-accent relative">
                      <Image
                        src={ogImageUrl}
                        alt={ogTitle || ""}
                        fill
                        className="object-cover opacity-80"
                      />
                    </div>
                    {ogTitle && (
                      <div className="absolute bottom-0 left-0 right-0">
                        <div className="mx-3 mb-3 px-2 py-[2px] bg-black/75 rounded-[4px] inline-block max-w-[calc(100%-24px)]">
                          <span className="text-[13px] text-white truncate block">
                            {ogTitle}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              {ogSource && (
                <div className="text-[13px] text-muted-foreground mt-1 block">
                  From {ogSource}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
