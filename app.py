"""
Flask backend for ICD Prediction Pipeline
Handles file uploads, predictions, and evaluation
"""

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from pathlib import Path
import json
import time
import traceback
import os
from werkzeug.utils import secure_filename
from icd import ICDPredictor, load_report

app = Flask(__name__, static_folder='frontend/dist', static_url_path='')
CORS(app)

# Configuration
UPLOAD_FOLDER = Path("uploads")
ALLOWED_EXTENSIONS = {'txt', 'pdf', 'md'}
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB

UPLOAD_FOLDER.mkdir(exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = MAX_FILE_SIZE

# Initialize predictor
predictor = None

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.before_request
def init_predictor():
    global predictor
    if predictor is None:
        try:
            predictor = ICDPredictor(backend="gemini")
        except Exception as e:
            print(f"Error initializing predictor: {e}")

@app.route('/api/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({"status": "ok", "message": "ICD Prediction API is running"})

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_frontend(path):
    """Serve frontend files, fallback to index.html for SPA routing"""
    if path and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/api/predict', methods=['POST'])
def predict():
    """
    Handle file upload and prediction
    Supports single or multiple files
    Combines all files into one report, then predicts once
    Returns: prediction results with codes and confidence scores
    """
    try:
        if 'files' not in request.files and 'file' not in request.files:
            return jsonify({"error": "No files provided"}), 400
        
        # Handle both 'files' (multiple) and 'file' (single) parameter names
        files = request.files.getlist('files') if 'files' in request.files else request.files.getlist('file')
        
        if not files or all(f.filename == '' for f in files):
            return jsonify({"error": "No files selected"}), 400
        
        # Filter out empty files
        files = [f for f in files if f.filename != '']
        
        if len(files) > 10:
            return jsonify({"error": "Maximum 10 files allowed"}), 400
        
        # Save all files and combine reports
        file_reports = []
        combined_report = ""
        
        for file in files:
            if not allowed_file(file.filename):
                return jsonify({"error": f"File type not allowed: {file.filename}"}), 400
            
            # Save uploaded file
            filename = secure_filename(file.filename)
            filepath = UPLOAD_FOLDER / filename
            file.save(filepath)
            
            # Load report
            report_text = load_report(str(filepath))
            file_reports.append({
                "filename": filename,
                "content": report_text
            })
            
            # Add to combined report with separator
            combined_report += f"\n\n{'='*60}\nDOCUMENT: {filename}\n{'='*60}\n{report_text}"
        
        # Run prediction ONCE on combined report
        print(f"\n[API] Processing {len(files)} file(s) as combined report...")
        result = predictor.predict(combined_report)
        
        # Format response
        response = {
            "success": True,
            "file_count": len(files),
            "files": [{"filename": f["filename"]} for f in file_reports],
            "combined_report_preview": combined_report[:500],
            "prediction": {
                "primary": result["primary"],
                "secondary": result["secondary"],
                "total_codes": 1 + len(result["secondary"]),
            },
            "meta": result.get("meta", {}),
            "summary": result.get("summary", ""),
        }
        
        # Save to results
        results_file = Path("results") / f"prediction_batch_{len(files)}_{int(time.time())}.json"
        results_file.parent.mkdir(exist_ok=True)
        results_file.write_text(json.dumps(response, indent=2, ensure_ascii=False), encoding="utf-8")
        
        return jsonify(response), 200
    
    except Exception as e:
        print(f"Error in predict: {traceback.format_exc()}")
        return jsonify({"error": str(e), "details": traceback.format_exc()}), 500

@app.route('/api/evaluate', methods=['POST'])
def evaluate():
    """
    Run evaluation on prediction results
    """
    try:
        data = request.get_json()
        if not data or 'prediction' not in data:
            return jsonify({"error": "No prediction data provided"}), 400
        
        prediction = data['prediction']
        report_text = data.get('report', '')
        
        # Run evaluation
        from icd import evaluate_prediction
        evaluation = evaluate_prediction(
            prediction,
            report_text,
            llm_evaluator=predictor.llm_evaluator,
            codebase=predictor.codebase,
        )
        
        return jsonify({
            "success": True,
            "evaluation": evaluation
        }), 200
    
    except Exception as e:
        print(f"Error in evaluate: {traceback.format_exc()}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/demo', methods=['GET'])
def demo():
    """
    Run prediction on demo report
    """
    try:
        demo_report_path = Path("utils/report.txt")
        if not demo_report_path.exists():
            return jsonify({"error": "Demo report not found"}), 404
        
        report_text = demo_report_path.read_text(encoding="utf-8")
        result = predictor.predict(report_text)
        
        response = {
            "success": True,
            "filename": "demo_report.txt",
            "report_preview": report_text[:500],
            "prediction": {
                "primary": result["primary"],
                "secondary": result["secondary"],
                "total_codes": 1 + len(result["secondary"]),
            },
            "meta": result.get("meta", {}),
            "summary": result.get("summary", ""),
        }
        
        return jsonify(response), 200
    
    except Exception as e:
        print(f"Error in demo: {traceback.format_exc()}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    import os
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_ENV') == 'development'
    app.run(debug=debug, host='0.0.0.0', port=port)
