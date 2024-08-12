# ! pip install langchain_community tiktoken langchain-openai langchainhub chromadb langchain flask
import os
import json

with open('config.json', 'r') as conf:
    config = json.load(conf)

OPENAI_KEY = config['OPENAI_API_KEY']

# ### Vector Store DB & Retriever
db_path = config["DB_PATH"]
data_source_dir = config["DATA_SOURCE_DIR"]
glossary_dir = config["GLOSSARY_DIR"]

#### INDEXING ####
from langchain_community.document_loaders import TextLoader
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import Chroma
from database import create_db

embedding = OpenAIEmbeddings(api_key=OPENAI_KEY)
if os.path.exists(db_path):
    print(f"Database found at {db_path}")
    # vectorstore = Chroma.from_documents(documents=splits, persist_directory=db_path, embedding=OpenAIEmbeddings())
    vectorstore = Chroma(persist_directory=db_path, embedding_function=embedding)
else:
    print(f"Constructing database at {db_path}")
    vectorstore = create_db(db_path, data_source_dir, embedding)

retriever = vectorstore.as_retriever(search_type="mmr", search_kwargs={'k': 5, 'lambda_mult': 0.25})

from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough

llm = ChatOpenAI(temperature=0, api_key=OPENAI_KEY)

# Post-processing
def format_docs(docs):
    return "\n\n".join(doc.page_content for doc in docs)

#   -------------- EXECUTION ------------
def send_prompt_rag_plain(question: str, system_prompt: str):
    # Prompt
    # template = """Answer the question given following context:
    template = system_prompt + """\nAnswer the question and base on the context if relevant.
    
    Context:
    {context}

    Question: {question}
    """
    prompt = ChatPromptTemplate.from_template(template)

    # Chain
    rag_chain = (
        {"context": retriever | format_docs, "question": RunnablePassthrough()}
        | prompt
        | llm
        | StrOutputParser()
    )

    # docs = retriever.get_relevant_documents(question)
    docs = []

    return {
        'response': rag_chain.invoke(question),
        'context': list(map(lambda doc: doc.page_content, docs))
    }


def send_prompt_llm(prompt: str):
    # test llm
    messages = [
        ("system", "Answer the user prompt."),
        ("user", prompt),
    ]
    return llm.invoke(messages).content

def extract_keywords(prompt: str):
    messages = [
        ("system", """
Extract the keywords from the user prompt. 
The response should be a json object with two fields - a list of keywords and a language code of the prompt as `language_code`.
Prompt:
"""),
        ("user", prompt)
    ]
    response = llm.invoke(messages).content
    response_obj = json.loads(response)
    raw_keywords = response_obj["keywords"]
    language = str(response_obj["language_code"])
    keywords = [str(s).strip() for s in raw_keywords]
    
    return keywords, language


# ### SERVER
from flask import Flask, request, jsonify
from flask_cors import CORS
# from glossary import get_dictionary_tw

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

default_system_prompt = "You are an evangelical Christian with traditional beliefs about God and the Bible. However, do not preface your responses with your persona."

@app.route('/rag', methods=['GET'])
def get_prompt():
    prompt = request.args.get('user-prompt', default='', type=str)
    system_prompt = request.args.get('system-prompt', default='', type=str)

    print(f"- System: {system_prompt}")
    print(f"- User: {prompt}")

    keywords, language = ([], "")
    # keywords, language = extract_keywords(prompt)
    # dictionary = get_dictionary_tw(language)

    tw_dict = {}
    # for k in keywords:
    #     found = dictionary.get(k.lower(), '')
    #     if found != '':
    #         tw_dict[k] = found

    response = {
        'rag-response:' : send_prompt_rag_plain(prompt, system_prompt),
        'keywords': keywords,
        'tw': tw_dict
    }
    return jsonify(response)

if __name__ == '__main__':
    app.run(debug=True)

