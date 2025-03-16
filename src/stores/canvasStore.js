import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useCanvasStore = defineStore('canvas', () => {
  // State
  const circles = ref([]);
  const isDragging = ref(false);
  const isMoveMode = ref(false);
  const lastPos = ref({ x: 0, y: 0 });

  // Actions
  const addCircle = (circle) => {
    circles.value.push(circle);
  };

  const setMoveMode = (value) => {
    isMoveMode.value = value;
  };

  return {
    circles,
    isDragging,
    isMoveMode,
    lastPos,
    addCircle,
    setMoveMode,
  };
});