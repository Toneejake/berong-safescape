import sqlite3
conn = sqlite3.connect('jobs.db')
cursor = conn.cursor()
cursor.execute('SELECT job_id, status, error FROM jobs ORDER BY created_at DESC LIMIT 3')
for row in cursor.fetchall():
    print(f'{row[0][:12]}... | {row[1]} | {row[2]}')
conn.close()
