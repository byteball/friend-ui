import { Highlighter } from "@/components/magicui/highlighter";

export const HeroBlock = () => {
  return (
    <div className="w-full overflow-hidden">
      <svg
        aria-hidden="true"
        className="absolute inset-0 -z-10 size-full stroke-gray-200 [mask-image:radial-gradient(100%_100%_at_top_right,white,transparent)]"
      >
        <defs>
          <pattern
            x="50%"
            y={-1}
            id="983e3e4c-de6d-4c3f-8d64-b9761d1534cc"
            width={200}
            height={200}
            patternUnits="userSpaceOnUse"
          >
            <path d="M.5 200V.5H200" fill="none" />
          </pattern>
        </defs>
        <svg x="50%" y={-1} className="overflow-visible fill-gray-50">
          <path
            d="M-200 0h201v201h-201Z M600 0h201v201h-201Z M-400 600h201v201h-201Z M200 800h201v201h-201Z"
            strokeWidth={0}
          />
        </svg>
        <rect fill="url(#983e3e4c-de6d-4c3f-8d64-b9761d1534cc)" width="100%" height="100%" strokeWidth={0} />
      </svg>

      <div className="px-6 pb-18 pt-4 sm:pb-18 lg:flex lg:justify-center lg:px-8 lg:pb-18">
        <div>

          <h1 className="text-center w-full text-pretty text-5xl font-semibold tracking-tight text-gray-900 sm:text-7xl">
            Obyte Friends
          </h1>

          <p className="text-center mt-8 text-pretty text-lg font-medium text-gray-500 sm:text-xl/8">
            <Highlighter action="underline" color="#FF9800">Make 1% a day</Highlighter> by making <Highlighter action="underline" color="#87CEFA">friends</Highlighter> every day
          </p>

          <p className="text-center mt-2 text-pretty text-lg font-medium text-gray-500 sm:text-xl/8">and spreading the word about <a href="https://obyte.org" className="font-bold" target="_blank">Obyte</a>’s unstoppable, censorship-resistant tech</p>
        </div>
      </div>

    </div>
  );
}