# Database Connection Setup

## Get Your Render PostgreSQL Connection Details

1. **Go to Render Dashboard**: https://dashboard.render.com
2. **Select Your PostgreSQL Database**
3. **Go to "Info" tab**
4. **Copy the connection details**

You'll see something like:

```
PSQL Command:
psql -h dpg-xxxxx-a.oregon-postgres.render.com -U your_db_user your_db_name

Internal Database URL:
postgresql://your_db_user:password@dpg-xxxxx-a/your_db_name

External Database URL:
postgresql://your_db_user:password@dpg-xxxxx-a.oregon-postgres.render.com/your_db_name
```

## Update Your .env File

Open `backend/.env` and update the `DATABASE_URL`:

```env
# Use the EXTERNAL Database URL from Render
DATABASE_URL=postgresql://your_db_user:your_password@dpg-xxxxx-a.oregon-postgres.render.com:5432/your_db_name
```

**Important:** 
- Use the **External** URL (includes `.oregon-postgres.render.com` or similar)
- Make sure to include the port `:5432` if not present
- Replace all parts: username, password, host, and database name

## Example

If Render gives you:
```
postgresql://contractor_user:abc123xyz456@dpg-abc123xyz-a.oregon-postgres.render.com/contractorconnect
```

Your .env should have:
```env
DATABASE_URL=postgresql://contractor_user:abc123xyz456@dpg-abc123xyz-a.oregon-postgres.render.com:5432/contractorconnect
```

## Generate Secret Keys

Run this command to generate secure keys:

```powershell
python -c "import secrets; print('SECRET_KEY=' + secrets.token_urlsafe(32)); print('REFRESH_SECRET_KEY=' + secrets.token_urlsafe(32))"
```

Copy the output and add to your `.env` file.

## Verify Connection

Once you've updated .env, test the connection:

```powershell
# Activate virtual environment
.\.venv\Scripts\Activate.ps1

# Test connection with Python
python -c "from app.core.database import sync_engine; sync_engine.connect(); print('✅ Database connection successful!')"
```

## What to Provide

**Please share these details (you can share in a secure way):**

1. **Host**: `dpg-xxxxx-a.oregon-postgres.render.com`
2. **Port**: `5432` (default)
3. **Database Name**: Your database name
4. **Username**: Your database user
5. **Password**: Your database password

Or simply share the full **External Database URL** from Render.

---

**Next Steps After Configuration:**
1. ✅ Update .env with DATABASE_URL
2. ✅ Generate and add SECRET_KEY
3. ✅ Test database connection
4. ⏳ Initialize database with Alembic migrations
5. ⏳ Start the FastAPI server

---
*Keep your database credentials secure and never commit .env to Git!*
