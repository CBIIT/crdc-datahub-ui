import { renderHook } from "@testing-library/react";
import { useFormContext } from "react-hook-form";
import { useDebouncedWatch } from "./useDebouncedWatch";

type FormValues = {
  firstName?: string;
  lastName?: string;
};

jest.mock("react-hook-form", () => ({
  ...jest.requireActual("react-hook-form"),
  useFormContext: jest.fn(),
}));

describe("useDebouncedWatch", () => {
  let fakeWatch: jest.Mock;
  let unsubscribeSpy: jest.Mock;
  let capturedWatchCallback: ((values: FormValues, details: { name?: string }) => void) | undefined;

  beforeEach(() => {
    jest.useFakeTimers();
    unsubscribeSpy = jest.fn();
    fakeWatch = jest.fn((callback: (values: FormValues, details: { name?: string }) => void) => {
      capturedWatchCallback = callback;
      return { unsubscribe: unsubscribeSpy };
    });
    (useFormContext as jest.Mock).mockReturnValue({ watch: fakeWatch });
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
    jest.resetAllMocks();
  });

  it("calls onChange after debounce when field value length is greater than or equal to required length", async () => {
    const onChangeMock = jest.fn();
    renderHook(() =>
      useDebouncedWatch<FormValues>({
        watch: useFormContext().watch,
        fieldsToDebounce: ["firstName"],
        onChange: onChangeMock,
        debounceMs: 1000,
      })
    );

    capturedWatchCallback && capturedWatchCallback({ firstName: "John" }, { name: "firstName" });
    jest.advanceTimersByTime(1000);
    await Promise.resolve();
    expect(onChangeMock).toHaveBeenCalledWith({ firstName: "John" });
  });

  it("does not call onChange before debounce time interval", async () => {
    const onChangeMock = jest.fn();
    renderHook(() =>
      useDebouncedWatch<FormValues>({
        watch: useFormContext().watch,
        fieldsToDebounce: ["firstName"],
        onChange: onChangeMock,
        debounceMs: 1000,
      })
    );

    capturedWatchCallback && capturedWatchCallback({ firstName: "John" }, { name: "firstName" });
    jest.advanceTimersByTime(999);
    await Promise.resolve();
    expect(onChangeMock).toHaveBeenCalledTimes(0);
  });

  it("does not call onChange if field value length is positive but below required length", async () => {
    const onChangeMock = jest.fn();
    renderHook(() =>
      useDebouncedWatch<FormValues>({
        watch: useFormContext().watch,
        fieldsToDebounce: ["firstName"],
        onChange: onChangeMock,
        debounceMs: 500,
      })
    );

    capturedWatchCallback && capturedWatchCallback({ firstName: "Jo" }, { name: "firstName" });
    jest.advanceTimersByTime(500);
    await Promise.resolve();
    expect(onChangeMock).not.toHaveBeenCalled();
  });

  it("calls onChange immediately when the field is cleared (empty string)", () => {
    const onChangeMock = jest.fn();
    renderHook(() =>
      useDebouncedWatch<FormValues>({
        watch: useFormContext().watch,
        fieldsToDebounce: ["firstName"],
        onChange: onChangeMock,
        debounceMs: 500,
      })
    );

    capturedWatchCallback && capturedWatchCallback({ firstName: "" }, { name: "firstName" });
    expect(onChangeMock).toHaveBeenCalledWith({ firstName: "" });
  });

  it("ignores changes for fields not specified in fieldsToDebounce", () => {
    const onChangeMock = jest.fn();
    renderHook(() =>
      useDebouncedWatch<FormValues>({
        watch: useFormContext().watch,
        fieldsToDebounce: ["firstName"],
        onChange: onChangeMock,
        debounceMs: 500,
      })
    );

    capturedWatchCallback && capturedWatchCallback({ lastName: "Smith" }, { name: "lastName" });
    jest.advanceTimersByTime(500);
    expect(onChangeMock).not.toHaveBeenCalled();
  });

  it("ignores callback when details.name is undefined", () => {
    const onChangeMock = jest.fn();
    renderHook(() =>
      useDebouncedWatch<FormValues>({
        watch: useFormContext().watch,
        fieldsToDebounce: ["firstName"],
        onChange: onChangeMock,
        debounceMs: 500,
      })
    );

    capturedWatchCallback && capturedWatchCallback({ firstName: "John" }, {});
    jest.advanceTimersByTime(500);
    expect(onChangeMock).not.toHaveBeenCalled();
  });

  it("respects minLengths override for a field", () => {
    const onChangeMock = jest.fn();
    renderHook(() =>
      useDebouncedWatch<FormValues>({
        watch: useFormContext().watch,
        fieldsToDebounce: ["firstName"],
        minLengths: { firstName: 5 },
        onChange: onChangeMock,
        debounceMs: 500,
      })
    );

    capturedWatchCallback && capturedWatchCallback({ firstName: "Hell" }, { name: "firstName" });
    jest.advanceTimersByTime(500);
    expect(onChangeMock).not.toHaveBeenCalled();

    capturedWatchCallback && capturedWatchCallback({ firstName: "Hello" }, { name: "firstName" });
    jest.advanceTimersByTime(500);
    expect(onChangeMock).toHaveBeenCalledWith({ firstName: "Hello" });
  });

  it("uses default debounceMs value when not provided", async () => {
    const onChangeMock = jest.fn();
    renderHook(() =>
      useDebouncedWatch<FormValues>({
        watch: useFormContext().watch,
        fieldsToDebounce: ["firstName"],
        onChange: onChangeMock,
      })
    );

    capturedWatchCallback && capturedWatchCallback({ firstName: "John" }, { name: "firstName" });
    jest.advanceTimersByTime(500);
    await Promise.resolve();
    expect(onChangeMock).toHaveBeenCalledWith({ firstName: "John" });
  });

  it("calls onChange immediately when field value is non-string", () => {
    const onChangeMock = jest.fn();
    renderHook(() =>
      useDebouncedWatch<FormValues>({
        watch: useFormContext().watch,
        fieldsToDebounce: ["firstName"],
        onChange: onChangeMock,
        debounceMs: 500,
      })
    );

    capturedWatchCallback &&
      capturedWatchCallback({ firstName: 123 as unknown as string }, { name: "firstName" });
    expect(onChangeMock).toHaveBeenCalledWith({ firstName: 123 as unknown as string });
  });
});
