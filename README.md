#  Lapius: Automatic Medical Coder

**Lapius** is a powerful Multi-agent application that empowers medical coders and patients to extract medical codes (ICD-10-CM) from medical records or explain the meaning of codes found in medical bills or EOB. By leveraging the advanced capabilities of LLaMA 3.1 (405B and 90B) and the multimodl LLaMA 3.2 (11B) models, Lapius allows you to work with both textual data and images.  

---
![Preview](asset/preview.jpg)
## Table of Contents

- [Features](#features)
- [How It Works](#how-it-works)
- [Usage](#usage)
- [Technical Details](#technical-details)
- [Limitations and Next steps](#limitation-and-next-steps)
- [License](#license)

---

## Features

- **Eplain codes from your itemised bill or EOB**: By uploading an image of your medical receipt, the model will be able to extract the codes and tell you what they mean and what disease or procedure they are associated with. .
- **Extract ICD-10-CM codes from clinical note**: Automatically extract ICD-10-CM codes from any textual clinical note.
- **Self-explanatory**: The solution is able to identify the text references in the clinical note to help the medical coder or patient.
- **Reranking**: By leveraging a multi-agent workflow, Lapius can rerank the codes from most to least likely.

---

## How It Works

1. **Define Your Use Case**: Start by specifying the purpose of your chatbot.Decide whether you want to upload a medical bill or paste the text of a medical diagnosis. 
2a. **Upload Documents**: Enhance your chatbot's knowledge base by uploading an itimised bill or EOB document.
2b. **Paste your clinical note**: Utilize a Mixture-of-Agents architecture to extract the medical codes.
3. **Get the results**: One section will be devoted to the exploration of response with text references and alternative codes. .


![Architechture](asset/architecture.png)

---

## Usage
![icd-10](asset/image-lapius.png)
1. **Launch the App**: Click here: https://lapius-chat.vercel.app/.
2. **Create a New conversation**:
    - Upload an image.
    - Enter your clinical note.
   

![cpt](asset/image-lapius2.jpg)
---

## Technical Details

- **Frontend**: Built with Next.js for a responsive and intuitive user interface.
- **Backend**: Utilizes a REST API written in Flask.
- **Models**:
    - **LLaMA 3.1 (405B)**: 
    - **LLaMA 3.1 (70B)**
    - **LLaMA 3.2 (11B)**: 


 
---
![MoA Architecture](asset/moa.jpg)




---

## License

This project is licensed under the [MIT License](LICENSE).

---

**Disclaimer**: This application utilizes large language models which may have limitations in understanding and generating content. Always review and verify the chatbot's responses for accuracy and appropriateness.
