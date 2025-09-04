
export const dynamic = 'force-static'

export default async function Faq() {
  return (
    <div>
      <h2 className="text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl">Frequently asked questions</h2>

      <dl className="space-y-10 mt-10">
        <div>
          <dt className="text-base/7 font-semibold text-gray-900">How do you make holy water?</dt>
          <dd className="mt-2 text-base/7 text-gray-600">You boil the hell out of it. Lorem ipsum dolor sit amet consectetur adipisicing elit. Quas cupiditate laboriosam fugiat.</dd>
        </div>
        <div>
          <dt className="text-base/7 font-semibold text-gray-900">What&#039;s the best thing about Switzerland?</dt>
          <dd className="mt-2 text-base/7 text-gray-600">I don&#039;t know, but the flag is a big plus. Lorem ipsum dolor sit amet consectetur adipisicing elit. Quas cupiditate laboriosam fugiat.</dd>
        </div>
        <div>
          <dt className="text-base/7 font-semibold text-gray-900">What do you call someone with no body and no nose?</dt>
          <dd className="mt-2 text-base/7 text-gray-600">Nobody knows. Lorem ipsum dolor sit amet consectetur adipisicing elit. Quas cupiditate laboriosam fugiat.</dd>
        </div>
        <div>
          <dt className="text-base/7 font-semibold text-gray-900">Why do you never see elephants hiding in trees?</dt>
          <dd className="mt-2 text-base/7 text-gray-600">Because they&#039;re so good at it. Lorem ipsum dolor sit amet consectetur adipisicing elit. Quas cupiditate laboriosam fugiat.</dd>
        </div>
      </dl>

      <div className="mt-15">
        <p className="mt-4 text-pretty text-base/7 text-gray-600">Can’t find the answer you’re looking for? Reach out to our <a href="#" className="font-semibold text-blue-700 hover:text-blue-500">discord</a>.</p>
      </div>
    </div>
  )
}