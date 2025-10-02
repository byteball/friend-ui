interface IFriendship {
  index: 'initial' | `followup_${number}`;
  accept_ts: number;
  is_new?: boolean;
  liquid?: number;
  locked?: number;
  new_user_reward?: number;
}

export const getFriendship = (state: IAaState, address: string) => {
  return Object.entries(state)
    .filter(([key]) => key.startsWith(`friendship_${address}`) && key.includes(address))
    .map(([key, value]) => {
      const [_, _adr1, _adr2] = key.split('_');
      const isA = _adr1 === address;

      return Object.entries(value as any).filter(([k]) => (k === "initial" || k.startsWith("followup_")) && k !== "followup_reward_share").map(([index, value]) => {
        return ({
          index,
          // @ts-expect-error not error
          accept_ts: value?.accept_ts,
          // @ts-expect-error not error
          ...(value?.rewards?.[isA ? 'a' : 'b'] ?? {})
        }) as IFriendship;
      });
    }).flat();
}
