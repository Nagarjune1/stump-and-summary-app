
import { useEffect, useState } from "react";
import { toast } from "@/hooks/use-toast";

interface ScoringRuleEngineProps {
  currentOver: number;
  currentBall: number;
  totalOvers: number;
  powerplayOvers: number;
  wickets: number;
  totalPlayers: number;
  lastBallType?: string;
  onBowlerChangeRequired: () => void;
  onInningsEnd: (reason: string) => void;
  onPowerplayEnd: () => void;
  children?: React.ReactNode;
}

const ScoringRuleEngine = ({
  currentOver,
  currentBall,
  totalOvers,
  powerplayOvers,
  wickets,
  totalPlayers = 11,
  lastBallType,
  onBowlerChangeRequired,
  onInningsEnd,
  onPowerplayEnd,
  children
}: ScoringRuleEngineProps) => {
  const [hasShownPowerplayEnd, setHasShownPowerplayEnd] = useState(false);

  // Check for over completion and bowler change
  useEffect(() => {
    if (currentBall === 0 && currentOver > 0) {
      // Over just completed
      toast({
        title: "Over Completed!",
        description: `Over ${currentOver} finished. Please select new bowler.`,
        duration: 3000,
      });
      onBowlerChangeRequired();
    }
  }, [currentOver, currentBall, onBowlerChangeRequired]);

  // Check for powerplay end
  useEffect(() => {
    if (powerplayOvers > 0 && currentOver === powerplayOvers && !hasShownPowerplayEnd) {
      setHasShownPowerplayEnd(true);
      toast({
        title: "Powerplay Ended!",
        description: `${powerplayOvers} overs powerplay completed. Field restrictions lifted.`,
        duration: 4000,
      });
      onPowerplayEnd();
    }
  }, [currentOver, powerplayOvers, hasShownPowerplayEnd, onPowerplayEnd]);

  // Check for all out
  useEffect(() => {
    if (wickets >= totalPlayers - 1) {
      toast({
        title: "All Out!",
        description: `${wickets} wickets fallen. Innings ended.`,
        variant: "default",
      });
      onInningsEnd('all_out');
    }
  }, [wickets, totalPlayers, onInningsEnd]);

  // Check for overs completed - Fixed condition
  useEffect(() => {
    if (currentOver > totalOvers || (currentOver === totalOvers && currentBall === 0)) {
      toast({
        title: "Overs Completed!",
        description: `${totalOvers} overs finished. Innings ended.`,
        variant: "default",
      });
      onInningsEnd('overs_completed');
    }
  }, [currentOver, currentBall, totalOvers, onInningsEnd]);

  // Check for wide/no-ball notifications
  useEffect(() => {
    if (lastBallType === 'wide') {
      toast({
        title: "Wide Ball!",
        description: "1 extra run added. Ball to be re-bowled.",
        duration: 2000,
      });
    } else if (lastBallType === 'no-ball') {
      toast({
        title: "No Ball!",
        description: "1 extra run added. Next ball is FREE HIT!",
        duration: 3000,
      });
    }
  }, [lastBallType]);

  return <>{children}</>;
};

export default ScoringRuleEngine;
