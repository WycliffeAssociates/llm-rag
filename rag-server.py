# ! pip install langchain_community tiktoken langchain-openai langchainhub chromadb langchain flask
import os
os.environ['LANGCHAIN_TRACING_V2'] = 'true'
os.environ['LANGCHAIN_ENDPOINT'] = 'https://api.smith.langchain.com'
os.environ['LANGCHAIN_API_KEY'] = ''
os.environ['OPENAI_API_KEY'] = ''

# ### Vector Store DB & Retriever
db_path = "D:/misc/rag/rag-db"

#### INDEXING ####
import bs4
from langchain_community.document_loaders import TextLoader

docs = []
# loader = TextLoader("D:/misc/rag/data/es_ulb.txt", encoding="UTF-8")
# docs = docs + loader.load()
# loader = TextLoader("D:/misc/rag/data/es_tn.md", encoding="UTF-8")
# docs = docs + loader.load()
# loader = TextLoader("D:/misc/rag/data/es_tq.md", encoding="UTF-8")
# docs = docs + loader.load()
# loader = TextLoader("D:/misc/rag/data/vi_ulb.txt", encoding="UTF-8")
# docs = docs + loader.load()
# loader = TextLoader("D:/misc/rag/data/vi_tn.md", encoding="UTF-8")
# docs = docs + loader.load()
# loader = TextLoader("D:/misc/rag/data/vi_tq.md", encoding="UTF-8")
# docs = docs + loader.load()
loader = TextLoader("D:/misc/rag/data/en_ulb.txt", encoding="UTF-8")
docs = docs + loader.load()
# loader = TextLoader("D:/misc/rag/data/en_tn.md", encoding="UTF-8")
# docs = docs + loader.load()

# # Split
from langchain.text_splitter import RecursiveCharacterTextSplitter, MarkdownHeaderTextSplitter
text_splitter = RecursiveCharacterTextSplitter.from_tiktoken_encoder(
    chunk_size=300, 
    chunk_overlap=50)
# Make splits
splits = text_splitter.split_documents(docs)

md_docs = []
headers_to_split = [("#", "Word Name"), ("##", "Content")]
md_splitter = MarkdownHeaderTextSplitter(headers_to_split_on=headers_to_split, strip_headers=False)

# LOAD .md FILES FROM DIR
input_dir = r"D:\misc\rag\data\en_tw"
files = os.listdir(input_dir)
for file_name in files:
    file_path = os.path.join(input_dir, file_name)
    if os.path.isfile(file_path):  # Check if it's a file (not a directory)
        with open(file_path, encoding="UTF-8", mode='r') as f:
            md = f.read()
            splits = splits + md_splitter.split_text(md)


# Index
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import Chroma

# vectorstore = Chroma.from_documents(documents=splits, persist_directory=db_path, embedding=OpenAIEmbeddings())
vectorstore = Chroma(persist_directory=db_path, embedding_function=OpenAIEmbeddings())


retriever = vectorstore.as_retriever(search_type="mmr", search_kwargs={'k': 6, 'lambda_mult': 0.25})

from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough

llm = ChatOpenAI(temperature=0)

# Post-processing
def format_docs(docs):
    return "\n\n".join(doc.page_content for doc in docs)

#   -------------- EXECUTION ------------
def send_prompt_rag_plain(question: str):
    # Prompt
    template = """Answer the question with following context:
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


# ### SERVER
from flask import Flask, request, jsonify
from flask_cors import CORS


app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route('/rag', methods=['GET'])
def get_prompt():
    prompt = request.args.get('prompt', default='', type=str)

    response = {
        'rag-response:' : send_prompt_rag_plain(prompt),
        'llm-response': send_prompt_llm(prompt)
    }
    return jsonify(response)

if __name__ == '__main__':
    app.run(debug=True)

