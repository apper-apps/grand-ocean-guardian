import { useState, useEffect } from "react";
import QuizCard from "@/components/molecules/QuizCard";
import QuizInterface from "@/components/organisms/QuizInterface";
import Card from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import ApperIcon from "@/components/ApperIcon";
import { quizService } from "@/services/api/quizService";

const LearnPage = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [dailyQuiz, setDailyQuiz] = useState(null);

  const loadQuizzes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [quizzesData, categoriesData, dailyQuizData] = await Promise.all([
        quizService.getAll(),
        quizService.getQuizCategories(),
        quizService.getDailyQuiz()
      ]);
      
      setQuizzes(quizzesData);
      setCategories(categoriesData);
      setDailyQuiz(dailyQuizData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuizzes();
  }, []);

  const handleStartQuiz = (quizId) => {
    setSelectedQuiz(quizId);
  };

  const handleQuizComplete = () => {
    setSelectedQuiz(null);
    // Refresh data to show updated progress
    loadQuizzes();
  };

  const getDifficultyInfo = (difficulty) => {
    const info = {
      novice: { 
        color: "text-green-600 bg-green-100", 
        icon: "Leaf",
        description: "Basic ocean facts"
      },
      guardian: { 
        color: "text-blue-600 bg-blue-100", 
        icon: "Shield",
        description: "Conservation strategies"
      },
      expert: { 
        color: "text-purple-600 bg-purple-100", 
        icon: "Crown",
        description: "Advanced marine science"
      }
    };
    return info[difficulty] || info.novice;
  };

  const filteredQuizzes = selectedDifficulty === "all" 
    ? quizzes 
    : quizzes.filter(quiz => quiz.difficulty === selectedDifficulty);

  if (selectedQuiz) {
    return (
      <QuizInterface 
        quizId={selectedQuiz} 
        onComplete={handleQuizComplete} 
      />
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Loading />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Loading />
          <Loading />
        </div>
      </div>
    );
  }

  if (error) {
    return <Error message={error} onRetry={loadQuizzes} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 font-display mb-2">
          Ocean Learning Hub
        </h1>
        <p className="text-gray-600">
          Expand your knowledge about marine conservation and ocean science
        </p>
      </div>

      {/* Daily Quiz Spotlight */}
      {dailyQuiz && (
        <Card className="p-6 bg-gradient-to-r from-coral-500 to-orange-600 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <ApperIcon name="Sparkles" size={100} className="absolute top-4 right-4" />
          </div>
          
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-4">
              <div>
                <Badge className="bg-white/20 text-white mb-2">
                  <ApperIcon name="Star" size={12} className="mr-1" />
                  Daily Challenge
                </Badge>
                <h2 className="text-xl font-bold font-display mb-1">
                  {dailyQuiz.title}
                </h2>
                <p className="text-white/80 text-sm">
                  Complete today's quiz to earn bonus XP!
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">+{Math.round(dailyQuiz.xpReward * 1.5)}</div>
                <div className="text-xs opacity-80">Bonus XP</div>
              </div>
            </div>

            <button
              onClick={() => handleStartQuiz(dailyQuiz.Id)}
              className="bg-white text-coral-600 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors inline-flex items-center gap-2"
            >
              <ApperIcon name="Play" size={16} />
              Start Daily Quiz
            </button>
          </div>
        </Card>
      )}

      {/* Difficulty Filter */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-3 items-center">
          <span className="text-sm font-medium text-gray-700 mr-2">Filter by level:</span>
          
          <button
            onClick={() => setSelectedDifficulty("all")}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              selectedDifficulty === "all"
                ? "bg-primary-100 text-primary-700"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            }`}
          >
            All Levels
          </button>

          {["novice", "guardian", "expert"].map(difficulty => {
            const info = getDifficultyInfo(difficulty);
            return (
              <button
                key={difficulty}
                onClick={() => setSelectedDifficulty(difficulty)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors inline-flex items-center gap-1 ${
                  selectedDifficulty === difficulty
                    ? info.color
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                <ApperIcon name={info.icon} size={14} />
                {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
              </button>
            );
          })}
        </div>
      </Card>

      {/* Quiz Categories Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {categories.map(category => (
          <Card key={category.name} className="p-4 text-center">
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <ApperIcon 
                name={category.name === "marine-biology" ? "Fish" : 
                      category.name === "conservation" ? "Shield" : "Brain"} 
                size={24} 
                className="text-primary-600" 
              />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1 font-display">
              {category.displayName}
            </h3>
            <p className="text-sm text-gray-600">
              {category.count} quiz{category.count !== 1 ? "es" : ""} available
            </p>
          </Card>
        ))}
      </div>

      {/* Available Quizzes */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 font-display">
            Available Quizzes
          </h2>
          <span className="text-sm text-gray-600">
            {filteredQuizzes.length} quiz{filteredQuizzes.length !== 1 ? "es" : ""}
          </span>
        </div>

        {filteredQuizzes.length === 0 ? (
          <Empty
            title="No Quizzes Found"
            description="Try adjusting your filters or check back later for new content."
            icon="BookOpen"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredQuizzes.map((quiz) => (
              <QuizCard
                key={quiz.Id}
                quiz={quiz}
                onStart={() => handleStartQuiz(quiz.Id)}
                completed={false} // TODO: Track completion status
              />
            ))}
          </div>
        )}
      </div>

      {/* Learning Progress */}
      <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <ApperIcon name="GraduationCap" size={32} className="text-primary-500 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-900 mb-2 font-display">
            Keep Learning!
          </h3>
          <p className="text-gray-600 text-sm mb-4">
            The more you learn about ocean conservation, the better equipped you are to make a difference.
          </p>
          
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600 font-display">
                {quizzes.length}
              </div>
              <div className="text-xs text-gray-600">Total Quizzes</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600 font-display">
                0
              </div>
              <div className="text-xs text-gray-600">Completed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600 font-display">
                {quizzes.reduce((sum, quiz) => sum + quiz.xpReward, 0)}
              </div>
              <div className="text-xs text-gray-600">Total XP Available</div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default LearnPage;