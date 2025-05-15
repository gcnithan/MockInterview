// To run this code you need to install the following dependencies:
// npm install @google/genai mime

import { GoogleGenAI } from "@google/genai";

// Expanded role-specific question templates
const roleSpecificTemplates = {
  // Frontend focused templates
  frontend: [
    { question: "Can you explain the virtual DOM concept in React and how it improves performance?", answer: "The virtual DOM is a lightweight copy of the actual DOM that React uses to optimize rendering. When state changes, React first updates the virtual DOM, compares it with the previous version (diffing), and then only applies the necessary changes to the real DOM. This process, called reconciliation, minimizes expensive DOM operations and improves performance." },
    { question: "How do you handle state management in large-scale frontend applications?", answer: "For large applications, I use a combination of local component state for UI-specific states and global state management libraries like Redux or Context API for application-wide states. I structure the state to minimize nesting, use selectors for derived data, and implement middleware for side effects. This approach helps maintain predictable state flow and improves maintainability." },
    { question: "Explain the concept of CSS-in-JS and when you would use it over traditional CSS approaches.", answer: "CSS-in-JS refers to styling approaches where CSS is written directly in JavaScript. Libraries like styled-components or Emotion enable component-scoped styling, dynamic styling based on props, and better encapsulation. I prefer CSS-in-JS when building component libraries or applications with highly dynamic styling needs, while I might use traditional CSS/SCSS for projects requiring strict design systems or better separation of concerns." }
  ],
  
  // Backend focused templates
  backend: [
    { question: "How would you design a system to handle millions of concurrent requests?", answer: "I would implement a layered architecture with horizontal scaling capabilities. This includes load balancers for distributing traffic, stateless application servers that can scale horizontally, caching layers using Redis/Memcached, database sharding and read replicas, and asynchronous processing for non-critical operations using message queues. I'd also implement circuit breakers and rate limiting to prevent cascading failures." },
    { question: "Explain your approach to database indexing and query optimization.", answer: "I start by identifying frequently used queries and access patterns. I create indexes on columns used in WHERE, JOIN, and ORDER BY clauses, carefully balancing between read performance and write overhead. I use EXPLAIN to analyze query execution plans, optimize joins to reduce table scans, and implement denormalization where appropriate. For complex systems, I consider implementing read replicas or CQRS patterns to separate read and write operations." },
    { question: "How do you ensure the security of API endpoints?", answer: "I implement multiple security layers including proper authentication (JWT/OAuth), authorization with role-based access control, input validation and sanitization, rate limiting to prevent abuse, HTTPS for transport security, and proper error handling that doesn't leak sensitive information. I also follow security best practices like preventing SQL injection, implementing CORS policies, and regular security audits." }
  ],
  
  // Full stack templates
  fullstack: [
    { question: "How do you approach the architecture of a full-stack application?", answer: "I design full-stack applications with clear separation between frontend and backend concerns. For the backend, I implement a layered architecture (controllers, services, data access) with well-defined API contracts. The frontend is structured using component-based architecture with proper state management. I ensure consistent error handling, logging, and monitoring across the stack, and implement CI/CD pipelines for automated testing and deployment." },
    { question: "Explain how you handle data consistency between frontend and backend.", answer: "I use a combination of approaches including strong typing with TypeScript or GraphQL schemas to ensure API contract consistency, implementing optimistic UI updates with proper rollback mechanisms, and leveraging caching strategies with invalidation policies. For real-time applications, I implement WebSockets or server-sent events with proper state reconciliation logic to handle conflicts." },
    { question: "How do you balance between implementing features on the frontend versus the backend?", answer: "I determine the appropriate location for features based on several factors: security requirements (sensitive operations belong on the backend), performance needs (computation-heavy tasks are better on the backend while UI responsiveness is handled on frontend), reusability (shared business logic belongs on the backend), and user experience requirements. I also consider offline capabilities and whether data needs to be pre-processed before presentation." }
  ],
  
  // DevOps focused templates
  devops: [
    { question: "Explain your approach to containerization and orchestration.", answer: "I use Docker for containerization to ensure consistency across environments and Kubernetes for orchestration in production. My containers follow the single responsibility principle, use multi-stage builds to minimize image size, and implement proper health checks. For Kubernetes, I organize resources using namespaces, implement auto-scaling based on metrics, use ConfigMaps and Secrets for configuration, and set up proper resource requests and limits." },
    { question: "How do you implement CI/CD pipelines for complex applications?", answer: "I design CI/CD pipelines with distinct stages: build (compiling code, running linters), test (unit, integration, and end-to-end tests), security scanning (SAST/DAST tools), artifact creation, deployment to staging, automated integration tests, and finally production deployment with strategies like blue-green or canary. I implement approval gates for critical environments and automated rollback mechanisms for failed deployments." },
    { question: "Describe your approach to monitoring and observability in production systems.", answer: "I implement a comprehensive observability strategy covering the three pillars: metrics (using Prometheus/Grafana for system and business metrics), logs (using ELK or similar stack with structured logging), and traces (using Jaeger/OpenTelemetry for distributed tracing). I set up alerting based on SLIs/SLOs, create dashboards for different stakeholders, and establish a clear incident response process. This helps with proactive issue detection and faster troubleshooting." }
  ],
  
  // Data science templates
  datascience: [
    { question: "How do you approach feature engineering and selection for machine learning models?", answer: "My approach to feature engineering starts with domain knowledge to create meaningful features, followed by statistical analysis to understand distributions and correlations. I use techniques like one-hot encoding for categorical variables, normalization/standardization for numerical features, and create interaction terms where appropriate. For feature selection, I employ methods like recursive feature elimination, LASSO regularization, or tree-based feature importance to identify the most predictive variables and reduce dimensionality." },
    { question: "Explain how you evaluate and improve model performance.", answer: "I use a comprehensive evaluation framework starting with appropriate metrics (accuracy, precision/recall, F1, AUC-ROC) based on the problem type. I implement cross-validation to ensure robustness, analyze confusion matrices to identify specific error patterns, and use learning curves to diagnose overfitting/underfitting. For improvement, I iterate through hyperparameter tuning, ensemble methods, feature engineering, and collecting more data for underrepresented classes or edge cases." },
    { question: "How do you deploy machine learning models to production?", answer: "I use a structured approach for ML deployment: containerizing models with Docker, implementing A/B testing frameworks to validate performance, setting up monitoring for both technical metrics (latency, throughput) and ML-specific metrics (prediction drift, feature distribution shifts). I design the system to allow for regular retraining with new data, implement feature stores for consistency, and use model versioning to enable rollbacks when necessary." }
  ],
  
  // Mobile development
  mobile: [
    { question: "How do you ensure performance in mobile applications?", answer: "I optimize mobile app performance through several strategies: efficient resource loading with lazy loading and image optimization, implementing proper caching strategies, minimizing network requests through batching and compression, optimizing UI rendering by flattening view hierarchies, using background threads for computational tasks, and implementing proper memory management to prevent leaks. I also use performance profiling tools regularly to identify and address bottlenecks." },
    { question: "Explain your approach to handling offline capabilities in mobile apps.", answer: "I implement offline functionality using a multi-layered approach: local storage (SQLite, Realm) for data persistence, implementing sync adapters that track changes made offline, conflict resolution strategies for handling concurrent updates, background sync when connectivity is restored, and clear UI indicators of offline status. I design the app architecture around these requirements using patterns like repository pattern to abstract data sources and provide a consistent interface regardless of connection status." },
    { question: "How do you handle cross-platform development challenges?", answer: "When developing cross-platform applications using frameworks like React Native or Flutter, I focus on creating abstraction layers for platform-specific code, implement responsive designs that adapt to different screen sizes, use platform detection for customizing behavior when necessary, and create separate native modules for functionality that requires deep platform integration. I maintain a comprehensive testing strategy across multiple devices to ensure consistent behavior and appearance." }
  ]
};

// Fallback question templates to use when API is rate limited
const fallbackTemplates = {
  technical: [
    { question: "What is your experience with [STACK]?", answer: "I have [EXP] years of experience with [STACK]. I've used it for building [TYPE] applications, focusing on [FEATURE] development." },
    { question: "How do you handle error handling in [STACK]?", answer: "In [STACK], I implement error handling using try-catch blocks, error boundary components, and logging. I ensure errors are properly reported and don't impact user experience." },
    { question: "Describe the architecture of a recent project you worked on using [STACK].", answer: "I built a [TYPE] application using [STACK] with a focus on scalability. The architecture included [COMPONENT] layers with clear separation of concerns." },
    { question: "What are the performance optimization techniques you've used in [STACK]?", answer: "For [STACK] applications, I've implemented code splitting, memoization, lazy loading, and optimized rendering cycles to improve performance." },
    { question: "How do you approach testing in [STACK]?", answer: "I use a combination of unit tests, integration tests, and end-to-end tests for [STACK] applications, ensuring at least 80% code coverage." }
  ],
  behavioral: [
    { question: "Describe a challenging situation you faced in your previous role and how you handled it.", answer: "In my previous position, I faced a tight deadline for a critical project. I organized the team, prioritized features, and communicated clearly with stakeholders to successfully deliver on time." },
    { question: "How do you handle disagreements with team members?", answer: "I focus on open communication and understanding different perspectives. I look for common ground and work toward solutions that satisfy all parties while keeping project goals in mind." },
    { question: "Tell me about a time you had to learn a new technology quickly.", answer: "When we needed to integrate a new framework into our project, I dedicated time to learning it through documentation, tutorials, and practice projects, becoming proficient within two weeks." }
  ]
};

// Add experience level differentiation to the question templates
const experienceLevelModifiers = {
  beginner: {
    level: "0-2",
    description: "beginner level",
    questionPrefix: "For a junior developer, ",
    complexity: "basic",
    focus: "fundamentals"
  },
  intermediate: {
    level: "3-5",
    description: "intermediate level",
    questionPrefix: "As a mid-level developer, ",
    complexity: "moderate",
    focus: "implementation and best practices"
  },
  advanced: {
    level: "6-10",
    description: "advanced level",
    questionPrefix: "As a senior developer, ",
    complexity: "complex",
    focus: "architecture and optimization"
  },
  expert: {
    level: "10+",
    description: "expert level",
    questionPrefix: "As a technical lead or architect, ",
    complexity: "expert",
    focus: "system design and technical leadership"
  }
};

export function createGeminiChatSession() {
  const ai = new GoogleGenAI({
    apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY,
  });
  // Update to use a stable model name 
  const model = "gemini-1.5-pro"; // Updated from the experimental version
  const config = {
    responseMimeType: "text/plain",
    safetySettings: [
      {
        category: "HARM_CATEGORY_HARASSMENT",
        threshold: "BLOCK_NONE"
      },
      {
        category: "HARM_CATEGORY_HATE_SPEECH",
        threshold: "BLOCK_NONE"
      },
      {
        category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
        threshold: "BLOCK_NONE"
      },
      {
        category: "HARM_CATEGORY_DANGEROUS_CONTENT",
        threshold: "BLOCK_NONE"
      }
    ]
  };

  async function sendMessage(messages) {
    try {
      // Check for API key first
      if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
        console.log("No Gemini API key found, using fallback question generator");
        return generateFallbackQuestions(messages);
      }

      // Enhance the prompt for more role-specific and experience-level appropriate questions
      if (messages.length > 0 && messages[0].role === "user") {
        const userMessage = messages[0].parts[0].text;
        if (userMessage.includes("interview question")) {
          // Extract job information
          const jobPosition = extractInfo(userMessage, "Job position:", ",") || "";
          const jobDesc = extractInfo(userMessage, "Job Description:", ",") || "";
          const expYears = extractInfo(userMessage, "Years of Experience:", ",") || "3";
          
          // Determine experience level
          let experienceLevel = "intermediate";
          const years = parseInt(expYears, 10);
          if (years < 3) {
            experienceLevel = "entry-level (0-2 years)";
          } else if (years < 6) {
            experienceLevel = "mid-level (3-5 years)";
          } else if (years < 11) {
            experienceLevel = "senior-level (6-10 years)";
          } else {
            experienceLevel = "expert/lead level (10+ years)";
          }
          
          // Extract any randomness parameters from the user prompt
          const randomSeed = extractInfo(userMessage, "Random Seed:", ",") || Math.floor(Math.random() * 10000);
          const timestamp = extractInfo(userMessage, "Current Time:", ",") || new Date().toISOString();
          
          // Enhance the prompt to specify role-specific technical questions with experience level
          const enhancedPrompt = `${userMessage}

Please create precise technical interview questions specifically for a ${jobPosition} position with ${expYears} years of experience working with: ${jobDesc}.

IMPORTANT GUIDELINES:
1. The questions must be appropriate for ${experienceLevel} engineers, with complexity and depth matching this experience level
2. Generate diverse and unique questions using randomness factors: seed=${randomSeed}, time=${timestamp}
3. Do not repeat common or standard questions - create novel, creative questions
4. Vary the question types (theoretical, practical, problem-solving, design)
5. Include scenario-based questions that reflect real challenges at this level
6. For ${expYears}+ years experience, include system design and architecture questions
7. Include questions about best practices, optimizations, and handling edge cases
8. Make different questions each time this prompt is run, even for the same role/experience

Format your response as a JSON array with Question and Answer fields.`;
          
          // Replace the original prompt with the enhanced one
          messages[0].parts[0].text = enhancedPrompt;
        }
      }
      
      // Try using the Gemini API with proper error handling
      try {
        console.log("Attempting to call Gemini API with model:", model);
        const response = await ai.models.generateContentStream({
          model,
          config,
          contents: messages,
        });
        
        let result = "";
        for await (const chunk of response) {
          result += chunk.text;
        }
        
        // Validate that we got a proper response
        if (!result || result.trim() === "") {
          console.log("Empty response from Gemini API, using fallback");
          return generateFallbackQuestions(messages);
        }
        
        console.log("Successfully received response from Gemini API");
        return result;
      } catch (apiError) {
        console.log("Gemini API request failed:", apiError);
        
        // Any API error, use the fallback
        console.log("Using fallback question generator due to API error");
        return generateFallbackQuestions(messages);
      }
    } catch (outerError) {
      console.log("Unexpected error in sendMessage:", outerError);
      
      // For any errors anywhere in the process, use the fallback
      return generateFallbackQuestions(messages);
    }
  }

  function generateFallbackQuestions(messages) {
    try {
      // Extract job details from the prompt
      const userMessage = messages.find(m => m.role === "user")?.parts[0]?.text || "";
      
      // Parse the job information
      const jobPosition = extractInfo(userMessage, "Job position:", ",") || "Software Developer";
      const jobDesc = extractInfo(userMessage, "Job Description:", ",") || "JavaScript, React";
      const expYears = parseInt(extractInfo(userMessage, "Years of Experience:", ",") || "3", 10);
      
      // Extract or generate randomness parameters
      const randomSeed = parseInt(extractInfo(userMessage, "Random Seed:", ",") || Date.now() % 10000, 10);
      const currentDate = new Date();
      
      // Use the randomSeed to create a simple pseudorandom number generator
      const seededRandom = () => {
        // Simple LCG random number generator with seed
        let seed = randomSeed;
        return function() {
          seed = (seed * 9301 + 49297) % 233280;
          return seed / 233280;
        }
      };
      
      const random = seededRandom();
      
      // Determine experience level based on years
      let experienceLevel;
      if (expYears < 3) {
        experienceLevel = experienceLevelModifiers.beginner;
      } else if (expYears < 6) {
        experienceLevel = experienceLevelModifiers.intermediate;
      } else if (expYears < 11) {
        experienceLevel = experienceLevelModifiers.advanced;
      } else {
        experienceLevel = experienceLevelModifiers.expert;
      }
      
      console.log(`Generating questions for experience level: ${experienceLevel.description} (${expYears} years), Random seed: ${randomSeed}`);
      
      // Always generate 5 questions, regardless of environment variable setting
      const numQuestions = 5;
      
      // Determine the role category based on job position and description
      const roleCategory = determineRoleCategory(jobPosition, jobDesc);
      console.log(`Determined role category: ${roleCategory}`);
      
      // Get role-specific templates if available
      const specificTemplates = roleSpecificTemplates[roleCategory] || [];
      
      // Create questions array
      const questions = [];
      
      // Add role-specific technical questions first (3 questions)
      const techQuestionsCount = Math.min(3, specificTemplates.length);
      
      for (let i = 0; i < techQuestionsCount; i++) {
        // Use random index based on seed to select question template
        const randomIndex = Math.floor(random() * specificTemplates.length);
        const template = specificTemplates[randomIndex];
        
        // Skip if we've already used this template
        if (questions.some(q => q.Question.includes(template.question.substring(0, 15)))) {
          continue;
        }
        
        // Create experience-level appropriate version of the question
        let question = template.question;
        let answer = template.answer;
        
        // For advanced/expert levels, make questions more challenging if possible
        if (experienceLevel === experienceLevelModifiers.advanced || 
            experienceLevel === experienceLevelModifiers.expert) {
          question = question.replace("Can you explain", "Explain in detail");
          question = question.replace("How do you", "What advanced strategies do you use to");
          question = question.replace("Explain", "Explain with specific examples");
          
          // Add complexity to answers for advanced/expert levels
          answer = answer.replace(
            "I use", 
            `At my ${experienceLevel.description} with ${expYears} years of experience, I use`
          );
        }
        
        // For beginners, simplify questions when needed
        if (experienceLevel === experienceLevelModifiers.beginner) {
          question = question.replace("in large-scale", "in small to medium-sized");
          question = question.replace("advanced", "basic");
          question = question.replace("complex", "straightforward");
          
          // Simplify answers for beginners
          answer = answer.replace(
            "I implement", 
            `As someone with ${expYears} years of experience, I focus on implementing`
          );
        }
        
        // Add experience level context to questions
        if (!question.includes(experienceLevel.questionPrefix)) {
          question = `${experienceLevel.questionPrefix}${question.charAt(0).toLowerCase()}${question.slice(1)}`;
        }
        
        questions.push({
          Question: question,
          Answer: answer
        });
      }
      
      // Add more technical questions if needed
      while (questions.length < 4) {
        const template = fallbackTemplates.technical[questions.length % fallbackTemplates.technical.length];
        const technologies = jobDesc.split(',').map(t => t.trim()).filter(t => t);
        const mainTech = technologies[0] || "programming";
        
        // Create a question specific to experience level
        let question = template.question.replace("[STACK]", mainTech);
        
        // Make question appropriate for experience level
        if (!question.includes(experienceLevel.questionPrefix)) {
          question = `${experienceLevel.questionPrefix}${question.charAt(0).toLowerCase()}${question.slice(1)}`;
        }
        
        // Add complexity keywords based on experience
        question = question.replace("handle", `handle ${experienceLevel.complexity}`);
        
        const answer = template.answer
          .replace(/\[STACK\]/g, mainTech)
          .replace(/\[EXP\]/g, expYears)
          .replace(/\[TYPE\]/g, experienceLevel.complexity)
          .replace(/\[FEATURE\]/g, experienceLevel.focus)
          .replace(/\[COMPONENT\]/g, `${experienceLevel.complexity} component-based`);
        
        questions.push({
          Question: question,
          Answer: answer
        });
      }
      
      // Add one behavioral question
      const behavioralQuestion = fallbackTemplates.behavioral[0].question;
      
      // Add experience-appropriate context to the behavioral question
      let modifiedBehavioralQuestion = behavioralQuestion;
      if (experienceLevel === experienceLevelModifiers.advanced || 
          experienceLevel === experienceLevelModifiers.expert) {
        modifiedBehavioralQuestion = behavioralQuestion.replace(
          "Describe a challenging situation", 
          "Describe a complex technical challenge or leadership situation"
        );
      }
      
      questions.push({
        Question: modifiedBehavioralQuestion,
        Answer: fallbackTemplates.behavioral[0].answer
      });
      
      console.log(`Generated ${questions.length} experience-appropriate questions (${expYears} years) with role-specific focus for ${roleCategory}`);
      
      // Return formatted JSON that matches what the application expects
      return JSON.stringify(questions);
    } catch (err) {
      console.error("Error in fallback generator:", err);
      // Return 5 minimal valid questions as fallback
      return JSON.stringify([
        {
          Question: "Tell me about your experience with software development",
          Answer: "I have experience building applications using modern frameworks and tools, focusing on creating maintainable and scalable code."
        },
        {
          Question: "How do you handle challenging situations?",
          Answer: "I approach challenges methodically, breaking them down into manageable parts, researching solutions, and collaborating with team members when needed."
        },
        {
          Question: "What is your greatest professional achievement?",
          Answer: "My greatest achievement was leading a project that delivered a critical application on time and under budget, resulting in a 20% increase in efficiency for the business process it supported."
        },
        {
          Question: "How do you stay updated with industry trends?",
          Answer: "I regularly read industry publications, participate in online communities, attend webinars and conferences, and experiment with new technologies through side projects."
        },
        {
          Question: "Describe your ideal work environment",
          Answer: "My ideal work environment is collaborative, focused on continuous learning, and values both technical excellence and effective communication. I thrive in settings that balance autonomy with teamwork."
        }
      ]);
    }
  }
  
  function determineRoleCategory(jobPosition, jobDesc) {
    const position = jobPosition.toLowerCase();
    const desc = jobDesc.toLowerCase();
    
    // Check for frontend indicators
    if (
      position.includes("frontend") || 
      position.includes("front-end") ||
      position.includes("ui developer") ||
      (desc.includes("react") || desc.includes("vue") || desc.includes("angular") || desc.includes("javascript") || desc.includes("typescript")) && 
      !(desc.includes("node") || desc.includes("express") || desc.includes("django") || desc.includes("spring"))
    ) {
      return "frontend";
    }
    
    // Check for backend indicators
    if (
      position.includes("backend") || 
      position.includes("back-end") ||
      position.includes("server") ||
      desc.includes("node") || desc.includes("express") || desc.includes("django") || desc.includes("spring") || 
      desc.includes("database") || desc.includes("api") || desc.includes("microservice")
    ) {
      return "backend";
    }
    
    // Check for fullstack indicators
    if (
      position.includes("fullstack") || 
      position.includes("full stack") ||
      position.includes("full-stack") ||
      (
        (desc.includes("react") || desc.includes("vue") || desc.includes("angular") || desc.includes("javascript")) &&
        (desc.includes("node") || desc.includes("express") || desc.includes("django") || desc.includes("spring"))
      )
    ) {
      return "fullstack";
    }
    
    // Check for devops indicators
    if (
      position.includes("devops") || 
      position.includes("sre") || 
      position.includes("site reliability") ||
      position.includes("cloud") ||
      desc.includes("kubernetes") || desc.includes("docker") || desc.includes("aws") || 
      desc.includes("azure") || desc.includes("gcp") || desc.includes("ci/cd") || desc.includes("terraform")
    ) {
      return "devops";
    }
    
    // Check for data science indicators
    if (
      position.includes("data") || 
      position.includes("machine learning") || 
      position.includes("ai") ||
      position.includes("ml") ||
      desc.includes("python") || desc.includes("tensorflow") || desc.includes("pytorch") || 
      desc.includes("data science") || desc.includes("statistics") || desc.includes("analytics")
    ) {
      return "datascience";
    }
    
    // Check for mobile indicators
    if (
      position.includes("mobile") || 
      position.includes("ios") || 
      position.includes("android") ||
      position.includes("app developer") ||
      desc.includes("swift") || desc.includes("kotlin") || desc.includes("flutter") || 
      desc.includes("react native") || desc.includes("ios") || desc.includes("android")
    ) {
      return "mobile";
    }
    
    // Default to fullstack if no specific category is matched
    return "fullstack";
  }
  
  function extractInfo(text, startMarker, endMarker) {
    const startIndex = text.indexOf(startMarker);
    if (startIndex === -1) return null;
    
    const valueStartIndex = startIndex + startMarker.length;
    const endIndex = text.indexOf(endMarker, valueStartIndex);
    
    if (endIndex === -1) {
      return text.substring(valueStartIndex).trim();
    }
    
    return text.substring(valueStartIndex, endIndex).trim();
  }

  return { sendMessage };
}
