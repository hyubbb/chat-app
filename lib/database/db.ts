import mysql from "mysql2/promise";

// 데이터베이스 연결 설정 타입 정의
interface DbConfig {
  host: string;
  user: string;
  password: string;
  database: string;
  port: number;
}

// 데이터베이스 연결 설정
const dbConfig: DbConfig = {
  host: process.env.DB_HOST!,
  user: process.env.DB_USER!,
  password: process.env.DB_PASSWORD!,
  database: process.env.DB_NAME!,
  port: parseInt(process.env.DB_PORT!) || 3306, // 기본 포트 추가
};

// 연결 풀 생성
const pool = mysql.createPool(dbConfig);

// 연결 가져오기 함수
export async function getConnection() {
  return await pool.getConnection();
}

// 쿼리 실행 함수
export async function executeQuery(query: string, params: any[] = []) {
  const connection = await mysql.createConnection(dbConfig);
  try {
    const [results] = await connection.execute(query, params);
    return results;
  } catch {
    connection.rollback();
  } finally {
    await connection.end();
  }
}
