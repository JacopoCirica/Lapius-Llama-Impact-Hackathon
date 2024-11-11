// components/LottieAnimation.tsx
import dynamic from "next/dynamic";
import React from "react";

// Dynamically import the Lottie Player
const Player = dynamic(
  () => import("@lottiefiles/react-lottie-player").then((mod) => mod.Player),
  { ssr: false }
);

interface LottieAnimationProps {
  src: string;
  className?: string;
  isAnimating: boolean;
}

const LottieAnimation: React.FC<LottieAnimationProps> = ({
  src,
  className,
  isAnimating,
}) => {
  console.log(isAnimating);
  //   const animationRef = useRef<any>(null); // Adjusted to `any` type since Player may not type correctly
  //   useEffect(() => {
  //     if (isAnimating && animationRef.current) {
  //       // Play the animation
  //       animationRef.current.play();
  //     } else if (animationRef.current) {
  //       // Stop the animation
  //       animationRef.current.stop();
  //     }
  //   }, [isAnimating]);
  const headingText = isAnimating
    ? "Analyzing your input. Please be patient!"
    : "GenAI Output!";
  return (
    <div>
      <Player autoplay loop src={src} className={className} />
      <h1 className="text-xl mb-2 text-gray-900 ">{headingText}</h1>
    </div>
  );
};

export default React.memo(LottieAnimation);
