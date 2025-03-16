<template>
  <div ref="panel" class="command-panel" :style="{ top: `${top}px`, left: `${left}px` }">
    <h3 class="panel-title" @mousedown="startDragging">Controls</h3>
    <Button @click="emit('add-circle')">Add Circle</Button>
    <Button :variant="store.isMoveMode ? 'secondary' : 'default'" @click="toggleMoveMode" class="mt-2">
      {{ store.isMoveMode ? 'Disable Move' : 'Enable Move' }}
    </Button>
    <Button @click="emit('zoom-in')" class="mt-2">Zoom In</Button>
    <Button @click="emit('zoom-out')" class="mt-2">Zoom Out</Button>
    <Button @click="emit('center-canvas')" class="mt-2">Center Canvas</Button>
    <Button @click="emit('split-grid')" class="mt-2">Split Grid</Button>
    <Button @click="emit('enlarge-grid')" class="mt-2">Enlarge Grid</Button>
    <Button @click="toggleGrid" class="mt-2">
      {{ gridVisible ? 'Hide Grid' : 'Show Grid' }}
    </Button>
  </div>
</template>

<script setup>
import { ref, onMounted, defineEmits } from 'vue';
import { useCanvasStore } from '@/stores/canvasStore';
import { Button } from '@/components/ui/button';

// Pinia store
const store = useCanvasStore();

// Local state for UI
const top = ref();
const left = ref();
const panel = ref(null);
const gridVisible = ref(true); // Local UI state, synced with toggle

const emit = defineEmits([
  'add-circle',
  'set-move-mode',
  'zoom-in',
  'zoom-out',
  'center-canvas',
  'split-grid',
  'enlarge-grid',
  'toggle-grid',
]);

// Toggle functions
const toggleMoveMode = () => {
  store.setMoveMode(!store.isMoveMode);
  emit('set-move-mode', store.isMoveMode);
};

onMounted(() => {
  top.value = 0;
  if (panel.value) {
    left.value = window.innerWidth - panel.value.offsetWidth;
  } else {
    left.value = window.innerWidth / 2;
  }
});

// Sync grid visibility with button text
const toggleGrid = () => {
  gridVisible.value = !gridVisible.value;
  emit('toggle-grid');
};

const startDragging = (e) => {
  e.preventDefault();
  const panelEl = panel.value;
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
.command-panel {
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