<template>
  <div class="canvas-container">
    <!-- Main Canvas -->
    <div class="drawing-canvas">
      <v-stage ref="stage" :config="canvas.configKonva.value" @mousedown="interactions.handleMouseDown"
        @mousemove="interactions.handleMouseMove" @mouseup="interactions.handleMouseUp">
        <v-layer ref="layer">
          <v-circle v-for="circle in store.circles" :key="circle.id" :config="{
            x: circle.x,
            y: circle.y,
            radius: 20,
            fill: circle.color,
            opacity: 0.8,
          }"></v-circle>
        </v-layer>
      </v-stage>
    </div>

    <!-- Minimap -->
    <div class="minimap-container">
      <v-stage ref="minimapStage" :config="minimap.minimapConfig.value">
        <v-layer ref="minimapLayer">
          <v-rect :config="{
            x: 0,
            y: 0,
            width: minimap.minimapConfig.value.width,
            height: minimap.minimapConfig.value.height,
            fill: '#f0f0f0',
          }" />
          <v-circle v-for="circle in store.circles" :key="circle.id" :config="{
            x: circle.x * minimap.minimapScale.value,
            y: circle.y * minimap.minimapScale.value,
            radius: 20 * minimap.minimapScale.value,
            fill: circle.color,
            opacity: 0.8,
          }"></v-circle>
          <v-rect :config="minimap.viewportRect.value" />
        </v-layer>
      </v-stage>
    </div>

    <!-- Control panel component -->
    <control-panel @add-circle="interactions.addCircle" @set-move-mode="store.setMoveMode"
      @zoom-in="interactions.zoomIn" @zoom-out="interactions.zoomOut" @center-canvas="interactions.centerCanvas" />
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'; // Ensure ref is imported
import { useCanvasStore } from '@/stores/canvasStore';
import { useCanvas } from '@/composables/useCanvas';
import { useMinimap } from '@/composables/useMinimap';
import { useCanvasInteractions } from '@/composables/useCanvasInteractions';
import ControlPanel from '@/components/ControlPanel.vue';

// Refs for Konva stages
const stage = ref(null);
const minimapStage = ref(null);

// Pinia store
const store = useCanvasStore();

// Composables
const canvas = useCanvas();
const minimap = useMinimap(canvas.width, canvas.height, store.circles, stage, minimapStage);
const interactions = useCanvasInteractions(stage, canvas.width, canvas.height, minimap.updateMinimap);

onMounted(() => {
  minimap.updateMinimap();
});
</script>

<style scoped>
.canvas-container {
  position: relative;
  width: 100%;
  height: calc(100vh - 120px);
  /* Adjust based on your header height */
}

.drawing-canvas :v-deep .konvajs-content canvas {
  border: 2px solid #000000 !important;
  /* Force visibility with !important if needed */
}

.minimap-container {
  position: absolute;
  top: 10px;
  left: 10px;
  width: 200px;
  height: calc(200px * (var(--canvas-height) / var(--canvas-width)));
  border: 1px solid #ccc;
  background: rgba(255, 255, 255, 0.8);
  z-index: 10;
}

:root {
  --canvas-width: v-bind('canvas.width');
  --canvas-height: v-bind('canvas.height');
}

body {
  margin: 0;
  padding: 0;
}
</style>