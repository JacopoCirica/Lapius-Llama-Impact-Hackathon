const together = new Together({
  apiKey: "e3c4df095771050368ad316d06a40693b4b9cbf107cdf19b83e6c290c7e1914a",
});

export async function annotateMedicalImage(base64Image) {
  try {
    const stream = await together.chat.completions.create({
      model: "meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `You are a skilled medical annotator. Please review the image, identify any medical codes present (CPT, ICD-10, or HCPCS), and explain their meaning in valid JSON format. Follow this example format:

  {"type": "ICD10", "code": "A01.00", "description": "Indicates a diagnosis of Cholera."}

  Image: data:image/jpeg;base64,${base64Image}`,
            },
          ],
        },
      ],
      stream: true,
    });

    return stream;
  } catch (error) {
    console.error("Error annotating medical image:", error);
    throw error;
  }
}
