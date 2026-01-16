
'use client';

import { sendGAEvent } from '@next/third-parties/google';
import type { AnchorHTMLAttributes } from 'react';
import { forwardRef } from 'react';

export type AnalyticLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & { gaEvent?: string; meta: object };

export const AnalyticLink = forwardRef<HTMLAnchorElement, AnalyticLinkProps>(
  ({ children, gaEvent, meta, ...props }, ref) => {

    const handleClick = () => {
      if (gaEvent) {
        sendGAEvent('event', gaEvent, meta);
      }
    };

    return (
      <a ref={ref} {...props} onClick={handleClick}>
        {children}
      </a>
    );
  }
);

AnalyticLink.displayName = 'AnalyticLink';
