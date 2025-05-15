'use client';

import React, { useEffect, useState } from 'react';
import AddNewInterview from '../_components/AddNewInterview';
import { useRouter } from 'next/navigation';

export default function Interview() {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Fetch all interviews when component mounts
  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        const response = await fetch('/api/mockinterview');
        if (!response.ok) {
          throw new Error('Failed to fetch interviews');
        }
        const data = await response.json();
        
        // Handle different response structures
        let interviewsList = [];
        if (Array.isArray(data)) {
          interviewsList = data;
        } else if (data.interviews && Array.isArray(data.interviews)) {
          interviewsList = data.interviews;
        }
        
        setInterviews(interviewsList);
      } catch (error) {
        console.error('Error fetching interviews:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchInterviews();
  }, []);

  const handleInterviewClick = (interviewId) => {
    router.push(`/dashboard/interview/${interviewId}`);
  };
  
  const handleDeleteInterview = async (interviewId, e) => {
    e.stopPropagation(); // Prevent clicking the card
    
    if (!confirm('Are you sure you want to delete this interview?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/mockinterview?mockId=${interviewId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete interview');
      }
      
      // Remove the deleted interview from state
      setInterviews(interviews.filter(interview => interview.mockId !== interviewId));
    } catch (error) {
      console.error('Error deleting interview:', error);
      alert('Failed to delete interview. Please try again.');
    }
  };

  return (
    <div>
      <div className="flex items-center mb-6">
        <button 
          onClick={() => router.push('/dashboard')}
          className="flex items-center text-indigo-600 hover:text-indigo-800 mr-4"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Return to Dashboard
        </button>
        <h1 className="text-3xl font-bold">Interview Dashboard</h1>
      </div>
      
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Create New Interview
        </h2>
        <AddNewInterview />
      </div>
      
      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Your Previous Interviews
        </h2>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((item) => (
              <div key={item} className="rounded-lg bg-white shadow-md p-6 animate-pulse">
                <div className="h-5 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-4/5"></div>
              </div>
            ))}
          </div>
        ) : interviews.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No Interviews Yet</h3>
            <p className="text-gray-500 mb-6">Create your first interview to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {interviews.map((interview) => (
              <div 
                key={interview.mockId}
                className="bg-white rounded-xl shadow-md overflow-hidden transition-all hover:shadow-lg cursor-pointer relative"
                onClick={() => handleInterviewClick(interview.mockId)}
              >
                <div className="bg-indigo-500 h-2"></div>
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{interview.jobPosition}</h3>
                    <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded flex items-center">
                      {interview.jobExperience} years
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4 text-sm line-clamp-2">{interview.jobDesc}</p>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">
                      {new Date(interview.createdAt).toLocaleDateString()}
                    </span>
                    <button 
                      onClick={(e) => handleDeleteInterview(interview.mockId, e)}
                      className="text-red-500 hover:text-red-700 text-sm font-medium flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}