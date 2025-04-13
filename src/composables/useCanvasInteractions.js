import { useCanvasStore } from '@/stores/canvasStore';

export function useCanvasInteractions(stageRef, width, height, updateMinimap, drawGrid) {
  const store = useCanvasStore();

  const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  const addCircle = () => {
    const safeWidth = Number(width.value) && !isNaN(Number(width.value)) ? Number(width.value) : 800;
    const safeHeight = Number(height.value) && !isNaN(Number(height.value)) ? Number(height.value) : 600;

    const newCircle = {
      id: Math.round(Math.random() * 10000).toString(),
      x: Math.random() * safeWidth,
      y: Math.random() * safeHeight,
      radius: 20,
      color: getRandomColor(),
    };

    store.addCircle(newCircle);
    updateMinimap();
  };

  const zoomIn = () => {
    const stageInstance = stageRef.value.getStage();
    const scaleFactor = 1.2;
    const centerX = width.value / 2;
    const centerY = height.value / 2;
    const newScale = Math.min(stageInstance.scaleX() * scaleFactor, 5);
    stageInstance.scale({ x: newScale, y: newScale });
    stageInstance.position({
      x: centerX - (centerX - stageInstance.x()) * scaleFactor,
      y: centerY - (centerY - stageInstance.y()) * scaleFactor,
    });
    clampPosition(stageInstance);
    stageInstance.batchDraw();
    updateMinimap();
    drawGrid();
  };

  const zoomOut = () => {
    const stageInstance = stageRef.value.getStage();
    const scaleFactor = 1.2;
    const centerX = width.value / 2;
    const centerY = height.value / 2;
    const newScale = Math.max(stageInstance.scaleX() / scaleFactor, 1);
    stageInstance.scale({ x: newScale, y: newScale });
    stageInstance.position({
      x: centerX - (centerX - stageInstance.x()) / scaleFactor,
      y: centerY - (centerY - stageInstance.y()) / scaleFactor,
    });
    clampPosition(stageInstance);
    stageInstance.batchDraw();
    updateMinimap();
    drawGrid();
  };

  const handleMouseDown = (e) => {
    if (store.isMoveMode) {
      store.isDragging = true;
      const stageInstance = stageRef.value.getStage();
      store.lastPos = stageInstance.getPointerPosition();
    }
  };

  const handleMouseMove = (e) => {
    if (store.isDragging && store.isMoveMode) {
      const stageInstance = stageRef.value.getStage();
      const pointerPos = stageInstance.getPointerPosition();
      const dx = pointerPos.x - store.lastPos.x;
      const dy = pointerPos.y - store.lastPos.y;
      const newPos = {
        x: stageInstance.x() + dx,
        y: stageInstance.y() + dy,
      };
      stageInstance.position(newPos);
      clampPosition(stageInstance);
      store.lastPos = pointerPos;
      stageInstance.batchDraw();
      updateMinimap();
      drawGrid();
    }
  };

  const handleMouseUp = () => {
    store.isDragging = false;
  };

  const clampPosition = (stageInstance) => {
    const scale = stageInstance.scaleX();
    const scaledWidth = width.value * scale;
    const scaledHeight = height.value * scale;
    let x = stageInstance.x();
    let y = stageInstance.y();

    x = Math.min(0, Math.max(x, width.value - scaledWidth));
    y = Math.min(0, Math.max(y, height.value - scaledHeight));

    stageInstance.position({ x, y });
  };

  const centerCanvas = () => {
    const stageInstance = stageRef.value.getStage();
    stageInstance.position({ x: 0, y: 0 });
    stageInstance.scale({ x: 1, y: 1 });
    stageInstance.batchDraw();
    updateMinimap();
    drawGrid();
  };

  return {
    addCircle,
    zoomIn,
    zoomOut,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    centerCanvas,
  };
}