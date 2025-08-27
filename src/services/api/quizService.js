import quizzesData from "@/services/mockData/quizzes.json";

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