import quizzesData from "@/services/mockData/quizzes.json";
import React from "react";
import Error from "@/components/ui/Error";

let quizzes = [...quizzesData];

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const quizService = {
  async getAll() {
    await delay(200);
    return quizzes.map(q => ({ ...q, questions: undefined })); // Don't include questions in list
  },

async getById(id) {
    await delay(150);
    const quiz = quizzes.find(q => q.Id === id);
    if (!quiz) throw new Error("Quiz not found");
    return { ...quiz };
  },

async getByDifficulty(difficulty) {
    await delay(200);
    return quizzes
      .filter(q => q.difficulty === difficulty)
      .map(q => ({ ...q, questions: undefined }));
  },

async submitQuizResult(userId, quizId, answers) {
    await delay(300);
    const quiz = quizzes.find(q => q.Id === quizId);
    if (!quiz) throw new Error("Quiz not found");

    let correctAnswers = 0;
    const results = quiz.questions.map((question, index) => {
      const isCorrect = answers[index] === question.correct;
      if (isCorrect) correctAnswers++;
      
      return {
        questionIndex: index,
        userAnswer: answers[index],
        correctAnswer: question.correct,
        isCorrect,
        explanation: question.explanation
      };
    });

    const score = Math.round((correctAnswers / quiz.questions.length) * 100);
    const xpEarned = Math.round(quiz.xpReward * (score / 100));

    return {
      quizId,
      score,
      correctAnswers,
      totalQuestions: quiz.questions.length,
      xpEarned,
      results,
passed: score >= 60
    };
  },

  async getDailyQuiz() {
    await delay(150);
    // Return a random quiz as "daily quiz"
    const randomIndex = Math.floor(Math.random() * quizzes.length);
    return { ...quizzes[randomIndex] };
  },

async getQuizCategories() {
    await delay(100);
    const categories = [...new Set(quizzes.map(q => q.category))];
    return categories.map(category => ({
      name: category,
      displayName: category.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' '),
      count: quizzes.filter(q => q.category === category).length
    }));
  },

  // Adaptive Learning Methods
  async getLearningPaths() {
    await delay(200);
    return [
      {
        Id: 1,
        title: "Marine Biology Fundamentals",
        description: "Build your foundation in marine life and ecosystems",
        difficulty: "novice",
        icon: "Fish",
        estimatedTime: 45,
        totalQuizzes: 8,
        prerequisites: []
      },
      {
        Id: 2,
        title: "Conservation Science Track",
        description: "Learn advanced conservation strategies and methodologies",
        difficulty: "guardian",
        icon: "Shield",
        estimatedTime: 60,
        totalQuizzes: 12,
        prerequisites: [1]
      },
      {
        Id: 3,
        title: "Climate Impact Specialist",
        description: "Master climate change effects on marine environments",
        difficulty: "expert",
        icon: "Thermometer",
        estimatedTime: 90,
        totalQuizzes: 15,
        prerequisites: [1, 2]
      }
    ];
  },

  async getRecommendedQuizzes(userId) {
    await delay(150);
    // Simulate AI-powered recommendations based on user performance
    const recommendedIds = [1, 2]; // Mock recommendation logic
    return quizzes
      .filter(q => recommendedIds.includes(q.Id))
      .map(q => ({ ...q, questions: undefined, learningPath: 1 }));
  },

  async getAdaptiveContent(userId) {
    await delay(200);
    // Simulate adaptive content generation
    return {
      insight: "Based on your performance, you excel at marine biology but could strengthen your conservation knowledge.",
      recommendedQuiz: { ...quizzes[1], questions: undefined },
      difficultyAdjustment: "maintain",
      focusAreas: ["conservation", "pollution-solutions"],
      recommendedCategories: ["conservation"]
    };
  },

  async trackQuizPerformance(userId, performanceData) {
    await delay(100);
    // Mock storage of performance data for adaptive learning
    console.log("Performance tracked:", performanceData);
    return { success: true };
  },

getDifficultyInfo(difficulty) {
    const info = {
      novice: {
        color: "text-green-600 bg-green-100",
        description: "Basic ocean facts and conservation awareness"
      },
      guardian: {
        color: "text-blue-600 bg-blue-100", 
        description: "Intermediate conservation strategies and marine science"
      },
      expert: {
        color: "text-purple-600 bg-purple-100",
        description: "Advanced marine science and conservation research"
      }
    };
    return info[difficulty] || info.novice;
  }
};