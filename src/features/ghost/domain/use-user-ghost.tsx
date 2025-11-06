import { appConfig } from '@/app-config';
import { useData } from '@/app/context';
import { getGhostsFromVars, IGhost } from '@/features/profile/domain/get-ghosts-from-vars';
import { getFriendList } from '@/lib/calculations/get-friend-list';
import { getNumberByAddress } from '@/lib/get-number-by-address';
import { isValidAddress } from '@/lib/is-valid-address';
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
  const allGhosts = getGhostsFromVars(state ?? {});
  const { data, error, isLoading } = useSWR<ICurrentGhost>(`${appConfig.NOTIFY_URL}/user-ghost/${address}`);

  const userFriends = getFriendList(state ?? {}, address);
  const userGhostFriends = userFriends.filter(f => !isValidAddress(f.address));
  const ghostFriendIds = userGhostFriends.map(f => allGhosts.findIndex(g => g.name === f.address));

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