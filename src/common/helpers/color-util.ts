function getAverageRgb(img: string) {
  const context = document.createElement('canvas').getContext('2d');
  if (context) {
    const image = new Image();
    image.setAttribute('crossOrigin', '');
    image.src = img;
    context.imageSmoothingEnabled = true;
    context.drawImage(image, 0, 0, 1, 1);
    return context.getImageData(0, 0, 1, 1).data.slice(0, 3);
  }
}

export function calculateColorBasedOnBackground(background: string) {
  const rgb = getAverageRgb(background);
  if (rgb) {
    const [r, g, b] = rgb;
    return r * 0.299 + g * 0.587 + b * 0.114 > 186 ? '#000000' : '#ffffff';
  }
}

export function calculateColorBasedOnBackgroundColor(background: string) {
  const rgb = hexToRgb(background);
  if (rgb) {
    const { r, g, b } = rgb;
    return r * 0.299 + g * 0.587 + b * 0.114 > 186 ? '#000000' : '#ffffff';
  }
}

function hexToRgb(hex: string) {
  // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, function (m, r, g, b) {
    return r + r + g + g + b + b;
  });

  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

const CHIP_COLOR_CLASS = [
  'bg-blue-100 text-blue-500',
  'bg-green-100 text-green-500',
  'bg-yellow-100 text-yellow-600',
  'bg-red-100 text-red-500',
  'bg-indigo-100 text-indigo-500',
  'bg-purple-100 text-purple-500',
  'bg-pink-100 text-pink-500',
  'bg-cyan-100 text-cyan-600',
  'bg-teal-100 text-teal-500',
  'bg-orange-100 text-orange-500',
];

export function getChipColorClass(name: string) {
  const index = name?.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) ?? 0;
  return CHIP_COLOR_CLASS[index % CHIP_COLOR_CLASS.length];
}

const BG_COLOR_CLASS = [
  'bg-blue-400',
  'bg-green-400',
  'bg-yellow-400',
  'bg-red-400',
  'bg-indigo-400',
  'bg-purple-400',
  'bg-pink-400',
  'bg-cyan-400',
  'bg-teal-400',
  'bg-orange-400',
];

export function getBackgroundColorClass(name: string) {
  const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return BG_COLOR_CLASS[index % BG_COLOR_CLASS.length];
}