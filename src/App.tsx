import { Link } from "@tanstack/react-router";
import logo from "./logo.svg";

function App() {
  return (
    <div className="flex flex-col-reverse lg:flex-row gap-4 justify-around my-10 select-none">
      <img src="/chess-board.png" alt="Chessboard" className="aspect-square" />
      <div className="flex flex-col items-center justify-around gap-8 p-24 lg:p-48 bg-neutral rounded-lg">
        <h2 className="font-bold text-3xl">Play Chess</h2>
        <img src="/logo-chess.png" alt="Chess Piece" width={50} />
        <div className="flex flex-col gap-8">
          <Link to="/" className="btn md:btn-lg lg:btn-xl">
            <img src="/blitz.png" alt="Blitz" width={20} />
            Play Online
          </Link>
          <Link
            to="/choose-time"
            className="btn md:btn-lg lg:btn-xl btn-secondary"
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
