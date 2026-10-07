import fs from 'fs';
import path from 'path';

export function createSqlSyncPlugin(options = {}) {
  const sqlFilePath = options.sqlFilePath || path.resolve(process.cwd(), 'cinema_screening_dbms.sql');
  let isInternalWrite = false;

  return {
    name: 'vite-plugin-sql-sync',
    configureServer(server) {
      // Watch the SQL file for external modifications (e.g. edited by user in IDE / Workbench)
      try {
        fs.watch(sqlFilePath, (eventType) => {
          if (eventType === 'change') {
            if (isInternalWrite) return;
            // Notify frontend via Vite HMR WebSocket
            server.ws.send({
              type: 'custom',
              event: 'sql-file-changed',
              data: { timestamp: Date.now() }
            });
          }
        });
      } catch (err) {
        console.warn('Could not watch SQL file:', err.message);
      }

      server.middlewares.use((req, res, next) => {
        const url = new URL(req.url, `http://${req.headers.host}`);
        
        // GET /api/sql -> returns current SQL content or file status
        if (req.method === 'GET' && url.pathname === '/api/sql') {
          try {
            if (fs.existsSync(sqlFilePath)) {
              const content = fs.readFileSync(sqlFilePath, 'utf8');
              const stats = fs.statSync(sqlFilePath);
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ exists: true, content, path: sqlFilePath, mtime: stats.mtimeMs }));
            } else {
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ exists: false, content: '', path: sqlFilePath }));
            }
          } catch (err) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: err.message }));
          }
          return;
        }


        // POST /api/sql -> updates cinema_screening_dbms.sql with the provided SQL dump
        if (req.method === 'POST' && url.pathname === '/api/sql') {
          let body = '';
          req.on('data', chunk => {
            body += chunk;
          });
          req.on('end', () => {
            try {
              const { sql } = JSON.parse(body || '{}');
              if (typeof sql !== 'string') {
                res.statusCode = 400;
                res.end(JSON.stringify({ error: 'Missing or invalid "sql" property' }));
                return;
              }
              isInternalWrite = true;
              fs.writeFileSync(sqlFilePath, sql, 'utf8');
              setTimeout(() => {
                isInternalWrite = false;
              }, 500);
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, path: sqlFilePath, length: sql.length, timestamp: new Date().toISOString() }));
            } catch (err) {
              isInternalWrite = false;
              res.statusCode = 500;
              res.end(JSON.stringify({ error: err.message }));
            }
          });
          return;
        }

        next();
      });
    }
  };
}

