<template>
  <div class="canvas-container">
    <!-- Main Canvas -->
    <v-stage ref="stage" :config="configKonva" @mousedown="handleMouseDown" @mousemove="handleMouseMove"
      @mouseup="handleMouseUp">
      <v-layer ref="layer">
        <v-circle v-for="circle in circles" :key="circle.id" :config="{
          x: circle.x,
          y: circle.y,
          radius: 20,
          fill: circle.color,
          opacity: 0.8,
        }"></v-circle>
      </v-layer>
    </v-stage>

    <!-- Minimap -->
    <div class="minimap-container">
      <v-stage ref="minimapStage" :config="minimapConfig">
        <v-layer ref="minimapLayer">
          <v-circle v-for="circle in circles" :key="circle.id" :config="{
            x: circle.x * minimapScale,
            y: circle.y * minimapScale,
            radius: 20 * minimapScale,
            fill: circle.color,
            opacity: 0.8,
          }"></v-circle>
          <v-rect :config="viewportRect" />
        </v-layer>
      </v-stage>
    </div>

    <!-- Control panel component -->
    <control-panel @add-circle="addCircle" @set-move-mode="setMoveMode" @zoom-in="zoomIn" @zoom-out="zoomOut"
      @center-canvas="centerCanvas" />
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import ControlPanel from '@/components/ControlPanel.vue';

// Canvas size (adjusted to fit below header, assuming header is ~120px tall)
const width = window.innerWidth;
const height = window.innerHeight - 120;

// Reactive state
const circles = ref([]);
const stage = ref(null);
const layer = ref(null);
const minimapStage = ref(null);
const minimapLayer = ref(null);
const isDragging = ref(false);
const isMoveMode = ref(false);
const lastPos = ref({ x: 0, y: 0 });

// Main stage configuration
const configKonva = ref({
  width: width,
  height: height,
});

// Minimap configuration
const minimapWidth = 200;
const minimapHeight = 150;
const minimapScale = minimapWidth / width; // Scale to fit content in minimap
const minimapConfig = ref({
  width: minimapWidth,
  height: minimapHeight,
});

// Viewport rectangle in minimap
const viewportRect = ref({
  x: 0,
  y: 0,
  width: width * minimapScale,
  height: height * minimapScale,
  stroke: 'red',
  strokeWidth: 2,
  fill: 'rgba(255, 0, 0, 0.1)',
});

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
    x: Math.random() * width,
    y: Math.random() * height,
    color: getRandomColor(),
  };
  circles.value.push(newCircle);
};

// Mode setters
const setMoveMode = (value) => {
  isMoveMode.value = value;
};

// Zoom functions
const zoomIn = () => {
  const stageInstance = stage.value.getStage();
  const scaleFactor = 1.2;
  const centerX = width / 2;
  const centerY = height / 2;
  const newScale = stageInstance.scaleX() * scaleFactor;
  stageInstance.scale({ x: newScale, y: newScale });
  stageInstance.position({
    x: centerX - (centerX - stageInstance.x()) * scaleFactor,
    y: centerY - (centerY - stageInstance.y()) * scaleFactor,
  });
  stageInstance.batchDraw();
  updateMinimap();
};

const zoomOut = () => {
  const stageInstance = stage.value.getStage();
  const scaleFactor = 1.2;
  const centerX = width / 2;
  const centerY = height / 2;
  const newScale = stageInstance.scaleX() / scaleFactor;
  stageInstance.scale({ x: newScale, y: newScale });
  stageInstance.position({
    x: centerX - (centerX - stageInstance.x()) / scaleFactor,
    y: centerY - (centerY - stageInstance.y()) / scaleFactor,
  });
  stageInstance.batchDraw();
  updateMinimap();
};

// Panning (move canvas)
const handleMouseDown = (e) => {
  if (isMoveMode.value) {
    isDragging.value = true;
    const stageInstance = stage.value.getStage();
    lastPos.value = stageInstance.getPointerPosition();
  }
};

const handleMouseMove = (e) => {
  if (isDragging.value && isMoveMode.value) {
    const stageInstance = stage.value.getStage();
    const pointerPos = stageInstance.getPointerPosition();
    const dx = pointerPos.x - lastPos.value.x;
    const dy = pointerPos.y - lastPos.value.y;
    const newPos = {
      x: stageInstance.x() + dx,
      y: stageInstance.y() + dy,
    };
    stageInstance.position(newPos);
    lastPos.value = pointerPos;
    stageInstance.batchDraw();
    updateMinimap();
  }
};

const handleMouseUp = () => {
  isDragging.value = false;
};

// Center canvas
const centerCanvas = () => {
  const stageInstance = stage.value.getStage();
  stageInstance.position({ x: 0, y: 0 });
  stageInstance.scale({ x: 1, y: 1 });
  stageInstance.batchDraw();
  updateMinimap();
};

// Update minimap viewport
const updateMinimap = () => {
  const stageInstance = stage.value.getStage();
  const scale = stageInstance.scaleX();
  const pos = stageInstance.position();
  viewportRect.value = {
    x: -pos.x * minimapScale / scale,
    y: -pos.y * minimapScale / scale,
    width: width * minimapScale / scale,
    height: height * minimapScale / scale,
    stroke: 'red',
    strokeWidth: 2,
    fill: 'rgba(255, 0, 0, 0.1)',
  };
  minimapStage.value.getStage().batchDraw();
};

onMounted(() => {
  updateMinimap();
});

// Watch for changes in circles to update minimap
watch(circles, () => {
  minimapStage.value.getStage().batchDraw();
});
</script>

<style scoped>
.canvas-container {
  position: relative;
  width: 100%;
  height: calc(100vh - 120px);
  /* Adjust based on your header height */
  overflow: hidden;
}

.minimap-container {
  position: absolute;
  top: 10px;
  left: 10px;
  width: 200px;
  height: 150px;
  border: 1px solid #ccc;
  background: rgba(255, 255, 255, 0.8);
  z-index: 10;
}

body {
  margin: 0;
  padding: 0;
}
</style>