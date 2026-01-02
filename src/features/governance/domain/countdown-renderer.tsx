import { CountdownRenderProps } from 'react-countdown';

import { QRButton } from '@/components/ui/qr-button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export const challengingCountdownRenderer = (props: CountdownRenderProps, commitUrl?: string, disabled?: boolean) => {
  if (props.completed) {
    return commitUrl ? <Tooltip>
      <TooltipTrigger asChild>
        <div>
          <QRButton
            disabled={!!disabled}
            href={commitUrl}
            variant="link"
            className="p-0 m-0 link-style"
          >
            commit
          </QRButton>
        </div>
      </TooltipTrigger>
      {!!disabled ? <TooltipContent>
        Current value already equal to leader
      </TooltipContent> : null}
    </Tooltip> : null;
  } else {
    const { days, hours, minutes, seconds } = props;
    let date = 'Challenging period expires in ';

    if (days) date += `${days}d `;
    if (hours) date += `${hours}h `;
    if (minutes) date += `${minutes}m `;
    if (seconds && (!days && !hours && !minutes)) date += `${seconds}s`;

    return date
  }
}