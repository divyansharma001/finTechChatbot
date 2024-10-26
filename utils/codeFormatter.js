export default function formatAsJsonInput(code) {
  const escapedCode = code
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\n/g, "\\n");
  return escapedCode;
}
