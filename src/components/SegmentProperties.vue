<template>
  <div ref="segmentPanel" class="segment-panel" :style="{ top: `${top}px`, left: `${left}px` }">
    <h3 class="panel-title" @mousedown="startDragging">Segment Properties</h3>
    <div class="flex items-center space-x-2 mt-2">
      <Button @click="decrementPointCount">-</Button>
      <input v-model.number="localPointCount" type="number" min="2" class="w-16 p-1 border rounded"
        @input="updatePointCount" />
      <Button @click="incrementPointCount">+</Button>
    </div>
    <div class="flex space-x-2 mt-2">
      <Button @click="confirmSegment" class="w-full">OK</Button>
      <Button @click="cancelSegment" class="w-full">Cancel</Button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useCanvasStore } from '@/stores/canvasStore';
import { Button } from '@/components/ui/button';

const store = useCanvasStore();

const top = ref(120);
const left = ref();
const segmentPanel = ref(null);
const localPointCount = ref(2);

watch(
  () => store.selectedSegment,
  (newSegment) => {
    localPointCount.value = newSegment ? newSegment.pointCount || 2 : 2;
  },
  { immediate: true }
);

const decrementPointCount = () => {
  if (localPointCount.value > 2) {
    localPointCount.value -= 1;
    store.updateSegmentPointCount(localPointCount.value);
  }
};

const incrementPointCount = () => {
  localPointCount.value += 1;
  store.updateSegmentPointCount(localPointCount.value);
};

const updatePointCount = () => {
  if (localPointCount.value >= 2) {
    store.updateSegmentPointCount(localPointCount.value);
  } else {
    localPointCount.value = 2;
    store.updateSegmentPointCount(2);
  }
};

const confirmSegment = () => {
  store.confirmSegment();
};

const cancelSegment = () => {
  store.cancelSegment();
};

onMounted(() => {
  if (segmentPanel.value) {
    left.value = window.innerWidth - segmentPanel.value.offsetWidth - 260;
  } else {
    left.value = window.innerWidth / 2;
  }
});

const startDragging = (e) => {
  e.preventDefault();
  const panelEl = segmentPanel.value;
  const panelWidth = panelEl.offsetWidth;
  const panelHeight = panelEl.offsetHeight;
  const headerHeight = 120;
  const canvasHeight = window.innerHeight - headerHeight;

  let shiftX = e.clientX - left.value;
  let shiftY = e.clientY - top.value;

  const moveAt = (pageX, pageY) => {
    let newLeft = pageX - shiftX;
    let newTop = pageY - shiftY;
    newLeft = Math.max(0, Math.min(newLeft, window.innerWidth - panelWidth));
    newTop = Math.max(0, Math.min(newTop, canvasHeight - panelHeight));
    left.value = newLeft;
    top.value = newTop;
  };

  const onMouseMove = (moveEvent) => {
    moveAt(moveEvent.pageX, moveEvent.pageY);
  };

  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', () => {
    document.removeEventListener('mousemove', onMouseMove);
  }, { once: true });
};
</script>

<style scoped>
.segment-panel {
  position: absolute;
  width: 250px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  padding: 1rem;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  z-index: 10;
  user-select: none;
}

.panel-title {
  margin: 0 0 1rem 0;
  cursor: move;
  padding: 0.5rem;
  background: #e5e7eb;
  text-align: center;
}

.mt-2 {
  margin-top: 0.5rem;
}
</style>