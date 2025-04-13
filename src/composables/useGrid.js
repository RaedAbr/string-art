import { ref } from 'vue';
import { COLORS } from '@/constants/colors';

export function useGrid(stageRef, width, height) {
  const gridSize = ref(37.795275591);
  const isGridVisible = ref(true);

  const drawGrid = (layer) => {
    if (!layer || !stageRef.value) return;

    layer.destroyChildren();
    layer.clear();

    if (!isGridVisible.value) {
      layer.batchDraw();
      return;
    }

    const stage = stageRef.value.getStage();
    const scale = stage.scaleX();
    const pos = stage.position();
    const gridStep = gridSize.value;
    const strokeWidth = 1 / scale;

    const startX = Math.floor(pos.x / gridStep) * gridStep;
    for (let x = startX; x < width.value * scale + pos.x; x += gridStep) {
      layer.add(
        new Konva.Line({
          points: [x, pos.y, x, height.value * scale + pos.y],
          stroke: COLORS.GRID_STROKE,
          strokeWidth: strokeWidth,
        })
      );
    }

    const startY = Math.floor(pos.y / gridStep) * gridStep;
    for (let y = startY; y < height.value * scale + pos.y; y += gridStep) {
      layer.add(
        new Konva.Line({
          points: [pos.x, y, width.value * scale + pos.x, y],
          stroke: COLORS.GRID_STROKE,
          strokeWidth: strokeWidth,
        })
      );
    }

    layer.batchDraw();
  };

  const splitGrid = () => {
    gridSize.value /= 2;
  };

  const enlargeGrid = () => {
    gridSize.value *= 2;
  };

  const toggleGrid = () => {
    isGridVisible.value = !isGridVisible.value;
  };

  return {
    gridSize,
    isGridVisible,
    drawGrid,
    splitGrid,
    enlargeGrid,
    toggleGrid,
  };
}