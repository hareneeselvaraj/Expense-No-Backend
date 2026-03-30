import { createHotContext as __vite__createHotContext } from "/@vite/client";import.meta.hot = __vite__createHotContext("/src/components/AI/AIChat.jsx");import __vite__cjsImport0_react_jsxDevRuntime from "/node_modules/.vite/deps/react_jsx-dev-runtime.js?v=bac1c74c"; const Fragment = __vite__cjsImport0_react_jsxDevRuntime["Fragment"]; const jsxDEV = __vite__cjsImport0_react_jsxDevRuntime["jsxDEV"];
import * as RefreshRuntime from "/@react-refresh";
const inWebWorker = typeof WorkerGlobalScope !== "undefined" && self instanceof WorkerGlobalScope;
let prevRefreshReg;
let prevRefreshSig;
if (import.meta.hot && !inWebWorker) {
  if (!window.$RefreshReg$) {
    throw new Error(
      "@vitejs/plugin-react can't detect preamble. Something is wrong."
    );
  }
  prevRefreshReg = window.$RefreshReg$;
  prevRefreshSig = window.$RefreshSig$;
  window.$RefreshReg$ = RefreshRuntime.getRefreshReg("C:/Users/haren/Desktop/Expense_Tracker/Expense-Tracker/client/src/components/AI/AIChat.jsx");
  window.$RefreshSig$ = RefreshRuntime.createSignatureFunctionForTransform;
}
var _s = $RefreshSig$(), _s2 = $RefreshSig$();
import __vite__cjsImport3_react from "/node_modules/.vite/deps/react.js?v=bac1c74c"; const useState = __vite__cjsImport3_react["useState"]; const useRef = __vite__cjsImport3_react["useRef"]; const useEffect = __vite__cjsImport3_react["useEffect"];
import { FiSend, FiCpu, FiX, FiZap, FiChevronRight, FiRefreshCw, FiCopy, FiCheck, FiChevronUp, FiChevronDown } from "/node_modules/.vite/deps/react-icons_fi.js?v=bac1c74c";
import { BiMath, BiTrendingUp, BiHomeAlt, BiCoin, BiReceipt, BiTargetLock } from "/node_modules/.vite/deps/react-icons_bi.js?v=bac1c74c";
import api from "/src/services/api.js";
import "/src/components/AI/AIChat_styles.css?t=1773889201437";
const SUGGESTIONS = [
  "Why did I overspend this month?",
  "Am I on track for my savings goals?",
  "Which category should I cut back on?",
  "How is my investment portfolio performing?",
  "What's my net worth?",
  "Give me a summary of my finances this month"
];
function parseMarkdown(text) {
  if (!text) return null;
  let lines = text.split("\n");
  let elements = [];
  let inList = false;
  let listItems = [];
  const flushList = () => {
    if (inList && listItems.length > 0) {
      elements.push(/* @__PURE__ */ jsxDEV("ul", { className: "aic-list", children: [...listItems] }, `ul-${elements.length}`, false, {
        fileName: "C:/Users/haren/Desktop/Expense_Tracker/Expense-Tracker/client/src/components/AI/AIChat.jsx",
        lineNumber: 45,
        columnNumber: 21
      }, this));
      listItems = [];
      inList = false;
    }
  };
  const parseInline = (str, lineIndex) => {
    const parts = str.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return /* @__PURE__ */ jsxDEV("strong", { children: part.slice(2, -2) }, `${lineIndex}-${i}`, false, {
          fileName: "C:/Users/haren/Desktop/Expense_Tracker/Expense-Tracker/client/src/components/AI/AIChat.jsx",
          lineNumber: 55,
          columnNumber: 16
        }, this);
      }
      return /* @__PURE__ */ jsxDEV("span", { children: part }, `${lineIndex}-${i}`, false, {
        fileName: "C:/Users/haren/Desktop/Expense_Tracker/Expense-Tracker/client/src/components/AI/AIChat.jsx",
        lineNumber: 57,
        columnNumber: 14
      }, this);
    });
  };
  lines.forEach((line, i) => {
    let trimmed = line.trim();
    if (trimmed.startsWith("### ")) {
      flushList();
      elements.push(/* @__PURE__ */ jsxDEV("h4", { className: "aic-heading", children: parseInline(trimmed.substring(4), i) }, i, false, {
        fileName: "C:/Users/haren/Desktop/Expense_Tracker/Expense-Tracker/client/src/components/AI/AIChat.jsx",
        lineNumber: 65,
        columnNumber: 21
      }, this));
    } else if (trimmed.startsWith("## ")) {
      flushList();
      elements.push(/* @__PURE__ */ jsxDEV("h3", { className: "aic-heading", children: parseInline(trimmed.substring(3), i) }, i, false, {
        fileName: "C:/Users/haren/Desktop/Expense_Tracker/Expense-Tracker/client/src/components/AI/AIChat.jsx",
        lineNumber: 68,
        columnNumber: 21
      }, this));
    } else if (trimmed.startsWith("# ")) {
      flushList();
      elements.push(/* @__PURE__ */ jsxDEV("h2", { className: "aic-heading", children: parseInline(trimmed.substring(2), i) }, i, false, {
        fileName: "C:/Users/haren/Desktop/Expense_Tracker/Expense-Tracker/client/src/components/AI/AIChat.jsx",
        lineNumber: 71,
        columnNumber: 21
      }, this));
    } else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      inList = true;
      listItems.push(/* @__PURE__ */ jsxDEV("li", { children: parseInline(trimmed.substring(2), i) }, `li-${i}`, false, {
        fileName: "C:/Users/haren/Desktop/Expense_Tracker/Expense-Tracker/client/src/components/AI/AIChat.jsx",
        lineNumber: 74,
        columnNumber: 22
      }, this));
    } else if (/^\d+\.\s/.test(trimmed)) {
      inList = true;
      listItems.push(/* @__PURE__ */ jsxDEV("li", { children: parseInline(trimmed.replace(/^\d+\.\s/, ""), i) }, `li-${i}`, false, {
        fileName: "C:/Users/haren/Desktop/Expense_Tracker/Expense-Tracker/client/src/components/AI/AIChat.jsx",
        lineNumber: 77,
        columnNumber: 22
      }, this));
    } else if (trimmed === "") {
      flushList();
      elements.push(/* @__PURE__ */ jsxDEV("div", { className: "aic-br" }, `br-${i}`, false, {
        fileName: "C:/Users/haren/Desktop/Expense_Tracker/Expense-Tracker/client/src/components/AI/AIChat.jsx",
        lineNumber: 80,
        columnNumber: 21
      }, this));
    } else {
      flushList();
      elements.push(/* @__PURE__ */ jsxDEV("div", { className: "aic-p", children: parseInline(line, i) }, i, false, {
        fileName: "C:/Users/haren/Desktop/Expense_Tracker/Expense-Tracker/client/src/components/AI/AIChat.jsx",
        lineNumber: 83,
        columnNumber: 21
      }, this));
    }
  });
  flushList();
  return /* @__PURE__ */ jsxDEV("div", { className: "aic-md", children: elements }, void 0, false, {
    fileName: "C:/Users/haren/Desktop/Expense_Tracker/Expense-Tracker/client/src/components/AI/AIChat.jsx",
    lineNumber: 87,
    columnNumber: 10
  }, this);
}
function TypingDots() {
  return /* @__PURE__ */ jsxDEV("div", { className: "aic-typing", children: [
    /* @__PURE__ */ jsxDEV("span", {}, void 0, false, {
      fileName: "C:/Users/haren/Desktop/Expense_Tracker/Expense-Tracker/client/src/components/AI/AIChat.jsx",
      lineNumber: 93,
      columnNumber: 13
    }, this),
    /* @__PURE__ */ jsxDEV("span", {}, void 0, false, {
      fileName: "C:/Users/haren/Desktop/Expense_Tracker/Expense-Tracker/client/src/components/AI/AIChat.jsx",
      lineNumber: 93,
      columnNumber: 21
    }, this),
    /* @__PURE__ */ jsxDEV("span", {}, void 0, false, {
      fileName: "C:/Users/haren/Desktop/Expense_Tracker/Expense-Tracker/client/src/components/AI/AIChat.jsx",
      lineNumber: 93,
      columnNumber: 29
    }, this)
  ] }, void 0, true, {
    fileName: "C:/Users/haren/Desktop/Expense_Tracker/Expense-Tracker/client/src/components/AI/AIChat.jsx",
    lineNumber: 92,
    columnNumber: 5
  }, this);
}
_c = TypingDots;
function Message({ msg }) {
  _s();
  const isUser = msg.role === "user";
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(msg.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2e3);
  };
  const timestamp = new Date(msg.timestamp || Date.now()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return /* @__PURE__ */ jsxDEV("div", { className: `aic-msg-row ${isUser ? "aic-msg-user" : "aic-msg-ai"}`, children: [
    !isUser && /* @__PURE__ */ jsxDEV("div", { className: "aic-avatar aic-avatar-ai", children: /* @__PURE__ */ jsxDEV(FiCpu, { size: 14 }, void 0, false, {
      fileName: "C:/Users/haren/Desktop/Expense_Tracker/Expense-Tracker/client/src/components/AI/AIChat.jsx",
      lineNumber: 114,
      columnNumber: 21
    }, this) }, void 0, false, {
      fileName: "C:/Users/haren/Desktop/Expense_Tracker/Expense-Tracker/client/src/components/AI/AIChat.jsx",
      lineNumber: 113,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV("div", { className: `aic-bubble-wrapper ${isUser ? "aic-wrapper-user" : "aic-wrapper-ai"}`, children: [
      /* @__PURE__ */ jsxDEV("div", { className: `aic-bubble ${isUser ? "aic-bubble-user" : "aic-bubble-ai"}`, children: isUser ? msg.content.split("\n").map(
        (line, i) => /* @__PURE__ */ jsxDEV("span", { children: [
          line,
          i < msg.content.split("\n").length - 1 && /* @__PURE__ */ jsxDEV("br", {}, void 0, false, {
            fileName: "C:/Users/haren/Desktop/Expense_Tracker/Expense-Tracker/client/src/components/AI/AIChat.jsx",
            lineNumber: 123,
            columnNumber: 76
          }, this)
        ] }, i, true, {
          fileName: "C:/Users/haren/Desktop/Expense_Tracker/Expense-Tracker/client/src/components/AI/AIChat.jsx",
          lineNumber: 121,
          columnNumber: 11
        }, this)
      ) : parseMarkdown(msg.content) }, void 0, false, {
        fileName: "C:/Users/haren/Desktop/Expense_Tracker/Expense-Tracker/client/src/components/AI/AIChat.jsx",
        lineNumber: 118,
        columnNumber: 17
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "aic-msg-footer", children: [
        /* @__PURE__ */ jsxDEV("span", { className: "aic-time", children: timestamp }, void 0, false, {
          fileName: "C:/Users/haren/Desktop/Expense_Tracker/Expense-Tracker/client/src/components/AI/AIChat.jsx",
          lineNumber: 131,
          columnNumber: 21
        }, this),
        !isUser && /* @__PURE__ */ jsxDEV("button", { className: "aic-copy-btn", onClick: handleCopy, title: "Copy message", children: copied ? /* @__PURE__ */ jsxDEV(FiCheck, { size: 12, color: "#10b981" }, void 0, false, {
          fileName: "C:/Users/haren/Desktop/Expense_Tracker/Expense-Tracker/client/src/components/AI/AIChat.jsx",
          lineNumber: 134,
          columnNumber: 39
        }, this) : /* @__PURE__ */ jsxDEV(FiCopy, { size: 12 }, void 0, false, {
          fileName: "C:/Users/haren/Desktop/Expense_Tracker/Expense-Tracker/client/src/components/AI/AIChat.jsx",
          lineNumber: 134,
          columnNumber: 79
        }, this) }, void 0, false, {
          fileName: "C:/Users/haren/Desktop/Expense_Tracker/Expense-Tracker/client/src/components/AI/AIChat.jsx",
          lineNumber: 133,
          columnNumber: 11
        }, this)
      ] }, void 0, true, {
        fileName: "C:/Users/haren/Desktop/Expense_Tracker/Expense-Tracker/client/src/components/AI/AIChat.jsx",
        lineNumber: 130,
        columnNumber: 17
      }, this)
    ] }, void 0, true, {
      fileName: "C:/Users/haren/Desktop/Expense_Tracker/Expense-Tracker/client/src/components/AI/AIChat.jsx",
      lineNumber: 117,
      columnNumber: 13
    }, this)
  ] }, void 0, true, {
    fileName: "C:/Users/haren/Desktop/Expense_Tracker/Expense-Tracker/client/src/components/AI/AIChat.jsx",
    lineNumber: 111,
    columnNumber: 5
  }, this);
}
_s(Message, "NE86rL3vg4NVcTTWDavsT0hUBJs=");
_c2 = Message;
const CALCULATORS = {
  emi: { id: "emi", name: "EMI", icon: /* @__PURE__ */ jsxDEV(BiHomeAlt, {}, void 0, false, {
    fileName: "C:/Users/haren/Desktop/Expense_Tracker/Expense-Tracker/client/src/components/AI/AIChat.jsx",
    lineNumber: 144,
    columnNumber: 40
  }, this), desc: "Calculate Loan EMI" },
  sip: { id: "sip", name: "SIP", icon: /* @__PURE__ */ jsxDEV(BiTrendingUp, {}, void 0, false, {
    fileName: "C:/Users/haren/Desktop/Expense_Tracker/Expense-Tracker/client/src/components/AI/AIChat.jsx",
    lineNumber: 145,
    columnNumber: 40
  }, this), desc: "Systematic Inv. Plan" },
  fd: { id: "fd", name: "FD", icon: /* @__PURE__ */ jsxDEV(BiMath, {}, void 0, false, {
    fileName: "C:/Users/haren/Desktop/Expense_Tracker/Expense-Tracker/client/src/components/AI/AIChat.jsx",
    lineNumber: 146,
    columnNumber: 37
  }, this), desc: "Fixed Deposit Returns" },
  ci: { id: "ci", name: "Compound", icon: /* @__PURE__ */ jsxDEV(BiCoin, {}, void 0, false, {
    fileName: "C:/Users/haren/Desktop/Expense_Tracker/Expense-Tracker/client/src/components/AI/AIChat.jsx",
    lineNumber: 147,
    columnNumber: 43
  }, this), desc: "Compound Interest" },
  tax: { id: "tax", name: "Tax", icon: /* @__PURE__ */ jsxDEV(BiReceipt, {}, void 0, false, {
    fileName: "C:/Users/haren/Desktop/Expense_Tracker/Expense-Tracker/client/src/components/AI/AIChat.jsx",
    lineNumber: 148,
    columnNumber: 40
  }, this), desc: "Income Tax Estimator" },
  goal: { id: "goal", name: "Goal", icon: /* @__PURE__ */ jsxDEV(BiTargetLock, {}, void 0, false, {
    fileName: "C:/Users/haren/Desktop/Expense_Tracker/Expense-Tracker/client/src/components/AI/AIChat.jsx",
    lineNumber: 149,
    columnNumber: 43
  }, this), desc: "Savings Goal Planner" }
};
export default function AIChat() {
  _s2();
  const isMobile = window.innerWidth <= 600;
  const [isOpen, setIsOpen] = useState(false);
  const [size, setSize] = useState({ width: 400, height: 600 });
  const dragRef = useRef({ x: 0, y: 0, w: 0, h: 0 });
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const [activeCalc, setActiveCalc] = useState(null);
  const [calcData, setCalcData] = useState({});
  const [calcResult, setCalcResult] = useState(null);
  useEffect(() => {
    if (isOpen) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading, activeCalc, isOpen]);
  const sendMessage = async (text, hideFromUI = false) => {
    const userText = (text || input).trim();
    if (!userText || loading) return;
    setInput("");
    setError(null);
    const newMsg = { role: "user", content: userText, timestamp: Date.now() };
    if (!hideFromUI) {
      setMessages((prev) => [...prev, newMsg]);
    }
    setLoading(true);
    setActiveCalc(null);
    try {
      const historyToAI = messages.map((m) => ({ role: m.role, content: m.content }));
      const res = await api.post("/aichat", { message: userText, history: historyToAI });
      const aiMsg = { role: "assistant", content: res.data.reply, timestamp: Date.now() };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      setError("Could not reach the AI. Please try again.");
      if (!hideFromUI) {
        setMessages((prev) => prev.slice(0, -1));
      }
    } finally {
      setLoading(false);
      if (!hideFromUI) inputRef.current?.focus();
    }
  };
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };
  const clearChat = () => {
    setMessages([]);
    setError(null);
    setActiveCalc(null);
    inputRef.current?.focus();
  };
  const sendCalcToChat = () => {
    if (!calcResult) return;
    const msg = `I calculated my ${activeCalc.toUpperCase()}:
${calcResult.summary}
What does this mean for my financial health?`;
    sendMessage(msg);
  };
  const handleCalcChange = (field, val) => {
    const num = parseFloat(val) || 0;
    const newData = { ...calcData, [field]: num };
    setCalcData(newData);
    let res = null;
    if (activeCalc === "emi" && newData.p && newData.r && newData.t) {
      const p = newData.p, r = newData.r / 12 / 100, n = newData.t * 12;
      const emi = p * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
      res = { val1: emi, label1: "Monthly EMI", val2: emi * n - p, label2: "Total Interest", summary: `Loan: ₹${p}
Tenure: ${newData.t}yrs @ ${newData.r}%
EMI: ₹${Math.round(emi)}` };
    } else if (activeCalc === "sip" && newData.inv && newData.r && newData.t) {
      const p = newData.inv, r = newData.r / 12 / 100, n = newData.t * 12;
      const fv = p * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
      res = { val1: fv, label1: "Expected Amount", val2: fv - p * n, label2: "Wealth Gained", summary: `SIP: ₹${p}/mo
Duration: ${newData.t}yrs @ ${newData.r}%
Future Value: ₹${Math.round(fv)}` };
    } else if (activeCalc === "fd" && newData.p && newData.r && newData.t) {
      const p = newData.p, r = newData.r / 100, t = newData.t;
      const fv = p * Math.pow(1 + r / 4, 4 * t);
      res = { val1: fv, label1: "Maturity Amount", val2: fv - p, label2: "Interest Earned", summary: `FD: ₹${p}
Duration: ${t}yrs @ ${newData.r}%
Maturity: ₹${Math.round(fv)}` };
    } else if (activeCalc === "goal" && newData.target && newData.t && newData.r) {
      const fv = newData.target, r = newData.r / 12 / 100, n = newData.t * 12;
      const sip = fv * r / ((Math.pow(1 + r, n) - 1) * (1 + r));
      res = { val1: Math.ceil(sip), label1: "Monthly SIP Requires", val2: newData.target, label2: "Target Amount", summary: `Goal: ₹${newData.target} in ${newData.t}yrs at ${newData.r}%
Monthly SIP: ₹${Math.ceil(sip)}` };
    } else if (activeCalc === "tax" && newData.income) {
      let income = newData.income, tax = 0;
      if (income > 7e5) {
        if (income > 3e5) tax += Math.min(income - 3e5, 3e5) * 0.05;
        if (income > 6e5) tax += Math.min(income - 6e5, 3e5) * 0.1;
        if (income > 9e5) tax += Math.min(income - 9e5, 3e5) * 0.15;
        if (income > 12e5) tax += Math.min(income - 12e5, 3e5) * 0.2;
        if (income > 15e5) tax += (income - 15e5) * 0.3;
        tax += tax * 0.04;
      }
      res = { val1: tax, label1: "Estimated Tax", val2: income - tax, label2: "Net Income", summary: `Income: ₹${income}
Tax (New Regime): ₹${Math.round(tax)}` };
    }
    setCalcResult(res);
  };
  const toggleCalc = (id) => {
    if (activeCalc === id) {
      setActiveCalc(null);
    } else {
      setActiveCalc(id);
      setCalcData({});
      setCalcResult(null);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    }
  };
  const handleMouseDown = (e) => {
    e.preventDefault();
    dragRef.current = { x: e.clientX, y: e.clientY, w: size.width, h: size.height };
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };
  const handleMouseMove = (e) => {
    const dx = e.clientX - dragRef.current.x;
    const dy = e.clientY - dragRef.current.y;
    setSize({
      width: Math.max(300, Math.min(dragRef.current.w - dx, window.innerWidth - 40)),
      height: Math.max(400, Math.min(dragRef.current.h - dy, window.innerHeight - 80))
    });
  };
  const handleMouseUp = () => {
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };
  const isEmpty = messages.length === 0;
  return /* @__PURE__ */ jsxDEV("div", { className: "aic-widget-container", children: [
    !isOpen && /* @__PURE__ */ jsxDEV("button", { className: "aic-fab-round", onClick: () => setIsOpen(true), title: "Ask AI", children: /* @__PURE__ */ jsxDEV(FiCpu, { size: 26 }, void 0, false, {
      fileName: "C:/Users/haren/Desktop/Expense_Tracker/Expense-Tracker/client/src/components/AI/AIChat.jsx",
      lineNumber: 311,
      columnNumber: 21
    }, this) }, void 0, false, {
      fileName: "C:/Users/haren/Desktop/Expense_Tracker/Expense-Tracker/client/src/components/AI/AIChat.jsx",
      lineNumber: 310,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV(
      "div",
      {
        className: `aic-window ${isOpen ? "open" : ""}`,
        style: isMobile ? {} : { width: `${size.width}px`, height: `${size.height}px` },
        children: [
          /* @__PURE__ */ jsxDEV("div", { className: "aic-resizer", onMouseDown: handleMouseDown, title: "Drag to resize" }, void 0, false, {
            fileName: "C:/Users/haren/Desktop/Expense_Tracker/Expense-Tracker/client/src/components/AI/AIChat.jsx",
            lineNumber: 321,
            columnNumber: 17
          }, this),
          /* @__PURE__ */ jsxDEV("div", { className: "aic-header", onClick: () => setIsOpen(false), children: [
            /* @__PURE__ */ jsxDEV("div", { className: "aic-header-title", children: [
              /* @__PURE__ */ jsxDEV("div", { className: "aic-header-avatar", children: /* @__PURE__ */ jsxDEV(FiCpu, { size: 16 }, void 0, false, {
                fileName: "C:/Users/haren/Desktop/Expense_Tracker/Expense-Tracker/client/src/components/AI/AIChat.jsx",
                lineNumber: 327,
                columnNumber: 29
              }, this) }, void 0, false, {
                fileName: "C:/Users/haren/Desktop/Expense_Tracker/Expense-Tracker/client/src/components/AI/AIChat.jsx",
                lineNumber: 326,
                columnNumber: 25
              }, this),
              /* @__PURE__ */ jsxDEV("span", { children: "AI Assistant" }, void 0, false, {
                fileName: "C:/Users/haren/Desktop/Expense_Tracker/Expense-Tracker/client/src/components/AI/AIChat.jsx",
                lineNumber: 329,
                columnNumber: 25
              }, this)
            ] }, void 0, true, {
              fileName: "C:/Users/haren/Desktop/Expense_Tracker/Expense-Tracker/client/src/components/AI/AIChat.jsx",
              lineNumber: 325,
              columnNumber: 21
            }, this),
            /* @__PURE__ */ jsxDEV("div", { className: "aic-header-actions", children: /* @__PURE__ */ jsxDEV("button", { className: "aic-header-btn", onClick: (e) => {
              e.stopPropagation();
              setIsOpen(false);
            }, children: /* @__PURE__ */ jsxDEV(FiChevronDown, { size: 20 }, void 0, false, {
              fileName: "C:/Users/haren/Desktop/Expense_Tracker/Expense-Tracker/client/src/components/AI/AIChat.jsx",
              lineNumber: 333,
              columnNumber: 29
            }, this) }, void 0, false, {
              fileName: "C:/Users/haren/Desktop/Expense_Tracker/Expense-Tracker/client/src/components/AI/AIChat.jsx",
              lineNumber: 332,
              columnNumber: 25
            }, this) }, void 0, false, {
              fileName: "C:/Users/haren/Desktop/Expense_Tracker/Expense-Tracker/client/src/components/AI/AIChat.jsx",
              lineNumber: 331,
              columnNumber: 21
            }, this)
          ] }, void 0, true, {
            fileName: "C:/Users/haren/Desktop/Expense_Tracker/Expense-Tracker/client/src/components/AI/AIChat.jsx",
            lineNumber: 324,
            columnNumber: 17
          }, this),
          /* @__PURE__ */ jsxDEV("div", { className: "aic-body", children: [
            isEmpty && /* @__PURE__ */ jsxDEV("div", { className: "aic-empty", children: [
              /* @__PURE__ */ jsxDEV("div", { className: "aic-empty-icon", children: /* @__PURE__ */ jsxDEV(FiCpu, {}, void 0, false, {
                fileName: "C:/Users/haren/Desktop/Expense_Tracker/Expense-Tracker/client/src/components/AI/AIChat.jsx",
                lineNumber: 342,
                columnNumber: 61
              }, this) }, void 0, false, {
                fileName: "C:/Users/haren/Desktop/Expense_Tracker/Expense-Tracker/client/src/components/AI/AIChat.jsx",
                lineNumber: 342,
                columnNumber: 29
              }, this),
              /* @__PURE__ */ jsxDEV("h3", { className: "aic-empty-title", children: "Your Financial Co-pilot" }, void 0, false, {
                fileName: "C:/Users/haren/Desktop/Expense_Tracker/Expense-Tracker/client/src/components/AI/AIChat.jsx",
                lineNumber: 343,
                columnNumber: 29
              }, this),
              /* @__PURE__ */ jsxDEV("p", { className: "aic-empty-sub", children: "Get insights on your spending, investments, and goals." }, void 0, false, {
                fileName: "C:/Users/haren/Desktop/Expense_Tracker/Expense-Tracker/client/src/components/AI/AIChat.jsx",
                lineNumber: 344,
                columnNumber: 29
              }, this),
              /* @__PURE__ */ jsxDEV("div", { className: "aic-suggestions", children: SUGGESTIONS.map(
                (s, i) => /* @__PURE__ */ jsxDEV("button", { className: "aic-suggestion-btn", onClick: () => sendMessage(s), children: [
                  /* @__PURE__ */ jsxDEV(FiZap, { size: 12, className: "aic-sugg-icon" }, void 0, false, {
                    fileName: "C:/Users/haren/Desktop/Expense_Tracker/Expense-Tracker/client/src/components/AI/AIChat.jsx",
                    lineNumber: 350,
                    columnNumber: 41
                  }, this),
                  " ",
                  s
                ] }, i, true, {
                  fileName: "C:/Users/haren/Desktop/Expense_Tracker/Expense-Tracker/client/src/components/AI/AIChat.jsx",
                  lineNumber: 349,
                  columnNumber: 15
                }, this)
              ) }, void 0, false, {
                fileName: "C:/Users/haren/Desktop/Expense_Tracker/Expense-Tracker/client/src/components/AI/AIChat.jsx",
                lineNumber: 347,
                columnNumber: 29
              }, this)
            ] }, void 0, true, {
              fileName: "C:/Users/haren/Desktop/Expense_Tracker/Expense-Tracker/client/src/components/AI/AIChat.jsx",
              lineNumber: 341,
              columnNumber: 11
            }, this),
            !isEmpty && /* @__PURE__ */ jsxDEV("div", { className: "aic-messages", children: [
              messages.map(
                (msg, i) => /* @__PURE__ */ jsxDEV("div", { className: "aic-msg-anim", children: /* @__PURE__ */ jsxDEV(Message, { msg }, void 0, false, {
                  fileName: "C:/Users/haren/Desktop/Expense_Tracker/Expense-Tracker/client/src/components/AI/AIChat.jsx",
                  lineNumber: 362,
                  columnNumber: 37
                }, this) }, i, false, {
                  fileName: "C:/Users/haren/Desktop/Expense_Tracker/Expense-Tracker/client/src/components/AI/AIChat.jsx",
                  lineNumber: 361,
                  columnNumber: 13
                }, this)
              ),
              loading && /* @__PURE__ */ jsxDEV("div", { className: "aic-msg-row aic-msg-ai aic-msg-anim", children: [
                /* @__PURE__ */ jsxDEV("div", { className: "aic-avatar aic-avatar-ai", children: /* @__PURE__ */ jsxDEV(FiCpu, { size: 14 }, void 0, false, {
                  fileName: "C:/Users/haren/Desktop/Expense_Tracker/Expense-Tracker/client/src/components/AI/AIChat.jsx",
                  lineNumber: 368,
                  columnNumber: 79
                }, this) }, void 0, false, {
                  fileName: "C:/Users/haren/Desktop/Expense_Tracker/Expense-Tracker/client/src/components/AI/AIChat.jsx",
                  lineNumber: 368,
                  columnNumber: 37
                }, this),
                /* @__PURE__ */ jsxDEV("div", { className: "aic-bubble-wrapper aic-wrapper-ai", children: /* @__PURE__ */ jsxDEV("div", { className: "aic-bubble aic-bubble-ai aic-bubble-typing", children: /* @__PURE__ */ jsxDEV(TypingDots, {}, void 0, false, {
                  fileName: "C:/Users/haren/Desktop/Expense_Tracker/Expense-Tracker/client/src/components/AI/AIChat.jsx",
                  lineNumber: 371,
                  columnNumber: 45
                }, this) }, void 0, false, {
                  fileName: "C:/Users/haren/Desktop/Expense_Tracker/Expense-Tracker/client/src/components/AI/AIChat.jsx",
                  lineNumber: 370,
                  columnNumber: 41
                }, this) }, void 0, false, {
                  fileName: "C:/Users/haren/Desktop/Expense_Tracker/Expense-Tracker/client/src/components/AI/AIChat.jsx",
                  lineNumber: 369,
                  columnNumber: 37
                }, this)
              ] }, void 0, true, {
                fileName: "C:/Users/haren/Desktop/Expense_Tracker/Expense-Tracker/client/src/components/AI/AIChat.jsx",
                lineNumber: 367,
                columnNumber: 13
              }, this),
              error && /* @__PURE__ */ jsxDEV("div", { className: "aic-error", children: error }, void 0, false, {
                fileName: "C:/Users/haren/Desktop/Expense_Tracker/Expense-Tracker/client/src/components/AI/AIChat.jsx",
                lineNumber: 378,
                columnNumber: 13
              }, this),
              /* @__PURE__ */ jsxDEV("div", { style: { height: activeCalc ? "240px" : "10px", transition: "height 0.3s ease" } }, void 0, false, {
                fileName: "C:/Users/haren/Desktop/Expense_Tracker/Expense-Tracker/client/src/components/AI/AIChat.jsx",
                lineNumber: 382,
                columnNumber: 29
              }, this),
              /* @__PURE__ */ jsxDEV("div", { ref: bottomRef }, void 0, false, {
                fileName: "C:/Users/haren/Desktop/Expense_Tracker/Expense-Tracker/client/src/components/AI/AIChat.jsx",
                lineNumber: 383,
                columnNumber: 29
              }, this)
            ] }, void 0, true, {
              fileName: "C:/Users/haren/Desktop/Expense_Tracker/Expense-Tracker/client/src/components/AI/AIChat.jsx",
              lineNumber: 359,
              columnNumber: 11
            }, this)
          ] }, void 0, true, {
            fileName: "C:/Users/haren/Desktop/Expense_Tracker/Expense-Tracker/client/src/components/AI/AIChat.jsx",
            lineNumber: 338,
            columnNumber: 17
          }, this),
          /* @__PURE__ */ jsxDEV("div", { className: "aic-bottom-area", children: [
            /* @__PURE__ */ jsxDEV("div", { className: "aic-tools-bar", children: Object.values(CALCULATORS).map(
              (calc) => /* @__PURE__ */ jsxDEV(
                "button",
                {
                  className: `aic-tool-btn ${activeCalc === calc.id ? "active" : ""}`,
                  onClick: () => toggleCalc(calc.id),
                  children: [
                    calc.icon,
                    " ",
                    /* @__PURE__ */ jsxDEV("span", { children: calc.name }, void 0, false, {
                      fileName: "C:/Users/haren/Desktop/Expense_Tracker/Expense-Tracker/client/src/components/AI/AIChat.jsx",
                      lineNumber: 398,
                      columnNumber: 45
                    }, this)
                  ]
                },
                calc.id,
                true,
                {
                  fileName: "C:/Users/haren/Desktop/Expense_Tracker/Expense-Tracker/client/src/components/AI/AIChat.jsx",
                  lineNumber: 393,
                  columnNumber: 13
                },
                this
              )
            ) }, void 0, false, {
              fileName: "C:/Users/haren/Desktop/Expense_Tracker/Expense-Tracker/client/src/components/AI/AIChat.jsx",
              lineNumber: 391,
              columnNumber: 21
            }, this),
            activeCalc && /* @__PURE__ */ jsxDEV("div", { className: "aic-calc-panel", children: [
              /* @__PURE__ */ jsxDEV("div", { className: "aic-calc-header", children: [
                /* @__PURE__ */ jsxDEV("h4", { children: [
                  CALCULATORS[activeCalc].icon,
                  " ",
                  CALCULATORS[activeCalc].name
                ] }, void 0, true, {
                  fileName: "C:/Users/haren/Desktop/Expense_Tracker/Expense-Tracker/client/src/components/AI/AIChat.jsx",
                  lineNumber: 407,
                  columnNumber: 33
                }, this),
                /* @__PURE__ */ jsxDEV("button", { className: "aic-close-btn", onClick: () => setActiveCalc(null), children: /* @__PURE__ */ jsxDEV(FiX, { size: 16 }, void 0, false, {
                  fileName: "C:/Users/haren/Desktop/Expense_Tracker/Expense-Tracker/client/src/components/AI/AIChat.jsx",
                  lineNumber: 408,
                  columnNumber: 103
                }, this) }, void 0, false, {
                  fileName: "C:/Users/haren/Desktop/Expense_Tracker/Expense-Tracker/client/src/components/AI/AIChat.jsx",
                  lineNumber: 408,
                  columnNumber: 33
                }, this)
              ] }, void 0, true, {
                fileName: "C:/Users/haren/Desktop/Expense_Tracker/Expense-Tracker/client/src/components/AI/AIChat.jsx",
                lineNumber: 406,
                columnNumber: 29
              }, this),
              /* @__PURE__ */ jsxDEV("div", { className: "aic-calc-body", children: [
                /* @__PURE__ */ jsxDEV("div", { className: "aic-calc-inputs", children: [
                  (activeCalc === "emi" || activeCalc === "fd") && /* @__PURE__ */ jsxDEV("div", { className: "aic-input-group", children: [
                    /* @__PURE__ */ jsxDEV("label", { children: "Principal (₹)" }, void 0, false, {
                      fileName: "C:/Users/haren/Desktop/Expense_Tracker/Expense-Tracker/client/src/components/AI/AIChat.jsx",
                      lineNumber: 415,
                      columnNumber: 45
                    }, this),
                    /* @__PURE__ */ jsxDEV("input", { type: "number", placeholder: "Eg. 500000", value: calcData.p || "", onChange: (e) => handleCalcChange("p", e.target.value) }, void 0, false, {
                      fileName: "C:/Users/haren/Desktop/Expense_Tracker/Expense-Tracker/client/src/components/AI/AIChat.jsx",
                      lineNumber: 416,
                      columnNumber: 45
                    }, this)
                  ] }, void 0, true, {
                    fileName: "C:/Users/haren/Desktop/Expense_Tracker/Expense-Tracker/client/src/components/AI/AIChat.jsx",
                    lineNumber: 414,
                    columnNumber: 17
                  }, this),
                  activeCalc === "sip" && /* @__PURE__ */ jsxDEV("div", { className: "aic-input-group", children: [
                    /* @__PURE__ */ jsxDEV("label", { children: "Monthly (₹)" }, void 0, false, {
                      fileName: "C:/Users/haren/Desktop/Expense_Tracker/Expense-Tracker/client/src/components/AI/AIChat.jsx",
                      lineNumber: 421,
                      columnNumber: 45
                    }, this),
                    /* @__PURE__ */ jsxDEV("input", { type: "number", placeholder: "Eg. 5000", value: calcData.inv || "", onChange: (e) => handleCalcChange("inv", e.target.value) }, void 0, false, {
                      fileName: "C:/Users/haren/Desktop/Expense_Tracker/Expense-Tracker/client/src/components/AI/AIChat.jsx",
                      lineNumber: 422,
                      columnNumber: 45
                    }, this)
                  ] }, void 0, true, {
                    fileName: "C:/Users/haren/Desktop/Expense_Tracker/Expense-Tracker/client/src/components/AI/AIChat.jsx",
                    lineNumber: 420,
                    columnNumber: 17
                  }, this),
                  activeCalc === "goal" && /* @__PURE__ */ jsxDEV("div", { className: "aic-input-group", children: [
                    /* @__PURE__ */ jsxDEV("label", { children: "Target (₹)" }, void 0, false, {
                      fileName: "C:/Users/haren/Desktop/Expense_Tracker/Expense-Tracker/client/src/components/AI/AIChat.jsx",
                      lineNumber: 427,
                      columnNumber: 45
                    }, this),
                    /* @__PURE__ */ jsxDEV("input", { type: "number", placeholder: "Eg. 1000000", value: calcData.target || "", onChange: (e) => handleCalcChange("target", e.target.value) }, void 0, false, {
                      fileName: "C:/Users/haren/Desktop/Expense_Tracker/Expense-Tracker/client/src/components/AI/AIChat.jsx",
                      lineNumber: 428,
                      columnNumber: 45
                    }, this)
                  ] }, void 0, true, {
                    fileName: "C:/Users/haren/Desktop/Expense_Tracker/Expense-Tracker/client/src/components/AI/AIChat.jsx",
                    lineNumber: 426,
                    columnNumber: 17
                  }, this),
                  activeCalc === "tax" && /* @__PURE__ */ jsxDEV("div", { className: "aic-input-group", children: [
                    /* @__PURE__ */ jsxDEV("label", { children: "Income (₹)" }, void 0, false, {
                      fileName: "C:/Users/haren/Desktop/Expense_Tracker/Expense-Tracker/client/src/components/AI/AIChat.jsx",
                      lineNumber: 433,
                      columnNumber: 45
                    }, this),
                    /* @__PURE__ */ jsxDEV("input", { type: "number", placeholder: "Eg. 1200000", value: calcData.income || "", onChange: (e) => handleCalcChange("income", e.target.value) }, void 0, false, {
                      fileName: "C:/Users/haren/Desktop/Expense_Tracker/Expense-Tracker/client/src/components/AI/AIChat.jsx",
                      lineNumber: 434,
                      columnNumber: 45
                    }, this)
                  ] }, void 0, true, {
                    fileName: "C:/Users/haren/Desktop/Expense_Tracker/Expense-Tracker/client/src/components/AI/AIChat.jsx",
                    lineNumber: 432,
                    columnNumber: 17
                  }, this),
                  activeCalc !== "tax" && /* @__PURE__ */ jsxDEV(Fragment, { children: [
                    /* @__PURE__ */ jsxDEV("div", { className: "aic-input-group", children: [
                      /* @__PURE__ */ jsxDEV("label", { children: "Rate (%)" }, void 0, false, {
                        fileName: "C:/Users/haren/Desktop/Expense_Tracker/Expense-Tracker/client/src/components/AI/AIChat.jsx",
                        lineNumber: 440,
                        columnNumber: 49
                      }, this),
                      /* @__PURE__ */ jsxDEV("input", { type: "number", placeholder: "Eg. 12", value: calcData.r || "", onChange: (e) => handleCalcChange("r", e.target.value) }, void 0, false, {
                        fileName: "C:/Users/haren/Desktop/Expense_Tracker/Expense-Tracker/client/src/components/AI/AIChat.jsx",
                        lineNumber: 441,
                        columnNumber: 49
                      }, this)
                    ] }, void 0, true, {
                      fileName: "C:/Users/haren/Desktop/Expense_Tracker/Expense-Tracker/client/src/components/AI/AIChat.jsx",
                      lineNumber: 439,
                      columnNumber: 45
                    }, this),
                    /* @__PURE__ */ jsxDEV("div", { className: "aic-input-group", children: [
                      /* @__PURE__ */ jsxDEV("label", { children: "Years" }, void 0, false, {
                        fileName: "C:/Users/haren/Desktop/Expense_Tracker/Expense-Tracker/client/src/components/AI/AIChat.jsx",
                        lineNumber: 444,
                        columnNumber: 49
                      }, this),
                      /* @__PURE__ */ jsxDEV("input", { type: "number", placeholder: "Eg. 5", value: calcData.t || "", onChange: (e) => handleCalcChange("t", e.target.value) }, void 0, false, {
                        fileName: "C:/Users/haren/Desktop/Expense_Tracker/Expense-Tracker/client/src/components/AI/AIChat.jsx",
                        lineNumber: 445,
                        columnNumber: 49
                      }, this)
                    ] }, void 0, true, {
                      fileName: "C:/Users/haren/Desktop/Expense_Tracker/Expense-Tracker/client/src/components/AI/AIChat.jsx",
                      lineNumber: 443,
                      columnNumber: 45
                    }, this)
                  ] }, void 0, true, {
                    fileName: "C:/Users/haren/Desktop/Expense_Tracker/Expense-Tracker/client/src/components/AI/AIChat.jsx",
                    lineNumber: 438,
                    columnNumber: 17
                  }, this)
                ] }, void 0, true, {
                  fileName: "C:/Users/haren/Desktop/Expense_Tracker/Expense-Tracker/client/src/components/AI/AIChat.jsx",
                  lineNumber: 412,
                  columnNumber: 33
                }, this),
                /* @__PURE__ */ jsxDEV("div", { className: "aic-calc-results", children: calcResult ? /* @__PURE__ */ jsxDEV(Fragment, { children: [
                  /* @__PURE__ */ jsxDEV("div", { className: "aic-result-main", children: [
                    /* @__PURE__ */ jsxDEV("span", { children: calcResult.label1 }, void 0, false, {
                      fileName: "C:/Users/haren/Desktop/Expense_Tracker/Expense-Tracker/client/src/components/AI/AIChat.jsx",
                      lineNumber: 455,
                      columnNumber: 49
                    }, this),
                    /* @__PURE__ */ jsxDEV("h3", { children: [
                      "₹",
                      Math.round(calcResult.val1).toLocaleString("en-IN")
                    ] }, void 0, true, {
                      fileName: "C:/Users/haren/Desktop/Expense_Tracker/Expense-Tracker/client/src/components/AI/AIChat.jsx",
                      lineNumber: 456,
                      columnNumber: 49
                    }, this)
                  ] }, void 0, true, {
                    fileName: "C:/Users/haren/Desktop/Expense_Tracker/Expense-Tracker/client/src/components/AI/AIChat.jsx",
                    lineNumber: 454,
                    columnNumber: 45
                  }, this),
                  /* @__PURE__ */ jsxDEV("button", { className: "aic-calc-send-btn", onClick: sendCalcToChat, children: [
                    "Ask AI ",
                    /* @__PURE__ */ jsxDEV(FiChevronRight, {}, void 0, false, {
                      fileName: "C:/Users/haren/Desktop/Expense_Tracker/Expense-Tracker/client/src/components/AI/AIChat.jsx",
                      lineNumber: 459,
                      columnNumber: 56
                    }, this)
                  ] }, void 0, true, {
                    fileName: "C:/Users/haren/Desktop/Expense_Tracker/Expense-Tracker/client/src/components/AI/AIChat.jsx",
                    lineNumber: 458,
                    columnNumber: 45
                  }, this)
                ] }, void 0, true, {
                  fileName: "C:/Users/haren/Desktop/Expense_Tracker/Expense-Tracker/client/src/components/AI/AIChat.jsx",
                  lineNumber: 453,
                  columnNumber: 17
                }, this) : /* @__PURE__ */ jsxDEV("div", { className: "aic-result-empty", children: "Enter details to calculate" }, void 0, false, {
                  fileName: "C:/Users/haren/Desktop/Expense_Tracker/Expense-Tracker/client/src/components/AI/AIChat.jsx",
                  lineNumber: 463,
                  columnNumber: 17
                }, this) }, void 0, false, {
                  fileName: "C:/Users/haren/Desktop/Expense_Tracker/Expense-Tracker/client/src/components/AI/AIChat.jsx",
                  lineNumber: 451,
                  columnNumber: 33
                }, this)
              ] }, void 0, true, {
                fileName: "C:/Users/haren/Desktop/Expense_Tracker/Expense-Tracker/client/src/components/AI/AIChat.jsx",
                lineNumber: 411,
                columnNumber: 29
              }, this)
            ] }, void 0, true, {
              fileName: "C:/Users/haren/Desktop/Expense_Tracker/Expense-Tracker/client/src/components/AI/AIChat.jsx",
              lineNumber: 405,
              columnNumber: 11
            }, this),
            /* @__PURE__ */ jsxDEV("div", { className: "aic-input-bar", children: [
              !isEmpty && /* @__PURE__ */ jsxDEV("button", { className: "aic-clear-btn", onClick: clearChat, title: "Clear conversation", children: /* @__PURE__ */ jsxDEV(FiRefreshCw, { size: 14 }, void 0, false, {
                fileName: "C:/Users/haren/Desktop/Expense_Tracker/Expense-Tracker/client/src/components/AI/AIChat.jsx",
                lineNumber: 474,
                columnNumber: 33
              }, this) }, void 0, false, {
                fileName: "C:/Users/haren/Desktop/Expense_Tracker/Expense-Tracker/client/src/components/AI/AIChat.jsx",
                lineNumber: 473,
                columnNumber: 13
              }, this),
              /* @__PURE__ */ jsxDEV(
                "input",
                {
                  ref: inputRef,
                  className: "aic-input",
                  type: "text",
                  placeholder: "Write a message...",
                  value: input,
                  onChange: (e) => setInput(e.target.value),
                  onKeyDown: handleKeyDown,
                  disabled: loading
                },
                void 0,
                false,
                {
                  fileName: "C:/Users/haren/Desktop/Expense_Tracker/Expense-Tracker/client/src/components/AI/AIChat.jsx",
                  lineNumber: 477,
                  columnNumber: 25
                },
                this
              ),
              /* @__PURE__ */ jsxDEV("button", { className: "aic-send-btn", onClick: () => sendMessage(), disabled: !input.trim() || loading, children: /* @__PURE__ */ jsxDEV(FiSend, { size: 16 }, void 0, false, {
                fileName: "C:/Users/haren/Desktop/Expense_Tracker/Expense-Tracker/client/src/components/AI/AIChat.jsx",
                lineNumber: 488,
                columnNumber: 29
              }, this) }, void 0, false, {
                fileName: "C:/Users/haren/Desktop/Expense_Tracker/Expense-Tracker/client/src/components/AI/AIChat.jsx",
                lineNumber: 487,
                columnNumber: 25
              }, this)
            ] }, void 0, true, {
              fileName: "C:/Users/haren/Desktop/Expense_Tracker/Expense-Tracker/client/src/components/AI/AIChat.jsx",
              lineNumber: 471,
              columnNumber: 21
            }, this)
          ] }, void 0, true, {
            fileName: "C:/Users/haren/Desktop/Expense_Tracker/Expense-Tracker/client/src/components/AI/AIChat.jsx",
            lineNumber: 389,
            columnNumber: 17
          }, this)
        ]
      },
      void 0,
      true,
      {
        fileName: "C:/Users/haren/Desktop/Expense_Tracker/Expense-Tracker/client/src/components/AI/AIChat.jsx",
        lineNumber: 316,
        columnNumber: 13
      },
      this
    )
  ] }, void 0, true, {
    fileName: "C:/Users/haren/Desktop/Expense_Tracker/Expense-Tracker/client/src/components/AI/AIChat.jsx",
    lineNumber: 306,
    columnNumber: 5
  }, this);
}
_s2(AIChat, "LbGF3qaeUwJ6GYG39dgvXlV1OcI=");
_c3 = AIChat;
var _c, _c2, _c3;
$RefreshReg$(_c, "TypingDots");
$RefreshReg$(_c2, "Message");
$RefreshReg$(_c3, "AIChat");
if (import.meta.hot && !inWebWorker) {
  window.$RefreshReg$ = prevRefreshReg;
  window.$RefreshSig$ = prevRefreshSig;
}
if (import.meta.hot && !inWebWorker) {
  RefreshRuntime.__hmr_import(import.meta.url).then((currentExports) => {
    RefreshRuntime.registerExportsForReactRefresh("C:/Users/haren/Desktop/Expense_Tracker/Expense-Tracker/client/src/components/AI/AIChat.jsx", currentExports);
    import.meta.hot.accept((nextExports) => {
      if (!nextExports) return;
      const invalidateMessage = RefreshRuntime.validateRefreshBoundaryAndEnqueueUpdate("C:/Users/haren/Desktop/Expense_Tracker/Expense-Tracker/client/src/components/AI/AIChat.jsx", currentExports, nextExports);
      if (invalidateMessage) import.meta.hot.invalidate(invalidateMessage);
    });
  });
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJtYXBwaW5ncyI6IkFBeUIwQixTQXlZYyxVQXpZZDs7Ozs7Ozs7Ozs7Ozs7Ozs7QUF6QjFCLFNBQVNBLFVBQVVDLFFBQVFDLGlCQUFpQjtBQUM1QyxTQUFTQyxRQUFRQyxPQUFPQyxLQUFLQyxPQUFPQyxnQkFBZ0JDLGFBQWFDLFFBQVFDLFNBQVNDLGFBQWFDLHFCQUFxQjtBQUNwSCxTQUFTQyxRQUFRQyxjQUFjQyxXQUFXQyxRQUFRQyxXQUFXQyxvQkFBb0I7QUFDakYsT0FBT0MsU0FBUztBQUNoQixPQUFPO0FBRVAsTUFBTUMsY0FBYztBQUFBLEVBQ2hCO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBNkM7QUFJakQsU0FBU0MsY0FBY0MsTUFBTTtBQUN6QixNQUFJLENBQUNBLEtBQU0sUUFBTztBQUNsQixNQUFJQyxRQUFRRCxLQUFLRSxNQUFNLElBQUk7QUFDM0IsTUFBSUMsV0FBVztBQUNmLE1BQUlDLFNBQVM7QUFDYixNQUFJQyxZQUFZO0FBRWhCLFFBQU1DLFlBQVlBLE1BQU07QUFDcEIsUUFBSUYsVUFBVUMsVUFBVUUsU0FBUyxHQUFHO0FBQ2hDSixlQUFTSyxLQUFLLHVCQUFDLFFBQWlDLFdBQVUsWUFBWSxXQUFDLEdBQUdILFNBQVMsS0FBNUQsTUFBTUYsU0FBU0ksTUFBTSxJQUE5QjtBQUFBO0FBQUE7QUFBQTtBQUFBLGFBQXVFLENBQUs7QUFDMUZGLGtCQUFZO0FBQ1pELGVBQVM7QUFBQSxJQUNiO0FBQUEsRUFDSjtBQUVBLFFBQU1LLGNBQWNBLENBQUNDLEtBQUtDLGNBQWM7QUFDcEMsVUFBTUMsUUFBUUYsSUFBSVIsTUFBTSxnQkFBZ0I7QUFDeEMsV0FBT1UsTUFBTUMsSUFBSSxDQUFDQyxNQUFNQyxNQUFNO0FBQzFCLFVBQUlELEtBQUtFLFdBQVcsSUFBSSxLQUFLRixLQUFLRyxTQUFTLElBQUksR0FBRztBQUM5QyxlQUFPLHVCQUFDLFlBQWtDSCxlQUFLSSxNQUFNLEdBQUcsRUFBRSxLQUF0QyxHQUFHUCxTQUFTLElBQUlJLENBQUMsSUFBOUI7QUFBQTtBQUFBO0FBQUE7QUFBQSxlQUFxRDtBQUFBLE1BQ2hFO0FBQ0EsYUFBTyx1QkFBQyxVQUFnQ0Qsa0JBQXRCLEdBQUdILFNBQVMsSUFBSUksQ0FBQyxJQUE1QjtBQUFBO0FBQUE7QUFBQTtBQUFBLGFBQXNDO0FBQUEsSUFDakQsQ0FBQztBQUFBLEVBQ0w7QUFFQWQsUUFBTWtCLFFBQVEsQ0FBQ0MsTUFBTUwsTUFBTTtBQUN2QixRQUFJTSxVQUFVRCxLQUFLRSxLQUFLO0FBQ3hCLFFBQUlELFFBQVFMLFdBQVcsTUFBTSxHQUFHO0FBQzVCVixnQkFBVTtBQUNWSCxlQUFTSyxLQUFLLHVCQUFDLFFBQVcsV0FBVSxlQUFlQyxzQkFBWVksUUFBUUUsVUFBVSxDQUFDLEdBQUdSLENBQUMsS0FBL0RBLEdBQVQ7QUFBQTtBQUFBO0FBQUE7QUFBQSxhQUEwRSxDQUFLO0FBQUEsSUFDakcsV0FBV00sUUFBUUwsV0FBVyxLQUFLLEdBQUc7QUFDbENWLGdCQUFVO0FBQ1ZILGVBQVNLLEtBQUssdUJBQUMsUUFBVyxXQUFVLGVBQWVDLHNCQUFZWSxRQUFRRSxVQUFVLENBQUMsR0FBR1IsQ0FBQyxLQUEvREEsR0FBVDtBQUFBO0FBQUE7QUFBQTtBQUFBLGFBQTBFLENBQUs7QUFBQSxJQUNqRyxXQUFXTSxRQUFRTCxXQUFXLElBQUksR0FBRztBQUNqQ1YsZ0JBQVU7QUFDVkgsZUFBU0ssS0FBSyx1QkFBQyxRQUFXLFdBQVUsZUFBZUMsc0JBQVlZLFFBQVFFLFVBQVUsQ0FBQyxHQUFHUixDQUFDLEtBQS9EQSxHQUFUO0FBQUE7QUFBQTtBQUFBO0FBQUEsYUFBMEUsQ0FBSztBQUFBLElBQ2pHLFdBQVdNLFFBQVFMLFdBQVcsSUFBSSxLQUFLSyxRQUFRTCxXQUFXLElBQUksR0FBRztBQUM3RFosZUFBUztBQUNUQyxnQkFBVUcsS0FBSyx1QkFBQyxRQUFvQkMsc0JBQVlZLFFBQVFFLFVBQVUsQ0FBQyxHQUFHUixDQUFDLEtBQS9DLE1BQU1BLENBQUMsSUFBaEI7QUFBQTtBQUFBO0FBQUE7QUFBQSxhQUEwRCxDQUFLO0FBQUEsSUFDbEYsV0FBVyxXQUFXUyxLQUFLSCxPQUFPLEdBQUc7QUFDakNqQixlQUFTO0FBQ1RDLGdCQUFVRyxLQUFLLHVCQUFDLFFBQW9CQyxzQkFBWVksUUFBUUksUUFBUSxZQUFZLEVBQUUsR0FBR1YsQ0FBQyxLQUExRCxNQUFNQSxDQUFDLElBQWhCO0FBQUE7QUFBQTtBQUFBO0FBQUEsYUFBcUUsQ0FBSztBQUFBLElBQzdGLFdBQVdNLFlBQVksSUFBSTtBQUN2QmYsZ0JBQVU7QUFDVkgsZUFBU0ssS0FBSyx1QkFBQyxTQUFvQixXQUFVLFlBQXJCLE1BQU1PLENBQUMsSUFBakI7QUFBQTtBQUFBO0FBQUE7QUFBQSxhQUF1QyxDQUFHO0FBQUEsSUFDNUQsT0FBTztBQUNIVCxnQkFBVTtBQUNWSCxlQUFTSyxLQUFLLHVCQUFDLFNBQVksV0FBVSxTQUFTQyxzQkFBWVcsTUFBTUwsQ0FBQyxLQUF6Q0EsR0FBVjtBQUFBO0FBQUE7QUFBQTtBQUFBLGFBQXFELENBQU07QUFBQSxJQUM3RTtBQUFBLEVBQ0osQ0FBQztBQUNEVCxZQUFVO0FBQ1YsU0FBTyx1QkFBQyxTQUFJLFdBQVUsVUFBVUgsc0JBQXpCO0FBQUE7QUFBQTtBQUFBO0FBQUEsU0FBa0M7QUFDN0M7QUFFQSxTQUFTdUIsYUFBYTtBQUNsQixTQUNJLHVCQUFDLFNBQUksV0FBVSxjQUNYO0FBQUEsMkJBQUMsWUFBRDtBQUFBO0FBQUE7QUFBQTtBQUFBLFdBQUs7QUFBQSxJQUFHLHVCQUFDLFlBQUQ7QUFBQTtBQUFBO0FBQUE7QUFBQSxXQUFLO0FBQUEsSUFBRyx1QkFBQyxZQUFEO0FBQUE7QUFBQTtBQUFBO0FBQUEsV0FBSztBQUFBLE9BRHpCO0FBQUE7QUFBQTtBQUFBO0FBQUEsU0FFQTtBQUVSO0FBQUNDLEtBTlFEO0FBUVQsU0FBU0UsUUFBUSxFQUFFQyxJQUFJLEdBQUc7QUFBQUMsS0FBQTtBQUN0QixRQUFNQyxTQUFTRixJQUFJRyxTQUFTO0FBQzVCLFFBQU0sQ0FBQ0MsUUFBUUMsU0FBUyxJQUFJeEQsU0FBUyxLQUFLO0FBRTFDLFFBQU15RCxhQUFhQSxNQUFNO0FBQ3JCQyxjQUFVQyxVQUFVQyxVQUFVVCxJQUFJVSxPQUFPO0FBQ3pDTCxjQUFVLElBQUk7QUFDZE0sZUFBVyxNQUFNTixVQUFVLEtBQUssR0FBRyxHQUFJO0FBQUEsRUFDM0M7QUFFQSxRQUFNTyxZQUFZLElBQUlDLEtBQUtiLElBQUlZLGFBQWFDLEtBQUtDLElBQUksQ0FBQyxFQUFFQyxtQkFBbUIsSUFBSSxFQUFFQyxNQUFNLFdBQVdDLFFBQVEsVUFBVSxDQUFDO0FBRXJILFNBQ0ksdUJBQUMsU0FBSSxXQUFXLGVBQWVmLFNBQVMsaUJBQWlCLFlBQVksSUFDaEU7QUFBQSxLQUFDQSxVQUNFLHVCQUFDLFNBQUksV0FBVSw0QkFDWCxpQ0FBQyxTQUFNLE1BQU0sTUFBYjtBQUFBO0FBQUE7QUFBQTtBQUFBLFdBQWdCLEtBRHBCO0FBQUE7QUFBQTtBQUFBO0FBQUEsV0FFQTtBQUFBLElBRUosdUJBQUMsU0FBSSxXQUFXLHNCQUFzQkEsU0FBUyxxQkFBcUIsZ0JBQWdCLElBQ2hGO0FBQUEsNkJBQUMsU0FBSSxXQUFXLGNBQWNBLFNBQVMsb0JBQW9CLGVBQWUsSUFDckVBLG1CQUNHRixJQUFJVSxRQUFRckMsTUFBTSxJQUFJLEVBQUVXO0FBQUFBLFFBQUksQ0FBQ08sTUFBTUwsTUFDL0IsdUJBQUMsVUFDSUs7QUFBQUE7QUFBQUEsVUFDQUwsSUFBSWMsSUFBSVUsUUFBUXJDLE1BQU0sSUFBSSxFQUFFSyxTQUFTLEtBQUssdUJBQUMsVUFBRDtBQUFBO0FBQUE7QUFBQTtBQUFBLGlCQUFHO0FBQUEsYUFGdkNRLEdBQVg7QUFBQTtBQUFBO0FBQUE7QUFBQSxlQUdBO0FBQUEsTUFDSCxJQUVEaEIsY0FBYzhCLElBQUlVLE9BQU8sS0FUakM7QUFBQTtBQUFBO0FBQUE7QUFBQSxhQVdBO0FBQUEsTUFDQSx1QkFBQyxTQUFJLFdBQVUsa0JBQ1g7QUFBQSwrQkFBQyxVQUFLLFdBQVUsWUFBWUUsdUJBQTVCO0FBQUE7QUFBQTtBQUFBO0FBQUEsZUFBc0M7QUFBQSxRQUNyQyxDQUFDVixVQUNFLHVCQUFDLFlBQU8sV0FBVSxnQkFBZSxTQUFTSSxZQUFZLE9BQU0sZ0JBQ3ZERixtQkFBUyx1QkFBQyxXQUFRLE1BQU0sSUFBSSxPQUFNLGFBQXpCO0FBQUE7QUFBQTtBQUFBO0FBQUEsZUFBa0MsSUFBTSx1QkFBQyxVQUFPLE1BQU0sTUFBZDtBQUFBO0FBQUE7QUFBQTtBQUFBLGVBQWlCLEtBRHZFO0FBQUE7QUFBQTtBQUFBO0FBQUEsZUFFQTtBQUFBLFdBTFI7QUFBQTtBQUFBO0FBQUE7QUFBQSxhQU9BO0FBQUEsU0FwQko7QUFBQTtBQUFBO0FBQUE7QUFBQSxXQXFCQTtBQUFBLE9BM0JKO0FBQUE7QUFBQTtBQUFBO0FBQUEsU0E0QkE7QUFFUjtBQUFDSCxHQTNDUUYsU0FBTztBQUFBLE1BQVBBO0FBNkNULE1BQU1tQixjQUFjO0FBQUEsRUFDaEJDLEtBQUssRUFBRUMsSUFBSSxPQUFPQyxNQUFNLE9BQU9DLE1BQU0sdUJBQUMsZUFBRDtBQUFBO0FBQUE7QUFBQTtBQUFBLFNBQVUsR0FBS0MsTUFBTSxxQkFBcUI7QUFBQSxFQUMvRUMsS0FBSyxFQUFFSixJQUFJLE9BQU9DLE1BQU0sT0FBT0MsTUFBTSx1QkFBQyxrQkFBRDtBQUFBO0FBQUE7QUFBQTtBQUFBLFNBQWEsR0FBS0MsTUFBTSx1QkFBdUI7QUFBQSxFQUNwRkUsSUFBSSxFQUFFTCxJQUFJLE1BQU1DLE1BQU0sTUFBTUMsTUFBTSx1QkFBQyxZQUFEO0FBQUE7QUFBQTtBQUFBO0FBQUEsU0FBTyxHQUFLQyxNQUFNLHdCQUF3QjtBQUFBLEVBQzVFRyxJQUFJLEVBQUVOLElBQUksTUFBTUMsTUFBTSxZQUFZQyxNQUFNLHVCQUFDLFlBQUQ7QUFBQTtBQUFBO0FBQUE7QUFBQSxTQUFPLEdBQUtDLE1BQU0sb0JBQW9CO0FBQUEsRUFDOUVJLEtBQUssRUFBRVAsSUFBSSxPQUFPQyxNQUFNLE9BQU9DLE1BQU0sdUJBQUMsZUFBRDtBQUFBO0FBQUE7QUFBQTtBQUFBLFNBQVUsR0FBS0MsTUFBTSx1QkFBdUI7QUFBQSxFQUNqRkssTUFBTSxFQUFFUixJQUFJLFFBQVFDLE1BQU0sUUFBUUMsTUFBTSx1QkFBQyxrQkFBRDtBQUFBO0FBQUE7QUFBQTtBQUFBLFNBQWEsR0FBS0MsTUFBTSx1QkFBdUI7QUFDM0Y7QUFFQSx3QkFBd0JNLFNBQVM7QUFBQUMsTUFBQTtBQUU3QixRQUFNQyxXQUFXQyxPQUFPQyxjQUFjO0FBQ3RDLFFBQU0sQ0FBQ0MsUUFBUUMsU0FBUyxJQUFJdEYsU0FBUyxLQUFLO0FBRzFDLFFBQU0sQ0FBQ3VGLE1BQU1DLE9BQU8sSUFBSXhGLFNBQVMsRUFBRXlGLE9BQU8sS0FBS0MsUUFBUSxJQUFJLENBQUM7QUFDNUQsUUFBTUMsVUFBVTFGLE9BQU8sRUFBRTJGLEdBQUcsR0FBR0MsR0FBRyxHQUFHQyxHQUFHLEdBQUdDLEdBQUcsRUFBRSxDQUFDO0FBRWpELFFBQU0sQ0FBQ0MsVUFBVUMsV0FBVyxJQUFJakcsU0FBUyxFQUFFO0FBQzNDLFFBQU0sQ0FBQ2tHLE9BQU9DLFFBQVEsSUFBSW5HLFNBQVMsRUFBRTtBQUNyQyxRQUFNLENBQUNvRyxTQUFTQyxVQUFVLElBQUlyRyxTQUFTLEtBQUs7QUFDNUMsUUFBTSxDQUFDc0csT0FBT0MsUUFBUSxJQUFJdkcsU0FBUyxJQUFJO0FBQ3ZDLFFBQU13RyxZQUFZdkcsT0FBTyxJQUFJO0FBQzdCLFFBQU13RyxXQUFXeEcsT0FBTyxJQUFJO0FBRzVCLFFBQU0sQ0FBQ3lHLFlBQVlDLGFBQWEsSUFBSTNHLFNBQVMsSUFBSTtBQUNqRCxRQUFNLENBQUM0RyxVQUFVQyxXQUFXLElBQUk3RyxTQUFTLENBQUMsQ0FBQztBQUMzQyxRQUFNLENBQUM4RyxZQUFZQyxhQUFhLElBQUkvRyxTQUFTLElBQUk7QUFHakRFLFlBQVUsTUFBTTtBQUNaLFFBQUltRixRQUFRO0FBQ1JtQixnQkFBVVEsU0FBU0MsZUFBZSxFQUFFQyxVQUFVLFNBQVMsQ0FBQztBQUFBLElBQzVEO0FBQUEsRUFDSixHQUFHLENBQUNsQixVQUFVSSxTQUFTTSxZQUFZckIsTUFBTSxDQUFDO0FBRTFDLFFBQU04QixjQUFjLE9BQU83RixNQUFNOEYsYUFBYSxVQUFVO0FBQ3BELFVBQU1DLFlBQVkvRixRQUFRNEUsT0FBT3RELEtBQUs7QUFDdEMsUUFBSSxDQUFDeUUsWUFBWWpCLFFBQVM7QUFFMUJELGFBQVMsRUFBRTtBQUNYSSxhQUFTLElBQUk7QUFFYixVQUFNZSxTQUFTLEVBQUVoRSxNQUFNLFFBQVFPLFNBQVN3RCxVQUFVdEQsV0FBV0MsS0FBS0MsSUFBSSxFQUFFO0FBQ3hFLFFBQUksQ0FBQ21ELFlBQVk7QUFDYm5CLGtCQUFZLENBQUFzQixTQUFRLENBQUMsR0FBR0EsTUFBTUQsTUFBTSxDQUFDO0FBQUEsSUFDekM7QUFDQWpCLGVBQVcsSUFBSTtBQUNmTSxrQkFBYyxJQUFJO0FBRWxCLFFBQUk7QUFDQSxZQUFNYSxjQUFjeEIsU0FBUzdELElBQUksQ0FBQXNGLE9BQU0sRUFBRW5FLE1BQU1tRSxFQUFFbkUsTUFBTU8sU0FBUzRELEVBQUU1RCxRQUFRLEVBQUU7QUFDNUUsWUFBTTZELE1BQU0sTUFBTXZHLElBQUl3RyxLQUFLLFdBQVcsRUFBRUMsU0FBU1AsVUFBVVEsU0FBU0wsWUFBWSxDQUFDO0FBRWpGLFlBQU1NLFFBQVEsRUFBRXhFLE1BQU0sYUFBYU8sU0FBUzZELElBQUlLLEtBQUtDLE9BQU9qRSxXQUFXQyxLQUFLQyxJQUFJLEVBQUU7QUFDbEZnQyxrQkFBWSxDQUFBc0IsU0FBUSxDQUFDLEdBQUdBLE1BQU1PLEtBQUssQ0FBQztBQUFBLElBQ3hDLFNBQVNHLEtBQUs7QUFDVjFCLGVBQVMsMkNBQTJDO0FBQ3BELFVBQUksQ0FBQ2EsWUFBWTtBQUNibkIsb0JBQVksQ0FBQXNCLFNBQVFBLEtBQUsvRSxNQUFNLEdBQUcsRUFBRSxDQUFDO0FBQUEsTUFDekM7QUFBQSxJQUNKLFVBQUM7QUFDRzZELGlCQUFXLEtBQUs7QUFDaEIsVUFBSSxDQUFDZSxXQUFZWCxVQUFTTyxTQUFTa0IsTUFBTTtBQUFBLElBQzdDO0FBQUEsRUFDSjtBQUVBLFFBQU1DLGdCQUFnQkEsQ0FBQ0MsTUFBTTtBQUN6QixRQUFJQSxFQUFFQyxRQUFRLFdBQVcsQ0FBQ0QsRUFBRUUsVUFBVTtBQUNsQ0YsUUFBRUcsZUFBZTtBQUNqQnBCLGtCQUFZO0FBQUEsSUFDaEI7QUFBQSxFQUNKO0FBRUEsUUFBTXFCLFlBQVlBLE1BQU07QUFDcEJ2QyxnQkFBWSxFQUFFO0FBQ2RNLGFBQVMsSUFBSTtBQUNiSSxrQkFBYyxJQUFJO0FBQ2xCRixhQUFTTyxTQUFTa0IsTUFBTTtBQUFBLEVBQzVCO0FBRUEsUUFBTU8saUJBQWlCQSxNQUFNO0FBQ3pCLFFBQUksQ0FBQzNCLFdBQVk7QUFDakIsVUFBTTNELE1BQU0sbUJBQW1CdUQsV0FBV2dDLFlBQVksQ0FBQztBQUFBLEVBQU01QixXQUFXNkIsT0FBTztBQUFBO0FBQy9FeEIsZ0JBQVloRSxHQUFHO0FBQUEsRUFDbkI7QUFFQSxRQUFNeUYsbUJBQW1CQSxDQUFDQyxPQUFPQyxRQUFRO0FBQ3JDLFVBQU1DLE1BQU1DLFdBQVdGLEdBQUcsS0FBSztBQUMvQixVQUFNRyxVQUFVLEVBQUUsR0FBR3JDLFVBQVUsQ0FBQ2lDLEtBQUssR0FBR0UsSUFBSTtBQUM1Q2xDLGdCQUFZb0MsT0FBTztBQUVuQixRQUFJdkIsTUFBTTtBQUNWLFFBQUloQixlQUFlLFNBQVN1QyxRQUFRQyxLQUFLRCxRQUFRRSxLQUFLRixRQUFRRyxHQUFHO0FBQzdELFlBQU1GLElBQUlELFFBQVFDLEdBQUdDLElBQUlGLFFBQVFFLElBQUksS0FBSyxLQUFLRSxJQUFJSixRQUFRRyxJQUFJO0FBQy9ELFlBQU05RSxNQUFPNEUsSUFBSUMsSUFBSUcsS0FBS0MsSUFBSSxJQUFJSixHQUFHRSxDQUFDLEtBQU1DLEtBQUtDLElBQUksSUFBSUosR0FBR0UsQ0FBQyxJQUFJO0FBQ2pFM0IsWUFBTSxFQUFFOEIsTUFBTWxGLEtBQUttRixRQUFRLGVBQWVDLE1BQU9wRixNQUFNK0UsSUFBS0gsR0FBR1MsUUFBUSxrQkFBa0JoQixTQUFTLFVBQVVPLENBQUM7QUFBQSxVQUFhRCxRQUFRRyxDQUFDLFNBQVNILFFBQVFFLENBQUM7QUFBQSxRQUFZRyxLQUFLTSxNQUFNdEYsR0FBRyxDQUFDLEdBQUc7QUFBQSxJQUN2TCxXQUFXb0MsZUFBZSxTQUFTdUMsUUFBUVksT0FBT1osUUFBUUUsS0FBS0YsUUFBUUcsR0FBRztBQUN0RSxZQUFNRixJQUFJRCxRQUFRWSxLQUFLVixJQUFJRixRQUFRRSxJQUFJLEtBQUssS0FBS0UsSUFBSUosUUFBUUcsSUFBSTtBQUNqRSxZQUFNVSxLQUFLWixNQUFNSSxLQUFLQyxJQUFJLElBQUlKLEdBQUdFLENBQUMsSUFBSSxLQUFLRixNQUFNLElBQUlBO0FBQ3JEekIsWUFBTSxFQUFFOEIsTUFBTU0sSUFBSUwsUUFBUSxtQkFBbUJDLE1BQU1JLEtBQU1aLElBQUlHLEdBQUlNLFFBQVEsaUJBQWlCaEIsU0FBUyxTQUFTTyxDQUFDO0FBQUEsWUFBa0JELFFBQVFHLENBQUMsU0FBU0gsUUFBUUUsQ0FBQztBQUFBLGlCQUFxQkcsS0FBS00sTUFBTUUsRUFBRSxDQUFDLEdBQUc7QUFBQSxJQUNwTSxXQUFXcEQsZUFBZSxRQUFRdUMsUUFBUUMsS0FBS0QsUUFBUUUsS0FBS0YsUUFBUUcsR0FBRztBQUNuRSxZQUFNRixJQUFJRCxRQUFRQyxHQUFHQyxJQUFJRixRQUFRRSxJQUFJLEtBQUtDLElBQUlILFFBQVFHO0FBQ3RELFlBQU1VLEtBQUtaLElBQUlJLEtBQUtDLElBQUksSUFBS0osSUFBSSxHQUFJLElBQUlDLENBQUM7QUFDMUMxQixZQUFNLEVBQUU4QixNQUFNTSxJQUFJTCxRQUFRLG1CQUFtQkMsTUFBTUksS0FBS1osR0FBR1MsUUFBUSxtQkFBbUJoQixTQUFTLFFBQVFPLENBQUM7QUFBQSxZQUFlRSxDQUFDLFNBQVNILFFBQVFFLENBQUM7QUFBQSxhQUFpQkcsS0FBS00sTUFBTUUsRUFBRSxDQUFDLEdBQUc7QUFBQSxJQUNoTCxXQUFXcEQsZUFBZSxVQUFVdUMsUUFBUWMsVUFBVWQsUUFBUUcsS0FBS0gsUUFBUUUsR0FBRztBQUMxRSxZQUFNVyxLQUFLYixRQUFRYyxRQUFRWixJQUFJRixRQUFRRSxJQUFJLEtBQUssS0FBS0UsSUFBSUosUUFBUUcsSUFBSTtBQUNyRSxZQUFNekUsTUFBT21GLEtBQUtYLE1BQU9HLEtBQUtDLElBQUksSUFBSUosR0FBR0UsQ0FBQyxJQUFJLE1BQU0sSUFBSUY7QUFDeER6QixZQUFNLEVBQUU4QixNQUFNRixLQUFLVSxLQUFLckYsR0FBRyxHQUFHOEUsUUFBUSx3QkFBd0JDLE1BQU1ULFFBQVFjLFFBQVFKLFFBQVEsaUJBQWlCaEIsU0FBUyxVQUFVTSxRQUFRYyxNQUFNLE9BQU9kLFFBQVFHLENBQUMsVUFBVUgsUUFBUUUsQ0FBQztBQUFBLGdCQUFvQkcsS0FBS1UsS0FBS3JGLEdBQUcsQ0FBQyxHQUFHO0FBQUEsSUFDMU4sV0FBVytCLGVBQWUsU0FBU3VDLFFBQVFnQixRQUFRO0FBQy9DLFVBQUlBLFNBQVNoQixRQUFRZ0IsUUFBUW5GLE1BQU07QUFDbkMsVUFBSW1GLFNBQVMsS0FBUTtBQUNqQixZQUFJQSxTQUFTLElBQVFuRixRQUFPd0UsS0FBS1ksSUFBSUQsU0FBUyxLQUFRLEdBQU0sSUFBSTtBQUNoRSxZQUFJQSxTQUFTLElBQVFuRixRQUFPd0UsS0FBS1ksSUFBSUQsU0FBUyxLQUFRLEdBQU0sSUFBSTtBQUNoRSxZQUFJQSxTQUFTLElBQVFuRixRQUFPd0UsS0FBS1ksSUFBSUQsU0FBUyxLQUFRLEdBQU0sSUFBSTtBQUNoRSxZQUFJQSxTQUFTLEtBQVNuRixRQUFPd0UsS0FBS1ksSUFBSUQsU0FBUyxNQUFTLEdBQU0sSUFBSTtBQUNsRSxZQUFJQSxTQUFTLEtBQVNuRixTQUFRbUYsU0FBUyxRQUFXO0FBQ2xEbkYsZUFBT0EsTUFBTTtBQUFBLE1BQ2pCO0FBQ0E0QyxZQUFNLEVBQUU4QixNQUFNMUUsS0FBSzJFLFFBQVEsaUJBQWlCQyxNQUFNTyxTQUFTbkYsS0FBSzZFLFFBQVEsY0FBY2hCLFNBQVMsWUFBWXNCLE1BQU07QUFBQSxxQkFBd0JYLEtBQUtNLE1BQU05RSxHQUFHLENBQUMsR0FBRztBQUFBLElBQy9KO0FBQ0FpQyxrQkFBY1csR0FBRztBQUFBLEVBQ3JCO0FBRUEsUUFBTXlDLGFBQWFBLENBQUM1RixPQUFPO0FBQ3ZCLFFBQUltQyxlQUFlbkMsSUFBSTtBQUNuQm9DLG9CQUFjLElBQUk7QUFBQSxJQUN0QixPQUFPO0FBQ0hBLG9CQUFjcEMsRUFBRTtBQUNoQnNDLGtCQUFZLENBQUMsQ0FBQztBQUNkRSxvQkFBYyxJQUFJO0FBQ2xCakQsaUJBQVcsTUFBTTBDLFVBQVVRLFNBQVNDLGVBQWUsRUFBRUMsVUFBVSxTQUFTLENBQUMsR0FBRyxHQUFHO0FBQUEsSUFDbkY7QUFBQSxFQUNKO0FBR0EsUUFBTWtELGtCQUFrQkEsQ0FBQ2hDLE1BQU07QUFDM0JBLE1BQUVHLGVBQWU7QUFDakI1QyxZQUFRcUIsVUFBVSxFQUFFcEIsR0FBR3dDLEVBQUVpQyxTQUFTeEUsR0FBR3VDLEVBQUVrQyxTQUFTeEUsR0FBR1AsS0FBS0UsT0FBT00sR0FBR1IsS0FBS0csT0FBTztBQUM5RTZFLGFBQVNDLGlCQUFpQixhQUFhQyxlQUFlO0FBQ3RERixhQUFTQyxpQkFBaUIsV0FBV0UsYUFBYTtBQUFBLEVBQ3REO0FBRUEsUUFBTUQsa0JBQWtCQSxDQUFDckMsTUFBTTtBQUUzQixVQUFNdUMsS0FBS3ZDLEVBQUVpQyxVQUFVMUUsUUFBUXFCLFFBQVFwQjtBQUN2QyxVQUFNZ0YsS0FBS3hDLEVBQUVrQyxVQUFVM0UsUUFBUXFCLFFBQVFuQjtBQUV2Q0wsWUFBUTtBQUFBLE1BQ0pDLE9BQU82RCxLQUFLdUIsSUFBSSxLQUFLdkIsS0FBS1ksSUFBSXZFLFFBQVFxQixRQUFRbEIsSUFBSTZFLElBQUl4RixPQUFPQyxhQUFhLEVBQUUsQ0FBQztBQUFBLE1BQzdFTSxRQUFRNEQsS0FBS3VCLElBQUksS0FBS3ZCLEtBQUtZLElBQUl2RSxRQUFRcUIsUUFBUWpCLElBQUk2RSxJQUFJekYsT0FBTzJGLGNBQWMsRUFBRSxDQUFDO0FBQUEsSUFDbkYsQ0FBQztBQUFBLEVBQ0w7QUFFQSxRQUFNSixnQkFBZ0JBLE1BQU07QUFDeEJILGFBQVNRLG9CQUFvQixhQUFhTixlQUFlO0FBQ3pERixhQUFTUSxvQkFBb0IsV0FBV0wsYUFBYTtBQUFBLEVBQ3pEO0FBRUEsUUFBTU0sVUFBVWhGLFNBQVNuRSxXQUFXO0FBRXBDLFNBQ0ksdUJBQUMsU0FBSSxXQUFVLHdCQUdWO0FBQUEsS0FBQ3dELFVBQ0UsdUJBQUMsWUFBTyxXQUFVLGlCQUFnQixTQUFTLE1BQU1DLFVBQVUsSUFBSSxHQUFHLE9BQU0sVUFDcEUsaUNBQUMsU0FBTSxNQUFNLE1BQWI7QUFBQTtBQUFBO0FBQUE7QUFBQSxXQUFnQixLQURwQjtBQUFBO0FBQUE7QUFBQTtBQUFBLFdBRUE7QUFBQSxJQUlKO0FBQUEsTUFBQztBQUFBO0FBQUEsUUFDRyxXQUFXLGNBQWNELFNBQVMsU0FBUyxFQUFFO0FBQUEsUUFDN0MsT0FBT0gsV0FBVyxDQUFDLElBQUksRUFBRU8sT0FBTyxHQUFHRixLQUFLRSxLQUFLLE1BQU1DLFFBQVEsR0FBR0gsS0FBS0csTUFBTSxLQUFLO0FBQUEsUUFHOUU7QUFBQSxpQ0FBQyxTQUFJLFdBQVUsZUFBYyxhQUFhMEUsaUJBQWlCLE9BQU0sb0JBQWpFO0FBQUE7QUFBQTtBQUFBO0FBQUEsaUJBQWlGO0FBQUEsVUFHakYsdUJBQUMsU0FBSSxXQUFVLGNBQWEsU0FBUyxNQUFNOUUsVUFBVSxLQUFLLEdBQ3REO0FBQUEsbUNBQUMsU0FBSSxXQUFVLG9CQUNYO0FBQUEscUNBQUMsU0FBSSxXQUFVLHFCQUNYLGlDQUFDLFNBQU0sTUFBTSxNQUFiO0FBQUE7QUFBQTtBQUFBO0FBQUEscUJBQWdCLEtBRHBCO0FBQUE7QUFBQTtBQUFBO0FBQUEscUJBRUE7QUFBQSxjQUNBLHVCQUFDLFVBQUssNEJBQU47QUFBQTtBQUFBO0FBQUE7QUFBQSxxQkFBa0I7QUFBQSxpQkFKdEI7QUFBQTtBQUFBO0FBQUE7QUFBQSxtQkFLQTtBQUFBLFlBQ0EsdUJBQUMsU0FBSSxXQUFVLHNCQUNYLGlDQUFDLFlBQU8sV0FBVSxrQkFBaUIsU0FBUyxDQUFDOEMsTUFBTTtBQUFFQSxnQkFBRTZDLGdCQUFnQjtBQUFHM0Ysd0JBQVUsS0FBSztBQUFBLFlBQUcsR0FDeEYsaUNBQUMsaUJBQWMsTUFBTSxNQUFyQjtBQUFBO0FBQUE7QUFBQTtBQUFBLG1CQUF3QixLQUQ1QjtBQUFBO0FBQUE7QUFBQTtBQUFBLG1CQUVBLEtBSEo7QUFBQTtBQUFBO0FBQUE7QUFBQSxtQkFJQTtBQUFBLGVBWEo7QUFBQTtBQUFBO0FBQUE7QUFBQSxpQkFZQTtBQUFBLFVBRUEsdUJBQUMsU0FBSSxXQUFVLFlBRVYwRjtBQUFBQSx1QkFDRyx1QkFBQyxTQUFJLFdBQVUsYUFDWDtBQUFBLHFDQUFDLFNBQUksV0FBVSxrQkFBaUIsaUNBQUMsV0FBRDtBQUFBO0FBQUE7QUFBQTtBQUFBLHFCQUFNLEtBQXRDO0FBQUE7QUFBQTtBQUFBO0FBQUEscUJBQXlDO0FBQUEsY0FDekMsdUJBQUMsUUFBRyxXQUFVLG1CQUFrQix1Q0FBaEM7QUFBQTtBQUFBO0FBQUE7QUFBQSxxQkFBdUQ7QUFBQSxjQUN2RCx1QkFBQyxPQUFFLFdBQVUsaUJBQWdCLHNFQUE3QjtBQUFBO0FBQUE7QUFBQTtBQUFBLHFCQUVBO0FBQUEsY0FDQSx1QkFBQyxTQUFJLFdBQVUsbUJBQ1Y1SixzQkFBWWU7QUFBQUEsZ0JBQUksQ0FBQytJLEdBQUc3SSxNQUNqQix1QkFBQyxZQUFlLFdBQVUsc0JBQXFCLFNBQVMsTUFBTThFLFlBQVkrRCxDQUFDLEdBQ3ZFO0FBQUEseUNBQUMsU0FBTSxNQUFNLElBQUksV0FBVSxtQkFBM0I7QUFBQTtBQUFBO0FBQUE7QUFBQSx5QkFBMEM7QUFBQSxrQkFBRztBQUFBLGtCQUFFQTtBQUFBQSxxQkFEdEM3SSxHQUFiO0FBQUE7QUFBQTtBQUFBO0FBQUEsdUJBRUE7QUFBQSxjQUNILEtBTEw7QUFBQTtBQUFBO0FBQUE7QUFBQSxxQkFNQTtBQUFBLGlCQVpKO0FBQUE7QUFBQTtBQUFBO0FBQUEsbUJBYUE7QUFBQSxZQUlILENBQUMySSxXQUNFLHVCQUFDLFNBQUksV0FBVSxnQkFDVmhGO0FBQUFBLHVCQUFTN0Q7QUFBQUEsZ0JBQUksQ0FBQ2dCLEtBQUtkLE1BQ2hCLHVCQUFDLFNBQVksV0FBVSxnQkFDbkIsaUNBQUMsV0FBUSxPQUFUO0FBQUE7QUFBQTtBQUFBO0FBQUEsdUJBQWtCLEtBRFpBLEdBQVY7QUFBQTtBQUFBO0FBQUE7QUFBQSx1QkFFQTtBQUFBLGNBQ0g7QUFBQSxjQUVBK0QsV0FDRyx1QkFBQyxTQUFJLFdBQVUsdUNBQ1g7QUFBQSx1Q0FBQyxTQUFJLFdBQVUsNEJBQTJCLGlDQUFDLFNBQU0sTUFBTSxNQUFiO0FBQUE7QUFBQTtBQUFBO0FBQUEsdUJBQWdCLEtBQTFEO0FBQUE7QUFBQTtBQUFBO0FBQUEsdUJBQTZEO0FBQUEsZ0JBQzdELHVCQUFDLFNBQUksV0FBVSxxQ0FDWCxpQ0FBQyxTQUFJLFdBQVUsOENBQ1gsaUNBQUMsZ0JBQUQ7QUFBQTtBQUFBO0FBQUE7QUFBQSx1QkFBVyxLQURmO0FBQUE7QUFBQTtBQUFBO0FBQUEsdUJBRUEsS0FISjtBQUFBO0FBQUE7QUFBQTtBQUFBLHVCQUlBO0FBQUEsbUJBTko7QUFBQTtBQUFBO0FBQUE7QUFBQSxxQkFPQTtBQUFBLGNBR0hFLFNBQ0csdUJBQUMsU0FBSSxXQUFVLGFBQWFBLG1CQUE1QjtBQUFBO0FBQUE7QUFBQTtBQUFBLHFCQUFrQztBQUFBLGNBSXRDLHVCQUFDLFNBQUksT0FBTyxFQUFFWixRQUFRZ0IsYUFBYSxVQUFVLFFBQVF5RSxZQUFZLG1CQUFtQixLQUFwRjtBQUFBO0FBQUE7QUFBQTtBQUFBLHFCQUFzRjtBQUFBLGNBQ3RGLHVCQUFDLFNBQUksS0FBSzNFLGFBQVY7QUFBQTtBQUFBO0FBQUE7QUFBQSxxQkFBb0I7QUFBQSxpQkF4QnhCO0FBQUE7QUFBQTtBQUFBO0FBQUEsbUJBeUJBO0FBQUEsZUE5Q1I7QUFBQTtBQUFBO0FBQUE7QUFBQSxpQkFnREE7QUFBQSxVQUdBLHVCQUFDLFNBQUksV0FBVSxtQkFFWDtBQUFBLG1DQUFDLFNBQUksV0FBVSxpQkFDVjRFLGlCQUFPQyxPQUFPaEgsV0FBVyxFQUFFbEM7QUFBQUEsY0FBSSxDQUFBbUosU0FDNUI7QUFBQSxnQkFBQztBQUFBO0FBQUEsa0JBRUcsV0FBVyxnQkFBZ0I1RSxlQUFlNEUsS0FBSy9HLEtBQUssV0FBVyxFQUFFO0FBQUEsa0JBQ2pFLFNBQVMsTUFBTTRGLFdBQVdtQixLQUFLL0csRUFBRTtBQUFBLGtCQUVoQytHO0FBQUFBLHlCQUFLN0c7QUFBQUEsb0JBQUs7QUFBQSxvQkFBQyx1QkFBQyxVQUFNNkcsZUFBSzlHLFFBQVo7QUFBQTtBQUFBO0FBQUE7QUFBQSwyQkFBaUI7QUFBQTtBQUFBO0FBQUEsZ0JBSnhCOEcsS0FBSy9HO0FBQUFBLGdCQURkO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsY0FNQTtBQUFBLFlBQ0gsS0FUTDtBQUFBO0FBQUE7QUFBQTtBQUFBLG1CQVVBO0FBQUEsWUFHQ21DLGNBQ0csdUJBQUMsU0FBSSxXQUFVLGtCQUNYO0FBQUEscUNBQUMsU0FBSSxXQUFVLG1CQUNYO0FBQUEsdUNBQUMsUUFBSXJDO0FBQUFBLDhCQUFZcUMsVUFBVSxFQUFFakM7QUFBQUEsa0JBQUs7QUFBQSxrQkFBRUosWUFBWXFDLFVBQVUsRUFBRWxDO0FBQUFBLHFCQUE1RDtBQUFBO0FBQUE7QUFBQTtBQUFBLHVCQUFpRTtBQUFBLGdCQUNqRSx1QkFBQyxZQUFPLFdBQVUsaUJBQWdCLFNBQVMsTUFBTW1DLGNBQWMsSUFBSSxHQUFHLGlDQUFDLE9BQUksTUFBTSxNQUFYO0FBQUE7QUFBQTtBQUFBO0FBQUEsdUJBQWMsS0FBcEY7QUFBQTtBQUFBO0FBQUE7QUFBQSx1QkFBdUY7QUFBQSxtQkFGM0Y7QUFBQTtBQUFBO0FBQUE7QUFBQSxxQkFHQTtBQUFBLGNBRUEsdUJBQUMsU0FBSSxXQUFVLGlCQUNYO0FBQUEsdUNBQUMsU0FBSSxXQUFVLG1CQUNURDtBQUFBQSxrQ0FBZSxTQUFTQSxlQUFlLFNBQ3JDLHVCQUFDLFNBQUksV0FBVSxtQkFDWDtBQUFBLDJDQUFDLFdBQU0sNkJBQVA7QUFBQTtBQUFBO0FBQUE7QUFBQSwyQkFBb0I7QUFBQSxvQkFDcEIsdUJBQUMsV0FBTSxNQUFLLFVBQVMsYUFBWSxjQUFhLE9BQU9FLFNBQVNzQyxLQUFLLElBQUksVUFBVSxDQUFBZCxNQUFLUSxpQkFBaUIsS0FBS1IsRUFBRTJCLE9BQU93QixLQUFLLEtBQTFIO0FBQUE7QUFBQTtBQUFBO0FBQUEsMkJBQTRIO0FBQUEsdUJBRmhJO0FBQUE7QUFBQTtBQUFBO0FBQUEseUJBR0E7QUFBQSxrQkFFSDdFLGVBQWUsU0FDWix1QkFBQyxTQUFJLFdBQVUsbUJBQ1g7QUFBQSwyQ0FBQyxXQUFNLDJCQUFQO0FBQUE7QUFBQTtBQUFBO0FBQUEsMkJBQWtCO0FBQUEsb0JBQ2xCLHVCQUFDLFdBQU0sTUFBSyxVQUFTLGFBQVksWUFBVyxPQUFPRSxTQUFTaUQsT0FBTyxJQUFJLFVBQVUsQ0FBQXpCLE1BQUtRLGlCQUFpQixPQUFPUixFQUFFMkIsT0FBT3dCLEtBQUssS0FBNUg7QUFBQTtBQUFBO0FBQUE7QUFBQSwyQkFBOEg7QUFBQSx1QkFGbEk7QUFBQTtBQUFBO0FBQUE7QUFBQSx5QkFHQTtBQUFBLGtCQUVIN0UsZUFBZSxVQUNaLHVCQUFDLFNBQUksV0FBVSxtQkFDWDtBQUFBLDJDQUFDLFdBQU0sMEJBQVA7QUFBQTtBQUFBO0FBQUE7QUFBQSwyQkFBaUI7QUFBQSxvQkFDakIsdUJBQUMsV0FBTSxNQUFLLFVBQVMsYUFBWSxlQUFjLE9BQU9FLFNBQVNtRCxVQUFVLElBQUksVUFBVSxDQUFBM0IsTUFBS1EsaUJBQWlCLFVBQVVSLEVBQUUyQixPQUFPd0IsS0FBSyxLQUFySTtBQUFBO0FBQUE7QUFBQTtBQUFBLDJCQUF1STtBQUFBLHVCQUYzSTtBQUFBO0FBQUE7QUFBQTtBQUFBLHlCQUdBO0FBQUEsa0JBRUg3RSxlQUFlLFNBQ1osdUJBQUMsU0FBSSxXQUFVLG1CQUNYO0FBQUEsMkNBQUMsV0FBTSwwQkFBUDtBQUFBO0FBQUE7QUFBQTtBQUFBLDJCQUFpQjtBQUFBLG9CQUNqQix1QkFBQyxXQUFNLE1BQUssVUFBUyxhQUFZLGVBQWMsT0FBT0UsU0FBU3FELFVBQVUsSUFBSSxVQUFVLENBQUE3QixNQUFLUSxpQkFBaUIsVUFBVVIsRUFBRTJCLE9BQU93QixLQUFLLEtBQXJJO0FBQUE7QUFBQTtBQUFBO0FBQUEsMkJBQXVJO0FBQUEsdUJBRjNJO0FBQUE7QUFBQTtBQUFBO0FBQUEseUJBR0E7QUFBQSxrQkFFSDdFLGVBQWUsU0FDWixtQ0FDSTtBQUFBLDJDQUFDLFNBQUksV0FBVSxtQkFDWDtBQUFBLDZDQUFDLFdBQU0sd0JBQVA7QUFBQTtBQUFBO0FBQUE7QUFBQSw2QkFBZTtBQUFBLHNCQUNmLHVCQUFDLFdBQU0sTUFBSyxVQUFTLGFBQVksVUFBUyxPQUFPRSxTQUFTdUMsS0FBSyxJQUFJLFVBQVUsQ0FBQWYsTUFBS1EsaUJBQWlCLEtBQUtSLEVBQUUyQixPQUFPd0IsS0FBSyxLQUF0SDtBQUFBO0FBQUE7QUFBQTtBQUFBLDZCQUF3SDtBQUFBLHlCQUY1SDtBQUFBO0FBQUE7QUFBQTtBQUFBLDJCQUdBO0FBQUEsb0JBQ0EsdUJBQUMsU0FBSSxXQUFVLG1CQUNYO0FBQUEsNkNBQUMsV0FBTSxxQkFBUDtBQUFBO0FBQUE7QUFBQTtBQUFBLDZCQUFZO0FBQUEsc0JBQ1osdUJBQUMsV0FBTSxNQUFLLFVBQVMsYUFBWSxTQUFRLE9BQU8zRSxTQUFTd0MsS0FBSyxJQUFJLFVBQVUsQ0FBQWhCLE1BQUtRLGlCQUFpQixLQUFLUixFQUFFMkIsT0FBT3dCLEtBQUssS0FBckg7QUFBQTtBQUFBO0FBQUE7QUFBQSw2QkFBdUg7QUFBQSx5QkFGM0g7QUFBQTtBQUFBO0FBQUE7QUFBQSwyQkFHQTtBQUFBLHVCQVJKO0FBQUE7QUFBQTtBQUFBO0FBQUEseUJBU0E7QUFBQSxxQkFuQ1I7QUFBQTtBQUFBO0FBQUE7QUFBQSx1QkFxQ0E7QUFBQSxnQkFFQSx1QkFBQyxTQUFJLFdBQVUsb0JBQ1Z6RSx1QkFDRyxtQ0FDSTtBQUFBLHlDQUFDLFNBQUksV0FBVSxtQkFDWDtBQUFBLDJDQUFDLFVBQU1BLHFCQUFXMkMsVUFBbEI7QUFBQTtBQUFBO0FBQUE7QUFBQSwyQkFBeUI7QUFBQSxvQkFDekIsdUJBQUMsUUFBRztBQUFBO0FBQUEsc0JBQUVILEtBQUtNLE1BQU05QyxXQUFXMEMsSUFBSSxFQUFFZ0MsZUFBZSxPQUFPO0FBQUEseUJBQXhEO0FBQUE7QUFBQTtBQUFBO0FBQUEsMkJBQTBEO0FBQUEsdUJBRjlEO0FBQUE7QUFBQTtBQUFBO0FBQUEseUJBR0E7QUFBQSxrQkFDQSx1QkFBQyxZQUFPLFdBQVUscUJBQW9CLFNBQVMvQyxnQkFBZ0I7QUFBQTtBQUFBLG9CQUNwRCx1QkFBQyxvQkFBRDtBQUFBO0FBQUE7QUFBQTtBQUFBLDJCQUFlO0FBQUEsdUJBRDFCO0FBQUE7QUFBQTtBQUFBO0FBQUEseUJBRUE7QUFBQSxxQkFQSjtBQUFBO0FBQUE7QUFBQTtBQUFBLHVCQVFBLElBRUEsdUJBQUMsU0FBSSxXQUFVLG9CQUFtQiwwQ0FBbEM7QUFBQTtBQUFBO0FBQUE7QUFBQSx1QkFBNEQsS0FacEU7QUFBQTtBQUFBO0FBQUE7QUFBQSx1QkFjQTtBQUFBLG1CQXRESjtBQUFBO0FBQUE7QUFBQTtBQUFBLHFCQXVEQTtBQUFBLGlCQTdESjtBQUFBO0FBQUE7QUFBQTtBQUFBLG1CQThEQTtBQUFBLFlBSUosdUJBQUMsU0FBSSxXQUFVLGlCQUNWO0FBQUEsZUFBQ3VDLFdBQ0UsdUJBQUMsWUFBTyxXQUFVLGlCQUFnQixTQUFTeEMsV0FBVyxPQUFNLHNCQUN4RCxpQ0FBQyxlQUFZLE1BQU0sTUFBbkI7QUFBQTtBQUFBO0FBQUE7QUFBQSxxQkFBc0IsS0FEMUI7QUFBQTtBQUFBO0FBQUE7QUFBQSxxQkFFQTtBQUFBLGNBRUo7QUFBQSxnQkFBQztBQUFBO0FBQUEsa0JBQ0csS0FBSy9CO0FBQUFBLGtCQUNMLFdBQVU7QUFBQSxrQkFDVixNQUFLO0FBQUEsa0JBQ0wsYUFBWTtBQUFBLGtCQUNaLE9BQU9QO0FBQUFBLGtCQUNQLFVBQVUsQ0FBQWtDLE1BQUtqQyxTQUFTaUMsRUFBRTJCLE9BQU93QixLQUFLO0FBQUEsa0JBQ3RDLFdBQVdwRDtBQUFBQSxrQkFDWCxVQUFVL0I7QUFBQUE7QUFBQUEsZ0JBUmQ7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLGNBUXNCO0FBQUEsY0FFdEIsdUJBQUMsWUFBTyxXQUFVLGdCQUFlLFNBQVMsTUFBTWUsWUFBWSxHQUFHLFVBQVUsQ0FBQ2pCLE1BQU10RCxLQUFLLEtBQUt3RCxTQUN0RixpQ0FBQyxVQUFPLE1BQU0sTUFBZDtBQUFBO0FBQUE7QUFBQTtBQUFBLHFCQUFpQixLQURyQjtBQUFBO0FBQUE7QUFBQTtBQUFBLHFCQUVBO0FBQUEsaUJBbEJKO0FBQUE7QUFBQTtBQUFBO0FBQUEsbUJBbUJBO0FBQUEsZUFyR0o7QUFBQTtBQUFBO0FBQUE7QUFBQSxpQkFzR0E7QUFBQTtBQUFBO0FBQUEsTUEvS0o7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLElBZ0xBO0FBQUEsT0ExTEo7QUFBQTtBQUFBO0FBQUE7QUFBQSxTQTJMQTtBQUVSO0FBQUNuQixJQXZWdUJELFFBQU07QUFBQSxNQUFOQTtBQUFNLElBQUEvQixJQUFBd0ksS0FBQUM7QUFBQSxhQUFBekksSUFBQTtBQUFBLGFBQUF3SSxLQUFBO0FBQUEsYUFBQUMsS0FBQSIsIm5hbWVzIjpbInVzZVN0YXRlIiwidXNlUmVmIiwidXNlRWZmZWN0IiwiRmlTZW5kIiwiRmlDcHUiLCJGaVgiLCJGaVphcCIsIkZpQ2hldnJvblJpZ2h0IiwiRmlSZWZyZXNoQ3ciLCJGaUNvcHkiLCJGaUNoZWNrIiwiRmlDaGV2cm9uVXAiLCJGaUNoZXZyb25Eb3duIiwiQmlNYXRoIiwiQmlUcmVuZGluZ1VwIiwiQmlIb21lQWx0IiwiQmlDb2luIiwiQmlSZWNlaXB0IiwiQmlUYXJnZXRMb2NrIiwiYXBpIiwiU1VHR0VTVElPTlMiLCJwYXJzZU1hcmtkb3duIiwidGV4dCIsImxpbmVzIiwic3BsaXQiLCJlbGVtZW50cyIsImluTGlzdCIsImxpc3RJdGVtcyIsImZsdXNoTGlzdCIsImxlbmd0aCIsInB1c2giLCJwYXJzZUlubGluZSIsInN0ciIsImxpbmVJbmRleCIsInBhcnRzIiwibWFwIiwicGFydCIsImkiLCJzdGFydHNXaXRoIiwiZW5kc1dpdGgiLCJzbGljZSIsImZvckVhY2giLCJsaW5lIiwidHJpbW1lZCIsInRyaW0iLCJzdWJzdHJpbmciLCJ0ZXN0IiwicmVwbGFjZSIsIlR5cGluZ0RvdHMiLCJfYyIsIk1lc3NhZ2UiLCJtc2ciLCJfcyIsImlzVXNlciIsInJvbGUiLCJjb3BpZWQiLCJzZXRDb3BpZWQiLCJoYW5kbGVDb3B5IiwibmF2aWdhdG9yIiwiY2xpcGJvYXJkIiwid3JpdGVUZXh0IiwiY29udGVudCIsInNldFRpbWVvdXQiLCJ0aW1lc3RhbXAiLCJEYXRlIiwibm93IiwidG9Mb2NhbGVUaW1lU3RyaW5nIiwiaG91ciIsIm1pbnV0ZSIsIkNBTENVTEFUT1JTIiwiZW1pIiwiaWQiLCJuYW1lIiwiaWNvbiIsImRlc2MiLCJzaXAiLCJmZCIsImNpIiwidGF4IiwiZ29hbCIsIkFJQ2hhdCIsIl9zMiIsImlzTW9iaWxlIiwid2luZG93IiwiaW5uZXJXaWR0aCIsImlzT3BlbiIsInNldElzT3BlbiIsInNpemUiLCJzZXRTaXplIiwid2lkdGgiLCJoZWlnaHQiLCJkcmFnUmVmIiwieCIsInkiLCJ3IiwiaCIsIm1lc3NhZ2VzIiwic2V0TWVzc2FnZXMiLCJpbnB1dCIsInNldElucHV0IiwibG9hZGluZyIsInNldExvYWRpbmciLCJlcnJvciIsInNldEVycm9yIiwiYm90dG9tUmVmIiwiaW5wdXRSZWYiLCJhY3RpdmVDYWxjIiwic2V0QWN0aXZlQ2FsYyIsImNhbGNEYXRhIiwic2V0Q2FsY0RhdGEiLCJjYWxjUmVzdWx0Iiwic2V0Q2FsY1Jlc3VsdCIsImN1cnJlbnQiLCJzY3JvbGxJbnRvVmlldyIsImJlaGF2aW9yIiwic2VuZE1lc3NhZ2UiLCJoaWRlRnJvbVVJIiwidXNlclRleHQiLCJuZXdNc2ciLCJwcmV2IiwiaGlzdG9yeVRvQUkiLCJtIiwicmVzIiwicG9zdCIsIm1lc3NhZ2UiLCJoaXN0b3J5IiwiYWlNc2ciLCJkYXRhIiwicmVwbHkiLCJlcnIiLCJmb2N1cyIsImhhbmRsZUtleURvd24iLCJlIiwia2V5Iiwic2hpZnRLZXkiLCJwcmV2ZW50RGVmYXVsdCIsImNsZWFyQ2hhdCIsInNlbmRDYWxjVG9DaGF0IiwidG9VcHBlckNhc2UiLCJzdW1tYXJ5IiwiaGFuZGxlQ2FsY0NoYW5nZSIsImZpZWxkIiwidmFsIiwibnVtIiwicGFyc2VGbG9hdCIsIm5ld0RhdGEiLCJwIiwiciIsInQiLCJuIiwiTWF0aCIsInBvdyIsInZhbDEiLCJsYWJlbDEiLCJ2YWwyIiwibGFiZWwyIiwicm91bmQiLCJpbnYiLCJmdiIsInRhcmdldCIsImNlaWwiLCJpbmNvbWUiLCJtaW4iLCJ0b2dnbGVDYWxjIiwiaGFuZGxlTW91c2VEb3duIiwiY2xpZW50WCIsImNsaWVudFkiLCJkb2N1bWVudCIsImFkZEV2ZW50TGlzdGVuZXIiLCJoYW5kbGVNb3VzZU1vdmUiLCJoYW5kbGVNb3VzZVVwIiwiZHgiLCJkeSIsIm1heCIsImlubmVySGVpZ2h0IiwicmVtb3ZlRXZlbnRMaXN0ZW5lciIsImlzRW1wdHkiLCJzdG9wUHJvcGFnYXRpb24iLCJzIiwidHJhbnNpdGlvbiIsIk9iamVjdCIsInZhbHVlcyIsImNhbGMiLCJ2YWx1ZSIsInRvTG9jYWxlU3RyaW5nIiwiX2MyIiwiX2MzIl0sImlnbm9yZUxpc3QiOltdLCJzb3VyY2VzIjpbIkFJQ2hhdC5qc3giXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgdXNlU3RhdGUsIHVzZVJlZiwgdXNlRWZmZWN0IH0gZnJvbSAncmVhY3QnO1xyXG5pbXBvcnQgeyBGaVNlbmQsIEZpQ3B1LCBGaVgsIEZpWmFwLCBGaUNoZXZyb25SaWdodCwgRmlSZWZyZXNoQ3csIEZpQ29weSwgRmlDaGVjaywgRmlDaGV2cm9uVXAsIEZpQ2hldnJvbkRvd24gfSBmcm9tICdyZWFjdC1pY29ucy9maSc7XHJcbmltcG9ydCB7IEJpTWF0aCwgQmlUcmVuZGluZ1VwLCBCaUhvbWVBbHQsIEJpQ29pbiwgQmlSZWNlaXB0LCBCaVRhcmdldExvY2sgfSBmcm9tICdyZWFjdC1pY29ucy9iaSc7XHJcbmltcG9ydCBhcGkgZnJvbSAnLi4vLi4vc2VydmljZXMvYXBpJztcclxuaW1wb3J0ICcuL0FJQ2hhdF9zdHlsZXMuY3NzJztcclxuXHJcbmNvbnN0IFNVR0dFU1RJT05TID0gW1xyXG4gICAgXCJXaHkgZGlkIEkgb3ZlcnNwZW5kIHRoaXMgbW9udGg/XCIsXHJcbiAgICBcIkFtIEkgb24gdHJhY2sgZm9yIG15IHNhdmluZ3MgZ29hbHM/XCIsXHJcbiAgICBcIldoaWNoIGNhdGVnb3J5IHNob3VsZCBJIGN1dCBiYWNrIG9uP1wiLFxyXG4gICAgXCJIb3cgaXMgbXkgaW52ZXN0bWVudCBwb3J0Zm9saW8gcGVyZm9ybWluZz9cIixcclxuICAgIFwiV2hhdCdzIG15IG5ldCB3b3J0aD9cIixcclxuICAgIFwiR2l2ZSBtZSBhIHN1bW1hcnkgb2YgbXkgZmluYW5jZXMgdGhpcyBtb250aFwiLFxyXG5dO1xyXG5cclxuLy8gLS0tIFNpbXBsZSBNYXJrZG93biBQYXJzZXIgLS0tXHJcbmZ1bmN0aW9uIHBhcnNlTWFya2Rvd24odGV4dCkge1xyXG4gICAgaWYgKCF0ZXh0KSByZXR1cm4gbnVsbDtcclxuICAgIGxldCBsaW5lcyA9IHRleHQuc3BsaXQoJ1xcbicpO1xyXG4gICAgbGV0IGVsZW1lbnRzID0gW107XHJcbiAgICBsZXQgaW5MaXN0ID0gZmFsc2U7XHJcbiAgICBsZXQgbGlzdEl0ZW1zID0gW107XHJcblxyXG4gICAgY29uc3QgZmx1c2hMaXN0ID0gKCkgPT4ge1xyXG4gICAgICAgIGlmIChpbkxpc3QgJiYgbGlzdEl0ZW1zLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgZWxlbWVudHMucHVzaCg8dWwga2V5PXtgdWwtJHtlbGVtZW50cy5sZW5ndGh9YH0gY2xhc3NOYW1lPVwiYWljLWxpc3RcIj57Wy4uLmxpc3RJdGVtc119PC91bD4pO1xyXG4gICAgICAgICAgICBsaXN0SXRlbXMgPSBbXTtcclxuICAgICAgICAgICAgaW5MaXN0ID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICBjb25zdCBwYXJzZUlubGluZSA9IChzdHIsIGxpbmVJbmRleCkgPT4ge1xyXG4gICAgICAgIGNvbnN0IHBhcnRzID0gc3RyLnNwbGl0KC8oXFwqXFwqLio/XFwqXFwqKS9nKTtcclxuICAgICAgICByZXR1cm4gcGFydHMubWFwKChwYXJ0LCBpKSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChwYXJ0LnN0YXJ0c1dpdGgoJyoqJykgJiYgcGFydC5lbmRzV2l0aCgnKionKSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIDxzdHJvbmcga2V5PXtgJHtsaW5lSW5kZXh9LSR7aX1gfT57cGFydC5zbGljZSgyLCAtMil9PC9zdHJvbmc+O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiA8c3BhbiBrZXk9e2Ake2xpbmVJbmRleH0tJHtpfWB9PntwYXJ0fTwvc3Bhbj47XHJcbiAgICAgICAgfSk7XHJcbiAgICB9O1xyXG5cclxuICAgIGxpbmVzLmZvckVhY2goKGxpbmUsIGkpID0+IHtcclxuICAgICAgICBsZXQgdHJpbW1lZCA9IGxpbmUudHJpbSgpO1xyXG4gICAgICAgIGlmICh0cmltbWVkLnN0YXJ0c1dpdGgoJyMjIyAnKSkge1xyXG4gICAgICAgICAgICBmbHVzaExpc3QoKTtcclxuICAgICAgICAgICAgZWxlbWVudHMucHVzaCg8aDQga2V5PXtpfSBjbGFzc05hbWU9XCJhaWMtaGVhZGluZ1wiPntwYXJzZUlubGluZSh0cmltbWVkLnN1YnN0cmluZyg0KSwgaSl9PC9oND4pO1xyXG4gICAgICAgIH0gZWxzZSBpZiAodHJpbW1lZC5zdGFydHNXaXRoKCcjIyAnKSkge1xyXG4gICAgICAgICAgICBmbHVzaExpc3QoKTtcclxuICAgICAgICAgICAgZWxlbWVudHMucHVzaCg8aDMga2V5PXtpfSBjbGFzc05hbWU9XCJhaWMtaGVhZGluZ1wiPntwYXJzZUlubGluZSh0cmltbWVkLnN1YnN0cmluZygzKSwgaSl9PC9oMz4pO1xyXG4gICAgICAgIH0gZWxzZSBpZiAodHJpbW1lZC5zdGFydHNXaXRoKCcjICcpKSB7XHJcbiAgICAgICAgICAgIGZsdXNoTGlzdCgpO1xyXG4gICAgICAgICAgICBlbGVtZW50cy5wdXNoKDxoMiBrZXk9e2l9IGNsYXNzTmFtZT1cImFpYy1oZWFkaW5nXCI+e3BhcnNlSW5saW5lKHRyaW1tZWQuc3Vic3RyaW5nKDIpLCBpKX08L2gyPik7XHJcbiAgICAgICAgfSBlbHNlIGlmICh0cmltbWVkLnN0YXJ0c1dpdGgoJy0gJykgfHwgdHJpbW1lZC5zdGFydHNXaXRoKCcqICcpKSB7XHJcbiAgICAgICAgICAgIGluTGlzdCA9IHRydWU7XHJcbiAgICAgICAgICAgIGxpc3RJdGVtcy5wdXNoKDxsaSBrZXk9e2BsaS0ke2l9YH0+e3BhcnNlSW5saW5lKHRyaW1tZWQuc3Vic3RyaW5nKDIpLCBpKX08L2xpPik7XHJcbiAgICAgICAgfSBlbHNlIGlmICgvXlxcZCtcXC5cXHMvLnRlc3QodHJpbW1lZCkpIHtcclxuICAgICAgICAgICAgaW5MaXN0ID0gdHJ1ZTtcclxuICAgICAgICAgICAgbGlzdEl0ZW1zLnB1c2goPGxpIGtleT17YGxpLSR7aX1gfT57cGFyc2VJbmxpbmUodHJpbW1lZC5yZXBsYWNlKC9eXFxkK1xcLlxccy8sICcnKSwgaSl9PC9saT4pO1xyXG4gICAgICAgIH0gZWxzZSBpZiAodHJpbW1lZCA9PT0gJycpIHtcclxuICAgICAgICAgICAgZmx1c2hMaXN0KCk7XHJcbiAgICAgICAgICAgIGVsZW1lbnRzLnB1c2goPGRpdiBrZXk9e2Bici0ke2l9YH0gY2xhc3NOYW1lPVwiYWljLWJyXCIgLz4pO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGZsdXNoTGlzdCgpO1xyXG4gICAgICAgICAgICBlbGVtZW50cy5wdXNoKDxkaXYga2V5PXtpfSBjbGFzc05hbWU9XCJhaWMtcFwiPntwYXJzZUlubGluZShsaW5lLCBpKX08L2Rpdj4pO1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG4gICAgZmx1c2hMaXN0KCk7XHJcbiAgICByZXR1cm4gPGRpdiBjbGFzc05hbWU9XCJhaWMtbWRcIj57ZWxlbWVudHN9PC9kaXY+O1xyXG59XHJcblxyXG5mdW5jdGlvbiBUeXBpbmdEb3RzKCkge1xyXG4gICAgcmV0dXJuIChcclxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImFpYy10eXBpbmdcIj5cclxuICAgICAgICAgICAgPHNwYW4gLz48c3BhbiAvPjxzcGFuIC8+XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICApO1xyXG59XHJcblxyXG5mdW5jdGlvbiBNZXNzYWdlKHsgbXNnIH0pIHtcclxuICAgIGNvbnN0IGlzVXNlciA9IG1zZy5yb2xlID09PSAndXNlcic7XHJcbiAgICBjb25zdCBbY29waWVkLCBzZXRDb3BpZWRdID0gdXNlU3RhdGUoZmFsc2UpO1xyXG5cclxuICAgIGNvbnN0IGhhbmRsZUNvcHkgPSAoKSA9PiB7XHJcbiAgICAgICAgbmF2aWdhdG9yLmNsaXBib2FyZC53cml0ZVRleHQobXNnLmNvbnRlbnQpO1xyXG4gICAgICAgIHNldENvcGllZCh0cnVlKTtcclxuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHNldENvcGllZChmYWxzZSksIDIwMDApO1xyXG4gICAgfTtcclxuXHJcbiAgICBjb25zdCB0aW1lc3RhbXAgPSBuZXcgRGF0ZShtc2cudGltZXN0YW1wIHx8IERhdGUubm93KCkpLnRvTG9jYWxlVGltZVN0cmluZyhbXSwgeyBob3VyOiAnMi1kaWdpdCcsIG1pbnV0ZTogJzItZGlnaXQnIH0pO1xyXG5cclxuICAgIHJldHVybiAoXHJcbiAgICAgICAgPGRpdiBjbGFzc05hbWU9e2BhaWMtbXNnLXJvdyAke2lzVXNlciA/ICdhaWMtbXNnLXVzZXInIDogJ2FpYy1tc2ctYWknfWB9PlxyXG4gICAgICAgICAgICB7IWlzVXNlciAmJiAoXHJcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImFpYy1hdmF0YXIgYWljLWF2YXRhci1haVwiPlxyXG4gICAgICAgICAgICAgICAgICAgIDxGaUNwdSBzaXplPXsxNH0gLz5cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICApfVxyXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT17YGFpYy1idWJibGUtd3JhcHBlciAke2lzVXNlciA/ICdhaWMtd3JhcHBlci11c2VyJyA6ICdhaWMtd3JhcHBlci1haSd9YH0+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT17YGFpYy1idWJibGUgJHtpc1VzZXIgPyAnYWljLWJ1YmJsZS11c2VyJyA6ICdhaWMtYnViYmxlLWFpJ31gfT5cclxuICAgICAgICAgICAgICAgICAgICB7aXNVc2VyID8gKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBtc2cuY29udGVudC5zcGxpdCgnXFxuJykubWFwKChsaW5lLCBpKSA9PiAoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBrZXk9e2l9PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtsaW5lfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtpIDwgbXNnLmNvbnRlbnQuc3BsaXQoJ1xcbicpLmxlbmd0aCAtIDEgJiYgPGJyIC8+fVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICApKVxyXG4gICAgICAgICAgICAgICAgICAgICkgOiAoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcnNlTWFya2Rvd24obXNnLmNvbnRlbnQpXHJcbiAgICAgICAgICAgICAgICAgICAgKX1cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJhaWMtbXNnLWZvb3RlclwiPlxyXG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImFpYy10aW1lXCI+e3RpbWVzdGFtcH08L3NwYW4+XHJcbiAgICAgICAgICAgICAgICAgICAgeyFpc1VzZXIgJiYgKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzTmFtZT1cImFpYy1jb3B5LWJ0blwiIG9uQ2xpY2s9e2hhbmRsZUNvcHl9IHRpdGxlPVwiQ29weSBtZXNzYWdlXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7Y29waWVkID8gPEZpQ2hlY2sgc2l6ZT17MTJ9IGNvbG9yPVwiIzEwYjk4MVwiIC8+IDogPEZpQ29weSBzaXplPXsxMn0gLz59XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxyXG4gICAgICAgICAgICAgICAgICAgICl9XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICApO1xyXG59XHJcblxyXG5jb25zdCBDQUxDVUxBVE9SUyA9IHtcclxuICAgIGVtaTogeyBpZDogJ2VtaScsIG5hbWU6ICdFTUknLCBpY29uOiA8QmlIb21lQWx0IC8+LCBkZXNjOiAnQ2FsY3VsYXRlIExvYW4gRU1JJyB9LFxyXG4gICAgc2lwOiB7IGlkOiAnc2lwJywgbmFtZTogJ1NJUCcsIGljb246IDxCaVRyZW5kaW5nVXAgLz4sIGRlc2M6ICdTeXN0ZW1hdGljIEludi4gUGxhbicgfSxcclxuICAgIGZkOiB7IGlkOiAnZmQnLCBuYW1lOiAnRkQnLCBpY29uOiA8QmlNYXRoIC8+LCBkZXNjOiAnRml4ZWQgRGVwb3NpdCBSZXR1cm5zJyB9LFxyXG4gICAgY2k6IHsgaWQ6ICdjaScsIG5hbWU6ICdDb21wb3VuZCcsIGljb246IDxCaUNvaW4gLz4sIGRlc2M6ICdDb21wb3VuZCBJbnRlcmVzdCcgfSxcclxuICAgIHRheDogeyBpZDogJ3RheCcsIG5hbWU6ICdUYXgnLCBpY29uOiA8QmlSZWNlaXB0IC8+LCBkZXNjOiAnSW5jb21lIFRheCBFc3RpbWF0b3InIH0sXHJcbiAgICBnb2FsOiB7IGlkOiAnZ29hbCcsIG5hbWU6ICdHb2FsJywgaWNvbjogPEJpVGFyZ2V0TG9jayAvPiwgZGVzYzogJ1NhdmluZ3MgR29hbCBQbGFubmVyJyB9XHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBBSUNoYXQoKSB7XHJcbiAgICAvLyBEZXRlcm1pbmUgaW5pdGlhbCBzdGF0ZSBiYXNlZCBvbiB3aW5kb3cgc2l6ZVxyXG4gICAgY29uc3QgaXNNb2JpbGUgPSB3aW5kb3cuaW5uZXJXaWR0aCA8PSA2MDA7XHJcbiAgICBjb25zdCBbaXNPcGVuLCBzZXRJc09wZW5dID0gdXNlU3RhdGUoZmFsc2UpO1xyXG5cclxuICAgIC8vIFJlc2l6ZSBzdGF0ZVxyXG4gICAgY29uc3QgW3NpemUsIHNldFNpemVdID0gdXNlU3RhdGUoeyB3aWR0aDogNDAwLCBoZWlnaHQ6IDYwMCB9KTtcclxuICAgIGNvbnN0IGRyYWdSZWYgPSB1c2VSZWYoeyB4OiAwLCB5OiAwLCB3OiAwLCBoOiAwIH0pO1xyXG5cclxuICAgIGNvbnN0IFttZXNzYWdlcywgc2V0TWVzc2FnZXNdID0gdXNlU3RhdGUoW10pO1xyXG4gICAgY29uc3QgW2lucHV0LCBzZXRJbnB1dF0gPSB1c2VTdGF0ZSgnJyk7XHJcbiAgICBjb25zdCBbbG9hZGluZywgc2V0TG9hZGluZ10gPSB1c2VTdGF0ZShmYWxzZSk7XHJcbiAgICBjb25zdCBbZXJyb3IsIHNldEVycm9yXSA9IHVzZVN0YXRlKG51bGwpO1xyXG4gICAgY29uc3QgYm90dG9tUmVmID0gdXNlUmVmKG51bGwpO1xyXG4gICAgY29uc3QgaW5wdXRSZWYgPSB1c2VSZWYobnVsbCk7XHJcblxyXG4gICAgLy8gQ2FsY3VsYXRvciBzdGF0ZVxyXG4gICAgY29uc3QgW2FjdGl2ZUNhbGMsIHNldEFjdGl2ZUNhbGNdID0gdXNlU3RhdGUobnVsbCk7XHJcbiAgICBjb25zdCBbY2FsY0RhdGEsIHNldENhbGNEYXRhXSA9IHVzZVN0YXRlKHt9KTtcclxuICAgIGNvbnN0IFtjYWxjUmVzdWx0LCBzZXRDYWxjUmVzdWx0XSA9IHVzZVN0YXRlKG51bGwpO1xyXG5cclxuICAgIC8vIEF1dG8tc2Nyb2xsIG9uIG5ldyBtZXNzYWdlXHJcbiAgICB1c2VFZmZlY3QoKCkgPT4ge1xyXG4gICAgICAgIGlmIChpc09wZW4pIHtcclxuICAgICAgICAgICAgYm90dG9tUmVmLmN1cnJlbnQ/LnNjcm9sbEludG9WaWV3KHsgYmVoYXZpb3I6ICdzbW9vdGgnIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH0sIFttZXNzYWdlcywgbG9hZGluZywgYWN0aXZlQ2FsYywgaXNPcGVuXSk7XHJcblxyXG4gICAgY29uc3Qgc2VuZE1lc3NhZ2UgPSBhc3luYyAodGV4dCwgaGlkZUZyb21VSSA9IGZhbHNlKSA9PiB7XHJcbiAgICAgICAgY29uc3QgdXNlclRleHQgPSAodGV4dCB8fCBpbnB1dCkudHJpbSgpO1xyXG4gICAgICAgIGlmICghdXNlclRleHQgfHwgbG9hZGluZykgcmV0dXJuO1xyXG5cclxuICAgICAgICBzZXRJbnB1dCgnJyk7XHJcbiAgICAgICAgc2V0RXJyb3IobnVsbCk7XHJcblxyXG4gICAgICAgIGNvbnN0IG5ld01zZyA9IHsgcm9sZTogJ3VzZXInLCBjb250ZW50OiB1c2VyVGV4dCwgdGltZXN0YW1wOiBEYXRlLm5vdygpIH07XHJcbiAgICAgICAgaWYgKCFoaWRlRnJvbVVJKSB7XHJcbiAgICAgICAgICAgIHNldE1lc3NhZ2VzKHByZXYgPT4gWy4uLnByZXYsIG5ld01zZ10pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBzZXRMb2FkaW5nKHRydWUpO1xyXG4gICAgICAgIHNldEFjdGl2ZUNhbGMobnVsbCk7XHJcblxyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGhpc3RvcnlUb0FJID0gbWVzc2FnZXMubWFwKG0gPT4gKHsgcm9sZTogbS5yb2xlLCBjb250ZW50OiBtLmNvbnRlbnQgfSkpO1xyXG4gICAgICAgICAgICBjb25zdCByZXMgPSBhd2FpdCBhcGkucG9zdCgnL2FpY2hhdCcsIHsgbWVzc2FnZTogdXNlclRleHQsIGhpc3Rvcnk6IGhpc3RvcnlUb0FJIH0pO1xyXG5cclxuICAgICAgICAgICAgY29uc3QgYWlNc2cgPSB7IHJvbGU6ICdhc3Npc3RhbnQnLCBjb250ZW50OiByZXMuZGF0YS5yZXBseSwgdGltZXN0YW1wOiBEYXRlLm5vdygpIH07XHJcbiAgICAgICAgICAgIHNldE1lc3NhZ2VzKHByZXYgPT4gWy4uLnByZXYsIGFpTXNnXSk7XHJcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XHJcbiAgICAgICAgICAgIHNldEVycm9yKCdDb3VsZCBub3QgcmVhY2ggdGhlIEFJLiBQbGVhc2UgdHJ5IGFnYWluLicpO1xyXG4gICAgICAgICAgICBpZiAoIWhpZGVGcm9tVUkpIHtcclxuICAgICAgICAgICAgICAgIHNldE1lc3NhZ2VzKHByZXYgPT4gcHJldi5zbGljZSgwLCAtMSkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBmaW5hbGx5IHtcclxuICAgICAgICAgICAgc2V0TG9hZGluZyhmYWxzZSk7XHJcbiAgICAgICAgICAgIGlmICghaGlkZUZyb21VSSkgaW5wdXRSZWYuY3VycmVudD8uZm9jdXMoKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIGNvbnN0IGhhbmRsZUtleURvd24gPSAoZSkgPT4ge1xyXG4gICAgICAgIGlmIChlLmtleSA9PT0gJ0VudGVyJyAmJiAhZS5zaGlmdEtleSkge1xyXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgIHNlbmRNZXNzYWdlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICBjb25zdCBjbGVhckNoYXQgPSAoKSA9PiB7XHJcbiAgICAgICAgc2V0TWVzc2FnZXMoW10pO1xyXG4gICAgICAgIHNldEVycm9yKG51bGwpO1xyXG4gICAgICAgIHNldEFjdGl2ZUNhbGMobnVsbCk7XHJcbiAgICAgICAgaW5wdXRSZWYuY3VycmVudD8uZm9jdXMoKTtcclxuICAgIH07XHJcblxyXG4gICAgY29uc3Qgc2VuZENhbGNUb0NoYXQgPSAoKSA9PiB7XHJcbiAgICAgICAgaWYgKCFjYWxjUmVzdWx0KSByZXR1cm47XHJcbiAgICAgICAgY29uc3QgbXNnID0gYEkgY2FsY3VsYXRlZCBteSAke2FjdGl2ZUNhbGMudG9VcHBlckNhc2UoKX06XFxuJHtjYWxjUmVzdWx0LnN1bW1hcnl9XFxuV2hhdCBkb2VzIHRoaXMgbWVhbiBmb3IgbXkgZmluYW5jaWFsIGhlYWx0aD9gO1xyXG4gICAgICAgIHNlbmRNZXNzYWdlKG1zZyk7XHJcbiAgICB9O1xyXG5cclxuICAgIGNvbnN0IGhhbmRsZUNhbGNDaGFuZ2UgPSAoZmllbGQsIHZhbCkgPT4ge1xyXG4gICAgICAgIGNvbnN0IG51bSA9IHBhcnNlRmxvYXQodmFsKSB8fCAwO1xyXG4gICAgICAgIGNvbnN0IG5ld0RhdGEgPSB7IC4uLmNhbGNEYXRhLCBbZmllbGRdOiBudW0gfTtcclxuICAgICAgICBzZXRDYWxjRGF0YShuZXdEYXRhKTtcclxuXHJcbiAgICAgICAgbGV0IHJlcyA9IG51bGw7XHJcbiAgICAgICAgaWYgKGFjdGl2ZUNhbGMgPT09ICdlbWknICYmIG5ld0RhdGEucCAmJiBuZXdEYXRhLnIgJiYgbmV3RGF0YS50KSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHAgPSBuZXdEYXRhLnAsIHIgPSBuZXdEYXRhLnIgLyAxMiAvIDEwMCwgbiA9IG5ld0RhdGEudCAqIDEyO1xyXG4gICAgICAgICAgICBjb25zdCBlbWkgPSAocCAqIHIgKiBNYXRoLnBvdygxICsgciwgbikpIC8gKE1hdGgucG93KDEgKyByLCBuKSAtIDEpO1xyXG4gICAgICAgICAgICByZXMgPSB7IHZhbDE6IGVtaSwgbGFiZWwxOiAnTW9udGhseSBFTUknLCB2YWwyOiAoZW1pICogbikgLSBwLCBsYWJlbDI6ICdUb3RhbCBJbnRlcmVzdCcsIHN1bW1hcnk6IGBMb2FuOiDigrkke3B9XFxuVGVudXJlOiAke25ld0RhdGEudH15cnMgQCAke25ld0RhdGEucn0lXFxuRU1JOiDigrkke01hdGgucm91bmQoZW1pKX1gIH07XHJcbiAgICAgICAgfSBlbHNlIGlmIChhY3RpdmVDYWxjID09PSAnc2lwJyAmJiBuZXdEYXRhLmludiAmJiBuZXdEYXRhLnIgJiYgbmV3RGF0YS50KSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHAgPSBuZXdEYXRhLmludiwgciA9IG5ld0RhdGEuciAvIDEyIC8gMTAwLCBuID0gbmV3RGF0YS50ICogMTI7XHJcbiAgICAgICAgICAgIGNvbnN0IGZ2ID0gcCAqICgoTWF0aC5wb3coMSArIHIsIG4pIC0gMSkgLyByKSAqICgxICsgcik7XHJcbiAgICAgICAgICAgIHJlcyA9IHsgdmFsMTogZnYsIGxhYmVsMTogJ0V4cGVjdGVkIEFtb3VudCcsIHZhbDI6IGZ2IC0gKHAgKiBuKSwgbGFiZWwyOiAnV2VhbHRoIEdhaW5lZCcsIHN1bW1hcnk6IGBTSVA6IOKCuSR7cH0vbW9cXG5EdXJhdGlvbjogJHtuZXdEYXRhLnR9eXJzIEAgJHtuZXdEYXRhLnJ9JVxcbkZ1dHVyZSBWYWx1ZTog4oK5JHtNYXRoLnJvdW5kKGZ2KX1gIH07XHJcbiAgICAgICAgfSBlbHNlIGlmIChhY3RpdmVDYWxjID09PSAnZmQnICYmIG5ld0RhdGEucCAmJiBuZXdEYXRhLnIgJiYgbmV3RGF0YS50KSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHAgPSBuZXdEYXRhLnAsIHIgPSBuZXdEYXRhLnIgLyAxMDAsIHQgPSBuZXdEYXRhLnQ7XHJcbiAgICAgICAgICAgIGNvbnN0IGZ2ID0gcCAqIE1hdGgucG93KDEgKyAociAvIDQpLCA0ICogdCk7XHJcbiAgICAgICAgICAgIHJlcyA9IHsgdmFsMTogZnYsIGxhYmVsMTogJ01hdHVyaXR5IEFtb3VudCcsIHZhbDI6IGZ2IC0gcCwgbGFiZWwyOiAnSW50ZXJlc3QgRWFybmVkJywgc3VtbWFyeTogYEZEOiDigrkke3B9XFxuRHVyYXRpb246ICR7dH15cnMgQCAke25ld0RhdGEucn0lXFxuTWF0dXJpdHk6IOKCuSR7TWF0aC5yb3VuZChmdil9YCB9O1xyXG4gICAgICAgIH0gZWxzZSBpZiAoYWN0aXZlQ2FsYyA9PT0gJ2dvYWwnICYmIG5ld0RhdGEudGFyZ2V0ICYmIG5ld0RhdGEudCAmJiBuZXdEYXRhLnIpIHtcclxuICAgICAgICAgICAgY29uc3QgZnYgPSBuZXdEYXRhLnRhcmdldCwgciA9IG5ld0RhdGEuciAvIDEyIC8gMTAwLCBuID0gbmV3RGF0YS50ICogMTI7XHJcbiAgICAgICAgICAgIGNvbnN0IHNpcCA9IChmdiAqIHIpIC8gKChNYXRoLnBvdygxICsgciwgbikgLSAxKSAqICgxICsgcikpO1xyXG4gICAgICAgICAgICByZXMgPSB7IHZhbDE6IE1hdGguY2VpbChzaXApLCBsYWJlbDE6ICdNb250aGx5IFNJUCBSZXF1aXJlcycsIHZhbDI6IG5ld0RhdGEudGFyZ2V0LCBsYWJlbDI6ICdUYXJnZXQgQW1vdW50Jywgc3VtbWFyeTogYEdvYWw6IOKCuSR7bmV3RGF0YS50YXJnZXR9IGluICR7bmV3RGF0YS50fXlycyBhdCAke25ld0RhdGEucn0lXFxuTW9udGhseSBTSVA6IOKCuSR7TWF0aC5jZWlsKHNpcCl9YCB9O1xyXG4gICAgICAgIH0gZWxzZSBpZiAoYWN0aXZlQ2FsYyA9PT0gJ3RheCcgJiYgbmV3RGF0YS5pbmNvbWUpIHtcclxuICAgICAgICAgICAgbGV0IGluY29tZSA9IG5ld0RhdGEuaW5jb21lLCB0YXggPSAwO1xyXG4gICAgICAgICAgICBpZiAoaW5jb21lID4gNzAwMDAwKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoaW5jb21lID4gMzAwMDAwKSB0YXggKz0gTWF0aC5taW4oaW5jb21lIC0gMzAwMDAwLCAzMDAwMDApICogMC4wNTtcclxuICAgICAgICAgICAgICAgIGlmIChpbmNvbWUgPiA2MDAwMDApIHRheCArPSBNYXRoLm1pbihpbmNvbWUgLSA2MDAwMDAsIDMwMDAwMCkgKiAwLjEwO1xyXG4gICAgICAgICAgICAgICAgaWYgKGluY29tZSA+IDkwMDAwMCkgdGF4ICs9IE1hdGgubWluKGluY29tZSAtIDkwMDAwMCwgMzAwMDAwKSAqIDAuMTU7XHJcbiAgICAgICAgICAgICAgICBpZiAoaW5jb21lID4gMTIwMDAwMCkgdGF4ICs9IE1hdGgubWluKGluY29tZSAtIDEyMDAwMDAsIDMwMDAwMCkgKiAwLjIwO1xyXG4gICAgICAgICAgICAgICAgaWYgKGluY29tZSA+IDE1MDAwMDApIHRheCArPSAoaW5jb21lIC0gMTUwMDAwMCkgKiAwLjMwO1xyXG4gICAgICAgICAgICAgICAgdGF4ICs9IHRheCAqIDAuMDQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmVzID0geyB2YWwxOiB0YXgsIGxhYmVsMTogJ0VzdGltYXRlZCBUYXgnLCB2YWwyOiBpbmNvbWUgLSB0YXgsIGxhYmVsMjogJ05ldCBJbmNvbWUnLCBzdW1tYXJ5OiBgSW5jb21lOiDigrkke2luY29tZX1cXG5UYXggKE5ldyBSZWdpbWUpOiDigrkke01hdGgucm91bmQodGF4KX1gIH07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHNldENhbGNSZXN1bHQocmVzKTtcclxuICAgIH07XHJcblxyXG4gICAgY29uc3QgdG9nZ2xlQ2FsYyA9IChpZCkgPT4ge1xyXG4gICAgICAgIGlmIChhY3RpdmVDYWxjID09PSBpZCkge1xyXG4gICAgICAgICAgICBzZXRBY3RpdmVDYWxjKG51bGwpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHNldEFjdGl2ZUNhbGMoaWQpO1xyXG4gICAgICAgICAgICBzZXRDYWxjRGF0YSh7fSk7XHJcbiAgICAgICAgICAgIHNldENhbGNSZXN1bHQobnVsbCk7XHJcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4gYm90dG9tUmVmLmN1cnJlbnQ/LnNjcm9sbEludG9WaWV3KHsgYmVoYXZpb3I6ICdzbW9vdGgnIH0pLCAxMDApO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgLy8gLS0tIFJlc2l6aW5nIExvZ2ljIC0tLVxyXG4gICAgY29uc3QgaGFuZGxlTW91c2VEb3duID0gKGUpID0+IHtcclxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgZHJhZ1JlZi5jdXJyZW50ID0geyB4OiBlLmNsaWVudFgsIHk6IGUuY2xpZW50WSwgdzogc2l6ZS53aWR0aCwgaDogc2l6ZS5oZWlnaHQgfTtcclxuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCBoYW5kbGVNb3VzZU1vdmUpO1xyXG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCBoYW5kbGVNb3VzZVVwKTtcclxuICAgIH07XHJcblxyXG4gICAgY29uc3QgaGFuZGxlTW91c2VNb3ZlID0gKGUpID0+IHtcclxuICAgICAgICAvLyBTaW5jZSB3aWRnZXQgaXMgYW5jaG9yZWQgdG8gYm90dG9tLXJpZ2h0LCBkcmFnZ2luZyB0b3AtbGVmdCBvdXR3YXJkIChuZWdhdGl2ZSBkeCwgbmVnYXRpdmUgZHkpIGluY3JlYXNlcyBzaXplXHJcbiAgICAgICAgY29uc3QgZHggPSBlLmNsaWVudFggLSBkcmFnUmVmLmN1cnJlbnQueDtcclxuICAgICAgICBjb25zdCBkeSA9IGUuY2xpZW50WSAtIGRyYWdSZWYuY3VycmVudC55O1xyXG5cclxuICAgICAgICBzZXRTaXplKHtcclxuICAgICAgICAgICAgd2lkdGg6IE1hdGgubWF4KDMwMCwgTWF0aC5taW4oZHJhZ1JlZi5jdXJyZW50LncgLSBkeCwgd2luZG93LmlubmVyV2lkdGggLSA0MCkpLFxyXG4gICAgICAgICAgICBoZWlnaHQ6IE1hdGgubWF4KDQwMCwgTWF0aC5taW4oZHJhZ1JlZi5jdXJyZW50LmggLSBkeSwgd2luZG93LmlubmVySGVpZ2h0IC0gODApKVxyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcclxuXHJcbiAgICBjb25zdCBoYW5kbGVNb3VzZVVwID0gKCkgPT4ge1xyXG4gICAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIGhhbmRsZU1vdXNlTW92ZSk7XHJcbiAgICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIGhhbmRsZU1vdXNlVXApO1xyXG4gICAgfTtcclxuXHJcbiAgICBjb25zdCBpc0VtcHR5ID0gbWVzc2FnZXMubGVuZ3RoID09PSAwO1xyXG5cclxuICAgIHJldHVybiAoXHJcbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJhaWMtd2lkZ2V0LWNvbnRhaW5lclwiPlxyXG5cclxuICAgICAgICAgICAgey8qIEZBQiBUcmlnZ2VyIC0gUm91bmQgRmxvYXRpbmcgQnV0dG9uICovfVxyXG4gICAgICAgICAgICB7IWlzT3BlbiAmJiAoXHJcbiAgICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzTmFtZT1cImFpYy1mYWItcm91bmRcIiBvbkNsaWNrPXsoKSA9PiBzZXRJc09wZW4odHJ1ZSl9IHRpdGxlPVwiQXNrIEFJXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgPEZpQ3B1IHNpemU9ezI2fSAvPlxyXG4gICAgICAgICAgICAgICAgPC9idXR0b24+XHJcbiAgICAgICAgICAgICl9XHJcblxyXG4gICAgICAgICAgICB7LyogTWFpbiBDaGF0IFdpbmRvdyAqL31cclxuICAgICAgICAgICAgPGRpdlxyXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtgYWljLXdpbmRvdyAke2lzT3BlbiA/ICdvcGVuJyA6ICcnfWB9XHJcbiAgICAgICAgICAgICAgICBzdHlsZT17aXNNb2JpbGUgPyB7fSA6IHsgd2lkdGg6IGAke3NpemUud2lkdGh9cHhgLCBoZWlnaHQ6IGAke3NpemUuaGVpZ2h0fXB4YCB9fVxyXG4gICAgICAgICAgICA+XHJcbiAgICAgICAgICAgICAgICB7Lyog4pSA4pSAIFJlc2l6ZSBIYW5kbGUgKFRvcC1MZWZ0KSDilIDilIAgKi99XHJcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImFpYy1yZXNpemVyXCIgb25Nb3VzZURvd249e2hhbmRsZU1vdXNlRG93bn0gdGl0bGU9XCJEcmFnIHRvIHJlc2l6ZVwiIC8+XHJcblxyXG4gICAgICAgICAgICAgICAgey8qIEhlYWRlciBhY3RpbmcgYXMgYSB0b2dnbGUgdG8gY2xvc2UgKi99XHJcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImFpYy1oZWFkZXJcIiBvbkNsaWNrPXsoKSA9PiBzZXRJc09wZW4oZmFsc2UpfT5cclxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImFpYy1oZWFkZXItdGl0bGVcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJhaWMtaGVhZGVyLWF2YXRhclwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPEZpQ3B1IHNpemU9ezE2fSAvPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4+QUkgQXNzaXN0YW50PC9zcGFuPlxyXG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYWljLWhlYWRlci1hY3Rpb25zXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxidXR0b24gY2xhc3NOYW1lPVwiYWljLWhlYWRlci1idG5cIiBvbkNsaWNrPXsoZSkgPT4geyBlLnN0b3BQcm9wYWdhdGlvbigpOyBzZXRJc09wZW4oZmFsc2UpOyB9fT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxGaUNoZXZyb25Eb3duIHNpemU9ezIwfSAvPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cclxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG5cclxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYWljLWJvZHlcIj5cclxuICAgICAgICAgICAgICAgICAgICB7Lyog4pSA4pSAIEVtcHR5IFN0YXRlIC8gU3VnZ2VzdGlvbnMg4pSA4pSAICovfVxyXG4gICAgICAgICAgICAgICAgICAgIHtpc0VtcHR5ICYmIChcclxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJhaWMtZW1wdHlcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYWljLWVtcHR5LWljb25cIj48RmlDcHUgLz48L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxoMyBjbGFzc05hbWU9XCJhaWMtZW1wdHktdGl0bGVcIj5Zb3VyIEZpbmFuY2lhbCBDby1waWxvdDwvaDM+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8cCBjbGFzc05hbWU9XCJhaWMtZW1wdHktc3ViXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgR2V0IGluc2lnaHRzIG9uIHlvdXIgc3BlbmRpbmcsIGludmVzdG1lbnRzLCBhbmQgZ29hbHMuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3A+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImFpYy1zdWdnZXN0aW9uc1wiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtTVUdHRVNUSU9OUy5tYXAoKHMsIGkpID0+IChcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBrZXk9e2l9IGNsYXNzTmFtZT1cImFpYy1zdWdnZXN0aW9uLWJ0blwiIG9uQ2xpY2s9eygpID0+IHNlbmRNZXNzYWdlKHMpfT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxGaVphcCBzaXplPXsxMn0gY2xhc3NOYW1lPVwiYWljLXN1Z2ctaWNvblwiIC8+IHtzfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApKX1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICApfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICB7Lyog4pSA4pSAIE1lc3NhZ2UgTGlzdCDilIDilIAgKi99XHJcbiAgICAgICAgICAgICAgICAgICAgeyFpc0VtcHR5ICYmIChcclxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJhaWMtbWVzc2FnZXNcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHttZXNzYWdlcy5tYXAoKG1zZywgaSkgPT4gKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYga2V5PXtpfSBjbGFzc05hbWU9XCJhaWMtbXNnLWFuaW1cIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPE1lc3NhZ2UgbXNnPXttc2d9IC8+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApKX1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7bG9hZGluZyAmJiAoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJhaWMtbXNnLXJvdyBhaWMtbXNnLWFpIGFpYy1tc2ctYW5pbVwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImFpYy1hdmF0YXIgYWljLWF2YXRhci1haVwiPjxGaUNwdSBzaXplPXsxNH0gLz48L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJhaWMtYnViYmxlLXdyYXBwZXIgYWljLXdyYXBwZXItYWlcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYWljLWJ1YmJsZSBhaWMtYnViYmxlLWFpIGFpYy1idWJibGUtdHlwaW5nXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPFR5cGluZ0RvdHMgLz5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICl9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge2Vycm9yICYmIChcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImFpYy1lcnJvclwiPntlcnJvcn08L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICl9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgey8qIFBhZGRpbmcgYXQgYm90dG9tIGZvciBjYWxjdWxhdG9ycyAqL31cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgaGVpZ2h0OiBhY3RpdmVDYWxjID8gJzI0MHB4JyA6ICcxMHB4JywgdHJhbnNpdGlvbjogJ2hlaWdodCAwLjNzIGVhc2UnIH19IC8+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IHJlZj17Ym90dG9tUmVmfSAvPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICApfVxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcblxyXG4gICAgICAgICAgICAgICAgey8qIOKUgOKUgCBUb29scyAmIElucHV0IEJhciBBcmVhIOKUgOKUgCAqL31cclxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYWljLWJvdHRvbS1hcmVhXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgey8qIFRvb2xzIEJhciAqL31cclxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImFpYy10b29scy1iYXJcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAge09iamVjdC52YWx1ZXMoQ0FMQ1VMQVRPUlMpLm1hcChjYWxjID0+IChcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxidXR0b25cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBrZXk9e2NhbGMuaWR9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtgYWljLXRvb2wtYnRuICR7YWN0aXZlQ2FsYyA9PT0gY2FsYy5pZCA/ICdhY3RpdmUnIDogJyd9YH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiB0b2dnbGVDYWxjKGNhbGMuaWQpfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtjYWxjLmljb259IDxzcGFuPntjYWxjLm5hbWV9PC9zcGFuPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICkpfVxyXG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG5cclxuICAgICAgICAgICAgICAgICAgICB7LyogQ2FsY3VsYXRvciBQYW5lbCAqL31cclxuICAgICAgICAgICAgICAgICAgICB7YWN0aXZlQ2FsYyAmJiAoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYWljLWNhbGMtcGFuZWxcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYWljLWNhbGMtaGVhZGVyXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGg0PntDQUxDVUxBVE9SU1thY3RpdmVDYWxjXS5pY29ufSB7Q0FMQ1VMQVRPUlNbYWN0aXZlQ2FsY10ubmFtZX08L2g0PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxidXR0b24gY2xhc3NOYW1lPVwiYWljLWNsb3NlLWJ0blwiIG9uQ2xpY2s9eygpID0+IHNldEFjdGl2ZUNhbGMobnVsbCl9PjxGaVggc2l6ZT17MTZ9IC8+PC9idXR0b24+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImFpYy1jYWxjLWJvZHlcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImFpYy1jYWxjLWlucHV0c1wiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7KGFjdGl2ZUNhbGMgPT09ICdlbWknIHx8IGFjdGl2ZUNhbGMgPT09ICdmZCcpICYmIChcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYWljLWlucHV0LWdyb3VwXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGxhYmVsPlByaW5jaXBhbCAo4oK5KTwvbGFiZWw+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XCJudW1iZXJcIiBwbGFjZWhvbGRlcj1cIkVnLiA1MDAwMDBcIiB2YWx1ZT17Y2FsY0RhdGEucCB8fCAnJ30gb25DaGFuZ2U9e2UgPT4gaGFuZGxlQ2FsY0NoYW5nZSgncCcsIGUudGFyZ2V0LnZhbHVlKX0gLz5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7YWN0aXZlQ2FsYyA9PT0gJ3NpcCcgJiYgKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJhaWMtaW5wdXQtZ3JvdXBcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8bGFiZWw+TW9udGhseSAo4oK5KTwvbGFiZWw+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XCJudW1iZXJcIiBwbGFjZWhvbGRlcj1cIkVnLiA1MDAwXCIgdmFsdWU9e2NhbGNEYXRhLmludiB8fCAnJ30gb25DaGFuZ2U9e2UgPT4gaGFuZGxlQ2FsY0NoYW5nZSgnaW52JywgZS50YXJnZXQudmFsdWUpfSAvPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICl9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHthY3RpdmVDYWxjID09PSAnZ29hbCcgJiYgKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJhaWMtaW5wdXQtZ3JvdXBcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8bGFiZWw+VGFyZ2V0ICjigrkpPC9sYWJlbD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT1cIm51bWJlclwiIHBsYWNlaG9sZGVyPVwiRWcuIDEwMDAwMDBcIiB2YWx1ZT17Y2FsY0RhdGEudGFyZ2V0IHx8ICcnfSBvbkNoYW5nZT17ZSA9PiBoYW5kbGVDYWxjQ2hhbmdlKCd0YXJnZXQnLCBlLnRhcmdldC52YWx1ZSl9IC8+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKX1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge2FjdGl2ZUNhbGMgPT09ICd0YXgnICYmIChcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYWljLWlucHV0LWdyb3VwXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGxhYmVsPkluY29tZSAo4oK5KTwvbGFiZWw+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XCJudW1iZXJcIiBwbGFjZWhvbGRlcj1cIkVnLiAxMjAwMDAwXCIgdmFsdWU9e2NhbGNEYXRhLmluY29tZSB8fCAnJ30gb25DaGFuZ2U9e2UgPT4gaGFuZGxlQ2FsY0NoYW5nZSgnaW5jb21lJywgZS50YXJnZXQudmFsdWUpfSAvPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICl9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHthY3RpdmVDYWxjICE9PSAndGF4JyAmJiAoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYWljLWlucHV0LWdyb3VwXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxsYWJlbD5SYXRlICglKTwvbGFiZWw+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPVwibnVtYmVyXCIgcGxhY2Vob2xkZXI9XCJFZy4gMTJcIiB2YWx1ZT17Y2FsY0RhdGEuciB8fCAnJ30gb25DaGFuZ2U9e2UgPT4gaGFuZGxlQ2FsY0NoYW5nZSgncicsIGUudGFyZ2V0LnZhbHVlKX0gLz5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImFpYy1pbnB1dC1ncm91cFwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8bGFiZWw+WWVhcnM8L2xhYmVsPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT1cIm51bWJlclwiIHBsYWNlaG9sZGVyPVwiRWcuIDVcIiB2YWx1ZT17Y2FsY0RhdGEudCB8fCAnJ30gb25DaGFuZ2U9e2UgPT4gaGFuZGxlQ2FsY0NoYW5nZSgndCcsIGUudGFyZ2V0LnZhbHVlKX0gLz5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImFpYy1jYWxjLXJlc3VsdHNcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge2NhbGNSZXN1bHQgPyAoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYWljLXJlc3VsdC1tYWluXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuPntjYWxjUmVzdWx0LmxhYmVsMX08L3NwYW4+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxoMz7igrl7TWF0aC5yb3VuZChjYWxjUmVzdWx0LnZhbDEpLnRvTG9jYWxlU3RyaW5nKCdlbi1JTicpfTwvaDM+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzc05hbWU9XCJhaWMtY2FsYy1zZW5kLWJ0blwiIG9uQ2xpY2s9e3NlbmRDYWxjVG9DaGF0fT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQXNrIEFJIDxGaUNoZXZyb25SaWdodCAvPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC8+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICkgOiAoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImFpYy1yZXN1bHQtZW1wdHlcIj5FbnRlciBkZXRhaWxzIHRvIGNhbGN1bGF0ZTwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgICl9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHsvKiBJbnB1dCBCYXIgKi99XHJcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJhaWMtaW5wdXQtYmFyXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHshaXNFbXB0eSAmJiAoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzTmFtZT1cImFpYy1jbGVhci1idG5cIiBvbkNsaWNrPXtjbGVhckNoYXR9IHRpdGxlPVwiQ2xlYXIgY29udmVyc2F0aW9uXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPEZpUmVmcmVzaEN3IHNpemU9ezE0fSAvPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICl9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxpbnB1dFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVmPXtpbnB1dFJlZn1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cImFpYy1pbnB1dFwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlPVwidGV4dFwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwbGFjZWhvbGRlcj1cIldyaXRlIGEgbWVzc2FnZS4uLlwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZT17aW5wdXR9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17ZSA9PiBzZXRJbnB1dChlLnRhcmdldC52YWx1ZSl9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbktleURvd249e2hhbmRsZUtleURvd259XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZD17bG9hZGluZ31cclxuICAgICAgICAgICAgICAgICAgICAgICAgLz5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzc05hbWU9XCJhaWMtc2VuZC1idG5cIiBvbkNsaWNrPXsoKSA9PiBzZW5kTWVzc2FnZSgpfSBkaXNhYmxlZD17IWlucHV0LnRyaW0oKSB8fCBsb2FkaW5nfT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxGaVNlbmQgc2l6ZT17MTZ9IC8+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxyXG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgKTtcclxufVxyXG4iXSwiZmlsZSI6IkM6L1VzZXJzL2hhcmVuL0Rlc2t0b3AvRXhwZW5zZV9UcmFja2VyL0V4cGVuc2UtVHJhY2tlci9jbGllbnQvc3JjL2NvbXBvbmVudHMvQUkvQUlDaGF0LmpzeCJ9