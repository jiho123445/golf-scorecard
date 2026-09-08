import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

/**
 * 화면 어딘가에서 예상치 못한 렌더링 오류가 나도 앱 전체가 백지(흰 화면)로
 * 멈추지 않도록 감싸는 최상위 에러 바운더리.
 * 라운드 입력 중 오류가 나더라도 사용자가 새로고침을 시도할 방법을 볼 수 있게 한다.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="app-shell items-center justify-center gap-4 px-6 text-center">
          <div className="text-4xl">⚠️</div>
          <h1 className="text-lg font-bold text-gray-900">문제가 발생했습니다</h1>
          <p className="text-sm text-gray-500">
            화면을 표시하는 중 오류가 발생했습니다. 입력하던 기록은 이 기기에 임시 저장되어 있을 수 있습니다.
          </p>
          <button
            type="button"
            onClick={() => {
              this.setState({ error: null });
              window.location.reload();
            }}
            className="mt-2 h-12 rounded-xl bg-brand px-6 text-sm font-bold text-white"
          >
            새로고침
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
