import React, { useEffect, useState } from "react";
import { quizService } from "@/services/api/quizService";
import { userService } from "@/services/api/userService";
import ApperIcon from "@/components/ApperIcon";
import QuizCard from "@/components/molecules/QuizCard";
import Card from "@/components/atoms/Card";
import Progress from "@/components/atoms/Progress";
import Badge from "@/components/atoms/Badge";
import QuizInterface from "@/components/organisms/QuizInterface";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import Loading from "@/components/ui/Loading";

const LearnPage = () => {
const [quizzes, setQuizzes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [dailyQuiz, setDailyQuiz] = useState(null);
  const [learningPaths, setLearningPaths] = useState([]);
  const [userProgress, setUserProgress] = useState(null);
  const [recommendedQuizzes, setRecommendedQuizzes] = useState([]);
  const [selectedPath, setSelectedPath] = useState(null);
  const [adaptiveContent, setAdaptiveContent] = useState(null);
const loadLearningData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [
        quizzesData, 
        categoriesData, 
        dailyQuizData,
        learningPathsData,
        userProgressData,
        recommendedData,
        adaptiveData
      ] = await Promise.all([
        quizService.getAll(),
        quizService.getQuizCategories(),
        quizService.getDailyQuiz(),
        quizService.getLearningPaths(),
        userService.getUserLearningProgress(1),
        quizService.getRecommendedQuizzes(1),
        quizService.getAdaptiveContent(1)
      ]);
      
      setQuizzes(quizzesData);
      setCategories(categoriesData);
      setDailyQuiz(dailyQuizData);
      setLearningPaths(learningPathsData);
      setUserProgress(userProgressData);
      setRecommendedQuizzes(recommendedData);
      setAdaptiveContent(adaptiveData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

useEffect(() => {
    loadLearningData();
  }, []);

  const handleStartQuiz = (quizId) => {
    setSelectedQuiz(quizId);
  };

const handleQuizComplete = () => {
    setSelectedQuiz(null);
    // Refresh data to show updated progress
    loadLearningData();
  };

  const getDifficultyInfo = (difficulty) => {
const info = {
      novice: { 
        color: "text-green-600 bg-green-100", 
        icon: "Seedling",
        description: "Building foundation knowledge",
        level: "Beginner"
      },
      guardian: { 
        color: "text-blue-600 bg-blue-100", 
        icon: "Shield",
        description: "Developing conservation skills",
        level: "Intermediate"
      },
      expert: { 
        color: "text-purple-600 bg-purple-100", 
        icon: "GraduationCap",
        description: "Mastering marine science",
        level: "Advanced"
      }
    };
    return info[difficulty] || info.novice;
  };

  const getPathProgress = (pathId) => {
    if (!userProgress?.pathProgress) return 0;
    const progress = userProgress.pathProgress[pathId];
    return progress ? (progress.completed / progress.total) * 100 : 0;
  };

  const getNextRecommendedQuiz = (pathId) => {
    return recommendedQuizzes.find(quiz => quiz.learningPath === pathId);
  };

const filteredQuizzes = selectedDifficulty === "all" 
    ? quizzes 
    : quizzes.filter(quiz => quiz.difficulty === selectedDifficulty);

  const handleStartPath = (pathId) => {
    setSelectedPath(pathId);
    const nextQuiz = getNextRecommendedQuiz(pathId);
    if (nextQuiz) {
      handleStartQuiz(nextQuiz.Id);
    }
  };
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
    return <Error message={error} onRetry={loadLearningData} />;
  }

  return (
<div className="space-y-6">
      {/* Adaptive Learning Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 font-display mb-2">
          Adaptive Ocean Learning
        </h1>
        <p className="text-gray-600 mb-4">
          Personalized learning paths that adapt to your progress and interests
        </p>
        
        {userProgress && (
          <div className="flex items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <ApperIcon name="Target" size={16} className="text-primary-500" />
              <span>Level {userProgress.currentLevel}</span>
            </div>
            <div className="flex items-center gap-2">
              <ApperIcon name="TrendingUp" size={16} className="text-coral-500" />
              <span>{userProgress.accuracy}% Accuracy</span>
            </div>
            <div className="flex items-center gap-2">
              <ApperIcon name="Clock" size={16} className="text-seafoam-500" />
              <span>{userProgress.totalTime} mins studied</span>
            </div>
          </div>
        )}
      </div>

      {/* Daily Quiz Spotlight */}
{/* Learning Paths */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 font-display">
            Personalized Learning Paths
          </h2>
          <Badge variant="secondary" size="sm">
            <ApperIcon name="Brain" size={12} className="mr-1" />
            AI Powered
          </Badge>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {learningPaths.map(path => {
            const progress = getPathProgress(path.Id);
            const nextQuiz = getNextRecommendedQuiz(path.Id);
            const difficultyInfo = getDifficultyInfo(path.difficulty);
            
            return (
              <Card 
                key={path.Id} 
                className="p-6 cursor-pointer hover:shadow-elevated transition-all duration-200 relative overflow-hidden"
                onClick={() => handleStartPath(path.Id)}
              >
                <div className="absolute top-4 right-4">
                  <div className={`w-3 h-3 rounded-full ${progress > 75 ? 'bg-green-500' : progress > 50 ? 'bg-yellow-500' : progress > 25 ? 'bg-blue-500' : 'bg-gray-300'}`} />
                </div>
                
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${difficultyInfo.color}`}>
                  <ApperIcon name={path.icon} size={24} />
                </div>
                
                <h3 className="font-semibold text-gray-900 mb-2 font-display">
                  {path.title}
                </h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {path.description}
                </p>
                
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Progress</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} max={100} variant="primary" size="sm" />
                </div>
                
                <div className="flex items-center justify-between text-xs">
                  <Badge size="sm" className={difficultyInfo.color}>
                    {difficultyInfo.level}
                  </Badge>
                  <span className="text-gray-500">
                    {path.estimatedTime} mins
                  </span>
                </div>
                
                {nextQuiz && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs text-primary-600 font-medium">
                      Next: {nextQuiz.title}
                    </p>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>

      {/* Adaptive Recommendations */}
      {adaptiveContent && (
        <Card className="p-6 bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <ApperIcon name="Lightbulb" size={24} className="text-purple-600" />
            </div>
            
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-2 font-display">
                Adaptive Learning Insight
              </h3>
              <p className="text-gray-700 mb-3">
                {adaptiveContent.insight}
              </p>
              
              <div className="flex items-center gap-4">
                <button
                  onClick={() => handleStartQuiz(adaptiveContent.recommendedQuiz.Id)}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors inline-flex items-center gap-2"
                >
                  <ApperIcon name="Play" size={14} />
                  Try Recommended Quiz
                </button>
                
                <div className="flex items-center gap-2 text-sm text-purple-600">
                  <ApperIcon name="Target" size={14} />
                  <span>+{adaptiveContent.recommendedQuiz.xpReward} XP</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Daily Challenge */}
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

{/* Performance Analytics */}
      {userProgress && (
        <Card className="p-6">
          <h3 className="font-semibold text-gray-900 mb-4 font-display">
            Your Learning Analytics
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-xl">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <ApperIcon name="CheckCircle" size={16} className="text-white" />
              </div>
              <div className="text-2xl font-bold text-green-600 font-display">
                {userProgress.strongTopics?.length || 0}
              </div>
              <div className="text-xs text-gray-600">Strong Topics</div>
            </div>
            
            <div className="text-center p-4 bg-yellow-50 rounded-xl">
              <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <ApperIcon name="Clock" size={16} className="text-white" />
              </div>
              <div className="text-2xl font-bold text-yellow-600 font-display">
                {userProgress.averageTime || 0}s
              </div>
              <div className="text-xs text-gray-600">Avg. Response</div>
            </div>
            
            <div className="text-center p-4 bg-blue-50 rounded-xl">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <ApperIcon name="TrendingUp" size={16} className="text-white" />
              </div>
              <div className="text-2xl font-bold text-blue-600 font-display">
                {userProgress.improvementRate || 0}%
              </div>
              <div className="text-xs text-gray-600">Improvement</div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-xl">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <ApperIcon name="Target" size={16} className="text-white" />
              </div>
              <div className="text-2xl font-bold text-purple-600 font-display">
                {userProgress.streakDays || 0}
              </div>
              <div className="text-xs text-gray-600">Day Streak</div>
            </div>
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
                {info.level}
              </button>
            );
          })}
        </div>
      </Card>

{/* Topic Specialization Tracks */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 font-display">
          Specialization Tracks
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {categories.map(category => {
            const categoryProgress = userProgress?.categoryProgress?.[category.name] || 0;
            const isRecommended = adaptiveContent?.recommendedCategories?.includes(category.name);
            
            return (
              <Card key={category.name} className={`p-4 text-center relative ${isRecommended ? 'ring-2 ring-purple-200 bg-purple-50' : ''}`}>
                {isRecommended && (
                  <div className="absolute top-2 right-2">
                    <Badge size="sm" className="bg-purple-100 text-purple-700">
                      Recommended
                    </Badge>
                  </div>
                )}
                
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
                <p className="text-sm text-gray-600 mb-3">
                  {category.count} quiz{category.count !== 1 ? "es" : ""} available
                </p>
                
                <div className="mb-2">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Mastery</span>
                    <span>{Math.round(categoryProgress)}%</span>
                  </div>
                  <Progress value={categoryProgress} max={100} variant="primary" size="sm" />
                </div>
                
                {categoryProgress > 75 && (
                  <Badge size="sm" variant="success">
                    <ApperIcon name="Star" size={10} className="mr-1" />
                    Expert
                  </Badge>
                )}
              </Card>
            );
          })}
        </div>
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
            {filteredQuizzes.map((quiz) => {
              const isCompleted = userProgress?.completedQuizzes?.includes(quiz.Id) || false;
              const isRecommended = recommendedQuizzes.some(rq => rq.Id === quiz.Id);
              
              return (
                <QuizCard
                  key={quiz.Id}
                  quiz={quiz}
                  onStart={() => handleStartQuiz(quiz.Id)}
                  completed={isCompleted}
                  recommended={isRecommended}
                  userProgress={userProgress}
                />
              );
            })}
          </div>
        )}
      </div>

{/* Adaptive Learning Progress */}
      <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <ApperIcon name="Brain" size={32} className="text-primary-500 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-900 mb-2 font-display">
            Your Adaptive Learning Journey
          </h3>
          <p className="text-gray-600 text-sm mb-4">
            Our AI adapts to your learning style and pace to maximize your conservation knowledge.
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600 font-display">
                {userProgress?.completedQuizzes?.length || 0}
              </div>
              <div className="text-xs text-gray-600">Quizzes Completed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600 font-display">
                {userProgress?.accuracy || 0}%
              </div>
              <div className="text-xs text-gray-600">Current Accuracy</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600 font-display">
                {userProgress?.currentLevel || 1}
              </div>
              <div className="text-xs text-gray-600">Learning Level</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-coral-600 font-display">
                {userProgress?.adaptiveScore || 0}
              </div>
              <div className="text-xs text-gray-600">Adaptive Score</div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default LearnPage;