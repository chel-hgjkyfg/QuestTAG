import os
import time
import uuid
from typing import Literal

import httpx
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

AUTH_URL = "https://ngw.devices.sberbank.ru:9443/api/v2/oauth"
API_BASE = "https://gigachat.devices.sberbank.ru/api/v1"
SCOPE = os.getenv("GIGACHAT_SCOPE", "GIGACHAT_API_PERS")
MODEL = os.getenv("GIGACHAT_MODEL", "GigaChat")
AUTH_KEY = os.getenv("GIGACHAT_AUTH_KEY", "")
ALLOWED_ORIGINS = [x.strip() for x in os.getenv(
    "ALLOWED_ORIGINS",
    "https://chel-hgjkyfg.github.io"
).split(",") if x.strip()]

app = FastAPI(title="QuestTAG GigaChat API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS or ["https://chel-hgjkyfg.github.io"],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)

_token = None
_token_expires = 0

KNOWLEDGE = """
Ты — онлайн-консультант площадки развлечений «КвестТаг». Отвечай по-русски,
доброжелательно, спокойно и понятно для родителей, которые выбирают праздник
для детей. Не используй детскую игровую манеру и чрезмерные эмодзи.
Не выдумывай цены, наличие свободных дат, возрастные ограничения, длительность
или условия. Если данных нет — прямо скажи, что это подтвердит администратор.

ПРАЙС:
Квесты: «Гарри Поттер» — 4500 ₽ (включено до 10 человек);
«Gravity Falls» — 4000 ₽ (до 10 человек); «Нора Хоббита» — 4000 ₽
(до 10 человек); актёр на квест — 1800 ₽; каждый участник сверх 10 — 600 ₽.
Картинг за участника: 7 минут — 400 ₽; 14 минут — 700 ₽;
21 минута — 1050 ₽; 30 минут — 1400 ₽.
Лабиринт за участника, минимум 5 человек: лазертаг 60 минут — 1000 ₽;
Among Us 60 минут — 1000 ₽; прятки в темноте 60 минут — 700 ₽.
Комнаты: 5–11 человек — 1800 ₽/60 минут или 4700 ₽/180 минут;
12–20 человек — 2000 ₽/60 минут или 5500 ₽/180 минут;
комната PARTY (20+) — 2500 ₽/60 минут или 7000 ₽/180 минут.
Дополнительно: ведущий до 10 человек — 4500 ₽, от 11 человек — 6000 ₽;
разбитие пиньяты — 3000 ₽; SECRET BOX до 10 человек — 4000 ₽,
от 11 человек — 6000 ₽; оформление комнаты — 3500 ₽;
поздравление — 1800 ₽.
Пакет «Экстрим-Таг»: 5–9 человек — 2800 ₽/чел.; 10–15 человек —
2500 ₽/чел. Включает лазертаг 60 мин, прятки 60 мин, картинг 7 мин,
комнату 3 часа и поздравление именинника.
Пакет «Luxury»: 8–15 человек — 2500 ₽/чел. Включает лабиринт 60 мин,
ведущего 45 мин, дискотеку PARTY и комнату 3 часа.
Стоимость указана в рублях. Доступность, окончательные условия и бронирование
подтверждаются администратором.
"""

class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str = Field(min_length=1, max_length=4000)

class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=2000)
    history: list[ChatMessage] = Field(default_factory=list, max_length=12)

async def get_access_token() -> str:
    global _token, _token_expires
    if _token and time.time() < _token_expires - 60:
        return _token
    if not AUTH_KEY:
        raise HTTPException(status_code=503, detail="GigaChat не настроен на сервере.")
    try:
        async with httpx.AsyncClient(timeout=25) as client:
            response = await client.post(
                AUTH_URL,
                headers={
                    "Authorization": f"Basic {AUTH_KEY}",
                    "RqUID": str(uuid.uuid4()),
                    "Content-Type": "application/x-www-form-urlencoded",
                    "Accept": "application/json",
                },
                data={"scope": SCOPE},
            )
            response.raise_for_status()
            data = response.json()
            _token = data["access_token"]
            _expires = int(data.get("expires_at", (time.time() + 1800) * 1000))
            _token_expires = _expires / 1000 if _expires > 10**12 else _expires
            return _token
    except (httpx.HTTPError, KeyError, ValueError):
        raise HTTPException(status_code=502, detail="Не удалось авторизоваться в GigaChat.")

@app.get("/health")
async def health():
    return {"ok": True, "service": "QuestTAG GigaChat API", "configured": bool(AUTH_KEY)}

@app.post("/api/chat")
async def chat(payload: ChatRequest):
    global _token, _token_expires
    token = await get_access_token()
    messages = [{"role": "system", "content": KNOWLEDGE}]
    for item in payload.history[-10:]:
        messages.append({"role": item.role, "content": item.content[:4000]})
    messages.append({"role": "user", "content": payload.message})
    try:
        async with httpx.AsyncClient(timeout=60) as client:
            response = await client.post(
                f"{API_BASE}/chat/completions",
                headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
                json={
                    "model": MODEL,
                    "messages": messages,
                    "temperature": 0.35,
                    "max_tokens": 700,
                },
            )
            response.raise_for_status()
            data = response.json()
            answer = data["choices"][0]["message"]["content"]
            return {"reply": answer, "model": data.get("model", MODEL)}
    except httpx.HTTPStatusError as exc:
        status = exc.response.status_code
        if status == 401:
            _token = None
            _token_expires = 0
        raise HTTPException(status_code=502, detail=f"Ошибка ответа GigaChat (HTTP {status}).")
    except (httpx.HTTPError, KeyError, IndexError, TypeError):
        raise HTTPException(status_code=502, detail="Сервис GigaChat временно недоступен.")
