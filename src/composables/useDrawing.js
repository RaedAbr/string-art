import { useCanvasStore } from '@/stores/canvasStore';

export function useDrawing(stageRef, gridSize, width, height) {
  const store = useCanvasStore();

  const snapToGrid = (x, y) => {
    const scale = stageRef.value.getStage().scaleX();
    const pos = stageRef.value.getStage().position();
    const scaledGridSize = gridSize.value * scale;

    const canvasX = x - pos.x;
    const canvasY = y - pos.y;

    const gridX = Math.round(canvasX / scaledGridSize) * scaledGridSize;
    const gridY = Math.round(canvasY / scaledGridSize) * scaledGridSize;

    const pixelRadius = 5;
    const dx = Math.abs(canvasX - gridX) / scale;
    const dy = Math.abs(canvasY - gridY) / scale;
    if (Math.sqrt(dx * dx + dy * dy) > pixelRadius) {
      return null;
    }

    return { x: gridX + pos.x, y: gridY + pos.y };
  };

  const handleCanvasClick = (e) => {
    if (!store.isDrawingMode || !stageRef.value || store.selectedSegment) return;

    const stage = stageRef.value.getStage();
    const pointerPos = stage.getPointerPosition();
    const snappedPoint = snapToGrid(pointerPos.x, pointerPos.y);

    if (!snappedPoint) return;

    if (!store.activePoint) {
      const point = {
        id: `point-${store.points.length}-${Date.now()}`,
        x: snappedPoint.x,
        y: snappedPoint.y,
      };
      store.addPoint(point);
      store.setActivePoint(point);
    } else {
      const endPoint = {
        id: `point-${store.points.length}-${Date.now()}`,
        x: snappedPoint.x,
        y: snappedPoint.y,
      };
      store.addPoint(endPoint);
      const newSegment = {
        id: `segment-${store.segments.length}-${Date.now()}`,
        start: store.activePoint,
        end: endPoint,
      };
      store.addSegment(newSegment);
      store.setActivePoint(null);
      store.setSelectedSegment(newSegment);
    }
  };

  const getPreviewSegment = (mousePos) => {
    if (!store.activePoint || !mousePos) return null;
    const snappedPoint = snapToGrid(mousePos.x, mousePos.y) || mousePos;
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