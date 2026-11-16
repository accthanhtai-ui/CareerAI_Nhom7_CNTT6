
import time
from fastapi import HTTPException
from google import genai
from ..config import GEMINI_API_KEY, GEMINI_MODEL

def ask_gemini(prompt):
    if not GEMINI_API_KEY:
        raise HTTPException(
            status_code=503,
            detail="Chưa cấu hình GEMINI_API_KEY trong backend/.env."
        )

    try:
        client = genai.Client(api_key=GEMINI_API_KEY)

        for lan_thu in range(3):
            try:
                response = client.models.generate_content(
                    model=GEMINI_MODEL,
                    contents=prompt
                )

                return response.text or "AI chưa tạo được câu trả lời."

            except Exception as error:
                ma_loi = getattr(error, "code", None)
                noi_dung_loi = str(error).lower()

                co_the_thu_lai = (
                    ma_loi in [429, 500, 502, 503, 504]
                    or any(x in noi_dung_loi for x in [
                        "429", "500", "502", "503", "504",
                        "unavailable", "resource_exhausted"
                    ])
                )

                if co_the_thu_lai and lan_thu < 2:
                    time.sleep(2 * (lan_thu + 1))
                    continue

                print("Gemini API Error:", str(error))

                raise HTTPException(
                    status_code=502,
                    detail="Dịch vụ AI đang bận hoặc gặp sự cố. Vui lòng thử lại sau."
                )

    except HTTPException:
        raise

    except Exception as error:
        print("Gemini Client Error:", str(error))
        raise HTTPException(
            status_code=502,
            detail="Không thể kết nối dịch vụ AI."
        )
