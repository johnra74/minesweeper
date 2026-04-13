import { renderHook, act } from '@testing-library/react';
import { useLongPress } from './useLongPress';

describe('useLongPress', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  const mockEvent = () => ({
    preventDefault: jest.fn(),
    changedTouches: [{ clientX: 50, clientY: 100 }],
    touches: [{ clientX: 50, clientY: 100 }],
  });

  it('fires the callback after the specified delay', () => {
    const cb = jest.fn();
    const { result } = renderHook(() => useLongPress(cb, 500));

    act(() => result.current.onTouchStart(mockEvent()));
    expect(cb).not.toHaveBeenCalled();

    act(() => jest.advanceTimersByTime(500));
    expect(cb).toHaveBeenCalledTimes(1);
  });

  it('does not fire before the delay elapses', () => {
    const cb = jest.fn();
    const { result } = renderHook(() => useLongPress(cb, 500));

    act(() => result.current.onTouchStart(mockEvent()));
    act(() => jest.advanceTimersByTime(499));
    expect(cb).not.toHaveBeenCalled();
  });

  it('cancels the callback when onTouchEnd fires before the delay', () => {
    const cb = jest.fn();
    const { result } = renderHook(() => useLongPress(cb, 500));

    act(() => result.current.onTouchStart(mockEvent()));
    act(() => result.current.onTouchEnd());
    act(() => jest.advanceTimersByTime(500));
    expect(cb).not.toHaveBeenCalled();
  });

  it('cancels the callback when onTouchMove fires before the delay', () => {
    const cb = jest.fn();
    const { result } = renderHook(() => useLongPress(cb, 500));

    act(() => result.current.onTouchStart(mockEvent()));
    act(() => result.current.onTouchMove());
    act(() => jest.advanceTimersByTime(500));
    expect(cb).not.toHaveBeenCalled();
  });

  it('fires again on a second press after the first fires', () => {
    const cb = jest.fn();
    const { result } = renderHook(() => useLongPress(cb, 500));

    act(() => result.current.onTouchStart(mockEvent()));
    act(() => jest.advanceTimersByTime(500));
    act(() => result.current.onTouchEnd());

    act(() => result.current.onTouchStart(mockEvent()));
    act(() => jest.advanceTimersByTime(500));
    expect(cb).toHaveBeenCalledTimes(2);
  });

  it('fires correctly after a previously-cancelled press', () => {
    const cb = jest.fn();
    const { result } = renderHook(() => useLongPress(cb, 500));

    act(() => result.current.onTouchStart(mockEvent()));
    act(() => result.current.onTouchMove()); // cancel
    act(() => jest.advanceTimersByTime(500));

    act(() => result.current.onTouchStart(mockEvent()));
    act(() => jest.advanceTimersByTime(500));
    expect(cb).toHaveBeenCalledTimes(1);
  });

  it('calls preventDefault on touchstart', () => {
    const cb = jest.fn();
    const { result } = renderHook(() => useLongPress(cb, 500));
    const e = mockEvent();
    act(() => result.current.onTouchStart(e));
    expect(e.preventDefault).toHaveBeenCalled();
  });
});
