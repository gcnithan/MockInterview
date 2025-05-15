'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function InterviewDetailPage({ params }) {
  const { interviewId } = params;
  const [interview, setInterview] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeQuestion, setActiveQuestion] = useState(null);
  const router = useRouter();
  
  // Add a ref to track if the effect has run
  const effectRan = React.useRef(false);

  useEffect(() => {
    // Skip effect on first render in development mode (StrictMode causes double render)
    if (effectRan.current === true) {
      return;
    }
    
    const fetchInterviewDetails = async () => {
      try {
        // Fetch interview details
        const interviewResponse = await fetch(`/api/mockinterview?mockId=${interviewId}`);
        if (!interviewResponse.ok) {
          throw new Error('Failed to fetch interview details');
        }
        const interviewData = await interviewResponse.json();
        console.log('API response:', interviewData);
        // Handle different response structures
        if (Array.isArray(interviewData)) {
          setInterview(interviewData[0] || null);
        } else if (interviewData.interviews && Array.isArray(interviewData.interviews)) {
          setInterview(interviewData.interviews[0] || null);
        } else {
          throw new Error('Unexpected API response format');
        }
        
        // Fetch questions for this interview
        const questionsResponse = await fetch(`/api/questionanswer?mockId=${interviewId}`);
        if (!questionsResponse.ok) {
          throw new Error('Failed to fetch questions');
        }
        const questionsData = await questionsResponse.json();
        // Handle different response structures
        if (Array.isArray(questionsData)) {
          setQuestions(questionsData || []);
        } else if (questionsData.questions && Array.isArray(questionsData.questions)) {
          setQuestions(questionsData.questions || []);
        } else {
          setQuestions([]);
        }
      } catch (error) {
        console.error('Error fetching interview details:', error);
      } finally {
        setLoading(false);
      }
    };

    if (interviewId) {
      fetchInterviewDetails();
    }
    
    // Mark effect as having run
    effectRan.current = true;
    
    // Clean up function
    return () => {
      // Reset in development when component unmounts
      if (process.env.NODE_ENV === 'development') {
        effectRan.current = false;
      }
    };
  }, [interviewId]); // Only re-run if interviewId changes

  const handleBackClick = () => {
    router.push('/dashboard');
  };

  const handleStartInterview = () => {
    if (!interview || !interviewId) {
      console.error('Interview data is missing');
      return;
    }
    
    // Make sure we have questions
    if (questions.length === 0) {
      alert('Please add interview questions before starting the interview');
      return;
    }
    
    console.log('Navigating to session with ID:', interviewId);
    
    // Direct navigation without delay and prefetch
    try {
      // First navigate to a different location to reset any potential cached state
      router.push(`/dashboard`);
      
      // Then navigate to the session page
      setTimeout(() => {
        const sessionUrl = `/dashboard/interview/session/${interviewId}`;
        console.log('Navigating to:', sessionUrl);
        window.location.href = sessionUrl;
      }, 100);
    } catch (error) {
      console.error('Navigation error:', error);
      // Fallback to direct URL change if router fails
      window.location.href = `/dashboard/interview/session/${interviewId}`;
    }
  };

  const toggleQuestion = (index) => {
    if (activeQuestion === index) {
      setActiveQuestion(null);
    } else {
      setActiveQuestion(index);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-pulse flex flex-col items-center">
              <div className="h-12 w-12 rounded-full bg-blue-200 mb-4"></div>
              <div className="h-4 w-32 bg-blue-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!interview) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl">
            <div className="p-8">
              <div className="flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-center text-red-600 mb-2">Interview Not Found</h2>
              <p className="text-gray-600 text-center mb-6">The interview you're looking for may have been deleted or doesn't exist.</p>
              <div className="flex justify-center">
                <button 
                  onClick={handleBackClick}
                  className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <button 
            onClick={handleBackClick}
            className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Dashboard
          </button>
        </div>
        
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
          <div className="md:flex">
            <div className="md:flex-shrink-0 bg-indigo-500 md:w-48 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="p-8 w-full">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">{interview.jobPosition}</h1>
                  <p className="text-indigo-600 mb-4 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Experience: {interview.jobExperience} years
                  </p>
                </div>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                  Ready
                </span>
              </div>
              
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Job Description:</h2>
              <p className="text-gray-700 mb-6">{interview.jobDesc}</p>
              
              <div className="flex items-center justify-between border-t border-gray-200 pt-4 text-sm text-gray-600">
                <div>
                  Created: {new Date(interview.createdAt).toLocaleDateString()}
                </div>
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {questions.length} Interview Questions
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-md overflow-hidden p-6 text-center">
          <div className="max-w-md mx-auto">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Ready for Your Interview?</h2>
            <p className="text-gray-600 mb-6">
              This interview contains {questions.length} questions about {interview.jobPosition}. 
              Questions will be presented one by one during the interview session.
            </p>
            
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8 rounded-r-md text-left">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    Questions and answers are hidden until you start the interview. You'll receive detailed feedback at the end of your session.
                  </p>
                </div>
              </div>
            </div>
            
            <button
              onClick={handleStartInterview}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center mx-auto"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
              Start Interview
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}