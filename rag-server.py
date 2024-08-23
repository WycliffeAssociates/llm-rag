# ! pip install langchain_community tiktoken langchain-openai langchainhub chromadb langchain flask
import os
import json

config = {}
if os.path.exists('config.json'):
    with open('config.json', 'r') as conf:
        config = json.load(conf)
else:
    config['OPENAI_API_KEY'] = os.getenv('OPENAI_API_KEY')
    config['DATA_SOURCE_DIR'] = os.getenv('DATA_SOURCE_DIR')
    config['DB_PATH'] = os.getenv('DB_PATH')

# Const values
OPENAI_KEY = config['OPENAI_API_KEY']
DB_PATH = config["DB_PATH"]
DATA_SOURCE_DIR = config["DATA_SOURCE_DIR"]

#### INDEXING ####
from langchain_community.document_loaders import TextLoader
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import Chroma
from database import create_db

embedding = OpenAIEmbeddings(api_key=OPENAI_KEY)
if os.path.exists(DB_PATH):
    print(f"Database found at {DB_PATH}")
    vectorstore = Chroma(persist_directory=DB_PATH, embedding_function=embedding)
else:
    print(f"Constructing database at {DB_PATH}")
    vectorstore = create_db(DB_PATH, DATA_SOURCE_DIR, embedding)

retriever = vectorstore.as_retriever(search_type="mmr", search_kwargs={'k': 3, 'lambda_mult': 0.25})

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

    docs = retriever.get_relevant_documents(question)

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

# =========== EXPERIMENTAL =========
random_docs = [
    "Video game monetization is a type of process that a video game publisher can use to generate revenue from a video game product. The methods of monetization may vary between games, especially when they come from different genres or platforms, but they all serve the same purpose to return money to the game developers, copyright owners, and other stakeholders. As the monetization methods continue to diversify, they also affect the game design in a way that sometimes leads to criticism.",
    "Capitalism is an economic system based on the private ownership of the means of production and their operation for profit.[1][2][3][4][5] Central characteristics of capitalism include capital accumulation, competitive markets, price systems, private property, recognition of property rights, self-interest, economic freedom, meritocracy, work ethic, consumer sovereignty, profit motive, entrepreneurship, commodification, voluntary exchange, wage labor, production of commodities and services, and focus on economic growth.[6][7][8][9][10][11] In a market economy, decision-making and investments are determined by owners of wealth, property, or ability to maneuver capital or production ability in capital and financial markets—whereas prices and the distribution of goods and services are mainly determined by competition in goods and services markets.[12]",
]

def prepend_docs(docs: list):
    docs_as_strings = random_docs + list(doc.page_content for doc in docs)
    return "\n\n".join(docs_as_strings)

def send_prompt_experimental(question: str, system_prompt: str):
    template = system_prompt + """\nAnswer the question and base on the context if relevant.
    
    Context:
    {context}

    Question: {question}
    """
    prompt = ChatPromptTemplate.from_template(template)
    
    # Chain
    rag_chain = (
        {"context": retriever | prepend_docs, "question": RunnablePassthrough()}
        | prompt
        | llm
        | StrOutputParser()
    )

    context_docs = retriever.get_relevant_documents(question)

    return {
        'response': rag_chain.invoke(question),
        'context': prepend_docs(context_docs)
    }

# =========== SERVER ===========
from flask import Flask, request, jsonify
from flask_cors import CORS
# from glossary import get_dictionary_tw

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

default_system_prompt = "You are an evangelical Christian with traditional beliefs about God and the Bible. However, do not preface your responses with your persona."

@app.route('/rag-system-prompt', methods=['GET'])
def get_prompt():
    prompt = request.args.get('user-prompt', default='', type=str)
    system_prompt = request.args.get('system-prompt', default='', type=str)

    print(f"- System: {system_prompt}")
    print(f"- User: {prompt}")

    response = {
        'rag-response' : send_prompt_experimental(prompt, system_prompt),
    }
    return jsonify(response)

@app.route('/rag-compare', methods=['GET'])
def rag_compare():
    prompt = request.args.get('prompt', default='', type=str)

    response = {
        'rag-response' : send_prompt_rag_plain(prompt, system_prompt=""),
        'llm-response' : send_prompt_llm(prompt),
    }
    return jsonify(response)

if __name__ == '__main__':
    # app.run(debug=True)
    app.run(host='0.0.0.0', port=80, debug=True)


