import { appConfig } from '@/app-config';
import { useData } from '@/app/context';
import { getGhostsFromVars, IGhost } from '@/features/profile/domain/get-ghosts-from-vars';
import { getFriendList } from '@/lib/calculations/get-friend-list';
import { getNumberByAddress } from '@/lib/get-number-by-address';
import { isValidAddress } from '@/lib/is-valid-address';
import { useMemo } from 'react';
import useSWR from 'swr';

interface ICurrentGhost {
  address: string;
  ghost_name: string | null;
}

interface IUseCurrentGhostResult {
  data: {
    ghostName: string;
    address: string;
    ghostFriendIds: number[];
    allGhosts: IGhost[];
    requiredStreak?: number;
  }
  isLoading: boolean;
  isError: any;
}

export function useUserGhost(address: string): IUseCurrentGhostResult {
  const { state } = useData();
  const allGhosts = useMemo(() => getGhostsFromVars(state ?? {}), [state]);
  const { data, error, isLoading } = useSWR<ICurrentGhost>(`${appConfig.NOTIFY_URL}/user-ghost/${address}`);

  const userFriends = useMemo(() => getFriendList(state ?? {}, address), [state, address]);
  const userGhostFriends = useMemo(() => userFriends.filter(f => !isValidAddress(f.address)), [userFriends]);
  const ghostFriendIds = useMemo(() => userGhostFriends.map(f => allGhosts.findIndex(g => g.name === f.address)), [userGhostFriends, allGhosts]);

  let ghostName = data?.ghost_name || null;

  if (!ghostName) {
    const ghostIdByAddress = getNumberByAddress(address, allGhosts.length - 1, ghostFriendIds);

    ghostName = allGhosts[ghostIdByAddress]?.name || "Unknown ghost";
  }

  return {
    data: {
      ghostName,
      address,
      ghostFriendIds,
      allGhosts
    },
    isLoading,
    isError: error
  }
}