import { GL } from "@/components/gl";
import { Header } from "@/components/Header";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";

type Section = "roster" | "matches" | "news" | "achievements" | "about" | null;

interface Player {
  id: number;
  nick: string;
  role: string;
  faceitLvl: number;
  hltvRating: number;
  avatar: string;
  nominations: string[];
  kills: number;
  deaths: number;
  assists: number;
  matchesPlayed: number;
}

interface Match {
  id: number;
  opponent: string;
  score: string;
  result: "win" | "loss" | "draw";
  date: string;
  map?: string;
}

interface NewsItem {
  id: number;
  title: string;
  body: string;
  date: string;
}

interface Achievement {
  id: number;
  title: string;
  place: string;
  date: string;
}

const AVATAR = "https://cdn.poehali.dev/projects/9dc15c8b-2775-4ce0-bc53-7a3627cf4cf2/bucket/fa27ae37-caa0-4fb7-90a9-b305c0169b9b.jpg";

const defaultPlayers: Player[] = [
  {
    id: 1,
    nick: "xinto",
    role: "Star Player",
    faceitLvl: 10,
    hltvRating: 1.0,
    avatar: AVATAR,
    nominations: ["MVP", "Best Entry Fragger"],
    kills: 0,
    deaths: 0,
    assists: 0,
    matchesPlayed: 0,
  },
  {
    id: 2,
    nick: "fla1",
    role: "AWP",
    faceitLvl: 7,
    hltvRating: 1.0,
    avatar: AVATAR,
    nominations: ["Best AWPer"],
    kills: 0,
    deaths: 0,
    assists: 0,
    matchesPlayed: 0,
  },
  {
    id: 3,
    nick: "Ba7ka",
    role: "IGL",
    faceitLvl: 5,
    hltvRating: 1.0,
    avatar: AVATAR,
    nominations: ["Best IGL", "MVP"],
    kills: 0,
    deaths: 0,
    assists: 0,
    matchesPlayed: 0,
  },
  {
    id: 4,
    nick: "mef0mu",
    role: "Rifler",
    faceitLvl: 5,
    hltvRating: 1.0,
    avatar: AVATAR,
    nominations: ["EVP", "Most Improved"],
    kills: 0,
    deaths: 0,
    assists: 0,
    matchesPlayed: 0,
  },
  {
    id: 5,
    nick: "grommer",
    role: "Support",
    faceitLvl: 7,
    hltvRating: 1.0,
    avatar: AVATAR,
    nominations: ["Best Support", "Team Player"],
    kills: 0,
    deaths: 0,
    assists: 0,
    matchesPlayed: 0,
  },
];

const defaultMatches: Match[] = [
  {
    id: 1,
    opponent: "No Name",
    score: "13:7",
    result: "win",
    date: "2025-02-20",
    map: "Mirage",
  },
  {
    id: 2,
    opponent: "Sigma Junior",
    score: "2:0",
    result: "win",
    date: "2025-02-25",
    map: "de_inferno / de_dust2",
  },
];

const defaultNews: NewsItem[] = [
  {
    id: 1,
    title: "Состав сформирован",
    body: "Рады объявить, что состав Five Cutlass полностью сформирован. К нам пришли сильные игроки, готовые бороться и доказывать своё мастерство на каждом матче.",
    date: "2025-02-01",
  },
  {
    id: 2,
    title: "Первый прак — победа!",
    body: "Сыграли первый прак — самое главное, победили его. Каждый игрок сыграл отлично, было много коммуникации и командной игры. Следите за нами!",
    date: "2025-02-15",
  },
];

const defaultAchievements: Achievement[] = [
  { id: 1, title: "DuoCup SaemArena", place: "🥈 2 место", date: "2025-02" },
  { id: 2, title: "MintexTournament", place: "🥇 1 место", date: "2025-03" },
];

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as T;
  } catch (e) {
    console.warn("loadFromStorage error", e);
  }
  return fallback;
}

function saveToStorage<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

function calcHLTV(player: Player): string {
  if (player.matchesPlayed === 0 || player.deaths === 0) return "1.00";
  const kpr = player.kills / player.matchesPlayed;
  const dpr = player.deaths / player.matchesPlayed;
  const apr = player.assists / player.matchesPlayed;
  const rating = (kpr * 0.73 + (1 - dpr * 0.45) + apr * 0.14) / 1.0;
  return Math.max(0.01, Math.min(3.0, rating)).toFixed(2);
}

function getFaceitColor(lvl: number) {
  if (lvl <= 3) return "text-red-400";
  if (lvl <= 5) return "text-orange-400";
  if (lvl <= 7) return "text-yellow-400";
  if (lvl <= 9) return "text-green-400";
  return "text-[#ff6500]";
}

const ADMIN_PASSWORD = "1111322";

export default function Index() {
  const [hovering, setHovering] = useState(false);
  const [section, setSection] = useState<Section>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [players, setPlayers] = useState<Player[]>(() => loadFromStorage("fc_players", defaultPlayers));
  const [matches, setMatches] = useState<Match[]>(() => loadFromStorage("fc_matches", defaultMatches));
  const [news, setNews] = useState<NewsItem[]>(() => loadFromStorage("fc_news", defaultNews));
  const [achievements, setAchievements] = useState<Achievement[]>(() => loadFromStorage("fc_achievements", defaultAchievements));
  const [aboutText, setAboutText] = useState<string>(() => loadFromStorage("fc_about", ""));

  useEffect(() => { saveToStorage("fc_players", players); }, [players]);
  useEffect(() => { saveToStorage("fc_matches", matches); }, [matches]);
  useEffect(() => { saveToStorage("fc_news", news); }, [news]);
  useEffect(() => { saveToStorage("fc_achievements", achievements); }, [achievements]);
  useEffect(() => { saveToStorage("fc_about", aboutText); }, [aboutText]);

  // Admin
  const [adminOpen, setAdminOpen] = useState(false);
  const [adminInput, setAdminInput] = useState("");
  const [adminAuth, setAdminAuth] = useState(false);
  const [adminError, setAdminError] = useState("");
  const [adminTab, setAdminTab] = useState<"matches" | "news" | "achievements" | "players" | "about">("matches");

  // Match form
  const [newMatch, setNewMatch] = useState({ opponent: "", score: "", result: "win" as Match["result"], date: "", map: "" });

  // News form
  const [newNews, setNewNews] = useState({ title: "", body: "", date: "" });

  // Achievement form
  const [newAch, setNewAch] = useState({ title: "", place: "", date: "" });

  // Player edit
  const [editPlayer, setEditPlayer] = useState<Player | null>(null);

  function handleAdminLogin() {
    if (adminInput === ADMIN_PASSWORD) {
      setAdminAuth(true);
      setAdminError("");
    } else {
      setAdminError("Неверный пароль");
    }
  }

  function addMatch() {
    if (!newMatch.opponent || !newMatch.score) return;
    const m: Match = { ...newMatch, id: Date.now() };
    setMatches((prev) => [m, ...prev]);
    setNewMatch({ opponent: "", score: "", result: "win", date: "", map: "" });
  }

  function deleteMatch(id: number) {
    setMatches((prev) => prev.filter((m) => m.id !== id));
  }

  function addNews() {
    if (!newNews.title || !newNews.body) return;
    const n: NewsItem = { ...newNews, id: Date.now(), date: newNews.date || new Date().toISOString().slice(0, 10) };
    setNews((prev) => [n, ...prev]);
    setNewNews({ title: "", body: "", date: "" });
  }

  function deleteNews(id: number) {
    setNews((prev) => prev.filter((n) => n.id !== id));
  }

  function addAchievement() {
    if (!newAch.title || !newAch.place) return;
    const a: Achievement = { ...newAch, id: Date.now() };
    setAchievements((prev) => [a, ...prev]);
    setNewAch({ title: "", place: "", date: "" });
  }

  function deleteAchievement(id: number) {
    setAchievements((prev) => prev.filter((a) => a.id !== id));
  }

  function savePlayerEdit() {
    if (!editPlayer) return;
    setPlayers((prev) => prev.map((p) => (p.id === editPlayer.id ? editPlayer : p)));
    setEditPlayer(null);
  }

  const navItems = [
    { label: "Состав", key: "roster" },
    { label: "Матчи", key: "matches" },
    { label: "Новости", key: "news" },
    { label: "Достижения", key: "achievements" },
    { label: "О клубе", key: "about" },
    { label: "Скоро", key: null, disabled: true },
  ];

  return (
    <div className="min-h-svh relative z-10">
      <GL hovering={hovering} />

      {/* Header */}
      <div className="fixed z-50 pt-6 md:pt-10 top-0 left-0 w-full">
        <header className="flex items-center justify-between container">
          <button onClick={() => setSection(null)} className="flex items-center gap-2 group">
            <span className="text-xl font-bold tracking-widest text-white group-hover:text-primary transition-colors uppercase font-mono">
              ⚔ FIVE CUTLASS
            </span>
          </button>

          <nav className="flex max-lg:hidden absolute left-1/2 -translate-x-1/2 items-center justify-center gap-x-6">
            {navItems.map((item) => (
              <button
                key={item.label}
                disabled={item.disabled}
                onClick={() => !item.disabled && setSection(item.key as Section)}
                className={`uppercase font-mono text-sm transition-colors duration-150 ease-out px-1 py-0.5 border-b-2 ${
                  item.disabled
                    ? "text-foreground/30 cursor-not-allowed border-transparent"
                    : section === item.key
                    ? "text-primary border-primary"
                    : "text-foreground/60 hover:text-foreground border-transparent hover:border-foreground/30"
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <button
            onClick={() => setAdminOpen(true)}
            className="uppercase max-lg:hidden transition-colors ease-out duration-150 font-mono text-xs text-foreground/40 hover:text-primary border border-foreground/20 hover:border-primary px-3 py-1.5"
          >
            Admin
          </button>

          {/* Mobile nav */}
          <div className="lg:hidden flex gap-2 flex-wrap justify-end max-w-[200px]">
            {navItems.slice(0, 4).map((item) => (
              <button
                key={item.label}
                onClick={() => !item.disabled && setSection(item.key as Section)}
                className={`uppercase font-mono text-[10px] transition-colors px-2 py-1 border ${
                  section === item.key
                    ? "text-primary border-primary"
                    : "text-foreground/60 border-foreground/20"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </header>
      </div>

      {/* Hero */}
      {!section && (
        <div className="flex flex-col h-svh justify-end pb-16 text-center relative">
          <div className="mb-3">
            <span className="font-mono text-xs uppercase tracking-widest text-primary/80 border border-primary/30 px-3 py-1">
              CS2 ESPORTS TEAM
            </span>
          </div>
          <h1 className="text-5xl sm:text-6xl md:text-8xl font-sentient text-white">
            Five <i className="font-light text-primary">Cutlass</i>
          </h1>
          <p className="font-mono text-sm sm:text-base text-foreground/60 mt-6 max-w-[440px] mx-auto">
            Начинающая команда, пробивающаяся в HLTV & ESEA League
          </p>
          <div className="flex gap-4 justify-center mt-10 flex-wrap">
            <Button
              onClick={() => setSection("roster")}
              onMouseEnter={() => setHovering(true)}
              onMouseLeave={() => setHovering(false)}
            >
              [Смотреть состав]
            </Button>
            <Button
              variant="outline"
              onClick={() => setSection("matches")}
              onMouseEnter={() => setHovering(true)}
              onMouseLeave={() => setHovering(false)}
              className="border-foreground/30 text-foreground/70 hover:text-foreground hover:border-foreground"
            >
              [Матчи]
            </Button>
          </div>
        </div>
      )}

      {/* Sections */}
      {section && (
        <div className="pt-32 pb-16 container min-h-svh">
          <button
            onClick={() => setSection(null)}
            className="font-mono text-xs text-foreground/40 hover:text-foreground mb-8 flex items-center gap-2 uppercase"
          >
            <Icon name="ArrowLeft" size={14} /> Назад
          </button>

          {/* ROSTER */}
          {section === "roster" && (
            <div>
              <h2 className="text-3xl font-sentient mb-2">Состав</h2>
              <p className="font-mono text-xs text-foreground/40 mb-10 uppercase tracking-widest">Five Cutlass — CS2</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {players.map((player) => (
                  <button
                    key={player.id}
                    onClick={() => setSelectedPlayer(player)}
                    className="text-left border border-foreground/20 hover:border-primary/60 bg-black/40 backdrop-blur-sm p-6 transition-all duration-200 hover:bg-black/60 group"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <img
                        src={player.avatar}
                        alt={player.nick}
                        className="w-16 h-16 object-cover border border-foreground/20 group-hover:border-primary/50 transition-colors"
                      />
                      <div>
                        <div className="font-bold text-lg text-white uppercase tracking-wide">{player.nick}</div>
                        <div className="font-mono text-xs text-primary uppercase">{player.role}</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between font-mono text-xs">
                      <div className="flex items-center gap-1">
                        <span className="text-foreground/40">FACEIT</span>
                        <span className={`font-bold ${getFaceitColor(player.faceitLvl)}`}>LVL {player.faceitLvl}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-foreground/40">RATING</span>
                        <span className="text-white font-bold">{calcHLTV(player)}</span>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1">
                      {player.nominations.map((nom) => (
                        <span key={nom} className="text-[10px] font-mono uppercase border border-primary/30 text-primary/70 px-2 py-0.5">
                          {nom}
                        </span>
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* MATCHES */}
          {section === "matches" && (
            <div>
              <h2 className="text-3xl font-sentient mb-2">Матчи</h2>
              <p className="font-mono text-xs text-foreground/40 mb-10 uppercase tracking-widest">Результаты Five Cutlass</p>
              {matches.length === 0 ? (
                <p className="font-mono text-foreground/40 text-sm">Матчей пока нет</p>
              ) : (
                <div className="flex flex-col gap-4">
                  {matches.map((m) => (
                    <div
                      key={m.id}
                      className={`border-l-4 ${m.result === "win" ? "border-green-500" : m.result === "loss" ? "border-red-500" : "border-yellow-500"} bg-black/40 backdrop-blur-sm p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3`}
                    >
                      <div>
                        <div className="font-bold text-white text-lg">
                          Five Cutlass <span className="text-foreground/40">vs</span> {m.opponent}
                        </div>
                        {m.map && <div className="font-mono text-xs text-foreground/40 mt-0.5">{m.map}</div>}
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-mono text-2xl font-bold text-white">{m.score}</span>
                        <span
                          className={`font-mono text-xs uppercase px-3 py-1 border ${
                            m.result === "win"
                              ? "border-green-500/40 text-green-400"
                              : m.result === "loss"
                              ? "border-red-500/40 text-red-400"
                              : "border-yellow-500/40 text-yellow-400"
                          }`}
                        >
                          {m.result === "win" ? "Победа" : m.result === "loss" ? "Поражение" : "Ничья"}
                        </span>
                        {m.date && <span className="font-mono text-xs text-foreground/30">{m.date}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* NEWS */}
          {section === "news" && (
            <div>
              <h2 className="text-3xl font-sentient mb-2">Новости</h2>
              <p className="font-mono text-xs text-foreground/40 mb-10 uppercase tracking-widest">Последние события клана</p>
              <div className="flex flex-col gap-6">
                {news.map((n) => (
                  <div key={n.id} className="border border-foreground/20 bg-black/40 backdrop-blur-sm p-6">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <h3 className="font-sentient text-xl text-white">{n.title}</h3>
                      {n.date && <span className="font-mono text-xs text-foreground/30 shrink-0">{n.date}</span>}
                    </div>
                    <p className="font-mono text-sm text-foreground/60 leading-relaxed">{n.body}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ACHIEVEMENTS */}
          {section === "achievements" && (
            <div>
              <h2 className="text-3xl font-sentient mb-2">Достижения</h2>
              <p className="font-mono text-xs text-foreground/40 mb-10 uppercase tracking-widest">Турнирные результаты</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {achievements.map((a) => (
                  <div key={a.id} className="border border-primary/30 bg-black/40 backdrop-blur-sm p-6 hover:border-primary/60 transition-colors">
                    <div className="font-mono text-3xl mb-3">{a.place.split(" ")[0]}</div>
                    <h3 className="font-sentient text-xl text-white mb-1">{a.title}</h3>
                    <div className="font-mono text-sm text-primary">{a.place}</div>
                    {a.date && <div className="font-mono text-xs text-foreground/30 mt-2">{a.date}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ABOUT */}
          {section === "about" && (
            <div className="max-w-2xl">
              <h2 className="text-3xl font-sentient mb-2">О клубе</h2>
              <p className="font-mono text-xs text-foreground/40 mb-10 uppercase tracking-widest">Five Cutlass Esports</p>
              <div className="border border-foreground/20 bg-black/40 backdrop-blur-sm p-8 mb-8">
                <p className="font-mono text-sm text-foreground/70 leading-relaxed whitespace-pre-wrap">
                  {aboutText || "Мы — начинающая команда Five Cutlass, будем пробиваться в HLTV and ESEA LEAGUE. Сейчас мы тренируемся, чтобы стать сильнее."}
                </p>
              </div>
              <h3 className="font-sentient text-lg mb-4 text-white">Результаты матчей</h3>
              <div className="flex flex-col gap-3">
                {matches.map((m) => (
                  <div key={m.id} className={`border-l-4 ${m.result === "win" ? "border-green-500" : m.result === "loss" ? "border-red-500" : "border-yellow-500"} bg-black/40 p-4 font-mono text-sm`}>
                    <span className="text-white font-bold">Five Cutlass vs {m.opponent}</span>
                    <span className={`ml-3 ${m.result === "win" ? "text-green-400" : m.result === "loss" ? "text-red-400" : "text-yellow-400"}`}>
                      {m.score} — {m.result === "win" ? "Победа наша" : m.result === "loss" ? "Поражение" : "Ничья"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Player Modal */}
      <Dialog open={!!selectedPlayer} onOpenChange={() => setSelectedPlayer(null)}>
        <DialogContent className="bg-black border border-foreground/20 max-w-md">
          {selectedPlayer && (
            <>
              <DialogHeader>
                <DialogTitle className="font-sentient text-2xl text-white flex items-center gap-3">
                  <img src={selectedPlayer.avatar} alt={selectedPlayer.nick} className="w-12 h-12 object-cover border border-foreground/30" />
                  {selectedPlayer.nick}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="font-mono text-xs text-primary uppercase">{selectedPlayer.role}</div>
                <div className="grid grid-cols-2 gap-4 font-mono text-sm">
                  <div className="bg-foreground/5 border border-foreground/10 p-3">
                    <div className="text-foreground/40 text-xs mb-1">FACEIT LEVEL</div>
                    <div className={`font-bold text-lg ${getFaceitColor(selectedPlayer.faceitLvl)}`}>
                      LVL {selectedPlayer.faceitLvl}
                    </div>
                  </div>
                  <div className="bg-foreground/5 border border-foreground/10 p-3">
                    <div className="text-foreground/40 text-xs mb-1">HLTV RATING 3.0</div>
                    <div className="font-bold text-lg text-white">{calcHLTV(selectedPlayer)}</div>
                  </div>
                </div>
                {selectedPlayer.matchesPlayed > 0 && (
                  <div className="grid grid-cols-3 gap-2 font-mono text-xs">
                    <div className="bg-foreground/5 border border-foreground/10 p-2 text-center">
                      <div className="text-foreground/40">K</div>
                      <div className="text-white font-bold">{selectedPlayer.kills}</div>
                    </div>
                    <div className="bg-foreground/5 border border-foreground/10 p-2 text-center">
                      <div className="text-foreground/40">D</div>
                      <div className="text-white font-bold">{selectedPlayer.deaths}</div>
                    </div>
                    <div className="bg-foreground/5 border border-foreground/10 p-2 text-center">
                      <div className="text-foreground/40">A</div>
                      <div className="text-white font-bold">{selectedPlayer.assists}</div>
                    </div>
                  </div>
                )}
                <div>
                  <div className="font-mono text-xs text-foreground/40 uppercase mb-2">Номинации</div>
                  <div className="flex flex-wrap gap-2">
                    {selectedPlayer.nominations.map((nom) => (
                      <Badge key={nom} variant="outline" className="font-mono text-xs border-primary/40 text-primary">
                        {nom}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Admin Modal */}
      <Dialog open={adminOpen} onOpenChange={(o) => { setAdminOpen(o); if (!o) { setAdminAuth(false); setAdminInput(""); setAdminError(""); }}}>
        <DialogContent className="bg-black border border-foreground/20 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-mono uppercase text-sm text-foreground/60">Админ-панель</DialogTitle>
          </DialogHeader>

          {!adminAuth ? (
            <div className="flex flex-col gap-4">
              <p className="font-mono text-xs text-foreground/40">Введите пароль для доступа</p>
              <input
                type="password"
                value={adminInput}
                onChange={(e) => setAdminInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdminLogin()}
                className="bg-foreground/5 border border-foreground/20 font-mono text-sm text-white px-3 py-2 focus:outline-none focus:border-primary"
                placeholder="Пароль"
              />
              {adminError && <p className="font-mono text-xs text-red-400">{adminError}</p>}
              <Button onClick={handleAdminLogin}>Войти</Button>
            </div>
          ) : (
            <div>
              {/* Tabs */}
              <div className="flex gap-2 mb-6 flex-wrap">
                {(["matches", "news", "achievements", "players", "about"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setAdminTab(t)}
                    className={`font-mono text-xs uppercase px-3 py-1.5 border transition-colors ${
                      adminTab === t ? "border-primary text-primary" : "border-foreground/20 text-foreground/40 hover:border-foreground/40"
                    }`}
                  >
                    {t === "matches" ? "Матчи" : t === "news" ? "Новости" : t === "achievements" ? "Достижения" : t === "players" ? "Игроки" : "О клубе"}
                  </button>
                ))}
              </div>

              {/* Matches */}
              {adminTab === "matches" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-2">
                    <input className="admin-input" placeholder="Соперник" value={newMatch.opponent} onChange={(e) => setNewMatch({ ...newMatch, opponent: e.target.value })} />
                    <input className="admin-input" placeholder="Счёт (13:7)" value={newMatch.score} onChange={(e) => setNewMatch({ ...newMatch, score: e.target.value })} />
                    <input className="admin-input" placeholder="Карта" value={newMatch.map} onChange={(e) => setNewMatch({ ...newMatch, map: e.target.value })} />
                    <input className="admin-input" type="date" value={newMatch.date} onChange={(e) => setNewMatch({ ...newMatch, date: e.target.value })} />
                    <select className="admin-input" value={newMatch.result} onChange={(e) => setNewMatch({ ...newMatch, result: e.target.value as Match["result"] })}>
                      <option value="win">Победа</option>
                      <option value="loss">Поражение</option>
                      <option value="draw">Ничья</option>
                    </select>
                    <Button onClick={addMatch} size="sm">Добавить матч</Button>
                  </div>
                  <div className="space-y-2 mt-4">
                    {matches.map((m) => (
                      <div key={m.id} className="flex items-center justify-between border border-foreground/10 p-3 font-mono text-xs">
                        <span className="text-foreground/60">vs {m.opponent} — {m.score} ({m.result})</span>
                        <button onClick={() => deleteMatch(m.id)} className="text-red-400 hover:text-red-300 uppercase">✕</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* News */}
              {adminTab === "news" && (
                <div className="space-y-4">
                  <input className="admin-input" placeholder="Заголовок" value={newNews.title} onChange={(e) => setNewNews({ ...newNews, title: e.target.value })} />
                  <textarea className="admin-input min-h-[80px] resize-none" placeholder="Текст новости" value={newNews.body} onChange={(e) => setNewNews({ ...newNews, body: e.target.value })} />
                  <input className="admin-input" type="date" value={newNews.date} onChange={(e) => setNewNews({ ...newNews, date: e.target.value })} />
                  <Button onClick={addNews} size="sm">Добавить новость</Button>
                  <div className="space-y-2">
                    {news.map((n) => (
                      <div key={n.id} className="flex items-center justify-between border border-foreground/10 p-3 font-mono text-xs">
                        <span className="text-foreground/60 truncate max-w-[80%]">{n.title}</span>
                        <button onClick={() => deleteNews(n.id)} className="text-red-400 hover:text-red-300 uppercase">✕</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Achievements */}
              {adminTab === "achievements" && (
                <div className="space-y-4">
                  <input className="admin-input" placeholder="Турнир" value={newAch.title} onChange={(e) => setNewAch({ ...newAch, title: e.target.value })} />
                  <input className="admin-input" placeholder="Место (🥇 1 место)" value={newAch.place} onChange={(e) => setNewAch({ ...newAch, place: e.target.value })} />
                  <input className="admin-input" placeholder="Дата (2025-03)" value={newAch.date} onChange={(e) => setNewAch({ ...newAch, date: e.target.value })} />
                  <Button onClick={addAchievement} size="sm">Добавить достижение</Button>
                  <div className="space-y-2">
                    {achievements.map((a) => (
                      <div key={a.id} className="flex items-center justify-between border border-foreground/10 p-3 font-mono text-xs">
                        <span className="text-foreground/60">{a.title} — {a.place}</span>
                        <button onClick={() => deleteAchievement(a.id)} className="text-red-400 hover:text-red-300 uppercase">✕</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* About */}
              {adminTab === "about" && (
                <div className="space-y-4">
                  <p className="font-mono text-xs text-foreground/40">Текст раздела «О клубе»</p>
                  <textarea
                    className="admin-input min-h-[140px] resize-none"
                    placeholder="Напишите о вашем клубе..."
                    value={aboutText}
                    onChange={(e) => setAboutText(e.target.value)}
                  />
                  <p className="font-mono text-[10px] text-green-400/60">Изменения сохраняются автоматически</p>
                </div>
              )}

              {/* Players */}
              {adminTab === "players" && (
                <div className="space-y-4">
                  {editPlayer ? (
                    <div className="space-y-3 border border-primary/20 p-4">
                      <div className="font-mono text-xs text-primary uppercase mb-2">Редактирую: {editPlayer.nick}</div>
                      <input className="admin-input" placeholder="Аватар URL" value={editPlayer.avatar} onChange={(e) => setEditPlayer({ ...editPlayer, avatar: e.target.value })} />
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="font-mono text-xs text-foreground/40 block mb-1">Убийства</label>
                          <input className="admin-input" type="number" value={editPlayer.kills} onChange={(e) => setEditPlayer({ ...editPlayer, kills: +e.target.value })} />
                        </div>
                        <div>
                          <label className="font-mono text-xs text-foreground/40 block mb-1">Смерти</label>
                          <input className="admin-input" type="number" value={editPlayer.deaths} onChange={(e) => setEditPlayer({ ...editPlayer, deaths: +e.target.value })} />
                        </div>
                        <div>
                          <label className="font-mono text-xs text-foreground/40 block mb-1">Ассисты</label>
                          <input className="admin-input" type="number" value={editPlayer.assists} onChange={(e) => setEditPlayer({ ...editPlayer, assists: +e.target.value })} />
                        </div>
                      </div>
                      <div>
                        <label className="font-mono text-xs text-foreground/40 block mb-1">Матчей сыграно</label>
                        <input className="admin-input" type="number" value={editPlayer.matchesPlayed} onChange={(e) => setEditPlayer({ ...editPlayer, matchesPlayed: +e.target.value })} />
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={savePlayerEdit} size="sm">Сохранить</Button>
                        <Button onClick={() => setEditPlayer(null)} variant="outline" size="sm">Отмена</Button>
                      </div>
                      <div className="font-mono text-xs text-foreground/40">
                        Предварительный HLTV: <span className="text-primary font-bold">{calcHLTV(editPlayer)}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {players.map((p) => (
                        <div key={p.id} className="flex items-center justify-between border border-foreground/10 p-3">
                          <div className="flex items-center gap-3">
                            <img src={p.avatar} alt={p.nick} className="w-8 h-8 object-cover" />
                            <div>
                              <div className="font-mono text-xs text-white font-bold">{p.nick}</div>
                              <div className="font-mono text-[10px] text-foreground/40">{p.role} | Rating: {calcHLTV(p)}</div>
                            </div>
                          </div>
                          <button onClick={() => setEditPlayer(p)} className="font-mono text-xs text-primary hover:text-primary/80 uppercase border border-primary/30 px-2 py-1">
                            Изменить
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}