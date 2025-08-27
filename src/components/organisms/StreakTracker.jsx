import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from "date-fns";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Progress from "@/components/atoms/Progress";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import ApperIcon from "@/components/ApperIcon";
import { cn } from "@/utils/cn";
import { streakService } from "@/services/api/streakService";
import { userService } from "@/services/api/userService";

const StreakTracker = () => {
  const [streakData, setStreakData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [checkingIn, setCheckingIn] = useState(false);
  const [showActivities, setShowActivities] = useState(false);
  const [selectedActivities, setSelectedActivities] = useState([]);

  const userId = 1; // Current user

  const loadStreakData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await streakService.getUserStreak(userId);
      setStreakData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStreakData();
  }, []);

  const handleCheckIn = async () => {
    if (streakData?.todayCompleted) {
      toast.info("You've already checked in today!");
      return;
    }

    if (selectedActivities.length === 0) {
      setShowActivities(true);
      return;
    }

    setCheckingIn(true);

    try {
      const result = await streakService.checkInToday(userId, selectedActivities);
      
      // Update user streak
      await userService.updateStreak(userId, result.newStreak);
      
      // Award XP for check-in
      await userService.addXP(userId, 5);

      toast.success(`Check-in complete! Current streak: ${result.newStreak} days (+5 XP)`);

      if (result.milestoneReached) {
        toast.success(`🎉 Milestone reached: ${result.milestoneReached} days!`, {
          autoClose: 5000
        });
      }

      // Reload streak data
      loadStreakData();
      setShowActivities(false);
      setSelectedActivities([]);

    } catch (err) {
      toast.error("Failed to check in. Please try again.");
    } finally {
      setCheckingIn(false);
    }
  };

  const getMilestoneProgress = (currentStreak) => {
    const milestones = [7, 30, 100, 365];
    const nextMilestone = milestones.find(m => m > currentStreak);
    
    if (!nextMilestone) {
      return { progress: 100, target: 365, label: "Legendary Guardian!" };
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

    return days.map(day => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const entry = streakData?.recentEntries?.find(e => e.date === dateStr);
      const isToday = isSameDay(day, today);
      const isPast = day < today;
      const isFuture = day > today;

      return {
        date: day,
        dateStr,
        completed: entry?.completed || false,
        isToday,
        isPast,
        isFuture
      };
    });
  };

  const activities = [
    { id: "avoided-plastic-bag", label: "Avoided plastic bags", icon: "ShoppingBag" },
    { id: "used-reusable-bottle", label: "Used reusable water bottle", icon: "Coffee" },
    { id: "brought-reusable-cup", label: "Brought reusable cup", icon: "Cup" },
    { id: "refused-plastic-straw", label: "Refused plastic straw", icon: "Minus" },
    { id: "used-metal-utensils", label: "Used metal utensils", icon: "Utensils" },
    { id: "bought-bulk-items", label: "Bought items in bulk", icon: "Package" },
    { id: "zero-waste-lunch", label: "Had zero-waste lunch", icon: "Apple" },
    { id: "composted-organics", label: "Composted organic waste", icon: "Leaf" }
  ];

  if (loading) return <Loading type="card" />;
  if (error) return <Error message={error} onRetry={loadStreakData} />;

  const milestoneInfo = getMilestoneProgress(streakData?.currentStreak || 0);
  const weekDays = getWeekCalendar();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 font-display mb-2">
          Plastic-Free Streak
        </h1>
        <p className="text-gray-600">
          Track your daily progress toward a plastic-free lifestyle
        </p>
      </div>

      {/* Current Streak Card */}
      <Card className="p-8 text-center bg-gradient-to-br from-primary-500 to-seafoam-500 text-white">
        <div className="mb-6">
          <div className="text-6xl font-bold font-display mb-2">
            {streakData?.currentStreak || 0}
          </div>
          <div className="text-xl opacity-90">
            Day{(streakData?.currentStreak || 0) !== 1 ? 's' : ''} Streak
          </div>
        </div>

        <div className="flex items-center justify-center gap-8 text-sm opacity-90 mb-6">
          <div>
            <div className="font-semibold text-lg">{streakData?.bestStreak || 0}</div>
            <div>Best Streak</div>
          </div>
          <div className="w-px h-12 bg-white/30"></div>
          <div>
            <div className="font-semibold text-lg">
              {streakData?.recentEntries?.filter(e => e.completed).length || 0}
            </div>
            <div>Total Days</div>
          </div>
        </div>

        {!streakData?.todayCompleted ? (
          <Button
            onClick={handleCheckIn}
            loading={checkingIn}
            className="bg-white text-primary-600 hover:bg-gray-50 font-semibold px-8"
            size="lg"
          >
            {showActivities ? "Complete Check-in" : "Check In Today"}
          </Button>
        ) : (
          <div className="flex items-center justify-center gap-2 text-green-200">
            <ApperIcon name="CheckCircle" size={20} />
            <span className="font-medium">Checked in today!</span>
          </div>
        )}
      </Card>

      {/* Activities Selection */}
      {showActivities && !streakData?.todayCompleted && (
        <Card className="p-6">
          <h3 className="font-semibold text-gray-900 mb-4 font-display">
            What plastic-free actions did you take today?
          </h3>
          <div className="grid grid-cols-1 gap-3 mb-6">
            {activities.map(activity => (
              <button
                key={activity.id}
                onClick={() => {
                  setSelectedActivities(prev => 
                    prev.includes(activity.id)
                      ? prev.filter(id => id !== activity.id)
                      : [...prev, activity.id]
                  );
                }}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-200",
                  selectedActivities.includes(activity.id)
                    ? "bg-primary-100 border-2 border-primary-500 text-primary-700"
                    : "bg-gray-50 border-2 border-transparent hover:bg-gray-100"
                )}
              >
                <ApperIcon 
                  name={activity.icon} 
                  size={20}
                  className={selectedActivities.includes(activity.id) ? "text-primary-600" : "text-gray-500"}
                />
                <span className="flex-1">{activity.label}</span>
                {selectedActivities.includes(activity.id) && (
                  <ApperIcon name="Check" size={16} className="text-primary-600" />
                )}
              </button>
            ))}
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
              Check In ({selectedActivities.length})
            </Button>
          </div>
        </Card>
      )}

      {/* Milestone Progress */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 font-display">Next Milestone</h3>
          <span className="text-2xl">🎯</span>
        </div>

        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progress to {milestoneInfo.target} days</span>
            <span>{streakData?.currentStreak || 0}/{milestoneInfo.target}</span>
          </div>
          <Progress 
            value={milestoneInfo.progress} 
            variant="coral"
            className="h-3"
          />
        </div>

        <p className="text-sm text-gray-600 text-center">
          {milestoneInfo.label}
        </p>
      </Card>

      {/* Week Calendar */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4 font-display">This Week</h3>
        
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day, index) => (
            <div key={index} className="text-center">
              <div className="text-xs text-gray-500 mb-2">
                {format(day.date, 'EEE')}
              </div>
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium mx-auto",
                  day.isToday && "ring-2 ring-primary-500 ring-offset-2",
                  day.completed && "bg-green-500 text-white",
                  !day.completed && day.isPast && "bg-red-100 text-red-600",
                  !day.completed && day.isToday && "bg-coral-100 text-coral-600",
                  !day.completed && day.isFuture && "bg-gray-100 text-gray-400"
                )}
              >
                {day.completed ? (
                  <ApperIcon name="Check" size={14} />
                ) : (
                  format(day.date, 'd')
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Completed</span>
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
    </div>
  );
};

export default StreakTracker;