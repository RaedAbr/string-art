import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useCanvasStore = defineStore('canvas', () => {
  // State
  const circles = ref([]);
  const isDragging = ref(false);
  const isMoveMode = ref(false);
  const lastPos = ref({ x: 0, y: 0 });
  const isDrawingMode = ref(false);
  const points = ref([]); // Store grid points
  const segments = ref([]); // Store completed segments
  const activePoint = ref(null); // Track the first point of an active segment

  // Actions
  const addCircle = (circle) => {
    circles.value.push(circle);
  };

  const setMoveMode = (value) => {
    isMoveMode.value = value;
    if (value) {
      isDrawingMode.value = false;
      activePoint.value = null; // Reset drawing state
    }
  };

  const setDrawingMode = (value) => {
    isDrawingMode.value = value;
    if (value) {
      isMoveMode.value = false;
    } else {
      activePoint.value = null; // Reset drawing state when exiting
    }
  };

  const addPoint = (point) => {
    points.value.push(point);
  };

  const addSegment = (segment) => {
    segments.value.push(segment);
  };

  const setActivePoint = (point) => {
    activePoint.value = point;
  };

  return {
    circles,
    isDragging,
    isMoveMode,
    lastPos,
    isDrawingMode,
    points,
    segments,
    activePoint,
    addCircle,
    setMoveMode,
    setDrawingMode,
    addPoint,
    addSegment,
    setActivePoint,
  };
});