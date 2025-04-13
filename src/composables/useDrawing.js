import { useCanvasStore } from '@/stores/canvasStore';

export function useDrawing(stageRef, gridSize, width, height) {
  const store = useCanvasStore();

  // Snap point to nearest grid intersection within 5 pixels
  const snapToGrid = (x, y) => {
    const scale = stageRef.value.getStage().scaleX();
    const pos = stageRef.value.getStage().position();
    const scaledGridSize = gridSize.value * scale;

    // Adjust for stage position
    const canvasX = x - pos.x;
    const canvasY = y - pos.y;

    // Snap to nearest grid intersection
    const gridX = Math.round(canvasX / scaledGridSize) * scaledGridSize;
    const gridY = Math.round(canvasY / scaledGridSize) * scaledGridSize;

    // Check if within 5 pixels (screen space)
    const pixelRadius = 5;
    const dx = Math.abs(canvasX - gridX) / scale;
    const dy = Math.abs(canvasY - gridY) / scale;
    if (Math.sqrt(dx * dx + dy * dy) > pixelRadius) {
      return null; // Not close enough to a grid point
    }

    return { x: gridX + pos.x, y: gridY + pos.y };
  };

  // Handle canvas click for drawing segments
  const handleCanvasClick = (e) => {
    if (!store.isDrawingMode || !stageRef.value) return;

    const stage = stageRef.value.getStage();
    const pointerPos = stage.getPointerPosition();
    const snappedPoint = snapToGrid(pointerPos.x, pointerPos.y);

    if (!snappedPoint) return; // Click not near grid intersection

    if (!store.activePoint) {
      // First point
      const point = {
        id: `point-${store.points.length}-${Date.now()}`,
        x: snappedPoint.x,
        y: snappedPoint.y,
      };
      store.addPoint(point);
      store.setActivePoint(point);
    } else {
      // Second point, complete segment
      const endPoint = {
        id: `point-${store.points.length}-${Date.now()}`,
        x: snappedPoint.x,
        y: snappedPoint.y,
      };
      store.addPoint(endPoint);
      store.addSegment({
        id: `segment-${store.segments.length}-${Date.now()}`,
        start: store.activePoint,
        end: endPoint,
      });
      store.setActivePoint(null); // Ready for next segment
    }
  };

  // Get preview segment (from active point to mouse cursor)
  const getPreviewSegment = (mousePos) => {
    if (!store.activePoint || !mousePos) return null;
    const snappedPoint = snapToGrid(mousePos.x, mousePos.y) || mousePos; // Snap if near grid, else use raw mouse pos
    return {
      start: store.activePoint,
      end: snappedPoint,
    };
  };

  return {
    handleCanvasClick,
    getPreviewSegment,
  };
}