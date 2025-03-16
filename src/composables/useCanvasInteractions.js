import { useCanvasStore } from '@/stores/canvasStore';

export function useCanvasInteractions(stageRef, width, height, updateMinimap) {
  const store = useCanvasStore();

  // Function to generate random color
  const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  // Function to add a circle
  const addCircle = () => {
    const newCircle = {
      id: Math.round(Math.random() * 10000).toString(),
      x: Math.random() * width.value,
      y: Math.random() * height.value,
      radius: Math.random() * 50 + 10,
      color: getRandomColor(),
    };
    store.addCircle(newCircle);
    updateMinimap();
  };

  // Zoom functions
  const zoomIn = () => {
    const stageInstance = stageRef.value.getStage();
    const scaleFactor = 1.2;
    const centerX = width.value / 2;
    const centerY = height.value / 2;
    const newScale = Math.min(stageInstance.scaleX() * scaleFactor, 5); // Max zoom limit
    stageInstance.scale({ x: newScale, y: newScale });
    stageInstance.position({
      x: centerX - (centerX - stageInstance.x()) * scaleFactor,
      y: centerY - (centerY - stageInstance.y()) * scaleFactor,
    });
    clampPosition(stageInstance);
    stageInstance.batchDraw();
    updateMinimap();
  };

  const zoomOut = () => {
    const stageInstance = stageRef.value.getStage();
    const scaleFactor = 1.2;
    const centerX = width.value / 2;
    const centerY = height.value / 2;
    const newScale = Math.max(stageInstance.scaleX() / scaleFactor, 1); // Min zoom limit
    stageInstance.scale({ x: newScale, y: newScale });
    stageInstance.position({
      x: centerX - (centerX - stageInstance.x()) / scaleFactor,
      y: centerY - (centerY - stageInstance.y()) / scaleFactor,
    });
    clampPosition(stageInstance);
    stageInstance.batchDraw();
    updateMinimap();
  };

  // Panning (move canvas)
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
    }
  };

  const handleMouseUp = () => {
    store.isDragging = false;
  };

  // Clamp position to container bounds
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

  // Center canvas
  const centerCanvas = () => {
    const stageInstance = stageRef.value.getStage();
    stageInstance.position({ x: 0, y: 0 });
    stageInstance.scale({ x: 1, y: 1 });
    stageInstance.batchDraw();
    updateMinimap();
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