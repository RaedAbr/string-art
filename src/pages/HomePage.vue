<script setup lang="ts">
import Button from '@/components/ui/button/Button.vue';
import { ref, onMounted, watch } from 'vue';

const canvas = ref<HTMLCanvasElement | null>(null);
const numPoints = ref(20);
const step = ref(3);
const lineStart = ref<{ x: number; y: number } | null>(null);
const lineEnd = ref<{ x: number; y: number } | null>(null);
const lineLength = ref(200);
const linePoints = ref(5);

const draw = () => {
  if (!canvas.value) return;
  const ctx = canvas.value.getContext("2d");
  if (!ctx) return;

  ctx.clearRect(0, 0, canvas.value.width, canvas.value.height);

  const centerX = canvas.value.width / 2;
  const centerY = canvas.value.height / 2;
  const radius = Math.min(centerX, centerY) - 20;
  const points: { x: number, y: number }[] = [];

  for (let i = 0; i < numPoints.value; i++) {
    const angle = (i * 2 * Math.PI) / numPoints.value;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    points.push({ x, y });
  }

  ctx.fillStyle = "black";
  points.forEach((p) => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.strokeStyle = "black";
  for (let i = 0; i < numPoints.value; i++) {
    let targetIndex = (i + step.value) % numPoints.value;
    ctx.beginPath();
    ctx.moveTo(points[i].x, points[i].y);
    ctx.lineTo(points[targetIndex].x, points[targetIndex].y);
    ctx.stroke();
  }

  if (lineStart.value && lineEnd.value) {
    ctx.strokeStyle = "red";
    ctx.beginPath();
    ctx.moveTo(lineStart.value.x, lineStart.value.y);
    ctx.lineTo(lineEnd.value.x, lineEnd.value.y);
    ctx.stroke();

    // Dessiner les points sur la ligne
    ctx.fillStyle = "blue";
    for (let i = 0; i <= linePoints.value -1; i++) {
      const t = i / (linePoints.value - 1);
      const x = lineStart.value.x + t * (lineEnd.value.x - lineStart.value.x);
      const y = lineStart.value.y + t * (lineEnd.value.y - lineStart.value.y);
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }
};

const handleClick = (event: MouseEvent) => {
  console.log(event);
  if (!canvas.value) return;
  const rect = canvas.value.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  
  if (!lineStart.value) {
    lineStart.value = { x, y };
  } else {
    const angle = Math.atan2(y - lineStart.value.y, x - lineStart.value.x);
    lineLength.value = Math.sqrt((x - lineStart.value.x) ** 2 + (y - lineStart.value.y) ** 2);
    lineEnd.value = {
      x: lineStart.value.x + lineLength.value * Math.cos(angle),
      y: lineStart.value.y + lineLength.value * Math.sin(angle)
    };
    draw();
  }
};

onMounted(draw);

watch([numPoints, step, lineLength, linePoints], draw);
</script>

<template>
  <div>
    <canvas ref="canvas" :width="1000" :height="700" @click="handleClick"></canvas>
    <Button v-if="!!lineStart" @click="lineStart = null">Ok</Button>
    <div>
      <label>Nombre de points:</label>
      <input type="number" v-model.number="numPoints" min="3" />
    </div>
    <div>
      <label>Distance entre les connexions:</label>
      <input type="number" v-model.number="step" min="1" />
    </div>
    <div>
      <label>Longueur de la ligne:</label>
      <input type="range" v-model.number="lineLength" min="10" max="1000" />
      {{ lineLength }}
    </div>
    <div>
      <label>Nombre de points sur la ligne:</label>
      <input type="range" v-model.number="linePoints" min="2" max="50" />
      {{ linePoints }}
    </div>
    <button @click="draw">Générer</button>
  </div>
</template>

<style>
canvas {
  border: 1px solid black;
  display: block;
  margin-bottom: 10px;
}
</style>