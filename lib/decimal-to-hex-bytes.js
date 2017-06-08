export default function decimalToHexBytes(n, max) {
  const range = n * max;
  let hex = range.toString(16);

  while (hex.length < 4) {
    hex = "0" + hex;
  }

  return [parseInt(hex.substring(0, 2), 16), parseInt(hex.substring(2, 4), 16)];
}
