export const GET_CATEGORY_ROOMS = `
SELECT 
    c.category_id,
    c.category_name,
    JSON_ARRAYAGG(
        JSON_OBJECT(
            'chat_id', cr.chat_id,
            'room_name', cr.room_name,
            'active_users', (
                SELECT COUNT(*) 
                FROM room_members rm 
                WHERE rm.chat_id = cr.chat_id AND rm.is_connected = TRUE
            )
        )
    ) AS rooms
FROM 
    categories c
LEFT JOIN 
    chat_rooms cr ON c.category_id = cr.category_id
GROUP BY 
    c.category_id, c.category_name;`;

export const GET_CATEGORY = `
    SELECT category_id, category_name FROM categories WHERE category_name = ?
  `;

export const CREATE_CATEGORY = `
    INSERT INTO categories (category_name) VALUES (?)
  `;

export const CREATE_CHAT_ROOM = `
    INSERT INTO chat_rooms (category_id, room_name) VALUES (?, ?)
  `;

export const GET_MESSAGE = `
SELECT 
    m.message_id,
    m.content,
    m.sent_at,
    m.message_type,
    sender.user_id,
    sender.user_name,
    cr.chat_id,
    cr.room_name,
    c.category_id,
    c.category_name,
    COALESCE(sender.user_name, 'System') AS sender_name
FROM 
    messages m
LEFT JOIN 
    users sender ON m.user_id = sender.user_id
JOIN 
    chat_rooms cr ON m.chat_id = cr.chat_id
JOIN 
    categories c ON cr.category_id = c.category_id
WHERE 
    m.chat_id = ?
ORDER BY 
    m.sent_at ASC
LIMIT 50;
`;

export const GET_MESSAGE_AFTER = `
SELECT m.*
     FROM messages m
     JOIN room_members rm ON m.chat_id = rm.chat_id
     WHERE m.chat_id = ? AND rm.user_id = ? AND m.sent_at >= rm.joined_at
     ORDER BY m.sent_at DESC
     LIMIT 50
`


export const SENT_MESSAGE = `
INSERT INTO messages (user_id, chat_id, content) 
VALUES (?, ?, ?);
`;

// 사용자가 방에 입장했을떄 시스템 메시지
export const SYSTEM_MESSAGE = `
INSERT INTO messages (chat_id, content, message_type, user_id)
VALUES (?, ?, 'system', NULL);
`;

// 사용자가 방에 참여할 때 실행할 쿼리
export const JOIN_ROOM = `
INSERT IGNORE INTO room_members (chat_id, user_id, joined_at)
VALUES (?, ?, CURRENT_TIMESTAMP);
`;

// 현재 방에 접속중인 유저
export const USER_ENTERED_ROOM = `
SELECT u.user_id, u.user_name, u.photo_url, rm.joined_at, rm.is_connected
FROM room_members rm
JOIN users u ON rm.user_id = u.user_id
WHERE rm.chat_id = ?`;

// 유저가 접속중인 채팅방 목록
export const GET_USER_CONNECTED_ROOMS = `
SELECT 
    cr.chat_id,
    cr.room_name,
    c.category_id,
    c.category_name,
    rm.joined_at,
    (SELECT COUNT(*) 
    FROM room_members rm2 
    WHERE rm2.chat_id = cr.chat_id ) AS user_count
FROM 
    room_members rm
JOIN 
    chat_rooms cr ON rm.chat_id = cr.chat_id
JOIN 
    categories c ON cr.category_id = c.category_id
WHERE 
    rm.user_id = ? 
 
`;

// 유저의 역할을 조회
export const GET_USER_ROLE = `
SELECT role FROM users WHERE user_id = ?;`;

// 방에서 나가기
// export const LEAVE_ROOM = `
// UPDATE room_members SET is_connected = false WHERE chat_id = ? AND user_id = ?`

export const LEAVE_ROOM = `
DELETE FROM room_members WHERE chat_id = ? AND user_id = ?;`


// 유저가 접속되어있는지
export const IS_USER_CONNECTED = `
SELECT COUNT(*) as count FROM room_members WHERE chat_id = ? AND user_id = ?;`