import Image from 'next/image'
import { WaitlistForm } from '@/components/WaitlistForm'

export default function Home() {
  return (
    <div className="bg-white">
      <header className="absolute inset-x-0 top-0 z-50">
        <nav className="flex items-center justify-between p-6 lg:px-8" aria-label="Global">
          <div className="flex lg:flex-1">
            <a href="#" className="-m-1.5 p-1.5">
              <span className="sr-only">RecruitMe</span>
              {/* Placeholder logo or text if no logo asset available */}
              <span className="text-xl font-bold tracking-tight text-gray-900">RecruitMe</span>
            </a>
          </div>
        </nav>
      </header>


      <div className="relative isolate px-6 pt-14 lg:px-8">
        <div
          className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
          aria-hidden="true"
        >
          <div
            className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
            style={{
              clipPath:
                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
            }}
          />
        </div>
        <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Find the right candidates, faster.
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Post jobs, parse CVs, and shortlist applicants in one place.
              <br />
              <span className="font-semibold">coming soon</span>
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <WaitlistForm />
            </div>
          </div>
        </div>

        {/* Counselling Section */}
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-24 sm:py-32">
          <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2 lg:items-center">
            <div className="lg:pr-8 lg:pt-4">
              <div className="lg:max-w-lg">
                <h2 className="text-base font-semibold leading-7 text-indigo-600">Guidance</h2>
                <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Career Counselling</p>
                <p className="mt-6 text-lg leading-8 text-gray-600">
                  Navigate your career path with confidence. Our expert counsellors provide personalized guidance to help you identify your strengths, explore opportunities, and achieve your professional goals.
                </p>
              </div>
            </div>
            <div className="relative aspect-[16/9] lg:aspect-auto lg:h-[400px]">
               <Image
                src="/counselling.png"
                alt="Career Counselling Session"
                className="absolute inset-0 h-full w-full rounded-2xl bg-gray-50 object-cover shadow-xl ring-1 ring-gray-400/10"
                width={800}
                height={600}
              />
            </div>
          </div>
        </div>

        {/* Training Section */}
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-24 sm:py-32">
          <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2 lg:items-center">
             <div className="relative order-last lg:order-first aspect-[16/9] lg:aspect-auto lg:h-[400px]">
               <Image
                src="/training.png"
                alt="Professional Training Workshop"
                className="absolute inset-0 h-full w-full rounded-2xl bg-gray-50 object-cover shadow-xl ring-1 ring-gray-400/10"
                width={800}
                height={600}
              />
            </div>
            <div className="lg:pl-8 lg:pt-4">
              <div className="lg:max-w-lg">
                <h2 className="text-base font-semibold leading-7 text-indigo-600">Upskill</h2>
                <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Professional Training</p>
                <p className="mt-6 text-lg leading-8 text-gray-600">
                  Stay ahead in your field with our comprehensive training programs. From technical skills to soft skills, we offer workshops and courses designed to enhance your employability and performance.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div
          className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
          aria-hidden="true"
        >
          <div
            className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
            style={{
              clipPath:
                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
            }}
          />
        </div>
      </div>
    </div>
  )
}
