import { useEffect, useState } from 'react';

/** 비동기 조회 결과를 상태로 (deps 가 바뀌면 다시 조회). 이전 결과는 새 결과가 올 때까지 유지합니다. */
export function useAsync<T>(fn: () => Promise<T>, deps: unknown[]) {
  const key = JSON.stringify(deps);
  const [state, setState] = useState<{ key?: string; data?: T; error?: Error }>({});
  useEffect(() => {
    let alive = true;
    fn().then(
      (data) => alive && setState({ key, data }),
      (error: Error) => alive && setState((s) => ({ key, data: s.data, error })),
    );
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return { data: state.data, error: state.error, loading: state.key !== key };
}
