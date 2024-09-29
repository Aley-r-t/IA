import os # Para cargar el modelo
import whisper
from flask import Flask, render_template, request, jsonify


app = Flask(__name__)
model = whisper.load_model("base")  # Mantener esta línea es lo mejor

@app.route("/")
def index():
    return render_template("recorder.html")

@app.route("/transcribe", methods=["POST"])
def transcribe_audio():
    # Verifica si el archivo fue enviado en la solicitud
    if 'audio' not in request.files:
        return jsonify({"error": "No audio file uploaded"}), 400

    audio_file = request.files["audio"]
    
    if audio_file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    # Guardar el archivo temporalmente
    audio_path = os.path.join("uploads", audio_file.filename)
    audio_file.save(audio_path)

    # Cargar el audio y prepararlo
    audio = whisper.load_audio(audio_path)
    audio = whisper.pad_or_trim(audio)

    # Hacer la transcripción
    result = model.transcribe(audio)

    # Eliminar el archivo de audio temporal
    os.remove(audio_path)

    # Devolver la transcripción en formato JSON
    return jsonify({"text": result['text']})


if __name__ == "__main__":
    if not os.path.exists('uploads'):
        os.makedirs('uploads')  
    app.run(debug=True)

