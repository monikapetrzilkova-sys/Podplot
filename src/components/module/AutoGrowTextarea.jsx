import { useCallback, useLayoutEffect, useRef } from "react";

export default function AutoGrowTextarea({
  value,
  onChange,
  minRows = 5,
  className = "",
  ...props
}) {
  const ref = useRef(null);

  const resize = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, []);

  useLayoutEffect(() => {
    resize();
  }, [value, resize]);

  return (
    <textarea
      ref={ref}
      value={value}
      onChange={(e) => {
        onChange(e);
        resize();
      }}
      rows={minRows}
      className={className}
      {...props}
    />
  );
}
