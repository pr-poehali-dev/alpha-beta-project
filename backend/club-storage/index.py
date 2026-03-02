"""
Хранилище данных клуба Five Cutlass.
GET / — получить все ключи или конкретный ключ (?key=...)
POST / — сохранить данные {key: string, value: any}
"""

import os
import json
import psycopg2

CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
}

SCHEMA = "t_p46695051_alpha_beta_project"


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    method = event.get("httpMethod", "GET")

    if method == "GET":
        key = (event.get("queryStringParameters") or {}).get("key")
        conn = get_conn()
        cur = conn.cursor()
        if key:
            cur.execute(f"SELECT value FROM {SCHEMA}.club_storage WHERE key = %s", (key,))
            row = cur.fetchone()
            conn.close()
            if row:
                return {"statusCode": 200, "headers": CORS, "body": json.dumps({"key": key, "value": json.loads(row[0])})}
            return {"statusCode": 404, "headers": CORS, "body": json.dumps({"error": "not found"})}
        else:
            cur.execute(f"SELECT key, value FROM {SCHEMA}.club_storage")
            rows = cur.fetchall()
            conn.close()
            result = {r[0]: json.loads(r[1]) for r in rows}
            return {"statusCode": 200, "headers": CORS, "body": json.dumps(result)}

    if method == "POST":
        body = json.loads(event.get("body") or "{}")
        key = body.get("key")
        value = body.get("value")
        if not key:
            return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "key required"})}
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(
            f"""
            INSERT INTO {SCHEMA}.club_storage (key, value, updated_at)
            VALUES (%s, %s, NOW())
            ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
            """,
            (key, json.dumps(value)),
        )
        conn.commit()
        conn.close()
        return {"statusCode": 200, "headers": CORS, "body": json.dumps({"ok": True})}

    return {"statusCode": 405, "headers": CORS, "body": json.dumps({"error": "method not allowed"})}
