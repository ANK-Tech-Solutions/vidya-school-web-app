# How to connect Vidya Bus to AWS RDS (PostgreSQL) and create tables
#
# 1. In AWS Console → RDS → your DB instance → Connectivity & security, copy:
#    - Endpoint (hostname)
#    - Port (usually 5432)
# 2. Configuration tab → DB name should be: vidya_db
# 3. Master username / password (the ones you set when creating RDS)
# 4. Security group: allow inbound TCP 5432 from your IP (or VPN)
#
# 5. Edit school-management-backend/.env with real values, then in PowerShell:
#
#    cd school-management-backend
#    Get-Content .env | ForEach-Object {
#      if ($_ -match '^\s*#' -or $_ -notmatch '=') { return }
#      $k,$v = $_.Split('=',2); Set-Item -Path "Env:$k" -Value $v
#    }
#    .\mvnw.cmd spring-boot:run
#
# 6. On startup Flyway runs V1/V2/V3 and creates all tables in database vidya_db.
# 7. Verify in any SQL client:
#    SELECT tablename FROM pg_tables WHERE schemaname = 'public';
