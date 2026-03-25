import { useTheme } from "../../context/ThemeContext";

export default function Toggle() {
  const { dark, setDark } = useTheme();

  return (
    <button onClick={() => setDark(!dark)}>
      {dark ? "🌙" : "☀️"}
    </button>
  );
}