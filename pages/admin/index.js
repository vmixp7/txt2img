import Head from "next/head";
import { useEffect, useRef, useState } from "react";
import {
  ArrowUp,
  ArrowDown,
  GripVertical,
  Pencil,
  Trash2,
  Plus,
  LogOut,
  Film,
} from "lucide-react";
import { isAdmin } from "lib/admin-auth";

// 後台: 圖生影片模板 (Prompt) 管理
export async function getServerSideProps({ req }) {
  return { props: { loggedIn: isAdmin(req) } };
}

const api = async (url, method = "GET", body) => {
  const res = await fetch(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error = new Error(data.detail || "操作失敗");
    error.status = res.status;
    throw error;
  }
  return data;
};

const emptyForm = { id: null, label: "", prompt: "", image: "", enabled: true };

export default function Admin({ loggedIn: initialLoggedIn }) {
  const [loggedIn, setLoggedIn] = useState(initialLoggedIn);

  return (
    <div className="min-h-screen bg-gray-100">
      <Head>
        <title>後台管理</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      {loggedIn ? (
        <TemplateManager onLogout={() => setLoggedIn(false)} />
      ) : (
        <Login onLogin={() => setLoggedIn(true)} />
      )}
    </div>
  );
}

function Login({ onLogin }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api("/api/admin/login", "POST", { password });
      onLogin();
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      className="max-w-sm mx-auto pt-32 px-4 flex flex-col gap-3"
    >
      <h1 className="text-2xl font-bold text-center mb-2">後台登入</h1>
      <input
        type="password"
        autoFocus
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="管理密碼"
        className="rounded-md border border-gray-300 px-3 py-2"
      />
      <button
        type="submit"
        disabled={busy || !password}
        className="bg-blue-800 hover:bg-blue-900 disabled:opacity-50 text-white rounded-md p-2"
      >
        {busy ? "登入中..." : "登入"}
      </button>
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </form>
  );
}

function TemplateManager({ onLogout }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);
  const [form, setForm] = useState(null); // 編輯中的模板, null 表示沒開表單
  // 排序有變更但尚未儲存
  const [orderDirty, setOrderDirty] = useState(false);
  const [dragIndex, setDragIndex] = useState(null);
  const savedOrder = useRef([]);

  const handleError = (err) => {
    if (err.status === 401) return onLogout();
    setError(err.message);
  };

  const load = async () => {
    setLoading(true);
    try {
      const { items } = await api("/api/admin/templates");
      setItems(items);
      savedOrder.current = items.map((t) => t.id);
      setOrderDirty(false);
      setError(null);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const flash = (msg) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 2000);
  };

  const applyOrder = (list) => {
    setItems(list);
    const ids = list.map((t) => t.id);
    setOrderDirty(ids.join() !== savedOrder.current.join());
  };

  const move = (from, to) => {
    if (to < 0 || to >= items.length || from === to) return;
    const list = [...items];
    const [moved] = list.splice(from, 1);
    list.splice(to, 0, moved);
    applyOrder(list);
  };

  const saveOrder = async () => {
    try {
      const ids = items.map((t) => t.id);
      await api("/api/admin/templates/reorder", "PUT", { ids });
      savedOrder.current = ids;
      setOrderDirty(false);
      flash("排序已儲存");
    } catch (err) {
      handleError(err);
    }
  };

  const toggleEnabled = async (t) => {
    try {
      const { item } = await api(`/api/admin/templates/${t.id}`, "PUT", {
        enabled: !t.enabled,
      });
      setItems((list) => list.map((x) => (x.id === item.id ? item : x)));
    } catch (err) {
      handleError(err);
    }
  };

  const remove = async (t) => {
    if (!window.confirm(`確定刪除「${t.label}」?`)) return;
    try {
      await api(`/api/admin/templates/${t.id}`, "DELETE");
      setItems((list) => list.filter((x) => x.id !== t.id));
      savedOrder.current = savedOrder.current.filter((id) => id !== t.id);
      flash("已刪除");
    } catch (err) {
      handleError(err);
    }
  };

  const onSaved = (item, isNew) => {
    setItems((list) =>
      isNew ? [...list, item] : list.map((x) => (x.id === item.id ? item : x)),
    );
    if (isNew) savedOrder.current = [...savedOrder.current, item.id];
    setForm(null);
    flash(isNew ? "已新增" : "已儲存");
  };

  const logout = async () => {
    await api("/api/admin/login", "DELETE").catch(() => {});
    onLogout();
  };

  return (
    <main className="max-w-[900px] mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Film className="h-6 w-6" /> 圖生影片模板
        </h1>
        <div className="flex gap-2">
          <a
            href="/img2video"
            target="_blank"
            rel="noreferrer"
            className="text-sm text-blue-800 hover:underline self-center"
          >
            前台預覽
          </a>
          <button
            onClick={logout}
            className="text-sm inline-flex items-center gap-1 px-3 py-1 rounded-md bg-white border hover:bg-gray-50"
          >
            <LogOut className="h-4 w-4" /> 登出
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <button
          onClick={() => setForm(emptyForm)}
          className="inline-flex items-center gap-1 bg-blue-800 hover:bg-blue-900 text-white rounded-md px-3 py-2"
        >
          <Plus className="h-4 w-4" /> 新增模板
        </button>
        {orderDirty && (
          <>
            <button
              onClick={saveOrder}
              className="bg-green-600 hover:bg-green-700 text-white rounded-md px-3 py-2"
            >
              儲存排序
            </button>
            <button
              onClick={load}
              className="bg-white border hover:bg-gray-50 rounded-md px-3 py-2"
            >
              取消
            </button>
          </>
        )}
        <span className="text-sm text-gray-500">
          拖曳或用箭頭調整順序,前台依此順序顯示
        </span>
        {notice && <span className="text-sm text-green-700">{notice}</span>}
      </div>

      {error && <p className="text-red-500 mb-3">{error}</p>}

      {loading ? (
        <p className="text-gray-500">載入中...</p>
      ) : items.length === 0 ? (
        <p className="text-gray-500">還沒有模板</p>
      ) : (
        <ul className="flex flex-col gap-2 p-0">
          {items.map((t, i) => (
            <li
              key={t.id}
              draggable
              onDragStart={() => setDragIndex(i)}
              onDragOver={(e) => {
                e.preventDefault();
                if (dragIndex !== null && dragIndex !== i) {
                  move(dragIndex, i);
                  setDragIndex(i);
                }
              }}
              onDragEnd={() => setDragIndex(null)}
              className={`flex gap-3 items-start bg-white rounded-lg shadow-sm p-3 ${
                dragIndex === i ? "opacity-50" : ""
              } ${t.enabled ? "" : "bg-gray-50"}`}
            >
              <div className="flex flex-col items-center text-gray-400">
                <GripVertical className="h-5 w-5 cursor-grab" />
                <span className="text-xs">{i + 1}</span>
                <button
                  onClick={() => move(i, i - 1)}
                  disabled={i === 0}
                  className="disabled:opacity-20 hover:text-gray-800"
                  aria-label="上移"
                >
                  <ArrowUp className="h-4 w-4" />
                </button>
                <button
                  onClick={() => move(i, i + 1)}
                  disabled={i === items.length - 1}
                  className="disabled:opacity-20 hover:text-gray-800"
                  aria-label="下移"
                >
                  <ArrowDown className="h-4 w-4" />
                </button>
              </div>

              {t.image ? (
                <img
                  src={t.image}
                  alt={t.label}
                  className={`w-20 h-20 object-cover rounded-md shrink-0 ${
                    t.enabled ? "" : "grayscale opacity-60"
                  }`}
                />
              ) : (
                <div className="w-20 h-20 rounded-md bg-gray-200 flex items-center justify-center shrink-0">
                  <Film className="h-6 w-6 text-gray-400" />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{t.label}</span>
                  {!t.enabled && (
                    <span className="text-xs bg-gray-300 text-gray-700 rounded px-1">
                      已停用
                    </span>
                  )}
                </div>
                <p
                  className="text-sm text-gray-600 mt-1 mb-0 break-words overflow-hidden"
                  style={{ display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical" }}
                >
                  {t.prompt}
                </p>
              </div>

              <div className="flex flex-col gap-1 shrink-0 items-end">
                <label className="text-xs inline-flex items-center gap-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={t.enabled}
                    onChange={() => toggleEnabled(t)}
                  />
                  啟用
                </label>
                <button
                  onClick={() => setForm(t)}
                  className="text-sm inline-flex items-center gap-1 text-blue-800 hover:underline"
                >
                  <Pencil className="h-4 w-4" /> 編輯
                </button>
                <button
                  onClick={() => remove(t)}
                  className="text-sm inline-flex items-center gap-1 text-red-600 hover:underline"
                >
                  <Trash2 className="h-4 w-4" /> 刪除
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {form && (
        <TemplateForm
          initial={form}
          onCancel={() => setForm(null)}
          onSaved={onSaved}
          onError={handleError}
        />
      )}
    </main>
  );
}

function TemplateForm({ initial, onCancel, onSaved, onError }) {
  const [form, setForm] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const isNew = !initial.id;

  const set = (key) => (e) =>
    setForm({ ...form, [key]: e.target.type === "checkbox" ? e.target.checked : e.target.value });

  const upload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const data = await api("/api/admin/upload-url", "POST", {
        contentType: file.type,
      });
      const put = await fetch(data.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!put.ok) throw new Error("圖片上傳失敗");
      setForm((f) => ({ ...f, image: data.imageUrl }));
    } catch (err) {
      if (err.status === 401) return onError(err);
      setError(err.message);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const body = {
      label: form.label,
      prompt: form.prompt,
      image: form.image,
      enabled: form.enabled,
    };
    try {
      const { item } = isNew
        ? await api("/api/admin/templates", "POST", body)
        : await api(`/api/admin/templates/${form.id}`, "PUT", body);
      onSaved(item, isNew);
    } catch (err) {
      if (err.status === 401) return onError(err);
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4 z-50"
      onMouseDown={(e) => e.target === e.currentTarget && onCancel()}
    >
      <form
        onSubmit={submit}
        className="bg-white rounded-lg w-full max-w-[640px] max-h-full overflow-auto p-5 flex flex-col gap-3"
      >
        <h2 className="text-xl font-bold">{isNew ? "新增模板" : "編輯模板"}</h2>

        <label className="text-sm font-semibold">
          名稱
          <input
            value={form.label}
            onChange={set("label")}
            maxLength={50}
            className="block w-full rounded-md mt-1 font-normal border border-gray-300 px-3 py-2"
            placeholder="例: 模板七"
          />
        </label>

        <label className="text-sm font-semibold">
          Prompt
          <textarea
            value={form.prompt}
            onChange={set("prompt")}
            rows={8}
            maxLength={5000}
            className="block w-full rounded-md mt-1 font-normal border border-gray-300 px-3 py-2"
            placeholder="描述影片中的動作或畫面"
          />
          <span className="text-xs text-gray-400 font-normal">
            {form.prompt.length} / 5000
          </span>
        </label>

        <div className="text-sm font-semibold">
          縮圖
          <div className="flex gap-3 items-center mt-1">
            {form.image ? (
              <img
                src={form.image}
                alt="縮圖"
                className="w-24 h-24 object-cover rounded-md"
              />
            ) : (
              <div className="w-24 h-24 rounded-md bg-gray-200" />
            )}
            <div className="flex-1 flex flex-col gap-2 font-normal">
              <input
                value={form.image}
                onChange={set("image")}
                className="block w-full rounded-md border border-gray-300 px-3 py-2"
                placeholder="/images/prompt_07.png 或圖片網址"
              />
              <label className="text-blue-800 hover:underline cursor-pointer">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={upload}
                  disabled={uploading}
                />
                {uploading ? "上傳中..." : "上傳圖片"}
              </label>
            </div>
          </div>
        </div>

        <label className="text-sm inline-flex items-center gap-2">
          <input type="checkbox" checked={form.enabled} onChange={set("enabled")} />
          啟用 (前台顯示)
        </label>

        {error && <p className="text-red-500 text-sm m-0">{error}</p>}

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="bg-white border hover:bg-gray-50 rounded-md px-4 py-2"
          >
            取消
          </button>
          <button
            type="submit"
            disabled={busy || uploading || !form.label.trim() || !form.prompt.trim()}
            className="bg-blue-800 hover:bg-blue-900 disabled:opacity-50 text-white rounded-md px-4 py-2"
          >
            {busy ? "儲存中..." : "儲存"}
          </button>
        </div>
      </form>
    </div>
  );
}
