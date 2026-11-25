FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    AUTO_INIT_DB=true

WORKDIR /app

# Cai dat ca-certificates de ket noi TLS toi TiDB Cloud / MySQL Cloud
RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Cai dat thu vien Python truoc de toi uu cache build
COPY CareerAI_Clean_HTML_FastAPI/backend/requirements.txt ./backend/requirements.txt
RUN pip install --no-cache-dir -r backend/requirements.txt

# Copy ma nguon ung dung (backend + frontend + database.sql)
COPY CareerAI_Clean_HTML_FastAPI/ ./

RUN mkdir -p backend/uploads

EXPOSE 8000

CMD ["sh", "-c", "uvicorn backend.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
