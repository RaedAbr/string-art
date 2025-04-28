import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useCanvasStore = defineStore('canvas', () => {
  const circles = ref([]);
  const isDragging = ref(false);
  const isMoveMode = ref(false);
  const isSelectionMode = ref(false);
  const lastPos = ref({ x: 0, y: 0 });
  const isDrawingMode = ref(false);
  const points = ref([]);
  const segments = ref([]);
  const activePoint = ref(null);
  const selectedSegment = ref(null);
  const segmentPointCount = ref(2);
  const originalSegmentState = ref(null);

  const addCircle = (circle) => {
    circles.value.push(circle);
  };

  const setMoveMode = (value) => {
    isMoveMode.value = value;
    if (value) {
      isDrawingMode.value = false;
      isSelectionMode.value = false;
      activePoint.value = null;
      selectedSegment.value = null;
      segmentPointCount.value = 2;
      originalSegmentState.value = null;
    }
  };

  const setDrawingMode = (value) => {
    isDrawingMode.value = value;
    if (value) {
      isMoveMode.value = false;
      isSelectionMode.value = false;
      selectedSegment.value = null;
      segmentPointCount.value = 2;
      originalSegmentState.value = null;
    } else {
      activePoint.value = null;
    }
  };

  const setSelectionMode = (value) => {
    isSelectionMode.value = value;
    if (value) {
      isMoveMode.value = false;
      isDrawingMode.value = false;
      activePoint.value = null;
    }
  };

  const addPoint = (point) => {
    points.value.push(point);
  };

  const addSegment = (segment) => {
    const newSegment = {
      ...segment,
      pointCount: segmentPointCount.value,
      nails: [],
    };
    segments.value.push(newSegment);
  };

  const setActivePoint = (point) => {
    activePoint.value = point;
  };

  const setSelectedSegment = (segment) => {
    selectedSegment.value = segment;
    if (segment) {
      if (isSelectionMode.value) {
        originalSegmentState.value = {
          pointCount: segment.pointCount || 2,
          nails: [...(segment.nails || [])],
        };
      }
      segmentPointCount.value = segment.pointCount || 2;
      updateSegmentNails(segment, segmentPointCount.value);
    } else {
      segmentPointCount.value = 2;
      originalSegmentState.value = null;
    }
  };

  const updateSegmentPointCount = (count) => {
    if (selectedSegment.value && count >= 2) {
      selectedSegment.value.pointCount = count;
      segmentPointCount.value = count;
      updateSegmentNails(selectedSegment.value, count);
    }
  };

  const updateSegmentNails = (segment, count) => {
    points.value = points.value.filter((point) => !point.id.startsWith(`nail-${segment.id}-`));
    segment.nails = [];

    if (count >= 2) {
      const dx = (segment.end.x - segment.start.x) / (count - 1);
      const dy = (segment.end.y - segment.start.y) / (count - 1);
      for (let i = 0; i < count; i++) {
        const nail = {
          id: `nail-${segment.id}-${i}-${Date.now()}`,
          x: segment.start.x + i * dx,
          y: segment.start.y + i * dy,
        };
        segment.nails.push(nail);
        if (!points.value.some((p) => p.x === nail.x && p.y === nail.y)) {
          points.value.push(nail);
        }
      }
    }
  };

  const cancelSegment = () => {
    if (selectedSegment.value) {
      const segmentId = selectedSegment.value.id;
      if (isDrawingMode.value) {
        segments.value = segments.value.filter((seg) => seg.id !== segmentId);
        points.value = points.value.filter((point) => !point.id.startsWith(`nail-${segmentId}-`));
        const usedPointIds = segments.value.flatMap((seg) => [seg.start.id, seg.end.id]);
        points.value = points.value.filter(
          (point) =>
            usedPointIds.includes(point.id) ||
            point.id.startsWith('nail-')
        );
      } else if (isSelectionMode.value && originalSegmentState.value) {
        const segmentIndex = segments.value.findIndex((seg) => seg.id === segmentId);
        if (segmentIndex !== -1) {
          segments.value[segmentIndex] = {
            ...segments.value[segmentIndex],
            pointCount: originalSegmentState.value.pointCount,
            nails: [...originalSegmentState.value.nails],
          };
          points.value = points.value.filter((point) => !point.id.startsWith(`nail-${segmentId}-`));
          originalSegmentState.value.nails.forEach((nail) => {
            if (!points.value.some((p) => p.x === nail.x && p.y === nail.y)) {
              points.value.push(nail);
            }
          });
        }
      }
      selectedSegment.value = null;
      segmentPointCount.value = 2;
      originalSegmentState.value = null;
    }
  };

  const deleteSegment = () => {
    if (selectedSegment.value && isSelectionMode.value) {
      const segmentId = selectedSegment.value.id;
      segments.value = segments.value.filter((seg) => seg.id !== segmentId);
      points.value = points.value.filter((point) => !point.id.startsWith(`nail-${segmentId}-`));
      const usedPointIds = segments.value.flatMap((seg) => [seg.start.id, seg.end.id]);
      points.value = points.value.filter(
        (point) =>
          usedPointIds.includes(point.id) ||
          point.id.startsWith('nail-')
      );
      selectedSegment.value = null;
      segmentPointCount.value = 2;
      originalSegmentState.value = null;
    }
  };

  const confirmSegment = () => {
    if (selectedSegment.value) {
      const segmentIndex = segments.value.findIndex((seg) => seg.id === selectedSegment.value.id);
      if (segmentIndex !== -1) {
        segments.value[segmentIndex] = {
          ...segments.value[segmentIndex],
          pointCount: selectedSegment.value.pointCount || 2,
          nails: [...selectedSegment.value.nails],
        };
      } else {
        segments.value.push({
          ...selectedSegment.value,
          pointCount: selectedSegment.value.pointCount || 2,
          nails: [...selectedSegment.value.nails],
        });
      }
      updateSegmentNails(selectedSegment.value, selectedSegment.value.pointCount || 2);
      selectedSegment.value = null;
      segmentPointCount.value = 2;
      originalSegmentState.value = null;
    }
  };

  return {
    circles,
    isDragging,
    isMoveMode,
    isSelectionMode,
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
    setSelectionMode,
    addPoint,
    addSegment,
    setActivePoint,
    setSelectedSegment,
    updateSegmentPointCount,
    cancelSegment,
    deleteSegment,
    confirmSegment,
  };
});