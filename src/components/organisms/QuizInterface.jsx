import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Progress from "@/components/atoms/Progress";
import Badge from "@/components/atoms/Badge";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import ApperIcon from "@/components/ApperIcon";
import { cn } from "@/utils/cn";
import { quizService } from "@/services/api/quizService";
import { userService } from "@/services/api/userService";
// Track performance for adaptive learning
  const [performanceData, setPerformanceData] = useState({
    startTime: Date.now(),
    answerTimes: [],
    difficultyAdjustment: null
  });
const QuizInterface = ({ quizId, onComplete }) => {
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const loadQuiz = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await quizService.getById(quizId);
      setQuiz(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (quizId) {
      loadQuiz();
    }
  }, [quizId]);

  const handleAnswerSelect = (answerIndex) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQuestion]: answerIndex
    }));
  };

  const handleNext = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      submitQuiz();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

const submitQuiz = async () => {
    setSubmitting(true);

    try {
      const answers = Array.from({ length: quiz.questions.length }, (_, i) => selectedAnswers[i]);
      const result = await quizService.submitQuizResult(1, quizId, answers);
      
      // Track performance data for adaptive learning
      const completionTime = Date.now() - performanceData.startTime;
      const performanceMetrics = {
        completionTime: Math.round(completionTime / 1000), // in seconds
        answerTimes: performanceData.answerTimes,
        accuracy: (result.correctAnswers / result.totalQuestions) * 100,
        difficulty: quiz.difficulty,
        category: quiz.category,
        struggledQuestions: result.results.filter(r => !r.isCorrect).map(r => r.questionIndex)
      };
      
      // Submit performance data for adaptive learning
      await userService.updateLearningAnalytics(1, performanceMetrics);
      
      // Award XP to user
      if (result.xpEarned > 0) {
        await userService.addXP(1, result.xpEarned);
      }

      setResults(result);
      setShowResults(true);
      
      // Enhanced feedback based on performance
      const accuracyMessage = result.score >= 90 ? "Outstanding!" : 
                             result.score >= 75 ? "Great job!" : 
                             result.score >= 60 ? "Good work!" : "Keep practicing!";
      
      toast.success(`${accuracyMessage} +${result.xpEarned} XP earned`);

    } catch (err) {
      toast.error("Failed to submit quiz. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      novice: "text-green-600 bg-green-100",
      guardian: "text-blue-600 bg-blue-100",
      expert: "text-purple-600 bg-purple-100"
    };
    return colors[difficulty] || colors.novice;
  };

  if (loading) return <Loading type="quiz" />;
  if (error) return <Error type="quiz" message={error} onRetry={loadQuiz} />;
  if (!quiz) return <Error message="Quiz not found" />;

  if (showResults && results) {
    return (
      <div className="space-y-6">
        {/* Results Header */}
        <Card className={cn(
          "p-8 text-center",
          results.passed 
            ? "bg-gradient-to-br from-green-500 to-emerald-600 text-white"
            : "bg-gradient-to-br from-orange-500 to-red-600 text-white"
        )}>
          <div className="mb-4">
            <ApperIcon 
              name={results.passed ? "CheckCircle" : "AlertCircle"} 
              size={48} 
              className="mx-auto mb-4"
            />
            <h2 className="text-2xl font-bold font-display mb-2">
              {results.passed ? "Great Job!" : "Keep Learning!"}
            </h2>
            <p className="opacity-90">
              You scored {results.score}% on this {quiz.difficulty} level quiz
            </p>
          </div>

          <div className="flex items-center justify-center gap-8 text-sm opacity-90">
            <div>
              <div className="font-semibold text-xl">{results.correctAnswers}</div>
              <div>Correct</div>
            </div>
            <div className="w-px h-8 bg-white/30"></div>
            <div>
              <div className="font-semibold text-xl">{results.totalQuestions}</div>
              <div>Total</div>
            </div>
            <div className="w-px h-8 bg-white/30"></div>
            <div>
              <div className="font-semibold text-xl">+{results.xpEarned}</div>
              <div>XP Earned</div>
            </div>
          </div>
        </Card>

        {/* Question Review */}
        <div className="space-y-4">
          {quiz.questions.map((question, index) => {
            const questionResult = results.results[index];
            const isCorrect = questionResult?.isCorrect;

            return (
              <Card key={index} className="p-6">
                <div className="flex items-start gap-4">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white font-semibold",
                    isCorrect ? "bg-green-500" : "bg-red-500"
                  )}>
                    <ApperIcon 
                      name={isCorrect ? "Check" : "X"} 
                      size={16}
                    />
                  </div>

                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 mb-3">
                      {index + 1}. {question.question}
                    </h3>

                    <div className="space-y-2 mb-4">
                      {question.options.map((option, optionIndex) => {
                        const isUserAnswer = questionResult?.userAnswer === optionIndex;
                        const isCorrectAnswer = question.correct === optionIndex;

                        return (
                          <div
                            key={optionIndex}
                            className={cn(
                              "p-3 rounded-lg border-2 text-sm",
                              isCorrectAnswer && "border-green-500 bg-green-50 text-green-800",
                              isUserAnswer && !isCorrectAnswer && "border-red-500 bg-red-50 text-red-800",
                              !isUserAnswer && !isCorrectAnswer && "border-gray-200 text-gray-600"
                            )}
                          >
                            <div className="flex items-center gap-2">
                              {isCorrectAnswer && <ApperIcon name="Check" size={14} className="text-green-600" />}
                              {isUserAnswer && !isCorrectAnswer && <ApperIcon name="X" size={14} className="text-red-600" />}
                              <span>{option}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {questionResult?.explanation && (
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-800">
                          <strong>Explanation:</strong> {questionResult.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={onComplete}
            className="flex-1"
          >
            Back to Quizzes
          </Button>
          <Button
            onClick={() => window.location.reload()}
            className="flex-1"
          >
            Take Another Quiz
          </Button>
        </div>
      </div>
    );
  }

  const currentQ = quiz.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;
  const isLastQuestion = currentQuestion === quiz.questions.length - 1;
  const hasSelectedAnswer = selectedAnswers[currentQuestion] !== undefined;

  return (
    <div className="space-y-6">
      {/* Quiz Header */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900 font-display">{quiz.title}</h1>
            <p className="text-sm text-gray-600 mt-1">
              Question {currentQuestion + 1} of {quiz.questions.length}
            </p>
          </div>
          <Badge className={getDifficultyColor(quiz.difficulty)}>
            {quiz.difficulty}
          </Badge>
        </div>

        <Progress value={progress} variant="primary" className="h-2" />
      </Card>

      {/* Question Card */}
      <Card className="p-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 leading-relaxed font-display">
          {currentQ.question}
        </h2>

        <div className="space-y-3 mb-8">
          {currentQ.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswerSelect(index)}
              className={cn(
                "w-full p-4 text-left rounded-xl border-2 transition-all duration-200 hover:scale-[1.02]",
                selectedAnswers[currentQuestion] === index
                  ? "border-primary-500 bg-primary-50 text-primary-800"
                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-6 h-6 rounded-full border-2 flex items-center justify-center",
                  selectedAnswers[currentQuestion] === index
                    ? "border-primary-500 bg-primary-500"
                    : "border-gray-300"
                )}>
                  {selectedAnswers[currentQuestion] === index && (
                    <ApperIcon name="Check" size={12} className="text-white" />
                  )}
                </div>
                <span className="font-medium">{option}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            icon="ChevronLeft"
          >
            Previous
          </Button>

          <div className="text-sm text-gray-500">
            {Object.keys(selectedAnswers).length} of {quiz.questions.length} answered
          </div>

          <Button
            onClick={handleNext}
            disabled={!hasSelectedAnswer}
            loading={submitting}
            icon={isLastQuestion ? "Check" : "ChevronRight"}
            iconPosition="right"
          >
            {isLastQuestion ? "Submit Quiz" : "Next"}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default QuizInterface;