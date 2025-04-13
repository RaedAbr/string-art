import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useCanvasStore = defineStore('canvas', () => {
  const circles = ref([]);
  const isDragging = ref(false);
  const isMoveMode = ref(false);
  const lastPos = ref({ x: 0, y: 0 });
  const isDrawingMode = ref(false);
  const points = ref([]);
  const segments = ref([]);
  const activePoint = ref(null);
  const selectedSegment = ref(null);
  const segmentPointCount = ref(2);

  const addCircle = (circle) => {
    circles.value.push(circle);
  };

  const setMoveMode = (value) => {
    isMoveMode.value = value;
    if (value) {
      isDrawingMode.value = false;
      activePoint.value = null;
      selectedSegment.value = null;
    }
  };

  const setDrawingMode = (value) => {
    isDrawingMode.value = value;
    if (value) {
      isMoveMode.value = false;
      selectedSegment.value = null;
    } else {
      activePoint.value = null;
    }
  };

  const addPoint = (point) => {
    points.value.push(point);
  };

  const addSegment = (segment) => {
    segments.value.push({ ...segment, pointCount: segmentPointCount.value });
  };

  const setActivePoint = (point) => {
    activePoint.value = point;
  };

  const setSelectedSegment = (segment) => {
    selectedSegment.value = segment;
    segmentPointCount.value = segment ? segment.pointCount : 2;
  };

  const updateSegmentPointCount = (count) => {
    if (selectedSegment.value && count >= 2) {
      selectedSegment.value.pointCount = count;
      segmentPointCount.value = count;
    }
  };

  const cancelSegment = () => {
    if (selectedSegment.value) {
      segments.value = segments.value.filter((seg) => seg.id !== selectedSegment.value.id);
      const usedPointIds = segments.value.flatMap((seg) => [seg.start.id, seg.end.id]);
      points.value = points.value.filter((point) => usedPointIds.includes(point.id));
      selectedSegment.value = null;
      segmentPointCount.value = 2;
    }
  };

  const confirmSegment = () => {
    if (selectedSegment.value) {
      // Add nails as points to the store
      const count = selectedSegment.value.pointCount || 2;
      if (count >= 2) {
        const dx = (selectedSegment.value.end.x - selectedSegment.value.start.x) / (count - 1);
        const dy = (selectedSegment.value.end.y - selectedSegment.value.start.y) / (count - 1);
        for (let i = 0; i < count; i++) {
          const nail = {
            id: `nail-${selectedSegment.value.id}-${i}-${Date.now()}`,
            x: selectedSegment.value.start.x + i * dx,
            y: selectedSegment.value.start.y + i * dy,
          };
          if (!points.value.some((p) => p.x === nail.x && p.y === nail.y)) {
            points.value.push(nail);
          }
        }
      }
      selectedSegment.value = null;
      segmentPointCount.value = 2;
    }
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
    selectedSegment,
    segmentPointCount,
    addCircle,
    setMoveMode,
    setDrawingMode,
    addPoint,
    addSegment,
    setActivePoint,
    setSelectedSegment,
    updateSegmentPointCount,
    cancelSegment,
    confirmSegment,
  };
});