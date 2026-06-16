import { useEffect, useState, type FormEvent } from "react";
import {
  fetchLiveChat,
  sendLiveChatMessage,
  startLiveChat,
  trackOrder,
  type LiveChat,
  type OrderStatus,
  type TrackedOrder,
} from "../lib/api";

const chatStorageKey = "vinex-nepal-live-chat-id";
const chatSeenAdminCountStorageKey = "vinex-nepal-live-chat-seen-admin-count";
type ChatMode = "menu" | "track" | "live";

function formatOrderStatus(status: OrderStatus) {
  if (status === "new") return "Pending";
  if (status === "processing") return "Processing";
  if (status === "shipped") return "Shipped";
  if (status === "completed") return "Completed";
  return "Cancelled";
}

export function LiveChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<ChatMode>("menu");
  const [chat, setChat] = useState<LiveChat | null>(null);
  const [trackedOrder, setTrackedOrder] = useState<TrackedOrder | null>(null);
  const [orderNumber, setOrderNumber] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [contact, setContact] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");
  const [isSending, setIsSending] = useState(false);
  const adminMessageCount = chat?.messages.filter((entry) => entry.sender === "admin").length ?? 0;
  const seenAdminMessageCount = Number(window.localStorage.getItem(chatSeenAdminCountStorageKey) ?? "0");
  const unreadAdminMessageCount = Math.max(0, adminMessageCount - seenAdminMessageCount);

  useEffect(() => {
    if (isOpen && adminMessageCount > 0) {
      window.localStorage.setItem(chatSeenAdminCountStorageKey, String(adminMessageCount));
    }
  }, [adminMessageCount, isOpen]);

  useEffect(() => {
    const storedChatId = window.localStorage.getItem(chatStorageKey);
    if (!storedChatId) return undefined;

    let isMounted = true;

    const loadChat = async () => {
      try {
        const result = await fetchLiveChat(storedChatId);
        if (isMounted) {
          setChat(result.chat);
        }
      } catch {
        window.localStorage.removeItem(chatStorageKey);
      }
    };

    void loadChat();
    const intervalId = window.setInterval(loadChat, 5000);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!message.trim()) return;

    setIsSending(true);
    setStatus("");

    try {
      if (chat) {
        const result = await sendLiveChatMessage(chat.id, message);
        setChat(result.chat);
      } else {
        const result = await startLiveChat({ customerName, contact, message });
        setChat(result.chat);
        window.localStorage.setItem(chatStorageKey, result.chat.id);
      }

      setMessage("");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to send message.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <section className={isOpen ? "live-chat-widget live-chat-widget-open" : "live-chat-widget"}>
      {isOpen ? (
        <div className="live-chat-panel">
          <div className="live-chat-header">
            <div>
              <span className="section-tag">Support Assistant</span>
              <h3>How can we help?</h3>
            </div>
            <button className="ghost-button" type="button" onClick={() => setIsOpen(false)}>
              Close
            </button>
          </div>

          <div className="chat-assistant-actions">
            <button
              type="button"
              className={mode === "track" ? "ghost-button active" : "ghost-button"}
              onClick={() => {
                setMode("track");
                setStatus("");
              }}
            >
              Track My Order
            </button>
            <button
              type="button"
              className={mode === "live" ? "ghost-button active" : "ghost-button"}
              onClick={() => {
                setMode("live");
                setStatus("");
              }}
            >
              Talk To Live Support
            </button>
          </div>

          {mode === "menu" ? (
            <div className="live-chat-messages">
              <div className="chat-bubble chat-bubble-admin">
                <span>Vinex Nepal</span>
                <p>Choose Track My Order for instant status, or Talk To Live Support to message our admin team.</p>
              </div>
            </div>
          ) : null}

          {mode === "track" ? (
            <form
              className="live-chat-form"
              onSubmit={async (event) => {
                event.preventDefault();
                setIsSending(true);
                setStatus("");
                setTrackedOrder(null);

                try {
                  const result = await trackOrder(orderNumber);
                  setTrackedOrder(result.order);
                } catch (error) {
                  setStatus(error instanceof Error ? error.message : "Unable to track order.");
                } finally {
                  setIsSending(false);
                }
              }}
            >
              <label className="form-field full-span">
                <span>Order Number</span>
                <input
                  required
                  value={orderNumber}
                  onChange={(event) => setOrderNumber(event.target.value)}
                  placeholder="Example: GN-20260426-0004"
                />
              </label>

              {trackedOrder ? (
                <div className="tracked-order-card full-span">
                  <span className={`order-status-pill status-${trackedOrder.status}`}>
                    {formatOrderStatus(trackedOrder.status)}
                  </span>
                  <h4>{trackedOrder.orderNumber}</h4>
                  <p>{trackedOrder.customerName}</p>
                  {trackedOrder.items.map((item) => (
                    <div className="summary-row" key={item.name}>
                      <span>{item.name}</span>
                      <strong>x {item.quantity}</strong>
                    </div>
                  ))}
                </div>
              ) : null}

              {status ? <div className="form-status form-status-error">{status}</div> : null}

              <button className="primary-button full-span" type="submit" disabled={isSending}>
                {isSending ? "Checking..." : "Track Order"}
              </button>
            </form>
          ) : null}

          {mode === "live" ? (
            <>
              <div className="live-chat-messages">
                {chat ? (
                  chat.messages.map((entry) => (
                    <div
                      className={entry.sender === "admin" ? "chat-bubble chat-bubble-admin" : "chat-bubble"}
                      key={entry.id}
                    >
                      <span>{entry.sender === "admin" ? "Vinex Nepal" : chat.customerName}</span>
                      <p>{entry.text}</p>
                    </div>
                  ))
                ) : (
                  <p className="chat-empty">Send a message and our admin team can reply from the panel.</p>
                )}
              </div>

              <form className="live-chat-form" onSubmit={handleSubmit}>
            {!chat ? (
              <>
                <label className="form-field">
                  <span>Name</span>
                  <input
                    required
                    value={customerName}
                    onChange={(event) => setCustomerName(event.target.value)}
                  />
                </label>
                <label className="form-field">
                  <span>Phone or Email</span>
                  <input required value={contact} onChange={(event) => setContact(event.target.value)} />
                </label>
              </>
            ) : null}

            <label className="form-field full-span">
              <span>Message</span>
              <textarea
                required
                rows={3}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
              />
            </label>

            {status ? <div className="form-status form-status-error">{status}</div> : null}

            <button className="primary-button full-span" type="submit" disabled={isSending}>
              {isSending ? "Sending..." : "Send Message"}
            </button>
              </form>
            </>
          ) : null}
        </div>
      ) : (
        <button className="live-chat-launcher" type="button" onClick={() => setIsOpen(true)}>
          Live Chat
          {unreadAdminMessageCount > 0 ? (
            <span className="live-chat-badge">{unreadAdminMessageCount}</span>
          ) : null}
        </button>
      )}
    </section>
  );
}
