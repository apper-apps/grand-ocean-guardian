import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { eachDayOfInterval, endOfWeek, format, isSameDay, startOfWeek } from "date-fns";
import { streakService } from "@/services/api/streakService";
import { userService } from "@/services/api/userService";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Progress from "@/components/atoms/Progress";
import Badge from "@/components/atoms/Badge";
import Error from "@/components/ui/Error";
import Loading from "@/components/ui/Loading";

const StreakTracker = () => {
const [streaksData, setStreaksData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [checkingIn, setCheckingIn] = useState(false);
  const [showActivities, setShowActivities] = useState(false);
  const [selectedActivities, setSelectedActivities] = useState([]);
  const [selectedExtraActivities, setSelectedExtraActivities] = useState([]);
  const [activeCategory, setActiveCategory] = useState('plasticFree');
  const [showRecovery, setShowRecovery] = useState(false);
  const [showLifelineConfirm, setShowLifelineConfirm] = useState(false);
  const [availableActivities, setAvailableActivities] = useState([]);
  const [availableExtraActivities, setAvailableExtraActivities] = useState([]);
  const userId = 1; // Current user

const loadStreakData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await streakService.getUserStreaks(userId);
      setStreaksData(data);
      
      // Load activities for current category
      const [activities, extraActivities] = await Promise.all([
        streakService.getStreakActivities(activeCategory),
        streakService.getExtraActivities(activeCategory)
      ]);
      setAvailableActivities(activities);
      setAvailableExtraActivities(extraActivities);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadCategoryActivities = async (category) => {
    try {
      const [activities, extraActivities] = await Promise.all([
        streakService.getStreakActivities(category),
        streakService.getExtraActivities(category)
      ]);
      setAvailableActivities(activities);
      setAvailableExtraActivities(extraActivities);
    } catch (err) {
      console.error('Failed to load activities:', err);
    }
  };

  useEffect(() => {
    loadStreakData();
  }, []);

const handleCheckIn = async () => {
    const categoryData = streaksData?.categories[activeCategory];
    
    if (categoryData?.todayCompleted) {
      toast.info("You've already checked in today for this category!");
      return;
    }

    if (selectedActivities.length === 0) {
      setShowActivities(true);
      return;
    }

    setCheckingIn(true);

    try {
      const result = await streakService.checkInCategory(
        userId, 
        activeCategory, 
        selectedActivities, 
        selectedExtraActivities
      );
      
      // Update user streak for category
      await userService.updateCategoryStreak(userId, activeCategory, result.newStreak);
      
      // Award base XP for check-in plus bonus XP
      const baseXP = 5;
      const totalXP = baseXP + result.bonusXP;
      await userService.addXP(userId, totalXP);

      let message = `${streakService.getCategoryDisplayName(activeCategory)} check-in complete! Current streak: ${result.newStreak} days (+${totalXP} XP)`;
      
      if (result.lifelineTokensEarned > 0) {
        message += ` 🛡️ +${result.lifelineTokensEarned} Lifeline Token${result.lifelineTokensEarned > 1 ? 's' : ''}!`;
      }

      toast.success(message);

      if (result.milestoneReached) {
        toast.success(`🎉 ${streakService.getCategoryDisplayName(activeCategory)} milestone reached: ${result.milestoneReached} days!`, {
          autoClose: 5000
        });
      }

      // Reload streak data
      loadStreakData();
      setShowActivities(false);
      setSelectedActivities([]);
      setSelectedExtraActivities([]);

    } catch (err) {
      toast.error("Failed to check in. Please try again.");
    } finally {
      setCheckingIn(false);
    }
  };

  const handleUseLifeline = async () => {
    if (streaksData?.lifelineTokens <= 0) {
      toast.error("No lifeline tokens available!");
      return;
    }

    setShowLifelineConfirm(false);
    
    try {
      const result = await streakService.useLifeline(userId, activeCategory);
      
      toast.success(`Lifeline used! Your ${streakService.getCategoryDisplayName(activeCategory)} streak is protected. ${result.remainingTokens} tokens remaining.`);
      
      // Show recovery content
      setShowRecovery(true);
      
      // Reload data
      loadStreakData();
      
    } catch (err) {
      toast.error("Failed to use lifeline. Please try again.");
    }
  };

  const handleRecoveryComplete = async (challengeType, challengeData = {}) => {
    try {
      const result = await streakService.completeRecoveryChallenge(
        userId, 
        streaksData.recoveryState.brokenStreakCategory, 
        challengeType, 
        challengeData
      );
      
      if (result.xpAwarded > 0) {
        await userService.addXP(userId, result.xpAwarded);
      }

      toast.success(result.message + (result.xpAwarded > 0 ? ` (+${result.xpAwarded} XP)` : ''));

      if (result.recoveryComplete) {
        setShowRecovery(false);
        toast.success("🎉 Recovery journey completed! You can start building new streaks.", {
          autoClose: 5000
        });
      }

      loadStreakData();
      
    } catch (err) {
      toast.error("Failed to complete recovery challenge.");
    }
  };

  const switchCategory = (category) => {
    setActiveCategory(category);
    loadCategoryActivities(category);
    setShowActivities(false);
    setSelectedActivities([]);
    setSelectedExtraActivities([]);
  };

const getMilestoneProgress = (currentStreak, category) => {
    const nextMilestone = streakService.getNextMilestone(currentStreak);
    
    if (!nextMilestone) {
      return { progress: 100, target: 1000, label: `${streakService.getCategoryDisplayName(category)} Legend!` };
    }

    return {
      progress: (currentStreak / nextMilestone) * 100,
      target: nextMilestone,
      label: `${nextMilestone - currentStreak} days to next milestone`
    };
  };

const getWeekCalendar = () => {
    const today = new Date();
    const start = startOfWeek(today);
    const end = endOfWeek(today);
    const days = eachDayOfInterval({ start, end });

    const categoryData = streaksData?.categories[activeCategory];

    return days.map(day => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const entry = categoryData?.recentEntries?.find(e => e.date === dateStr);
      const isToday = isSameDay(day, today);
      const isPast = day < today;
      const isFuture = day > today;

      return {
        date: day,
        dateStr,
        completed: entry?.completed || entry?.lifelineUsed || false,
        lifelineUsed: entry?.lifelineUsed || false,
        bonusXP: entry?.bonusXP || 0,
        extraActivities: entry?.extraActivities?.length || 0,
        isToday,
        isPast,
        isFuture
      };
    });
  };

const getCategoryVariant = (category) => {
    const variants = {
      plasticFree: "coral",
      conservation: "seafoam", 
      learning: "primary",
      community: "primary"
    };
    return variants[category] || "default";
  };

  const activeCategoryData = streaksData?.categories[activeCategory];
  const milestoneInfo = activeCategoryData ? getMilestoneProgress(activeCategoryData.currentStreak, activeCategory) : null;
  const weekDays = getWeekCalendar();

// Handle loading and error states
  if (loading) return <Loading type="card" />;
  if (error) return <Error message={error} onRetry={loadStreakData} />;
  if (!streaksData) return <div className="text-center p-8">No streak data available</div>;
return (
    <div className="space-y-6">
      {/* Header with Category Tabs */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 font-display mb-4">
          Advanced Streak Tracking
        </h1>
        <div className="flex flex-wrap gap-2 justify-center">
          {Object.entries(streaksData.categories).map(([category, data]) => (
            <button
              key={category}
              onClick={() => switchCategory(category)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200",
                activeCategory === category
                  ? "bg-primary-100 text-primary-700 border-2 border-primary-500"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              )}
            >
              <ApperIcon name={streakService.getCategoryIcon(category)} size={16} />
              <span>{streakService.getCategoryDisplayName(category)}</span>
              <Badge variant={data.currentStreak > 0 ? "success" : "default"} className="ml-1">
                {data.currentStreak}
              </Badge>
            </button>
          ))}
        </div>
      </div>

      {/* Lifeline Tokens Display */}
      {streaksData.lifelineTokens > 0 && (
        <Card className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-yellow-100 p-2 rounded-full">
                <ApperIcon name="Shield" size={20} className="text-yellow-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Streak Insurance</h3>
                <p className="text-sm text-gray-600">
                  You have {streaksData.lifelineTokens} lifeline token{streaksData.lifelineTokens !== 1 ? 's' : ''} to protect your streaks
                </p>
              </div>
            </div>
            {!activeCategoryData?.todayCompleted && activeCategoryData?.currentStreak > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowLifelineConfirm(true)}
                className="border-yellow-300 text-yellow-700 hover:bg-yellow-50"
              >
                Use Lifeline
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* Recovery Mode Display */}
      {streaksData.recoveryState.inRecovery && (
        <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <div className="flex items-center gap-3 mb-4">
            <ApperIcon name="BookOpen" size={24} className="text-blue-600" />
            <div>
              <h3 className="font-semibold text-gray-900">Recovery Mode Active</h3>
              <p className="text-sm text-gray-600">
                Complete educational challenges to rebuild your {streakService.getCategoryDisplayName(streaksData.recoveryState.brokenStreakCategory)} streak
              </p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="font-semibold text-lg text-blue-600">
                {streaksData.recoveryState.educationalProgress.articlesRead}
              </div>
              <div className="text-xs text-gray-500">Articles Read</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-lg text-blue-600">
                {streaksData.recoveryState.educationalProgress.videosWatched}
              </div>
              <div className="text-xs text-gray-500">Videos Watched</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-lg text-blue-600">
                {streaksData.recoveryState.educationalProgress.quizzesCompleted}
              </div>
              <div className="text-xs text-gray-500">Quizzes Completed</div>
            </div>
          </div>
          <Button
            onClick={() => setShowRecovery(true)}
            className="w-full"
            variant="primary"
          >
            Continue Recovery Journey
          </Button>
        </Card>
      )}

      {/* Current Category Streak Card */}
      <Card className={cn(
        "p-8 text-center text-white",
        `bg-gradient-to-br from-${getCategoryVariant(activeCategory)}-500 to-${getCategoryVariant(activeCategory)}-600`
      )}>
        <div className="mb-6">
          <div className="text-6xl font-bold font-display mb-2">
            {activeCategoryData?.currentStreak || 0}
          </div>
          <div className="text-xl opacity-90">
            {streakService.getCategoryDisplayName(activeCategory)} Streak
          </div>
        </div>

        <div className="flex items-center justify-center gap-8 text-sm opacity-90 mb-6">
          <div>
            <div className="font-semibold text-lg">{activeCategoryData?.bestStreak || 0}</div>
            <div>Best Streak</div>
          </div>
          <div className="w-px h-12 bg-white/30"></div>
          <div>
            <div className="font-semibold text-lg">
              {activeCategoryData?.recentEntries?.filter(e => e.completed || e.lifelineUsed).length || 0}
            </div>
            <div>Total Days</div>
          </div>
        </div>

        {!activeCategoryData?.todayCompleted ? (
          <div className="space-y-3">
            <Button
              onClick={handleCheckIn}
              loading={checkingIn}
              className="bg-white text-gray-700 hover:bg-gray-50 font-semibold px-8"
              size="lg"
            >
              {showActivities ? "Complete Check-in" : `Check In ${streakService.getCategoryDisplayName(activeCategory)}`}
            </Button>
            {activeCategoryData?.currentStreak > 0 && streaksData.lifelineTokens > 0 && (
              <div className="text-sm opacity-80">
                Or use a lifeline token to protect your streak
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2 text-green-200">
            <ApperIcon name="CheckCircle" size={20} />
            <span className="font-medium">Checked in today!</span>
          </div>
        )}
      </Card>

      {/* Activities Selection */}
      {showActivities && !activeCategoryData?.todayCompleted && (
        <Card className="p-6">
          <h3 className="font-semibold text-gray-900 mb-4 font-display">
            What {streakService.getCategoryDisplayName(activeCategory).toLowerCase()} actions did you take today?
          </h3>
          
          {/* Regular Activities */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Daily Activities (Required)</h4>
            <div className="grid grid-cols-1 gap-3">
              {availableActivities.slice(0, 8).map(activityId => (
                <button
                  key={activityId}
                  onClick={() => {
                    setSelectedActivities(prev => 
                      prev.includes(activityId)
                        ? prev.filter(id => id !== activityId)
                        : [...prev, activityId]
                    );
                  }}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-200",
                    selectedActivities.includes(activityId)
                      ? "bg-primary-100 border-2 border-primary-500 text-primary-700"
                      : "bg-gray-50 border-2 border-transparent hover:bg-gray-100"
                  )}
                >
                  <ApperIcon 
                    name={streakService.getCategoryIcon(activeCategory)} 
                    size={20}
                    className={selectedActivities.includes(activityId) ? "text-primary-600" : "text-gray-500"}
                  />
                  <span className="flex-1">{streakService.getActivityDisplayName(activityId)}</span>
                  {selectedActivities.includes(activityId) && (
                    <ApperIcon name="Check" size={16} className="text-primary-600" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Extra Activities for Lifeline Tokens */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">
              Bonus Activities (Earn Lifeline Tokens) 
              <Badge variant="warning" className="ml-2">+1 token per 2 activities</Badge>
            </h4>
            <div className="grid grid-cols-1 gap-3">
              {availableExtraActivities.map(activityId => (
                <button
                  key={activityId}
                  onClick={() => {
                    setSelectedExtraActivities(prev => 
                      prev.includes(activityId)
                        ? prev.filter(id => id !== activityId)
                        : [...prev, activityId]
                    );
                  }}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-200",
                    selectedExtraActivities.includes(activityId)
                      ? "bg-yellow-100 border-2 border-yellow-500 text-yellow-700"
                      : "bg-gray-50 border-2 border-transparent hover:bg-gray-100"
                  )}
                >
                  <ApperIcon 
                    name="Star" 
                    size={20}
                    className={selectedExtraActivities.includes(activityId) ? "text-yellow-600" : "text-gray-500"}
                  />
                  <span className="flex-1">{streakService.getActivityDisplayName(activityId)}</span>
                  {selectedExtraActivities.includes(activityId) && (
                    <ApperIcon name="Check" size={16} className="text-yellow-600" />
                  )}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowActivities(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCheckIn}
              loading={checkingIn}
              disabled={selectedActivities.length === 0}
              className="flex-1"
            >
              Check In ({selectedActivities.length + selectedExtraActivities.length})
            </Button>
          </div>
        </Card>
      )}

      {/* Lifeline Confirmation Dialog */}
      {showLifelineConfirm && (
        <Card className="p-6 border-2 border-yellow-300 bg-yellow-50">
          <div className="text-center">
            <ApperIcon name="Shield" size={48} className="text-yellow-600 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-900 mb-2">Use Lifeline Token?</h3>
            <p className="text-gray-600 mb-6">
              This will protect your {streakService.getCategoryDisplayName(activeCategory)} streak and put you in recovery mode with educational content.
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowLifelineConfirm(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleUseLifeline}
                className="flex-1 bg-yellow-500 hover:bg-yellow-600"
              >
                Use Lifeline
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Recovery Content */}
      {showRecovery && streaksData.recoveryState.inRecovery && (
        <Card className="p-6">
          <h3 className="font-semibold text-gray-900 mb-4 font-display">Recovery Challenges</h3>
          <p className="text-gray-600 mb-6">
            Complete these educational challenges to rebuild your {streakService.getCategoryDisplayName(streaksData.recoveryState.brokenStreakCategory)} knowledge and restart your streak stronger than ever.
          </p>
          
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-xl">
              <h4 className="font-medium text-blue-900 mb-2">📚 Read Educational Articles</h4>
              <p className="text-sm text-blue-700 mb-3">Learn the fundamentals and latest research</p>
              <Button
                size="sm"
                onClick={() => handleRecoveryComplete('article')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Complete Article Reading (+10 XP)
              </Button>
            </div>
            
            <div className="p-4 bg-green-50 rounded-xl">
              <h4 className="font-medium text-green-900 mb-2">🎥 Watch Educational Videos</h4>
              <p className="text-sm text-green-700 mb-3">See practical demonstrations and expert insights</p>
              <Button
                size="sm"
                onClick={() => handleRecoveryComplete('video')}
                className="bg-green-600 hover:bg-green-700"
              >
                Complete Video Watching (+15 XP)
              </Button>
            </div>
            
            <div className="p-4 bg-purple-50 rounded-xl">
              <h4 className="font-medium text-purple-900 mb-2">🧠 Take Knowledge Quiz</h4>
              <p className="text-sm text-purple-700 mb-3">Test your understanding and earn bonus points</p>
              <Button
                size="sm"
                onClick={() => handleRecoveryComplete('quiz', { score: 85 })}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Complete Quiz (80%+ for +25 XP)
              </Button>
            </div>
          </div>
          
          <div className="mt-6 pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={() => setShowRecovery(false)}
              className="w-full"
            >
              Close Recovery Center
            </Button>
          </div>
        </Card>
      )}

      {/* Milestone Progress */}
      {milestoneInfo && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 font-display">
              {streakService.getCategoryDisplayName(activeCategory)} Milestone
            </h3>
            <ApperIcon name={streakService.getCategoryIcon(activeCategory)} size={20} className="text-gray-500" />
          </div>

          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Progress to {milestoneInfo.target} days</span>
              <span>{activeCategoryData?.currentStreak || 0}/{milestoneInfo.target}</span>
            </div>
            <Progress 
              value={milestoneInfo.progress} 
              variant={getCategoryVariant(activeCategory)}
              className="h-3"
            />
          </div>

          <p className="text-sm text-gray-600 text-center">
            {milestoneInfo.label}
          </p>
        </Card>
      )}

      {/* Week Calendar */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4 font-display">
          This Week - {streakService.getCategoryDisplayName(activeCategory)}
        </h3>
        
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day, index) => (
            <div key={index} className="text-center">
              <div className="text-xs text-gray-500 mb-2">
                {format(day.date, 'EEE')}
              </div>
              <div className="relative">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium mx-auto relative",
                    day.isToday && "ring-2 ring-primary-500 ring-offset-2",
                    day.completed && !day.lifelineUsed && "bg-green-500 text-white",
                    day.lifelineUsed && "bg-yellow-500 text-white",
                    !day.completed && day.isPast && "bg-red-100 text-red-600",
                    !day.completed && day.isToday && "bg-coral-100 text-coral-600",
                    !day.completed && day.isFuture && "bg-gray-100 text-gray-400"
                  )}
                >
                  {day.completed ? (
                    day.lifelineUsed ? (
                      <ApperIcon name="Shield" size={14} />
                    ) : (
                      <ApperIcon name="Check" size={14} />
                    )
                  ) : (
                    format(day.date, 'd')
                  )}
                </div>
                {day.extraActivities > 0 && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-yellow-900">+</span>
                  </div>
                )}
              </div>
              {day.bonusXP > 0 && (
                <div className="text-xs text-yellow-600 font-medium mt-1">
                  +{day.bonusXP}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500 flex-wrap">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Completed</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span>Lifeline Used</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-100 rounded-full"></div>
            <span>Missed</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-coral-100 rounded-full"></div>
            <span>Today</span>
          </div>
        </div>
      </Card>

      {/* Smart Reminders Section */}
      {streaksData.smartReminders && (
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <ApperIcon name="Bell" size={20} className="text-primary-600" />
            <h3 className="font-semibold text-gray-900 font-display">Smart Reminders</h3>
          </div>
          
          {streaksData.smartReminders.riskCategories.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-red-700 mb-2">⚠️ At Risk Streaks</h4>
              <div className="space-y-2">
                {streaksData.smartReminders.riskCategories.map(risk => (
                  <div key={risk.category} className="flex items-center justify-between p-2 bg-red-50 rounded-lg">
                    <span className="text-sm text-red-800">
                      {streakService.getCategoryDisplayName(risk.category)}: {risk.streak} days
                    </span>
                    <Badge variant="danger">
                      {risk.riskLevel} risk
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="text-sm text-gray-600">
            <p>🧠 Machine learning suggests optimal check-in times based on your engagement patterns.</p>
            <p className="mt-1">📱 Smart notifications will adapt to your schedule and preferences.</p>
          </div>
        </Card>
      )}

      {/* Category Summary */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4 font-display">All Categories Overview</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(streaksData.categories).map(([category, data]) => (
            <div
              key={category}
              className={cn(
                "p-4 rounded-xl border-2 transition-all cursor-pointer",
                activeCategory === category
                  ? "border-primary-500 bg-primary-50"
                  : "border-gray-200 hover:border-gray-300"
              )}
              onClick={() => switchCategory(category)}
            >
              <div className="flex items-center gap-2 mb-2">
                <ApperIcon name={streakService.getCategoryIcon(category)} size={16} />
                <span className="text-sm font-medium">
                  {streakService.getCategoryDisplayName(category)}
                </span>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {data.currentStreak}
              </div>
              <div className="text-xs text-gray-500">
                Best: {data.bestStreak} days
              </div>
              {data.todayCompleted && (
                <div className="flex items-center gap-1 mt-2">
                  <ApperIcon name="CheckCircle" size={12} className="text-green-500" />
                  <span className="text-xs text-green-600">Done today</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default StreakTracker;