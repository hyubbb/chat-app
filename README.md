 # 실시간 채팅 사이트

socket.io를 이용한 실시간 채팅 사이트입니다.  

- 배포 페이지 :  [채팅 사이트 URL](http://3.39.73.42/)
- GITHUB :  https://github.com/hyubbb/chat-app

## 기술스택

- React, Next.js, Tanstack query, Typescript, Zustand, Tailwindcss
JWT, Socket.io, MySQL, RDS, S3, EC2, Github Actions

## 아키텍쳐

 
 <img width="741" alt="image" src="https://github.com/user-attachments/assets/3001ee49-e656-42f1-aea9-6c4ddaec2127">


## 대표 구현 내역 - 실시간채팅

 
<img width="765" alt="image 복사본" src="https://github.com/user-attachments/assets/e258a5b1-bc74-46fd-8535-d6332b660911">


## JWT 토큰 활용
 
<img width="692" alt="22" src="https://github.com/user-attachments/assets/b240a9b0-4524-4ef3-8a9c-928b2f5658f4">

 
## 기능


- Github action을 이용하여 `CI/CD` 자동화 처리
- 실시간 메세지 통신
    - `socket.io` 를 이용하여 실시간 통신
- 무한 스크롤 기능
    - `useInfiniteQuery`를 사용하여 채팅방 이전메세지 불러오기를 구현
    - 게시글ID를 기반으로한 페이지네이션, 로드된 마지막 메시지의 ID를 커서로 지정
- 이미지 저장 ( 유저아이콘 변경, 채팅 이미지 전송 )
    - 유저의 이미지나 채팅시의 이미지를 `S3`에 저장
    - 이미지 변경이나 삭제시 `S3`에서도 이미지 파일 제거.
- 모바일 디자인 대응
    - `tailwindcss`를 이용하여 모바일 대응
- 데이터 캐싱 관리
    - `tanstack query`를 이용하여 채팅방 별 메시지를 Key별로 관리
- `JWT`를 사용하여 유저정보 유지
    - 서버에서 생성한 토큰 값을 클라이언트의 쿠키에 저장하여 로그인 정보 확인
    - `Access Token`과 `Refresh Token`을 사용하여 토큰 탈취 위험 감소


## 해결하고자 한 문제

 

### < Socket.io와 HTTP Api 속도 비교 >

메세지를 실시간으로 보내기 위해서는 2가지 방법(HTTP API - Socket, Only Socket)이 존재합니다.

직접 사용해보고 더 좋은 방식으로 사용해보고자 테스트 했습니다.

<img width="552" alt="4" src="https://github.com/user-attachments/assets/c69474f8-ac2b-49b1-bdff-ce95dac694fa">

 

### 비교

`Only Socket.io` 

- 한번 연결하면 지속적으로 유지가 되기때문에 속도가 빠르며, 실시간성이 좋다.
- 메시지 처리 순서를 보장되지 않는다.  → 별도의 처리 필요.
- 빠르게 메시지를 전송하였을때, 서버의 데이터를 처리해주는 부분에서 비동기 처리가 끝나지않았는데, socket요청이와서 오류가 발생할 수 있음.
- 요청-응답의 흐름을 직접 구현하고 관리해야함으로 상태관리의 복잡성이 증가.

`HTTP + Socket.io`

- Http통신이 Socket통신에 비해 안전성이 높기때문에 데이터베이스 처리는 Http로 하고 응답은 Socket으로 처리
- 의도가 명확, 순차적 통신이 가능.
- 처리속도가 느리다.
- http, socket 2개의 통신 방식이 중복

### 결론

Socket을 단독으로 사용하는 것이 더 빠르며, 간편하게 코드를 사용할수 있었습니다. <br>
실시간 통신이 중요시되는 채팅에 관련된부분은 Only Socket통신으로 데이터를 처리하고, <br>
실시간성이 불필요한 로그인이나 회원정보, 카테고리 생성과 같은 처리는 Http-Socket통신을 사용하는것이 통신의 효율성이 높다고 생각합니다.


 ---

### < SERVER ACTION 과 API속도 비교 >

새로고침 시, 로그인정보가 로드되기전에 비로그인 일때의 DOM이 보이는 깜빡임 현상의 발생. 
서버사이드에서 데이터 처리시 server action과 api 속도차이 비교.

<img width="215" alt="5" src="https://github.com/user-attachments/assets/32c25de9-df58-4237-9fe2-39c5305255d6">

 
- Cookie에서 Token값을 불러 온 뒤,  JWT verify 처리
- server action의 경우 서버와 직접통신을 하기때문에 
네트워크를 거치지 않아도 됩니다.
- 내부 최적화가 되어있기 때문에, 속도가 빠릅니다.

### 결론

확실하게 속도는 `SERVER ACTION`이 빠르지만, 클라이언트와 서버를 나누어서 관리를 하는 경우, API를 제공하는 경우에는 `HTTP API`가 편리성과 유지보수 측면에서는 뛰어나다고 생각합니다. 
하지만 구조에 따라서 `SERVER ACTION`을 쓰는것도 성능적인 측면에서 좋은 결과를 낼 수 있었습니다.
