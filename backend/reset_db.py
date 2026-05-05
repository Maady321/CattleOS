from app.db.session import engine
from sqlalchemy import text

def reset_db():
    with engine.connect() as conn:
        conn.execute(text("DROP SCHEMA public CASCADE;"))
        conn.execute(text("CREATE SCHEMA public;"))
        conn.execute(text("GRANT ALL ON SCHEMA public TO postgres;"))
        conn.execute(text("GRANT ALL ON SCHEMA public TO public;"))
        conn.commit()
    print("Database wiped successfully.")

if __name__ == "__main__":
    reset_db()
