import os
from langchain_community.document_loaders import TextLoader
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import Chroma
from langchain.text_splitter import RecursiveCharacterTextSplitter, MarkdownHeaderTextSplitter

def create_db(db_path):
    docs = []
    loader = TextLoader("D:/misc/rag/data/en_ulb_verses.txt", encoding="UTF-8")
    docs = docs + loader.load()

    # # Split
    text_splitter = RecursiveCharacterTextSplitter.from_tiktoken_encoder(
        chunk_size=300, 
        chunk_overlap=50)
    # Make splits
    splits = text_splitter.split_documents(docs)

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


    vectorstore = Chroma.from_documents(documents=splits, persist_directory=db_path, embedding=OpenAIEmbeddings())
    return vectorstore
