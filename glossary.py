import os
import re

def create_glossary(directory):
    """
    Returns a map of keyword (tw) and its definition, like a dictionary. 
    The keyword is the (level 1) heading of the document and the definition is parsed from the document content.
    """
    tw_map = {}

    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith('.md'):
                file_path = os.path.join(root, file)
                with open(file_path, encoding="UTF-8", mode='r') as f:
                    text = f.read()
                level_1_headings = re.findall(r'^#\s+(.*)', text)
                words = str(level_1_headings[0]).lower()
                for w in words.split(','):
                    tw_map[w.strip()] = text

    return tw_map

en_dictionary = create_glossary(r"/path/to/en/tw/dir")
es_dictionary = create_glossary(r"/path/to/es/tw/dir")
vi_dictionary = create_glossary(r"/path/to/en/vi/dir")

def get_dictionary_tw(language: str):
    if language == "en":
        dictionary = en_dictionary
    elif language == "es":
        dictionary = es_dictionary
    elif language == "vi":
        dictionary = vi_dictionary
    else:
        dictionary = {}

    return dictionary