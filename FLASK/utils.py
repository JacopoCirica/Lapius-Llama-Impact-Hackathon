import json 
from together import Together
import simple_icd_10_cm as cm
import requests
import os
from prompts_module import system_prompt
os.environ['TOGETHER_API_KEY'] = "e3c4df095771050368ad316d06a40693b4b9cbf107cdf19b83e6c290c7e1914a"
client = Together(api_key=os.environ.get("TOGETHER_API_KEY"))
from llama_index.retrievers.bm25 import BM25Retriever 


def function_tool_umls(response_1st_layer,messages):
  together = Together()

  UMLSTool = {
      "name": "UMLSTool",
      "description": "Extract the diagnosis for ICD-10-CM codes from a given annotated clinical note ",
      "parameters": {
          "type": "object",
          "parameters": {
              "diagnosis": {
                  "type": "list",
                  "description": " Diagnosis for ICD-10_CM",
              },
          },
          "required": ["diagnosis"],
      },
  }

  toolPrompt = f"""
  You have access to the following functions:

  Use the function '{UMLSTool["name"]}' to '{UMLSTool["description"]}':
  {json.dumps(UMLSTool)}

  You MUST call a function and ONLY reply in the following format with no prefix or suffix:

  <function=example_function_name>{{\"example_name\": \"example_value\"}}</function>

  You have to create a list of diagnosis, by extracting them from the summaryof clinical note.
  You will receive the summary of a clinical note. Use its list of diagnosis.

  Reminder:
  - Function calls MUST follow the specified format, start with <function= and end with </function>
  - Required parameters MUST be specified
  - Only call one function at a time
  - Put the entire function call reply on one line
  - If there is no function call available, answer the question like normal with your current knowledge and do not tell the user about function calls"""

  messages.append(
      {
          "role": "system",
          "content": toolPrompt,
      })
  messages.append({
          "role": "user",
          "content": f"""Summary clinical note:{response_1st_layer}""",
      })

  
  response = together.chat.completions.create(
      model="meta-llama/Meta-Llama-3.1-405B-Instruct-Turbo",
      messages=messages,
      max_tokens=1024,
      temperature=0,
  )

  messages.append(response.choices[0].message)
  
  return response.choices[0].message.tool_calls[0].function

def parsed(name, args):
  return {
    "function": name,
    "arguments": json.loads(args)
  }

def concept_to_code(concept):
  # Import the requests library

# Define the base URL
  base_url = 'https://uts-ws.nlm.nih.gov/search/current'

# Define the parameters for the GET request
  params = {
    'apiKey': 'cbd5538e-d114-44ad-93ce-da3e0e18d036',
    'string': concept,
    'sabs': 'ICD10CM',
    'returnIdType': 'code'
}

# Make the GET request
  response = requests.get(base_url, params=params)

# Check if the request was successful
  if response.status_code == 200:
    response.encoding = 'utf-8'  # Ensure correct encoding
    # Parse the response JSON
    output_json = response.json()
    return output_json['result']['results'][0]['ui']
  else:
    print(f"Request failed with status code {response.status_code}")
def icd_description (list_codes):
  descriptions=[]
  for code in list_codes:
    try:
      description=cm.get_description(code)
      descriptions.append(description)
    except:
      descriptions.append("No description found")
  my_dict = dict(zip(list_codes, descriptions))
  return my_dict
def rag_pipeline(dictionary_codes):
  loaded_bm25_retriever = BM25Retriever.from_persist_dir("/Users/jacopocirica/Desktop/flasky/uploads")
  # Get the first key-value pair
  first_key, first_value = next(iter(dictionary_codes.items()))
  # will retrieve context from specific companies
  retrieved_nodes = loaded_bm25_retriever.retrieve(
    f"What is the code {first_key}: {first_value}"
    )
  return retrieved_nodes[0].get_content() 


def run_llm_icd10(list_codes, clinical_note, text_reference, relevant_node):
    """Run a single LLM call with a reference model and a specific prompt to identify the right icd10 codes from a list"""
    messages = (
                [
                    {
                        "role": "system",
                        "content": system_prompt,

                    },
                    {"role": "user", "content": f"""Here the clinical note:{clinical_note},
                     Here the list of potential codes: {list_codes},
                     Here the text reference: {text_reference}
                    Here the description of some relevant_node: {relevant_node}"""},

                ]

            )
    response = client.chat.completions.create(
                 model='meta-llama/Meta-Llama-3.1-405B-Instruct-Turbo',
                messages=messages,
                temperature=0.7,
                max_tokens=512,
            )
    return response.choices[0].message.content