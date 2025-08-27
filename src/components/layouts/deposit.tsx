import { DepositForm } from "@/components/forms/deposit-form";

export const Deposit = () => {

  return <>
    {/* <div className="">
      <h2 className="text-5xl font-bold text-center">Let’s start {" "}
        <Highlighter action="underline" color="#27ae60">
          earning
        </Highlighter>
      </h2>
      <p className="mt-2 text-xl text-gray-500 text-center">
        Make a deposit to your account.
      </p>
    </div> */}

    <div className="grid grid-cols-3 gap-4 max-w-5xl mx-auto mt-16">

      <div className="col-span-2 rounded-lg bg-gray-50">
        <div className="px-4 py-5 sm:p-6 w-full">
          <DepositForm />
        </div>
      </div>

      <div className="col-span-1">

        <div className="rounded-lg px-4 py-5 sm:p-6">
          <h2 className="text-3xl font-bold">Balance</h2>

          <div className="flex flex-col gap-4">
            <div>
              <p className="text-md text-muted-foreground">
                Here you can calculate the amount you can expect if you bring in new friends every day.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>

  </>
}