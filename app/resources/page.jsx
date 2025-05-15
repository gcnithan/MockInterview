'use client';
import { useState } from 'react';
import Link from 'next/link';
import Header from '@/app/components/Header';
import { motion, AnimatePresence } from 'framer-motion';

// Resource categories organized by type
const resourceGroups = [
  {
    title: "Coding Practice Platforms",
    description: "Master algorithms and data structures with these top practice platforms",
    icon: "💻",
    items: [
      {
        name: "LeetCode",
        description: "The most popular platform for coding interview preparation with thousands of problems",
        link: "https://leetcode.com",
        icon: "⌨️",
        tags: ["Algorithms", "Data Structures", "Premium Plans"]
      },
      {
        name: "HackerRank",
        description: "Skill-based technical assessments and practice problems",
        link: "https://www.hackerrank.com",
        icon: "🧩",
        tags: ["Company Assessments", "Free Certification"]
      },
      {
        name: "CodeSignal",
        description: "Technical assessment platform with real-world coding scenarios",
        link: "https://codesignal.com",
        icon: "📊",
        tags: ["Assessment", "Company Tests"]
      },
      {
        name: "AlgoExpert",
        description: "Curated list of 160+ interview questions with video explanations",
        link: "https://www.algoexpert.io",
        icon: "🧠",
        tags: ["Video Explanations", "Paid"]
      }
    ]
  },
  {
    title: "System Design Resources",
    description: "Learn how to design scalable systems and ace architecture interviews",
    icon: "🏗️",
    items: [
      {
        name: "System Design Primer",
        description: "A comprehensive GitHub repository with system design concepts and examples",
        link: "https://github.com/donnemartin/system-design-primer",
        icon: "📘",
        tags: ["Free", "Comprehensive", "GitHub"]
      },
      {
        name: "Grokking System Design",
        description: "Interactive courses on distributed systems and design patterns",
        link: "https://www.educative.io/courses/grokking-the-system-design-interview",
        icon: "🏗️",
        tags: ["Paid Course", "Interactive"]
      },
      {
        name: "ByteByteGo",
        description: "Visual explanations of system design concepts by Alex Xu",
        link: "https://bytebytego.com",
        icon: "📊",
        tags: ["Visual Learning", "Books"]
      },
      {
        name: "High Scalability",
        description: "Blog featuring real-world architecture of popular systems",
        link: "http://highscalability.com",
        icon: "📈",
        tags: ["Blog", "Case Studies"]
      }
    ]
  },
  {
    title: "Behavioral Interview Preparation",
    description: "Resources to help you master the non-technical aspects of interviews",
    icon: "👥",
    items: [
      {
        name: "STAR Method Framework",
        description: "Structured approach to answering behavioral questions effectively",
        link: "https://www.themuse.com/advice/star-interview-method",
        icon: "⭐",
        tags: ["Framework", "Free Guide"]
      },
      {
        name: "Pramp",
        description: "Peer-to-peer mock interview platform for practicing both technical and behavioral",
        link: "https://www.pramp.com",
        icon: "👥",
        tags: ["Free", "Peer Practice"]
      },
      {
        name: "Big Interview",
        description: "AI-powered interview coach with practice for various industries",
        link: "https://biginterview.com",
        icon: "🎭",
        tags: ["Paid", "AI Feedback"]
      },
      {
        name: "Amazon Leadership Principles",
        description: "Guide to Amazon's leadership principles and how to prepare for them",
        link: "https://www.amazon.jobs/en/principles",
        icon: "📋",
        tags: ["FAANG", "Leadership"]
      }
    ]
  },
  {
    title: "Books & Courses",
    description: "In-depth learning resources for comprehensive interview preparation",
    icon: "📚",
    items: [
      {
        name: "Cracking the Coding Interview",
        description: "The most popular book for coding interview preparation by Gayle McDowell",
        link: "https://www.crackingthecodinginterview.com",
        icon: "📚",
        tags: ["Book", "Classic"]
      },
      {
        name: "Educative.io Courses",
        description: "Interactive text-based courses on algorithms, system design and more",
        link: "https://www.educative.io",
        icon: "💻",
        tags: ["Paid", "Interactive", "No-Video"]
      },
      {
        name: "Designing Data-Intensive Applications",
        description: "Essential book for understanding distributed systems and databases",
        link: "https://dataintensive.net",
        icon: "📖",
        tags: ["Book", "System Design"]
      },
      {
        name: "MIT OpenCourseWare",
        description: "Free computer science courses from one of the top universities",
        link: "https://ocw.mit.edu/search/?d=Electrical%20Engineering%20and%20Computer%20Science",
        icon: "🎓",
        tags: ["Free", "Academic"]
      }
    ]
  }
];

// FAQ items
const faqs = [
  {
    question: 'How do I prepare for a technical interview?',
    answer: 'Focus on understanding fundamental concepts in your field, practice solving problems aloud, review your past projects, research the company, and prepare questions for the interviewer. Regular practice with our question bank can help you build confidence.'
  },
  {
    question: 'What resources are best for learning algorithms?',
    answer: 'We recommend starting with structured learning through books like "Cracking the Coding Interview" or courses on platforms like Coursera. Then practice with LeetCode, HackerRank, and algorithm visualization tools to reinforce your knowledge.'
  },
  {
    question: 'How can I improve my system design skills?',
    answer: 'System design requires understanding scalability, reliability, and efficiency. Start with the System Design Primer on GitHub, study real-world architectures on High Scalability, and practice drawing system diagrams. Interactive courses on Educative.io can also be extremely helpful.'
  },
  {
    question: 'What should I focus on for behavioral interviews?',
    answer: 'Prepare stories using the STAR method (Situation, Task, Action, Result) that demonstrate your skills and experiences. Practice with a friend or using platforms like Pramp. Research the company culture and values to align your responses accordingly.'
  },
  {
    question: 'How do I stay updated with industry trends?',
    answer: 'Follow industry blogs, participate in tech communities like Stack Overflow and GitHub, attend virtual conferences, and connect with professionals in your field. Subscribe to newsletters like Bytes, follow tech influencers on Twitter, and join relevant Discord communities.'
  }
];

export default function ResourcesPage() {
  const [showFaq, setShowFaq] = useState({});
  const [activeCategory, setActiveCategory] = useState(null);
  
  const toggleFaq = (id) => {
    setShowFaq(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 100, damping: 15 }
    }
  };

  const cardVariants = {
    hidden: { scale: 0.95, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: { type: "spring", stiffness: 120, damping: 14 }
    },
    hover: { 
      y: -8,
      scale: 1.03,
      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      transition: { type: "spring", stiffness: 400, damping: 15 }
    },
    tap: { scale: 0.98 }
  };

  const faqVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: { 
      opacity: 1, 
      height: "auto",
      transition: { duration: 0.3 }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-indigo-50">
      <Header />
      
      <main className="py-12">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16"
        >
          <div className="text-center mb-12 relative">
            <motion.div 
              className="absolute inset-0 -z-10 opacity-30 pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              <div className="absolute top-10 right-1/4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl"></div>
              <div className="absolute bottom-10 left-1/3 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl"></div>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-4xl font-extrabold sm:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600"
            >
              Interview Preparation Resources
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-5 max-w-xl mx-auto text-xl text-gray-700"
            >
              Curated external platforms and tools to help you prepare for your next interview
            </motion.p>
          </div>

          {/* Category Selection */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-wrap justify-center gap-4 mb-12"
          >
            <motion.button
              variants={itemVariants}
              onClick={() => setActiveCategory(null)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 shadow-sm ${
                activeCategory === null
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              All Resources
            </motion.button>
            {resourceGroups.map((group, index) => (
              <motion.button
                key={index}
                variants={itemVariants}
                onClick={() => setActiveCategory(index)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 shadow-sm flex items-center ${
                  activeCategory === index
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <span className="mr-2">{group.icon}</span>
                {group.title}
              </motion.button>
            ))}
          </motion.div>

          {/* Resource Groups */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory ?? 'all'}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {(activeCategory !== null ? [resourceGroups[activeCategory]] : resourceGroups).map((group, groupIndex) => (
                <motion.div 
                  key={groupIndex} 
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="mb-16"
                >
                  <motion.div 
                    variants={itemVariants}
                    className="bg-white rounded-2xl shadow-md p-6 mb-8 border-l-4 border-indigo-500"
                  >
                    <div className="flex items-center">
                      <span className="text-3xl mr-4">{group.icon}</span>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">{group.title}</h2>
                        <p className="text-gray-600 mt-1">{group.description}</p>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div 
                    variants={containerVariants}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                  >
                    {group.items.map((resource, index) => (
                      <motion.a 
                        key={index} 
                        variants={cardVariants}
                        whileHover="hover"
                        whileTap="tap"
                        href={resource.link}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="bg-white rounded-xl shadow-md transition-all duration-300 overflow-hidden flex flex-col h-full border border-gray-100 group"
                      >
                        <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 w-full transition-all duration-300 group-hover:h-3"></div>
                        <div className="p-6 flex flex-col h-full">
                          <div className="bg-indigo-50 rounded-full h-16 w-16 flex items-center justify-center text-3xl mb-4 transition-all duration-300 group-hover:bg-indigo-100 group-hover:scale-110">{resource.icon}</div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">{resource.name}</h3>
                          <p className="text-gray-600 text-sm flex-grow mb-4">{resource.description}</p>
                          <div className="flex flex-wrap gap-2 mt-auto">
                            {resource.tags.map((tag, tagIndex) => (
                              <span key={tagIndex} className="bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full text-xs font-medium transition-colors duration-300 group-hover:bg-indigo-100 group-hover:text-indigo-800">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </motion.a>
                    ))}
                  </motion.div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>

          {/* FAQ Section */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="mt-20"
          >
            <motion.div 
              variants={itemVariants}
              className="text-center mb-10"
            >
              <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                Frequently Asked Questions
              </h2>
              <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
                Get answers to common questions about interview preparation and resource utilization
              </p>
            </motion.div>

            <motion.div 
              variants={containerVariants}
              className="max-w-3xl mx-auto space-y-4"
            >
              {faqs.map((faq, index) => (
                <motion.div 
                  key={index} 
                  variants={itemVariants}
                  className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100"
                >
                  <motion.button
                    onClick={() => toggleFaq(index)}
                    className="w-full px-6 py-4 text-left bg-white hover:bg-gray-50 transition-colors duration-300 flex justify-between items-center"
                    whileHover={{ backgroundColor: "rgba(238, 242, 255, 0.5)" }}
                    whileTap={{ scale: 0.995 }}
                  >
                    <h3 className="text-lg font-medium text-gray-900">{faq.question}</h3>
                    <svg
                      className={`w-5 h-5 text-indigo-600 transform transition-transform duration-300 ${
                        showFaq[index] ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </motion.button>
                  
                  <AnimatePresence>
                    {showFaq[index] && (
                      <motion.div
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        variants={faqVariants}
                        className="px-6 pb-4 bg-indigo-50 border-t border-gray-100"
                      >
                        <p className="text-gray-700">{faq.answer}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Final CTA */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="mt-20 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl shadow-xl p-10 text-center text-white"
          >
            <h2 className="text-2xl font-bold mb-4">Ready to practice your interview skills?</h2>
            <p className="mb-8 max-w-2xl mx-auto">
              Apply what you've learned from these resources in a real-time mock interview simulation
            </p>
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link href="/dashboard" className="inline-flex items-center px-8 py-3 rounded-full bg-white text-indigo-600 font-medium shadow-md hover:shadow-lg transition-all duration-300">
                Start a Mock Interview
                <svg className="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
} 