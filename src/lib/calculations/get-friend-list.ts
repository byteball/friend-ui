import { UTCDate } from "@date-fns/utc";
import { parseISO } from "date-fns";

interface IFriendData {
  address: string;
  date: number;
}

export const getFriendList = (state: IAaState, address: string): IFriendData[] => (
  Object.entries(state)
    .filter(([key]) => key.startsWith(`friend_${address}_`))
    .map(([key, value]) => {
      const [_, _adr, dateString] = key.split('_');
      const date = new UTCDate(parseISO(dateString));

      return ({
        address: value,
        date: date.getTime() / 1000
      });
    })
)