"use client";

import {
  FacebookIcon,
  FacebookShareButton,
  RedditIcon,
  RedditShareButton,
  TelegramIcon,
  TelegramShareButton,
  TwitterIcon,
  TwitterShareButton,
} from 'next-share';

import { FC } from "react";

interface ProfileShareLinksProps {
  url: string;
  title: string;
}

export const ProfileShareLinks: FC<ProfileShareLinksProps> = ({
  url,
  title
}) => (
  <div>
    <div className="flex md:flex-row flex-col md:items-center gap-4">
      <div className="text-muted-foreground md:block hidden">Share profile</div>

      <div className='flex gap-4'>
        <TelegramShareButton
          url={url}
          title={title}
        >
          <TelegramIcon size={32} round />
        </TelegramShareButton>

        <FacebookShareButton
          url={url}
          quote={title}
          hashtag={'#friends #crypto #obyte'}
        >
          <FacebookIcon size={32} round />
        </FacebookShareButton>

        <TwitterShareButton
          url={url}
          title={title}
        >
          <TwitterIcon size={32} round />
        </TwitterShareButton>

        <RedditShareButton
          url={url}
          title={title}
        >
          <RedditIcon size={32} round />
        </RedditShareButton>
      </div>

    </div>
  </div>)