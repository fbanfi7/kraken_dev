import os
import io
import uuid  # Para generar nombres de archivo únicos
import shutil  # Para mover archivos de forma segura

from fastapi import FastAPI, UploadFile, File, HTTPException, status, Form
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from deepgram import (
    DeepgramClient,
    PrerecordedOptions,
    FileSource,
)
from openai import OpenAI
import logging

# Configuración del logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Cargar variables de entorno
load_dotenv()

# Inicializar clientes de Deepgram y OpenAI
DEEPGRAM_API_KEY = os.getenv("DEEPGRAM_API_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
UPLOAD_FOLDER = os.getenv(
    "UPLOAD_FOLDER", "/tmp/uploaded_audio"
)  # Valor por defecto seguro
NOTES_FOLDER = os.getenv(
    "NOTES_FOLDER", "/tmp/generated_notes"
)  # Valor por defecto seguro

if not DEEPGRAM_API_KEY:
    logger.error("DEEPGRAM_API_KEY no configurada en el .env")
    raise ValueError("DEEPGRAM_API_KEY no configurada")
if not OPENAI_API_KEY:
    logger.error("OPENAI_API_KEY no configurada en el .env")
    raise ValueError("OPENAI_API_KEY no configurada")

deepgram_client = DeepgramClient(DEEPGRAM_API_KEY)
openai_client = OpenAI(api_key=OPENAI_API_KEY)

app = FastAPI(
    title="Escriba Médico Asistido por IA",
    description="API para transcribir y resumir consultas médicas.",
    version="1.0.0",
)

# Removed fixed SOAP_INSTRUCTION constant - now using dynamic prompt_instruction


@app.on_event("startup")
async def startup_event():
    """Crea las carpetas necesarias al iniciar la aplicación."""
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    os.makedirs(NOTES_FOLDER, exist_ok=True)
    logger.info(
        f"Carpetas de subida '{UPLOAD_FOLDER}' y notas '{NOTES_FOLDER}' verificadas/creadas."
    )


@app.get("/")
async def read_root():
    """Endpoint de prueba para verificar que la API está funcionando."""
    return {"message": "Bienvenido al Escriba Médico Asistido por IA!"}


@app.post("/transcribe-and-summarize/")
async def transcribe_and_summarize_audio(
    audio_file: UploadFile = File(...), prompt_instruction: str = Form(...)
):
    """
    Recibe un archivo de audio, lo transcribe usando Deepgram y genera
    un resumen SOAP usando OpenAI con instrucciones personalizadas.
    """
    # Validar el tipo de archivo
    allowed_content_types = [
        "audio/wav",
        "audio/mpeg",
        "audio/mp4",
        "audio/x-m4a",
        "audio/webm",
        "audio/webm;codecs=opus",
    ]
    if audio_file.content_type not in allowed_content_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Tipo de archivo no permitido. Tipos permitidos: {', '.join(allowed_content_types)}",
        )

    # Generar un nombre de archivo único y guardar temporalmente
    file_extension = (
        audio_file.filename.split(".")[-1] if "." in audio_file.filename else "wav"
    )
    unique_filename = f"{uuid.uuid4()}.{file_extension}"
    audio_path = os.path.join(UPLOAD_FOLDER, unique_filename)

    try:
        # Validar que se proporcione la instrucción del prompt
        if not prompt_instruction:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El campo 'prompt_instruction' es obligatorio.",
            )

        # Guardar el archivo subido en el sistema de archivos del contenedor
        with open(audio_path, "wb") as buffer:
            shutil.copyfileobj(audio_file.file, buffer)
        logger.info(f"Archivo de audio guardado en: {audio_path}")

        # Transcribir el audio usando Deepgram
        logger.info("Iniciando transcripción con Deepgram...")
        with open(audio_path, "rb") as file_buffer:
            payload: FileSource = {
                "buffer": file_buffer.read(),
            }
            options = PrerecordedOptions(
                model="nova-2",
                smart_format=True,
                diarize=True,
                language="es-419",
                punctuate=True,
                paragraphs=True,
                utterances=True,
            )
            response_deepgram = deepgram_client.listen.rest.v("1").transcribe_file(
                payload, options
            )
            transcript = response_deepgram["results"]["channels"][0]["alternatives"][0][
                "paragraphs"
            ]["transcript"]
        logger.info("Transcripción completada.")

        # Generar la nota SOAP usando OpenAI
        logger.info("Generando nota SOAP con OpenAI...")
        messages = [
            {"role": "system", "content": prompt_instruction},
            {"role": "user", "content": transcript},
        ]
        response_openai = openai_client.chat.completions.create(
            model="gpt-4.1",
            temperature=0.2,
            top_p=0.95,
            frequency_penalty=0.3,
            presence_penalty=0.2,
            max_tokens=600,
            messages=messages,
        )
        soap_note = response_openai.choices[0].message.content
        logger.info("Nota SOAP generada.")

        # Generar un nombre de archivo único para la nota SOAP y guardarla
        note_filename = f"nota_SOAP_{uuid.uuid4()}.md"  # Usamos .md para Markdown
        note_path = os.path.join(NOTES_FOLDER, note_filename)
        with open(note_path, "w", encoding="utf-8") as f:
            f.write(soap_note)
        logger.info(f"Nota SOAP guardada en: {note_path}")

        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={
                "message": "Transcripción y resumen completados con éxito.",
                "transcript": transcript,
                "soap_note": soap_note,
                "note_filename": note_filename,  # Devuelve el nombre del archivo de la nota
            },
        )

    except HTTPException as e:
        logger.error(f"Error HTTP: {e.detail}")
        raise e
    except Exception as e:
        logger.error(
            f"Error en el procesamiento del audio/generación de nota: {e}",
            exc_info=True,
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ocurrió un error inesperado al procesar la solicitud: {e}",
        )
    finally:
        # Limpiar el archivo de audio subido después de procesarlo
        if os.path.exists(audio_path):
            os.remove(audio_path)
            logger.info(f"Archivo de audio temporal '{audio_path}' eliminado.")
