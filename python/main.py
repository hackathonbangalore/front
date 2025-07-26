import json
import vertexai
from vertexai import agent_engines
from flask import Flask, request, jsonify
from google.auth.transport.requests import Request
from google.auth import compute_engine
import uuid
import google.auth

app = Flask(__name__)

# Setup authentication
credentials, project = google.auth.default(scopes=["https://www.googleapis.com/auth/cloud-platform"])


PROJECT = "clear-veld-467107-f0"
REGION = "us-central1"
ENGINE = "projects/756738696245/locations/us-central1/reasoningEngines/2680301485262110720"

vertexai.init(project=PROJECT, location=REGION)
agent = agent_engines.get(ENGINE)

def send_request(url, method, data=None):
    """Helper function to send HTTP request to Vertex AI API"""
    headers = {
        "Authorization": f"Bearer {credentials.token}",
        "Content-Type": "application/json",
    }

    if method == 'POST':
        response = requests.post(url, headers=headers, json=data)
    else:
        response = requests.get(url, headers=headers)

    return response


@app.route('/agent_query', methods=['POST'])
def agent_query():
    try:
        # return agent.operation_schemas()
        # Generate session ID (you can use UUID for session ID)
        session_id = str(uuid.uuid4())

        # Step 1: Create session
        session_url = f'https://us-central1-aiplatform.googleapis.com/v1/projects/{PROJECT}/locations/{REGION}/reasoningEngines/{ENGINE}/sessions'
        session_data = {
            "session": {"sessionId": session_id}
        }
        session_response = send_request(session_url, 'POST', session_data)

        return jsonify({"response": session_response})
    
        if session_response.status_code != 200:
            return jsonify({"error": "Failed to create session"}), 500
        
        request_json = request.get_json(silent=True)
        user_id = request_json.get("user_id", "test_user")
        message = request_json.get("message", "List datasets in bigquery-public-data")

        # response = agent.query(user_id=user_id, message=message)

        # The agent SDK provides a `stream_query` method, which returns a generator.
        response_stream = agent.stream_query(user_id=user_id, message=message)

        # Consume the generator to build the full response text from all chunks.
        full_response_text = "".join(
            [chunk.text for chunk in response_stream if hasattr(chunk, 'text') and chunk.text]
        )

        return jsonify({"response": full_response_text})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
