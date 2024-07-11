import os
from langchain_community.document_loaders import TextLoader
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import Chroma
from langchain.text_splitter import RecursiveCharacterTextSplitter, MarkdownHeaderTextSplitter

def create_db(db_path: str, data_dir: str, embedding: OpenAIEmbeddings):
    txt_files, md_files = separate_files_recursively(data_dir)
    docs = []

    # LOAD .txt FILES
    for f in txt_files:    
        loader = TextLoader(f, encoding="UTF-8")
        docs = docs + loader.load()

    text_splitter = RecursiveCharacterTextSplitter.from_tiktoken_encoder(
        chunk_size=300, 
        chunk_overlap=50)
    # Make splits
    splits = text_splitter.split_documents(docs)

    # LOAD .md FILES
    headers_to_split = [("#", "Word Name"), ("##", "Content")]
    md_splitter = MarkdownHeaderTextSplitter(headers_to_split_on=headers_to_split, strip_headers=False)

    for f in md_files:
        with open(f, encoding="UTF-8", mode='r') as f:
            md = f.read()
            splits = splits + md_splitter.split_text(md)

    vectorstore = Chroma.from_documents(documents=splits, persist_directory=db_path, embedding=embedding)
    return vectorstore


def separate_files_recursively(directory):
    """
    Separates .txt and .md files into two lists from the given directory and its subdirectories.
    
    :param directory: The path to the directory containing the files.
    :return: A tuple containing two lists - one for .txt files and one for .md files.
    """
    txt_files = []
    md_files = []
    
    # Iterate over all files and directories in the given directory recursively
    for root, dirs, files in os.walk(directory):
        for filename in files:
            # Construct full file path
            filepath = os.path.join(root, filename)
            
            # Check the file extension and categorize the file
            if filename.endswith('.txt'):
                txt_files.append(filepath)
            elif filename.endswith('.md'):
                md_files.append(filepath)
    
    return txt_files, md_files
