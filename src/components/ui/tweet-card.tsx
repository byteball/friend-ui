"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BadgeCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface TweetCardProps {
  displayName?: string;
  username?: string;
  timeAgo?: string;
  verified?: boolean;
  avatarUrl?: string;
  ogImageUrl?: string;
  ogTitle?: string;
  ogSource?: string;
  tweetText?: string;
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
    <div className="w-full max-w-[598px] bg-card px-4 pt-3 hover:bg-white/3 transition-colors">
      <div className="flex gap-3">

        <Avatar className="h-10 w-10 flex-shrink-0">
          <AvatarImage src={avatarUrl} alt={displayName} />
          <AvatarFallback className="bg-[#cfd9de] text-foreground text-sm">
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
              <span className="text-[#71767b]">@{username}</span>
              <span className="text-[#71767b]">·</span>
              <span className="text-[#71767b] hover:underline ">
                {timeAgo}
              </span>
            </div>
            <Link href="https://x.com" target="_blank" rel="noreferrer" className="h-[18.75px] w-[18.75px]">
              <Image src="/x-logo.svg" alt="X Logo" width={18.75} height={18.75} />
            </Link>
          </div>
          {/* OG Card Preview */}
          {(ogImageUrl || ogTitle) && (
            <div className="mt-3">
              <div className="text-sm text-foreground mb-2">{tweetText}</div>
              <div className="border border-[#cfd9de] rounded-2xl overflow-hidden hover:bg-white/[0.03] transition-colors">
                {ogImageUrl && (
                  <div className="relative">
                    <div className="aspect-[1.91/1] w-full bg-accent relative">
                      <Image
                        src={ogImageUrl}
                        alt={ogTitle || ""}
                        fill
                        className="object-cover"
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
                <div className="text-[13px] text-[#71767b] mt-1 block">
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
