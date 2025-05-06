from fastapi import FastAPI, UploadFile, File, Response
from PIL import Image, ImageOps
import io

app = FastAPI()

@app.post("/procesar-imagen")
async def procesar_imagen(imagen: UploadFile = File(...)):
    img = Image.open(io.BytesIO(await imagen.read()))
    img = img.convert("L")
    threshold = 128
    img_binarized = img.point(lambda x: 255 if x > threshold else 0, mode='1')
    buf = io.BytesIO()
    img_binarized.save(buf, format='PNG')
    return Response(content=buf.getvalue(), media_type="image/png")

@app.post("/limpiar")
async def limpiar(imagen: UploadFile = File(...)):
    img = Image.open(io.BytesIO(await imagen.read()))
    img = img.convert("L")
    img_cleaned = ImageOps.invert(img)
    buf = io.BytesIO()
    img_cleaned.save(buf, format='PNG')
    return Response(content=buf.getvalue(), media_type="image/png")