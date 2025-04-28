import { ref, watch } from 'vue';

export function useGrid(stageRef, canvasWidth, canvasHeight) {
  const gridSize = ref(50);
  const isGridVisible = ref(true);

  const drawGrid = (layer) => {
    if (!layer || !isGridVisible.value) {
      layer?.destroyChildren();
      layer?.batchDraw();
      return;
    }

    layer.destroyChildren();

    const stage = stageRef.value?.getStage();
    if (!stage) return;

    const scale = stage.scaleX();
    const scaledGridSize = gridSize.value * scale;

    const width = canvasWidth.value;
    const height = canvasHeight.value;

    // Draw vertical lines
    for (let x = 0; x <= width; x += gridSize.value) {
      layer.add(
        new Konva.Line({
          points: [x, 0, x, height],
          stroke: '#ccc',
          strokeWidth: 1 / scale,
        })
      );
    }

    // Draw horizontal lines
    for (let y = 0; y <= height; y += gridSize.value) {
      layer.add(
        new Konva.Line({
          points: [0, y, width, y],
          stroke: '#ccc',
          strokeWidth: 1 / scale,
        })
      );
    }

    layer.batchDraw();
  };

  const splitGrid = () => {
    gridSize.value = Math.max(10, gridSize.value / 2);
    if (stageRef.value) {
      drawGrid(stageRef.value.getStage().findOne('#gridLayer'));
    }
  };

  const enlargeGrid = () => {
    gridSize.value = Math.min(200, gridSize.value * 2);
    if (stageRef.value) {
      drawGrid(stageRef.value.getStage().findOne('#gridLayer'));
    }
  };

  const toggleGrid = () => {
    isGridVisible.value = !isGridVisible.value;
    if (stageRef.value) {
      drawGrid(stageRef.value.getStage().findOne('#gridLayer'));
    }
  };

  watch([canvasWidth, canvasHeight, gridSize, isGridVisible], () => {
    if (stageRef.value) {
      drawGrid(stageRef.value.getStage().findOne('#gridLayer'));
    }
  });

  return {
    gridSize,
    isGridVisible,
    drawGrid,
    splitGrid,
    enlargeGrid,
    toggleGrid,
  };
}