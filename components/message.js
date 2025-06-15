export default function Message({
  sender,
  shouldFillWidth = false,
  isSameSender = false,
  children,
}) {
  return (
    <div className={`w-full ${sender === "user" ? "" : ""}`}>
      <div
        className={`p-3 rounded-lg ${shouldFillWidth ? "" : "inline-block"} ${
          sender === "user"
            // ? "bg-blue-600 text-white"
            ? "bg-gray-200 text-black"
            : "bg-gray-200 text-black"
        } ${isSameSender ? "mt-2" : "mt-6"}`}
      >
        {children}
      </div>
    </div>
  );
}
