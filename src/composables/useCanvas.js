import { ref, onMounted, onUnmounted } from 'vue';

export function useCanvas() {
  // Canvas size (full container size, reactive)
  const width = ref(window.innerWidth);
  const height = ref(window.innerHeight - 120); // Adjust for header height

  // Main stage configuration
  const configKonva = ref({
    width: width.value,
    height: height.value,
  });

  // Resize handler
  const handleResize = () => {
    width.value = window.innerWidth;
    height.value = window.innerHeight - 120; // Adjust for header
    configKonva.value.width = width.value;
    configKonva.value.height = height.value;
  };

  // Lifecycle hooks
  onMounted(() => {
    window.addEventListener('resize', handleResize);
    handleResize(); // Initial call to set correct size
  });

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize);
  });

  return {
    width,
    height,
    configKonva,
    handleResize,
  };
}