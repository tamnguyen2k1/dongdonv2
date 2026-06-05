"use client";

import { useEffect, useRef, useState } from "react";
import "./maintenance.css";
import { getTopScores, saveGameScore } from "../../lib/game-score";

type ParcelType = "normal" | "fragile" | "bulk" | "trash";
type ParcelState = "open" | "taped" | "done";

type Parcel = {
  id: string;
  type: ParcelType;
  state: ParcelState;
  code: string;
  requiredItems: string[];
  packedItems: string[];
  tapeNeed: number;
  labelNeed: number;
  tapeDone: number;
  labelDone: number;
};

const GAME_KEY = "packing_item_match";

const ITEMS = ["🧸", "🎧", "⌚", "🦆", "📱", "🎮", "👟", "🧴", "📚", "🧢"];

const DEFAULT_PARCEL: Parcel = {
  id: "default",
  type: "normal",
  state: "open",
  code: "PK-0000",
  requiredItems: ["🧸", "🎧", "📱"],
  packedItems: [],
  tapeNeed: 1,
  labelNeed: 1,
  tapeDone: 0,
  labelDone: 0,
};
const MAINTENANCE_END = new Date("2026-05-21T23:00:00+07:00");


function pickItems(count: number) {
  return [...ITEMS].sort(() => Math.random() - 0.5).slice(0, count);
}
function makeId() {
  return `${Date.now()}-${crypto.randomUUID()}`;
}

function createParcel(): Parcel {
  const r = Math.random();
  let type: ParcelType = "normal";

  if (r < 0.12) type = "trash";
  else if (r < 0.28) type = "fragile";
  else if (r < 0.44) type = "bulk";

  const count = type === "bulk" ? 5 : type === "fragile" ? 2 : 3;

  return {
    id: makeId(),
    type,
    state: "open",
    code: `PK-${Math.floor(1000 + Math.random() * 9000)}`,
    requiredItems: type === "trash" ? [] : pickItems(count),
    packedItems: [],
    tapeNeed: type === "bulk" ? 3 : 1,
    labelNeed: type === "bulk" ? 2 : 1,
    tapeDone: 0,
    labelDone: 0,
  };
}

function isMatch(required: string[], packed: string[]) {
  if (required.length !== packed.length) return false;
  return [...required].sort().join("|") === [...packed].sort().join("|");
}

function vibrate(ms = 35) {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate(ms);
  }
}

export default function MaintenancePage() {
  const [parcel, setParcel] = useState<Parcel>(DEFAULT_PARCEL);
  const [started, setStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [combo, setCombo] = useState(0);
  const [timer, setTimer] = useState(100);
  const [running, setRunning] = useState(true);
  const [fx, setFx] = useState<"tape" | "label" | "break" | "trash" | null>(null);

  const [playerName, setPlayerName] = useState("");
  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  const tickRef = useRef<NodeJS.Timeout | null>(null);
    const [remainText, setRemainText] = useState("");

    useEffect(() => {
    const timer = setInterval(() => {
        const diff = MAINTENANCE_END.getTime() - Date.now();

        if (diff <= 0) {
        setRemainText("Sắp mở lại hệ thống");
        return;
        }

        const h = Math.floor(diff / 1000 / 60 / 60);
        const m = Math.floor((diff / 1000 / 60) % 60);
        const s = Math.floor((diff / 1000) % 60);

        setRemainText(`${h}h ${m}m ${s}s`);
    }, 1000);

    return () => clearInterval(timer);
    }, []);
 useEffect(() => {
  loadLeaderboard();

  return () => {
    if (tickRef.current) clearInterval(tickRef.current);
  };
}, []);
function handleStart() {
  setStarted(true);
  startGame();
}

  async function loadLeaderboard() {
    const data = await getTopScores(GAME_KEY);
    setLeaderboard(data);
  }

  function startGame() {
    if (tickRef.current) clearInterval(tickRef.current);

    setParcel(createParcel());
    setScore(0);
    setLives(3);
    setCombo(0);
    setTimer(100);
    setRunning(true);
    setFx(null);

    tickRef.current = setInterval(() => {
      setTimer((t) => {
        const next = t - 1.25;

        if (next <= 0) {
          missParcel();
          return 100;
        }

        return next;
      });
    }, 100);
  }

  function nextParcel(baseScore = 0) {
    const multiplier = combo >= 10 ? 3 : combo >= 5 ? 2 : 1;

    setScore((s) => s + baseScore * multiplier);
    setParcel(createParcel());
    setTimer(100);
  }

  function missParcel() {
    setCombo(0);
    setLives((l) => {
      const next = l - 1;

      if (next <= 0) {
        setRunning(false);
        if (tickRef.current) clearInterval(tickRef.current);
        return 0;
      }

      return next;
    });

    setParcel(createParcel());
    setTimer(100);
    setFx("break");
    vibrate(140);

    setTimeout(() => setFx(null), 450);
  }

  function wrongAction() {
    setCombo(0);
    setScore((s) => Math.max(0, s - 50));

    setLives((l) => {
      const next = l - 1;

      if (next <= 0) {
        setRunning(false);
        if (tickRef.current) clearInterval(tickRef.current);
        return 0;
      }

      return next;
    });

    setFx("break");
    vibrate(170);

    setTimeout(() => {
      setFx(null);
      setParcel(createParcel());
      setTimer(100);
    }, 450);
  }

  function packItem(item: string) {
     if (!started || !running) return;
    if (parcel.type === "trash") return wrongAction();
    if (parcel.state !== "open") return wrongAction();

    if (parcel.packedItems.length >= parcel.requiredItems.length + 1) {
      return wrongAction();
    }

    vibrate(20);

    setParcel((p) => ({
      ...p,
      packedItems: [...p.packedItems, item],
    }));
  }

  function undoItem(index: number) {
    if (!running || parcel.state !== "open") return;

    setParcel((p) => ({
      ...p,
      packedItems: p.packedItems.filter((_, i) => i !== index),
    }));
  }

  function handleTape() {
    if (!started || !running) return;   

    if (parcel.type === "trash") return wrongAction();
    if (parcel.state !== "open") return wrongAction();

    if (!isMatch(parcel.requiredItems, parcel.packedItems)) {
      return wrongAction();
    }

    vibrate(30);
    setFx("tape");

    setParcel((p) => {
      const tapeDone = p.tapeDone + 1;

      return {
        ...p,
        tapeDone,
        state: tapeDone >= p.tapeNeed ? "taped" : "open",
      };
    });

    setTimeout(() => setFx(null), 300);
  }

  function handleLabel() {
     if (!started || !running) return;

    if (parcel.type === "trash") return wrongAction();
    if (parcel.state !== "taped") return wrongAction();

    vibrate(35);
    setFx("label");

    const nextLabel = parcel.labelDone + 1;

    if (nextLabel >= parcel.labelNeed) {
      setCombo((c) => c + 1);

      const base =
        parcel.type === "bulk" ? 120 : parcel.type === "fragile" ? 85 : 60;

      setParcel((p) => ({
        ...p,
        labelDone: nextLabel,
        state: "done",
      }));

      setTimeout(() => {
        setFx(null);
        nextParcel(base);
      }, 420);

      return;
    }

    setParcel((p) => ({
      ...p,
      labelDone: nextLabel,
    }));

    setTimeout(() => setFx(null), 260);
  }

  function skipTrash() {
    if (!started || !running) return;

    if (parcel.type !== "trash") return wrongAction();

    vibrate(40);
    setFx("trash");
    setCombo((c) => c + 1);

    setTimeout(() => {
      setFx(null);
      nextParcel(70);
    }, 360);
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const k = e.key.toLowerCase();

      if (k === "a" || k === "1") handleTape();
      if (k === "d" || k === "2") handleLabel();
      if (k === "s" || k === "3") skipTrash();
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  async function submitScore() {
    await saveGameScore(playerName || "ẨN DANH", score, GAME_KEY);
    await loadLeaderboard();
  }

  const comboText = combo >= 10 ? "x3" : combo >= 5 ? "x2" : "x1";

  return (
    <main className={`maintenance ${fx === "break" ? "danger-flash" : ""}`}>
      <section className="maintenance-card packing-card">
        <div className="head">
          <div>
            <h1>PACKING SIMULATOR</h1>
            <p>Nhìn nhãn, bỏ đúng hàng vào thùng, rồi dán keo + dán nhãn 😄</p>
          </div>

          <div className="badge">MAINTENANCE</div>
        </div>

        <div className="stats">
          <span>Điểm: <b>{score}</b></span>
          <span>Mạng: <b>{"❤️".repeat(lives)}</b></span>
          <span>Combo: <b>{combo} / {comboText}</b></span>
          <span>Mã: <b>{parcel.code}</b></span>
        </div>

        <div className="mission-bar">
            <div className="maintenance-notice">
                <div>
                    <b>🔧 HỆ THỐNG ĐANG BẢO TRÌ</b>
                    <span>
                         Đang cập nhật dashboard. Bạn có thể chơi game trong lúc chờ.
                    </span>
                </div>

                <strong>{remainText}</strong>
             </div>
          <div>
            <b>PHIẾU ĐÓNG GÓI</b>
            <span>
              {parcel.type === "trash"
                ? "Đơn lỗi/rác — không bỏ hàng, bấm Bỏ rác"
                : "Bỏ đúng đủ món trong nhãn vào thùng"}
            </span>
          </div>

          <strong>
            {parcel.type === "normal" && "ĐƠN THƯỜNG"}
            {parcel.type === "fragile" && "⚠️ DỄ VỠ"}
            {parcel.type === "bulk" && "📦 BULK"}
            {parcel.type === "trash" && "🪱 RÁC/LỖI"}
          </strong>
        </div>
            <div className="guide-panel">
    <div className="guide-title">📘 Hướng Dẫn Chơi</div>

    <div className="guide-grid">
        <div>
        <b>📋 Nhìn phiếu</b>
        <span>Kiểm tra các món cần bỏ vào thùng.</span>
        </div>

        <div>
        <b>🛒 Lấy hàng</b>
        <span>Bấm món trên kệ để cho vào thùng.</span>
        </div>

        <div>
        <b>🧻 Dán keo</b>
        <span>Chỉ dán khi hàng trong thùng khớp phiếu.</span>
        </div>

        <div>
        <b>🏷️ Dán nhãn</b>
        <span>Sau khi dán keo xong mới được dán nhãn.</span>
        </div>

        <div>
        <b>🗑️ Đơn lỗi</b>
        <span>Không bỏ hàng, bấm Bỏ Rác.</span>
        </div>

        <div>
        <b>⚠️ Sai</b>
        <span>Thiếu/dư/sai món sẽ mất mạng.</span>
        </div>
    </div>
            </div>

        <div className="game-layout">
          <div className="packing-stage">
            <div className="time-bar">
              <i style={{ width: `${timer}%` }} />
            </div>

            <div className="order-label">
              <div className="label-head">
                <b>{parcel.code}</b>
                <span>{parcel.requiredItems.length} món</span>
              </div>

              <div className="required-list">
                {parcel.type === "trash" ? (
                  <span className="trash-note">🗑️ BỎ RÁC</span>
                ) : (
                  parcel.requiredItems.map((x, i) => (
                    <span key={i}>{x}</span>
                  ))
                )}
              </div>
            </div>

            <div className={`parcel-box ${parcel.type} ${parcel.state} ${fx || ""}`}>
              <div className="box-lid left" />
              <div className="box-lid right" />

              <div className="box-body">
                {parcel.type === "trash" ? (
                  <div className="trash-smoke">
                    <span>💨</span>
                    <b>KHÔNG ĐÓNG</b>
                  </div>
                ) : (
                  <div className="packed-items">
                    {parcel.packedItems.length === 0 ? (
                      <em>Chưa có hàng</em>
                    ) : (
                      parcel.packedItems.map((x, i) => (
                        <button key={i} onClick={() => undoItem(i)}>
                          {x}
                        </button>
                      ))
                    )}
                  </div>
                )}

                {parcel.state === "taped" && (
                  <div className="tape-line">DUCT TAPE</div>
                )}

                {parcel.state === "done" && (
                  <div className="barcode">
                    <span>▌▌ ▌ ▌▌▌ ▌▌</span>
                    <b>{parcel.code}</b>
                  </div>
                )}
              </div>

              {fx === "tape" && <div className="tape-swipe" />}
              {fx === "label" && <div className="laser-beam" />}
              {fx === "break" && <div className="break-fx">💥</div>}
              {fx === "trash" && <div className="trash-fx">🗑️</div>}
            </div>

            <div className="shelf">
              {ITEMS.map((item) => (
                <button key={item} onClick={() => packItem(item)}>
                  {item}
                </button>
              ))}
            </div>

            <div className="progress-info">
              <span>Hàng: <b>{parcel.packedItems.length}/{parcel.requiredItems.length}</b></span>
              <span>Keo: <b>{parcel.tapeDone}/{parcel.tapeNeed}</b></span>
              <span>Nhãn: <b>{parcel.labelDone}/{parcel.labelNeed}</b></span>
            </div>

            <div className="packing-buttons">
              <button className="btn-pack tape" onClick={handleTape}>
                <small>1 / A</small>
                <span>🧻 Dán Keo</span>
              </button>

              <button className="btn-pack label" onClick={handleLabel}>
                <small>2 / D</small>
                <span>🏷️ Dán Nhãn</span>
              </button>

              <button className="btn-pack trash" onClick={skipTrash}>
                <small>3 / S</small>
                <span>🗑️ Bỏ Rác</span>
              </button>
            </div>
            {!started && (
                <div className="start-overlay">
                    <div className="start-card">
                    <h2>📦 Packing Simulator</h2>

                    <p>
                        Nhìn phiếu đóng gói, chọn đúng món cho vào thùng,
                        sau đó dán keo và dán nhãn.
                    </p>

                    <div className="how-to">
                        <div><b>1</b> Chọn đúng món trên kệ</div>
                        <div><b>2</b> Bấm Dán Keo</div>
                        <div><b>3</b> Bấm Dán Nhãn</div>
                        <div><b>!</b> Đơn rác thì bấm Bỏ Rác</div>
                    </div>

                    <button onClick={handleStart}>
                        BẮT ĐẦU GAME
                    </button>
                    </div>
                </div>
                )}

            {!running && (
              <div className="game-over">
                <h2>HẾT CA ĐÓNG GÓI!</h2>
                <p>Bạn đạt {score} điểm.</p>

                <input
                  className="name-input"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Tên của bạn"
                />

                <div className="go-actions">
                  <button onClick={submitScore}>Lưu Điểm</button>
                  <button onClick={startGame}>Chơi Lại</button>
                </div>
              </div>
            )}
          </div>

          <div className="leaderboard">
            <div className="lb-title">🏆 PACKING TOP</div>

            {leaderboard.length === 0 ? (
              <p className="lb-empty">Chưa có điểm</p>
            ) : (
              leaderboard.map((x, i) => (
                <div key={x.id} className="lb-item">
                  <span>#{i + 1} {x.player_name}</span>
                  <b>{x.score}</b>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="hint">
          Click món trên kệ để bỏ vào thùng. Click món trong thùng để lấy ra.
        </div>
      </section>
    </main>
  );
}