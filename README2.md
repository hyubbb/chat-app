# API 정리

api
 ┣ category
 ┃ ┗ route.ts       -> [get] 카테고리 리스트와 각 카테고리의 rooms 데이터를 가져옴
 ┗ user
 ┃ ┣ login
 ┃ ┃ ┗ route.ts     -> [post] 로그인 처리를 하고, JWT를 생성하여 쿠키에 저장
 ┃ ┣ logout
 ┃ ┃ ┗ route.ts     -> [post] 로그아웃 처리를 하고, JWT쿠키 삭제
 ┃ ┣ signup
 ┃ ┃ ┗ route.ts     -> [post] 회원가입 처리
 ┃ ┗ route.ts       -> [get] 토큰값 기반으로 회원정보 가져오기 / [post] 회원정보 수정


pages/api/socket
 ┣ chat
 ┃ ┣ [chatId]
 ┃ ┃ ┗ index.ts     -> [get] 채팅방 멤버조회 / [post] 채팅방에 참여, 초기 메세지 불러오기 / [patch] 채팅방 나가기 / [delete] 채팅방 삭제
 ┃ ┗ index.ts       -> [post] 채팅방 생성
 ┣ direct
 ┃ ┣ [chatId]
 ┃ ┃ ┗ index.ts     -> [get] dm목록 가져오기 / [post] 채팅방에 참여, 초기 메세지 / [patch] 채팅방 나가기
 ┃ ┣ .DS_Store
 ┃ ┗ index.ts       -> [post] dm전송 / [patch] 메세지 삭제 
 ┣ message
 ┃ ┗ index.ts       -> [post] 메세지 전송, 이미지 업로드 처리 / [patch] 메세지 삭제 
 ┣ user
 ┃ ┗ [userId].ts    -> [get] 사용자가 참여중인 방 목록 조회
 ┗ server.ts