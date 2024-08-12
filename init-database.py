import os
from langchain_openai import OpenAIEmbeddings
from database import create_db

OPENAI_KEY = os.getenv('OPENAI_API_KEY')
DATA_SOURCE_DIR = os.getenv('DATA_SOURCE_DIR')
DB_PATH = os.getenv('DB_PATH')

embedding = OpenAIEmbeddings(api_key=OPENAI_KEY)

if not os.path.exists(DB_PATH):
    create_db(DB_PATH, DATA_SOURCE_DIR, embedding)