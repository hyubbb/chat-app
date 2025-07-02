# 제품 요구사항 문서(PRD)

## 1. Executive Summary
본 프로젝트는 웹 기반 실시간 통신 플랫폼이다. 소켓 통신을 활용해 텍스트 채팅, 영상통화, AI 기반 기능(예: 메시지 요약·번역·스팸 필터링 등)을 제공한다. 목표는 20–30대 사용자가 Discord 급의 품질로 쉽고 빠르게 소통하도록 돕는 것이다.

## 2. Problem Statement
- 기존 서비스는 무거운 설치·로그인 절차, 과도한 기능으로 초심자 진입 장벽이 높음.  
- 영상·음성·텍스트를 한곳에서 가볍게 처리할 국산 웹 서비스가 부족함.  
- 대화 내용이 쌓여 정보 과부하가 발생하며, 핵심만 파악하기 힘듦.

## 3. Goals and Objectives
Primary Goal  
- 설치 없이 브라우저에서 고품질 실시간 채팅·영상통화 제공

Secondary Goals  
- AI로 대화 품질 향상(요약, 번역, 스팸 차단)  
- 가벼운 UI/UX로 초보자도 즉시 사용  
- 최소 비용 인프라로 99.9% 가용성 확보

Success Metrics  
- 가입→활성화 전환율 ≥ 60%  
- DAU 50k, 평균 세션 길이 ≥ 15분  
- 영상통화 지연 ≤ 150ms(국내), 패킷 손실 < 1%  
- AI 요약 사용률 ≥ 30% 대화방

## 4. Target Audience
Primary Users  
- 20–30대 대학생·직장인: 게임, 스터디, 프로젝트 협업 등 실시간 소통 필요  
Secondary Users  
- 커뮤니티 운영자, 교육기관, 이벤트 주최자

## 5. User Stories
- 학생으로서 스터디 중 영상통화를 켜고 화이트보드 공유로 문제를 함께 풀고 싶다.  
- 직장인으로서 회의 후 AI가 회의록을 요약해 주면 기록 시간을 절약할 수 있다.  
- 커뮤니티 운영자로서 스팸 메시지를 자동 차단해 쾌적한 방을 유지하고 싶다.

## 6. Functional Requirements
### Core Features
1. 실시간 텍스트 채팅  
   - WebSocket 기반 실시간 송수신  
   - 메시지 읽음 / 전송 상태 표시  
   - 수락 기준: 1초 이내 UI 반영, 10k 동시 사용자 테스트 통과

2. 영상통화 기능 추가(기존 채팅 기능에 통합)
   - 1:1 및 그룹(최대 20명) 영상통화 지원
   - WebRTC P2P, TURN fallback 적용
   - 실시간 채팅 UI 내에서 영상통화 전환 버튼 제공
   - 해상도 720p 기본, 네트워크 상황에 따라 자동 조정
   - 수락 기준: 영상통화 시작 후 2초 이내 연결, 150ms 이하 지연(국내)
3. AI 대화 기능  
   - 메시지 요약: 버튼 클릭 시 5줄 이하 요약  
   - 실시간 번역(한↔영) 토글  
   - 스팸/욕설 탐지 후 자동 숨김  
   - 수락 기준: 요약 정확도 사용자 만족도 ≥ 4/5

### Supporting Features
- 화이트보드·화면공유  
- 이모티콘·GIF 지원  
- 방 링크 공유, 비공개 초대  
- 다크모드/라이트모드  
- 모바일 반응형

## 7. Non-Functional Requirements
- Performance: 서버 응답 < 200 ms, 영상 FPS 30 유지  
- Security: JWT 인증, TLS 1.3, E2E 암호화(옵션)  
- Usability: 3-click 이내 영상통화 시작  
- Scalability: Kubernetes 오토스케일, 동시 100k 사용자  
- Compatibility: 최신 Chrome, Edge, Safari, Firefox, 모바일 브라우저

## 8. Technical Considerations
- FE: Next.js(SSR), TypeScript, Zustand 상태관리, TanStack Query 데이터 패칭  
- BE: Node.js, Socket.IO, Express, Redis Pub/Sub, WebRTC SFU(Janus)  
- AI: OpenAI GPT API, 클라우드 함수로 요약·번역  
- DB: PostgreSQL(User), DynamoDB(Message)  
- Infra: AWS EKS, CloudFront, S3, RDS, ElastiCache  
- 3rd Party: Sendbird(백업), Twilio TURN, Auth0

## 9. Success Metrics and KPIs
- 기술: 메시지 손실률 < 0.5%, 영상 끊김 비율 < 2%  
- 비즈니스: 월 구독 전환률 ≥ 5%  
- 사용자: NPS ≥ 50, AI 기능 재사용률 40%

## 10. Timeline and Milestones
Phase 1 (M0–M2) MVP  
- 로그인/회원가입, 텍스트 채팅, 기본 방 생성, 최소 AI 요약

Phase 2 (M3–M5) Core  
- 영상통화, 화이트보드, 번역, 모바일 최적화

Phase 3 (M6–M8) Growth  
- 대규모 방(100명) 지원, E2E 암호화, 유료 플랜, 커뮤니티 포털

## 11. Risks and Mitigation
- 영상 품질 저하 → 서드파티 TURN·SFU 이중화  
- AI 비용 증가 → 요약 캐싱, 프리미엄 기능으로 수익화  
- 개인정보 규제 → 국내 리전 저장, GDPR/KISA 가이드 준수  
- 사용자 유입 저조 → 대학·게임 커뮤니티 제휴, 인플루언서 마케팅

## 12. Future Considerations
- VR/AR 회의 지원  
- AI 보이스 클로닝·노이즈 캔슬링  
- 오픈 API로 서드파티 봇·플러그인 생태계 구축