# ! pip install langchain_community tiktoken langchain-openai langchainhub chromadb langchain flask
import os
os.environ['LANGCHAIN_TRACING_V2'] = 'true'
os.environ['LANGCHAIN_ENDPOINT'] = 'https://api.smith.langchain.com'
os.environ['LANGCHAIN_API_KEY'] = ''
os.environ['OPENAI_API_KEY'] = ''

# ### Vector Store DB & Retriever
db_path = "/path/to/chroma_db_main"

#### INDEXING ####
import bs4
from langchain_community.document_loaders import TextLoader

# docs = []
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
# loader = TextLoader("D:/misc/rag/data/en_ulb.txt", encoding="UTF-8")
# docs = docs + loader.load()
# loader = TextLoader("D:/misc/rag/data/en_tn.md", encoding="UTF-8")
# docs = docs + loader.load()

# # Split
# from langchain.text_splitter import RecursiveCharacterTextSplitter
# text_splitter = RecursiveCharacterTextSplitter.from_tiktoken_encoder(
#     chunk_size=300, 
#     chunk_overlap=50)

# # Make splits
# splits = text_splitter.split_documents(docs)

# Index
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import Chroma

vectorstore = Chroma(persist_directory=db_path, embedding_function=OpenAIEmbeddings())

retriever = vectorstore.as_retriever()

# %%
# ### FUSION

from langchain.prompts import ChatPromptTemplate

# RAG-Fusion: Related
template = """You are a helpful assistant that generates multiple search queries based on a single input query. \n
Generate multiple search queries related to: {question} \n
Output (4 queries):"""
prompt_rag_fusion = ChatPromptTemplate.from_template(template)

from langchain_core.output_parsers import StrOutputParser
from langchain_openai import ChatOpenAI

generate_queries = (
    prompt_rag_fusion 
    | ChatOpenAI(temperature=0)
    | StrOutputParser() 
    | (lambda x: x.split("\n"))
)

# #### Reciprocal Ranking

from langchain.load import dumps, loads

def get_unique_union(documents: list[list]):
    """ Unique union of retrieved docs """
    # Flatten list of lists, and convert each Document to string
    flattened_docs = [dumps(doc) for sublist in documents for doc in sublist]
    # Get unique documents
    unique_docs = list(set(flattened_docs))
    # Return
    return [loads(doc) for doc in unique_docs]

def reciprocal_rank_fusion(results: list[list], k=60):
    """ Reciprocal_rank_fusion that takes multiple lists of ranked documents 
        and an optional parameter k used in the RRF formula """
    
    # Initialize a dictionary to hold fused scores for each unique document
    fused_scores = {}

    # Iterate through each list of ranked documents
    for docs in results:
        # Iterate through each document in the list, with its rank (position in the list)
        for rank, doc in enumerate(docs):
            # Convert the document to a string format to use as a key (assumes documents can be serialized to JSON)
            doc_str = dumps(doc)
            # If the document is not yet in the fused_scores dictionary, add it with an initial score of 0
            if doc_str not in fused_scores:
                fused_scores[doc_str] = 0
            # Retrieve the current score of the document, if any
            previous_score = fused_scores[doc_str]
            # Update the score of the document using the RRF formula: 1 / (rank + k)
            fused_scores[doc_str] += 1 / (rank + k)

    # Sort the documents based on their fused scores in descending order to get the final reranked results
    reranked_results = [
        (loads(doc), score)
        for doc, score in sorted(fused_scores.items(), key=lambda x: x[1], reverse=True)
    ]

    # Return the reranked results as a list of tuples, each containing the document and its fused score
    return reranked_results


# retrieval_chain = generate_queries | retriever.map() | get_unique_union


from langchain_core.runnables import RunnablePassthrough

llm = ChatOpenAI(temperature=0)

#   -------------- EXECUTION ------------
def send_prompt_rag(prompt: str):
    question = prompt
    # question = "What is the day of pentecost?"

    retrieval_chain_rag_fusion = generate_queries | retriever.map() | reciprocal_rank_fusion
    docs = retrieval_chain_rag_fusion.invoke({"question": question})

    template = """Answer the following question based on this context:

    {context}

    Question: {question}
    """

    formatted_prompt = ChatPromptTemplate.from_template(template)

    final_rag_chain = (
        {"context": retrieval_chain_rag_fusion, 
        "question": RunnablePassthrough()} 
        | formatted_prompt
        | llm
        | StrOutputParser()
    )

    return {
        'response': final_rag_chain.invoke({"question":question}),
        'context': list(map(lambda doc: doc[0].page_content, docs))
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

app = Flask(__name__)

@app.route('/rag', methods=['GET'])
def get_prompt():
    prompt = request.args.get('prompt', default='', type=str)

    response = {
        'rag-response:' : send_prompt_rag(prompt),
        'llm-response': send_prompt_llm(prompt)
    }
    return jsonify(response)

if __name__ == '__main__':
    app.run(debug=True)

