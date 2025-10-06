import { CountdownRenderProps } from 'react-countdown';

import { QRButton } from '@/components/ui/qr-button';

export const challengingCountdownRenderer = (props: CountdownRenderProps, commitUrl?: string) => {
  if (props.completed) {
    return commitUrl ? <QRButton className="p-0 m-0" href={commitUrl} variant="link">commit</QRButton> : null;
  } else {
    const { days, hours, minutes, seconds } = props;
    let date = 'Challenging period expires in ';

    if (days) date += `${days}d `;
    if (hours) date += `${hours}h `;
    if (minutes) date += `${minutes}m `;
    if (seconds || (!days && !hours && !minutes)) date += `${seconds}s`;

    return date
  }
}