import os
import sqlite3
from datetime import datetime, timezone
from functools import wraps
from flask import Flask, g, render_template, request, redirect, url_for, session, flash, Response
from werkzeug.security import check_password_hash, generate_password_hash

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "data.db")

COMPANY_NAME = os.getenv("COMPANY_NAME", "Mi Empresa")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "cambia-esta-clave")

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "cambia-esta-secret-key")


def get_db():
    if "db" not in g:
        g.db = sqlite3.connect(DB_PATH)
        g.db.row_factory = sqlite3.Row
    return g.db


@app.teardown_appcontext
def close_db(_err):
    db = g.pop("db", None)
    if db is not None:
        db.close()


def now_utc():
    return datetime.now(timezone.utc).isoformat()


def init_db():
    db = get_db()
    db.executescript(
        """
        CREATE TABLE IF NOT EXISTS app_config (
            id INTEGER PRIMARY KEY CHECK (id = 1),
            company_name TEXT NOT NULL,
            admin_password_hash TEXT NOT NULL,
            created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS consents (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            event TEXT NOT NULL,
            name TEXT,
            email TEXT,
            phone TEXT,
            legal_ok INTEGER NOT NULL,
            marketing_ok INTEGER NOT NULL,
            reason TEXT,
            ip TEXT,
            ua TEXT,
            created_at TEXT NOT NULL
        );
        """
    )

    config = db.execute("SELECT id FROM app_config WHERE id=1").fetchone()
    if not config:
        db.execute(
            "INSERT INTO app_config (id, company_name, admin_password_hash, created_at) VALUES (1,?,?,?)",
            (COMPANY_NAME, generate_password_hash(ADMIN_PASSWORD), now_utc()),
        )
    db.commit()


@app.before_request
def ensure_db():
    init_db()


def get_company_name():
    db = get_db()
    row = db.execute("SELECT company_name FROM app_config WHERE id=1").fetchone()
    return row["company_name"] if row else COMPANY_NAME


def login_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        if not session.get("is_admin"):
            return redirect(url_for("admin_login"))
        return fn(*args, **kwargs)

    return wrapper


@app.route("/")
def public_form():
    return render_template("public_form.html", company_name=get_company_name())


@app.route("/submit", methods=["POST"])
def submit():
    name = request.form.get("name", "").strip()
    email = request.form.get("email", "").strip()
    phone = request.form.get("phone", "").strip()
    legal_ok = 1 if request.form.get("legal_ok") == "on" else 0
    marketing_ok = 1 if request.form.get("marketing_ok") == "on" else 0

    if not (name and email and phone and legal_ok):
        flash("Completa nombre, email, teléfono y aceptación legal.")
        return redirect(url_for("public_form"))

    db = get_db()
    db.execute(
        """
        INSERT INTO consents (event,name,email,phone,legal_ok,marketing_ok,reason,ip,ua,created_at)
        VALUES (?,?,?,?,?,?,?,?,?,?)
        """,
        (
            "ALTA",
            name,
            email,
            phone,
            legal_ok,
            marketing_ok,
            "",
            request.remote_addr,
            request.headers.get("User-Agent", ""),
            now_utc(),
        ),
    )
    db.commit()
    return render_template("ok.html", company_name=get_company_name(), msg="Consentimiento registrado correctamente.")


@app.route("/baja", methods=["GET", "POST"])
def baja():
    if request.method == "GET":
        return render_template("revoke.html", company_name=get_company_name())

    email = request.form.get("email", "").strip()
    phone = request.form.get("phone", "").strip()
    reason = request.form.get("reason", "").strip()

    if not email and not phone:
        flash("Indica email o teléfono.")
        return redirect(url_for("baja"))

    db = get_db()
    db.execute(
        """
        INSERT INTO consents (event,name,email,phone,legal_ok,marketing_ok,reason,ip,ua,created_at)
        VALUES (?,?,?,?,?,?,?,?,?,?)
        """,
        (
            "BAJA",
            "",
            email,
            phone,
            0,
            0,
            reason,
            request.remote_addr,
            request.headers.get("User-Agent", ""),
            now_utc(),
        ),
    )
    db.commit()
    return render_template("ok.html", company_name=get_company_name(), msg="Baja registrada correctamente.")


@app.route("/admin", methods=["GET", "POST"])
def admin_login():
    if request.method == "GET":
        return render_template("login.html", company_name=get_company_name())

    password = request.form.get("password", "")
    db = get_db()
    row = db.execute("SELECT admin_password_hash FROM app_config WHERE id=1").fetchone()
    if not row or not check_password_hash(row["admin_password_hash"], password):
        flash("Contraseña incorrecta.")
        return redirect(url_for("admin_login"))

    session["is_admin"] = True
    return redirect(url_for("dashboard"))


@app.route("/logout")
def logout():
    session.clear()
    return redirect(url_for("public_form"))


@app.route("/dashboard")
@login_required
def dashboard():
    db = get_db()
    rows = db.execute("SELECT * FROM consents ORDER BY id DESC LIMIT 200").fetchall()

    base = request.host_url.rstrip("/")
    return render_template(
        "dashboard.html",
        company_name=get_company_name(),
        rows=rows,
        form_url=f"{base}/",
        baja_url=f"{base}/baja",
    )


@app.route("/export.csv")
@login_required
def export_csv():
    db = get_db()
    rows = db.execute("SELECT * FROM consents ORDER BY id DESC").fetchall()

    lines = [
        "evento,fecha_utc,nombre,email,telefono,legal_ok,marketing_ok,motivo_baja,ip,user_agent"
    ]
    for r in rows:
        vals = [
            r["event"],
            r["created_at"],
            r["name"] or "",
            r["email"] or "",
            r["phone"] or "",
            str(r["legal_ok"]),
            str(r["marketing_ok"]),
            (r["reason"] or "").replace(",", " "),
            r["ip"] or "",
            (r["ua"] or "").replace(",", " "),
        ]
        lines.append(",".join(vals))

    return Response(
        "\n".join(lines),
        mimetype="text/csv",
        headers={"Content-Disposition": "attachment; filename=consentimientos.csv"},
    )


if __name__ == "__main__":
    app.run(debug=True, port=5001)
