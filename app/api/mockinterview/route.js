import { NextResponse } from 'next/server';
import { MockInterview } from '@/util/schema';
import { connect } from '@/util/db';
import { QuestionAnswer } from '@/util/schema';

export async function POST(request) {
  try {
    // Connect to the database
    await connect();
    
    // Parse the request body
    const body = await request.json();
    
    // Validate required fields
    const { jsonMockResp, jobPosition, jobDesc, jobExperience, createdBy, mockId } = body;
    
    if (!jsonMockResp || !jobPosition || !jobDesc || !jobExperience || !mockId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Create a new mock interview document
    const newMockInterview = new MockInterview({
      jsonMockResp,
      jobPosition,
      jobDesc,
      jobExperience,
      createdBy: createdBy || 'anonymous',
      mockId
    });
    
    // Save to database
    await newMockInterview.save();
    
    // Return success response
    return NextResponse.json(
      { success: true, message: 'Mock interview saved successfully', mockId },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error saving mock interview:', error);
    
    // Check if it's a MongoDB connection error
    if (error.message && error.message.includes('ECONNREFUSED')) {
      return NextResponse.json(
        { 
          error: 'Database connection error', 
          details: 'Could not connect to MongoDB. Please make sure MongoDB is running on your system.',
          originalError: error.message 
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to save mock interview', details: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    // Connect to the database
    await connect();
    
    // Get the search params from the URL
    const { searchParams } = new URL(request.url);
    const mockId = searchParams.get('mockId');
    const userId = searchParams.get('createdBy');
    
    let query = {};
    
    // If mockId is provided, filter by mockId
    if (mockId) {
      query.mockId = mockId;
    }
    
    // If userId is provided, filter by createdBy
    if (userId) {
      query.createdBy = userId;
    }
    
    // Find mock interviews based on the query
    const mockInterviews = await MockInterview.find(query).sort({ createdAt: -1 });
    
    // Return the mock interviews wrapped in an interviews array
    return NextResponse.json({ 
      interviews: mockInterviews,
      success: true
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching mock interviews:', error);
    
    // Check if it's a MongoDB connection error
    if (error.message && error.message.includes('ECONNREFUSED')) {
      return NextResponse.json(
        { 
          error: 'Database connection error', 
          details: 'Could not connect to MongoDB. Please make sure MongoDB is running on your system.',
          originalError: error.message,
          interviews: []
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch mock interviews', 
        details: error.message,
        interviews: []
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    // Connect to the database
    await connect();
    
    // Get mockId from query parameters
    const { searchParams } = new URL(request.url);
    const mockId = searchParams.get('mockId');
    
    if (!mockId) {
      return NextResponse.json(
        { error: 'mockId is required', success: false },
        { status: 400 }
      );
    }
    
    // Delete the interview
    const deleteResult = await MockInterview.deleteOne({ mockId });
    
    // Also delete associated questions
    const questionDeleteResult = await QuestionAnswer.deleteMany({ mockId });
    
    if (deleteResult.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Interview not found', success: false },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { 
        success: true, 
        message: 'Interview deleted successfully',
        deletedQuestions: questionDeleteResult.deletedCount
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting interview:', error);
    
    return NextResponse.json(
      { error: 'Failed to delete interview', details: error.message, success: false },
      { status: 500 }
    );
  }
}