import Card from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";
import ApperIcon from "@/components/ApperIcon";
import { cn } from "@/utils/cn";

const QuizCard = ({ quiz, onStart, className, completed = false }) => {
  const getDifficultyInfo = (difficulty) => {
    const info = {
      novice: {
        color: "text-green-600 bg-green-100",
        icon: "Leaf"
      },
      guardian: {
        color: "text-blue-600 bg-blue-100", 
        icon: "Shield"
      },
      expert: {
        color: "text-purple-600 bg-purple-100",
        icon: "Crown"
      }
    };
    return info[difficulty] || info.novice;
  };

  const difficultyInfo = getDifficultyInfo(quiz.difficulty);

  return (
    <Card 
      hover
      onClick={onStart}
      className={cn(
        "p-6 cursor-pointer relative overflow-hidden",
        completed && "ring-2 ring-green-200 bg-gradient-to-br from-green-50 to-emerald-50",
        className
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center",
          completed 
            ? "bg-gradient-to-br from-green-500 to-emerald-600 text-white"
            : "bg-primary-100 text-primary-600"
        )}>
          <ApperIcon 
            name={completed ? "CheckCircle" : difficultyInfo.icon} 
            size={24} 
          />
        </div>
        
        <div className="flex flex-col items-end gap-1">
          <Badge className={difficultyInfo.color}>
            {quiz.difficulty}
          </Badge>
          {completed && (
            <Badge variant="success" size="sm">
              Completed
            </Badge>
          )}
        </div>
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-2 font-display">
        {quiz.title}
      </h3>
      
      <p className="text-sm text-gray-600 mb-4">
        {quiz.questions?.length || 5} questions • +{quiz.xpReward} XP
      </p>

      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500 uppercase tracking-wider">
          {quiz.category?.replace('-', ' ')}
        </span>
        
        <ApperIcon 
          name="ArrowRight" 
          size={16} 
          className="text-gray-400 group-hover:text-coral-500 transition-colors" 
        />
      </div>

      {completed && (
        <div className="absolute top-4 right-4">
          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
            <ApperIcon name="Check" size={14} className="text-white" />
          </div>
        </div>
      )}
    </Card>
  );
};

export default QuizCard;