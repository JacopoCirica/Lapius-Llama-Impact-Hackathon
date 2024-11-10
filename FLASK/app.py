from flask import Flask, request, jsonify
from flask_cors import CORS
import asyncio
import os
from dotenv import load_dotenv
import together
from together import AsyncTogether, Together
from prompts_module import unique_prompts, aggreagator_system_prompt 
from utils import function_tool_umls, parsed, concept_to_code,icd_description, run_llm_icd10, rag_pipeline
import requests
from llama_index.retrievers.bm25 import BM25Retriever

app = Flask(__name__)
CORS(app)

# Initialize Together clients

load_dotenv()
client = Together(api_key=os.environ.get("TOGETHER_API_KEY"))
async_client = AsyncTogether(api_key=os.environ.get("TOGETHER_API_KEY"))

reference_models = [
    "meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo",
    "meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo",
    "meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo",
    "meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo",
    "meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo",
    "meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo"
]
aggregator_model = "meta-llama/Meta-Llama-3.1-405B-Instruct-Turbo"
aggregator_system_prompt=aggreagator_system_prompt

async def run_llm(model, prompt, clinical_note):
    for sleep_time in [1, 2, 4]:
        try:
            response = await async_client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": prompt},
                    {"role": "user", "content": f"Here the clinical note: {clinical_note}"}
                ],
                temperature=0.7,
                max_tokens=512,
            )
            break
        except together.error.RateLimitError as e:
            print(e)
            await asyncio.sleep(sleep_time)
    return response.choices[0].message.content

async def main(clinical_note):
    messages=[]
    final_codes=[]
    results = await asyncio.gather(
        *[run_llm(model, prompt, clinical_note) for model, prompt in zip(reference_models, unique_prompts)]
    )

    finalStream = client.chat.completions.create(
        model=aggregator_model,
        messages=[
            {"role": "system", "content": aggregator_system_prompt + "\n" + "\n".join([f"{i+1}. {str(element)}" for i, element in enumerate(results)])},
            {"role": "user", "content": f"Here the clinical note: {clinical_note}"},
        ],
        stream=False,
    )

    response_1st_layer = finalStream.choices[0].message.content
    print(response_1st_layer)
    print(messages)
    tool_umls=function_tool_umls(response_1st_layer,messages)
    print(tool_umls)
    parsed_response= parsed(tool_umls.name, tool_umls.arguments)
    print(parsed_response)
    # Process further and handle functions if needed
    # Here, you can add code to call the `UMLSTool` or other functions as needed
    
    def UMLSTool(diagnosis):
      
  # Define your parameters here
      apikey = "cbd5538e-d114-44ad-93ce-da3e0e18d036"  # Replace with your actual API key
      version = "current"  # Set to the version you need
      sabs = "ICD10CM"  # Optional: set source vocabularies

  # Define your search terms as a list of strings
      search_string = diagnosis # Add as many search terms as you need

# Base URI
      base_uri = 'https://uts-ws.nlm.nih.gov'

  #for search_string in search_strings:
      for _ in search_string:

        codes=[]
        print(f"SEARCH STRING: {_}\n")
        path = f'/search/{version}'
        query = {
        'string': _,
        'apiKey': apikey,
        'sabs': sabs,
        #'termType': 'PS',
        'pageNumber': 1,  # Only request the first page
        'returnIdType': 'concept',
        'partialSearch': 'true'
    }

    # Make the GET request
        response = requests.get(base_uri + path, params=query)
        response.encoding = 'utf-8'
        output_json = response.json()
        results = output_json.get('result', {}).get('results', [])

    # Check if results are available
        if not results:
          print(f"No results found for '{search_string}'\n")
        else:
            for item in results:
                potential_code=concept_to_code(item['ui'])
                codes.append(potential_code)

        final_result=icd_description(codes)
        print(final_result)
        relevant_node=rag_pipeline(final_result)
        print(relevant_node)
        final_final_response=run_llm_icd10(final_result, clinical_note, _, relevant_node)
        print(final_final_response)
        final_codes.append(final_final_response)

      return final_codes
    if parsed_response:
      available_functions = {"UMLSTool": UMLSTool}
      function_to_call = available_functions[parsed_response["function"]]
      print(f"Calling function {function_to_call}")
      diagnosis = function_to_call(parsed_response["arguments"]["diagnosis"])
      messages.append(
        {
            "role": "tool",
            "content": diagnosis,
        }
    )
      #print("ICD10-CM answer are: ", diagnosis)
      try:
    # Attempt to generate a response from the LLM
        res = together.chat.completions.create(
        model="meta-llama/Meta-Llama-3.1-405B-Instruct-Turbo",
        messages=messages,
        max_tokens=1000,
        temperature=0,
    )

    # Safely print the response if the structure is as expected
        if res and "choices" in res and len(res.choices) > 0 and "message" in res.choices[0]:
          print("Answer from the LLM:",res.choices[0].message.content)
          return res.choices[0].message.content
        else:
          print("Unexpected response structure or no message found")

      except Exception as e:

        pass  # Skip the error and continue
      
      return final_codes
    
@app.route('/api/process_clinical_note', methods=['POST','GET'])
def process_clinical_note():
    # Read the raw data from the request body
    clinical_note = request.data.decode('utf-8').strip()

    if not clinical_note:
        return jsonify({'error': 'Missing clinical note'}), 400

    # Run the main function asynchronously
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    response = loop.run_until_complete(main(clinical_note))
    print(response)
    return jsonify({'result': response})
@app.route('/api/process_image', methods=['POST'])
def process_image():
    # Parse Base64 image from request
    data = request.get_json()
    base64_image = data.get('image_base64')

    if not base64_image:
        return jsonify({'error': 'Missing Base64 image data'}), 400
    else:
       print("Yes")

    # Create the prompt for Together client
    try:
        stream = client.chat.completions.create(
            model="meta-llama/Llama-3.2-11B-Vision-Instruct-Turbo",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": "which kind of codes are present in the image. Can you list all the CPT codes? Can you tell me what they mean?"},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{base64_image}",
                            },
                        },
                    ],
                }
            ],
            stream=False,
        )

        # Extract and return the response from the model
        response_content = stream.choices[0].message.content
        return jsonify({'description': response_content})

    except Exception as e:
        return jsonify({'error': str(e)}), 500
@app.route('/')
def home():
   return "Api endpoint"

if __name__ == '__main__':
    app.run()
