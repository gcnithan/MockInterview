"use client"
import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from '@geist-ui/react'
import { createGeminiChatSession } from '@/util/GmeiniAi'
import { LoaderCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

function AddNewInterview() {
  const [role, setRole] = useState("");
  const [desc, setDesc] = useState("");
  const [exp, setExp] = useState("");
  const [duration, setDuration] = useState(30); // Default 30 minutes
  const [scheduleInterview, setScheduleInterview] = useState(false);
  const [interviewDate, setInterviewDate] = useState("");
  const [interviewTime, setInterviewTime] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [jsonResponse, setJsonResponse] = useState([]);
  const router = useRouter();

  // Generate a time value 1 hour from now, rounded to nearest 15 min
  const getDefaultTime = () => {
    const now = new Date();
    now.setHours(now.getHours() + 1);
    now.setMinutes(Math.ceil(now.getMinutes() / 15) * 15);
    return now.toTimeString().substring(0, 5);
  };

  // Generate today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const now = new Date();
    return now.toISOString().split('T')[0];
  };

  // Set default values when component mounts
  React.useEffect(() => {
    setInterviewDate(getTodayDate());
    setInterviewTime(getDefaultTime());
  }, []);

  const handleSubmit = async (e) => {
    setLoading(true);
    e.preventDefault();
    if (!role?.trim() || !desc?.trim() || !exp?.toString()?.trim()) {
      setError("All fields are required.");
      setLoading(false);
      return;
    }

    if (scheduleInterview && (!interviewDate || !interviewTime)) {
      setError("Please select both date and time for scheduled interview.");
      setLoading(false);
      return;
    }

    setError("");
    // Add a random seed to ensure different questions each time
    const randomSeed = Math.floor(Math.random() * 10000);
    const currentTime = new Date().toISOString();
    
    const InputPrompt = "Job position:" + role + 
      ", Job Description:" + desc + 
      ", Years of Experience:" + exp + 
      ", Interview Duration:" + duration + 
      " minutes, Random Seed:" + randomSeed + 
      ", Current Time:" + currentTime +
      ", Give me " + process.env.NEXT_PUBLIC_INTERVIEW_QUESTION_COUNT + 
      " unique and diverse interview questions with answers that can be completed within the specified duration. Do not repeat questions from previous sessions. Include questions across different difficulty levels and topic areas. Return in JSON format with Question and Answer fields.";
    
    const chat = createGeminiChatSession();
    const messages = [
      { role: "user", parts: [{ text: InputPrompt }] }
    ];
    const result = await chat.sendMessage(messages);
    // Improved JSON extraction and parsing
    let parsed = [];
    try {
      // First attempt: Try to parse the entire response as JSON
      try {
        const fullJson = JSON.parse(result);
        if (Array.isArray(fullJson)) {
          parsed = fullJson.filter(obj => typeof obj === 'object' && obj !== null);
        } else if (typeof fullJson === 'object' && fullJson !== null) {
          // Handle case where response is a JSON object with an array property
          const possibleArrays = Object.values(fullJson).filter(val => Array.isArray(val));
          if (possibleArrays.length > 0) {
            parsed = possibleArrays[0].filter(obj => typeof obj === 'object' && obj !== null);
          }
        }
      } catch (parseError) {
        // Second attempt: Try to extract JSON array using regex for more flexibility
        const jsonRegex = /\[\s*\{[^\[\]]*\}(\s*,\s*\{[^\[\]]*\})*\s*\]/g;
        const matches = result.match(jsonRegex);
        
        if (matches && matches.length > 0) {
          // Try each potential JSON match
          for (const match of matches) {
            try {
              const arr = JSON.parse(match);
              if (Array.isArray(arr) && arr.length > 0) {
                parsed = arr.filter(obj => typeof obj === 'object' && obj !== null);
                if (parsed.length > 0) break;
              }
            } catch (matchError) {
              // Continue to next match
            }
          }
        }
        
        // Third attempt: Fall back to the original method
        if (parsed.length === 0) {
          let startIdx = result.indexOf('[');
          let endIdx = result.lastIndexOf(']');
          
          if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
            let jsonStr = result.slice(startIdx, endIdx + 1);
            try {
              let arr = JSON.parse(jsonStr);
              if (Array.isArray(arr) && arr.length > 0) {
                parsed = arr.filter(obj => typeof obj === 'object' && obj !== null);
              }
            } catch (fallbackError) {
              // Fallback parsing failed
            }
          }
        }
      }
      
      if (parsed.length === 0) {
        setError("AI response did not contain any valid interview questions. Please try again.");
        setLoading(false);
        return;
      }
      
      const mockId = Date.now().toString();
      setJsonResponse(parsed);

      // Calculate scheduled time if needed
      const scheduledTime = scheduleInterview && interviewDate && interviewTime
        ? new Date(`${interviewDate}T${interviewTime}:00`)
        : null;
      
      // Save the complete mock interview data to the database
      try {
        const mockInterviewRes = await fetch('/api/mockinterview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonMockResp: JSON.stringify(parsed),
            jobPosition: role,
            jobDesc: desc,
            jobExperience: exp,
            duration: duration,
            scheduledTime: scheduledTime?.toISOString(),
            createdBy: 'user', // This should be replaced with actual user ID if available
            mockId: mockId
          })
        });
        
        if (!mockInterviewRes.ok) {
          const errorData = await mockInterviewRes.json();
          console.error('Error saving mock interview:', errorData);
          
          if (errorData.error === 'Database connection error') {
            setError("Database connection error: " + errorData.details);
            setLoading(false);
            return;
          }
          
          setError("Failed to save interview data. Please try again.");
          setLoading(false);
          return;
        }
        
        console.log('Saved mock interview:', await mockInterviewRes.json());

        // Create notification for scheduled interview
        if (scheduledTime) {
          try {
            await fetch('/api/notifications', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                type: 'reminder',
                message: `Your interview for "${role}" is scheduled for ${scheduledTime.toLocaleString()}`,
                scheduledTime: scheduledTime.toISOString(),
                mockId: mockId
              })
            });
          } catch (error) {
            console.error('Error creating notification:', error);
          }
        }
      } catch (error) {
        console.error('Error saving mock interview:', error);
        setError("Failed to save interview data. Please try again.");
        setLoading(false);
        return;
      }
      
      // Save each question-answer pair to the new collection
      let saveErrors = 0;
      for (const qa of parsed) {
        const question = qa.Question || qa.question;
        const answer = qa.Answer || qa.answer;
        
        if (question && answer) {
          try {
            const res = await fetch('/api/questionanswer', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ question, answer, mockId })
            });
            
            if (!res.ok) {
              console.error('Error saving question:', await res.text());
              saveErrors++;
              continue;
            }
            
            const data = await res.json();
            console.log('Saved QA:', data);
          } catch (error) {
            console.error('Error saving question:', error);
            saveErrors++;
          }
        } else {
          console.warn('Skipping invalid QA pair:', qa);
          saveErrors++;
        }
      }
      
      if (saveErrors > 0) {
        setError(`Failed to save ${saveErrors} question(s). The interview will continue with the successfully saved questions.`);
      }
      
      // Close the dialog and show success message
      setError("");
      if (scheduleInterview) {
        alert(`Interview scheduled for ${scheduledTime.toLocaleString()}`);
        router.push('/dashboard');
      } else {
        alert(`Successfully created interview with ${parsed.length} questions!`);
        setTimeout(() => {
          router.push(`/dashboard/interview/${mockId}`);
        }, 500);
      }
      
      // Close the dialog programmatically
      document.querySelector('[data-state="open"] button[data-state="closed"]')?.click();
      
    } catch (err) {
      console.error('Error processing response:', err);
      setError("Failed to process AI response. Please try again.");
    }
    
    setLoading(false);
  };

  return (
    <div>
      <Dialog>
        <DialogTrigger asChild>
          <div className='p-10 border rounded-lg bg-secondary hover:scale-105 hover:shadow-lg cursor-pointer transition-all'>
            <h2 className='font-bold text-lg text-center'>+ Add New</h2>
          </div>
        </DialogTrigger>
        <DialogContent className="bg-white border-2 border-gray-300 shadow-2xl p-8 rounded-xl max-w-lg w-full">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold mb-1">Tell us more about your job interviewing</DialogTitle>
            <DialogDescription className="text-base text-gray-600 mb-4">
              Add Details about your job position/role, Job description and years of experience
            </DialogDescription>
          </DialogHeader>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-1">
              <label className="font-medium">Job Role/Job Position</label>
              <input 
                className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400" 
                placeholder="Ex. Full Stack Developer" 
                value={role} 
                onChange={e => setRole(e.target.value)} 
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-medium">Job Description/ Tech Stack (In Short)</label>
              <Textarea 
                className="w-full" 
                placeholder="Ex. React, Angular, NodeJs, MySQL etc" 
                value={desc} 
                onChange={e => setDesc(e.target.value)} 
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-medium">Years of experience</label>
              <input 
                className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400" 
                placeholder="Ex. 5" 
                type="number" 
                value={exp} 
                onChange={e => setExp(e.target.value)} 
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-medium">Interview Duration (minutes)</label>
              <select
                className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={duration}
                onChange={e => setDuration(Number(e.target.value))}
              >
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={45}>45 minutes</option>
                <option value={60}>60 minutes</option>
              </select>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <input
                type="checkbox"
                id="scheduleInterview"
                checked={scheduleInterview}
                onChange={e => setScheduleInterview(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="scheduleInterview" className="font-medium">
                Schedule for later
              </label>
            </div>
            {scheduleInterview && (
              <div className="space-y-4 mt-2 p-4 bg-gray-50 rounded-lg">
                <div className="flex flex-col gap-1">
                  <label className="font-medium">Interview Date</label>
                  <input
                    type="date"
                    className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                    value={interviewDate}
                    min={getTodayDate()}
                    onChange={e => setInterviewDate(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-medium">Interview Time</label>
                  <input
                    type="time"
                    className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                    value={interviewTime}
                    onChange={e => setInterviewTime(e.target.value)}
                  />
                </div>
                <p className="text-sm text-gray-500">
                  You will receive a notification when it's time for your interview
                </p>
              </div>
            )}
            {error && <span className="text-red-500 text-sm mt-1">{error}</span>}
          </form>
          <DialogFooter className="mt-6 flex flex-row justify-end gap-2">
            <DialogClose asChild>
              <Button type='button' variant="outline">Cancel</Button>
            </DialogClose>
            <Button type='submit' disabled={loading} variant="default" onClick={handleSubmit}>
              {loading ? (
                <>
                  <LoaderCircle className='animate-spin' /> Generating From AI
                </>
              ) : scheduleInterview ? 'Schedule Interview' : 'Start Interview'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AddNewInterview;