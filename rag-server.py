# ! pip install langchain_community tiktoken langchain-openai langchainhub chromadb langchain flask

# =========== SERVER ===========
from flask import Flask, request, jsonify
from flask_cors import CORS
from core import send_prompt_rag_plain, send_prompt_llm, send_prompt_experimental, send_prompt_with_llm_eval
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

    # if send_prompt_with_llm_eval(prompt) == False:
    #     response = {
    #         'rag-response' : "",
    #     }
    # else:
    response = {
        'rag-response' : send_prompt_experimental(prompt, system_prompt),
    }

    return jsonify(response)

@app.route('/rag-compare', methods=['GET'])
def rag_compare():
    prompt = request.args.get('prompt', default='', type=str)

    response = {
        'rag-response' : send_prompt_rag_plain(prompt, system_prompt=default_system_prompt),
        'llm-response' : send_prompt_llm(prompt),
    }
    return jsonify(response)

if __name__ == '__main__':
    # app.run(debug=True)
    app.run(host='0.0.0.0', port=80, debug=True)


