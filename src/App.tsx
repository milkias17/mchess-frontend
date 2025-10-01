import { Link } from "@tanstack/react-router";

function App() {
  return (
    <div className="flex flex-col-reverse lg:flex-row gap-4 lg:justify-around my-10 mx-4 select-none">
      <img src="/chess-board.png" alt="Chessboard" className="aspect-square" />
      <div className="flex flex-col h-[500px] lg:h-auto items-center justify-around gap-8 p-8 lg:p-12 xl:p-36 bg-neutral rounded-lg">
        <h2 className="font-bold text-3xl">Play Chess</h2>
        <img src="/logo-chess.png" alt="Chess Piece" width={50} />
        <div className="flex flex-col gap-8">
          <Link
            to="/choose-time"
            search={{
              gameType: "online",
            }}
            className="btn lg:btn-lg xl:btn-xl"
          >
            <img src="/blitz.png" alt="Blitz" width={20} />
            Play Online
          </Link>
          <Link
            to="/choose-time"
            search={{
              gameType: "offline",
            }}
            className="btn btn-sm md:btn-md lg:btn-lg xl:btn-xl btn-secondary"
          >
            <img src="/home.png" alt="Home" width={20} />
            Play Offline
          </Link>
        </div>
      </div>
    </div>
  );
}

export default App;
