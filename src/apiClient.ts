import { LapiusFormData, ClinicalResponse } from "@/components/types";
import http from "@/utils/httpCommon";
import Together from "together-ai";

export const getClinicalNote = async (
  data: LapiusFormData,
  signal: AbortSignal
): Promise<ClinicalResponse> => {
  try {
    const response = await http.post<ClinicalResponse>(
      "/process_clinical_note",
      data,
      { signal }
    );

    return response.data;
  } catch (e: any) {
    if (e.response.data.error)
      alert("The form is incomplete. Please check all details");
    throw e;
    throw e;
  }
};
const together = new Together({
  apiKey: "e3c4df095771050368ad316d06a40693b4b9cbf107cdf19b83e6c290c7e1914a",
});

// export async function annotateMedicalImage(base64Image: string) {
//   try {
//     const stream = await together.chat.completions.create({
//       model: "meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo",
//       messages: [
//         {
//           role: "user",
//           content: [
//             {
//               type: "text",
//               text: `You are a skilled medical annotator. Please review the image, identify any medical codes present (CPT, ICD-10, or HCPCS), and explain their meaning in valid JSON format. Follow this example format:

//   {"type": "ICD10", "code": "A01.00", "description": "Indicates a diagnosis of Cholera."}

//   Image: data:image/jpeg;base64,${base64Image}`,
//             },
//           ],
//         },
//       ],
//       stream: true,
//     });

//     return stream;
//   } catch (error) {
//     console.error("Error annotating medical image:", error);
//     throw error;
//   }
// }

export async function annotateMedicalImage(base64Image: string) {
  const stream = await together.chat.completions.create({
    model: "meta-llama/Llama-3.2-11B-Vision-Instruct-Turbo",
    temperature: 0.2,
    stream: true,
    max_tokens: 500,
    messages: [
      {
        role: "user",
        // @ts-expect-error Need to fix the TypeScript library type
        content: [
          {
            type: "text",
            text: `You are a skilled medical annotator. Please review the image, identify any medical codes present (CPT, ICD-10, or HCPCS), and explain their meaning in valid JSON format. Follow this example format:
  
  {"type": "ICD10", "code": "A01.00", "description": "Indicates a diagnosis of Cholera."} I just need the json format. Do not provide any unncecessary text. Make sure the "code" field doesn't have English words. It should be mostly number with few alphabets.`,
          },
          {
            type: "image_url",
            image_url: {
              url: `data:image/jpeg;base64,${base64Image}`,
            },
          },
        ],
      },
    ],
  });

  let fullResponse = ""; // Accumulate the response here

  for await (const chunk of stream) {
    fullResponse += chunk.choices[0]?.delta?.content || "";
  }
  return fullResponse;
}
