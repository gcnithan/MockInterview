import mongoose from 'mongoose';

const mockInterviewSchema = new mongoose.Schema({
    jsonMockResp: {
        type: String,
        required: true
    },
    jobPosition: {
        type: String,
        required: true
    },
    jobDesc: {
        type: String,
        required: true
    },
    jobExperience: {
        type: String,
        required: true
    },
    createdBy: {
        type: String,
        required: true
    },
    createdAt: {
        type: String
    },
    mockId: {
        type: String,
        required: true
    }
}, {
    timestamps: true // This will automatically add createdAt and updatedAt fields
});

// Create the model if it doesn't exist, otherwise use the existing one
const MockInterview = mongoose.models.MockInterview || mongoose.model('MockInterview', mockInterviewSchema);

const questionAnswerSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true
    },
    answer: {
        type: String,
        required: true
    },
    mockId: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const QuestionAnswer = mongoose.models.QuestionAnswer || mongoose.model('QuestionAnswer', questionAnswerSchema);

export { MockInterview, QuestionAnswer };