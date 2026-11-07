"""Tiny DB layer: PostgreSQL in production (DATABASE_URL), SQLite for local testing.

Queries are written with %s placeholders (psycopg2 style); they are converted for SQLite.
Rows come back as plain dicts.
"""
import os
import re
import sqlite3
from contextlib import contextmanager

DATABASE_URL = os.environ.get("DATABASE_URL", "").strip()
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

IS_PG = DATABASE_URL.startswith("postgresql://")
SQLITE_PATH = os.environ.get("SQLITE_PATH", os.path.join(os.path.dirname(__file__), "local.db"))

if not IS_PG:
    from decimal import Decimal
    sqlite3.register_adapter(Decimal, float)

if IS_PG:
    import psycopg2
    import psycopg2.extras
    import psycopg2.pool

    _pool = None

    def _get_pool():
        global _pool
        if _pool is None:
            _pool = psycopg2.pool.ThreadedConnectionPool(1, 8, DATABASE_URL)
        return _pool


class Conn:
    """Wraps a DB connection so app code is identical for Postgres and SQLite."""

    def __init__(self, raw):
        self.raw = raw

    def _sql(self, sql):
        if IS_PG:
            return sql
        # %s -> ?, and a few Postgres-isms
        sql = sql.replace("%s", "?")
        sql = re.sub(r"\bILIKE\b", "LIKE", sql)
        return sql

    def execute(self, sql, params=()):
        if IS_PG:
            cur = self.raw.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        else:
            cur = self.raw.cursor()
        cur.execute(self._sql(sql), tuple(params))
        return cur

    def all(self, sql, params=()):
        cur = self.execute(sql, params)
        rows = cur.fetchall()
        return [dict(r) for r in rows]

    def one(self, sql, params=()):
        cur = self.execute(sql, params)
        r = cur.fetchone()
        return dict(r) if r else None

    def scalar(self, sql, params=()):
        r = self.one(sql, params)
        return list(r.values())[0] if r else None

    def insert(self, sql, params=()):
        """INSERT and return the new id."""
        if IS_PG:
            cur = self.execute(sql + " RETURNING id", params)
            return cur.fetchone()["id"]
        cur = self.execute(sql, params)
        return cur.lastrowid


@contextmanager
def connect():
    """Transaction scope: commits on success, rolls back on error."""
    if IS_PG:
        pool = _get_pool()
        raw = pool.getconn()
        try:
            raw.autocommit = False
            yield Conn(raw)
            raw.commit()
        except Exception:
            raw.rollback()
            raise
        finally:
            pool.putconn(raw)
    else:
        raw = sqlite3.connect(SQLITE_PATH, detect_types=sqlite3.PARSE_DECLTYPES)
        raw.row_factory = sqlite3.Row
        raw.execute("PRAGMA foreign_keys = ON")
        try:
            yield Conn(raw)
            raw.commit()
        except Exception:
            raw.rollback()
            raise
        finally:
            raw.close()


def column_names(c, table):
    if IS_PG:
        rows = c.all(
            "SELECT column_name FROM information_schema.columns WHERE table_name = %s", (table,)
        )
        return {r["column_name"] for r in rows}
    rows = c.all(f"PRAGMA table_info({table})")
    return {r["name"] for r in rows}


def add_column(c, table, column, ddl):
    """Add a column if it is missing (works on both engines)."""
    if column not in column_names(c, table):
        c.execute(f"ALTER TABLE {table} ADD COLUMN {column} {ddl}")
