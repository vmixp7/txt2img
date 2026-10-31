import { Trash2 as TrashIcon } from "lucide-react";
import { Button, Modal, ModalBody, ModalFooter } from "reactstrap";

// 歷史紀錄視窗, 每筆顯示縮圖 (有 imageUrl 時) / 時間 / prompt, 點擊套用
export default function HistoryModal({
  isOpen,
  toggle,
  items,
  imageUrl,
  onApply,
  onDelete,
  onClear,
  emptyText = "還沒有紀錄",
}) {
  const clearAll = () => {
    if (window.confirm("確定要清除所有紀錄?")) onClear();
  };

  return (
    <Modal toggle={toggle} isOpen={isOpen} scrollable>
      <div className="modal-header">
        <h5 className="modal-title">紀錄</h5>
        <button
          aria-label="Close"
          className="close"
          type="button"
          onClick={toggle}
          style={{ fontSize: "2.5rem", lineHeight: "1" }}
        >
          <span aria-hidden={true}>×</span>
        </button>
      </div>
      <ModalBody>
        {items.length === 0 ? (
          <p className="text-center text-gray-500 my-8">{emptyText}</p>
        ) : (
          <ul className="list-none p-0 m-0">
            {items.map((h) => (
              <li
                key={h.id}
                className="flex items-start gap-3 p-2 mb-2 rounded-md bg-gray-50 hover:bg-gray-100 cursor-pointer"
                onClick={() => onApply(h)}
              >
                {imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={imageUrl(h)}
                    alt=""
                    loading="lazy"
                    className="w-20 h-20 shrink-0 rounded-md object-cover bg-gray-200"
                  />
                )}
                <div className="flex-grow min-w-0">
                  <p className="text-xs text-gray-400 mb-1">
                    {new Date(h.createdAt).toLocaleString()}
                  </p>
                  <p
                    className="text-sm text-gray-800 mb-0 overflow-hidden break-words"
                    style={{
                      display: "-webkit-box",
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: "vertical",
                    }}
                  >
                    {h.prompt || "(未輸入描述)"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(h.id);
                  }}
                  className="shrink-0 p-1 text-gray-400 hover:text-red-500 bg-transparent border-0"
                  aria-label="刪除紀錄"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </ModalBody>
      <ModalFooter>
        {items.length > 0 && (
          <Button color="danger" outline type="button" onClick={clearAll}>
            清除全部
          </Button>
        )}
        <Button color="primary" type="button" onClick={toggle}>
          關閉
        </Button>
      </ModalFooter>
    </Modal>
  );
}
