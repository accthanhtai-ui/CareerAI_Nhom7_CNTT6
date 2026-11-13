from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base

DATABASE_URL = "mysql+pymysql://root:123456@localhost:3306/career_ai_db"

engine = create_engine(DATABASE_URL)

LocalSession = sessionmaker(
    autoflush=False,
    autocommit=False,
    bind=engine
)

Base = declarative_base()

def get_db():
    db = LocalSession()
    try:
        yield db
    finally:
        db.close()

if __name__ == "__main__":
    with engine.connect() as conn:
        count = conn.execute(text("SELECT COUNT(*) FROM users")).scalar()
        print(f"==================================================")
        print(f"[PyMySQL] Kết nối thành công tới database trong MySQL Workbench!")
        print(f"- URL kết nối: {DATABASE_URL}")
        print(f"- Số lượng users hiện có trong bảng users: {count}")
        print(f"==================================================")
