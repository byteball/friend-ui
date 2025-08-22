import { AnimatedFriendList } from "@/components/layouts/animated-friend-list";

export default function Home() {
  return (
    <div>
      <div className="grid grid-cols-2 *:gap-4">
        <div>test</div>
        <AnimatedFriendList />
      </div>
    </div>
  );
}
