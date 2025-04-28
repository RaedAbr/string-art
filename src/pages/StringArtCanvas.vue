<template>
  <div class="canvas-container">
    <!-- Main Canvas -->
    <div class="drawing-canvas">
      <v-stage ref="stage" :config="canvas.configKonva.value" @mousedown="interactions.handleMouseDown"
        @mousemove="handleMouseMove" @mouseup="interactions.handleMouseUp" @click="handleCanvasClick">
        <v-layer ref="gridLayer" id="gridLayer"></v-layer>
        <v-layer ref="layer">
          <!-- Circles -->
          <v-circle v-for="circle in store.circles" :key="circle.id" :config="{
            x: circle.x,
            y: circle.y,
            radius: 20,
            fill: circle.color,
            opacity: 0.8,
          }"></v-circle>
          <!-- Points (start/end and nails) -->
          <v-circle v-for="point in store.points" :key="point.id" :config="{
            x: point.x,
            y: point.y,
            radius: 3,
            fill: COLORS.POINT_FILL,
          }"></v-circle>
          <!-- Segments -->
          <v-line v-for="segment in store.segments" :key="segment.id" :config="{
            points: [segment.start.x, segment.start.y, segment.end.x, segment.end.y],
            stroke: store.selectedSegment?.id === segment.id ? COLORS.SELECTED_SEGMENT_STROKE : COLORS.SEGMENT_STROKE,
            strokeWidth: store.selectedSegment?.id === segment.id ? 3 : 2,
          }"></v-line>
          <!-- Preview Segment -->
          <v-line v-if="previewSegment" :config="{
            points: [previewSegment.start.x, previewSegment.start.y, previewSegment.end.x, previewSegment.end.y],
            stroke: COLORS.PREVIEW_SEGMENT_STROKE,
            strokeWidth: 2,
            dash: [5, 5],
          }"></v-line>
          <!-- Preview Nails for Selected Segment -->
          <v-circle v-if="store.selectedSegment" v-for="(nail, index) in getSegmentNails(store.selectedSegment)"
            :key="`${store.selectedSegment.id}-preview-nail-${index}`" :config="{
              x: nail.x,
              y: nail.y,
              radius: 3,
              fill: COLORS.POINT_FILL,
              opacity: 0.5,
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
          <!-- Minimap Points -->
          <v-circle v-for="point in store.points" :key="point.id" :config="{
            x: point.x * minimap.minimapScale.value,
            y: point.y * minimap.minimapScale.value,
            radius: 3 * minimap.minimapScale.value,
            fill: COLORS.POINT_FILL,
          }"></v-circle>
          <!-- Minimap Segments -->
          <v-line v-for="segment in store.segments" :key="segment.id" :config="{
            points: [
              segment.start.x * minimap.minimapScale.value,
              segment.start.y * minimap.minimapScale.value,
              segment.end.x * minimap.minimapScale.value,
              segment.end.y * minimap.minimapScale.value,
            ],
            stroke: store.selectedSegment?.id === segment.id ? COLORS.SELECTED_SEGMENT_STROKE : COLORS.SEGMENT_STROKE,
            strokeWidth: store.selectedSegment?.id === segment.id ? 3 * minimap.minimapScale.value : 2 * minimap.minimapScale.value,
          }"></v-line>
          <!-- Minimap Preview Nails for Selected Segment -->
          <v-circle v-if="store.selectedSegment" v-for="(nail, index) in getSegmentNails(store.selectedSegment)"
            :key="`${store.selectedSegment.id}-preview-nail-${index}`" :config="{
              x: nail.x * minimap.minimapScale.value,
              y: nail.y * minimap.minimapScale.value,
              radius: 3 * minimap.minimapScale.value,
              fill: COLORS.POINT_FILL,
              opacity: 0.5,
            }"></v-circle>
          <!-- Viewport Rectangle -->
          <v-rect :config="minimap.viewportRect.value" />
        </v-layer>
      </v-stage>
    </div>

    <!-- Control panel component -->
    <control-panel @add-circle="interactions.addCircle" @set-move-mode="store.setMoveMode"
      @set-selection-mode="store.setSelectionMode" @zoom-in="interactions.zoomIn" @zoom-out="interactions.zoomOut"
      @center-canvas="interactions.centerCanvas" @split-grid="grid.splitGrid" @enlarge-grid="grid.enlargeGrid"
      @toggle-grid="grid.toggleGrid" />
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import Konva from 'konva';
import { useCanvasStore } from '@/stores/canvasStore';
import { useCanvas } from '@/composables/useCanvas';
import { useMinimap } from '@/composables/useMinimap';
import { useCanvasInteractions } from '@/composables/useCanvasInteractions';
import { useGrid } from '@/composables/useGrid';
import { useDrawing } from '@/composables/useDrawing';
import { COLORS } from '@/constants/colors';
import ControlPanel from '@/components/ControlPanel.vue';

// Refs for Konva stages and layers
const stage = ref(null);
const gridLayer = ref(null);
const minimapStage = ref(null);

// Pinia store
const store = useCanvasStore();

// Composables
const canvas = useCanvas();
const minimap = useMinimap(canvas.width, canvas.height, store.circles, stage, minimapStage);
const grid = useGrid(stage, canvas.width, canvas.height);
const interactions = useCanvasInteractions(stage, canvas.width, canvas.height, minimap.updateMinimap, () =>
  grid.drawGrid(gridLayer.value?.getNode())
);
const drawing = useDrawing(stage, grid.gridSize, canvas.width, canvas.height);

// Preview segment state
const previewSegment = ref(null);

// Handle mouse move for preview segment
const handleMouseMove = (e) => {
  if (store.isDrawingMode && store.activePoint && stage.value && !store.selectedSegment) {
    const stageInstance = stage.value.getStage();
    const pointerPos = stageInstance.getPointerPosition();
    previewSegment.value = drawing.getPreviewSegment(pointerPos);
  } else {
    previewSegment.value = null;
  }
  interactions.handleMouseMove(e);
};

// Handle canvas click for drawing or selection
const handleCanvasClick = (e) => {
  if (store.isDrawingMode) {
    drawing.handleCanvasClick(e);
  } else if (store.isSelectionMode) {
    interactions.handleCanvasClick(e);
  }
};

// Calculate nails (points) on a segment for preview
const getSegmentNails = (segment) => {
  // Use stored nails if available, otherwise generate for preview
  if (segment.nails && segment.nails.length > 0) {
    return segment.nails;
  }
  const count = segment.pointCount || 2;
  if (count < 2) return [segment.start, segment.end];

  let nails = [];
  const dx = (segment.end.x - segment.start.x) / (count - 1);
  const dy = (segment.end.y - segment.start.y) / (count - 1);

  for (let i = 0; i < count; i++) {
    nails = [
      ...nails,
      {
        x: segment.start.x + i * dx,
        y: segment.start.y + i * dy,
      },
    ];
  }

  return nails;
};

onMounted(() => {
  minimap.updateMinimap();
  if (gridLayer.value) {
    grid.drawGrid(gridLayer.value.getNode());
  }
});

// Redraw grid on size, visibility, or position changes
watch(
  [canvas.width, canvas.height, grid.gridSize, grid.isGridVisible, store.lastPos],
  () => {
    if (gridLayer.value) {
      grid.drawGrid(gridLayer.value.getNode());
    }
  },
  { deep: true }
);

// Update minimap and canvas on points/segments/selectedSegment changes
watch([store.points, store.segments, () => store.selectedSegment], () => {
  if (minimapStage.value) {
    minimapStage.value.getStage().batchDraw();
  }
  if (stage.value) {
    stage.value.getStage().batchDraw();
  }
});

// Redraw when segmentPointCount changes for selected segment
watch(() => store.segmentPointCount, () => {
  if (minimapStage.value) {
    minimapStage.value.getStage().batchDraw();
  }
  if (stage.value) {
    stage.value.getStage().batchDraw();
  }
});
</script>

<style scoped>
.canvas-container {
  position: relative;
  width: 100%;
  height: calc(100vh - 120px);
}

.drawing-canvas :v-deep .konvajs-content canvas {
  border: 2px solid #000000 !important;
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