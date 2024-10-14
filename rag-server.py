# ! pip install langchain_community tiktoken langchain-openai langchainhub chromadb langchain flask

# =========== SERVER ===========
import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from core import LOG_DIR, send_prompt_rag_plain, send_prompt_llm, send_prompt_experimental, get_follow_up_questions, transcribe, summarize, send_rag_chat
# from glossary import get_dictionary_tw

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

default_system_prompt = "You are an evangelical Christian with traditional beliefs about God and the Bible. However, do not preface your responses with your persona."

@app.route('/rag-system-prompt', methods=['GET'])
def get_prompt():
    prompt = request.args.get('user-prompt', default='', type=str)
    # system_prompt = request.args.get('system-prompt', default='', type=str)

    response = {
        'rag-response' : send_prompt_experimental(prompt, default_system_prompt),
    }

    return jsonify(response)

@app.route('/rag-compare', methods=['GET'])
def rag_compare():
    prompt = request.args.get('prompt', default='', type=str)

    response = {
        'rag-response' : send_prompt_experimental(prompt, system_prompt=default_system_prompt),
        'llm-response' : send_prompt_llm(prompt),
    }
    return jsonify(response)

@app.route('/rag', methods=['GET'])
def rag():
    prompt = request.args.get('prompt', default='', type=str)

    response = {
        'rag-response' : send_prompt_experimental(prompt, system_prompt=default_system_prompt)
    }
    return jsonify(response)

@app.route('/llm', methods=['GET'])
def llm_endpoint():
    prompt = request.args.get('prompt', default='', type=str)

    response = {
        'llm-response' : send_prompt_llm(prompt)
    }
    return jsonify(response)

@app.route('/follow-up-questions', methods=['POST'])
def follow_up_questions():
    request_json = request.json
    question = request_json["question"]
    answer = request_json["answer"]

    response = get_follow_up_questions(question, answer)
    return response

@app.route('/message', methods=['POST'])
def message():
    request_json = request.json
    user_query = request_json['userQuery']
    lastResponse = request_json['lastResponse']
    chat_summary = list(request_json['chat'])

    # if lastResponse != '':
    #     summary = summarize(lastResponse)
    #     chat_summary.append(summary)

    new_response = send_rag_chat(user_query, lastResponse)
    # chat_summary.append(user_query)

    log_message(user=user_query, system=new_response)
    
    return jsonify({
        'chat-summary': [],
        'rag-response': new_response
    })

@app.route('/upload-audio-command', methods=['POST'])
def upload_audio():
    if 'audio' not in request.files:
        return jsonify({"error": "No audio file provided"}), 400
    
    audio_file = request.files['audio']
    
    if audio_file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    # Save the file to the uploads folder
    file_path = os.path.join(r"/tmp", audio_file.filename)
    audio_file.save(file_path)
    
    prompt = transcribe(file_path)

    print(prompt)

    return jsonify({"prompt": prompt }), 200

import threading
import datetime;

file_lock = threading.Lock()

def log_message(user: str, system: str):
    with file_lock:
        try:
            # Check if the file exists, and read the current logs
            log_file = os.path.join(LOG_DIR, "chat-log.txt")
            if not os.path.exists(log_file):
                with open(log_file, 'w') as _:
                    pass

            with open(log_file, 'a') as file:
                message = f'Timestamp:{datetime.datetime.now()}\n<User>: {user}\n<System>: {system}\n\n==================================\n\n'
                file.write(message)

        except Exception as e:
            print(f"Error logging message: {e}")

if __name__ == '__main__':
    # app.run(debug=True)
    app.run(host='0.0.0.0', port=80, debug=True)


