import { ref, watch } from 'vue';

export function useMinimap(canvasWidth, canvasHeight, circles, stageRef, minimapStageRef) {
  // Minimap configuration
  const minimapWidth = 200;
  const minimapHeight = ref((canvasHeight.value / canvasWidth.value) * minimapWidth); // Maintain aspect ratio
  const minimapScale = ref(minimapWidth / canvasWidth.value);
  const minimapConfig = ref({
    width: minimapWidth,
    height: minimapHeight.value,
  });

  // Viewport rectangle in minimap
  const viewportRect = ref({
    x: 0,
    y: 0,
    width: canvasWidth.value * minimapScale.value,
    height: canvasHeight.value * minimapScale.value,
    stroke: 'red',
    strokeWidth: 2,
    fill: 'rgba(255, 0, 0, 0.1)',
  });

  // Update minimap viewport
  const updateMinimap = () => {
    if (!stageRef.value || !minimapStageRef.value) return;
    const stageInstance = stageRef.value.getStage();
    const scale = stageInstance.scaleX();
    const pos = stageInstance.position();
    viewportRect.value = {
      x: -pos.x * minimapScale.value / scale,
      y: -pos.y * minimapScale.value / scale,
      width: canvasWidth.value * minimapScale.value / scale,
      height: canvasHeight.value * minimapScale.value / scale,
      stroke: 'red',
      strokeWidth: 2,
      fill: 'rgba(255, 0, 0, 0.1)',
    };
    minimapStageRef.value.getStage().batchDraw();
  };

  // Update minimap dimensions when canvas size changes
  watch([canvasWidth, canvasHeight], () => {
    minimapHeight.value = (canvasHeight.value / canvasWidth.value) * minimapWidth;
    minimapScale.value = minimapWidth / canvasWidth.value;
    minimapConfig.value.height = minimapHeight.value;
    updateMinimap();
  });

  // Watch for changes in circles to update minimap
  watch(circles, () => {
    if (minimapStageRef.value) {
      minimapStageRef.value.getStage().batchDraw();
    }
  });

  return {
    minimapConfig,
    minimapScale,
    viewportRect,
    updateMinimap,
  };
}