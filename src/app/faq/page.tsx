import Link from "next/link";
import "server-only";

import Faq from "@/features/faq";
import { toLocalString } from "@/lib/toLocalString";

import { appConfig } from "@/appConfig";

export const dynamic = "force-dynamic";

export default async function FaqPage() {

  const { min_balance_instead_of_real_name } = __GLOBAL_STORE__?.getState()?.variables ?? appConfig.initialParamsVariables;

  const token = __GLOBAL_STORE__?.getOwnToken();

  const symbol = token?.symbol ?? "FRD";
  const decimals = token?.decimals ?? 0;

  return (
    <div className="prose prose-2xl">
      <h1 className="text-4xl font-semibold tracking-tight text-gray-900 sm:text-6xl">Frequently asked questions</h1>

      <Faq.Container>
        <Faq.Item>
          <Faq.Title>What is Obyte Friends?</Faq.Title>
          <Faq.Content>Obyte Friends is a community engagement space for Obyte. Here, community members make friends with each other, invite new members, and get rewarded for this.
          </Faq.Content>
        </Faq.Item>

        <Faq.Item>
          <Faq.Title>What&rsquo;s the purpose of Obyte Friends?</Faq.Title>
          <Faq.Content>The purpose is to encourage Obyte community members to spread the word about <Link href="https://obyte.org" target="_blank" rel="noopener noreferrer">Obyte&rsquo;s uncensorable, unstoppable, truly decentralized network</Link>, and create closer connections with each other. By doing so, they become each other&rsquo;s friends, as well as Obyte&rsquo;s friends. We believe this helps to build a strong, coherent, and cooperative community.</Faq.Content>
        </Faq.Item>


        <Faq.Item>
          <Faq.Title>What am I supposed to do here?
          </Faq.Title>
          <Faq.Content>
            <p>
              First, you need to deposit and lock some funds. The rewards are calculated as a percentage of your locked funds, so the more you deposit, the greater are your rewards. You lock your funds for 1 year or more, and you can withdraw them after the term expires.
            </p>

            <p>
              Then, you need to find friends and claim rewards together. To claim rewards, you and your friend need to send claiming requests within 10 minutes of each other. In the requests, you indicate your new friend&rsquo;s Obyte address, and the friend indicates yours.
            </p>

            <p>
              You and your friend are rewarded with 1% of your locked balances, which are added to your locked balances, and 0.1% paid in liquid {symbol} tokens, which you can immediately spend. If you or your friend are new to Obyte Friends and are making your or their first friend connection, you both receive an additional new user reward. See more details below.
            </p>

            <p>
              You can make only 1 friend per day. Days are in UTC timezone. If you have already made a friend today, make your next friend tomorrow.
            </p>

            <p>
              You can become friends with each user only once. Your next friend must be someone else.
            </p>

            <p>
              If you make friends every day and complete a long enough streak, you are allowed to become friends with a &ldquo;ghost&rdquo; of a famous cypherpunk, such as Satoshi Nakamoto, Tim May, etc (they are not real users). These achievements will be displayed in your profile.
            </p>
          </Faq.Content>
        </Faq.Item>


        <Faq.Item>
          <Faq.Title>What are the rewards?</Faq.Title>
          <Faq.Content>
            <p>
              When you make a new friend, you receive 1% of your locked balance added to it, and 0.1% of your locked balance paid in liquid {symbol} tokens to your Obyte wallet. Your friend receives 1% and 0.1% of their balance respectively.
            </p>

            <p>
              Adding the 1% to your locked balance means that it is compounding interest, and your reward from making the next friend will be calculated from the larger balance.
            </p>

            <p>
              If you make new friends every day for a year, your locked balance will grow 1.01<sup>365</sup> = 37.8 times and your total rewards in liquid tokens will be 3.68 times the initial deposit.
            </p>

            <p>
              If you add the 0.1% liquid rewards back to your locked deposit every day, your locked balance will grow 1.011<sup>365</sup> = 54.2 times after 1 year. That&rsquo;s the power of compounding interest.
            </p>

            <p>
              The unlock dates of both your and your friend&rsquo;s deposits must be at least 1 year in the future. You can extend your locking period as often as you like.
            </p>

            <p>
              If you deposit in assets other than {symbol}, reducers are applied to your balances in these assets. The reducer of GBYTE deposits is 0.75 and for other assets (such as USDC, ETH) it is 0.5. This means that only 75% of your GBYTE assets and 50% of your USDC or ETH assets actually work, and the rewards for making friends are 0.75% and 0.5% respectively on top of their balances. This measure is to incentivize deposits in {symbol}, supporting demand for it and its price.
            </p>

            <p>
              If neither you nor your friend are new users (i.e. making your or their first friend), your balance is capped by 200 {symbol} when calculating the reward. So, if your actual balance is above 200 {symbol}, you&rsquo;ll receive 1%/0.1% rewards only from 200 {symbol}: 2 {symbol} and 0.2 {symbol} respectively. There is no cap when making friends with new users. This is to incentivize making connections with new users, who would need to buy {symbol}, supporting its price.
            </p>

            <p>
              When your account becomes more than 60 days old (since your first deposit), you will be allowed to make friends with existing users (in-friends) only every other day. After 150 days &mdash; every 3rd day, and so on, the frequency of allowed in-friends decreases over time. In the remaining days, you are allowed to make friends only with new users. This is to incentivize recruiting new users, who would buy {symbol} and support its price. You can still be allowed to make in-friends on these days if you burn 2 {symbol} or deposit at least 10 {symbol} on the same day.
            </p>


            <p>
              When you are a new user (making your first friend) or you are becoming friends with a new user, you both receive an additional reward of 10 {symbol} (but not more than the smaller of your balances) to your locked balances. Again, this is to incentivize recruiting new users, who would buy {symbol} and support its price.
            </p>

            <p>
              When you refer someone, or are referred by someone, you both receive additional rewards &mdash; see below.
            </p>

            <p>
              In 60 days, 150 days, and so on, after becoming friends, you both can receive follow-up rewards &mdash; see below.
            </p>
          </Faq.Content>
        </Faq.Item>


        <Faq.Item>
          <Faq.Title>
            How to make money in Obyte Friends?
          </Faq.Title>
          <Faq.Content>
            <p>
              By spreading the word about Obyte&rsquo;s censorship-resistant tech which stands out among other crypto networks. You get more people to learn about it and are rewarded for Obyte&rsquo;s (and your) new friends.
            </p>

            <ol>
              <li>
                Bring new users in and become friends with them. You receive 10 {symbol} new user reward + 1% to your locked balance + 0.1% in liquid {symbol} tokens (see above).
              </li>
              <li>
                Make friends with existing users. You receive 1%/0.1% rewards as above but your balance is capped when calculating the reward. Better befriend new ones.
              </li>
              <li>
                Refer new users to Obyte Friends. You receive 10 {symbol} referral reward when they make their first friend (which can be you) and 2% or 1% of all their deposits, depending on the token being deposited (see below).
              </li>
            </ol>
          </Faq.Content>
        </Faq.Item>


        <Faq.Item>
          <Faq.Title>How to make money by referring users to Obyte Friends?
          </Faq.Title>
          <Faq.Content>
            <p>You can get your referral link from your profile page. If new users make their first deposit from this link, you receive two kinds of rewards:</p>
            <ol>
              <li>
                Deposit referral reward. Every time this user makes a deposit (not just their first deposit), you receive 2% of their deposit if they deposit in {symbol}, or 1% if they deposit in any other token. The reward is paid in liquid {symbol} directly to your wallet.
              </li>
              <li>
                Referred user reward. When the new user makes their first friend (it can be you or anyone else), both you and the new user receive 10 {symbol} (but not more than the user&rsquo;s balance) to your locked balances. This is in addition to the regular new user reward (see above), which is also 10 {symbol}.
              </li>
            </ol>

            <p>
              Your unlock date must be at least 1 year in the future to receive these rewards.
            </p>
          </Faq.Content>
        </Faq.Item>


        <Faq.Item>
          <Faq.Title>How much should I deposit?</Faq.Title>
          <Faq.Content>
            As much as you like. Since rewards are calculated as % of your locked balance, the more you deposit, the more you are rewarded.
          </Faq.Content>
        </Faq.Item>

        <Faq.Item>
          <Faq.Title>Is it like staking?</Faq.Title>
          <Faq.Content>
            Somewhat. Similar to staking, you lock funds for a term and receive percentage-based rewards. However, while staking is mostly passive (you don&rsquo;t have to do anything to earn the rewards), here you have to work for your rewards &mdash; bring new friends in. Call it &ldquo;active staking&rdquo; if you will. The rewards are also way larger in Obyte Friends than in typical staking schemes.
          </Faq.Content>
        </Faq.Item>


        <Faq.Item>
          <Faq.Title>In what tokens can I make deposits?
          </Faq.Title>
          <Faq.Content>
            <p>
              You can make deposits in {symbol}, GBYTE or external assets such as USDC or ETH. You can make multiple deposits in any of these tokens.
            </p>

            <p>
              Reducers are applied to your balances in GBYTE and external assets (see above) when calculating rewards for making friends. So, {symbol} deposits are more profitable, but also more risky as the {symbol} exchange rate can change during the locking period.
            </p>

            <p>
              When the locking period expires, you can get your locked tokens back, plus the accrued rewards in {symbol}.
            </p>

            <p>
              The list of external assets available for deposits can be extended by <Link href="/governance">governance</Link>.
            </p>
          </Faq.Content>
        </Faq.Item>


        <Faq.Item>
          <Faq.Title>How do I get my locked tokens back, as well as locked rewards?</Faq.Title>
          <Faq.Content>
            <p>
              You need to wait until the locking period expires, and then you can freely withdraw the deposited tokens and the accrued locked rewards.
            </p>

            <p>
              As long as you continue making friends, you need to keep the unlock date at least 1 year in the future. If you decide to withdraw, you have to stop extending the unlock date and stop making friends for 1 year, and then you can withdraw. By stopping to extend your unlock date, you forfeit all future follow-up rewards for you and your friends.
            </p>

            <p>
              Note, that if you stop making friends while other users continue doing so every day, your balance will stop growing while their balances will grow 37.8 times by the time you will be able to withdraw yours. The rewards paid daily will increase accordingly. This limits the impact of the withdrawn funds on the market.
            </p>
          </Faq.Content>
        </Faq.Item>


        <Faq.Item>
          <Faq.Title>What are the prerequisites for participating in Obyte Friends?
          </Faq.Title>
          <Faq.Content>
            <p>
              Before depositing funds you need to be attested on <Link href={appConfig.TELEGRAM_BOT_URL}>telegram</Link> and/or <Link href={appConfig.DISCORD_BOT_URL}>discord</Link>. The attestations link your Obyte address to your telegram or discord username, allowing us to notify you when it&rsquo;s time to receive your follow-up rewards.
            </p>

            <p>
              If you deposit less than {toLocalString(min_balance_instead_of_real_name / 10 ** decimals)} {symbol} (or equivalent in other tokens), you need to be <Link href={appConfig.REAL_NAME_BOT_URL}>real-name attested</Link> too. You don&rsquo;t need to disclose your real name to anyone (except the verification service) but this requirement helps to ensure that the system is not abused by creating multiple accounts belonging to the same person, making them friends with each other, and receiving rewards without bringing any real users in.
            </p>
          </Faq.Content>
        </Faq.Item>


        <Faq.Item>
          <Faq.Title>What are the follow-up rewards?</Faq.Title>
          <Faq.Content>
            <p>In 60 days after becoming friends, you and your friend become eligible for follow-up rewards. </p>

            <p>
              Percentage-wise, they are 1/10th of the initial rewards, that is 0.1% to the locked balance and 0.01% in liquid {symbol}. However, they are applied to your new balance, which is likely much higher than the balance you had when you became friends.
            </p>

            <p>
              A bot will notify you about the rewards in telegram and/or discord, and you have 10 days to claim them. If you miss them, that doesn&rsquo;t forfeit your subsequent follow-up rewards with the same friend.
            </p>

            <p>
              Both you and your friend must have your unlock dates at least 1 year in the future at the time of claiming the follow-up rewards.
            </p>

            <p>
              The next follow-up rewards are due in 150 days, then 270 days, and so on, after becoming friends. See the full schedule in the source <Link href="https://github.com/byteball/friend-aa/blob/main/friend.oscript#L31" target="_blank" rel="noopener noreferrer">code of the Obyte Friends AA</Link>.
            </p>
          </Faq.Content>
        </Faq.Item>


        <Faq.Item>
          <Faq.Title>How do we claim rewards with my new friend?
          </Faq.Title>
          <Faq.Content>
            <ol>
              <li>
                Connect with your new friend on any media, such as telegram, discord, etc, or in person.
              </li>

              <li>
                Give them your Obyte address from which you made your deposit, and ask the friend about theirs.
              </li>

              <li>
                Agree about the time when you are both online and can send your claiming requests.
              </li>

              <li>
                Go to the &ldquo;Claim&rdquo; section on the homepage of this website, enter your friend&rsquo;s address, click &ldquo;Claim&rdquo; and confirm the transaction in your Obyte wallet. Your friend needs to do the same (but enter your address) at about the same time. You need to send your claiming requests within 10 minutes of each other. It doesn&rsquo;t matter who claims first. If the second claim comes too late, no worries, you can try as many times as necessary.
              </li>
            </ol>
          </Faq.Content>
        </Faq.Item>


        <Faq.Item>
          <Faq.Title>
            How can I be sure the rules are actually what&rsquo;s described here, can&rsquo;t be changed, and my money can&rsquo;t be stolen?
          </Faq.Title>
          <Faq.Content>
            The rules are implemented by <Link href="https://obyte.org/platform/autonomous-agents" target="_blank" rel="noopener noreferrer">Autonomous Agents (AAs)</Link>, which are soulless code-driven actors on <Link href="https://obyte.org/" target="_blank" rel="noopener noreferrer">Obyte DAG</Link>. Nobody can intervene with their operation, nobody can tell them what to do, nobody can take their money, and nobody can change their code. Even the Obyte team, which created them. Their code is <Link href="https://github.com/byteball/friend-aa" target="_blank" rel="noopener noreferrer">available on github</Link>, so anyone can see what rules the agents actually follow and compare with what we describe here.
          </Faq.Content>
        </Faq.Item>


        <Faq.Item>
          <Faq.Title>What is {symbol} token?</Faq.Title>
          <Faq.Content>
            {symbol} is the main token of Obyte Friends. Rewards are paid in {symbol}, and it&rsquo;s the main token for deposits. Deposits can be made in GBYTE, USDC, and ETH too &mdash; this protects against changes in {symbol} exchange rate, but the rewards are also smaller in this case (see the question about rewards above).
          </Faq.Content>
        </Faq.Item>


        <Faq.Item>
          <Faq.Title>
            What drives supply and demand on {symbol}?
          </Faq.Title>
          <Faq.Content>
            <p>
              The main source of {symbol} supply is the rewards paid for making friends. Most of the rewards are paid to locked balances of the new friends and do not immediately hit the market. The smaller part is paid in liquid {symbol} tokens, which can be freely sold on the market.
            </p>

            <p>
              On the demand side, there are new users who need to make deposits and choose to deposit {symbol}, which they have to buy from the market. Not all new users buy {symbol} &mdash; some may choose the safer option of depositing GBYTE, USDC, or ETH, content with the smaller rewards. Others, seeking larger rewards, choose to deposit {symbol}. The rewards for GBYTE are 75%, and for USDC and ETH they are 50% of the rewards for {symbol}.
            </p>

            <p>
              So, incentives are there to buy and deposit {symbol} rather than other tokens.
            </p>

            <p>
              There are also strong incentives for attracting new users:
            </p>

            <ol>
              <li>new user reward 10 {symbol} paid to locked accounts of both friends</li>
              <li>referral reward 10 {symbol} paid to locked accounts of both friends</li>
              <li>referral reward of 2% (or 1% if paid in tokens other than {symbol}) for lifetime deposits of the referred user</li>
              <li>rewards from making friends with existing users are capped, making recruiting new users more profitable</li>
              <li>the allowed frequency of making friends with existing users is limited and decreases over time, again pushing users to look for new members</li>
            </ol>

            <p>
              In addition to demand from new users, the existing users might need to buy {symbol} too. On days when they are not normally allowed to make in-friends, they can still gain this right by burning 2 {symbol} or making a new deposit of at least 10 {symbol}. This option might be necessary for users who need to keep their streak but are unable to recruit a new user on that day.
            </p>

            <p>
              The locked rewards can be released into the market when a user stops making friends, stops receiving any new rewards, and waits for 1 year. However, if other users continue, the released locked rewards are likely to be small compared with daily liquid rewards of the remaining users, and therefore make a small market impact.
            </p>
          </Faq.Content>
        </Faq.Item>


        <Faq.Item>
          <Faq.Title>Is {symbol} inflationary?</Faq.Title>
          <Faq.Content>
            <p>
              Yes, its supply grows, due to rewards paid for making friends. However, most of the new emissions go to locked balances and don&apos;t immediately affect the market, and the emissions of liquid {symbol} are designed to be counteracted by demand for {symbol} from new users (see the previous answer).
            </p>

            <p>
              The locked balances will be eventually released, however, due to 1-year delay, they are unlikely to significantly affect the market as described in the previous answer.
            </p>
          </Faq.Content>
        </Faq.Item>


        <Faq.Item>
          <Faq.Title>What is the initial supply of {symbol} tokens?</Faq.Title>
          <Faq.Content>The initial supply is 0. Tokens are minted only as rewards for making friends.</Faq.Content>
        </Faq.Item>


        <Faq.Item>
          <Faq.Title>What is the {symbol} price?</Faq.Title>
          <Faq.Content>
            <p>
              It is determined by the market, based on the supply and demand discussed above.
            </p>

            <p>However, there is a preprogrammed <i>ceiling price</i> that might affect the market price.</p>
          </Faq.Content>
        </Faq.Item>


        <Faq.Item>
          <Faq.Title>What is the ceiling price?</Faq.Title>
          <Faq.Content>
            The ceiling price is a preprogrammed price of {symbol} in terms of GBYTE that doubles every year. The market price is not guaranteed to match it. This price is used only when replacing one deposited token for another.
          </Faq.Content>
        </Faq.Item>



        <Faq.Item>
          <Faq.Title>Can I deposit one token and then replace it with another?</Faq.Title>
          <Faq.Content>
            <p>
              Yes. For example, you can initially deposit GBYTE and later replace it with {symbol} (i.e. deposit some {symbol} and get GBYTE back) without waiting for expiry of your locking period.
            </p>

            <p>
              The ceiling price is used to calculate how much {symbol} you need to deposit to release your GBYTE.
            </p>

            <p>
              You can also do a reverse replacement, or replace external tokens such as USDC and ETH for {symbol}, or vice versa. For external tokens, a combination of the ceiling price and the token&rsquo;s price against GBYTE from an <Link href="https://oswap.io/" target="_blank" rel="noopener noreferrer">Oswap</Link> pool is used to determine the replacement ratio. The <Link href="/governance">governance</Link> decides which Oswap pool is used.
            </p>

            <p>
              The ceiling price limits the rate of growth of {symbol} price against GBYTE. If its market price exceeds the ceiling price, it becomes profitable to replace the locked {symbol} with GBYTE and then sell the released {symbol} on the market for profit, thus pushing its price down.
            </p>

            <p>
              This limit reduces the incentive to hold liquid {symbol} in hopes of its appreciation due to efforts of others, and pushes users to lock {symbol} instead and start making more money by connecting with friends.
            </p>
          </Faq.Content>
        </Faq.Item>


        <Faq.Item>
          <Faq.Title>What are the streaks?</Faq.Title>
          <Faq.Content>
            <p>
              If you make friends every day for several days in a row, you have a streak. If you miss one day, you lose your streak and it starts over.
            </p>

            <p>
              As soon as you complete your first 4-day streak, you get the right to become friends with a virtual account (a &ldquo;ghost&rdquo;) of a famous cypherpunk. You can choose among several cypherpunks: Satoshi Nakamoto, Tim May, Hal Finney, etc.
            </p>

            <p>
              Then, you start your next streak to become friends with another cypherpunk. The second streak is 9-days long. The third is 16-days long, the fourth is 25-days long, and so on, with the target length increasing each time.
            </p>

            <p>All your completed streaks and the current one are displayed in your profile, along with the cypherpunks you are friends with (or going to become friends with).</p>
          </Faq.Content>
        </Faq.Item>


        <Faq.Item>
          <Faq.Title>
            Why is it required to link my account to discord or telegram?
          </Faq.Title>
          <Faq.Content>
            <p>
              By attesting your discord and telegram accounts you link them to your Obyte address, which is your only identifier in Obyte Friends. Having that link allows us to notify you when follow-up rewards become available, so that you and your neighbor won&rsquo;t miss them.
            </p>
            <p>
              It is recommended to link both discord and telegram to be able to connect on the platform that is most convenient to both you and your future friends.
            </p>
          </Faq.Content>
        </Faq.Item>


        <Faq.Item>
          <Faq.Title>
            Why is it required to verify my real name?
          </Faq.Title>
          <Faq.Content>
            <p>
              It is not always required &mdash; it&rsquo;s unnecessary when you deposit {toLocalString(min_balance_instead_of_real_name / 10 ** decimals)} {symbol} or more.
            </p>

            <p>
              To ensure fair game for everyone, we need to prevent abuse, such as users creating multiple accounts, making friend connections among them, and collecting rewards for all these connections without bringing any value to the community. Real-name verification ensures the one-man-one-account rule.
            </p>
          </Faq.Content>
        </Faq.Item>


        <Faq.Item>
          <Faq.Title>Can the rewards rules be changed?</Faq.Title>
          <Faq.Content>
            <p>
              Yes, they can be changed by community <Link href="/governance">governance</Link>. Most of the rules are implemented in an AA (rewards AA), which can be just replaced by a governance vote with a new AA. This system makes the rewards scheme very flexible and allows adapting it to market conditions and challenges that cannot be foreseen at launch time.
            </p>

            <p>
              The rewards scheme can be updated in rather significant ways. For example, it may add an option to burn some amount of {symbol} to receive double rewards in the next 3 days in exchange. It can also link rewards to the user&rsquo;s status in <Link href="https://city.obyte.org/" target="_blank" rel="noopener noreferrer">Obyte City</Link>. It can be tuned to pay higher rewards to users with longer streaks. These are just some ideas, and there are many more possibilities.
            </p>
          </Faq.Content>
        </Faq.Item>


        <Faq.Item>
          <Faq.Title>How does governance work?</Faq.Title>
          <Faq.Content>
            <p>
              Every user who has locked funds in Obyte Friends can participate in its <Link href="/governance">governance</Link>. Anyone can suggest changes in any of the governable parameters of Obyte Friends. A bot watches for such suggestions and automatically sends notifications to <Link href="https://discord.obyte.org" target="_blank" rel="noopener noreferrer">Obyte discord</Link>. Other community members learn about the suggestions from these notifications and can:
            </p>

            <ul>
              <li>vote for them to support the proposed changes</li>
              <li>vote for some other value to oppose the changes</li>
              <li>do nothing and let others decide</li>
            </ul>

            <p>
              A proposal that has the highest amount of votes and stays unchallenged for 3 days, can be committed to make the new parameter value active.
            </p>

            <p>
              Voting weight is equal to the square root of the user&rsquo;s locked balance. This way of weighing gives more power to smaller users and dampens the power of whales. At the same time, a larger balance still provides more voting power to reflect a greater stake in the game. This kind of &ldquo;quadratic&rdquo; voting lies halfway between plain balance-based voting and one-man-one-vote systems.
            </p>

            <p>
              The voting is resistant to manipulation as the requirement of real-name attestation makes it impossible to split one&rsquo;s balance into many smaller ones to gain more voting weight.
            </p>
          </Faq.Content>
        </Faq.Item>


        <Faq.Item>
          <Faq.Title>Who develops and supports Obyte City?</Faq.Title>
          <Faq.Content>
            <p>
              The <Link href="https://obyte.org/" target="_blank" rel="noopener noreferrer">Obyte</Link> team has developed the <Link href="https://github.com/byteball/friend-aa" target="_blank" rel="noopener noreferrer">Friends AA</Link>, which is what handles user balances, deposits, withdrawals, rewards, and the governance framework. After that, the team doesn&rsquo;t operate the AA &mdash; it&rsquo;s an autonomous agent, and the team has no power over it. Neither can it change the AA &mdash; it&rsquo;s set in stone and nothing can be changed except a few parameters manageable by the community <Link href="/governance">governance</Link>. In particular, the governance can change the rules on how rewards are calculated.
            </p>

            <p>
              The Obyte team has also developed and continues to support all the infrastructure around the AA, such as user interface and integrations with messaging platforms. Independent developers are welcome to contribute to these parts of the ecosystem and develop their own.
            </p>
          </Faq.Content>
        </Faq.Item>


        {/* <Faq.Item>
          <Faq.Title></Faq.Title>
          <Faq.Content></Faq.Content>
        </Faq.Item> */}


        {/* <Faq.Item>
          <Faq.Title></Faq.Title>
          <Faq.Content></Faq.Content>
        </Faq.Item> */}


        {/* <Faq.Item>
          <Faq.Title></Faq.Title>
          <Faq.Content></Faq.Content>
        </Faq.Item> */}
      </Faq.Container>

      <div className="mt-20">
        <p className="mt-4 text-lg text-gray-700 text-pretty">Can&rsquo;t find the answer you&rsquo;re looking for? Reach out to our <a href="https://discord.obyte.org" target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-700 hover:text-blue-500">discord</a>.</p>
      </div>
    </div>
  )
}