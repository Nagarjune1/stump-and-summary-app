import { useState, useEffect, useRef } from 'react';

export type AnimationType = 'score' | 'wicket' | 'boundary' | 'six' | 'pulse' | null;

interface UseScoreAnimationOptions {
  duration?: number;
}

export const useScoreAnimation = <T>(
  value: T,
  options: UseScoreAnimationOptions = {}
): { isAnimating: boolean; animationType: AnimationType } => {
  const { duration = 600 } = options;
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationType, setAnimationType] = useState<AnimationType>(null);
  const prevValueRef = useRef<T>(value);
  const isFirstRender = useRef(true);

  useEffect(() => {
    // Skip animation on first render
    if (isFirstRender.current) {
      isFirstRender.current = false;
      prevValueRef.current = value;
      return;
    }

    // Check if value changed
    if (prevValueRef.current !== value) {
      setIsAnimating(true);
      setAnimationType('score');
      
      const timer = setTimeout(() => {
        setIsAnimating(false);
        setAnimationType(null);
      }, duration);

      prevValueRef.current = value;
      
      return () => clearTimeout(timer);
    }
  }, [value, duration]);

  return { isAnimating, animationType };
};

interface ScoreState {
  runs: number;
  wickets: number;
  lastBall?: string | number;
}

export const useScoreboardAnimation = (
  score: ScoreState | null | undefined
): { 
  runsAnimating: boolean;
  wicketsAnimating: boolean;
  animationClass: string;
} => {
  const [runsAnimating, setRunsAnimating] = useState(false);
  const [wicketsAnimating, setWicketsAnimating] = useState(false);
  const [animationClass, setAnimationClass] = useState('');
  
  const prevScoreRef = useRef<ScoreState | null>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      prevScoreRef.current = score || null;
      return;
    }

    if (!score || !prevScoreRef.current) {
      prevScoreRef.current = score || null;
      return;
    }

    const prevScore = prevScoreRef.current;
    const runsDiff = score.runs - prevScore.runs;
    const wicketsDiff = score.wickets - prevScore.wickets;

    // Determine animation type based on what changed
    if (wicketsDiff > 0) {
      setWicketsAnimating(true);
      setAnimationClass('wicket-flash');
      setTimeout(() => {
        setWicketsAnimating(false);
        setAnimationClass('');
      }, 800);
    } else if (runsDiff === 6) {
      setRunsAnimating(true);
      setAnimationClass('six-flash');
      setTimeout(() => {
        setRunsAnimating(false);
        setAnimationClass('');
      }, 700);
    } else if (runsDiff === 4) {
      setRunsAnimating(true);
      setAnimationClass('boundary-flash');
      setTimeout(() => {
        setRunsAnimating(false);
        setAnimationClass('');
      }, 600);
    } else if (runsDiff > 0) {
      setRunsAnimating(true);
      setAnimationClass('score-flash');
      setTimeout(() => {
        setRunsAnimating(false);
        setAnimationClass('');
      }, 600);
    }

    prevScoreRef.current = score;
  }, [score?.runs, score?.wickets]);

  return { runsAnimating, wicketsAnimating, animationClass };
};
