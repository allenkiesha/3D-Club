from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/generate_model', methods=['POST'])
def generate_model():
    data = request.json
    model_input = data.get('input', '').lower()
    
    # Simple logic to determine shape based on input
    if 'sphere' in model_input or 'ball' in model_input or 'round' in model_input:
        shape = 'sphere'
    elif 'cube' in model_input or 'box' in model_input or 'square' in model_input:
        shape = 'cube'
    elif 'cone' in model_input or 'pyramid' in model_input:
        shape = 'cone'
    elif 'cylinder' in model_input or 'tube' in model_input:
        shape = 'cylinder'
    else:
        shape = 'cube'  # Default to cube if no match

    return jsonify({'shape': shape})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
