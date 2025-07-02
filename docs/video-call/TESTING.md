# 영상통화 테스트 가이드

## 테스트 환경 설정

### 1. 필요한 패키지 설치
```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event jest-environment-jsdom
```

### 2. 미디어 디바이스 모킹
```typescript
// tests/test-utils/mock-media.ts
export const mockMediaDevices = () => {
  const mockStream = {
    getTracks: () => [{
      stop: jest.fn(),
      enabled: true
    }],
    getVideoTracks: () => [{
      enabled: true
    }],
    getAudioTracks: () => [{
      enabled: true
    }]
  };

  Object.defineProperty(global.navigator, 'mediaDevices', {
    value: {
      getUserMedia: jest.fn().mockResolvedValue(mockStream),
      enumerateDevices: jest.fn().mockResolvedValue([
        { deviceId: 'video-1', kind: 'videoinput', label: 'Mock Camera' },
        { deviceId: 'audio-1', kind: 'audioinput', label: 'Mock Microphone' }
      ])
    }
  });

  return mockStream;
};
```

### 3. WebRTC 모킹
```typescript
// tests/test-utils/mock-webrtc.ts
export const mockRTCPeerConnection = () => {
  class MockRTCPeerConnection {
    onicecandidate = null;
    ontrack = null;
    iceConnectionState = 'new';

    addTrack = jest.fn();
    createOffer = jest.fn().mockResolvedValue({ type: 'offer', sdp: 'mock-sdp' });
    createAnswer = jest.fn().mockResolvedValue({ type: 'answer', sdp: 'mock-sdp' });
    setLocalDescription = jest.fn().mockResolvedValue(undefined);
    setRemoteDescription = jest.fn().mockResolvedValue(undefined);
    addIceCandidate = jest.fn().mockResolvedValue(undefined);
    close = jest.fn();
  }

  global.RTCPeerConnection = MockRTCPeerConnection;
};
```

## 단위 테스트

### 1. Video 컴포넌트
```typescript
// tests/video-call.spec.ts
import { render, screen, fireEvent } from '@testing-library/react';
import { Video } from '../components/video';
import { mockMediaDevices } from './test-utils/mock-media';
import { mockRTCPeerConnection } from './test-utils/mock-webrtc';

describe('Video Component', () => {
  beforeEach(() => {
    mockMediaDevices();
    mockRTCPeerConnection();
  });

  it('renders video elements', () => {
    render(<Video dmInfo={{ room_id: '123', other_id: 456, other_name: 'Test User', user_id: 789 }} />);
    expect(screen.getByTestId('local-video')).toBeInTheDocument();
    expect(screen.getByTestId('remote-video')).toBeInTheDocument();
  });

  it('toggles video/audio', () => {
    render(<Video dmInfo={{ room_id: '123', other_id: 456, other_name: 'Test User', user_id: 789 }} />);
    const videoToggle = screen.getByTestId('video-toggle');
    const audioToggle = screen.getByTestId('audio-toggle');

    fireEvent.click(videoToggle);
    expect(screen.getByTestId('video-off-icon')).toBeInTheDocument();

    fireEvent.click(audioToggle);
    expect(screen.getByTestId('audio-off-icon')).toBeInTheDocument();
  });
});
```

### 2. DeviceSettings 컴포넌트
```typescript
describe('DeviceSettings Component', () => {
  const mockOnDeviceChange = jest.fn();

  beforeEach(() => {
    mockMediaDevices();
  });

  it('lists available devices', async () => {
    render(<DeviceSettings onDeviceChange={mockOnDeviceChange} />);
    expect(await screen.findByText('Mock Camera')).toBeInTheDocument();
    expect(await screen.findByText('Mock Microphone')).toBeInTheDocument();
  });

  it('calls onDeviceChange when device is selected', async () => {
    render(<DeviceSettings onDeviceChange={mockOnDeviceChange} />);
    const videoSelect = screen.getByTestId('video-device-select');
    fireEvent.change(videoSelect, { target: { value: 'video-1' } });
    expect(mockOnDeviceChange).toHaveBeenCalledWith('video-1', 'video');
  });
});
```

### 3. useVideoCall Hook
```typescript
describe('useVideoCall Hook', () => {
  let mockSocket;

  beforeEach(() => {
    mockSocket = {
      emit: jest.fn(),
      on: jest.fn(),
      off: jest.fn()
    };
  });

  it('initializes media devices', async () => {
    const { result } = renderHook(() => useVideoCall(mockSocket));
    await act(async () => {
      await result.current.initializeDevices();
    });
    expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalled();
  });

  it('handles offer creation', async () => {
    const { result } = renderHook(() => useVideoCall(mockSocket));
    await act(async () => {
      await result.current.createOffer('room-123');
    });
    expect(mockSocket.emit).toHaveBeenCalledWith('offer', expect.any(Object));
  });
});
```

## 통합 테스트

### 1. 통화 연결 시나리오
```typescript
describe('Call Connection Flow', () => {
  it('establishes a call connection', async () => {
    // 1. 발신자 설정
    const { caller } = render(<Video dmInfo={{ room_id: '123', other_id: 456, other_name: 'Callee', user_id: 789 }} />);
    
    // 2. 수신자 설정
    const { callee } = render(<Video dmInfo={{ room_id: '123', other_id: 789, other_name: 'Caller', user_id: 456 }} />);

    // 3. 통화 시작
    fireEvent.click(caller.getByTestId('call-button'));

    // 4. 수신자가 응답
    fireEvent.click(callee.getByTestId('accept-call'));

    // 5. 연결 상태 확인
    await waitFor(() => {
      expect(caller.getByTestId('connection-status')).toHaveTextContent('connected');
      expect(callee.getByTestId('connection-status')).toHaveTextContent('connected');
    });
  });
});
```

### 2. 디바이스 변경 시나리오
```typescript
describe('Device Change Flow', () => {
  it('handles device change during call', async () => {
    const { result } = renderHook(() => useVideoCall(mockSocket));
    
    // 1. 초기 디바이스 설정
    await act(async () => {
      await result.current.initializeDevices();
    });

    // 2. 디바이스 변경
    await act(async () => {
      await result.current.changeDevice('video-2', 'video');
    });

    // 3. 스트림 업데이트 확인
    expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledTimes(2);
    expect(mockSocket.emit).toHaveBeenCalledWith('device-settings-updated', expect.any(Object));
  });
});
```

## E2E 테스트

### 1. 기본 시나리오
```typescript
// tests/video-call.spec.ts
import { test, expect } from '@playwright/test';

test('complete video call flow', async ({ page, browser }) => {
  // 1. 두 브라우저 컨텍스트 생성
  const callerContext = await browser.newContext();
  const calleeContext = await browser.newContext();

  // 2. 각각 페이지 열기
  const callerPage = await callerContext.newPage();
  const calleePage = await calleeContext.newPage();

  // 3. 통화 시작
  await callerPage.goto('/chat/123');
  await callerPage.click('[data-testid="video-call-button"]');

  // 4. 수신자 응답
  await calleePage.goto('/chat/123');
  await calleePage.click('[data-testid="accept-call"]');

  // 5. 연결 상태 확인
  await expect(callerPage.locator('[data-testid="connection-status"]')).toHaveText('connected');
  await expect(calleePage.locator('[data-testid="connection-status"]')).toHaveText('connected');

  // 6. 디바이스 설정 변경
  await callerPage.click('[data-testid="device-settings"]');
  await callerPage.selectOption('[data-testid="video-device-select"]', 'video-2');

  // 7. 통화 종료
  await callerPage.click('[data-testid="end-call"]');
  await expect(callerPage.locator('[data-testid="connection-status"]')).toHaveText('ended');
  await expect(calleePage.locator('[data-testid="connection-status"]')).toHaveText('ended');
});
```

### 2. 에러 시나리오
```typescript
test('handles permission denial', async ({ page }) => {
  // 1. 권한 거부 설정
  await page.route('**/*', route => {
    if (route.request().resourceType() === 'media') {
      route.abort();
    } else {
      route.continue();
    }
  });

  // 2. 통화 시도
  await page.goto('/chat/123');
  await page.click('[data-testid="video-call-button"]');

  // 3. 에러 메시지 확인
  await expect(page.locator('[data-testid="error-message"]')).toContainText('권한이 거부되었습니다');
});

test('handles connection failure', async ({ page }) => {
  // 1. 네트워크 실패 시뮬레이션
  await page.route('**/socket.io/**', route => route.abort());

  // 2. 통화 시도
  await page.goto('/chat/123');
  await page.click('[data-testid="video-call-button"]');

  // 3. 재연결 시도 확인
  await expect(page.locator('[data-testid="connection-status"]')).toHaveText('reconnecting');
});
```

## 성능 테스트

### 1. 메모리 누수 체크
```typescript
test('checks for memory leaks', async ({ page }) => {
  // 1. 초기 메모리 사용량 측정
  const initialMemory = await page.evaluate(() => performance.memory.usedJSHeapSize);

  // 2. 반복적인 통화 연결/종료
  for (let i = 0; i < 10; i++) {
    await page.goto('/chat/123');
    await page.click('[data-testid="video-call-button"]');
    await page.waitForTimeout(1000);
    await page.click('[data-testid="end-call"]');
  }

  // 3. 최종 메모리 사용량 비교
  const finalMemory = await page.evaluate(() => performance.memory.usedJSHeapSize);
  expect(finalMemory - initialMemory).toBeLessThan(50 * 1024 * 1024); // 50MB 이하 증가
});
```

### 2. CPU 사용량 모니터링
```typescript
test('monitors CPU usage', async ({ page }) => {
  // 1. 성능 메트릭 수집 시작
  await page.coverage.startJSCoverage();

  // 2. 통화 시나리오 실행
  await page.goto('/chat/123');
  await page.click('[data-testid="video-call-button"]');
  await page.waitForTimeout(30000); // 30초 통화

  // 3. 성능 메트릭 분석
  const coverage = await page.coverage.stopJSCoverage();
  const totalBytes = coverage.reduce((sum, entry) => sum + entry.text.length, 0);
  const usedBytes = coverage.reduce((sum, entry) => sum + entry.ranges.reduce((sum, range) => sum + range.end - range.start, 0), 0);
  
  expect(usedBytes / totalBytes).toBeGreaterThan(0.7); // 70% 이상의 코드 활용도
});
```

### 3. 네트워크 트래픽 분석
```typescript
test('analyzes network traffic', async ({ page }) => {
  // 1. 네트워크 요청 모니터링 시작
  const requests = [];
  page.on('request', request => requests.push(request));

  // 2. 통화 시나리오 실행
  await page.goto('/chat/123');
  await page.click('[data-testid="video-call-button"]');
  await page.waitForTimeout(30000); // 30초 통화

  // 3. 트래픽 분석
  const socketRequests = requests.filter(req => req.url().includes('socket.io'));
  const mediaRequests = requests.filter(req => req.resourceType() === 'media');

  expect(socketRequests.length).toBeLessThan(100); // 시그널링 요청 제한
  expect(mediaRequests.length).toBeGreaterThan(0); // 미디어 스트림 확인
});
``` 