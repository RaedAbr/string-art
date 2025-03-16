import { ref, watch } from 'vue';

export function useGrid(stageRef, width, height) {
  // Grid state
  const gridSize = ref(37.795275591); // 1cm in pixels (assuming 96 DPI, 1cm = ~37.8px)
  const isGridVisible = ref(true);

  // Function to draw the grid
  const drawGrid = (layer) => {
    if (!layer || !stageRef.value) return;

    layer.destroyChildren(); // Clear previous grid lines
    layer.clear();

    if (!isGridVisible.value) {
      layer.batchDraw();
      return;
    }

    const stage = stageRef.value.getStage();
    const scale = stage.scaleX(); // Current zoom scale
    const pos = stage.position();
    const gridStep = gridSize.value; // Grid size in pixels, not scaled
    const strokeWidth = 1 / scale; // Constant thickness in screen space

    // Vertical lines
    const startX = Math.floor(pos.x / gridStep) * gridStep;
    for (let x = startX; x < width.value * scale + pos.x; x += gridStep) {
      layer.add(
        new Konva.Line({
          points: [x, pos.y, x, height.value * scale + pos.y],
          stroke: '#ccc',
          strokeWidth: strokeWidth,
        })
      );
    }

    // Horizontal lines
    const startY = Math.floor(pos.y / gridStep) * gridStep;
    for (let y = startY; y < height.value * scale + pos.y; y += gridStep) {
      layer.add(
        new Konva.Line({
          points: [pos.x, y, width.value * scale + pos.x, y],
          stroke: '#ccc',
          strokeWidth: strokeWidth,
        })
      );
    }

    layer.batchDraw();
  };

  // Split grid size by 2
  const splitGrid = () => {
    gridSize.value /= 2; // e.g., 1cm -> 0.5cm
  };

  // Toggle grid visibility
  const toggleGrid = () => {
    isGridVisible.value = !isGridVisible.value;
  };

  return {
    gridSize,
    isGridVisible,
    drawGrid,
    splitGrid,
    toggleGrid,
  };
}