from fastapi import FastAPI, UploadFile, File
from fastapi.responses import HTMLResponse
from faster_whisper import WhisperModel

import os
import tempfile


app = FastAPI()


# ============================================================
# Whisper
# ============================================================

print("Loading Whisper model...")

model = WhisperModel(
    "base",
    device="cpu",
    compute_type="int8"
)

print("Whisper model loaded.")


# ============================================================
# 首页
# ============================================================

@app.get("/", response_class=HTMLResponse)
async def index():

    with open("index.html", "r", encoding="utf-8") as f:
        return f.read()


# ============================================================
# 语音识别
# ============================================================

@app.post("/transcribe")
async def transcribe(file: UploadFile = File(...)):

    temp_path = None

    try:

        # ----------------------------------------------------
        # 保存临时音频文件
        # ----------------------------------------------------

        suffix = os.path.splitext(file.filename or "")[1]

        if not suffix:
            suffix = ".webm"

        with tempfile.NamedTemporaryFile(
            delete=False,
            suffix=suffix
        ) as temp:

            temp_path = temp.name

            content = await file.read()

            temp.write(content)

        print()
        print("=" * 60)
        print("Transcribing...")
        print("File:", temp_path)
        print("Size:", len(content), "bytes")
        print("=" * 60)


        # ----------------------------------------------------
        # Whisper 转文字
        # ----------------------------------------------------

        segments, info = model.transcribe(
            temp_path,

            # 中文
            language="zh",

            # beam search
            beam_size=5,

            # 不使用 VAD，避免短语音被过滤
            vad_filter=False,

            # 根据前面的文本继续推断
            condition_on_previous_text=True,
        )


        # ----------------------------------------------------
        # 读取所有 segment
        # ----------------------------------------------------

        segments = list(segments)


        print()
        print("Language:", info.language)
        print(
            "Language probability:",
            info.language_probability
        )

        print()
        print("Segments:")

        for segment in segments:

            print(
                f"[{segment.start:.2f}s -> "
                f"{segment.end:.2f}s] "
                f"{segment.text}"
            )


        # ----------------------------------------------------
        # 合并文本
        # ----------------------------------------------------

        text = "".join(
            segment.text
            for segment in segments
        ).strip()


        print()
        print("Result:")
        print(text)

        print("=" * 60)


        return {
            "success": True,
            "text": text,
            "language": info.language,
            "language_probability": info.language_probability,
        }


    except Exception as e:

        print()
        print("=" * 60)
        print("Transcription error:")
        print(str(e))
        print("=" * 60)

        return {
            "success": False,
            "error": str(e),
        }


    finally:

        # ----------------------------------------------------
        # 删除临时文件
        # ----------------------------------------------------

        if temp_path and os.path.exists(temp_path):

            try:
                os.unlink(temp_path)

                print(
                    "Temporary file deleted:",
                    temp_path
                )

            except Exception as e:

                print(
                    "Failed to delete temporary file:",
                    str(e)
                )