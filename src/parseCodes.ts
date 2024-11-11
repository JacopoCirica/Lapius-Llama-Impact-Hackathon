import { ImageMedicalCode } from "@/components/types";

const parseMedicalCodes = (response: string): ImageMedicalCode[] => {
  // Split by each line and filter out any empty lines
  const lines = response.split("\n").filter((line) => line.trim() !== "");

  const medicalCodes: ImageMedicalCode[] = [];

  lines.forEach((line) => {
    try {
      // Trim the line to remove any extra whitespace
      const trimmedLine = line.trim();

      // Use a simple check to ensure the line starts with '{' and ends with '}'
      if (!trimmedLine.startsWith("{") || !trimmedLine.endsWith("}")) {
        console.warn("Skipping malformed line:", line);
        return;
      }

      // Parse each line as JSON
      const codeData = JSON.parse(trimmedLine);

      // Ensure it has the required fields
      if (codeData.type && codeData.code && codeData.description) {
        // Add to medicalCodes array
        medicalCodes.push({
          codeType: codeData.type,
          code: codeData.code,
          description: codeData.description,
        });
      }
    } catch (error) {
      console.error("Failed to parse line as JSON:", line, error);
    }
  });

  return medicalCodes;
};

export default parseMedicalCodes;
