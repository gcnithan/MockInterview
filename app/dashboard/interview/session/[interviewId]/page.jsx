'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Webcam from 'react-webcam';
import Link from 'next/link';

export default function InterviewSessionPage({ params }) {
  const { interviewId } = params;
  console.log("Session page initializing with interview ID:", interviewId);
  
  const [interview, setInterview] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [webcamEnabled, setWebcamEnabled] = useState(false);
  const [microphoneEnabled, setMicrophoneEnabled] = useState(false);
  const [isInterviewStarted, setIsInterviewStarted] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [feedback, setFeedback] = useState([]);
  const [overallFeedback, setOverallFeedback] = useState('');
  const [recording, setRecording] = useState(null);
  const [audioURL, setAudioURL] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [audioBlobs, setAudioBlobs] = useState([]);
  const [averageScore, setAverageScore] = useState(0);
  
  const webcamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const speechRecognitionRef = useRef(null);
  const router = useRouter();
  
  const effectRan = useRef(false);

  // Enhanced speech recognition initialization with better fallbacks and error handling
  const initSpeechRecognition = () => {
    if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
      console.error('Speech recognition not supported by this browser');
      alert('Speech recognition is not supported by your browser. Please try using Chrome, Edge, or Safari.');
      return;
    }
    
    try {
      // Cleanup any existing instance first
      if (speechRecognitionRef.current) {
        try {
          speechRecognitionRef.current.stop();
          speechRecognitionRef.current.onend = null;
          speechRecognitionRef.current.onstart = null;
          speechRecognitionRef.current.onresult = null;
          speechRecognitionRef.current.onerror = null;
        } catch (e) {
          console.error('Error cleaning up existing speech recognition:', e);
        }
      }
      
      // Create a new speech recognition instance with proper feature detection
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      // First check if we can access the API
      if (typeof SpeechRecognition !== 'function') {
        console.error('SpeechRecognition constructor not available');
        alert('Speech recognition is not available in your browser. Please try a different browser like Chrome.');
        return;
      }
      
      const recognition = new SpeechRecognition();
      
      // Set properties with try/catch to avoid potential errors
      try {
        recognition.continuous = true;
      } catch (e) {
        console.warn('Failed to set continuous property:', e);
      }
      
      try {
        recognition.interimResults = true;
      } catch (e) {
        console.warn('Failed to set interimResults property:', e);
      }
      
      try {
        recognition.maxAlternatives = 1;
      } catch (e) {
        console.warn('Failed to set maxAlternatives property:', e);
      }
      
      try {
        recognition.lang = 'en-US';
      } catch (e) {
        console.warn('Failed to set language property:', e);
      }
      
      // Set up better event handlers
      recognition.onstart = () => {
        console.log('👂 Speech recognition started successfully');
        setIsListening(true);
      };
      
      recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';
        
        try {
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            const confidence = event.results[i][0].confidence;
            console.log(`🎤 Transcript[${i}]:`, transcript, 'Confidence:', confidence.toFixed(2), 'isFinal:', event.results[i].isFinal);
            
            if (event.results[i].isFinal) {
              finalTranscript += transcript + ' ';
            } else {
              interimTranscript += transcript;
            }
          }
          
          // Update the user's answer with more verbose logging
          if (finalTranscript || interimTranscript) {
            const transcript = finalTranscript || interimTranscript;
            console.log('📝 Setting user answer:', transcript);
            
            // CRITICAL FIX: Only save to the current question, don't append to previous answers
            setUserAnswer(transcript.trim());
            
            // Update the answer in the answers array
            setAnswers(prevAnswers => {
              const newAnswers = [...prevAnswers];
              newAnswers[currentQuestionIndex] = transcript.trim();
              return newAnswers;
            });
          }
        } catch (e) {
          console.error('Error processing speech results:', e);
        }
      };
      
      recognition.onerror = (event) => {
        console.error('❌ Speech recognition error:', event.error, event);
        
        // Manual transcription fallback if speech recognition fails
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          alert('Microphone access denied. You can still type your answer manually.');
          setIsListening(false);
          return;
        }
        
        // Don't show errors for no-speech or aborted events
        if (event.error !== 'no-speech' && event.error !== 'aborted') {
          alert('Speech recognition encountered an error. You can continue by typing your answer or try again.');
        }
        
        // For critical errors, stop listening but don't try to reset
        if (event.error !== 'no-speech') {
          setIsListening(false);
        }
      };
      
      recognition.onend = () => {
        console.log('🔄 Speech recognition session ended');
        
        // Only auto-restart if we're still supposed to be listening
        if (isListening) {
          try {
            // Try to restart if needed
            setTimeout(() => {
              if (isListening) {
                try {
                  recognition.start();
                  console.log('🔄 Restarted speech recognition');
                } catch (e) {
                  console.error('Failed to restart speech recognition:', e);
                  setIsListening(false);
                }
              }
            }, 1000);
          } catch (e) {
            console.error('Error in onend handler:', e);
            setIsListening(false);
          }
        }
      };
      
      // Store the reference
      speechRecognitionRef.current = recognition;
      
      console.log('🎤 Speech recognition initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Error initializing speech recognition:', error);
      alert('There was a problem initializing speech recognition. You can still participate by typing your answers.');
      return false;
    }
  };

  useEffect(() => {
    console.log("Running interview session data fetch effect");
    
    const fetchInterviewDetails = async () => {
      try {
        console.log("Fetching data for interview ID:", interviewId);
        // Parallel API calls for better performance
        const [interviewResponse, questionsResponse] = await Promise.all([
          fetch(`/api/mockinterview?mockId=${interviewId}`),
          fetch(`/api/questionanswer?mockId=${interviewId}`)
        ]);

        // Handle interview data
        if (!interviewResponse.ok) {
          throw new Error(`Failed to fetch interview details: ${interviewResponse.status}`);
        }
        const interviewData = await interviewResponse.json();
        console.log('Interview API response:', interviewData);
        
        // Handle different response structures
        if (Array.isArray(interviewData)) {
          if (interviewData.length === 0) {
            setErrorMessage('Interview not found in database');
            setLoading(false);
            return;
          }
          setInterview(interviewData[0]);
        } else if (interviewData.interviews && Array.isArray(interviewData.interviews)) {
          if (interviewData.interviews.length === 0) {
            setErrorMessage('Interview not found in database');
            setLoading(false);
            return;
          }
          setInterview(interviewData.interviews[0]);
        } else {
          setErrorMessage('Unexpected API response format');
          setLoading(false);
          return;
        }
        
        // Handle questions data
        if (!questionsResponse.ok) {
          throw new Error(`Failed to fetch questions: ${questionsResponse.status}`);
        }
        const questionsData = await questionsResponse.json();
        console.log('Questions API response:', questionsData);
        
        // Extract questions from response and store answers separately
        let questionsList = [];
        let answersMap = {};
        
        if (Array.isArray(questionsData)) {
          questionsList = questionsData.map(q => {
            // Store answer in separate map with question ID as key
            const questionId = q._id || q.id || Math.random().toString(36).substring(2, 9);
            answersMap[questionId] = q.answer || q.Answer || '';
            
            // Return question without the answer
            return {
              ...q,
              questionId,
              // Remove answer from question object to prevent displaying it
              answer: undefined,
              Answer: undefined
            };
          });
        } else if (questionsData.questions && Array.isArray(questionsData.questions)) {
          questionsList = questionsData.questions.map(q => {
            const questionId = q._id || q.id || Math.random().toString(36).substring(2, 9);
            answersMap[questionId] = q.answer || q.Answer || '';
            
            return {
              ...q, 
              questionId,
              answer: undefined,
              Answer: undefined
            };
          });
        }
        
        // Save the original answers map in state for later use in feedback
        const originalAnswers = Object.values(answersMap);
        
        if (questionsList.length === 0) {
          setErrorMessage('No questions found for this interview. Please add questions first.');
          setLoading(false);
          return;
        }
        
        console.log('Questions loaded:', questionsList.length, 'First question:', questionsList[0]);
        setQuestions(questionsList);
        // Initialize answers array
        setAnswers(new Array(questionsList.length).fill(''));
        setLoading(false);
      } catch (error) {
        console.error('Error fetching interview details:', error);
        setErrorMessage(error.message || 'Failed to load interview data');
        setLoading(false);
      }
    };

    if (interviewId) {
      fetchInterviewDetails();
    }
    
    // Initialize recognition when component mounts
    initSpeechRecognition();
    
    return () => {
      // Clean up - set listening to false first to prevent restart attempts
      setIsListening(false);
      
      // Then stop recognition
      if (speechRecognitionRef.current) {
        try {
          speechRecognitionRef.current.stop();
        } catch (e) {
          console.error('Error stopping speech recognition:', e);
        }
      }
      
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        try {
          mediaRecorderRef.current.stop();
        } catch (e) {
          console.error('Error stopping media recorder:', e);
        }
      }
      
      if (process.env.NODE_ENV === 'development') {
        effectRan.current = false;
      }
    };
  }, [interviewId]); // Only run on interviewId change, not currentQuestionIndex

  // Completely rewrite the speakQuestion function for better text-to-speech
  const speakQuestion = (text) => {
    console.log('Speaking question:', text);
    
    if (!('speechSynthesis' in window)) {
      console.error('Text-to-speech not supported by this browser');
      alert('Text-to-speech is not supported by your browser. You can still read the questions yourself.');
      startListening(); // Still start listening even if TTS fails
      return;
    }
    
    // Cancel any previous speech
    window.speechSynthesis.cancel();
    
    // Create and configure utterance
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Get available voices
    let voices = window.speechSynthesis.getVoices();
    
    // Configure for optimal clarity
    utterance.rate = 0.85; // Slower for better clarity
    utterance.pitch = 1.0; // Natural pitch
    utterance.volume = 1.0; // Full volume
    
    // Helper to set the best voice
    const setBestVoice = () => {
      voices = window.speechSynthesis.getVoices();
      console.log('Available voices:', voices.map(v => v.name));
      
      // Try to find high-quality voices in order of preference
      const preferenceList = [
        // Google voices (Chrome)
        voices.find(v => v.name.includes('Google') && v.name.includes('US English Female')),
        voices.find(v => v.name.includes('Google US English')),
        
        // Microsoft voices (Edge)
        voices.find(v => v.name.includes('Microsoft') && v.name.includes('Zira')),
        voices.find(v => v.name.includes('Microsoft') && v.name.includes('English')),
        
        // Safari voices
        voices.find(v => v.name.includes('Samantha')),
        
        // Any English US female voice
        voices.find(v => v.lang.includes('en-US') && v.name.includes('Female')),
        
        // Any English US voice
        voices.find(v => v.lang.includes('en-US')),
        
        // Fallback to any English voice
        voices.find(v => v.lang.includes('en')),
      ];
      
      // Get first non-null voice
      const bestVoice = preferenceList.find(voice => voice !== undefined);
      
      if (bestVoice) {
        console.log('Selected voice:', bestVoice.name);
        utterance.voice = bestVoice;
      } else {
        console.log('No suitable voice found, using default');
      }
    };
    
    // If voices already loaded, set the best voice
    if (voices.length > 0) {
      setBestVoice();
    } else {
      // Wait for voices to be loaded
      const voicesLoadedHandler = () => {
        setBestVoice();
        
        // Try to speak after voices are loaded
        try {
          window.speechSynthesis.speak(utterance);
        } catch (error) {
          console.error('Error speaking after voices loaded:', error);
          startListening(); // Still start listening even if TTS fails
        }
      };
      
      window.speechSynthesis.onvoiceschanged = voicesLoadedHandler;
      
      // Set a timeout in case voices don't load
      setTimeout(() => {
        if (!utterance.voice) {
          console.log('Voices not loaded in time, using default');
          try {
            window.speechSynthesis.speak(utterance);
          } catch (error) {
            console.error('Error speaking with timeout:', error);
            startListening(); // Still start listening even if TTS fails
          }
        }
      }, 1000);
      
      return; // Return early to avoid speaking before voices are loaded
    }
    
    // Set up event handlers
    utterance.onstart = () => {
      console.log('Speech started');
      setIsSpeaking(true);
    };
    
    utterance.onend = () => {
      console.log('Speech ended');
      setIsSpeaking(false);
      
      // Auto-start listening
      startListening();
    };
    
    utterance.onerror = (error) => {
      console.error('Speech synthesis error:', error);
      setIsSpeaking(false);
      
      // Still start listening even if TTS fails
      startListening();
    };
    
    // Speak the question
    try {
      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.error('Error starting speech:', error);
      
      // Still start listening even if TTS fails
      startListening();
    }
  };

  // Improved startListening with alternative input option
  const startListening = () => {
    console.log('▶️ Starting listening...');
    
    // Make sure we have a speech recognition instance
    if (!speechRecognitionRef.current) {
      const success = initSpeechRecognition();
      if (!success) {
        // If initialization fails, provide manual input option
        alert('Unable to initialize speech recognition. You can type your answer instead.');
        return;
      }
      
      // Short delay before starting after initialization
      setTimeout(() => {
        tryStartListening();
      }, 500);
      return;
    }
    
    tryStartListening();
  };
  
  // New helper function to attempt starting speech recognition
  const tryStartListening = () => {
    // Don't try to start if already listening
    if (isListening) {
      console.log('👂 Already listening, no need to start again');
      return;
    }
    
    try {
      // Start audio recording first
      startRecording();
      
      // Reset current user answer to ensure we don't append to existing text
      if (userAnswer) {
        console.log('Clearing existing answer for fresh recording');
        setUserAnswer('');
      }
      
      // Then start speech recognition with proper error handling
      try {
        setIsListening(true); // Set to true BEFORE calling start to avoid race conditions
        
        // Try-catch to handle potential errors when starting recognition
        try {
          speechRecognitionRef.current.start();
          console.log('▶️ Speech recognition started');
        } catch (startError) {
          if (startError.name === 'InvalidStateError') {
            // Already running, just update UI
            console.log('ℹ️ Speech recognition was already running');
          } else {
            // Attempt to re-initialize and start again
            console.error('Error starting recognition, reinitializing:', startError);
            const success = initSpeechRecognition();
            
            if (success) {
              try {
                setTimeout(() => {
                  speechRecognitionRef.current.start();
                }, 500);
              } catch (e) {
                console.error('Failed to start after reinitializing:', e);
                setIsListening(false);
                alert('Unable to start speech recognition. You can type your answer instead.');
              }
            } else {
              setIsListening(false);
              alert('Failed to restart speech recognition. Please refresh and try again.');
            }
          }
        }
      } catch (error) {
        console.error('❌ Error in speech recognition starting process:', error);
        setIsListening(false);
        alert('Failed to start speech recognition. You can continue by typing your answer.');
      }
    } catch (error) {
      console.error('❌ Error in startListening:', error);
      setIsListening(false);
      alert('Failed to start listening. You can type your answer instead.');
    }
  };

  // Fix stopListening to properly handle the state
  const stopListening = () => {
    console.log('Stopping listening...');
    
    // Update state first to prevent restart attempts in onend handler
    setIsListening(false);
    
    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop();
        console.log('Speech recognition stopped');
      } catch (error) {
        console.error('Error stopping speech recognition:', error);
        // If it wasn't running, that's fine
      }
    }
    
    // Also stop audio recording
    stopRecording();
  };

  // Add a new function to completely reset speech recognition
  const resetSpeechRecognition = () => {
    console.log('🔄 Resetting speech recognition...');
    
    // Update state
    setIsListening(false);
    
    // Safely stop current instance if it exists
    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop();
      } catch (e) {
        console.error('❌ Error stopping speech recognition during reset:', e);
        // Ignore error and continue with reset
      }
      
      // Clear event handlers to prevent memory leaks
      try {
        speechRecognitionRef.current.onstart = null;
        speechRecognitionRef.current.onend = null;
        speechRecognitionRef.current.onresult = null;
        speechRecognitionRef.current.onerror = null;
      } catch (e) {
        console.error('❌ Error clearing event handlers during reset:', e);
        // Ignore and continue
      }
    }
    
    // Create a new instance after a brief delay
    setTimeout(() => {
      try {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
          console.error('❌ SpeechRecognition API not available after reset');
          return;
        }
        
        const recognition = new SpeechRecognition();
        
        // Configure for optimal results
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.maxAlternatives = 1; // Reduced for better accuracy
        recognition.lang = 'en-US';
        
        // Set up event handlers
        recognition.onstart = () => {
          console.log('▶️ Speech recognition started successfully after reset');
          setIsListening(true);
        };
        
        recognition.onresult = (event) => {
          console.log('📝 Speech recognition result received');
          let interimTranscript = '';
          let finalTranscript = '';
          
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            const confidence = event.results[i][0].confidence;
            
            console.log(`🎤 Reset Transcript[${i}]:`, transcript, 'Confidence:', confidence.toFixed(2), 'isFinal:', event.results[i].isFinal);
            
            if (event.results[i].isFinal) {
              finalTranscript += transcript + ' ';
            } else {
              interimTranscript += transcript;
            }
          }
          
          // Update the user's answer with more verbose logging
          if (finalTranscript || interimTranscript) {
            const transcript = finalTranscript || interimTranscript;
            console.log('📝 Setting user answer after reset:', transcript);
            
            // CRITICAL FIX: Only save current transcript, don't append to previous answers
            setUserAnswer(transcript.trim());
            
            // Update the answer in the answers array
            setAnswers(prevAnswers => {
              const newAnswers = [...prevAnswers];
              newAnswers[currentQuestionIndex] = transcript.trim();
              return newAnswers;
            });
          }
        };
        
        recognition.onerror = (event) => {
          console.error('❌ Speech recognition error after reset:', event.error, event);
          
          if (event.error === 'no-speech') {
            console.log('No speech detected after reset');
            return; // Don't stop on no-speech
          }
          
          if (event.error === 'aborted' || event.error === 'network') {
            // These might be temporary - attempt to restart
            setTimeout(() => {
              if (isListening) {
                try {
                  recognition.start();
                } catch (e) {
                  console.error('❌ Failed to restart after temporary error:', e);
                  setIsListening(false);
                }
              }
            }, 1000);
            return;
          }
          
          setIsListening(false);
        };
        
        recognition.onend = () => {
          console.log('🔄 Speech recognition ended after reset');
          
          // Only auto-restart if we're still supposed to be listening
          if (isListening) {
            console.log('🔄 Attempting to restart after end event');
            try {
              setTimeout(() => {
                if (isListening && speechRecognitionRef.current === recognition) {
                  try {
                    recognition.start();
                    console.log('▶️ Successfully restarted recognition after end');
                  } catch (e) {
                    console.error('❌ Failed to restart recognition after end:', e);
                    setIsListening(false);
                  }
                }
              }, 500);
            } catch (e) {
              console.error('❌ Failed to restart speech recognition after reset:', e);
              setIsListening(false);
            }
          }
        };
        
        // Replace the current reference
        speechRecognitionRef.current = recognition;
        
        // Try to start recognition
        try {
          recognition.start();
          console.log('▶️ Speech recognition started after reset');
        } catch (error) {
          console.error('❌ Error starting speech recognition after reset:', error);
          setIsListening(false);
        }
      } catch (error) {
        console.error('❌ Error creating new speech recognition after reset:', error);
        alert('Failed to reset speech recognition. Please refresh the page and try again.');
      }
    }, 1000); // Longer delay to ensure cleanup
  };

  // Improved audio recording function
  const startRecording = () => {
    console.log('▶️ Starting audio recording...');
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      console.log('⚠️ Already recording, no need to start again');
      return;
    }
    
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      })
      .then(stream => {
        console.log('🎙️ Got audio stream, creating MediaRecorder');
        
        // Check if MediaRecorder is supported
        if (typeof MediaRecorder === 'undefined') {
          console.error('❌ MediaRecorder not supported in this browser');
          alert('Audio recording is not supported in your browser. The interview will continue but without audio recording.');
          return;
        }
        
        try {
          // Try with common MIME types
          let options = { mimeType: 'audio/webm' };
          if (!MediaRecorder.isTypeSupported('audio/webm')) {
            console.log('⚠️ audio/webm not supported, trying audio/ogg');
            options = { mimeType: 'audio/ogg' };
            
            if (!MediaRecorder.isTypeSupported('audio/ogg')) {
              console.log('⚠️ audio/ogg not supported, using default');
              options = {};
            }
          }
          
          const mediaRecorder = new MediaRecorder(stream, options);
          mediaRecorderRef.current = mediaRecorder;
          
          const audioChunks = [];
          
          mediaRecorder.ondataavailable = (e) => {
            if (e.data && e.data.size > 0) {
              console.log(`🔊 Received audio chunk: ${e.data.size} bytes`);
              audioChunks.push(e.data);
            }
          };
          
          mediaRecorder.onstop = () => {
            console.log(`🔊 Recording stopped, processing ${audioChunks.length} chunks`);
            
            if (audioChunks.length === 0) {
              console.warn('⚠️ No audio data recorded');
              return;
            }
            
            const audioBlob = new Blob(audioChunks, { type: mediaRecorder.mimeType });
            console.log(`🔊 Created audio blob: ${audioBlob.size} bytes, type: ${audioBlob.type}`);
            
            const audioUrl = URL.createObjectURL(audioBlob);
            setAudioURL(audioUrl);
            
            // Save this recording in our blobs array for later
            setAudioBlobs(prev => {
              const newBlobs = [...prev];
              newBlobs[currentQuestionIndex] = {
                blob: audioBlob,
                url: audioUrl,
                mimeType: mediaRecorder.mimeType
              };
              return newBlobs;
            });
          };
          
          // Ensure we get data frequently
          mediaRecorder.start(1000); // Collect data every second
          console.log('▶️ MediaRecorder started');
          
          // Save the stream to stop tracks later
          setRecording(stream);
        } catch (err) {
          console.error('❌ Error creating MediaRecorder:', err);
          alert('There was a problem starting audio recording. The interview will continue but your audio might not be recorded.');
        }
      })
      .catch(error => {
        console.error('❌ Error accessing microphone:', error);
        
        if (error.name === 'NotAllowedError') {
          alert('Microphone access was denied. Please allow microphone access to record your answers.');
        } else if (error.name === 'NotFoundError') {
          alert('No microphone found. Please connect a microphone and try again.');
        } else {
          alert('Error accessing your microphone. The interview will continue without audio recording.');
        }
      });
    } else {
      console.error('❌ getUserMedia not supported in this browser');
      alert('Audio recording is not supported in your browser. You can still participate in the interview without audio recording.');
    }
  };
  
  // Stop audio recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    
    if (recording) {
      recording.getTracks().forEach(track => track.stop());
      setRecording(null);
    }
  };

  const handleBackClick = () => {
    router.push(`/dashboard/interview/${interviewId}`);
  };

  const enableWebcamAndMic = async () => {
    try {
      // Request both camera and microphone permissions
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setWebcamEnabled(true);
      setMicrophoneEnabled(true);
      
      // Clean up stream when component unmounts
      return () => {
        stream.getTracks().forEach(track => track.stop());
      };
    } catch (error) {
      console.error('Error accessing webcam and microphone:', error);
      alert('Please allow access to your camera and microphone to continue with the interview.');
    }
  };

  const startInterview = () => {
    if (webcamEnabled && microphoneEnabled) {
      setIsInterviewStarted(true);
      
      // Check if speech recognition is supported
      const speechRecognitionSupported = !!(window.SpeechRecognition || window.webkitSpeechRecognition);
      if (!speechRecognitionSupported) {
        alert('Speech recognition is not supported in your browser. You can still participate by typing your answers.');
      }
      
      // Automatically speak the first question
      setTimeout(() => {
        if (questions.length > 0) {
          const questionText = questions[currentQuestionIndex]?.question || 
                             questions[currentQuestionIndex]?.Question ||
                             "Tell me about yourself.";
          speakQuestion(questionText);
        }
      }, 1000);
    } else {
      alert('Please enable your webcam and microphone to start the interview.');
    }
  };

  const handleNextQuestion = () => {
    // Stop current listening/recording
    stopListening();
    
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prevIndex => {
        const newIndex = prevIndex + 1;
        
        // Reset user answer for the new question
        setUserAnswer('');
        
        // IMPORTANT: Completely reset speech recognition to avoid carrying over old contexts
        setTimeout(() => {
          // Reset speech recognition completely to avoid context bleed
          if (speechRecognitionRef.current) {
            try {
              speechRecognitionRef.current.abort();
            } catch (e) {
              console.error('Error aborting speech recognition:', e);
            }
            speechRecognitionRef.current = null;
            resetSpeechRecognition();
          }
          
          // Start speaking the next question after a short delay
          setTimeout(() => {
            const questionText = questions[newIndex]?.question || 
                               questions[newIndex]?.Question ||
                               "Next question.";
            speakQuestion(questionText);
          }, 500);
        }, 500);
        
        return newIndex;
      });
    } else {
      // Interview finished - generate feedback
      generateFeedback();
    }
  };
  
  // Enhance the feedback generation logic to be more accurate
  const generateFeedback = async () => {
    try {
      // Fetch the original questions with answers for feedback
      const originalResponses = await fetch(`/api/questionanswer?mockId=${interviewId}`);
      const responseData = await originalResponses.json();
      let expectedAnswers = [];
      let originalQuestions = [];
      
      if (Array.isArray(responseData)) {
        expectedAnswers = responseData.map(item => item.answer || item.Answer || '');
        originalQuestions = responseData.map(item => item.question || item.Question || '');
      } else if (responseData.questions && Array.isArray(responseData.questions)) {
        expectedAnswers = responseData.questions.map(item => item.answer || item.Answer || '');
        originalQuestions = responseData.questions.map(item => item.question || item.Question || '');
      }
      
      // Prepare the feedback data
      const feedbackData = questions.map((q, index) => {
        const questionText = originalQuestions[index] || q.question || q.Question || '';
        const expectedAnswer = expectedAnswers[index] || '';
        const userAnswerText = answers[index] || '';
        
        return {
          question: questionText,
          expectedAnswer,
          userAnswer: userAnswerText
        };
      });
      
      // For each question, generate feedback with a more sophisticated comparison algorithm
      const questionFeedbacks = feedbackData.map((item, index) => {
        // More sophisticated scoring algorithm
        const expectedAnswer = item.expectedAnswer.toLowerCase();
        const userAnswer = item.userAnswer.toLowerCase();
        
        // Break down into key concepts
        const expectedKeywords = new Set(
          expectedAnswer
            .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
            .split(/\s+/)
            .filter(word => word.length > 3 && !['this', 'that', 'with', 'from', 'about', 'would', 'should', 'could', 'their', 'there'].includes(word))
        );
        
        const userKeywords = new Set(
          userAnswer
            .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
            .split(/\s+/)
            .filter(word => word.length > 3 && !['this', 'that', 'with', 'from', 'about', 'would', 'should', 'could', 'their', 'there'].includes(word))
        );
        
        // Count matching keywords
        let matchCount = 0;
        expectedKeywords.forEach(keyword => {
          if (userKeywords.has(keyword)) {
            matchCount++;
          } else {
            // Check for similar words (allowing for minor typos)
            for (const userWord of userKeywords) {
              if (levenshteinDistance(keyword, userWord) <= 2) { // Allow 2 character differences
                matchCount += 0.5; // Partial match
                break;
              }
            }
          }
        });
        
        // Check for phrases (2-3 consecutive words)
        const expectedPhrases = getPhrasesFromText(expectedAnswer, 3);
        const userPhrases = getPhrasesFromText(userAnswer, 3);
        
        let phraseMatchCount = 0;
        expectedPhrases.forEach(phrase => {
          if (userPhrases.has(phrase)) {
            phraseMatchCount++;
          }
        });
        
        // Calculate weighted score (0-100)
        let score = 0;
        const keywordWeight = 0.7;
        const phraseWeight = 0.3;
        
        if (expectedKeywords.size > 0) {
          const keywordScore = (matchCount / expectedKeywords.size) * 100;
          const phraseScore = expectedPhrases.size > 0 
            ? (phraseMatchCount / expectedPhrases.size) * 100 
            : 0;
            
          score = Math.round((keywordScore * keywordWeight) + (phraseScore * phraseWeight));
        }
        
        // Cap score at 100
        score = Math.min(100, score);
        
        // Generate feedback based on score
        let feedbackText = '';
        let missedPoints = [];
        
        // Find key points that were missed
        expectedKeywords.forEach(keyword => {
          if (!userKeywords.has(keyword)) {
            // Check if any similar word exists
            let found = false;
            for (const userWord of userKeywords) {
              if (levenshteinDistance(keyword, userWord) <= 2) {
                found = true;
                break;
              }
            }
            
            if (!found) {
              missedPoints.push(keyword);
            }
          }
        });
        
        // Limit to top 5 missed points
        missedPoints = missedPoints.slice(0, 5);
        
        if (score >= 80) {
          feedbackText = "Excellent answer! You covered most of the key points.";
        } else if (score >= 60) {
          feedbackText = `Good answer. You mentioned some important points, but could have expanded on: ${missedPoints.join(', ')}.`;
        } else if (score >= 40) {
          feedbackText = `Adequate answer, but you missed several key points including: ${missedPoints.join(', ')}.`;
        } else {
          feedbackText = `Your answer could use improvement. Try to include these key points in your answer: ${missedPoints.join(', ')}.`;
        }
        
        return {
          question: item.question,
          score,
          feedback: feedbackText,
          userAnswer: item.userAnswer,
          expectedAnswer: item.expectedAnswer
        };
      });
      
      // Calculate overall score
      const totalScore = questionFeedbacks.reduce((sum, item) => sum + item.score, 0);
      const avgScore = Math.round(totalScore / questionFeedbacks.length);
      
      // Generate overall feedback
      let overallFeedbackText = '';
      if (avgScore >= 80) {
        overallFeedbackText = "Excellent interview! You demonstrated strong knowledge and communication skills.";
      } else if (avgScore >= 60) {
        overallFeedbackText = "Good interview. You showed decent knowledge but could improve in some areas.";
      } else if (avgScore >= 40) {
        overallFeedbackText = "You performed adequately but need to work on your answers and preparation.";
      } else {
        overallFeedbackText = "You need significant improvement in your interview skills and knowledge.";
      }
      
      // Set the feedback
      setFeedback(questionFeedbacks);
      setOverallFeedback(overallFeedbackText);
      setAverageScore(avgScore);
      
      // Show results
      setShowResults(true);
    } catch (error) {
      console.error('Error generating feedback:', error);
      alert('Failed to generate feedback. Please try again.');
    }
  };
  
  // Helper function for text similarity comparison
  const levenshteinDistance = (a, b) => {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;
    
    const matrix = Array(a.length + 1).fill().map(() => Array(b.length + 1).fill(0));
    
    for (let i = 0; i <= a.length; i++) {
      matrix[i][0] = i;
    }
    
    for (let j = 0; j <= b.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + cost
        );
      }
    }
    
    return matrix[a.length][b.length];
  };
  
  // Helper function to extract phrases from text
  const getPhrasesFromText = (text, phraseLength = 3) => {
    const words = text
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
      .toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 1);
      
    const phrases = new Set();
    for (let i = 0; i <= words.length - phraseLength; i++) {
      phrases.add(words.slice(i, i + phraseLength).join(' '));
    }
    
    return phrases;
  };

  const finishInterview = () => {
    // Save interview results then return to dashboard
    router.push(`/dashboard/interview/${interviewId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto px-4 py-12">
          <div className="flex justify-center items-center h-72">
            <div className="animate-pulse flex flex-col items-center">
              <div className="h-16 w-16 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 mb-6 shadow-lg"></div>
              <div className="h-5 w-48 bg-gradient-to-r from-blue-300 to-indigo-400 rounded-md mb-3 shadow"></div>
              <div className="h-4 w-36 bg-gradient-to-r from-blue-200 to-indigo-300 rounded-md shadow"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (errorMessage || !interview) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl overflow-hidden transition-all">
            <div className="p-8">
              <div className="flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-500 drop-shadow-md" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-center text-red-600 mb-3">Error</h2>
              <p className="text-gray-600 text-center mb-8 text-lg">{errorMessage || 'Interview not found or has been deleted.'}</p>
              <div className="flex justify-center">
                <button 
                  onClick={() => router.push('/dashboard/interview')}
                  className="px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 shadow-lg transform hover:-translate-y-1 font-medium"
                >
                  Back to Interviews
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
              <div className="p-8">
                <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">Interview Results</h1>
                
                <div className="mb-12">
                  <div className="flex justify-center mb-6">
                    <div className="relative w-40 h-40">
                      <svg viewBox="0 0 36 36" className="w-40 h-40 stroke-current drop-shadow-md">
                        <path
                          className="text-gray-200"
                          strokeWidth="2.5"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <path
                          className={`${
                            averageScore >= 80 ? 'text-emerald-500' : 
                            averageScore >= 60 ? 'text-blue-500' : 
                            averageScore >= 40 ? 'text-amber-500' : 'text-rose-500'
                          }`}
                          strokeWidth="2.5"
                          fill="none"
                          strokeDasharray={`${averageScore}, 100`}
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-4xl font-bold">{averageScore}%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className={`p-7 rounded-xl mb-8 text-center shadow-md ${
                    averageScore >= 80 ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' : 
                    averageScore >= 60 ? 'bg-blue-50 text-blue-800 border border-blue-100' : 
                    averageScore >= 40 ? 'bg-amber-50 text-amber-800 border border-amber-100' : 'bg-rose-50 text-rose-800 border border-rose-100'
                  }`}>
                    <h2 className="text-2xl font-semibold mb-3">Overall Feedback</h2>
                    <p className="text-lg">{overallFeedback}</p>
                  </div>
                </div>
                
                <div className="space-y-8">
                  <h2 className="text-2xl font-semibold mb-6 text-gray-800 border-b pb-2">Question-by-Question Feedback</h2>
                  
                  {feedback.map((item, index) => (
                    <div key={index} className="border rounded-xl overflow-hidden mb-6 shadow-md transition-all hover:shadow-lg">
                      <div className="bg-gray-50 p-5 border-b">
                        <div className="flex justify-between items-start">
                          <h3 className="font-medium text-gray-900 text-lg">Question {index + 1}</h3>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            item.score >= 80 ? 'bg-emerald-100 text-emerald-800' : 
                            item.score >= 60 ? 'bg-blue-100 text-blue-800' : 
                            item.score >= 40 ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {item.score}%
                          </span>
                        </div>
                        <p className="mt-2 text-gray-700 text-lg">{item.question}</p>
                      </div>
                      
                      <div className="p-5">
                        <div className="mb-5">
                          <h4 className="text-base font-medium text-gray-900 mb-2">Your Answer:</h4>
                          <p className="text-gray-700 bg-gray-50 p-4 rounded-lg border border-gray-100">{item.userAnswer || '(No answer provided)'}</p>
                        </div>
                        
                        <div className="mb-5">
                          <h4 className="text-base font-medium text-gray-900 mb-2">Model Answer:</h4>
                          <p className="text-gray-700 bg-blue-50 p-4 rounded-lg border border-blue-100">{item.expectedAnswer}</p>
                        </div>
                        
                        <div>
                          <h4 className="text-base font-medium text-gray-900 mb-2">Feedback:</h4>
                          <p className={`p-4 rounded-lg ${
                            item.score >= 80 ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' : 
                            item.score >= 60 ? 'bg-blue-50 text-blue-800 border border-blue-100' : 
                            item.score >= 40 ? 'bg-amber-50 text-amber-800 border border-amber-100' : 'bg-rose-50 text-rose-800 border border-rose-100'
                          }`}>
                            {item.feedback}
                          </p>
                        </div>
                        
                        {audioBlobs[index] && (
                          <div className="mt-5">
                            <h4 className="text-base font-medium text-gray-900 mb-2">Your Recording:</h4>
                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                              <audio src={audioBlobs[index].url || audioBlobs[index]} controls className="w-full" />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-12 flex justify-center">
                  <button
                    onClick={finishInterview}
                    className="px-8 py-3.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 text-lg"
                  >
                    Return to Dashboard
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isInterviewStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto px-4 py-10">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center mb-8">
              <Link href="/dashboard" className="text-indigo-600 hover:text-indigo-800 flex items-center transition-colors font-medium">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                Back to Dashboard
              </Link>
            </div>
            
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden transition-all hover:shadow-2xl">
              <div className="p-8">
                <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">Let's Get Started</h1>
                
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-10 border border-blue-100 shadow-inner">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Interview Details
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="mb-2">
                      <div className="text-sm font-medium text-gray-500 mb-1">Job Role/Position:</div>
                      <div className="text-indigo-700 font-semibold text-lg">{interview.jobPosition}</div>
                    </div>
                    <div className="mb-2">
                      <div className="text-sm font-medium text-gray-500 mb-1">Years of Experience:</div>
                      <div className="text-indigo-700 font-semibold text-lg">{interview.jobExperience} years</div>
                    </div>
                  </div>
                  <div className="mb-4 mt-2">
                    <div className="text-sm font-medium text-gray-500 mb-1">Job Description/Tech Stack:</div>
                    <div className="text-gray-700 leading-relaxed">{interview.jobDesc}</div>
                  </div>
                  <div className="flex items-center mt-4">
                    <div className="flex items-center mr-6">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-gray-700 font-medium">{questions.length} questions</span>
                    </div>
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-gray-700 font-medium">Est. 15-20 minutes</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-amber-50 border-l-4 border-amber-400 p-5 mb-10 rounded-r-xl shadow-md">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-amber-700 font-medium mb-1">Important Information</p>
                      <p className="text-amber-700">
                        Enable Video Web Cam and Microphone to start your AI-generated mock interview. You will answer {questions.length} questions, and you'll get feedback at the end. We never record your video—web cam access can be disabled at any time.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-center mb-10">
                  <div className="w-80 h-80 bg-gray-900 rounded-xl flex items-center justify-center overflow-hidden relative shadow-2xl">
                    {webcamEnabled ? (
                      <Webcam
                        ref={webcamRef}
                        audio={microphoneEnabled}
                        mirrored={true}
                        className="min-w-full min-h-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-gray-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        <p className="text-gray-400 text-lg">Camera not enabled</p>
                      </div>
                    )}
                    
                    {webcamEnabled && (
                      <div className="absolute bottom-4 right-4 flex space-x-2">
                        <div className="px-2 py-1 bg-black bg-opacity-50 rounded-md flex items-center">
                          <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse mr-1.5"></div>
                          <span className="text-white text-xs">LIVE</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col gap-4">
                  {!webcamEnabled || !microphoneEnabled ? (
                    <button
                      onClick={enableWebcamAndMic}
                      className="w-full py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 shadow-lg transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 flex items-center justify-center font-medium text-lg"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Enable Web Cam and Microphone
                    </button>
                  ) : (
                    <button
                      onClick={startInterview}
                      className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 shadow-lg transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 flex items-center justify-center font-medium text-lg"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                      </svg>
                      Start Interview
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Interview in progress
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-10">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6 transition-all">
            <div className="p-7">
              <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold text-gray-800">Interview in Progress</h1>
                <div className="flex space-x-3">
                  <span className={`bg-gradient-to-r ${isListening ? 'from-green-100 to-green-200 text-green-800' : 'from-gray-100 to-gray-200 text-gray-700'} text-sm font-semibold px-3 py-1.5 rounded-full flex items-center shadow-sm ${recording ? 'animate-pulse' : ''}`}>
                    <span className={`w-2.5 h-2.5 ${isListening ? 'bg-green-500' : 'bg-gray-400'} rounded-full mr-1.5`}></span>
                    {isListening ? 'Listening' : 'Ready'}
                  </span>
                  {isSpeaking && (
                    <span className="bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 text-sm font-semibold px-3 py-1.5 rounded-full flex items-center shadow-sm animate-pulse">
                      <span className="w-2.5 h-2.5 bg-blue-500 rounded-full mr-1.5"></span>
                      Speaking
                    </span>
                  )}
                </div>
              </div>
              
              <div className="mb-5 bg-gray-50 rounded-xl py-3 px-5 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-gray-600">Progress</span>
                  <span className="text-sm font-medium text-indigo-700">{currentQuestionIndex + 1} of {questions.length}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 h-3 rounded-full transition-all duration-500" 
                    style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-7 mb-7">
                <div className="bg-white rounded-xl overflow-hidden shadow-md border border-gray-100 transition-all hover:shadow-lg">
                  <div className="p-5 bg-gradient-to-r from-indigo-50 to-blue-50 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="font-semibold text-indigo-900 text-lg">Question {currentQuestionIndex + 1}</h2>
                    <button 
                      onClick={() => speakQuestion(questions[currentQuestionIndex]?.question || questions[currentQuestionIndex]?.Question)}
                      className="text-indigo-600 hover:text-indigo-800 transition-colors p-1.5 rounded-full hover:bg-indigo-100"
                      title="Read Question Again"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                  <div className="p-5">
                    <p className="text-xl text-gray-800 leading-relaxed">{questions[currentQuestionIndex]?.question || questions[currentQuestionIndex]?.Question}</p>
                  </div>
                  
                  <div className="p-5 border-t border-gray-100 bg-gray-50">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Recording Status:</h3>
                    <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-center shadow-inner">
                      {isListening ? (
                        <div className="flex flex-col items-center">
                          <div className="flex justify-center space-x-1 mb-3">
                            <div className="w-1 h-8 bg-indigo-500 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-1 h-14 bg-indigo-600 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                            <div className="w-1 h-6 bg-indigo-400 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }}></div>
                            <div className="w-1 h-10 bg-indigo-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                            <div className="w-1 h-8 bg-indigo-600 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                            <div className="w-1 h-4 bg-indigo-400 rounded-full animate-pulse" style={{ animationDelay: '0.6s' }}></div>
                            <div className="w-1 h-12 bg-indigo-500 rounded-full animate-pulse" style={{ animationDelay: '0.7s' }}></div>
                          </div>
                          <p className="text-base text-indigo-700 font-medium">Recording your answer...</p>
                          <p className="text-xs text-gray-500 mt-1">Speech is being processed in the background</p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 016 0v6a3 3 0 01-3 3z" />
                          </svg>
                          <p className="text-gray-500">Click "Start Recording" to answer</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Manual text input for answer */}
                  <div className="p-5 border-t border-gray-100 bg-gray-50">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Type your answer:</h3>
                    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-inner">
                      <textarea
                        className="w-full min-h-[120px] p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-none"
                        placeholder="You can type your answer here if voice recording isn't working..."
                        value={userAnswer}
                        onChange={(e) => {
                          const text = e.target.value;
                          setUserAnswer(text);
                          setAnswers(prevAnswers => {
                            const newAnswers = [...prevAnswers];
                            newAnswers[currentQuestionIndex] = text;
                            return newAnswers;
                          });
                        }}
                      ></textarea>
                    </div>
                  </div>
                </div>
                
                <div>
                  <div className="aspect-w-16 aspect-h-9 bg-black mb-5 rounded-xl overflow-hidden shadow-xl">
                    {webcamEnabled && (
                      <Webcam
                        ref={webcamRef}
                        audio={microphoneEnabled}
                        mirrored={true}
                        className="min-w-full min-h-full object-cover"
                      />
                    )}
                    <div className="absolute top-3 right-3 bg-red-600 text-white text-xs px-2 py-1 rounded-md flex items-center shadow-md">
                      <span className="animate-pulse mr-1.5">●</span> REC
                    </div>
                  </div>
                  <div className="flex space-x-3">
                    {isListening ? (
                      <button
                        onClick={stopListening}
                        className="flex-1 py-3.5 bg-gradient-to-r from-rose-500 to-red-600 text-white rounded-xl hover:from-rose-600 hover:to-red-700 transition-all duration-300 shadow-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 flex items-center justify-center font-medium"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        Stop Recording
                      </button>
                    ) : (
                      <button
                        onClick={startListening}
                        className="flex-1 py-3.5 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all duration-300 shadow-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 flex items-center justify-center font-medium"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                        </svg>
                        Start Recording
                      </button>
                    )}
                    
                    <button
                      onClick={handleNextQuestion}
                      className="flex-1 py-3.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 flex items-center justify-center font-medium"
                    >
                      {currentQuestionIndex < questions.length - 1 ? (
                        <>
                          Next Question
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                        </>
                      ) : (
                        <>
                          Finish Interview
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="mt-5 text-center bg-blue-50 p-4 rounded-xl border border-blue-100 shadow-sm">
                <p className="mb-1 text-blue-800 font-medium">Speak clearly and take your time to answer.</p>
                <p className="text-blue-700 text-sm">Your answer is being processed in the background. You'll receive detailed feedback at the end of the interview.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 