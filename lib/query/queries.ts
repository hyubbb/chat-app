export const CREATE_USER = `
INSERT INTO users (id, user_name, password) VALUES (?, ?, ?)`;

export const CHECK_USER_EXISTS = `
  SELECT COUNT(*) as count
  FROM users
  WHERE id = ?
`;

export const LOGIN_USER = `
  SELECT user_id, id, user_name, password, photo_url, role
  FROM users
  WHERE id = ? AND password = ? 
`;

export const GET_CATEGORY_ROOMS = `
SELECT 
    c.category_id,
    c.category_name,
    JSON_ARRAYAGG(
        JSON_OBJECT(
            'chat_id', cr.chat_id,
            'room_name', cr.room_name,
            'user_id', cr.user_id,
            'active_users', (
                SELECT COUNT(*) 
                FROM room_members rm 
                WHERE rm.chat_id = cr.chat_id  
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
    INSERT INTO chat_rooms (category_id, room_name, user_id) VALUES (?, ?, ?)
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
SELECT 
    m.message_id,
    m.chat_id,
    m.content,
    m.sent_at,
    m.message_type,
    m.receiver_id,
    u.user_name,
    u.user_id,
    u.photo_url
FROM 
    messages m
LEFT JOIN 
    users u ON m.user_id = u.user_id
JOIN 
    room_members rm ON m.chat_id = rm.chat_id AND rm.user_id = ?
WHERE 
    m.chat_id = ? AND m.message_type != 'direct'
    AND m.sent_at >= rm.last_joined_at
ORDER BY 
    m.sent_at ASC
LIMIT 50;
`;

export const GET_DIRECT_MESSAGE_AFTER = `
SELECT * FROM (
    SELECT 
        m.*,
        sender.user_name AS user_name,
        sender.photo_url AS photo_url
    FROM messages m
    JOIN direct_rooms dr ON (m.user_id = dr.from_id AND m.chat_id = dr.to_id)
                         OR (m.user_id = dr.to_id AND m.chat_id = dr.from_id)
    LEFT JOIN users sender ON m.user_id = sender.user_id
    WHERE
        (m.chat_id = ? AND m.user_id = ?) OR (m.user_id = ? AND m.chat_id = ?)
        AND m.message_type = "direct"
    ORDER BY m.sent_at DESC
    LIMIT 50
) AS sub
ORDER BY sent_at ASC;
`;

// export const GET_DIRECT_MESSAGE_AFTER = `
// SELECT DISTINCT
//     m.message_id,
//     m.chat_id,
//     m.content,
//     m.sent_at,
//     m.message_type,
//     m.receiver_id,
//     u.user_name,
//     u.user_id,
//     u.photo_url
// FROM
//     messages m
// LEFT JOIN
//     users u ON m.user_id = u.user_id
// LEFT JOIN
//     room_members rm ON m.chat_id = rm.chat_id AND rm.user_id = ?
// WHERE
//     ( m.receiver_id = ?)
// ORDER BY
//     m.sent_at ASC
// LIMIT 50;
// `;

export const SENT_MESSAGE = `
INSERT INTO messages (user_id, chat_id, content, message_type)
VALUES (?, ?, ?, ?);
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
    rm.user_id = ?;
`;

// 유저의 역할을 조회
export const GET_USER_ROLE = `
SELECT role FROM users WHERE user_id = ?;`;

// 방에서 나가기
// export const LEAVE_ROOM = `
// UPDATE room_members SET is_connected = false WHERE chat_id = ? AND user_id = ?`

export const LEAVE_ROOM = `
DELETE FROM room_members WHERE chat_id = ? AND user_id = ?;`;

// 유저가 접속되어있는지
export const IS_USER_CONNECTED = `
SELECT COUNT(*) as count FROM room_members WHERE chat_id = ? AND user_id = ?;`;

// 채팅방 삭제
export const DELETE_MESSAGES = `
DELETE FROM  messages WHERE chat_id = ? AND message_type = "direct" ;`;
export const DELETE_ROOM_MEMBERS = `
DELETE FROM room_members WHERE chat_id = ?;`;
export const DELETE_CHAT_ROOM = `
DELETE FROM chat_rooms WHERE chat_id = ?;`;

// 삭제된 메세지 처리
export const DELETE_TEXT_MESSAGE = `
UPDATE messages
SET content = '삭제된 메시지입니다.',
    message_type = 'deleted' 
WHERE message_id = ?;
`;

export const JOIN_DIRECT_ROOMS = `
INSERT INTO direct_rooms (to_id, from_id, is_connected)
VALUES (?, ?, 1)
ON DUPLICATE KEY UPDATE
    is_connected = 1,
    joined_at = CURRENT_TIMESTAMP;
`;

export const IS_USER_CONNECTED_DM = `
SELECT COUNT(*) as count FROM direct_rooms WHERE to_id = ? AND from_id = ? || from_id = ? AND to_id = ?;
`;

export const GET_USER_CONNECTED_DM = `
 SELECT 
    dr.id,
    dr.to_id,
    dr.from_id,
    dr.joined_at,
    CASE 
        WHEN dr.from_id = ? THEN u_to.user_id
        ELSE u_from.user_id
    END AS other_id,
    CASE 
        WHEN dr.from_id = ? THEN u_to.user_name
        ELSE u_from.user_name
    END AS other_name,
    CASE 
        WHEN dr.from_id = ? THEN u_to.photo_url
        ELSE u_from.photo_url
    END AS other_photo_url
FROM 
    direct_rooms dr
JOIN 
    users u_from ON dr.from_id = u_from.user_id
JOIN 
    users u_to ON dr.to_id = u_to.user_id
WHERE 
    dr.to_id = ? OR dr.from_id = ?
 
`;

// DM 나가기
export const LEAVE_DM = `
DELETE FROM direct_rooms WHERE to_id = ? AND from_id = ? || from_id = ? AND to_id = ?;`;

// DM 채팅방 삭제
export const DELETE_DM_MESSAGES = `
DELETE FROM  messages WHERE chat_id = ? AND message_type = "direct";`;
export const DELETE_DM_CHAT_ROOM = `
DELETE FROM direct_rooms WHERE to_id = ? and from_id = ? || from_id = ? and to_id = ?;`;
