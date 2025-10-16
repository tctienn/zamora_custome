import { ref } from 'vue';

type SignState = {
  canvasIndex: number;
  img: HTMLImageElement | undefined;
  x: number;
  y: number;
}

export function usePdfSignState() {
  const canvasStates = ref<SignState[]>([]);
  const currentStateIndex = ref(-1);

  function saveState(canvasIndex: number, img: HTMLImageElement, x: number, y: number) {
    currentStateIndex.value++;
    canvasStates.value[currentStateIndex.value] = {
      canvasIndex: canvasIndex,
      img,
      x,
      y
    };
  }

  function backState() {
    let rs: SignState[] = [];
    if (currentStateIndex.value >= 0) {
      const state = canvasStates.value[currentStateIndex.value];
      rs = [...canvasStates.value.filter((item, index) => index < currentStateIndex.value && item.canvasIndex === state.canvasIndex)];

      currentStateIndex.value--;
      if (!rs.length) {
        rs.push({
          ...state,
          img: undefined
        });
      }
    }
    return rs;
  }

  function resetState() {
    currentStateIndex.value = -1;
    canvasStates.value = [];
  }

  return {
    canvasStates,
    currentStateIndex,
    saveState,
    backState,
    resetState
  };
}
