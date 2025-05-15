'use client';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/app/components/Header';

const features = [
  {
    id: 1,
    title: "Create Your Interview",
    description: "Select your target role, experience level, and interview duration. Customize the interview to match the specific job you're applying for.",
    icon: (
      <svg className="h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    )
  },
  {
    id: 2,
    title: "AI-Generated Questions",
    description: "Our AI analyzes thousands of real interview questions to generate relevant technical and behavioral questions tailored to your selected role and level.",
    icon: (
      <svg className="h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    )
  },
  {
    id: 3,
    title: "Interactive Voice Interview",
    description: "Experience a realistic interview with our voice-enabled AI. The system will ask questions verbally and listen to your responses, creating an immersive interview experience.",
    icon: (
      <svg className="h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
      </svg>
    )
  },
  {
    id: 4,
    title: "Real-time Transcription",
    description: "Your responses are transcribed in real-time, allowing you to review your answers later and track how you articulate your thoughts during the interview.",
    icon: (
      <svg className="h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    )
  },
  {
    id: 5,
    title: "Detailed Feedback",
    description: "Receive comprehensive feedback on your performance, including strengths, areas for improvement, and specific recommendations for each question.",
    icon: (
      <svg className="h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    )
  },
  {
    id: 6,
    title: "Progress Tracking",
    description: "Monitor your interview performance over time. Track your improvement across multiple practice sessions and identify patterns in your strengths and weaknesses.",
    icon: (
      <svg className="h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    )
  }
];

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main>
        {/* Hero Section */}
        <div className="relative bg-indigo-800">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-900 to-indigo-700"></div>
          </div>
          <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">How It Works</h1>
            <p className="mt-6 text-xl text-indigo-100 max-w-3xl">
              Prepare for your next job interview with our AI-powered interview simulator. 
              Practice answering realistic questions and receive personalized feedback to improve your skills.
            </p>
          </div>
        </div>
        
        {/* Process Steps */}
        <div className="py-16 bg-white overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:text-center">
              <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">Interview Process</h2>
              <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                Ace Your Interviews in 4 Simple Steps
              </p>
              <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
                Our AI interview simulator provides a realistic interview experience to help you prepare confidently.
              </p>
            </div>
            
            <div className="mt-16">
              <div className="space-y-16">
                {/* Step 1 */}
                <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:items-center">
                  <div className="relative">
                    <div className="aspect-w-16 aspect-h-9 rounded-lg shadow-lg overflow-hidden">
                      <div className="h-full w-full bg-indigo-100 flex items-center justify-center">
                        <svg className="mx-auto h-24 w-24 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="mt-10 -mx-4 relative lg:mt-0">
                    <div className="relative pl-4 sm:pl-6 lg:pl-0">
                      <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight sm:text-3xl">
                        1. Set Up Your Interview
                      </h3>
                      <div className="mt-3 text-lg text-gray-500">
                        <p>
                          Start by selecting your target job role, experience level, and preferred interview duration. 
                          You can also set specific focus areas like technical skills, leadership experience, or problem-solving.
                        </p>
                        <ul className="mt-5 list-disc list-inside space-y-1">
                          <li>Choose from dozens of job roles</li>
                          <li>Select experience level (Entry, Mid, Senior)</li>
                          <li>Set interview duration (15-60 minutes)</li>
                          <li>Schedule your interview at a convenient time</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Step 2 */}
                <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:items-center">
                  <div className="mt-10 -mx-4 relative lg:mt-0 lg:order-first">
                    <div className="relative pl-4 sm:pl-6 lg:pl-0">
                      <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight sm:text-3xl">
                        2. Practice with AI Interviewer
                      </h3>
                      <div className="mt-3 text-lg text-gray-500">
                        <p>
                          When you're ready, your AI interviewer will begin asking relevant questions for your role. 
                          The interview uses voice interaction to create a realistic interview experience.
                        </p>
                        <ul className="mt-5 list-disc list-inside space-y-1">
                          <li>Answer questions verbally or via text</li>
                          <li>Role-specific technical and behavioral questions</li>
                          <li>Natural conversation with follow-up questions</li>
                          <li>Real-time transcription of your responses</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div className="relative order-first lg:order-last">
                    <div className="aspect-w-16 aspect-h-9 rounded-lg shadow-lg overflow-hidden">
                      <div className="h-full w-full bg-indigo-100 flex items-center justify-center">
                        <svg className="mx-auto h-24 w-24 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Step 3 */}
                <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:items-center">
                  <div className="relative">
                    <div className="aspect-w-16 aspect-h-9 rounded-lg shadow-lg overflow-hidden">
                      <div className="h-full w-full bg-indigo-100 flex items-center justify-center">
                        <svg className="mx-auto h-24 w-24 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="mt-10 -mx-4 relative lg:mt-0">
                    <div className="relative pl-4 sm:pl-6 lg:pl-0">
                      <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight sm:text-3xl">
                        3. Receive Comprehensive Feedback
                      </h3>
                      <div className="mt-3 text-lg text-gray-500">
                        <p>
                          After completing your interview, our AI analyzes your responses and provides detailed feedback 
                          on your performance across multiple dimensions.
                        </p>
                        <ul className="mt-5 list-disc list-inside space-y-1">
                          <li>Score breakdown by question and category</li>
                          <li>Detailed analysis of your communication skills</li>
                          <li>Comparison with model answers</li>
                          <li>Actionable improvement suggestions</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Step 4 */}
                <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:items-center">
                  <div className="mt-10 -mx-4 relative lg:mt-0 lg:order-first">
                    <div className="relative pl-4 sm:pl-6 lg:pl-0">
                      <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight sm:text-3xl">
                        4. Track Your Progress
                      </h3>
                      <div className="mt-3 text-lg text-gray-500">
                        <p>
                          Practice makes perfect. Continue improving by taking multiple interviews and 
                          tracking your progress over time.
                        </p>
                        <ul className="mt-5 list-disc list-inside space-y-1">
                          <li>View historical performance trends</li>
                          <li>Review past interview recordings and transcripts</li>
                          <li>Focus on weaker areas with targeted practice</li>
                          <li>Get improvement recommendations based on your progress</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div className="relative order-first lg:order-last">
                    <div className="aspect-w-16 aspect-h-9 rounded-lg shadow-lg overflow-hidden">
                      <div className="h-full w-full bg-indigo-100 flex items-center justify-center">
                        <svg className="mx-auto h-24 w-24 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Features */}
        <div className="bg-gray-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:text-center">
              <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">Key Features</h2>
              <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                Everything You Need to Succeed
              </p>
              <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
                Our AI interview platform includes powerful features designed to make your interview preparation effective and comprehensive.
              </p>
            </div>
            
            <div className="mt-16">
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {features.map((feature) => (
                  <div key={feature.id} className="pt-6">
                    <div className="flow-root bg-white rounded-lg px-6 pb-8 h-full">
                      <div className="-mt-6">
                        <div>
                          <span className="inline-flex items-center justify-center p-3 bg-indigo-500 rounded-md shadow-lg">
                            {feature.icon}
                          </span>
                        </div>
                        <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">{feature.title}</h3>
                        <p className="mt-5 text-base text-gray-500">{feature.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* CTA */}
        <div className="bg-indigo-700">
          <div className="max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              <span className="block">Ready to ace your next interview?</span>
              <span className="block">Start practicing today.</span>
            </h2>
            <p className="mt-4 text-lg leading-6 text-indigo-200">
              Join thousands of job seekers who have improved their interview skills with our AI interview simulator.
            </p>
            <Link href="/dashboard" className="mt-8 w-full inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50 sm:w-auto">
              Start a Mock Interview
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}