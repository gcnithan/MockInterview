'use client';
import { useState, useEffect, useMemo, Fragment } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '@/app/components/Header';

// Top 10 most important technical interview questions
const topTechnicalQuestions = [
  {
    id: "top-1",
    question: "What is the time and space complexity of common operations in arrays, linked lists, hash tables, and binary search trees?",
    answer: "Arrays: Access O(1), Search O(n), Insert/Delete O(n). Linked Lists: Access O(n), Search O(n), Insert/Delete at known position O(1). Hash Tables: Access/Insert/Delete/Search average O(1), worst O(n). BST: All operations average O(log n), worst O(n).",
    category: "Data Structures",
    difficulty: "Intermediate"
  },
  {
    id: "top-2",
    question: "Explain the differences between REST and GraphQL APIs.",
    answer: "REST uses multiple endpoints for different resources with fixed data structures, while GraphQL uses a single endpoint where clients can specify exactly what data they need. REST may lead to over-fetching or under-fetching of data, while GraphQL provides precise data retrieval. REST is simpler to implement and cache, while GraphQL offers more flexibility and efficiency for complex data requirements.",
    category: "Web Development",
    difficulty: "Intermediate"
  },
  {
    id: "top-3",
    question: "How would you handle authentication in a modern web application?",
    answer: "Modern authentication typically uses JWT (JSON Web Tokens) or OAuth 2.0. For web applications, implement secure login with HTTPS, password hashing (bcrypt), and CSRF protection. Store tokens in HttpOnly cookies or localStorage with appropriate security measures. Consider refresh token rotation, token expiration, and implementing MFA for sensitive operations. Use authorization middleware to protect routes based on user roles and permissions.",
    category: "Security",
    difficulty: "Advanced"
  },
  {
    id: "top-4",
    question: "What are promises in JavaScript and how do they work? How do async/await relate to promises?",
    answer: "Promises are objects representing the eventual completion or failure of an asynchronous operation. They have three states: pending, fulfilled (resolved), or rejected. Promises use .then(), .catch(), and .finally() methods for handling outcomes. Async/await is syntactic sugar over promises - an async function always returns a promise, and await pauses execution until the promise resolves, making asynchronous code appear synchronous and more readable.",
    category: "JavaScript",
    difficulty: "Intermediate"
  },
  {
    id: "top-5",
    question: "Explain the concept of database normalization and denormalization. When would you choose one over the other?",
    answer: "Normalization reduces data redundancy by organizing data across multiple tables with relationships, ensuring data integrity. Denormalization introduces redundancy by combining tables for performance. Use normalization when data integrity is critical and storage space is a concern. Use denormalization when read performance is crucial, queries are complex, and you need to minimize joins for faster retrieval, often in data warehousing or high-traffic applications.",
    category: "Databases",
    difficulty: "Intermediate"
  },
  {
    id: "top-6",
    question: "How would you optimize a slow-performing web application?",
    answer: "Start by identifying bottlenecks through profiling and monitoring. For frontend: optimize images, implement code splitting, use lazy loading, minimize HTTP requests, and employ caching strategies. For backend: optimize database queries (add indexes, refine queries), implement efficient caching (Redis/Memcached), consider horizontal scaling, use CDNs for static content, and optimize server configurations. Also consider implementing service workers, using WebSockets for real-time data, and adopting microservices architecture if appropriate.",
    category: "Performance",
    difficulty: "Advanced"
  },
  {
    id: "top-7",
    question: "Explain how you would design a scalable microservices architecture.",
    answer: "Design a scalable microservices architecture by decomposing services based on business domains, establishing clear API contracts between services, implementing service discovery, using an API gateway for routing and aggregation, employing event-driven communication for asynchronous processes, containerizing services with Docker for consistent environments, orchestrating with Kubernetes for scaling and management, implementing distributed logging and monitoring, adopting circuit breakers for failure handling, and ensuring data consistency through event sourcing or saga patterns.",
    category: "System Design",
    difficulty: "Advanced"
  },
  {
    id: "top-8",
    question: "What is CORS and how does it work? How would you handle CORS in a web application?",
    answer: "Cross-Origin Resource Sharing (CORS) is a security feature that restricts web page requests to other domains. Browsers enforce the Same-Origin Policy but use CORS headers to allow controlled cross-origin requests. To implement CORS: configure servers to send proper headers (Access-Control-Allow-Origin, Access-Control-Allow-Methods, etc.), handle preflight OPTIONS requests, set appropriate credentials policies, and consider using proxy servers for restrictive third-party APIs. For frontend frameworks, use built-in CORS configuration or middleware in your backend framework.",
    category: "Web Security",
    difficulty: "Intermediate"
  },
  {
    id: "top-9",
    question: "Explain the concept of containerization and how Docker works.",
    answer: "Containerization packages applications with dependencies into standardized units (containers) that run consistently across environments. Docker implements containerization using: Docker Engine (creates and runs containers), Images (read-only templates with application code and dependencies), Containers (runnable instances of images), Dockerfile (script defining image build), Docker Compose (defines multi-container applications), and Registry (stores and distributes images). Unlike VMs, containers share the host OS kernel but run in isolated processes, making them lightweight and efficient while maintaining isolation.",
    category: "DevOps",
    difficulty: "Intermediate"
  },
  {
    id: "top-10",
    question: "Describe a complex technical problem you've faced and how you solved it.",
    answer: "This is an opportunity to showcase your problem-solving approach. Structure your answer with: 1) Problem description - clearly explain the technical challenge, 2) Analysis - how you investigated and identified root causes, 3) Solution consideration - different approaches you evaluated, 4) Implementation - what you did and why, 5) Results - the outcome and metrics, and 6) Learnings - what you'd do differently next time. Focus on your analytical process, technical decisions, and how you collaborated with others if relevant.",
    category: "Problem Solving",
    difficulty: "Advanced"
  }
];

const questionsData = {
  technical: [
    // Frontend Questions (25 questions)
    {
      id: 1,
      question: "What is the difference between let, const, and var in JavaScript?",
      answer: "var is function-scoped and can be redeclared and updated. let is block-scoped and can be updated but not redeclared. const is block-scoped and cannot be updated or redeclared.",
      category: "Frontend",
      difficulty: "Beginner"
    },
    {
      id: 2,
      question: "What are hooks in React and why were they introduced?",
      answer: "Hooks are functions that let you 'hook into' React state and lifecycle features from function components. They were introduced to allow the use of state and other React features without writing a class.",
      category: "Frontend",
      difficulty: "Intermediate"
    },
    {
      id: 3,
      question: "Explain the concept of Virtual DOM in React.",
      answer: "Virtual DOM is a lightweight copy of the actual DOM that React uses to optimize rendering performance. When state changes occur, React first updates the virtual DOM, compares it with the previous version (diffing), and then efficiently updates only the necessary parts of the actual DOM.",
      category: "Frontend",
      difficulty: "Intermediate"
    },
    {
      id: 4,
      question: "What is the purpose of useEffect hook in React?",
      answer: "useEffect is used for handling side effects in functional components. It can be used for data fetching, subscriptions, manual DOM manipulations, and other effects that need to run after rendering.",
      category: "Frontend",
      difficulty: "Intermediate"
    },
    {
      id: 5,
      question: "Explain the concept of CSS Grid vs Flexbox.",
      answer: "CSS Grid is a two-dimensional layout system for rows and columns, ideal for complex layouts. Flexbox is a one-dimensional layout system for organizing items in rows or columns, perfect for component-level layouts.",
      category: "Frontend",
      difficulty: "Intermediate"
    },
    {
      id: 6,
      question: "What is Redux and when should you use it?",
      answer: "Redux is a state management library that provides a predictable state container. It's useful for large applications where state management becomes complex, or when state needs to be shared between many components.",
      category: "Frontend",
      difficulty: "Advanced"
    },
    {
      id: 7,
      question: "Explain the concept of code splitting in React.",
      answer: "Code splitting is a technique to split your code into small chunks which can be loaded on demand. This helps in improving the performance by reducing the initial bundle size and loading only what's necessary.",
      category: "Frontend",
      difficulty: "Advanced"
    },
    {
      id: 8,
      question: "What are React render props?",
      answer: "Render props is a technique for sharing code between React components using a prop whose value is a function. It provides a way to tell a component what to render using a function prop.",
      category: "Frontend",
      difficulty: "Advanced"
    },
    {
      id: 9,
      question: "Explain the concept of CSS modules.",
      answer: "CSS modules are CSS files where all class names and animation names are scoped locally by default. This helps in avoiding naming conflicts and provides better modularity in styling.",
      category: "Frontend",
      difficulty: "Intermediate"
    },
    {
      id: 10,
      question: "What is server-side rendering (SSR) and its benefits?",
      answer: "SSR is the process of rendering web pages on the server instead of in the browser. Benefits include better SEO, faster initial page load, and better performance on low-powered devices.",
      category: "Frontend",
      difficulty: "Advanced"
    },
    {
      id: 11,
      question: "What are Web Components?",
      answer: "Web Components are a set of web platform APIs that allow you to create new custom, reusable, encapsulated HTML tags. They consist of Custom Elements, Shadow DOM, and HTML Templates.",
      category: "Frontend",
      difficulty: "Advanced"
    },
    {
      id: 12,
      question: "Explain the concept of Progressive Web Apps (PWAs).",
      answer: "PWAs are web applications that use modern web capabilities to deliver an app-like experience. They are installable, work offline, and provide features like push notifications and background sync.",
      category: "Frontend",
      difficulty: "Advanced"
    },
    {
      id: 13,
      question: "What is the purpose of key prop in React lists?",
      answer: "Keys help React identify which items have changed, been added, or been removed in lists. They should be unique among siblings and help in efficient rendering of dynamic lists.",
      category: "Frontend",
      difficulty: "Beginner"
    },
    {
      id: 14,
      question: "Explain React's Context API.",
      answer: "Context API provides a way to pass data through the component tree without having to pass props manually at every level. It's useful for sharing data that can be considered global.",
      category: "Frontend",
      difficulty: "Intermediate"
    },
    {
      id: 15,
      question: "What are React portals?",
      answer: "Portals provide a way to render children into a DOM node that exists outside the DOM hierarchy of the parent component. Useful for modals, tooltips, and floating menus.",
      category: "Frontend",
      difficulty: "Advanced"
    },
    // Backend Questions (25 questions)
    {
      id: 16,
      question: "What is the difference between SQL and NoSQL databases?",
      answer: "SQL databases are relational, table-based, and have a predefined schema. NoSQL databases are non-relational, document-based, and have a dynamic schema. SQL databases scale vertically, while NoSQL databases scale horizontally.",
      category: "Backend",
      difficulty: "Intermediate"
    },
    {
      id: 17,
      question: "Explain the concept of middleware in Node.js.",
      answer: "Middleware functions are functions that have access to the request object, response object, and the next middleware function in the application's request-response cycle. They can execute code, modify request and response objects, end the request-response cycle, and call the next middleware function.",
      category: "Backend",
      difficulty: "Intermediate"
    },
    {
      id: 18,
      question: "What are microservices and their advantages?",
      answer: "Microservices is an architectural style where an application is built as a collection of small, independent services. Advantages include better scalability, easier maintenance, technology flexibility, and improved fault isolation.",
      category: "Backend",
      difficulty: "Advanced"
    },
    {
      id: 19,
      question: "Explain the concept of database indexing.",
      answer: "Database indexing is a data structure technique to quickly locate and access data in a database. Proper indexing can significantly improve query performance but comes with storage and maintenance overhead.",
      category: "Backend",
      difficulty: "Intermediate"
    },
    {
      id: 20,
      question: "What is the CAP theorem?",
      answer: "CAP theorem states that a distributed database system can only guarantee two out of three properties: Consistency, Availability, and Partition tolerance. You must choose which two are most important for your use case.",
      category: "Backend",
      difficulty: "Advanced"
    },
    // DevOps Questions (25 questions)
    {
      id: 21,
      question: "Explain the concept of container orchestration and its benefits.",
      answer: "Container orchestration automates the deployment, management, scaling, and networking of containers. Tools like Kubernetes provide features such as load balancing, automated rollouts/rollbacks, self-healing, and service discovery.",
      category: "DevOps",
      difficulty: "Advanced"
    },
    {
      id: 22,
      question: "What is Infrastructure as Code (IaC)?",
      answer: "Infrastructure as Code is the practice of managing and provisioning infrastructure through code instead of manual processes. Tools like Terraform and CloudFormation allow you to version, reuse, and maintain infrastructure configurations.",
      category: "DevOps",
      difficulty: "Intermediate"
    },
    {
      id: 23,
      question: "What is the difference between Docker and Kubernetes?",
      answer: "Docker is a platform for developing, shipping, and running containers. Kubernetes is a container orchestration system for automating deployment, scaling, and management of containerized applications.",
      category: "DevOps",
      difficulty: "Intermediate"
    },
    {
      id: 24,
      question: "Explain the concept of CI/CD pipelines.",
      answer: "CI/CD (Continuous Integration/Continuous Deployment) pipelines automate the software delivery process. CI ensures code changes are automatically built, tested, and merged, while CD automates the delivery of applications to production.",
      category: "DevOps",
      difficulty: "Intermediate"
    },
    {
      id: 25,
      question: "What is service mesh and its benefits?",
      answer: "A service mesh is a dedicated infrastructure layer for handling service-to-service communication. It provides features like service discovery, load balancing, encryption, authentication, and observability.",
      category: "DevOps",
      difficulty: "Advanced"
    },
    // Mobile Development Questions (25 questions)
    {
      id: 26,
      question: "What are the key differences between React Native and Flutter?",
      answer: "React Native uses JavaScript/React and bridges to native components, while Flutter uses Dart and provides its own widget library. Flutter typically offers better performance but has a steeper learning curve.",
      category: "Mobile",
      difficulty: "Intermediate"
    },
    {
      id: 27,
      question: "Explain the concept of state management in mobile applications.",
      answer: "State management in mobile apps involves handling data flow and UI updates. Solutions like Redux, MobX, or Provider pattern help manage global state, while local state can be handled by component-level state management.",
      category: "Mobile",
      difficulty: "Intermediate"
    },
    {
      id: 28,
      question: "What are the main considerations for mobile app performance?",
      answer: "Key considerations include optimizing image loading, minimizing network requests, implementing efficient caching strategies, reducing app size, managing memory usage, and optimizing UI rendering.",
      category: "Mobile",
      difficulty: "Advanced"
    },
    // Data Science Questions (25 questions)
    {
      id: 29,
      question: "What is the difference between supervised and unsupervised learning?",
      answer: "Supervised learning uses labeled data to train models that can make predictions, while unsupervised learning finds patterns in unlabeled data. Examples include classification vs clustering.",
      category: "Data Science",
      difficulty: "Intermediate"
    },
    {
      id: 30,
      question: "Explain overfitting and how to prevent it.",
      answer: "Overfitting occurs when a model learns the training data too well, including noise. Prevention methods include cross-validation, regularization, and using simpler models.",
      category: "Data Science",
      difficulty: "Intermediate"
    },
    // Security Questions (25 questions)
    {
      id: 31,
      question: "What is Cross-Site Scripting (XSS) and how to prevent it?",
      answer: "XSS is a security vulnerability that allows attackers to inject malicious scripts into web pages. Prevention includes input validation, output encoding, and using Content Security Policy (CSP).",
      category: "Security",
      difficulty: "Intermediate"
    },
    {
      id: 32,
      question: "Explain the concept of OAuth 2.0.",
      answer: "OAuth 2.0 is an authorization framework that enables applications to obtain limited access to user accounts on an HTTP service. It works by delegating user authentication to the service that hosts the user account.",
      category: "Security",
      difficulty: "Advanced"
    },
    // Full Stack Questions (25 questions)
    {
      id: 33,
      question: "How do you handle data consistency between frontend and backend?",
      answer: "Data consistency can be maintained through proper state management, real-time updates using WebSockets, implementing optimistic UI updates with rollback mechanisms, and using strong typing.",
      category: "Full Stack",
      difficulty: "Advanced"
    },
    {
      id: 34,
      question: "Explain the concept of RESTful API design.",
      answer: "RESTful APIs follow principles like statelessness, resource-based URLs, proper use of HTTP methods, and HATEOAS. Good design includes versioning, proper error handling, and documentation.",
      category: "Full Stack",
      difficulty: "Intermediate"
    },
    {
      id: 35,
      question: "What are the benefits of using TypeScript in full-stack development?",
      answer: "TypeScript provides static typing, better tooling support, enhanced code maintainability, and improved developer experience through features like interfaces and generics.",
      category: "Full Stack",
      difficulty: "Intermediate"
    },
    // Additional Frontend Questions
    {
      id: 36,
      question: "What is the difference between controlled and uncontrolled components in React?",
      answer: "Controlled components have their state controlled by React through props, while uncontrolled components maintain their own internal state using refs.",
      category: "Frontend",
      difficulty: "Intermediate"
    },
    {
      id: 37,
      question: "Explain the concept of React Suspense.",
      answer: "React Suspense is a feature that lets you wait for some code to load and declaratively specify a loading state while waiting.",
      category: "Frontend",
      difficulty: "Advanced"
    },
    // Additional Backend Questions
    {
      id: 38,
      question: "What are the ACID properties in database transactions?",
      answer: "ACID stands for Atomicity (transactions are all or nothing), Consistency (database remains in a valid state), Isolation (transactions don't interfere), and Durability (completed transactions persist).",
      category: "Backend",
      difficulty: "Advanced"
    },
    {
      id: 39,
      question: "Explain the concept of database sharding.",
      answer: "Sharding is a database architecture pattern where data is horizontally partitioned across multiple databases to improve scalability and performance.",
      category: "Backend",
      difficulty: "Advanced"
    },
    // Additional DevOps Questions
    {
      id: 40,
      question: "What is blue-green deployment?",
      answer: "Blue-green deployment is a technique that reduces downtime by running two identical production environments called Blue and Green, switching between them for updates.",
      category: "DevOps",
      difficulty: "Advanced"
    },
    {
      id: 41,
      question: "Explain the concept of chaos engineering.",
      answer: "Chaos engineering is the practice of intentionally introducing failures in a system to test its resilience and identify potential problems before they occur in production.",
      category: "DevOps",
      difficulty: "Advanced"
    },
    // Additional Mobile Development Questions
    {
      id: 42,
      question: "What are the key considerations for offline-first mobile apps?",
      answer: "Offline-first apps need robust data synchronization, conflict resolution, local storage management, and clear UI indicators for offline/online status.",
      category: "Mobile",
      difficulty: "Advanced"
    },
    {
      id: 43,
      question: "Explain mobile app security best practices.",
      answer: "Include secure data storage, encryption, certificate pinning, secure communication, input validation, and protection against reverse engineering.",
      category: "Mobile",
      difficulty: "Advanced"
    },
    // Additional Data Science Questions
    {
      id: 44,
      question: "What is the difference between bagging and boosting?",
      answer: "Bagging combines predictions from multiple models trained on random subsets of data, while boosting builds models sequentially, each trying to correct errors from previous models.",
      category: "Data Science",
      difficulty: "Advanced"
    },
    {
      id: 45,
      question: "Explain the concept of feature engineering.",
      answer: "Feature engineering is the process of using domain knowledge to create new features that make machine learning algorithms work better.",
      category: "Data Science",
      difficulty: "Intermediate"
    },
    // Additional Security Questions
    {
      id: 46,
      question: "What is CSRF and how to prevent it?",
      answer: "Cross-Site Request Forgery (CSRF) tricks users into submitting malicious requests. Prevention includes using CSRF tokens and SameSite cookies.",
      category: "Security",
      difficulty: "Intermediate"
    },
    {
      id: 47,
      question: "Explain the concept of penetration testing.",
      answer: "Penetration testing is the practice of testing a computer system, network or application to find security vulnerabilities that an attacker could exploit.",
      category: "Security",
      difficulty: "Advanced"
    },
    // Additional Full Stack Questions
    {
      id: 48,
      question: "How do you handle authentication and authorization in a full-stack application?",
      answer: "Implement JWT/session-based authentication, role-based access control, secure password storage, and proper session management across the stack.",
      category: "Full Stack",
      difficulty: "Advanced"
    },
    {
      id: 49,
      question: "Explain the concept of GraphQL and its benefits over REST.",
      answer: "GraphQL is a query language that allows clients to request specific data, reducing over-fetching and under-fetching common in REST APIs.",
      category: "Full Stack",
      difficulty: "Advanced"
    },
    {
      id: 50,
      question: "What are microservices and their trade-offs?",
      answer: "Microservices architecture breaks applications into small, independent services. Trade-offs include improved scalability and maintainability vs increased complexity and operational overhead.",
      category: "Full Stack",
      difficulty: "Advanced"
    }
  ],
  behavioral: [
    {
      id: 6,
      question: "Tell me about a time when you had to deal with a difficult team member.",
      answer: "When answering, use the STAR method: Situation, Task, Action, Result. Describe the situation, what your responsibility was, what actions you took to resolve the issue, and the positive outcome that resulted.",
      category: "Teamwork",
      difficulty: "Intermediate"
    },
    {
      id: 7,
      question: "Describe a project where you had to learn a new technology quickly.",
      answer: "Explain how you approached the learning process, what resources you used, how you applied the new knowledge, and what the outcome was. Emphasize your adaptability and willingness to learn.",
      category: "Learning",
      difficulty: "Intermediate"
    },
    {
      id: 8,
      question: "How do you handle working under pressure or tight deadlines?",
      answer: "Discuss your approach to prioritization, time management, and maintaining quality under pressure. Provide a specific example that demonstrates these skills.",
      category: "Stress Management",
      difficulty: "Intermediate"
    },
    {
      id: 9,
      question: "Describe a situation where you had to make an important decision with limited information.",
      answer: "Explain the decision-making process you used, how you gathered what information was available, the factors you considered, and how you evaluated the outcome.",
      category: "Decision Making",
      difficulty: "Advanced"
    },
    {
      id: 10,
      question: "What's your biggest professional achievement and why?",
      answer: "Choose an achievement that demonstrates skills relevant to the position. Explain what the challenge was, your specific contributions, and the measurable results.",
      category: "Achievements",
      difficulty: "Beginner"
    },
    {
      id: 51,
      question: "How do you handle conflicts in a team?",
      answer: "Focus on open communication, understand different perspectives, find common ground, and work towards solutions that benefit the team and project.",
      category: "Teamwork",
      difficulty: "Intermediate"
    },
    {
      id: 52,
      question: "Describe a time when you had to lead a project.",
      answer: "Explain your leadership style, how you motivated the team, handled challenges, and achieved project goals.",
      category: "Leadership",
      difficulty: "Advanced"
    }
  ],
  general: [
    {
      id: 11,
      question: "Why are you interested in this role?",
      answer: "Connect your skills, experiences, and career goals to the specific role and company. Research the company beforehand and mention aspects of their culture or mission that resonate with you.",
      category: "Motivation",
      difficulty: "Beginner"
    },
    {
      id: 12,
      question: "Where do you see yourself in 5 years?",
      answer: "Discuss your career goals in a way that shows ambition but also relates to the position and company you're applying to. Be realistic and show you've thought about your career path.",
      category: "Career Goals",
      difficulty: "Beginner"
    },
    {
      id: 13,
      question: "What are your strengths and weaknesses?",
      answer: "For strengths, choose qualities relevant to the job and provide examples. For weaknesses, discuss genuine areas for improvement and the steps you're taking to address them.",
      category: "Self-awareness",
      difficulty: "Beginner"
    },
    {
      id: 14,
      question: "How do you stay updated with industry trends?",
      answer: "Mention specific resources like blogs, podcasts, online courses, conferences, or professional groups that you follow to stay current in your field.",
      category: "Professional Development",
      difficulty: "Intermediate"
    },
    {
      id: 15,
      question: "Why should we hire you?",
      answer: "Summarize your most relevant skills and experiences, explain what sets you apart from other candidates, and emphasize the specific value you can bring to the company.",
      category: "Value Proposition",
      difficulty: "Intermediate"
    },
    {
      id: 53,
      question: "How do you handle work-life balance?",
      answer: "Discuss time management strategies, setting boundaries, and maintaining productivity while ensuring personal well-being.",
      category: "Work-Life Balance",
      difficulty: "Intermediate"
    },
    {
      id: 54,
      question: "Where do you see the technology industry heading in the next 5 years?",
      answer: "Discuss emerging trends, potential disruptions, and how you stay informed about industry developments.",
      category: "Industry Knowledge",
      difficulty: "Advanced"
    }
  ]
};

const technologies = {
  frontend: ['JavaScript', 'React', 'Vue.js', 'Angular', 'TypeScript', 'HTML/CSS', 'Redux', 'Webpack'],
  backend: ['Node.js', 'Python', 'Java', 'C#', 'Go', 'Ruby', 'PHP', 'REST APIs', 'GraphQL', 'SQL', 'NoSQL'],
  fullstack: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Java', 'SQL', 'NoSQL', 'GraphQL', 'Docker'],
  devops: ['Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'CI/CD', 'Terraform', 'Git', 'Linux', 'Monitoring'],
  mobile: ['React Native', 'Flutter', 'Swift', 'Kotlin', 'Java', 'Objective-C', 'Android', 'iOS'],
  'data science': ['Python', 'R', 'SQL', 'Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch', 'Data Visualization', 'Statistics'],
  security: ['Network Security', 'Web Security', 'Cryptography', 'Authentication', 'Authorization', 'Penetration Testing', 'Security Best Practices']
};

const roles = {
  frontend: ['Frontend Developer', 'UI Developer', 'React Developer', 'Angular Developer'],
  backend: ['Backend Developer', 'API Developer', 'Database Administrator', 'System Architect'],
  fullstack: ['Full Stack Developer', 'Software Engineer', 'Web Developer'],
  mobile: ['Mobile Developer', 'iOS Developer', 'Android Developer', 'Cross-platform Developer'],
  devops: ['DevOps Engineer', 'Site Reliability Engineer', 'Cloud Engineer', 'Infrastructure Engineer'],
  data: ['Data Scientist', 'Machine Learning Engineer', 'Data Analyst', 'AI Engineer'],
  security: ['Security Engineer', 'Security Analyst', 'Penetration Tester', 'Security Architect']
};

export default function QuestionsPage() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedTech, setSelectedTech] = useState([]);
  const [showQuestions, setShowQuestions] = useState(false);
  const [showAnswer, setShowAnswer] = useState({});
  const [difficulty, setDifficulty] = useState('all');
  const [showTopQuestions, setShowTopQuestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Simulate loading state for better UX
  const simulateLoading = (callback, delay = 500) => {
    setIsLoading(true);
    setTimeout(() => {
      callback();
      setIsLoading(false);
    }, delay);
  };

  const toggleAnswer = (id) => {
    setShowAnswer(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleCategorySelect = (category) => {
    simulateLoading(() => {
      setSelectedCategory(category);
      setSelectedTech([]);
      setShowQuestions(false);
      setShowTopQuestions(false);
    });
  };

  const handleTechSelect = (tech) => {
    setSelectedTech(prev => {
      if (prev.includes(tech)) {
        return prev.filter(t => t !== tech);
      }
      return [...prev, tech];
    });
  };

  const handleStartQuestions = () => {
    if (selectedTech.length > 0) {
      simulateLoading(() => {
        setShowQuestions(true);
      });
    }
  };

  // Memoized function to improve performance
  const filteredQuestions = useMemo(() => {
    if (!selectedCategory || !showQuestions) return [];

    let questions = questionsData.technical.filter(q => {
      // Match category
      const categoryMatch = q.category.toLowerCase() === selectedCategory.toLowerCase() ||
        (selectedCategory === 'fullstack' && 
         (q.category.toLowerCase() === 'frontend' || 
          q.category.toLowerCase() === 'backend' ||
          q.category.toLowerCase() === 'full stack'));

      // Match selected technologies
      const techMatch = selectedTech.length === 0 || selectedTech.some(tech => {
        const techLower = tech.toLowerCase();
        return q.question.toLowerCase().includes(techLower) ||
               q.answer.toLowerCase().includes(techLower) ||
               // Add specific technology mappings
               (techLower === 'react' && 
                (q.question.toLowerCase().includes('react') || 
                 q.question.toLowerCase().includes('jsx'))) ||
               (techLower === 'node.js' && 
                (q.question.toLowerCase().includes('node') || 
                 q.question.toLowerCase().includes('express'))) ||
               (techLower === 'javascript' && 
                (q.question.toLowerCase().includes('javascript') || 
                 q.question.toLowerCase().includes('js')));
      });

      // Match difficulty
      const difficultyMatch = difficulty === 'all' || q.difficulty.toLowerCase() === difficulty.toLowerCase();

      return categoryMatch && techMatch && difficultyMatch;
    });

    // Add some behavioral and general questions relevant to the role
    const relevantBehavioral = questionsData.behavioral
      .filter(q => difficulty === 'all' || q.difficulty.toLowerCase() === difficulty.toLowerCase())
      .slice(0, 3);

    const relevantGeneral = questionsData.general
      .filter(q => difficulty === 'all' || q.difficulty.toLowerCase() === difficulty.toLowerCase())
      .slice(0, 2);

    return [...questions, ...relevantBehavioral, ...relevantGeneral];
  }, [selectedCategory, selectedTech, difficulty, showQuestions]);

  // Memoized function for role-tech questions to improve performance
  const getRelevantQuestionsForRoleTech = useMemo(() => {
    return (role, technology = null) => {
      let questions = questionsData.technical.filter(q => {
        // Match category based on role
        const categoryMatch = q.category.toLowerCase() === role.toLowerCase() ||
          (role === 'fullstack' && 
          (q.category.toLowerCase() === 'frontend' || 
            q.category.toLowerCase() === 'backend' ||
            q.category.toLowerCase() === 'full stack'));

        // Match technology if provided
        let techMatch = true;
        if (technology) {
          const techLower = technology.toLowerCase();
          techMatch = q.question.toLowerCase().includes(techLower) ||
                    q.answer.toLowerCase().includes(techLower) ||
                    // Add specific technology mappings
                    (techLower === 'react' && 
                      (q.question.toLowerCase().includes('react') || 
                      q.question.toLowerCase().includes('jsx'))) ||
                    (techLower === 'node.js' && 
                      (q.question.toLowerCase().includes('node') || 
                      q.question.toLowerCase().includes('express'))) ||
                    (techLower === 'javascript' && 
                      (q.question.toLowerCase().includes('javascript') || 
                      q.question.toLowerCase().includes('js')));
        }

        return categoryMatch && techMatch;
      });

      // If not enough questions specifically for the technology, add more from the role category
      if (technology && questions.length < 8) {
        const moreQuestions = questionsData.technical.filter(q => {
          const categoryMatch = q.category.toLowerCase() === role.toLowerCase() ||
            (role === 'fullstack' && 
            (q.category.toLowerCase() === 'frontend' || 
              q.category.toLowerCase() === 'backend' ||
              q.category.toLowerCase() === 'full stack'));
          
          // Exclude questions already in the list
          return categoryMatch && !questions.some(selected => selected.id === q.id);
        });
        
        questions = [...questions, ...moreQuestions].slice(0, 8);
      }

      // Add behavioral and general questions
      const behavioralQuestions = questionsData.behavioral.slice(0, 1);
      const generalQuestions = questionsData.general.slice(0, 1);

      return [...questions, ...behavioralQuestions, ...generalQuestions].slice(0, 10);
    };
  }, []);

  // Animation variants for smooth transitions
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    },
    exit: { 
      opacity: 0,
      transition: { 
        when: "afterChildren",
        staggerChildren: 0.05,
        staggerDirection: -1 
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 150, damping: 20 }
    },
    exit: { 
      y: -20, 
      opacity: 0,
      transition: { duration: 0.2 }
    }
  };

  const roleCategories = [
    {
      name: 'Frontend',
      icon: '🎨',
      description: 'Specialize in building user interfaces and client-side applications'
    },
    {
      name: 'Backend',
      icon: '⚙️',
      description: 'Focus on server-side logic, databases, and application architecture'
    },
    {
      name: 'Full Stack',
      icon: '🔄',
      description: 'Work across both frontend and backend technologies'
    },
    {
      name: 'DevOps',
      icon: '🚀',
      description: 'Manage deployment, scaling, and operations of applications'
    },
    {
      name: 'Mobile',
      icon: '📱',
      description: 'Develop applications for iOS, Android, and cross-platform'
    },
    {
      name: 'Data Science',
      icon: '📊',
      description: 'Work with data analysis, machine learning, and AI'
    },
    {
      name: 'Security',
      icon: '🔒',
      description: 'Focus on application and network security'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <Header />
      
      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="mb-4">
          <a href="/" className="inline-flex items-center text-indigo-600 hover:text-indigo-900 transition-colors">
            <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </a>
        </div>

        <div className="mb-12 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl font-extrabold text-gray-900 sm:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600"
          >
            Interview Questions
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mt-4 max-w-2xl mx-auto text-xl text-gray-600"
          >
            Select your role category to get started with relevant interview questions.
          </motion.p>
        </div>

        {/* Loading Indicator */}
        {isLoading && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
            <div className="p-4 bg-white rounded-lg shadow-xl">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 rounded-full bg-indigo-600 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-4 h-4 rounded-full bg-indigo-600 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-4 h-4 rounded-full bg-indigo-600 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                <span className="text-gray-800 font-medium ml-2">Loading...</span>
              </div>
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          {/* Role Categories View (Default) */}
          {!selectedCategory && !showTopQuestions && (
            <motion.div 
              key="role-categories"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              {roleCategories.map((category) => (
                <motion.div
                  key={category.name}
                  variants={itemVariants}
                  whileHover={{ 
                    scale: 1.02,
                    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" 
                  }}
                  className="relative"
                >
                  <button
                    onClick={() => handleCategorySelect(category.name.toLowerCase())}
                    className="w-full h-full rounded-xl border-2 border-gray-200 p-8 bg-white shadow-sm hover:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300"
                  >
                    <div className="text-5xl mb-5">{category.icon}</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{category.name}</h3>
                    <p className="text-gray-500">{category.description}</p>
                  </button>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Technology Selection View */}
          {selectedCategory && !showQuestions && !showTopQuestions && (
            <motion.div
              key="tech-selection"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="bg-white shadow-xl rounded-xl overflow-hidden"
            >
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">
                  {selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Development
                </h2>
                <button
                  onClick={() => {setSelectedCategory(null);}}
                  className="px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white font-medium rounded-full text-sm flex items-center transition-all duration-300"
                >
                  <svg className="h-5 w-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back
                </button>
              </div>
              
              <div className="p-6">
                <motion.div variants={itemVariants} className="mb-8">
                  <h3 className="text-xl font-semibold mb-4">Select Technologies</h3>
                  <div className="flex flex-wrap gap-3">
                    {technologies[selectedCategory]?.map(tech => (
                      <motion.button
                        key={tech}
                        onClick={() => handleTechSelect(tech)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                          selectedTech.includes(tech)
                            ? 'bg-indigo-600 text-white shadow-md'
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                      >
                        {tech}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>

                <motion.div variants={itemVariants} className="mb-6">
                  <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-2">Difficulty Level</label>
                  <select
                    id="difficulty"
                    name="difficulty"
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                  >
                    <option value="all">All Levels</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </motion.div>

                <motion.button
                  variants={itemVariants}
                  onClick={handleStartQuestions}
                  disabled={selectedTech.length === 0}
                  whileHover={selectedTech.length > 0 ? { scale: 1.02 } : {}}
                  whileTap={selectedTech.length > 0 ? { scale: 0.98 } : {}}
                  className={`mt-6 w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium transition-all duration-300 ${
                    selectedTech.length === 0 
                      ? 'bg-gray-300 cursor-not-allowed text-gray-500' 
                      : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700'
                  }`}
                >
                  {selectedTech.length === 0 ? 'Select at least one technology' : 'Show Questions'}
                </motion.button>
              </div>

              {/* Display questions by technology in a carousel-like layout */}
              <motion.div variants={itemVariants} className="px-6 pb-8">
                <h3 className="text-xl font-semibold border-b border-gray-200 pb-3 mb-6">
                  Questions by Technology
                </h3>
                
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {technologies[selectedCategory]?.map(tech => (
                    <motion.div 
                      key={tech} 
                      whileHover={{ y: -5 }}
                      className="bg-white rounded-xl overflow-hidden shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300"
                    >
                      <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-4 py-3">
                        <h4 className="text-md font-medium text-white">{tech}</h4>
                      </div>
                      
                      <div className="divide-y divide-gray-100">
                        {getRelevantQuestionsForRoleTech(selectedCategory, tech).slice(0, 3).map((q) => (
                          <div key={`${tech}-${q.id}`} className="px-4 py-3">
                            <div className="flex justify-between items-start">
                              <h5 className="text-sm font-medium text-gray-900 pr-4">{q.question}</h5>
                              <button
                                onClick={() => toggleAnswer(`${tech}-${q.id}`)}
                                className="ml-2 text-xs text-indigo-600 hover:text-indigo-800 font-medium flex-shrink-0"
                              >
                                {showAnswer[`${tech}-${q.id}`] ? 'Hide' : 'Show'}
                              </button>
                            </div>
                            
                            <AnimatePresence>
                              {showAnswer[`${tech}-${q.id}`] && (
                                <motion.div 
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.3 }}
                                  className="mt-2 text-sm text-gray-600 bg-gray-50 p-3 rounded overflow-hidden"
                                >
                                  {q.answer}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        ))}
                        
                        <div className="px-4 py-3 bg-gray-50">
                          <button
                            onClick={() => {
                              setSelectedTech([tech]);
                              setShowQuestions(true);
                            }}
                            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium inline-flex items-center"
                          >
                            See all {tech} questions
                            <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Questions List View */}
          {showQuestions && (
            <motion.div
              key="questions-list"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <div className="mb-6 flex justify-between items-center">
                <motion.button
                  variants={itemVariants}
                  onClick={() => setShowQuestions(false)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300"
                >
                  <svg className="h-5 w-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to Technologies
                </motion.button>
                
                <motion.div 
                  variants={itemVariants}
                  className="text-sm text-gray-500 bg-white px-3 py-2 rounded-full shadow-sm"
                >
                  <span className="font-medium text-indigo-600">{filteredQuestions.length}</span> questions for {selectedTech.join(', ')}
                </motion.div>
              </div>

              <div className="space-y-6">
                {filteredQuestions.map((q, index) => (
                  <motion.div 
                    key={q.id}
                    variants={itemVariants}
                    custom={index}
                    className="bg-white shadow-md hover:shadow-lg rounded-xl overflow-hidden border border-gray-100 transition-all duration-300"
                  >
                    <div className="px-6 py-5">
                      <div className="flex justify-between items-start">
                        <h3 className="text-lg font-medium text-gray-900 leading-relaxed pr-6">
                          {q.question}
                        </h3>
                        <button
                          onClick={() => toggleAnswer(q.id)}
                          className="ml-2 flex-shrink-0 inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-300"
                        >
                          {showAnswer[q.id] ? 'Hide Answer' : 'Show Answer'}
                        </button>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {q.category}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          q.difficulty === 'Beginner' || q.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                          q.difficulty === 'Intermediate' || q.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {q.difficulty}
                        </span>
                      </div>
                      
                      <AnimatePresence>
                        {showAnswer[q.id] && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="mt-4 bg-gradient-to-r from-gray-50 to-gray-100 p-5 rounded-lg overflow-hidden"
                          >
                            <p className="text-gray-700">{q.answer}</p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
} 