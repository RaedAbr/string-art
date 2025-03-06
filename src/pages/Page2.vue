vue

<template>
  <div>
    <canvas ref="canvasRef" @mousedown="handleMouseDown" @mousemove="handleMouseMove" @mouseup="handleMouseUp"></canvas>
    <div class="controls">
      <button @click="clearCanvas">Clear</button>
      <p>Mode: {{ mode === 'draw' ? 'Drawing Lines' : 'Connecting Points' }}</p>
      <button @click="toggleMode">{{ mode === 'draw' ? 'Switch to Connect' : 'Switch to Draw' }}</button>
      <button @click="stopSequence" :disabled="isStopDisabled">Stop Sequence</button>
      <button @click="redistributePoints" :disabled="isRedistributeDisabled">Redistribute Points</button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed } from 'vue';

interface Point {
  x: number;
  y: number;
}

interface Line {
  start: Point;
  end: Point;
  points: Point[];
}

export default defineComponent({
  name: 'StringArtSimulator',
  setup() {
    const canvasRef = ref<HTMLCanvasElement | null>(null);
    const lines = ref<Line[]>([]);
    const currentLine = ref<Line | null>(null);
    const mode = ref<'draw' | 'connect'>('draw');
    const sequences = ref<Point[][]>([]);
    const currentSequence = ref<Point[]>([]);
    const selectedLine = ref<Line | null>(null);

    let context: CanvasRenderingContext2D | null = null;

    onMounted(() => {
      if (canvasRef.value) {
        const canvas = canvasRef.value;
        context = canvas.getContext('2d');
        canvas.width = 800;
        canvas.height = 600;
        redraw();
      }
    });

    const getMousePos = (e: MouseEvent): Point => {
      const rect = canvasRef.value!.getBoundingClientRect();
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    const handleMouseDown = (e: MouseEvent) => {
      const { x, y } = getMousePos(e);
      if (mode.value === 'draw') {
        currentLine.value = { start: { x, y }, end: { x, y }, points: [] };
      } else if (mode.value === 'connect') {
        handleConnectMode(x, y);
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (mode.value === 'draw' && currentLine.value) {
        const { x, y } = getMousePos(e);
        currentLine.value.end = { x, y };
        redraw();
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (mode.value === 'draw' && currentLine.value) {
        const { x, y } = getMousePos(e);
        currentLine.value.end = { x, y };
        lines.value.push(currentLine.value);
        currentLine.value = null;
        redraw();
      }
    };

    const redraw = () => {
      if (!context || !canvasRef.value) return;
      const ctx = context!;
      ctx.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height);

      ctx.strokeStyle = 'black';
      ctx.lineWidth = 1;
      lines.value.forEach((line) => {
        ctx.beginPath();
        ctx.moveTo(line.start.x, line.start.y);
        ctx.lineTo(line.end.x, line.end.y);
        ctx.stroke();

        line.points.forEach((point) => {
          ctx.beginPath();
          ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
          ctx.fillStyle = 'red';
          ctx.fill();
        });
      });

      if (currentLine.value) {
        ctx.beginPath();
        ctx.moveTo(currentLine.value.start.x, currentLine.value.start.y);
        ctx.lineTo(currentLine.value.end.x, currentLine.value.end.y);
        ctx.stroke();
      }

      ctx.strokeStyle = 'blue';
      sequences.value.forEach((sequence) => {
        if (sequence.length > 1) {
          ctx.beginPath();
          ctx.moveTo(sequence[0].x, sequence[0].y);
          for (let i = 1; i < sequence.length; i++) {
            ctx.lineTo(sequence[i].x, sequence[i].y);
          }
          ctx.stroke();
        }
      });

      if (currentSequence.value.length > 1) {
        ctx.beginPath();
        ctx.moveTo(currentSequence.value[0].x, currentSequence.value[0].y);
        for (let i = 1; i < currentSequence.value.length; i++) {
          ctx.lineTo(currentSequence.value[i].x, currentSequence.value[i].y);
        }
        ctx.stroke();
      }
    };

    const handleConnectMode = (x: number, y: number) => {
      const closestLine = findClosestLine(x, y);
      if (closestLine) {
        selectedLine.value = closestLine;
        const snappedPoint = projectPointOntoLine(x, y, closestLine);
        closestLine.points.push(snappedPoint);
        currentSequence.value.push(snappedPoint);
        redraw();
      }
    };

    const findClosestLine = (x: number, y: number): Line | null => {
      let closestLine: Line | null = null;
      let minDist = Infinity;

      lines.value.forEach((line) => {
        const dist = pointToLineDistance(x, y, line);
        if (dist < minDist && dist < 20) {
          minDist = dist;
          closestLine = line;
        }
      });

      return closestLine;
    };

    const pointToLineDistance = (x: number, y: number, line: Line): number => {
      const { start, end } = line;
      const A = x - start.x;
      const B = y - start.y;
      const C = end.x - start.x;
      const D = end.y - start.y;
      const dot = A * C + B * D;
      const lenSq = C * C + D * D;
      const param = lenSq !== 0 ? dot / lenSq : -1;
      let xx: number, yy: number;

      if (param < 0) {
        xx = start.x;
        yy = start.y;
      } else if (param > 1) {
        xx = end.x;
        yy = end.y;
      } else {
        xx = start.x + param * C;
        yy = start.y + param * D;
      }

      const dx = x - xx;
      const dy = y - yy;
      return Math.sqrt(dx * dx + dy * dy);
    };

    const projectPointOntoLine = (x: number, y: number, line: Line): Point => {
      const { start, end } = line;
      const A = x - start.x;
      const B = y - start.y;
      const C = end.x - start.x;
      const D = end.y - start.y;
      const dot = A * C + B * D;
      const lenSq = C * C + D * D;
      const param = lenSq !== 0 ? dot / lenSq : -1;

      if (param < 0) {
        return { x: start.x, y: start.y };
      } else if (param > 1) {
        return { x: end.x, y: end.y };
      } else {
        return {
          x: start.x + param * C,
          y: start.y + param * D,
        };
      }
    };

    const redistributePoints = () => {
      if (!selectedLine.value || selectedLine.value.points.length < 2) return;

      const line = selectedLine.value;
      const numPoints = line.points.length;
      const dx = (line.end.x - line.start.x) / (numPoints - 1);
      const dy = (line.end.y - line.start.y) / (numPoints - 1);

      const newPoints: Point[] = [];
      for (let i = 0; i < numPoints; i++) {
        newPoints.push({
          x: line.start.x + i * dx,
          y: line.start.y + i * dy,
        });
      }

      const oldToNew = new Map<Point, Point>();
      line.points.forEach((oldPoint, i) => {
        oldToNew.set(oldPoint, newPoints[i]);
      });

      line.points = newPoints;

      sequences.value = sequences.value.map((sequence) =>
        sequence.map((point) => oldToNew.get(point) || point)
      );

      currentSequence.value = currentSequence.value.map((point) =>
        oldToNew.get(point) || point
      );

      redraw();
    };

    const stopSequence = () => {
      if (currentSequence.value.length > 0) {
        sequences.value.push([...currentSequence.value]);
        currentSequence.value = [];
        redraw();
      }
    };

    const clearCanvas = () => {
      lines.value = [];
      currentLine.value = null;
      sequences.value = [];
      currentSequence.value = [];
      selectedLine.value = null;
      redraw();
    };

    const toggleMode = () => {
      mode.value = mode.value === 'draw' ? 'connect' : 'draw';
    };

    const isStopDisabled = computed(() => {
      return mode.value === 'draw' || currentSequence.value.length === 0;
    });

    const isRedistributeDisabled = computed(() => {
      return !selectedLine.value || selectedLine.value.points.length < 2;
    });

    return {
      canvasRef,
      mode,
      handleMouseDown,
      handleMouseMove,
      handleMouseUp,
      clearCanvas,
      toggleMode,
      stopSequence,
      redistributePoints,
      isStopDisabled,
      isRedistributeDisabled,
    };
  },
});
</script>

<style>
.app {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
}
canvas {
  border: 1px solid #ccc;
}
.controls {
  margin-top: 20px;
}
button {
  margin: 0 10px;
}
button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>