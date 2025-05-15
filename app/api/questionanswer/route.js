import { connect } from '@/util/db';
import { QuestionAnswer, MockInterview } from '@/util/schema';
import { NextResponse } from 'next/server';

export async function POST(req) {
  await connect();
  try {
    const body = await req.json();
    const { question, answer, mockId } = body;
    if (!question || !answer || !mockId) {
      return new Response(JSON.stringify({ error: 'Question, answer, and mockId are required.' }), { status: 400 });
    }
    const qa = await QuestionAnswer.create({ question, answer, mockId });
    return new Response(JSON.stringify({ success: true, data: qa }), { status: 201 });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Failed to save question and answer.' }), { status: 500 });
  }
}

export async function GET(request) {
  try {
    // Connect to the database
    await connect();
    
    // Get the search params from the URL
    const { searchParams } = new URL(request.url);
    const mockId = searchParams.get('mockId');
    
    if (!mockId) {
      return NextResponse.json(
        { error: 'mockId is required', questions: [], success: false },
        { status: 400 }
      );
    }
    
    // First, get the interview details to check experience level
    const interviewData = await MockInterview.findOne({ mockId }).lean();
    
    if (!interviewData) {
      return NextResponse.json({ 
        success: false,
        questions: [],
        message: 'Interview not found'
      }, { status: 404 });
    }
    
    const experienceYears = parseInt(interviewData.jobExperience, 10) || 0;
    console.log(`Fetching questions for mockId: ${mockId}, Experience level: ${experienceYears} years`);
    
    // Find questions for the specified mockId with lean() for better performance
    // Selecting only necessary fields
    const questionsData = await QuestionAnswer.find(
      { mockId }, 
      'question answer createdAt mockId'
    ).lean().sort({ createdAt: 1 });
    
    if (!questionsData || questionsData.length === 0) {
      // Return empty questions array if no questions found
      return NextResponse.json({ 
        success: true,
        questions: [],
        message: 'No questions found for this interview'
      }, { status: 200 });
    }
    
    // Process questions for appropriate experience level
    const processedQuestions = questionsData.map(q => {
      // Return question but ensure the complexity matches the experience level
      // This adds appropriate context to existing questions if needed
      const question = adjustQuestionForExperience(q.question, experienceYears);
      const answer = q.answer;
      
      return {
        ...q,
        question,
        answer
      };
    });
    
    // Return the questions - ensure they're valid
    return NextResponse.json({ 
      success: true,
      questions: processedQuestions,
      count: processedQuestions.length,
      experienceLevel: experienceYears
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching questions:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch questions', 
        details: error.message,
        questions: [],
        success: false
      },
      { status: 500 }
    );
  }
}

// Helper function to adjust questions for experience level
function adjustQuestionForExperience(question, years) {
  // Don't modify if already formatted for experience level
  if (question.includes('junior developer') || 
      question.includes('mid-level developer') || 
      question.includes('senior developer') || 
      question.includes('technical lead')) {
    return question;
  }
  
  // Determine experience level prefix based on years
  let prefix = '';
  if (years < 3) {
    prefix = 'For a junior developer, ';
    // For beginners, simplify complex questions
    question = question.replace('advanced', 'basic')
                      .replace('complex', 'straightforward')
                      .replace('in-depth', 'fundamental');
  } else if (years < 6) {
    prefix = 'As a mid-level developer, ';
  } else if (years < 11) {
    prefix = 'As a senior developer, ';
    // Make questions more challenging for senior developers
    question = question.replace('explain', 'explain in detail')
                      .replace('handle', 'optimize')
                      .replace('implement', 'architect');
  } else {
    prefix = 'As a technical lead or architect, ';
    // Focus on system design and architecture for experts
    question = question.replace('explain', 'explain the architectural implications of')
                      .replace('handle', 'design systems to handle')
                      .replace('implement', 'design and implement');
  }
  
  // Add prefix to question if not a direct question
  if (!question.startsWith('What') && !question.startsWith('How') && 
      !question.startsWith('Why') && !question.startsWith('Describe') && 
      !question.startsWith('Explain')) {
    // Make first character lowercase if adding prefix
    return prefix + question.charAt(0).toLowerCase() + question.slice(1);
  }
  
  return question;
}
