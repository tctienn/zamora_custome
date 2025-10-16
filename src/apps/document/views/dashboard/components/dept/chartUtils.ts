// Utility function to calculate step size for chart Y-axis
export const calculateStepSize = (maxCount: number): number => {
  // Đảm bảo luôn có giá trị max tối thiểu là 10
  maxCount = Math.max(maxCount, 10);
  
  // Xác định step size phù hợp
  let stepSize = 1;
  if (maxCount > 10) {
    stepSize = Math.ceil(maxCount / 10);
    // Làm tròn lên đến bội số của 5 hoặc 10
    if (stepSize <= 5) {
      stepSize = 5;
    } else if (stepSize <= 10) {
      stepSize = 10;
    } else {
      stepSize = Math.ceil(stepSize / 10) * 10;
    }
  }
  
  return stepSize;
};