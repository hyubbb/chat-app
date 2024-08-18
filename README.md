 # 실시간 채팅 사이트

socket.io를 이용한 실시간 채팅 사이트입니다.  

- 배포 페이지 :  [채팅 사이트 URL](http://3.39.73.42/)
- GITHUB :  https://github.com/hyubbb/chat-app

## 기술스택

- React, Next.js, Tanstack query, Typescript, Zustand, Tailwindcss
JWT, Socket.io, MySQL, RDS, S3, EC2, Github Actions

## 아키텍쳐

---

![image.png](https://prod-files-secure.s3.us-west-2.amazonaws.com/71c29658-790c-447e-8748-e4539fd62f66/3116e493-26c0-40c9-b15c-2584e937562f/image.png)

## 대표 구현 내역 - 실시간채팅

---

![image.png](https://prod-files-secure.s3.us-west-2.amazonaws.com/71c29658-790c-447e-8748-e4539fd62f66/481267e3-7cb2-4857-aec9-dc5f4f3e4f1a/image.png)

## JWT 토큰 활용

---

![image.png](https://prod-files-secure.s3.us-west-2.amazonaws.com/71c29658-790c-447e-8748-e4539fd62f66/3143a144-2b0f-4d09-b181-70a989065a7d/image.png)

## 기능

---

- Github action을 이용하여 `CI/CD` 자동화 처리
- 실시간 메세지 통신
    - `socket.io` 를 이용하여 실시간 통신
- 이미지 저장 ( 유저아이콘 변경, 채팅 이미지 전송 )
    - 유저의 이미지나 채팅시의 이미지를 `S3`에 저장
    - 이미지 변경이나 삭제시 `S3`에서도 이미지 파일 제거.
- 모바일 디자인 대응
    - `tailwindcss`를 이용하여 모바일 대응
- 데이터 캐싱 관리
    - `tanstack query`를 이용하여 채팅방 별 메시지를 Key별로 관리
- 유저정보 유지
    - `JWT`를 이용하여 쿠키에 토큰 값을 저장하여 로그인 정보 확인

## 해결하고자 한 문제

---

### < Socket.io와 HTTP Api 속도 비교 >

메세지를 실시간으로 보내기 위해서는 2가지 방법(HTTP API - Socket, Only Socket)이 존재합니다.

직접 사용해보고 더 좋은 방식으로 사용해보고자 테스트 했습니다.

![image.png](https://prod-files-secure.s3.us-west-2.amazonaws.com/71c29658-790c-447e-8748-e4539fd62f66/815ea440-8647-4ccd-a0d9-180f2606f2c3/image.png)

### 비교

`Only Socket.io` 

- 한번 연결하면 지속적으로 유지가 되기때문에 속도가 빠르며, 실시간성이 좋다.
- 실시간으로 메세지를 비동기적으로 주고 받는다. 그렇기때문에 메시지 처리 순서를 보장하지 않는다. → 별도의 처리 필요.
- 요청-응답의 흐름을 직접 구현하고 관리해야함으로 상태관리의 복잡성이 증가.

`HTTP + Socket.io`

- 의도가 명확, 순차적 통신이 가능.
- 기존 인프라들과 통합이 잘되며, 캐싱이 된다.
- 상태 유지나 실시간 업데이트에 비효율적.
- 대규모 시스템에서는 서버부하를 생각하면 오히려 HTTP통신이 일관된 성능을 제공 할 수 있을 것 같음.

### 결론

Socket을 단독으로 사용하는 것이 조금 더 빠르며, 간편할진 모르겠으나, 클라이언트쪽에서는 HTTP통신을 하고 서버쪽에선 Socket통신을 하는 방식으로 섞어서 쓰는방식이 상태코드나 헤더 등의 데이터를 포함하여 요청-응답의 처리를 명확히 구분해서 처리 할 수 있기때문에 범용성이 더 뛰어나다고 생각합니다.

---

### < SERVER ACTION 과 API속도 비교 >

새로고침 시, 로그인정보가 로드되기전에 비로그인 일때의 DOM이 보이는 깜빡임 현상의 발생. 
서버사이드에서 데이터 처리시 server action과 api 속도차이 비교.

![image.png](https://prod-files-secure.s3.us-west-2.amazonaws.com/71c29658-790c-447e-8748-e4539fd62f66/24b8fcc1-61d3-4268-8d20-1b0350f6504b/image.png)

- Cookie에서 Token값을 불러 온 뒤,  JWT verify 처리
- server action의 경우 서버와 직접통신을 하기때문에 
네트워크를 거치지 않아도 됩니다.
- 내부 최적화가 되어있기 때문에, 속도가 빠릅니다.

### 결론

확실하게 속도는 `SERVER ACTION`이 빠르지만, 클라이언트와 서버를 나누어서 관리를 하는 경우, API를 제공하는 경우에는 `HTTP API`가 편리성과 유지보수 측면에서는 뛰어나다고 생각합니다. 
하지만 구조에 따라서 `SERVER ACTION`을 쓰는것도 성능적인 측면에서 좋은 결과를 낼 수 있었습니다.
