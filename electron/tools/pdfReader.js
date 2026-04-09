export async function pdfReader(filePath) {
  return {
    tool: "pdfReader",
    filePath,
    content: "",
  };
}
