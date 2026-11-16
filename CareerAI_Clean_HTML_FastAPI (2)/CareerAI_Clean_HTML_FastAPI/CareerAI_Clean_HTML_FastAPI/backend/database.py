import pymysql
from pymysql.cursors import DictCursor
from fastapi import HTTPException
from .config import DB_CONFIG

def get_connection():
    try:
        return pymysql.connect(**DB_CONFIG, cursorclass=DictCursor, autocommit=True)
    except pymysql.MySQLError as error:
        raise HTTPException(status_code=503, detail=f"Không kết nối được MySQL: {error}")

def fetch_all(sql, params=()):
    connection = get_connection()
    try:
        with connection.cursor() as cursor:
            cursor.execute(sql, params)
            return cursor.fetchall()
    finally:
        connection.close()

def fetch_one(sql, params=()):
    rows = fetch_all(sql, params)
    return rows[0] if rows else None

def execute(sql, params=()):
    connection = get_connection()
    try:
        with connection.cursor() as cursor:
            cursor.execute(sql, params)
            return {"id": cursor.lastrowid, "affected": cursor.rowcount}
    finally:
        connection.close()
